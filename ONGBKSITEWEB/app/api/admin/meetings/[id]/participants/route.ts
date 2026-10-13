import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/api-auth";
import { db } from "@/lib/db";
import {
  meetingAttendanceDecisionSchema,
  meetingAttendanceSchema,
} from "@/lib/institution-validation";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";

const updatePermission = {
  EXECUTIVE_BOARD: "BE_MEETINGS_UPDATE",
  CONTROL_COMMISSION: "CCE_MEETINGS_UPDATE",
} as const;

async function getAuthorizedMeeting(id: string) {
  const meeting = await db.meeting.findUnique({
    where: { id },
    select: { id: true, bodyCode: true },
  });
  if (!meeting) return { response: NextResponse.json({ error: "Réunion introuvable." }, { status: 404 }) };
  const authorization = await authorizeApi(updatePermission[meeting.bodyCode]);
  if (authorization.response) return { response: authorization.response };
  return { meeting, authorization };
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = meetingAttendanceSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Liste des participants invalide." }, { status: 400 });
  const { id } = await context.params;
  const access = await getAuthorizedMeeting(id);
  if (access.response) return access.response;

  const activeMembers = await db.member.findMany({
    where: { id: { in: parsed.data.memberIds }, status: "ACTIVE", archivedAt: null },
    select: { id: true },
  });
  if (activeMembers.length !== parsed.data.memberIds.length) {
    return NextResponse.json({ error: "Tous les participants doivent être des membres actifs." }, { status: 422 });
  }
  await db.$transaction(async (transaction) => {
    await transaction.meetingAttendance.createMany({
      data: parsed.data.memberIds.map((memberId) => ({ meetingId: id, memberId })),
      skipDuplicates: true,
    });
    await transaction.auditLog.create({
      data: {
        actorId: access.authorization.user.id,
        event: "SENSITIVE_OPERATION",
        subjectType: "meeting-attendance",
        subjectId: id,
      },
    });
  });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = meetingAttendanceDecisionSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Présence invalide." }, { status: 400 });
  const { id } = await context.params;
  const access = await getAuthorizedMeeting(id);
  if (access.response) return access.response;

  const updated = await db.$transaction(async (transaction) => {
    const result = await transaction.meetingAttendance.updateMany({
      where: { meetingId: id, memberId: parsed.data.memberId },
      data: { attended: parsed.data.attended },
    });
    if (result.count === 0) return false;
    await transaction.auditLog.create({
      data: {
        actorId: access.authorization.user.id,
        event: "SENSITIVE_OPERATION",
        subjectType: "meeting-attendance",
        subjectId: id,
      },
    });
    return true;
  });
  if (!updated) return NextResponse.json({ error: "Ce membre ne figure pas parmi les participants." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
