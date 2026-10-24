import Link from "next/link";
import { ChevronRight, MoveLeft } from "lucide-react";
import { DomainHero } from "@/app/domaines/domain-hero";

type AboutDetailLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  backHref?: string;
  previous?: { href: string; title: string };
  next?: { href: string; title: string };
};

export function AboutDetailLayout({
  eyebrow,
  title,
  description,
  children,
  backHref = "/a-propos#preambule",
  previous,
  next,
}: AboutDetailLayoutProps) {
  return (
    <main className="min-h-screen bg-white">
      <DomainHero
        description={description}
        eyebrow={eyebrow}
        targetId="about-detail-content"
        title={title}
      />

      <nav
        aria-label="Fil d’Ariane"
        className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-2 px-5 pt-7 text-xs text-ink/55 sm:px-8 lg:px-12"
      >
        <Link className="transition-colors hover:text-[var(--bk-marine)]" href="/">
          Accueil
        </Link>
        <ChevronRight aria-hidden="true" size={14} />
        <Link className="transition-colors hover:text-[var(--bk-marine)]" href="/a-propos">
          À propos
        </Link>
        <ChevronRight aria-hidden="true" size={14} />
        <span aria-current="page" className="font-semibold text-ink">
          {title}
        </span>
      </nav>

      <section
        className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16"
        id="about-detail-content"
      >
        {children}
        <div className="mt-12 flex flex-col gap-4 border-t border-[rgba(11,90,155,0.1)] pt-7 sm:flex-row sm:items-center sm:justify-between">
          <Link
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-[rgba(11,90,155,0.14)] px-5 py-3 text-sm font-bold text-[var(--bk-marine)] transition-colors hover:bg-[rgba(25,167,230,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bk-ciel)] focus-visible:ring-offset-2"
            href={backHref}
          >
            <MoveLeft aria-hidden="true" size={16} />
            Retour à À propos
          </Link>
          {previous || next ? (
            <nav aria-label="Navigation entre les convictions" className="flex flex-wrap gap-3">
              {previous ? (
                <Link
                  className="rounded-full bg-[#f4f6f7] px-4 py-3 text-xs font-bold text-ink/70 transition-colors hover:bg-[rgba(25,167,230,0.1)] hover:text-[var(--bk-marine)]"
                  href={previous.href}
                >
                  ← {previous.title}
                </Link>
              ) : null}
              {next ? (
                <Link
                  className="rounded-full bg-[#f4f6f7] px-4 py-3 text-xs font-bold text-ink/70 transition-colors hover:bg-[rgba(25,167,230,0.1)] hover:text-[var(--bk-marine)]"
                  href={next.href}
                >
                  {next.title} →
                </Link>
              ) : null}
            </nav>
          ) : null}
        </div>
      </section>
    </main>
  );
}