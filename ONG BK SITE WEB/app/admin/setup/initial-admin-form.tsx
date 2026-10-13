"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

export function InitialAdminForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/auth/bootstrap-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setupSecret: data.get("setupSecret"),
          email: data.get("email"),
          firstName: data.get("firstName"),
          lastName: data.get("lastName"),
          password: data.get("password"),
          confirmPassword: data.get("confirmPassword"),
        }),
      });
      const result = (await response.json()) as { error?: string; redirectTo?: string };
      if (!response.ok || !result.redirectTo) {
        setError(result.error ?? "La création du compte n’a pas abouti.");
        return;
      }
      window.location.assign(result.redirectTo);
    } catch {
      setError("Le service de création du compte est momentanément indisponible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="mt-7 grid gap-5" onSubmit={submit}>
      <label className="form-label">
        Code de configuration du serveur
        <input
          autoComplete="off"
          className="form-input"
          maxLength={256}
          minLength={32}
          name="setupSecret"
          required
          type="password"
        />
        <span className="mt-1 block text-xs font-normal text-ink/55">
          Valeur définie dans `ADMIN_SETUP_SECRET` sur le serveur.
        </span>
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="form-label">
          Prénom
          <input autoComplete="given-name" className="form-input" maxLength={100} name="firstName" required />
        </label>
        <label className="form-label">
          Nom
          <input autoComplete="family-name" className="form-input" maxLength={100} name="lastName" required />
        </label>
      </div>
      <label className="form-label">
        Adresse e-mail
        <input
          autoComplete="email"
          className="form-input"
          maxLength={254}
          name="email"
          required
          type="email"
        />
      </label>
      <label className="form-label">
        Mot de passe (12 caractères minimum)
        <input
          autoComplete="new-password"
          className="form-input"
          maxLength={72}
          minLength={12}
          name="password"
          required
          type="password"
        />
      </label>
      <label className="form-label">
        Confirmer le mot de passe
        <input
          autoComplete="new-password"
          className="form-input"
          maxLength={72}
          minLength={12}
          name="confirmPassword"
          required
          type="password"
        />
      </label>
      {error && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}
      <Button disabled={busy} size="lg" type="submit">
        {busy ? "Création du compte…" : "Créer le compte et ouvrir la session"}
      </Button>
      <p className="text-xs leading-5 text-ink/55">
        Le code de configuration et le mot de passe ne sont jamais affichés après l’envoi.
      </p>
    </form>
  );
}
