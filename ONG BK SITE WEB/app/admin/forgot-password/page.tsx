import Link from "next/link";
import { PasswordResetRequestForm } from "@/app/admin/forgot-password/request-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f4f1] px-5 py-12">
      <section className="w-full max-w-md rounded-3xl border border-ink/[0.08] bg-white p-7 shadow-soft sm:p-9">
        <Link className="text-xs font-semibold text-forest hover:underline" href="/admin/login">
          ← Retour à la connexion
        </Link>
        <p className="section-eyebrow mt-8">Récupération sécurisée</p>
        <h1 className="section-title mt-2 text-3xl">Réinitialiser le mot de passe</h1>
        <p className="mt-3 text-sm leading-6 text-ink/65">
          Saisissez l’adresse liée à votre compte. Si elle est active, un lien valable 30 minutes sera envoyé.
        </p>
        <PasswordResetRequestForm />
      </section>
    </main>
  );
}
