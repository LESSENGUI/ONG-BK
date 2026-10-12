"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Period = { id: string; name: string; status: "OPEN" | "CLOSED" | "ARCHIVED"; startsAt: string; endsAt: string };
type Budget = { id: string; reference: string; category: string; initialAmount: string; revisedAmount: string; currency: string; status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "ARCHIVED" };
type Income = { id: string; reference: string; amount: string; currency: string; source: string; status: "EXPECTED" | "COMMITTED" | "RECEIVED" | "VERIFIED" | "CANCELLED" | "REVERSED" };
type Expense = { id: string; reference: string; amount: string; currency: string; purpose: string; status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "PAID" | "CANCELLED" | "ARCHIVED" };

const expenseTransitions: Record<Expense["status"], Expense["status"][]> = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["UNDER_REVIEW", "CANCELLED"],
  UNDER_REVIEW: ["PENDING_APPROVAL", "REJECTED", "CANCELLED"],
  PENDING_APPROVAL: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["PAID", "CANCELLED"],
  REJECTED: ["ARCHIVED"],
  PAID: ["ARCHIVED"],
  CANCELLED: ["ARCHIVED"],
  ARCHIVED: [],
};

const budgetTransitions: Record<Budget["status"], Budget["status"][]> = {
  DRAFT: ["SUBMITTED", "ARCHIVED"],
  SUBMITTED: ["APPROVED", "REJECTED"],
  APPROVED: ["ARCHIVED"],
  REJECTED: ["DRAFT", "ARCHIVED"],
  ARCHIVED: [],
};

const inputClass = "mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink";
const labelClass = "block text-sm font-semibold text-ink";

