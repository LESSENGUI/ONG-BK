import { db } from "@/lib/db";
import { getCurrentUser, userCan } from "@/lib/auth";

export default async function AdminAuditPage() {
  const user = await getCurrentUser();
  if (!user || !userCan(user, "AUDIT_READ")) {
    return (
      <section>
        <h1 className="section-title text-3xl">Accès non autorisé</h1>
        <p className="mt-3 text-sm text-ink/65">
          Votre rôle ne permet pas de consulter ce journal.
        </p>
      </section>
    );
  }

  const entries = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, event: true, actorId: true, subjectType: true, createdAt: true },
  });

  return (
    <section>
      <p className="section-eyebrow">Sécurité et traçabilité</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="section-title text-3xl sm:text-4xl">Journal d’audit</h1>
          <p className="mt-2 text-sm text-ink/65">Les 100 opérations les plus récentes.</p>
        </div>
        {userCan(user, "AUDIT_EXPORT") && (
          <a
            className="rounded-full border border-forest/30 px-4 py-2 text-sm font-semibold text-forest hover:bg-white"
            href="/api/admin/audit?format=csv"
          >
            Exporter le CSV
          </a>
        )}
      </div>
      <div className="mt-7 overflow-x-auto rounded-2xl border border-ink/[0.07] bg-white">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-[#f8f7f3] text-xs uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-5 py-4">Date (UTC)</th>
              <th className="px-5 py-4">Événement</th>
              <th className="px-5 py-4">Acteur (ID)</th>
              <th className="px-5 py-4">Type concerné</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/[0.06]">
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="whitespace-nowrap px-5 py-4 text-ink/65">
                  {entry.createdAt.toISOString().replace("T", " ").slice(0, 19)}
                </td>
                <td className="px-5 py-4 font-semibold">{entry.event}</td>
                <td className="px-5 py-4 text-ink/65">{entry.actorId ?? "Système / anonyme"}</td>
                <td className="px-5 py-4 text-ink/65">{entry.subjectType ?? "—"}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td className="px-5 py-8 text-center text-ink/60" colSpan={4}>
                  Aucun événement enregistré.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-ink/50">
        Les journaux ne contiennent ni mots de passe ni jetons d’authentification.
      </p>
    </section>
  );
}
