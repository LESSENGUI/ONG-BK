import assert from "node:assert/strict";
import test from "node:test";
import { calculateFinanceSummary } from "../lib/finance";
import { financeIncomeSchema, financialPeriodSchema } from "../lib/finance-validation";

test("finance totals exclude promises and cancelled/rejected operations", () => {
  const summary = calculateFinanceSummary(
    [{ initialAmount: "1000.00", revisedAmount: "1200.00", currency: "XAF" }],
    [
      { amount: "100.50", currency: "XAF", status: "RECEIVED" },
      { amount: "900.00", currency: "XAF", status: "COMMITTED" },
      { amount: "50.00", currency: "XAF", status: "CANCELLED" },
    ],
    [
      { amount: "200.10", currency: "XAF", status: "PAID" },
      { amount: "50.05", currency: "XAF", status: "APPROVED" },
      { amount: "90.00", currency: "XAF", status: "REJECTED" },
    ],
  );
  assert.deepEqual(summary, [{
    currency: "XAF",
    budgetInitial: "1000.00",
    budgetRevised: "1200.00",
    incomeReceived: "100.50",
    expensesPaid: "200.10",
    operatingBalance: "-99.60",
    commitmentsUnpaid: "50.05",
    budgetRemaining: "949.85",
    executionRate: 16.67,
  }]);
});

test("financial summaries never combine currencies", () => {
  const summary = calculateFinanceSummary(
    [{ initialAmount: "5.00", revisedAmount: "5.00", currency: "XAF" }],
    [{ amount: "7.25", currency: "EUR", status: "VERIFIED" }],
    [],
  );
  assert.deepEqual(summary.map((item) => [item.currency, item.budgetRevised, item.incomeReceived, item.operatingBalance]), [
    ["EUR", "0.00", "7.25", "7.25"],
    ["XAF", "5.00", "0.00", "0.00"],
  ]);
});

test("invalid financial amounts are rejected", () => {
  assert.throws(
    () =>
      calculateFinanceSummary(
        [{ initialAmount: "1,25", revisedAmount: "1,25", currency: "XAF" }],
        [],
        [],
      ),
    /INVALID_FINANCIAL_AMOUNT/,
  );
});

test("an exercise must have a chronological, non-empty interval", () => {
  assert.equal(financialPeriodSchema.safeParse({
    name: "Exercice témoin",
    startsAt: "2026-01-01T00:00:00.000Z",
    endsAt: "2025-12-31T23:59:59.000Z",
    responsibleId: "user-1",
  }).success, false);
});

test("a received income requires a private receipt reference and payment method", () => {
  const base = {
    periodId: "period-1",
    date: "2026-01-15T12:00:00.000Z",
    amount: "25.00",
    currency: "XAF",
    category: "DONATION",
    source: "Test clairement identifié",
  };
  assert.equal(financeIncomeSchema.safeParse({ ...base, status: "EXPECTED" }).success, true);
  assert.equal(financeIncomeSchema.safeParse({ ...base, status: "RECEIVED" }).success, false);
  assert.equal(financeIncomeSchema.safeParse({
    ...base,
    status: "RECEIVED",
    receiptKey: "document-id",
    paymentMethod: "Virement",
  }).success, true);
});
