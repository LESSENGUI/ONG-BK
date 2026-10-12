"use client";

import { useState } from "react";

export function LogoutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function logout() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("La déconnexion a échoué.");
      window.location.assign("/admin/login");
    } catch {
      setError("La déconnexion a échoué. Réessayez.");
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        className="w-full rounded-xl border border-white/15 px-4 py-3 text-left text-sm font-semibold text-white/85 transition hover:bg-white/10 disabled:opacity-60"
        disabled={busy}
        onClick={logout}
        type="button"
      >
        {busy ? "Déconnexion…" : "Se déconnecter"}
      </button>
      {error && <p className="mt-2 text-xs text-red-200" role="alert">{error}</p>}
    </div>
  );
}
