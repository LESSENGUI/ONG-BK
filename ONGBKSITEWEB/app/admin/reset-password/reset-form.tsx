"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

export function PasswordResetForm({ token }: { token: string }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/password-reset/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: data.get("password"),
          confirmPassword: data.get("confirmPassword"),
        }),
      });
      const result = (await response.json()) as { error?: string; redirectTo?: string };
      if (!response.ok || !result.redirectTo) {
        setError(result.error ?? "Impossible de modifier le mot de passe.");
        return;
      }
      window.location.assign(result.redirectTo);
    } catch {
      setError("Le service est momentanément indisponible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="mt-6 grid gap-5" onSubmit={submit}>
      <label className="form-label">
        Nouveau mot de passe (12 caractères minimum)
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
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
      <Button disabled={busy} size="lg" type="submit">
        {busy ? "Modification…" : "Modifier le mot de passe"}
      </Button>
    </form>
  );
}
