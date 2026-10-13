import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/api-auth";
import { decisionSchema } from "@/lib/institution-validation";
import { db } from "@/lib/db";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = decisionSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Décision invalide." }, { status: 400 });
  const { id } = await context.params;
  const meeting = await db.meeting.findUnique({
    where: { id },
    select: { id: true, bodyCode: true },
  });
  if (!meeting) return NextResponse.json({ error: "Réunion introuvable." }, { status: 404 });
  const permission = meeting.bodyCode === "EXECUTIVE_BOARD"
    ? "BE_MEETINGS_UPDATE"
    : "CCE_MEETINGS_UPDATE";
  const authorization = await authorizeApi(permission);
  if (authorization.response) return authorization.response;

  const result = await db.$transaction(async (transaction) => {
    const decision = await transaction.meetingDecision.create({
      data: {
        meetingId: id,
        title: parsed.data.title,
        description: parsed.data.description,
        status: parsed.data.status,
        actionOwner: parsed.data.actionOwner || null,
        dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
        authorId: authorization.user.id,
      },
      select: { id: true, title: true, status: true, dueAt: true },
    });
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: "SENSITIVE_OPERATION",
        subjectType: "meeting-decision",
        subjectId: decision.id,
      },
    });
    return decision;
  });
  return NextResponse.json(result, { status: 201 });
}
