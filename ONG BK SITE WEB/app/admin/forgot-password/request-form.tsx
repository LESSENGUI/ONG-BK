"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

export function PasswordResetRequestForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.get("email") }),
      });
      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        setError(result.error ?? "La demande n’a pas pu aboutir.");
        return;
      }
      setMessage(result.message ?? "Si le compte existe, un lien sera envoyé.");
    } catch {
      setError("Le service de récupération est momentanément indisponible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="mt-7 grid gap-5" onSubmit={submit}>
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
      {message && <p className="rounded-xl bg-[#edf3e8] p-3 text-sm text-forest" role="status">{message}</p>}
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
      <Button disabled={busy} size="lg" type="submit">
        {busy ? "Envoi…" : "Envoyer le lien"}
      </Button>
    </form>
  );
}
