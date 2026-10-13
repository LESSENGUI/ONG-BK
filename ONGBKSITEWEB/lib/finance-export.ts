import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

type FinanceSummary = {
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

type FinanceReport = {
  period: { name: string; startsAt: Date; endsAt: Date; status: string };
  summary: FinanceSummary[];
  counts: { budgets: number; incomes: number; expenses: number; expensesPending: number };
  paidExpensesByCategory: { category: string; count: number; total: string }[];
  incomeBySource: Record<string, string>;
  cceFindings: { open: number; inProgress: number; treated: number; closed: number };
  monthly: { month: string; totals: { currency: string; income: string; expenses: string }[] }[];
};

const amount = (value: string) => Number(value);
const generatedAt = () => new Date().toISOString();

export async function createFinanceWorkbook(report: FinanceReport) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ONG-BK";
  workbook.created = new Date();
  workbook.subject = `Synthèse financière - ${report.period.name}`;

  const summary = workbook.addWorksheet("Synthèse");
  summary.columns = [
    { header: "Devise", key: "currency", width: 14 },
    { header: "Budget initial", key: "budgetInitial", width: 18 },
    { header: "Budget révisé", key: "budgetRevised", width: 18 },
    { header: "Recettes encaissées", key: "incomeReceived", width: 22 },
    { header: "Dépenses payées", key: "expensesPaid", width: 20 },
    { header: "Solde net calculé", key: "operatingBalance", width: 20 },
    { header: "Engagements impayés", key: "commitmentsUnpaid", width: 22 },
    { header: "Solde budgétaire", key: "budgetRemaining", width: 19 },
    { header: "Exécution (%)", key: "executionRate", width: 16 },
  ];
  report.summary.forEach((item) => {
    const row = summary.addRow({
      currency: item.currency,
      budgetInitial: amount(item.budgetInitial),
      budgetRevised: amount(item.budgetRevised),
      incomeReceived: amount(item.incomeReceived),
      expensesPaid: amount(item.expensesPaid),
      commitmentsUnpaid: amount(item.commitmentsUnpaid),
    });
    row.getCell(6).value = {
      formula: `D${row.number}-E${row.number}`,
      result: amount(item.operatingBalance),
    };
    row.getCell(8).value = {
      formula: `C${row.number}-E${row.number}-G${row.number}`,
      result: amount(item.budgetRemaining),
    };
    row.getCell(9).value = item.executionRate === null
      ? null
      : { formula: `IF(C${row.number}=0,"",E${row.number}/C${row.number}*100)`, result: item.executionRate };
  });
  summary.autoFilter = { from: "A1", to: "I1" };
  summary.views = [{ state: "frozen", ySplit: 1 }];
  summary.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  summary.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF155E4A" } };
  summary.getRows(2, Math.max(1, report.summary.length))?.forEach((row) => {
    for (let column = 2; column <= 8; column += 1) row.getCell(column).numFmt = "#,##0.00";
    row.getCell(9).numFmt = '0.00"%"';
  });

  const monthly = workbook.addWorksheet("Mensuel");
  monthly.columns = [
    { header: "Mois", key: "month", width: 16 },
    { header: "Devise", key: "currency", width: 14 },
    { header: "Recettes encaissées", key: "income", width: 22 },
    { header: "Dépenses payées", key: "expenses", width: 20 },
  ];
  monthly.addRows(report.monthly.flatMap((month) => month.totals.map((total) => ({
    month: month.month,
    currency: total.currency,
    income: amount(total.income),
    expenses: amount(total.expenses),
  }))));
  styleTable(monthly, "D");
  monthly.getColumn("income").numFmt = "#,##0.00";
  monthly.getColumn("expenses").numFmt = "#,##0.00";

  const categories = workbook.addWorksheet("Dépenses par catégorie");
  categories.columns = [
    { header: "Catégorie (devise)", key: "category", width: 36 },
    { header: "Nombre d’opérations", key: "count", width: 22 },
    { header: "Total payé", key: "total", width: 20 },
  ];
  categories.addRows(report.paidExpensesByCategory.map((item) => ({
    ...item,
    total: amount(item.total),
  })));
  styleTable(categories, "C");
  categories.getColumn("total").numFmt = "#,##0.00";

  const sources = workbook.addWorksheet("Recettes par source");
  sources.columns = [
    { header: "Source (devise)", key: "source", width: 40 },
    { header: "Recettes encaissées", key: "total", width: 22 },
  ];
  sources.addRows(Object.entries(report.incomeBySource).map(([source, total]) => ({
    source,
    total: amount(total),
  })));
  styleTable(sources, "B");
  sources.getColumn("total").numFmt = "#,##0.00";

  const metadata = workbook.addWorksheet("Périmètre");
  metadata.addRows([
    ["Rapport", `Synthèse financière - ${report.period.name}`],
    ["Période", `${report.period.startsAt.toISOString()} – ${report.period.endsAt.toISOString()}`],
    ["Statut de l’exercice", report.period.status],
    ["Date de génération", generatedAt()],
    ["Filtres", `Exercice : ${report.period.name}`],
    ["Budgets enregistrés", report.counts.budgets],
    ["Recettes enregistrées (tous statuts)", report.counts.incomes],
    ["Dépenses enregistrées (tous statuts)", report.counts.expenses],
    ["Dépenses en attente", report.counts.expensesPending],
    ["Constats CCE ouverts", report.cceFindings.open],
    ["Constats CCE en cours", report.cceFindings.inProgress],
    ["Constats CCE traités", report.cceFindings.treated],
    ["Constats CCE clôturés", report.cceFindings.closed],
    ["Note", "Soldes calculés à partir des opérations enregistrées ; ils ne constituent pas un solde bancaire certifié."],
  ]);
  metadata.getColumn(1).width = 38;
  metadata.getColumn(2).width = 90;
  metadata.getColumn(1).font = { bold: true };
  metadata.eachRow((row) => { row.alignment = { vertical: "top", wrapText: true }; });

  return Buffer.from(await workbook.xlsx.writeBuffer());
}

