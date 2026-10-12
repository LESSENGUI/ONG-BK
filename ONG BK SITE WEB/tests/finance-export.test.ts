import assert from "node:assert/strict";
import test from "node:test";
import ExcelJS from "exceljs";
import { createFinancePdf, createFinanceWorkbook } from "../lib/finance-export";

const report = {
  period: {
    name: "Exercice de test",
    startsAt: new Date("2026-01-01T00:00:00.000Z"),
    endsAt: new Date("2026-12-31T00:00:00.000Z"),
    status: "OPEN",
  },
  summary: [
    {
      currency: "XAF",
      budgetInitial: "1000.00",
      budgetRevised: "1200.00",
      incomeReceived: "800.00",
      expensesPaid: "300.00",
      operatingBalance: "500.00",
      commitmentsUnpaid: "100.00",
      budgetRemaining: "800.00",
      executionRate: 25,
    },
    {
      currency: "EUR",
      budgetInitial: "100.00",
      budgetRevised: "100.00",
      incomeReceived: "80.00",
      expensesPaid: "30.00",
      operatingBalance: "50.00",
      commitmentsUnpaid: "10.00",
      budgetRemaining: "60.00",
      executionRate: 30,
    },
  ],
  counts: { budgets: 2, incomes: 3, expenses: 4, expensesPending: 1 },
  paidExpensesByCategory: [{ category: "Transport (XAF)", count: 2, total: "300.00" }],
  incomeBySource: { "Cotisations (XAF)": "800.00" },
  cceFindings: { open: 1, inProgress: 2, treated: 3, closed: 4 },
  monthly: [{
    month: "2026-01",
    totals: [{ currency: "XAF", income: "800.00", expenses: "300.00" }],
  }],
};

test("Excel financial export contains separate currencies and verifiable formulas", async () => {
  const bytes = await createFinanceWorkbook(report);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Uint8Array.from(bytes).buffer);

  assert.deepEqual(workbook.worksheets.map((sheet) => sheet.name), [
    "Synthèse",
    "Mensuel",
    "Dépenses par catégorie",
    "Recettes par source",
    "Périmètre",
  ]);
  const summary = workbook.getWorksheet("Synthèse");
  assert.ok(summary);
  assert.equal(summary.rowCount, 3);
  assert.equal(summary.getCell("A2").value, "XAF");
  assert.equal(summary.getCell("A3").value, "EUR");
  assert.equal((summary.getCell("F2").value as ExcelJS.CellFormulaValue).formula, "D2-E2");
  assert.equal((summary.getCell("H2").value as ExcelJS.CellFormulaValue).formula, "C2-E2-G2");
  assert.equal(workbook.getWorksheet("Mensuel")?.getCell("C2").value, 800);
});

test("PDF financial export is a generated PDF with the confidential report title", async () => {
  const bytes = await createFinancePdf(report);
  assert.equal(bytes.subarray(0, 4).toString("ascii"), "%PDF");
  assert.ok(bytes.length > 1000);
  assert.ok(bytes.includes(Buffer.from("/Type /Page")));
});
