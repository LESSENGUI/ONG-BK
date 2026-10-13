import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/api-auth";
import { calculateFinanceSummary } from "@/lib/finance";
import { createFinancePdf, createFinanceWorkbook } from "@/lib/finance-export";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const csvCell = (value: string) =>
  `"${(/^[\s]*[=+\-@]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`;

function sumAmounts(values: readonly string[]): string {
  const cents = values.reduce((total, value) => {
    const [whole, fraction = ""] = value.split(".");
    return total + BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
  }, 0n);
  return `${cents / 100n}.${String(cents % 100n).padStart(2, "0")}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = url.searchParams.get("format");
  if (format && !["csv", "xlsx", "pdf"].includes(format)) {
    return NextResponse.json({ error: "Format d’export non pris en charge." }, { status: 400 });
  }
  const exporting = format !== null;
  const authorization = await authorizeApi(exporting ? "FINANCE_EXPORT" : "FINANCE_READ");
  if (authorization.response) return authorization.response;
  const requestedPeriod = url.searchParams.get("periodId");
  const periods = await db.financialPeriod.findMany({
    orderBy: { startsAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      startsAt: true,
      endsAt: true,
      status: true,
    },
  });
  const selectedPeriod = requestedPeriod
    ? periods.find((period) => period.id === requestedPeriod)
    : periods[0];
  if (requestedPeriod && !selectedPeriod) {
    return NextResponse.json({ error: "Exercice introuvable." }, { status: 404 });
  }
  const [budgets, incomes, expenses] = selectedPeriod
    ? await Promise.all([
        db.financeBudget.findMany({
          where: { periodId: selectedPeriod.id },
          orderBy: { id: "asc" },
          take: 5001,
          select: { initialAmount: true, revisedAmount: true, currency: true, approvedAt: true, category: true },
        }),
        db.financeIncome.findMany({
          where: { periodId: selectedPeriod.id },
          orderBy: { id: "asc" },
          take: 5001,
          select: { amount: true, currency: true, status: true, source: true, date: true },
        }),
        db.financeExpense.findMany({
          where: { periodId: selectedPeriod.id },
          orderBy: { id: "asc" },
          take: 5001,
          select: { amount: true, currency: true, status: true, category: true, paidAt: true },
        }),
      ])
    : [[], [], []] as const;
  if (budgets.length > 5000 || incomes.length > 5000 || expenses.length > 5000) {
    return NextResponse.json(
      { error: "Cet exercice dépasse la capacité de la synthèse (5 000 lignes par registre). Utilisez un rapport paginé." },
      { status: 413 },
    );
  }
  const cceStatusCounts = await db.cceFinding.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const reports = selectedPeriod ? [(() => {
    const summary = calculateFinanceSummary(
      budgets
        .filter((budget) => budget.approvedAt !== null)
        .map((budget) => ({
        initialAmount: budget.initialAmount.toString(),
        revisedAmount: budget.revisedAmount.toString(),
        currency: budget.currency,
        })),
      incomes.map((income) => ({
        amount: income.amount.toString(),
        currency: income.currency,
        status: income.status,
      })),
      expenses.map((expense) => ({
        amount: expense.amount.toString(),
        currency: expense.currency,
        status: expense.status === "ARCHIVED" && expense.paidAt ? "PAID" : expense.status,
      })),
    );
    const pendingExpenses = expenses.filter((expense) =>
      ["SUBMITTED", "UNDER_REVIEW", "PENDING_APPROVAL", "APPROVED"].includes(expense.status),
    ).length;
    const byCategory = new Map<string, string[]>();
    for (const expense of expenses.filter((item) => item.status === "PAID" || item.status === "ARCHIVED" && item.paidAt)) {
      const key = `${expense.category} (${expense.currency})`;
      byCategory.set(key, [...(byCategory.get(key) ?? []), expense.amount.toString()]);
    }
    const incomeBySource: Record<string, string[]> = {};
    for (const income of incomes.filter((item) => item.status === "RECEIVED" || item.status === "VERIFIED")) {
      const key = `${income.source} (${income.currency})`;
      incomeBySource[key] = [...(incomeBySource[key] ?? []), income.amount.toString()];
    }
    return {
      period: selectedPeriod,
      summary,
      counts: {
        budgets: budgets.length,
        incomes: incomes.length,
        expenses: expenses.length,
        expensesPending: pendingExpenses,
      },
      paidExpensesByCategory: [...byCategory.entries()].map(([category, entries]) => ({
        category,
        count: entries.length,
        total: sumAmounts(entries),
      })),
      incomeBySource: Object.fromEntries(
        Object.entries(incomeBySource).map(([source, amounts]) => [source, sumAmounts(amounts)]),
      ),
      cceFindings: {
        open: cceStatusCounts.find((item) => item.status === "OPEN")?._count._all ?? 0,
        inProgress: cceStatusCounts.find((item) => item.status === "IN_PROGRESS")?._count._all ?? 0,
        treated: cceStatusCounts.find((item) => item.status === "TREATED")?._count._all ?? 0,
        closed: cceStatusCounts.find((item) => item.status === "CLOSED")?._count._all ?? 0,
      },
      monthly: [...new Set([
        ...incomes
          .filter((income) => income.status === "RECEIVED" || income.status === "VERIFIED")
          .map((income) => income.date.toISOString().slice(0, 7)),
        ...expenses
          .filter((expense) => (expense.status === "PAID" || expense.status === "ARCHIVED") && expense.paidAt)
          .map((expense) => expense.paidAt!.toISOString().slice(0, 7)),
      ])].sort().map((monthKey) => {
        const monthIncomes = incomes
          .filter((income) =>
            (income.status === "RECEIVED" || income.status === "VERIFIED") &&
            income.date.toISOString().slice(0, 7) === monthKey,
          );
        const monthExpenses = expenses.filter((expense) =>
          (expense.status === "PAID" || expense.status === "ARCHIVED") && expense.paidAt?.toISOString().slice(0, 7) === monthKey,
        );
        const currencies = new Set([
          ...monthIncomes.map((income) => income.currency),
          ...monthExpenses.map((expense) => expense.currency),
        ]);
        return {
          month: monthKey,
          totals: [...currencies].map((currency) => ({
            currency,
            income: sumAmounts(monthIncomes.filter((item) => item.currency === currency).map((item) => item.amount.toString())),
            expenses: sumAmounts(monthExpenses.filter((item) => item.currency === currency).map((item) => item.amount.toString())),
          })),
        };
      }),
    };
  })()] : [];

  if (format === "xlsx" || format === "pdf") {
    const report = reports[0];
    if (!report) {
      return NextResponse.json({ error: "Aucun exercice financier à exporter." }, { status: 404 });
    }
    if (format === "xlsx") {
      const file = await createFinanceWorkbook(report);
      return new Response(new Uint8Array(file), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="ong-bk-rapport-financier.xlsx"',
          "Cache-Control": "no-store",
        },
      });
    }
    const file = await createFinancePdf(report);
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="ong-bk-rapport-financier.pdf"',
        "Cache-Control": "no-store",
      },
    });
  }

  if (exporting) {
    const rows = [
      ["Exercice", "Début", "Fin", "Statut", "Devise", "Budget initial", "Budget révisé", "Recettes encaissées", "Dépenses payées", "Solde net calculé", "Engagements impayés", "Solde budgétaire calculé", "Taux d'exécution (%)"],
      ...reports.flatMap((report) =>
        report.summary.map((item) => [
          report.period.name,
          report.period.startsAt.toISOString(),
          report.period.endsAt.toISOString(),
          report.period.status,
          item.currency,
          item.budgetInitial,
          item.budgetRevised,
          item.incomeReceived,
          item.expensesPaid,
          item.operatingBalance,
          item.commitmentsUnpaid,
          item.budgetRemaining,
          item.executionRate === null ? "" : String(item.executionRate),
        ]),
      ),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="ong-bk-synthese-financiere.csv"',
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.json(
    { periods, reports, generatedAt: new Date().toISOString(), source: "Données enregistrées dans l’application; solde bancaire non certifié." },
    { headers: { "Cache-Control": "no-store" } },
  );
}
