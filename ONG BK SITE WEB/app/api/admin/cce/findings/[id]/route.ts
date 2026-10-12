import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeApi } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  status: z.enum(["IN_PROGRESS", "TREATED", "CLOSED"]),
  note: z.string().trim().min(5).max(1000),
}).strict();

const transitions: Record<string, readonly string[]> = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["TREATED"],
  TREATED: ["CLOSED"],
  CLOSED: [],
};

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const authorization = await authorizeApi("CCE_FINDINGS_UPDATE");
  if (authorization.response) return authorization.response;
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = updateSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Mise à jour invalide." }, { status: 400 });
  const { id } = await context.params;
  const finding = await db.cceFinding.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!finding) return NextResponse.json({ error: "Recommandation introuvable." }, { status: 404 });
  if (!transitions[finding.status].includes(parsed.data.status)) {
    return NextResponse.json({ error: "Transition de suivi non autorisée." }, { status: 409 });
  }
  const updated = await db.$transaction(async (transaction) => {
    const result = await transaction.cceFinding.update({
      where: { id },
      data: { status: parsed.data.status },
      select: { id: true, reference: true, status: true },
    });
    await transaction.cceFindingEvent.create({
      data: {
        findingId: id,
        actorId: authorization.user.id,
        fromStatus: finding.status,
        toStatus: parsed.data.status,
        note: parsed.data.note,
      },
    });
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: "SENSITIVE_OPERATION",
        subjectType: "cce-finding-status",
        subjectId: id,
      },
    });
    return result;
  });
  return NextResponse.json(updated, { headers: { "Cache-Control": "no-store" } });
}
