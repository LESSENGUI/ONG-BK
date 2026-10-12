import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/api-auth";
import { getCurrentUser } from "@/lib/auth";
import { meetingSchema } from "@/lib/institution-validation";
import { db } from "@/lib/db";
import { canReadDocument } from "@/lib/private-documents";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const permissionForBody = {
  EXECUTIVE_BOARD: {
    read: "BE_MEETINGS_READ",
    create: "BE_MEETINGS_CREATE",
    update: "BE_MEETINGS_UPDATE",
  },
  CONTROL_COMMISSION: {
    read: "CCE_MEETINGS_READ",
    create: "CCE_MEETINGS_CREATE",
    update: "CCE_MEETINGS_UPDATE",
  },
} as const;

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }
  const requestedBody = new URL(request.url).searchParams.get("body");
  const bodies = ["EXECUTIVE_BOARD", "CONTROL_COMMISSION"] as const;
  const visibleBodies = bodies.filter((body) =>
    user.permissions.includes(permissionForBody[body].read),
  );
  if (requestedBody && (requestedBody === "EXECUTIVE_BOARD" || requestedBody === "CONTROL_COMMISSION")) {
    if (!visibleBodies.includes(requestedBody)) {
      return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
    }
  }
  const bodyCode = requestedBody === "EXECUTIVE_BOARD" || requestedBody === "CONTROL_COMMISSION"
    ? requestedBody
    : undefined;
  const items = await db.meeting.findMany({
    where: {
      bodyCode: bodyCode ?? { in: visibleBodies },
    },
    orderBy: { scheduledAt: "desc" },
    take: 200,
    select: {
      id: true,
      bodyCode: true,
      title: true,
      scheduledAt: true,
      location: true,
      agenda: true,
      status: true,
      minutesDocumentId: true,
      organizer: { select: { email: true } },
      minutesDocument: {
        select: {
          id: true,
          title: true,
          confidentiality: true,
          status: true,
        },
      },
      participants: {
        select: {
          memberId: true,
          attended: true,
          member: { select: { firstName: true, lastName: true } },
          user: { select: { email: true } },
        },
      },
      decisions: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          actionOwner: true,
          dueAt: true,
          completedAt: true,
        },
      },
    },
  });
  const visibleItems = items.map((item) => {
    const visibleDocument =
      item.minutesDocument &&
      canReadDocument(user, item.minutesDocument.confidentiality) &&
      (item.minutesDocument.confidentiality !== "PUBLIC" ||
        item.minutesDocument.status === "PUBLISHED")
        ? item.minutesDocument
        : null;
    return {
      ...item,
      minutesDocumentId: visibleDocument?.id ?? null,
      minutesDocument: visibleDocument
        ? { id: visibleDocument.id, title: visibleDocument.title }
        : null,
    };
  });
  return NextResponse.json(visibleItems, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = meetingSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Réunion invalide." }, { status: 400 });
  const permission = permissionForBody[parsed.data.bodyCode].create;
  const authorization = await authorizeApi(permission);
  if (authorization.response) return authorization.response;
  const participantMemberIds = [...new Set(parsed.data.participantMemberIds)];
  if (participantMemberIds.length !== parsed.data.participantMemberIds.length) {
    return NextResponse.json({ error: "Un même membre ne peut apparaître plusieurs fois." }, { status: 400 });
  }
  if (participantMemberIds.length) {
    const activeMembers = await db.member.findMany({
      where: { id: { in: participantMemberIds }, status: "ACTIVE", archivedAt: null },
      select: { id: true },
    });
    if (activeMembers.length !== participantMemberIds.length) {
      return NextResponse.json({ error: "Tous les participants doivent être des membres actifs." }, { status: 422 });
    }
  }
  if (parsed.data.minutesDocumentId) {
    const minutes = await db.officialDocument.findUnique({
      where: { id: parsed.data.minutesDocumentId },
      select: { confidentiality: true, archivedAt: true },
    });
    if (!minutes || minutes.archivedAt || !canReadDocument(authorization.user, minutes.confidentiality)) {
      return NextResponse.json({ error: "Procès-verbal introuvable ou non autorisé." }, { status: 422 });
    }
  }

  const created = await db.$transaction(async (transaction) => {
    const meeting = await transaction.meeting.create({
      data: {
        bodyCode: parsed.data.bodyCode,
        title: parsed.data.title,
        scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
        location: parsed.data.location || null,
        agenda: parsed.data.agenda,
        status: parsed.data.status,
        organizerId: authorization.user.id,
        minutesDocumentId: parsed.data.minutesDocumentId ?? null,
      },
      select: { id: true, bodyCode: true, title: true, status: true },
    });
    if (participantMemberIds.length) {
      await transaction.meetingAttendance.createMany({
        data: participantMemberIds.map((memberId) => ({ meetingId: meeting.id, memberId })),
      });
    }
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: "SENSITIVE_OPERATION",
        subjectType: `meeting:${meeting.bodyCode}`,
        subjectId: meeting.id,
      },
    });
    return meeting;
  });
  return NextResponse.json(created, { status: 201 });
}
