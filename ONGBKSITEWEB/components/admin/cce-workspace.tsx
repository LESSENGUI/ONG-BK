"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Finding = {
  id: string;
  reference: string;
  title: string;
  observation: string;
  recommendation: string;
  status: "OPEN" | "IN_PROGRESS" | "TREATED" | "CLOSED";
  dueAt: string | null;
  createdAt: string;
  assignee: { email: string; profile: { firstName: string; lastName: string } | null } | null;
  responses: {
    id: string;
    response: string;
    corrective: string;
    createdAt: string;
    author: { email: string; profile: { firstName: string; lastName: string } | null };
  }[];
  history: {
    fromStatus: string | null;
    toStatus: string;
    note: string | null;
    createdAt: string;
    actor: { email: string };
  }[];
};

const statusLabels: Record<Finding["status"], string> = {
  OPEN: "Ouverte",
  IN_PROGRESS: "En cours",
  TREATED: "Traitée",
  CLOSED: "Clôturée",
};

export function CceWorkspace({
  canCreate,
  canUpdate,
  canRespond,
}: {
  canCreate: boolean;
  canUpdate: boolean;
  canRespond: boolean;
}) {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/cce/findings", { cache: "no-store" });
    if (!response.ok) throw new Error("Impossible de charger les recommandations de la CCE.");
    setFindings((await response.json()) as Finding[]);
  }, []);

  useEffect(() => {
    void load().catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Erreur de chargement."));
  }, [load]);

  async function submitForm(
    event: FormEvent<HTMLFormElement>,
    url: string,
    success: string,
  ) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());
    if (typeof payload.dueAt === "string" && payload.dueAt) {
      payload.dueAt = new Date(payload.dueAt).toISOString();
    } else {
      delete payload.dueAt;
    }
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "La demande a échoué.");
      form.reset();
      await load();
      setNotice(success);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(finding: Finding, status: "IN_PROGRESS" | "TREATED" | "CLOSED") {
    const promptText = window.prompt("Ajoutez une note au journal de suivi (minimum 5 caractères).");
    if (!promptText) return;
    const response = await fetch(`/api/admin/cce/findings/${encodeURIComponent(finding.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note: promptText }),
    });
    if (!response.ok) {
      setError("Le changement de statut a échoué.");
      return;
    }
    await load();
  }

  const inputClass = "mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink";

  return (
    <div className="grid gap-6">
      {canCreate && (
        <section className="rounded-3xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-2xl font-bold text-ink">Nouveau constat et recommandation</h2>
          <form className="mt-5 grid gap-4" onSubmit={(event) => void submitForm(event, "/api/admin/cce/findings", "Constat enregistré dans l’historique.")}>
            <label className="text-sm font-semibold text-ink">Titre<input className={inputClass} name="title" required minLength={3} maxLength={240} /></label>
            <label className="text-sm font-semibold text-ink">Constat / observation<textarea className={inputClass} name="observation" required minLength={10} maxLength={5000} rows={4} /></label>
            <label className="text-sm font-semibold text-ink">Recommandation<textarea className={inputClass} name="recommendation" required minLength={10} maxLength={5000} rows={4} /></label>
            <label className="text-sm font-semibold text-ink">Échéance<input className={inputClass} name="dueAt" type="datetime-local" /></label>
            <button className="justify-self-start rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white disabled:opacity-50" disabled={busy}>Enregistrer</button>
          </form>
        </section>
      )}

      {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p>}
      {notice && <p className="rounded-xl bg-green-50 p-4 text-sm text-green-900" role="status">{notice}</p>}
      {findings.length === 0 && <p className="rounded-2xl border border-ink/10 bg-white p-6 text-sm text-ink/60">Aucun constat enregistré.</p>}

      {findings.map((finding) => (
        <article className="rounded-3xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8" key={finding.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-forest">{finding.reference} · {statusLabels[finding.status]}</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-ink">{finding.title}</h2>
            </div>
            {finding.dueAt && <p className="text-sm text-ink/60">Échéance : {new Date(finding.dueAt).toLocaleDateString("fr-FR")}</p>}
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-[#f7f5f1] p-5"><h3 className="font-semibold text-ink">Constat de la CCE</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink/75">{finding.observation}</p></div>
            <div className="rounded-2xl bg-[#f7f5f1] p-5"><h3 className="font-semibold text-ink">Recommandation</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink/75">{finding.recommendation}</p></div>
          </div>

          <section className="mt-6">
            <h3 className="font-semibold text-ink">Réponses du Bureau exécutif</h3>
            <div className="mt-3 grid gap-3">
              {finding.responses.map((response) => (
                <div className="rounded-2xl border border-ink/10 p-4" key={response.id}>
                  <p className="text-xs text-ink/50">{response.author.profile ? `${response.author.profile.firstName} ${response.author.profile.lastName}` : response.author.email} · {new Date(response.createdAt).toLocaleString("fr-FR")}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink/75">{response.response}</p>
                  {response.corrective && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink/75"><strong>Mesures correctives :</strong> {response.corrective}</p>}
                </div>
              ))}
              {finding.responses.length === 0 && <p className="text-sm text-ink/55">Aucune réponse du BE enregistrée.</p>}
            </div>
            {canRespond && finding.status !== "CLOSED" && (
              <form className="mt-4 grid gap-3 rounded-2xl bg-[#f7f5f1] p-4" onSubmit={(event) => void submitForm(event, `/api/admin/cce/findings/${encodeURIComponent(finding.id)}/responses`, "Réponse du Bureau exécutif enregistrée séparément.")}>
                <label className="text-sm font-semibold text-ink">Réponse du BE<textarea className={inputClass} name="response" required minLength={5} maxLength={5000} rows={3} /></label>
                <label className="text-sm font-semibold text-ink">Mesures correctives proposées<textarea className={inputClass} name="corrective" maxLength={5000} rows={3} /></label>
                <button className="justify-self-start rounded-xl bg-ink px-4 py-2 text-sm font-bold text-white disabled:opacity-50" disabled={busy}>Enregistrer la réponse</button>
              </form>
            )}
          </section>

          {canUpdate && finding.status !== "CLOSED" && (
            <div className="mt-5 flex flex-wrap gap-2">
              {finding.status === "OPEN" && <button className="rounded-lg border border-ink/15 px-3 py-2 text-sm font-semibold" onClick={() => void updateStatus(finding, "IN_PROGRESS")}>Démarrer le suivi</button>}
              {finding.status === "IN_PROGRESS" && <button className="rounded-lg border border-ink/15 px-3 py-2 text-sm font-semibold" onClick={() => void updateStatus(finding, "TREATED")}>Marquer traitée</button>}
              {finding.status === "TREATED" && <button className="rounded-lg border border-ink/15 px-3 py-2 text-sm font-semibold" onClick={() => void updateStatus(finding, "CLOSED")}>Clôturer le suivi</button>}
            </div>
          )}
          <details className="mt-5">
            <summary className="cursor-pointer text-sm font-semibold text-ink">Historique non modifiable ({finding.history.length})</summary>
            <ul className="mt-3 grid gap-2">
              {finding.history.map((event, index) => <li className="text-sm leading-6 text-ink/65" key={`${event.createdAt}-${index}`}>{new Date(event.createdAt).toLocaleString("fr-FR")} · {event.actor.email} · {event.fromStatus ? `${statusLabels[event.fromStatus as Finding["status"]]} → ` : ""}{statusLabels[event.toStatus as Finding["status"]]} — {event.note}</li>)}
            </ul>
          </details>
        </article>
      ))}
    </div>
  );
}
