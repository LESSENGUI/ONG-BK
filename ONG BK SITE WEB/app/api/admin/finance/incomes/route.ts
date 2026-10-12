import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { FinanceIncomeStatus } from "@prisma/client";
import { authorizeApi } from "@/lib/api-auth";
import { financeIncomeSchema } from "@/lib/finance-validation";
import { db } from "@/lib/db";
import { isPrivateFinanceReceipt } from "@/lib/finance-documents";
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
  const statusFilter = Object.values(FinanceIncomeStatus).find((value) => value === status);
  const incomes = await db.financeIncome.findMany({
    where: {
      ...(periodId ? { periodId } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    orderBy: { date: "desc" },
    take: 1000,
    select: {
      id: true,
      reference: true,
      periodId: true,
      date: true,
      amount: true,
      currency: true,
      category: true,
      source: true,
      status: true,
      paymentMethod: true,
      receiptKey: true,
      observations: true,
      projectId: true,
      activityId: true,
      createdAt: true,
    },
  });
  return NextResponse.json(incomes, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const authorization = await authorizeApi("FINANCE_CREATE");
  if (authorization.response) return authorization.response;
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = financeIncomeSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Recette invalide." }, { status: 400 });
  const period = await db.financialPeriod.findUnique({
    where: { id: parsed.data.periodId },
    select: { status: true },
  });
  if (!period) return NextResponse.json({ error: "Exercice introuvable." }, { status: 404 });
  if (period.status !== "OPEN") return NextResponse.json({ error: "L’exercice n’est pas ouvert." }, { status: 409 });
  if (!(await hasValidFinanceReferences(parsed.data.projectId, parsed.data.activityId))) {
    return NextResponse.json({ error: "Le projet ou l’activité associé est invalide, archivé ou incohérent." }, { status: 400 });
  }
  if (parsed.data.receiptKey && !(await isPrivateFinanceReceipt(parsed.data.receiptKey))) {
    return NextResponse.json({ error: "Le justificatif doit être un document interne privé non archivé." }, { status: 400 });
  }

  const income = await db.$transaction(async (transaction) => {
    const created = await transaction.financeIncome.create({
      data: {
        reference: `REC-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
        periodId: parsed.data.periodId,
        date: new Date(parsed.data.date),
        amount: parsed.data.amount,
        currency: parsed.data.currency,
        category: parsed.data.category,
        source: parsed.data.source,
        status: parsed.data.status,
        paymentMethod: parsed.data.paymentMethod || null,
        receiptKey: parsed.data.receiptKey || null,
        observations: parsed.data.observations ?? "",
        projectId: parsed.data.projectId || null,
        activityId: parsed.data.activityId || null,
        recordedById: authorization.user.id,
      },
      select: { id: true, reference: true, amount: true, currency: true, category: true, status: true, date: true },
    });
    await transaction.financeIncomeEvent.create({
      data: {
        incomeId: created.id,
        actorId: authorization.user.id,
        toStatus: parsed.data.status,
        note: "Enregistrement de la recette.",
      },
    });
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: "SENSITIVE_OPERATION",
        subjectType: "finance-income",
        subjectId: created.id,
      },
    });
    return created;
  });
  return NextResponse.json(income, { status: 201, headers: { "Cache-Control": "no-store" } });
}
