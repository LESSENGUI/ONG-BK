import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/api-auth";
import { financeExpenseSchema } from "@/lib/finance-validation";
import { db } from "@/lib/db";
import { hasValidFinanceReferences } from "@/lib/finance-references";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await authorizeApi("FINANCE_READ");
  if (authorization.response) return authorization.response;
  const url = new URL(request.url);
  const periodId = url.searchParams.get("periodId");
  const status = url.searchParams.get("status");
  const expenses = await db.financeExpense.findMany({
    where: {
      ...(periodId ? { periodId } : {}),
      ...(status && ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "PENDING_APPROVAL", "APPROVED", "REJECTED", "PAID", "CANCELLED", "ARCHIVED"].includes(status)
        ? { status: status as "DRAFT" }
        : {}),
    },
    orderBy: { requestedAt: "desc" },
    take: 1000,
    select: {
      id: true,
      reference: true,
      periodId: true,
      requestedAt: true,
      paidAt: true,
      amount: true,
      currency: true,
      category: true,
      purpose: true,
      beneficiary: true,
      paymentMethod: true,
      receiptKey: true,
      status: true,
      projectId: true,
      activityId: true,
      requesterId: true,
      verifierId: true,
      approverId: true,
      payerId: true,
      observations: true,
      history: { orderBy: { createdAt: "asc" } },
    },
  });
  return NextResponse.json(expenses, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const authorization = await authorizeApi("FINANCE_CREATE");
  if (authorization.response) return authorization.response;
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = financeExpenseSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Demande de dépense invalide." }, { status: 400 });
  const period = await db.financialPeriod.findUnique({
    where: { id: parsed.data.periodId },
    select: { status: true },
  });
  if (!period) return NextResponse.json({ error: "Exercice introuvable." }, { status: 404 });
  if (period.status !== "OPEN") return NextResponse.json({ error: "L’exercice n’est pas ouvert." }, { status: 409 });
  if (!(await hasValidFinanceReferences(parsed.data.projectId, parsed.data.activityId))) {
    return NextResponse.json({ error: "Le projet ou l’activité associé est invalide, archivé ou incohérent." }, { status: 400 });
  }

  const expense = await db.$transaction(async (transaction) => {
    const created = await transaction.financeExpense.create({
      data: {
        reference: `DEP-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
        periodId: parsed.data.periodId,
        amount: parsed.data.amount,
        currency: parsed.data.currency,
        category: parsed.data.category,
        purpose: parsed.data.purpose,
        beneficiary: parsed.data.beneficiary || null,
        projectId: parsed.data.projectId || null,
        activityId: parsed.data.activityId || null,
        requesterId: authorization.user.id,
        observations: parsed.data.observations ?? "",
      },
      select: { id: true, reference: true, amount: true, currency: true, status: true },
    });
    await transaction.financeExpenseEvent.create({
      data: {
        expenseId: created.id,
        actorId: authorization.user.id,
        toStatus: "DRAFT",
        note: "Création de la demande.",
      },
    });
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: "SENSITIVE_OPERATION",
        subjectType: "finance-expense",
        subjectId: created.id,
      },
    });
    return created;
  });
  return NextResponse.json(expense, { status: 201, headers: { "Cache-Control": "no-store" } });
}
