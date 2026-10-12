import { Activity, LockKeyhole, ShieldCheck, UsersRound } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const fullName = [user.profile?.firstName, user.profile?.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <section>
      <p className="section-eyebrow">Administration sécurisée</p>
      <h1 className="section-title mt-2 text-3xl sm:text-4xl">
        Bonjour{fullName ? ` ${fullName}` : ""}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/65">
        Votre espace de travail est protégé par des permissions attribuées selon votre fonction institutionnelle.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-ink/[0.07] bg-white p-5 shadow-sm">
          <span className="grid size-10 place-items-center rounded-xl bg-[#edf3e8] text-forest">
            <ShieldCheck size={19} />
          </span>
          <h2 className="mt-4 font-bold">Fonction</h2>
          <p className="mt-1 text-sm leading-6 text-ink/65">{user.roleName}</p>
        </article>
        <article className="rounded-2xl border border-ink/[0.07] bg-white p-5 shadow-sm">
          <span className="grid size-10 place-items-center rounded-xl bg-[#eaf0f6] text-[#47709b]">
            <LockKeyhole size={19} />
          </span>
          <h2 className="mt-4 font-bold">Droits attribués</h2>
          <p className="mt-1 text-sm text-ink/65">{user.permissions.length} permissions actives</p>
        </article>
        <article className="rounded-2xl border border-ink/[0.07] bg-white p-5 shadow-sm">
          <span className="grid size-10 place-items-center rounded-xl bg-[#f7f0df] text-[#a77a20]">
            {user.roleCode.startsWith("CCE") ? <Activity size={19} /> : <UsersRound size={19} />}
          </span>
          <h2 className="mt-4 font-bold">Séparation des responsabilités</h2>
          <p className="mt-1 text-sm leading-6 text-ink/65">
            {user.roleCode.startsWith("CCE")
              ? "La CCE dispose de droits de consultation et de rapport, sans modification des données contrôlées."
              : "Les fonctions techniques ne confèrent aucun pouvoir institutionnel d’approbation."}
          </p>
        </article>
      </div>
      <div className="mt-8 rounded-2xl border border-[#e7dfc9] bg-[#fbf7ec] p-5 text-sm leading-6 text-ink/75">
        Les fondations de sécurité et les modules institutionnels sont accessibles selon vos permissions.
        {user.permissions.some((permission) => [
          "IDENTITY_READ",
          "GOVERNANCE_READ",
          "MEMBERS_READ",
          "MEMBERSHIP_REQUESTS_READ",
          "DOCUMENTS_READ",
          "BE_MEETINGS_READ",
          "CCE_MEETINGS_READ",
        ].includes(permission)) && (
          <Link className="ml-2 inline-flex font-semibold text-forest underline" href="/admin/institutionnel">
            Ouvrir la vie institutionnelle
          </Link>
        )}
      </div>
    </section>
  );
}
