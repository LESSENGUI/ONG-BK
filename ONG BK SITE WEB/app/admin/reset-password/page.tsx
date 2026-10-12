import Link from "next/link";
import { PasswordResetForm } from "@/app/admin/reset-password/reset-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f4f1] px-5 py-12">
      <section className="w-full max-w-md rounded-3xl border border-ink/[0.08] bg-white p-7 shadow-soft sm:p-9">
        <Link className="text-xs font-semibold text-forest hover:underline" href="/admin/login">
          ← Retour à la connexion
        </Link>
        <p className="section-eyebrow mt-8">Nouveau mot de passe</p>
        <h1 className="section-title mt-2 text-3xl">Sécurisez votre compte</h1>
        {token ? (
          <PasswordResetForm token={token} />
        ) : (
          <p className="mt-5 text-sm text-red-800" role="alert">
            Le lien est incomplet. Demandez un nouveau lien de récupération.
          </p>
        )}
      </section>
    </main>
  );
}