function styleTable(sheet: ExcelJS.Worksheet, lastColumn: string) {
  sheet.autoFilter = { from: "A1", to: `${lastColumn}1` };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF155E4A" } };
}

export async function createFinancePdf(report: FinanceReport) {
  const document = new PDFDocument({ size: "A4", margin: 42, bufferPages: true, info: { Title: `Synthèse financière ONG-BK - ${report.period.name}`, Author: "ONG-BK" } });
  const chunks: Buffer[] = [];
  const result = new Promise<Buffer>((resolve, reject) => {
    document.on("data", (chunk: Buffer) => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);
  });
  const pageWidth = document.page.width - document.page.margins.left - document.page.margins.right;
  let y = document.page.margins.top;

  const addTitle = () => {
    document.font("Helvetica-Bold").fontSize(19).fillColor("#155e4a").text("ONG-BK · Rapport financier", { width: pageWidth });
    document.moveDown(0.4);
    document.font("Helvetica-Bold").fontSize(13).fillColor("#1f2933").text(report.period.name);
    document.font("Helvetica").fontSize(9).fillColor("#515b63")
      .text(`Période : ${report.period.startsAt.toLocaleDateString("fr-FR")} – ${report.period.endsAt.toLocaleDateString("fr-FR")} · Statut : ${report.period.status}`);
    document.moveDown(0.3);
    document.fontSize(8).text(`Généré le ${new Date().toLocaleString("fr-FR")} · Filtre : exercice ${report.period.name}`);
    document.moveDown(0.6);
    y = document.y;
  };

  const section = (title: string, headers: string[], rows: string[][]) => {
    const widths = headers.map(() => pageWidth / headers.length);
    const renderHeader = () => {
      document.font("Helvetica-Bold").fontSize(8).fillColor("#155e4a");
      headers.forEach((header, index) => document.text(header, document.page.margins.left + widths.slice(0, index).reduce((a, b) => a + b, 0), y, { width: widths[index] - 5, height: 24 }));
      y += 22;
      document.moveTo(document.page.margins.left, y).lineTo(document.page.width - document.page.margins.right, y).strokeColor("#d8dedb").stroke();
      y += 5;
    };
    if (y > document.page.height - 100) {
      document.addPage();
      y = document.page.margins.top;
    }
    document.font("Helvetica-Bold").fontSize(11).fillColor("#1f2933").text(title, document.page.margins.left, y);
    y = document.y + 7;
    renderHeader();
    for (const row of rows) {
      const cells = row.map((cell, index) => ({
        text: cell,
        x: document.page.margins.left + widths.slice(0, index).reduce((a, b) => a + b, 0),
        width: widths[index] - 5,
      }));
      document.fontSize(8);
      const height = Math.max(14, ...cells.map((cell) => document.heightOfString(cell.text, { width: cell.width }))) + 5;
      if (y + height > document.page.height - document.page.margins.bottom - 35) {
        document.addPage();
        y = document.page.margins.top;
        renderHeader();
      }
      document.font("Helvetica").fontSize(8).fillColor("#252c30");
      for (const cell of cells) document.text(cell.text, cell.x, y, { width: cell.width, height: height - 2 });
      y += height;
    }
    y += 12;
  };

  addTitle();
  section("Synthèse par devise", ["Devise", "Budget révisé", "Recettes", "Dépenses", "Solde net", "Solde budget"], report.summary.map((item) => [
    item.currency,
    item.budgetRevised,
    item.incomeReceived,
    item.expensesPaid,
    item.operatingBalance,
    item.budgetRemaining,
  ]));
  section("Dépenses payées par catégorie", ["Catégorie", "Opérations", "Total"], report.paidExpensesByCategory.map((item) => [item.category, String(item.count), item.total]));
  section("Recettes encaissées par source", ["Source", "Total"], Object.entries(report.incomeBySource).map(([source, total]) => [source, total]));
  section("Évolution mensuelle", ["Mois", "Devise", "Recettes", "Dépenses"], report.monthly.flatMap((month) => month.totals.map((total) => [
    month.month,
    total.currency,
    total.income,
    total.expenses,
  ])));
  section("Suivi", ["Indicateur", "Nombre"], [
    ["Budgets enregistrés", String(report.counts.budgets)],
    ["Recettes enregistrées (tous statuts)", String(report.counts.incomes)],
    ["Dépenses enregistrées (tous statuts)", String(report.counts.expenses)],
    ["Dépenses en attente", String(report.counts.expensesPending)],
    ["Constats CCE ouverts / en cours / traités / clôturés", `${report.cceFindings.open} / ${report.cceFindings.inProgress} / ${report.cceFindings.treated} / ${report.cceFindings.closed}`],
  ]);

  const pages = document.bufferedPageRange();
  for (let page = 0; page < pages.count; page += 1) {
    document.switchToPage(pages.start + page);
    const footerY = document.page.height - 28;
    document.font("Helvetica").fontSize(8).fillColor("#64706c")
      .text("CONFIDENTIEL · Document de travail · Le solde calculé n’est pas un solde bancaire certifié.", document.page.margins.left, footerY, { width: pageWidth - 55, lineBreak: false });
    document.text(`${page + 1} / ${pages.count}`, document.page.width - document.page.margins.right - 45, footerY, { width: 45, align: "right", lineBreak: false });
  }
  document.end();
  return result;
}
