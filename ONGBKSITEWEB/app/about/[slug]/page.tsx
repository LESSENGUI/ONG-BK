import { notFound } from "next/navigation";
import { CheckCircle2, Compass, HandHeart } from "lucide-react";
import { AboutDetailLayout } from "@/components/about-detail-layout";
import { aboutObjectives } from "@/lib/about-objectives";
import { aboutPillars, getAboutPillarBySlug } from "@/lib/about-pillars";

type AboutPillarPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return aboutPillars.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: AboutPillarPageProps) {
  const { slug } = await params;
  const pillar = getAboutPillarBySlug(slug);
  if (!pillar) return {};

  return {
    title: `${pillar.title} | À propos | ONG-BK`,
    description: pillar.summary,
  };
}

export default async function AboutPillarPage({ params }: AboutPillarPageProps) {
  const { slug } = await params;
  const pillar = getAboutPillarBySlug(slug);
  if (!pillar) notFound();

  return (
    <AboutDetailLayout
      backHref="/a-propos#vision-mission"
      description={pillar.description}
      eyebrow={pillar.eyebrow}
      title={pillar.title}
    >
      <div className="max-w-[820px]">
        <p className="section-eyebrow">Comprendre notre démarche</p>
        <h2 className="section-title mt-3">{pillar.tagline}</h2>
        <p className="mt-5 text-sm leading-7 text-ink/65 sm:text-[15px]">
          {pillar.description}
        </p>
      </div>

      {pillar.slug === "objectifs" ? (
        <section aria-labelledby="about-objectives-detail" className="mt-12">
          <p className="section-eyebrow">Priorités de travail</p>
          <h2
            className="mt-3 font-display text-2xl font-extrabold leading-tight text-[var(--bk-marine)] sm:text-3xl"
            id="about-objectives-detail"
          >
            Des démarches envisagées selon les besoins et les moyens disponibles.
          </h2>
          <div className="mt-6 grid gap-5">
            {aboutObjectives.map((objective) => (
              <article
                className="rounded-[24px] border border-[rgba(11,90,155,0.08)] bg-[#f8fafb] p-5 sm:p-7"
                key={objective.slug}
              >
                <div className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white font-display text-sm font-extrabold text-[var(--bk-marine)] shadow-sm">
                    {objective.number}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-[var(--bk-marine)]">
                      {objective.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-ink/65">{objective.summary}</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Compass aria-hidden="true" className="text-[var(--bk-ciel)]" size={18} />
                      <h4 className="font-display text-sm font-bold text-[var(--bk-marine)]">
                        Démarche
                      </h4>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-ink/65">
                      {objective.description} {objective.approach}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <HandHeart aria-hidden="true" className="text-[var(--bk-ciel)]" size={18} />
                      <h4 className="font-display text-sm font-bold text-[var(--bk-marine)]">
                        Actions envisagées
                      </h4>
                    </div>
                    <ul className="mt-3 grid gap-2.5">
                      {objective.actions.map((action) => (
                        <li className="flex gap-2.5 text-sm leading-6 text-ink/65" key={action}>
                          <CheckCircle2
                            aria-hidden="true"
                            className="mt-1 shrink-0 text-[var(--bk-ciel)]"
                            size={15}
                          />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <ul aria-label="Changements recherchés" className="mt-5 grid gap-2 border-t border-[rgba(11,90,155,0.08)] pt-4 sm:grid-cols-3">
                  {objective.outcomes.map((outcome) => (
                    <li className="text-xs leading-5 text-ink/60" key={outcome}>
                      {outcome}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <section className="rounded-[26px] border border-[rgba(11,90,155,0.08)] bg-[#f8fafb] p-6 sm:p-8">
            <span className="grid size-12 place-items-center rounded-xl bg-white text-[var(--bk-marine)] shadow-sm">
              <Compass aria-hidden="true" size={23} />
            </span>
            <h2 className="mt-5 font-display text-xl font-bold text-[var(--bk-marine)]">
              Principes directeurs
            </h2>
            <ul className="mt-4 grid gap-3">
              {pillar.principles.map((principle) => (
                <li className="flex gap-3 text-sm leading-6 text-ink/70" key={principle}>
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-[var(--bk-ciel)]"
                    size={17}
                  />
                  {principle}
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-[26px] bg-[#f3f0e9] p-6 sm:p-8">
            <span className="grid size-12 place-items-center rounded-xl bg-white text-[var(--bk-marine)] shadow-sm">
              <HandHeart aria-hidden="true" size={22} />
            </span>
            <h2 className="mt-5 font-display text-xl font-bold text-[var(--bk-marine)]">
              Engagements et orientations
            </h2>
            <ul className="mt-4 grid gap-3">
              {pillar.commitments.map((commitment) => (
                <li className="flex gap-3 text-sm leading-6 text-ink/70" key={commitment}>
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-[var(--bk-ciel)]"
                    size={17}
                  />
                  {commitment}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </AboutDetailLayout>
  );
}
