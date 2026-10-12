"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

type Values = {
  siteName: string;
  contactEmail: string;
  defaultLocale: "fr";
  timeZone: string;
};

export function SystemSettingsForm({
  initialValues,
  canUpdate,
}: {
  initialValues: Values;
  canUpdate: boolean;
}) {
  const [values, setValues] = useState(initialValues);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Les paramètres n’ont pas pu être enregistrés.");
        return;
      }
      setMessage("Paramètres enregistrés.");
    } catch {
      setError("Le service est momentanément indisponible.");
    } finally {
      setBusy(false);
    }
  }

  const update = (field: keyof Values, value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  return (
    <form
      className="mt-7 grid gap-5 rounded-2xl border border-ink/[0.07] bg-white p-6 shadow-sm"
      onSubmit={submit}
    >
      <label className="form-label">
        Nom du site
        <input className="form-input" disabled={!canUpdate} maxLength={120} onChange={(event) => update("siteName", event.target.value)} required value={values.siteName} />
      </label>
      <label className="form-label">
        Adresse de contact
        <input className="form-input" disabled={!canUpdate} maxLength={254} onChange={(event) => update("contactEmail", event.target.value)} type="email" value={values.contactEmail} />
      </label>
      <label className="form-label">
        Fuseau horaire
        <input className="form-input" disabled={!canUpdate} maxLength={80} onChange={(event) => update("timeZone", event.target.value)} required value={values.timeZone} />
      </label>
      <label className="form-label">
        Langue
        <input className="form-input" disabled readOnly value="Français" />
      </label>
      {message && <p className="text-sm text-forest" role="status">{message}</p>}
      {error && <p className="text-sm text-red-800" role="alert">{error}</p>}
      {canUpdate && (
        <Button disabled={busy} type="submit">
          {busy ? "Enregistrement…" : "Enregistrer"}
        </Button>
      )}
    </form>
  );
}
