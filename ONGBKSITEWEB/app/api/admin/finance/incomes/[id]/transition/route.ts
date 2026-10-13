import { NextResponse } from "next/server";
import type { FinanceIncomeStatus } from "@prisma/client";
import { z } from "zod";
import { authorizeApi } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { isPrivateFinanceReceipt } from "@/lib/finance-documents";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const transitionSchema = z.object({
  status: z.enum(["RECEIVED", "VERIFIED", "CANCELLED", "REVERSED"]),
  note: z.string().trim().min(5).max(1000),
  paymentMethod: z.string().trim().min(2).max(80).optional(),
  receiptKey: z.string().trim().min(1).max(191).optional(),
}).strict();

const allowed: Record<FinanceIncomeStatus, readonly FinanceIncomeStatus[]> = {
  EXPECTED: ["COMMITTED", "RECEIVED", "CANCELLED"],
  COMMITTED: ["RECEIVED", "CANCELLED"],
  RECEIVED: ["VERIFIED", "REVERSED"],
  VERIFIED: ["REVERSED"],
  CANCELLED: [],
  REVERSED: [],
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = transitionSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Transition invalide." }, { status: 400 });
  const permission = parsed.data.status === "VERIFIED" || parsed.data.status === "REVERSED"
    ? "FINANCE_APPROVE"
    : "FINANCE_UPDATE";
  const authorization = await authorizeApi(permission);
  if (authorization.response) return authorization.response;
  const { id } = await context.params;
  const income = await db.financeIncome.findUnique({
    where: { id },
    include: { period: { select: { status: true } } },
  });
  if (!income) return NextResponse.json({ error: "Recette introuvable." }, { status: 404 });
  if (!allowed[income.status].includes(parsed.data.status)) {
    return NextResponse.json({ error: "Transition non autorisée pour ce statut." }, { status: 409 });
  }
  if (income.period.status !== "OPEN") {
    return NextResponse.json({ error: "L’exercice est clôturé." }, { status: 409 });
  }
  const receiptKey = parsed.data.receiptKey ?? income.receiptKey;
  const paymentMethod = parsed.data.paymentMethod ?? income.paymentMethod;
  if (parsed.data.status === "RECEIVED" && (!receiptKey || !paymentMethod)) {
    return NextResponse.json({ error: "Le justificatif et le mode de paiement sont obligatoires." }, { status: 409 });
  }
  if (
    parsed.data.status === "RECEIVED" &&
    receiptKey &&
    !(await isPrivateFinanceReceipt(receiptKey))
  ) {
    return NextResponse.json({ error: "Le justificatif financier est indisponible ou n’est pas privé." }, { status: 409 });
  }
  const updated = await db.$transaction(async (transaction) => {
    const result = await transaction.financeIncome.update({
      where: { id },
      data: {
        status: parsed.data.status,
        ...(parsed.data.receiptKey ? { receiptKey: parsed.data.receiptKey } : {}),
        ...(parsed.data.paymentMethod ? { paymentMethod: parsed.data.paymentMethod } : {}),
      },
      select: { id: true, reference: true, status: true, amount: true, currency: true },
    });
    await transaction.financeIncomeEvent.create({
      data: {
        incomeId: id,
        actorId: authorization.user.id,
        fromStatus: income.status,
        toStatus: parsed.data.status,
        note: parsed.data.note,
      },
    });
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: "SENSITIVE_OPERATION",
        subjectType: `finance-income:${parsed.data.status.toLowerCase()}`,
        subjectId: id,
      },
    });
    return result;
  });
  return NextResponse.json(updated, { headers: { "Cache-Control": "no-store" } });
}
