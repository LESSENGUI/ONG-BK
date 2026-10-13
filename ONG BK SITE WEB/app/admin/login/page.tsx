import Link from "next/link";
import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { LoginForm } from "@/app/admin/login/login-form";
import { getCurrentUser } from "@/lib/auth";
import { hasAnyUser } from "@/lib/admin-setup";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  if (await getCurrentUser()) redirect("/admin/dashboard");
  const { reset } = await searchParams;
  const showInitialSetup = !(await hasAnyUser());

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f4f1] px-5 py-12">
      <section className="w-full max-w-md rounded-3xl border border-ink/[0.08] bg-white p-7 shadow-soft sm:p-9">
        <Link className="text-xs font-semibold text-forest hover:underline" href="/">
          ← Retour au site ONG-BK
        </Link>
        <span className="mt-8 grid size-12 place-items-center rounded-2xl bg-[#edf3e8] text-forest">
          <LockKeyhole size={21} />
        </span>
        <p className="section-eyebrow mt-6">Espace sécurisé</p>
        <h1 className="section-title mt-2 text-3xl">Connexion administrateur</h1>
        <p className="mt-3 text-sm leading-6 text-ink/65">
          Utilisez le compte qui vous a été attribué par l’ONG-BK.
        </p>
        <LoginForm resetSuccess={reset === "success"} />
        <Link
          className="mt-5 block text-center text-sm font-semibold text-forest hover:underline"
          href="/admin/forgot-password"
        >
          Mot de passe oublié ?
        </Link>
        {showInitialSetup && (
          <Link
            className="mt-4 block text-center text-sm font-semibold text-ink/65 hover:text-forest hover:underline"
            href="/admin/setup"
          >
            Créer le premier compte administrateur
          </Link>
        )}
      </section>
    </main>
  );
}
