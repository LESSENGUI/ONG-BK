import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  status: z.enum(["CLOSED", "ARCHIVED"]),
  note: z.string().trim().min(5).max(1000),
}).strict();

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = schema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Transition invalide." }, { status: 400 });
  const permission = parsed.data.status === "ARCHIVED" ? "FINANCE_ARCHIVE" : "FINANCE_APPROVE";
  const authorization = await authorizeApi(permission);
  if (authorization.response) return authorization.response;
  const { id } = await context.params;
  const period = await db.financialPeriod.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!period) return NextResponse.json({ error: "Exercice introuvable." }, { status: 404 });
  if (
    (period.status === "OPEN" && parsed.data.status !== "CLOSED") ||
    (period.status === "CLOSED" && parsed.data.status !== "ARCHIVED") ||
    period.status === "ARCHIVED"
  ) {
    return NextResponse.json({ error: "Transition non autorisée pour cet exercice." }, { status: 409 });
  }
  if (parsed.data.status === "CLOSED") {
    const [pendingExpenses, pendingBudgets] = await Promise.all([
      db.financeExpense.count({
        where: {
          periodId: id,
          status: { in: ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "PENDING_APPROVAL", "APPROVED"] },
        },
      }),
      db.financeBudget.count({ where: { periodId: id, status: { in: ["DRAFT", "SUBMITTED"] } } }),
    ]);
    if (pendingExpenses > 0 || pendingBudgets > 0) {
      return NextResponse.json({
        error: "Traitez ou archivez les demandes de dépenses et budgets en attente avant de clôturer l’exercice.",
      }, { status: 409 });
    }
  }
  const nextStatus = parsed.data.status;
  const updated = await db.$transaction(async (transaction) => {
    const result = await transaction.financialPeriod.update({
      where: { id },
      data: { status: nextStatus },
      select: { id: true, name: true, status: true, startsAt: true, endsAt: true },
    });
    await transaction.financialPeriodEvent.create({
      data: {
        periodId: id,
        actorId: authorization.user.id,
        fromStatus: period.status,
        toStatus: nextStatus,
        note: parsed.data.note,
      },
    });
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: "SENSITIVE_OPERATION",
        subjectType: `financial-period:${nextStatus.toLowerCase()}`,
        subjectId: id,
      },
    });
    return result;
  });
  return NextResponse.json(updated, { headers: { "Cache-Control": "no-store" } });
}