export function FinanceOperations({
  userId,
  canCreate,
  canUpdate,
  canApprove,
  canArchive,
}: {
  userId: string;
  canCreate: boolean;
  canUpdate: boolean;
  canApprove: boolean;
  canArchive: boolean;
}) {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [periodId, setPeriodId] = useState("");
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (selectedPeriodId: string) => {
    const periodsResponse = await fetch("/api/admin/finance/periods", { cache: "no-store" });
    if (!periodsResponse.ok) throw new Error("Impossible de charger les exercices financiers.");
    const periodList = (await periodsResponse.json()) as Period[];
    setPeriods(periodList);
    const activePeriodId = selectedPeriodId || periodList.find((period) => period.status === "OPEN")?.id || "";
    if (!selectedPeriodId && activePeriodId) setPeriodId(activePeriodId);
    if (!activePeriodId) {
      setBudgets([]);
      setIncomes([]);
      setExpenses([]);
      return;
    }
    const query = `?periodId=${encodeURIComponent(activePeriodId)}`;
    const [budgetResponse, incomeResponse, expenseResponse] = await Promise.all([
      fetch(`/api/admin/finance/budgets${query}`, { cache: "no-store" }),
      fetch(`/api/admin/finance/incomes${query}`, { cache: "no-store" }),
      fetch(`/api/admin/finance/expenses${query}`, { cache: "no-store" }),
    ]);
    if (!budgetResponse.ok || !incomeResponse.ok || !expenseResponse.ok) {
      throw new Error("Impossible de charger les registres de l’exercice sélectionné.");
    }
    setBudgets((await budgetResponse.json()) as Budget[]);
    setIncomes((await incomeResponse.json()) as Income[]);
    setExpenses((await expenseResponse.json()) as Expense[]);
  }, []);

  useEffect(() => {
    void load(periodId).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Erreur de chargement."));
  }, [load, periodId]);

  async function createRecord(event: FormEvent<HTMLFormElement>, endpoint: string, label: string) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload: Record<string, string> = {};
    formData.forEach((value, key) => {
      payload[key] = String(value);
    });
    if (endpoint !== "/api/admin/finance/periods") payload.periodId = periodId;
    if (typeof payload.startsAt === "string") payload.startsAt = new Date(payload.startsAt).toISOString();
    if (typeof payload.endsAt === "string") payload.endsAt = new Date(payload.endsAt).toISOString();
    if (typeof payload.date === "string") payload.date = new Date(payload.date).toISOString();
    if (typeof payload.status === "string" && payload.status === "") delete payload.status;
    await send(endpoint, payload, label, form);
  }

  async function send(
    endpoint: string,
    payload: Record<string, string>,
    success: string,
    form?: HTMLFormElement,
  ) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "La demande a échoué.");
      form?.reset();
      await load(periodId);
      setNotice(success);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  }

  async function transition(
    endpoint: string,
    payload: Record<string, string>,
    success: string,
  ) {
    await send(endpoint, payload, success);
  }

  async function transitionExpense(expense: Expense, status: Expense["status"]) {
    const note = window.prompt("Note à conserver dans l’historique de cette dépense.", "Mise à jour de traitement.");
    if (!note) return;
    const payload: Record<string, string> = { transition: status, note };
    if (status === "PAID") {
      const paymentMethod = window.prompt("Mode de paiement.");
      if (!paymentMethod) return;
      const receiptKey = window.prompt("Identifiant du document justificatif privé.");
      if (!receiptKey) return;
      payload.paymentMethod = paymentMethod;
      payload.receiptKey = receiptKey;
    }
    await transition(`/api/admin/finance/expenses/${encodeURIComponent(expense.id)}/transition`, payload, "Statut de dépense mis à jour.");
  }

  async function transitionIncome(income: Income, status: "RECEIVED" | "VERIFIED" | "CANCELLED" | "REVERSED") {
    const note = window.prompt("Note à conserver dans l’historique de cette recette.", "Mise à jour de traitement.");
    if (!note) return;
    const payload: Record<string, string> = { status, note };
    if (status === "RECEIVED") {
      const paymentMethod = window.prompt("Mode de paiement.");
      if (!paymentMethod) return;
      const receiptKey = window.prompt("Identifiant du document justificatif privé.");
      if (!receiptKey) return;
      payload.paymentMethod = paymentMethod;
      payload.receiptKey = receiptKey;
    }
    await transition(`/api/admin/finance/incomes/${encodeURIComponent(income.id)}/transition`, payload, "Statut de recette mis à jour.");
  }

  async function transitionBudget(budget: Budget, status: Budget["status"]) {
    const note = window.prompt("Motif à conserver dans l’historique du budget.", "Mise à jour de traitement.");
    if (!note) return;
    await transition(`/api/admin/finance/budgets/${encodeURIComponent(budget.id)}/transition`, { status, note }, "Statut du budget mis à jour.");
  }

  async function transitionPeriod(period: Period, status: "CLOSED" | "ARCHIVED") {
    const note = window.prompt("Motif à conserver dans l’historique de l’exercice.", "Mise à jour de traitement.");
    if (!note) return;
    await transition(`/api/admin/finance/periods/${encodeURIComponent(period.id)}/transition`, { status, note }, "Statut de l’exercice mis à jour.");
  }

  return (
    <section className="mt-8 rounded-3xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="font-display text-2xl font-bold text-ink">Saisie et suivi des opérations</h2>
      <p className="mt-2 text-sm leading-6 text-ink/60">
        Toute écriture de recette ou dépense doit s’appuyer sur des justificatifs privés. Les changements de statut demandent une note d’historique.
      </p>
      {error && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p>}
      {notice && <p className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-900" role="status">{notice}</p>}

      <label className="mt-6 block max-w-xl text-sm font-semibold text-ink">
        Exercice des registres
        <select className={inputClass} value={periodId} onChange={(event) => setPeriodId(event.target.value)}>
          <option value="">Aucun exercice disponible</option>
          {periods.map((period) => <option key={period.id} value={period.id}>{period.name} · {period.status}</option>)}
        </select>
      </label>

      {canCreate && (
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          <details className="rounded-2xl border border-ink/10 p-5">
            <summary className="cursor-pointer font-semibold text-ink">Créer un exercice financier</summary>
            <form className="mt-4 grid gap-3" onSubmit={(event) => void createRecord(event, "/api/admin/finance/periods", "Exercice créé.")}>
              <label className={labelClass}>Nom<input className={inputClass} name="name" required minLength={3} maxLength={120} /></label>
              <label className={labelClass}>Début<input className={inputClass} name="startsAt" type="datetime-local" required /></label>
              <label className={labelClass}>Fin<input className={inputClass} name="endsAt" type="datetime-local" required /></label>
              <input name="responsibleId" type="hidden" value={userId} />
              <button className="rounded-xl bg-forest px-4 py-3 text-sm font-bold text-white disabled:opacity-50" disabled={busy}>Créer l’exercice</button>
            </form>
          </details>
          <details className="rounded-2xl border border-ink/10 p-5" open={Boolean(periodId)}>
            <summary className="cursor-pointer font-semibold text-ink">Créer une ligne budgétaire</summary>
            <form className="mt-4 grid gap-3" onSubmit={(event) => void createRecord(event, "/api/admin/finance/budgets", "Budget enregistré en brouillon.")}>
              <label className={labelClass}>Catégorie<input className={inputClass} name="category" required minLength={2} maxLength={120} /></label>
              <label className={labelClass}>Domaine d’intervention<input className={inputClass} name="domain" required minLength={2} maxLength={120} /></label>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className={labelClass}>Budget initial<input className={inputClass} name="initialAmount" inputMode="decimal" required pattern="(?:0|[1-9][0-9]*)(?:[.][0-9]{1,2})?" /></label>
                <label className={labelClass}>Budget révisé<input className={inputClass} name="revisedAmount" inputMode="decimal" required pattern="(?:0|[1-9][0-9]*)(?:[.][0-9]{1,2})?" /></label>
                <label className={labelClass}>Devise (ISO)<input className={inputClass} name="currency" required pattern="[A-Za-z]{3}" maxLength={3} /></label>
              </div>
              <label className={labelClass}>Justification<textarea className={inputClass} name="justification" required minLength={10} maxLength={4000} rows={3} /></label>
              <label className={labelClass}>Source de financement<input className={inputClass} name="fundingSource" maxLength={240} /></label>
              <button className="rounded-xl bg-forest px-4 py-3 text-sm font-bold text-white disabled:opacity-50" disabled={busy || !periodId}>Enregistrer le budget</button>
            </form>
          </details>
          <details className="rounded-2xl border border-ink/10 p-5" open={Boolean(periodId)}>
            <summary className="cursor-pointer font-semibold text-ink">Enregistrer une recette</summary>
            <form className="mt-4 grid gap-3" onSubmit={(event) => void createRecord(event, "/api/admin/finance/incomes", "Recette enregistrée.")}>
              <label className={labelClass}>Date<input className={inputClass} name="date" type="datetime-local" required /></label>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className={labelClass}>Montant<input className={inputClass} name="amount" inputMode="decimal" required pattern="(?:0|[1-9][0-9]*)(?:[.][0-9]{1,2})?" /></label>
                <label className={labelClass}>Devise (ISO)<input className={inputClass} name="currency" required pattern="[A-Za-z]{3}" maxLength={3} /></label>
                <label className={labelClass}>Statut initial<select className={inputClass} name="status" required defaultValue="EXPECTED"><option value="EXPECTED">Attendue</option><option value="COMMITTED">Engagée</option></select></label>
              </div>
              <label className={labelClass}>Catégorie<select className={inputClass} name="category" required><option value="MEMBERSHIP_DUES">Cotisation</option><option value="DONATION">Don</option><option value="GRANT">Subvention</option><option value="PARTNERSHIP">Partenariat</option><option value="EVENT">Événement</option><option value="SPONSORSHIP">Mécénat</option><option value="OTHER">Autre</option></select></label>
              <label className={labelClass}>Source<input className={inputClass} name="source" required minLength={2} maxLength={240} /></label>
              <button className="rounded-xl bg-forest px-4 py-3 text-sm font-bold text-white disabled:opacity-50" disabled={busy || !periodId}>Enregistrer la recette</button>
            </form>
          </details>
          <details className="rounded-2xl border border-ink/10 p-5" open={Boolean(periodId)}>
            <summary className="cursor-pointer font-semibold text-ink">Créer une demande de dépense</summary>
            <form className="mt-4 grid gap-3" onSubmit={(event) => void createRecord(event, "/api/admin/finance/expenses", "Demande de dépense enregistrée en brouillon.")}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={labelClass}>Montant<input className={inputClass} name="amount" inputMode="decimal" required pattern="(?:0|[1-9][0-9]*)(?:[.][0-9]{1,2})?" /></label>
                <label className={labelClass}>Devise (ISO)<input className={inputClass} name="currency" required pattern="[A-Za-z]{3}" maxLength={3} /></label>
              </div>
              <label className={labelClass}>Catégorie<input className={inputClass} name="category" required minLength={2} maxLength={120} /></label>
              <label className={labelClass}>Motif<textarea className={inputClass} name="purpose" required minLength={10} maxLength={2000} rows={3} /></label>
              <label className={labelClass}>Bénéficiaire<input className={inputClass} name="beneficiary" maxLength={240} /></label>
              <button className="rounded-xl bg-forest px-4 py-3 text-sm font-bold text-white disabled:opacity-50" disabled={busy || !periodId}>Créer la demande</button>
            </form>
          </details>
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <DataList title="Budgets" empty={!budgets.length}>
          {budgets.map((budget) => (
            <Record key={budget.id} title={`${budget.reference} · ${budget.category}`} detail={`${budget.initialAmount} → ${budget.revisedAmount} ${budget.currency}`} status={budget.status}>
              {budgetTransitions[budget.status].filter((status) =>
                status === "APPROVED" || status === "REJECTED" ? canApprove : status === "ARCHIVED" ? canArchive : canUpdate,
              ).map((status) => <button className="rounded-lg border border-ink/15 px-3 py-2 text-xs font-semibold" key={status} onClick={() => void transitionBudget(budget, status)}>{budgetLabel(status)}</button>)}
            </Record>
          ))}
        </DataList>
        <DataList title="Recettes" empty={!incomes.length}>
          {incomes.map((income) => (
            <Record key={income.id} title={`${income.reference} · ${income.source}`} detail={`${income.amount} ${income.currency}`} status={income.status}>
              {["EXPECTED", "COMMITTED"].includes(income.status) && canUpdate && <button className="rounded-lg border border-ink/15 px-3 py-2 text-xs font-semibold" onClick={() => void transitionIncome(income, "RECEIVED")}>Marquer encaissée…</button>}
              {income.status === "EXPECTED" && canUpdate && <button className="rounded-lg border border-ink/15 px-3 py-2 text-xs font-semibold" onClick={() => void transitionIncome(income, "CANCELLED")}>Annuler…</button>}
              {income.status === "RECEIVED" && canApprove && <button className="rounded-lg border border-ink/15 px-3 py-2 text-xs font-semibold" onClick={() => void transitionIncome(income, "VERIFIED")}>Vérifier…</button>}
            </Record>
          ))}
        </DataList>
        <DataList title="Dépenses" empty={!expenses.length}>
          {expenses.map((expense) => (
            <Record key={expense.id} title={`${expense.reference} · ${expense.purpose}`} detail={`${expense.amount} ${expense.currency}`} status={expense.status}>
              {expenseTransitions[expense.status].filter((status) =>
                status === "APPROVED" || status === "REJECTED" ? canApprove : status === "PAID" ? canCreate : status === "ARCHIVED" ? canArchive : canUpdate,
              ).map((status) => <button className="rounded-lg border border-ink/15 px-3 py-2 text-xs font-semibold" key={status} onClick={() => void transitionExpense(expense, status)}>{expenseLabel(status)}</button>)}
            </Record>
          ))}
        </DataList>
        <DataList title="Exercices" empty={!periods.length}>
          {periods.map((period) => (
            <Record key={period.id} title={period.name} detail={`${new Date(period.startsAt).toLocaleDateString("fr-FR")} – ${new Date(period.endsAt).toLocaleDateString("fr-FR")}`} status={period.status}>
              {period.status === "OPEN" && canApprove && <button className="rounded-lg border border-ink/15 px-3 py-2 text-xs font-semibold" onClick={() => void transitionPeriod(period, "CLOSED")}>Clôturer…</button>}
              {period.status === "CLOSED" && canArchive && <button className="rounded-lg border border-ink/15 px-3 py-2 text-xs font-semibold" onClick={() => void transitionPeriod(period, "ARCHIVED")}>Archiver…</button>}
            </Record>
          ))}
        </DataList>
      </div>
    </section>
  );
}

function DataList({ title, empty, children }: { title: string; empty: boolean; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-ink/10 p-5"><h3 className="font-display text-xl font-bold text-ink">{title}</h3><div className="mt-4 grid gap-3">{empty ? <p className="text-sm text-ink/55">Aucune écriture pour cet exercice.</p> : children}</div></section>;
}

function Record({ title, detail, status, children }: { title: string; detail: string; status: string; children: React.ReactNode }) {
  return <article className="grid gap-3 rounded-xl bg-[#f7f5f1] p-4"><div><p className="break-words text-sm font-semibold text-ink">{title}</p><p className="mt-1 text-xs text-ink/60">{detail} · {status}</p></div><div className="flex flex-wrap gap-2">{children}</div></article>;
}

function budgetLabel(status: Budget["status"]) {
  return ({ SUBMITTED: "Soumettre", APPROVED: "Approuver", REJECTED: "Rejeter", DRAFT: "Réouvrir", ARCHIVED: "Archiver" } as const)[status];
}

function expenseLabel(status: Expense["status"]) {
  return ({
    DRAFT: "Soumettre",
    SUBMITTED: "Soumettre",
    UNDER_REVIEW: "Vérifier",
    PENDING_APPROVAL: "Transmettre",
    APPROVED: "Approuver",
    REJECTED: "Rejeter",
    PAID: "Enregistrer le paiement…",
    CANCELLED: "Annuler",
    ARCHIVED: "Archiver",
  } as const)[status];
}
