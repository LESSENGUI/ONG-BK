import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7f3] px-6">
      <div className="w-full max-w-xl rounded-[28px] border border-ink/[0.08] bg-white p-8 text-center shadow-[0_18px_40px_rgba(16,36,61,0.08)] sm:p-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-forest">ONG-BK</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-ink sm:text-5xl">Page introuvable</h1>
        <p className="mt-4 text-sm leading-7 text-ink/65 sm:text-base">
          La page que vous cherchez n’existe pas ou a été déplacée.
        </p>
        <Link
          className="mt-7 inline-flex items-center rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2a5b3d]"
          href="/"
        >
          Retour à l’accueil
        </Link>
      </div>
    </main>
  );
}
