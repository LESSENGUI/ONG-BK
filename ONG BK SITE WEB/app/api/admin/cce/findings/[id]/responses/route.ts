import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/api-auth";
import { cceResponseSchema } from "@/lib/finance-validation";
import { db } from "@/lib/db";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const authorization = await authorizeApi("CCE_RESPONSES_CREATE");
  if (authorization.response) return authorization.response;
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = cceResponseSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Réponse invalide." }, { status: 400 });
  const { id } = await context.params;
  const finding = await db.cceFinding.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!finding) return NextResponse.json({ error: "Recommandation introuvable." }, { status: 404 });
  if (finding.status === "CLOSED") {
    return NextResponse.json({ error: "Une recommandation clôturée ne peut plus recevoir de réponse." }, { status: 409 });
  }
  const response = await db.$transaction(async (transaction) => {
    const created = await transaction.cceResponse.create({
      data: {
        findingId: id,
        authorId: authorization.user.id,
        response: parsed.data.response,
        corrective: parsed.data.corrective ?? "",
      },
      select: { id: true, findingId: true, response: true, corrective: true, createdAt: true },
    });
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: "SENSITIVE_OPERATION",
        subjectType: "cce-response",
        subjectId: created.id,
      },
    });
    return created;
  });
  return NextResponse.json(response, { status: 201, headers: { "Cache-Control": "no-store" } });
}
