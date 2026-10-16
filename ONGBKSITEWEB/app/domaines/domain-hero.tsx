import { ArrowDown } from "lucide-react";

type DomainHeroProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  targetId?: string;
};

export function DomainHero({
  eyebrow = "Nos engagements",
  title = "Nos domaines d’intervention",
  description = "Des engagements complémentaires pour accompagner la jeunesse, renforcer les communautés et contribuer à un avenir plus solidaire.",
  targetId = "domain-selector-title",
}: DomainHeroProps) {
  return (
    <section aria-labelledby="domains-hero-title" className="domains-hero relative isolate flex min-h-[330px] items-center justify-center overflow-hidden px-5 pb-16 pt-12 text-center text-white sm:min-h-[365px] sm:pb-20">
      <div aria-hidden="true" className="domains-hero-glow" />
      <div aria-hidden="true" className="domains-hero-grain" />
      <div className="domains-hero-content relative z-10 mx-auto max-w-[760px]">
        <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--bk-jaune)] sm:text-xs">
          <span aria-hidden="true" className="h-px w-6 bg-[var(--bk-jaune)]" />
          {eyebrow}
          <span aria-hidden="true" className="h-px w-6 bg-[var(--bk-jaune)]" />
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-[-0.045em] text-white sm:text-5xl lg:text-[58px]" id="domains-hero-title">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-[660px] text-sm leading-7 text-white/80 sm:text-base sm:leading-8">
          {description}
        </p>
        <a aria-label={`Découvrir ${title}`} className="domains-hero-scroll mx-auto mt-7 grid size-9 place-items-center rounded-full border border-white/20 text-white/75 transition-colors hover:border-[var(--bk-jaune)] hover:text-[var(--bk-jaune)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bk-jaune)]" href={`#${targetId}`}>
          <ArrowDown aria-hidden="true" size={15} />
        </a>
      </div>
      <svg aria-hidden="true" className="domains-hero-outline pointer-events-none absolute inset-x-0 bottom-0 h-[82px] w-full" preserveAspectRatio="none" viewBox="0 0 1440 100">
        <path d="M-8 4 714 96q6 1 12 0L1448 4" fill="none" stroke="var(--bk-bleu-clair)" strokeLinecap="round" strokeOpacity="0.42" strokeWidth="5" />
      </svg>
    </section>
  );
}
