import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/api-auth";
import { financeBudgetSchema } from "@/lib/finance-validation";
import { db } from "@/lib/db";
import { hasValidFinanceReferences } from "@/lib/finance-references";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await authorizeApi("FINANCE_READ");
  if (authorization.response) return authorization.response;
  const periodId = new URL(request.url).searchParams.get("periodId");
  const budgets = await db.financeBudget.findMany({
    where: periodId ? { periodId } : undefined,
    orderBy: [{ period: { startsAt: "desc" } }, { category: "asc" }],
    take: 1000,
    select: {
      id: true,
      reference: true,
      periodId: true,
      category: true,
      domain: true,
      initialAmount: true,
      revisedAmount: true,
      currency: true,
      fundingSource: true,
      projectId: true,
      activityId: true,
      status: true,
      approvedAt: true,
      createdAt: true,
    },
  });
  return NextResponse.json(budgets, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const authorization = await authorizeApi("FINANCE_CREATE");
  if (authorization.response) return authorization.response;
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = financeBudgetSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Budget invalide." }, { status: 400 });
  const period = await db.financialPeriod.findUnique({
    where: { id: parsed.data.periodId },
    select: { id: true, status: true },
  });
  if (!period) return NextResponse.json({ error: "Exercice introuvable." }, { status: 404 });
  if (period.status !== "OPEN") return NextResponse.json({ error: "L’exercice n’est pas ouvert." }, { status: 409 });
  if (!(await hasValidFinanceReferences(parsed.data.projectId, parsed.data.activityId))) {
    return NextResponse.json({ error: "Le projet ou l’activité associé est invalide, archivé ou incohérent." }, { status: 400 });
  }

  const budget = await db.$transaction(async (transaction) => {
    const created = await transaction.financeBudget.create({
      data: {
        reference: `BUD-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
        periodId: period.id,
        category: parsed.data.category,
        domain: parsed.data.domain,
        initialAmount: parsed.data.initialAmount,
        revisedAmount: parsed.data.revisedAmount,
        currency: parsed.data.currency,
        justification: parsed.data.justification,
        fundingSource: parsed.data.fundingSource || null,
        projectId: parsed.data.projectId || null,
        activityId: parsed.data.activityId || null,
        createdById: authorization.user.id,
      },
      select: {
        id: true,
        reference: true,
        periodId: true,
        category: true,
        initialAmount: true,
        revisedAmount: true,
        currency: true,
        status: true,
      },
    });
    await transaction.financeBudgetEvent.create({
      data: {
        budgetId: created.id,
        actorId: authorization.user.id,
        toStatus: "DRAFT",
        note: "Création du budget.",
      },
    });
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: "SENSITIVE_OPERATION",
        subjectType: "finance-budget",
        subjectId: created.id,
      },
    });
    return created;
  });
  return NextResponse.json(budget, { status: 201, headers: { "Cache-Control": "no-store" } });
}
