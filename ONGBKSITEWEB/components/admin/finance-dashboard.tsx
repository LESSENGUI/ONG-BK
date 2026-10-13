"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Summary = {
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

type Report = {
  period: { id: string; name: string; startsAt: string; endsAt: string; status: string };
  summary: Summary[];
  counts: { budgets: number; incomes: number; expenses: number; expensesPending: number };
  paidExpensesByCategory: { category: string; count: number; total: string }[];
  incomeBySource: Record<string, string>;
  cceFindings: { open: number; inProgress: number; treated: number; closed: number };
  monthly: { month: string; totals: { currency: string; income: string; expenses: string }[] }[];
};

type Dashboard = {
  periods: Report["period"][];
  reports: Report[];
  generatedAt: string;
  source: string;
};

const palette = ["#155e4a", "#c98243", "#6d8a62", "#aa5747", "#a39b76", "#487d8c"];
const money = (amount: string, currency: string) =>
  `${new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(amount))} ${currency}`;

export function FinanceDashboard({ canExport }: { canExport: boolean }) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [periodId, setPeriodId] = useState("");
  const [currency, setCurrency] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async (selectedPeriod: string) => {
    const query = selectedPeriod ? `?periodId=${encodeURIComponent(selectedPeriod)}` : "";
    const response = await fetch(`/api/admin/finance${query}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Les données financières ne sont pas accessibles.");
    const result = (await response.json()) as Dashboard;
    setDashboard(result);
    setCurrency((current) => result.reports[0]?.summary.some((item) => item.currency === current)
      ? current
      : result.reports[0]?.summary[0]?.currency ?? "");
  }, []);

  useEffect(() => {
    void load(periodId).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Erreur de chargement."));
  }, [load, periodId]);

  const report = dashboard?.reports[0];
  const selectedSummary = report?.summary.find((item) => item.currency === currency);
  const categoryData = useMemo(() => (report?.paidExpensesByCategory ?? [])
    .filter((item) => item.category.endsWith(`(${currency})`))
    .map((item) => ({ ...item, amount: Number(item.total) })), [currency, report]);
  const sourceData = useMemo(() => Object.entries(report?.incomeBySource ?? {})
    .filter(([source]) => source.endsWith(`(${currency})`))
    .map(([source, amount]) => ({ source: source.replace(` (${currency})`, ""), amount: Number(amount) })), [currency, report]);
  const monthlyData = useMemo(() => (report?.monthly ?? []).map((month) => {
    const value = month.totals.find((item) => item.currency === currency);
    return {
      mois: month.month,
      recettes: Number(value?.income ?? "0"),
      dépenses: Number(value?.expenses ?? "0"),
    };
  }), [currency, report]);

  if (error) return <p className="rounded-2xl bg-red-50 p-5 text-sm text-red-800" role="alert">{error}</p>;
  if (!dashboard) return <p className="text-sm text-ink/60">Chargement des données financières…</p>;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-ink/10 bg-white p-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-ink">
            Exercice
            <select className="mt-2 block w-full rounded-xl border border-ink/15 bg-white px-4 py-3" value={periodId} onChange={(event) => setPeriodId(event.target.value)}>
              <option value="">Exercice le plus récent</option>
              {dashboard.periods.map((period) => <option key={period.id} value={period.id}>{period.name}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-ink">
            Devise (affichée séparément)
            <select className="mt-2 block w-full rounded-xl border border-ink/15 bg-white px-4 py-3" value={currency} onChange={(event) => setCurrency(event.target.value)}>
              {(report?.summary ?? []).map((item) => <option key={item.currency} value={item.currency}>{item.currency}</option>)}
            </select>
          </label>
        </div>
        {canExport && (
          <div className="flex flex-wrap gap-2">
            {(["csv", "xlsx", "pdf"] as const).map((format) => (
              <a
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-forest px-4 text-sm font-bold text-white"
                href={`/api/admin/finance?format=${format}${periodId ? `&periodId=${encodeURIComponent(periodId)}` : ""}`}
                key={format}
              >
                Exporter {format.toUpperCase()}
              </a>
            ))}
          </div>
        )}
      </div>

      {!report && <div className="rounded-3xl border border-ink/10 bg-white p-8 text-sm text-ink/65">Aucun exercice financier enregistré.</div>}
      {report && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink">{report.period.name}</h2>
              <p className="mt-1 text-sm text-ink/60">
                {new Date(report.period.startsAt).toLocaleDateString("fr-FR")} – {new Date(report.period.endsAt).toLocaleDateString("fr-FR")} · {report.period.status}
              </p>
            </div>
            <p className="text-xs text-ink/50">Généré le {new Date(dashboard.generatedAt).toLocaleString("fr-FR")}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Budget initial" value={selectedSummary ? money(selectedSummary.budgetInitial, currency) : "—"} />
            <Kpi label="Budget révisé" value={selectedSummary ? money(selectedSummary.budgetRevised, currency) : "—"} />
            <Kpi label="Recettes encaissées" value={selectedSummary ? money(selectedSummary.incomeReceived, currency) : "—"} />
            <Kpi label="Dépenses payées" value={selectedSummary ? money(selectedSummary.expensesPaid, currency) : "—"} />
            <Kpi label="Solde net calculé (recettes - dépenses)" value={selectedSummary ? money(selectedSummary.operatingBalance, currency) : "—"} />
            <Kpi label="Engagements impayés" value={selectedSummary ? money(selectedSummary.commitmentsUnpaid, currency) : "—"} />
            <Kpi label="Solde budgétaire calculé" value={selectedSummary ? money(selectedSummary.budgetRemaining, currency) : "—"} />
            <Kpi label="Exécution budgétaire" value={selectedSummary?.executionRate === null || !selectedSummary ? "Non calculable" : `${selectedSummary.executionRate.toLocaleString("fr-FR")} %`} />
            <Kpi label="Dépenses à traiter" value={String(report.counts.expensesPending)} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <ChartCard title={`Recettes et dépenses mensuelles (${currency || "aucune devise"})`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => money(String(value), currency)} />
                  <Bar dataKey="recettes" fill="#155e4a" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="dépenses" fill="#c98243" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Dépenses payées par catégorie">
              {categoryData.length === 0
                ? <EmptyChart />
                : <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} dataKey="amount" nameKey="category" outerRadius={100} label={({ name, percent }) => `${String(name)} ${(Number(percent) * 100).toFixed(0)}%`}>
                        {categoryData.map((item, index) => <Cell key={item.category} fill={palette[index % palette.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => money(String(value), currency)} />
                    </PieChart>
                  </ResponsiveContainer>}
            </ChartCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <DataCard title="Recettes encaissées par source">
              {sourceData.length === 0 ? <EmptyChart /> : sourceData.map((item) => <div className="flex justify-between gap-3 border-b border-ink/10 py-3 text-sm last:border-0" key={item.source}><span>{item.source}</span><strong>{money(String(item.amount), currency)}</strong></div>)}
            </DataCard>
            <DataCard title="Contrôle CCE">
              <div className="grid grid-cols-2 gap-3">
                <Kpi label="Ouvertes" value={String(report.cceFindings.open)} />
                <Kpi label="En cours" value={String(report.cceFindings.inProgress)} />
                <Kpi label="Traitées" value={String(report.cceFindings.treated)} />
                <Kpi label="Clôturées" value={String(report.cceFindings.closed)} />
              </div>
            </DataCard>
          </div>
          <p className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            {dashboard.source} Les données de contrôle CCE affichées couvrent l’ensemble des exercices.
          </p>
        </>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-ink/10 bg-white p-5"><p className="text-sm text-ink/60">{label}</p><p className="mt-3 break-words font-display text-2xl font-bold text-ink">{value}</p></div>;
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-3xl border border-ink/10 bg-white p-5 sm:p-7"><h3 className="font-display text-xl font-bold text-ink">{title}</h3><div className="mt-5 h-72">{children}</div></section>;
}

function DataCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-3xl border border-ink/10 bg-white p-5 sm:p-7"><h3 className="font-display text-xl font-bold text-ink">{title}</h3><div className="mt-4">{children}</div></section>;
}

function EmptyChart() {
  return <p className="grid h-full place-items-center text-center text-sm text-ink/55">Aucune donnée enregistrée pour cette sélection.</p>;
}
