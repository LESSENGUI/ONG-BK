import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyRound, LockKeyhole } from "lucide-react";
import { InitialAdminForm } from "@/app/admin/setup/initial-admin-form";
import { getCurrentUser } from "@/lib/auth";
import { hasAnyUser, isInitialAdminSetupConfigured } from "@/lib/admin-setup";

export const dynamic = "force-dynamic";

export default async function InitialAdminSetupPage() {
  if (await getCurrentUser()) redirect("/admin/dashboard");
  if (await hasAnyUser()) redirect("/admin/login");

  const configured = isInitialAdminSetupConfigured();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f4f1] px-5 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-ink/[0.08] bg-white p-7 shadow-soft sm:p-9">
        <Link className="text-xs font-semibold text-forest hover:underline" href="/admin/login">
          ← Retour à la connexion
        </Link>
        <span className="mt-8 grid size-12 place-items-center rounded-2xl bg-[#edf3e8] text-forest">
          {configured ? <KeyRound size={21} /> : <LockKeyhole size={21} />}
        </span>
        <p className="section-eyebrow mt-6">Configuration initiale</p>
        <h1 className="section-title mt-2 text-3xl">Créer le premier administrateur</h1>
        <p className="mt-3 text-sm leading-6 text-ink/65">
          Ce formulaire ne crée qu’un seul compte <strong>SYSTEM_ADMIN</strong>. Il se désactive
          automatiquement dès qu’un compte est créé. Choisissez vos propres identifiants ; aucun
          compte ni mot de passe par défaut n’est utilisé.
        </p>

        {configured ? (
          <InitialAdminForm />
        ) : (
          <div className="mt-7 rounded-xl border border-[#e7dfc9] bg-[#fbf7ec] p-4 text-sm leading-6 text-ink/75">
            La configuration initiale n’est pas activée. Un responsable du serveur doit définir
            `ADMIN_SETUP_SECRET` avec une valeur aléatoire d’au moins 32 caractères dans `.env`,
            puis redémarrer l’application. Consultez le guide d’installation.
          </div>
        )}
      </section>
    </main>
  );
}
