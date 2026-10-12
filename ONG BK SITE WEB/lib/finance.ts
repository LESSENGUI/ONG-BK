export type FinanceIncomeRecord = {
  amount: string;
  currency: string;
  status: string;
};

export type FinanceExpenseRecord = {
  amount: string;
  currency: string;
  status: string;
};

export type FinanceBudgetRecord = {
  initialAmount: string;
  revisedAmount: string;
  currency: string;
};

export type CurrencySummary = {
  currency: string;
  budgetInitial: string;
  budgetRevised: string;
  incomeReceived: string;
  expensesPaid: string;
  operatingBalance: string;
  commitmentsUnpaid: string;
  budgetRemaining: string;
  executionRate: number | null;
};

function amountToCents(amount: string): bigint {
  const match = /^(0|[1-9]\d*)(?:\.(\d{1,2}))?$/.exec(amount);
  if (!match) throw new Error("INVALID_FINANCIAL_AMOUNT");
  const whole = BigInt(match[1]);
  const cents = BigInt((match[2] ?? "").padEnd(2, "0") || "0");
  return whole * 100n + cents;
}

function centsToAmount(value: bigint): string {
  const sign = value < 0n ? "-" : "";
  const absolute = value < 0n ? -value : value;
  return `${sign}${absolute / 100n}.${String(absolute % 100n).padStart(2, "0")}`;
}

export function calculateFinanceSummary(
  budgets: readonly FinanceBudgetRecord[],
  incomes: readonly FinanceIncomeRecord[],
  expenses: readonly FinanceExpenseRecord[],
): CurrencySummary[] {
  const currencies = new Set([
    ...budgets.map((item) => item.currency),
    ...incomes.map((item) => item.currency),
    ...expenses.map((item) => item.currency),
  ]);

  return [...currencies].sort().map((currency) => {
    const currentBudgets = budgets.filter((item) => item.currency === currency);
    const currentIncome = incomes.filter((item) => item.currency === currency);
    const currentExpenses = expenses.filter((item) => item.currency === currency);
    const sum = (values: readonly string[]) =>
      values.reduce((total, value) => total + amountToCents(value), 0n);
    const budgetInitial = sum(currentBudgets.map((item) => item.initialAmount));
    const budgetRevised = sum(currentBudgets.map((item) => item.revisedAmount));
    const incomeReceived = sum(
      currentIncome
        .filter((item) => item.status === "RECEIVED" || item.status === "VERIFIED")
        .map((item) => item.amount),
    );
    const expensesPaid = sum(
      currentExpenses.filter((item) => item.status === "PAID").map((item) => item.amount),
    );
    const commitmentsUnpaid = sum(
      currentExpenses
        .filter((item) =>
          ["SUBMITTED", "UNDER_REVIEW", "PENDING_APPROVAL", "APPROVED"].includes(item.status),
        )
        .map((item) => item.amount),
    );
    const budgetRemaining = budgetRevised - expensesPaid - commitmentsUnpaid;

    return {
      currency,
      budgetInitial: centsToAmount(budgetInitial),
      budgetRevised: centsToAmount(budgetRevised),
      incomeReceived: centsToAmount(incomeReceived),
      expensesPaid: centsToAmount(expensesPaid),
      operatingBalance: centsToAmount(incomeReceived - expensesPaid),
      commitmentsUnpaid: centsToAmount(commitmentsUnpaid),
      budgetRemaining: centsToAmount(budgetRemaining),
      executionRate:
        budgetRevised === 0n
          ? null
          : Number(((expensesPaid * 10000n) / budgetRevised)) / 100,
    };
  });
}
