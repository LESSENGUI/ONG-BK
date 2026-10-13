import { NextResponse } from "next/server";
import type { FinanceBudgetStatus } from "@prisma/client";
import { z } from "zod";
import { authorizeApi } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  status: z.enum(["SUBMITTED", "APPROVED", "REJECTED", "DRAFT", "ARCHIVED"]),
  note: z.string().trim().min(5).max(1000),
}).strict();

const allowedTransitions: Record<FinanceBudgetStatus, readonly FinanceBudgetStatus[]> = {
  DRAFT: ["SUBMITTED", "ARCHIVED"],
  SUBMITTED: ["APPROVED", "REJECTED"],
  APPROVED: ["ARCHIVED"],
  REJECTED: ["DRAFT", "ARCHIVED"],
  ARCHIVED: [],
};

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = schema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Transition invalide." }, { status: 400 });
  const permission = parsed.data.status === "APPROVED"
    ? "FINANCE_APPROVE"
    : parsed.data.status === "ARCHIVED"
      ? "FINANCE_ARCHIVE"
      : "FINANCE_UPDATE";
  const authorization = await authorizeApi(permission);
  if (authorization.response) return authorization.response;
  const { id } = await context.params;
  const budget = await db.financeBudget.findUnique({
    where: { id },
    select: { id: true, status: true, createdById: true, period: { select: { status: true } } },
  });
  if (!budget) return NextResponse.json({ error: "Budget introuvable." }, { status: 404 });
  if (!allowedTransitions[budget.status].includes(parsed.data.status)) {
    return NextResponse.json({ error: "Transition non autorisée pour le statut actuel." }, { status: 409 });
  }
  if (budget.period.status !== "OPEN" && parsed.data.status !== "ARCHIVED") {
    return NextResponse.json({ error: "L’exercice est clôturé." }, { status: 409 });
  }
  if (parsed.data.status === "APPROVED" && budget.createdById === authorization.user.id) {
    return NextResponse.json({ error: "L’auteur ne peut pas approuver son propre budget." }, { status: 403 });
  }
  const nextStatus = parsed.data.status;
  const updated = await db.$transaction(async (transaction) => {
    const result = await transaction.financeBudget.update({
      where: { id },
      data: {
        status: nextStatus,
        ...(nextStatus === "APPROVED"
          ? { approvedAt: new Date(), approvedById: authorization.user.id }
          : {}),
      },
      select: { id: true, reference: true, status: true, approvedAt: true },
    });
    await transaction.financeBudgetEvent.create({
      data: {
        budgetId: id,
        actorId: authorization.user.id,
        fromStatus: budget.status,
        toStatus: nextStatus,
        note: parsed.data.note,
      },
    });
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: "SENSITIVE_OPERATION",
        subjectType: `finance-budget:${nextStatus.toLowerCase()}`,
        subjectId: id,
      },
    });
    return result;
  });
  return NextResponse.json(updated, { headers: { "Cache-Control": "no-store" } });
}
