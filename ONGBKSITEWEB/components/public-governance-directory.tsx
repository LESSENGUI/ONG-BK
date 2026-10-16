"use client";

import { useEffect, useState } from "react";

type BodyCode = "EXECUTIVE_BOARD" | "CONTROL_COMMISSION";
type PublicMandate = {
  position: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
};

export function PublicGovernanceDirectory({ bodyCode }: { bodyCode: BodyCode }) {
  const [members, setMembers] = useState<PublicMandate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/public/governance?body=${bodyCode}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Les responsables officiels ne peuvent pas être chargés pour le moment.");
        return response.json() as Promise<{ members: PublicMandate[] }>;
      })
      .then(({ members: publishedMembers }) => {
        setMembers(publishedMembers);
        setLoading(false);
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof Error && requestError.name === "AbortError") return;
        setError(requestError instanceof Error ? requestError.message : "Une erreur empêche le chargement des responsables.");
        setLoading(false);
      });
    return () => controller.abort();
  }, [bodyCode]);

  if (loading) {
    return <p className="mt-7 text-sm text-ink/55" role="status">Vérification des nominations officiellement publiées…</p>;
  }
  if (error) {
    return <p className="mt-7 rounded-2xl border border-[rgba(232,25,95,0.2)] bg-[rgba(232,25,95,0.04)] p-5 text-sm leading-6 text-ink/70" role="alert">{error}</p>;
  }
  if (!members.length) {
    return (
      <p className="mt-7 rounded-2xl border border-[rgba(11,90,155,0.1)] bg-[rgba(25,167,230,0.04)] p-5 text-sm leading-6 text-ink/65">
        Aucun mandat n’est actuellement associé à un document de nomination publié en accès public.
        Les noms ne sont pas affichés tant que cette validation institutionnelle n’est pas faite.
      </p>
    );
  }

  return (
    <ul className="mt-7 grid gap-3 sm:grid-cols-2">
      {members.map((member) => (
        <li className="rounded-2xl border border-[rgba(11,90,155,0.1)] bg-white p-5 shadow-[0_8px_24px_rgba(11,90,155,0.045)]" key={`${member.position}-${member.name}`}>
          <p className="section-eyebrow">{member.position}</p>
          <p className="mt-2 font-display text-lg font-bold text-[var(--bk-marine)]">{member.name}</p>
          {member.startDate || member.endDate ? (
            <p className="mt-2 text-xs text-ink/55">
              Mandat : {member.startDate ?? "date de début non précisée"} – {member.endDate ?? "en cours"}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
