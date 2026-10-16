import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowDown, ArrowLeft, ChevronRight } from "lucide-react";
import { DomainHero } from "@/app/domaines/domain-hero";
import { ExecutiveBoardProfiles } from "@/components/executive-board-profiles";
import { PublicGovernanceDirectory } from "@/components/public-governance-directory";
import { governanceOrgans, getGovernanceOrgan } from "@/lib/governance";

type GovernancePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return governanceOrgans.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: GovernancePageProps) {
  const { slug } = await params;
  const organ = getGovernanceOrgan(slug);
  return organ
    ? { title: `${organ.title} | Gouvernance | ONG BK`, description: organ.summary }
    : {};
}

export default async function GovernanceDetailPage({ params }: GovernancePageProps) {
  const { slug } = await params;
  const organ = getGovernanceOrgan(slug);
  if (!organ) notFound();

  return (
    <main className="min-h-screen bg-white">
      {organ.slug === "bureau-executif" ? (
        <section aria-labelledby="executive-hero-title" className="relative isolate overflow-hidden bg-[#071c32] text-white">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_12%_8%,rgba(25,167,230,0.2),transparent_36%),radial-gradient(ellipse_at_88%_88%,rgba(242,178,51,0.12),transparent_34%)]" />
          <div aria-hidden="true" className="absolute -right-36 -top-48 size-[540px] rounded-full border border-white/[0.07] shadow-[0_0_0_52px_rgba(255,255,255,0.018),0_0_0_108px_rgba(255,255,255,0.014)]" />
          <div className="relative mx-auto grid max-w-[1280px] items-center gap-12 px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-20 lg:grid-cols-[1fr_0.82fr] lg:gap-16 lg:px-12 lg:py-24">
            <div className="max-w-[650px]">
              <p className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.24em] text-[#f2c46d] sm:text-xs">
                <span aria-hidden="true" className="h-px w-8 bg-[#f2c46d]" />
                Gouvernance · ONG-BK
              </p>
              <h1 className="mt-6 font-display text-4xl font-bold leading-[1.08] tracking-[-.055em] text-white sm:text-5xl lg:text-[64px]" id="executive-hero-title">
                Le Bureau
                <span className="block text-[#7dcdf0]">exécutif.</span>
              </h1>
              <p className="mt-6 max-w-[570px] text-base leading-8 text-white/70 sm:text-lg">
                {organ.summary}
              </p>
              <a className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-[#f2c46d] px-6 text-sm font-bold text-[#071c32] transition hover:-translate-y-0.5 hover:bg-[#ffda8e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#071c32]" href="#membres">
                Rencontrer les membres
                <ArrowDown aria-hidden="true" size={16} />
              </a>
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/15 pt-6">
                <div>
                  <p className="font-display text-2xl font-bold text-white">07</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[.15em] text-white/55">membres</p>
                </div>
                <span aria-hidden="true" className="my-1 w-px bg-white/15" />
                <div>
                  <p className="font-display text-2xl font-bold text-white">3 ans</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[.15em] text-white/55">mandat renouvelable</p>
                </div>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-[520px] lg:justify-self-end">
              <div aria-hidden="true" className="absolute -inset-4 rounded-[34px] border border-white/10 sm:-inset-5" />
              <div className="relative aspect-[4/4.2] overflow-hidden rounded-[28px] border border-white/15 bg-[#0b3150] shadow-[0_35px_90px_rgba(0,0,0,0.32)]">
                <Image
                  alt="Membres de l’ONG-BK réunis lors d’une activité"
                  className="object-cover"
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 42vw"
                  src="/images/action-communaute.jpg"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#071c32]/90 via-[#071c32]/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#f2c46d]">Une mission collective</p>
                  <p className="mt-2 max-w-sm font-display text-xl font-semibold leading-snug text-white sm:text-2xl">
                    Amour, solidarité et fraternité au cœur de notre engagement.
                  </p>
                </div>
              </div>
              <span aria-hidden="true" className="absolute -bottom-7 -left-7 hidden size-16 rounded-full border border-[#f2c46d]/55 lg:block" />
            </div>
          </div>
        </section>
      ) : (
        <DomainHero
          description={organ.summary}
          eyebrow={organ.eyebrow}
          targetId="governance-detail-content"
          title={organ.title}
        />
      )}
      <nav aria-label="Fil d’Ariane" className={`mx-auto flex max-w-[1280px] items-center gap-2 px-5 text-xs text-ink/55 sm:px-8 lg:px-12 ${organ.slug === "bureau-executif" ? "bg-white py-5" : "pt-7"}`}>
        <Link className="hover:text-[var(--bk-ciel)]" href="/">Accueil</Link>
        <ChevronRight aria-hidden="true" size={14} />
        <Link className="hover:text-[var(--bk-ciel)]" href="/a-propos#gouvernance">Organisation et gouvernance</Link>
        <ChevronRight aria-hidden="true" size={14} />
        <span aria-current="page" className="font-semibold text-ink">{organ.shortTitle}</span>
      </nav>
      <section className={organ.slug === "bureau-executif" ? "bg-[var(--bk-fond)] px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14 lg:px-12" : "mx-auto max-w-[1180px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12"} id="governance-detail-content">
        {organ.slug === "bureau-executif" ? (
          <div className="mx-auto max-w-[1280px]">
            <header className="mb-9 flex flex-col justify-between gap-5 lg:mb-11 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <p className="section-eyebrow">L’équipe dirigeante</p>
                <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-[-.045em] text-[#071c32] sm:text-4xl">
                  Des femmes et des hommes engagés.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-ink/65">
                  Découvrez les membres qui portent les responsabilités et l’action quotidienne de l’ONG-BK.
                </p>
              </div>
              <p className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(11,90,155,0.12)] bg-white px-4 py-2.5 text-xs font-semibold text-[var(--bk-marine)] shadow-sm">
                <span aria-hidden="true" className="size-2 rounded-full bg-[#d9af57]" />
                Sept membres · mandat de trois ans
              </p>
            </header>
            <div id="membres">
              <ExecutiveBoardProfiles />
            </div>
            <details className="mt-12 overflow-hidden rounded-[24px] border border-[rgba(11,90,155,0.1)] bg-white shadow-[0_12px_35px_-30px_rgba(11,47,78,0.3)]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-5 font-display text-base font-bold text-[var(--bk-marine)] marker:hidden transition hover:bg-white sm:px-7">
                <span>Le rôle du Bureau exécutif</span>
                <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-[rgba(25,167,230,0.08)] text-[var(--bk-marine)]">+</span>
              </summary>
              <div className="grid gap-6 border-t border-ink/10 px-5 py-6 sm:grid-cols-[0.7fr_1.3fr] sm:px-7">
                <div>
                  <p className="section-eyebrow">Composition</p>
                  <p className="mt-3 text-sm leading-7 text-ink/65">{organ.composition}</p>
                </div>
                <div>
                  <p className="section-eyebrow">Responsabilités principales</p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {organ.responsibilities.map((responsibility) => (
                      <li className="rounded-xl bg-[var(--bk-fond)] px-4 py-3 text-sm leading-6 text-ink/70" key={responsibility}>
                        {responsibility}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>
          </div>
        ) : (
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <aside className="h-fit rounded-3xl border border-[rgba(25,167,230,0.14)] bg-[rgba(25,167,230,0.055)] p-6 sm:p-8 lg:sticky lg:top-24">
            <p className="section-eyebrow">Composition</p>
            <p className="mt-3 text-sm leading-7 text-ink/70">{organ.composition}</p>
            <h2 className="mt-7 font-display text-base font-bold text-[var(--bk-marine)]">Attributions principales</h2>
            <ul className="mt-4 grid gap-3">
              {organ.responsibilities.map((responsibility) => (
                <li className="flex gap-3 text-sm leading-6 text-ink/70" key={responsibility}>
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--bk-rose)]" />
                  {responsibility}
                </li>
              ))}
            </ul>
          </aside>
          <div>
            <p className="section-eyebrow">Fonctionnement et responsabilités</p>
            <h2 className="section-title mt-3">Un cadre clair au service de l’organisation.</h2>
            <ol className="mt-7 grid gap-4">
              {organ.sections.map((section, index) => (
                <li className="about-action-step" data-reveal key={section.title}>
                  <span aria-hidden="true" className="about-action-step-number">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-[var(--bk-marine)]">{section.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-ink/65">{section.content}</p>
                    {section.items ? (
                      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                        {section.items.map((item) => (
                          <li className="rounded-xl border border-[rgba(11,90,155,0.08)] bg-white px-4 py-3 text-sm leading-6 text-ink/70" key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-7">
              <h3 className="font-display text-xl font-bold text-[var(--bk-marine)]">Titulaires officiellement publiés</h3>
              {organ.slug === "commission-controle-evaluation" ? (
                <PublicGovernanceDirectory bodyCode="CONTROL_COMMISSION" />
              ) : (
                <p className="mt-3 text-sm leading-6 text-ink/60">
                  La composition nominative est communiquée par l’organisation après validation et publication officielles.
                </p>
              )}
            </div>
          </div>
        </div>
        )}
        <Link className={`mx-auto mt-9 inline-flex items-center gap-2 text-sm font-bold text-[var(--bk-ciel)] ${organ.slug === "bureau-executif" ? "max-w-[1280px]" : ""}`} href="/a-propos#gouvernance">
          <ArrowLeft aria-hidden="true" size={16} />
          Retour à la gouvernance
        </Link>
      </section>
    </main>
  );
}
