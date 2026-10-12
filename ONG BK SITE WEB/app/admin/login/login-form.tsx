"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

export function LoginForm({ resetSuccess }: { resetSuccess: boolean }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          password: data.get("password"),
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        redirectTo?: string;
      };
      if (!response.ok || !result.redirectTo) {
        setError(result.error ?? "Connexion impossible. Réessayez.");
        return;
      }
      window.location.assign(result.redirectTo);
    } catch {
      setError("Le service de connexion est momentanément indisponible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="mt-7 grid gap-5" onSubmit={submit}>
      {resetSuccess && (
        <p className="rounded-xl bg-[#edf3e8] p-3 text-sm text-forest" role="status">
          Mot de passe modifié. Vous pouvez vous connecter.
        </p>
      )}
      <label className="form-label">
        Adresse e-mail
        <input
          autoComplete="username"
          className="form-input"
          maxLength={254}
          name="email"
          required
          type="email"
        />
      </label>
      <label className="form-label">
        Mot de passe
        <input
          autoComplete="current-password"
          className="form-input"
          maxLength={72}
          name="password"
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
        {busy ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
