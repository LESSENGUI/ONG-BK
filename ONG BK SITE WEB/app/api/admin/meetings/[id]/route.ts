import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/api-auth";
import { meetingSchema } from "@/lib/institution-validation";
import { db } from "@/lib/db";
import { canReadDocument } from "@/lib/private-documents";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";

const updatePermission = {
  EXECUTIVE_BOARD: "BE_MEETINGS_UPDATE",
  CONTROL_COMMISSION: "CCE_MEETINGS_UPDATE",
} as const;

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = meetingSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Réunion invalide." }, { status: 400 });
  const { id } = await context.params;
  const current = await db.meeting.findUnique({
    where: { id },
    select: { id: true, bodyCode: true, status: true },
  });
  if (!current) return NextResponse.json({ error: "Réunion introuvable." }, { status: 404 });
  if (current.bodyCode !== parsed.data.bodyCode) {
    return NextResponse.json({ error: "L’organe d’une réunion ne peut pas être changé." }, { status: 409 });
  }
  const authorization = await authorizeApi(updatePermission[current.bodyCode]);
  if (authorization.response) return authorization.response;
  if (
    current.status !== parsed.data.status &&
    (current.status !== "PLANNED" || parsed.data.status === "PLANNED")
  ) {
    return NextResponse.json({ error: "La transition de statut de cette réunion n’est pas autorisée." }, { status: 409 });
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

  const updated = await db.$transaction(async (transaction) => {
    const meeting = await transaction.meeting.update({
      where: { id },
      data: {
        title: parsed.data.title,
        scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
        location: parsed.data.location || null,
        agenda: parsed.data.agenda,
        status: parsed.data.status,
        minutesDocumentId: parsed.data.minutesDocumentId ?? null,
      },
      select: { id: true, bodyCode: true, status: true },
    });
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
  return NextResponse.json(updated);
}
