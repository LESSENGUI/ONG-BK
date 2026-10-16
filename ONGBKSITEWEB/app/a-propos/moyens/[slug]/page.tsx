import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ChevronRight } from "lucide-react";
import { DomainHero } from "@/app/domaines/domain-hero";
import { implementationMeans } from "@/lib/about-objectives";

type MeansPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return implementationMeans.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: MeansPageProps) {
  const { slug } = await params;
  const mean = implementationMeans.find((item) => item.slug === slug);
  return mean
    ? { title: `${mean.title} | Moyens d’action | ONG BK`, description: mean.description }
    : {};
}

export default async function MeansDetailPage({ params }: MeansPageProps) {
  const { slug } = await params;
  const mean = implementationMeans.find((item) => item.slug === slug);
  if (!mean) notFound();

  return (
    <main className="min-h-screen bg-white">
      <DomainHero
        description={mean.description}
        eyebrow="Nos moyens d’action"
        targetId="mean-detail-content"
        title={mean.title}
      />
      <nav aria-label="Fil d’Ariane" className="mx-auto flex max-w-[1180px] items-center gap-2 px-5 pt-7 text-xs text-ink/55 sm:px-8 lg:px-12">
        <Link className="hover:text-[var(--bk-ciel)]" href="/">Accueil</Link>
        <ChevronRight aria-hidden="true" size={14} />
        <Link className="hover:text-[var(--bk-ciel)]" href="/a-propos#moyens">Nos moyens d’action</Link>
        <ChevronRight aria-hidden="true" size={14} />
        <span aria-current="page" className="font-semibold text-ink">{mean.title}</span>
      </nav>
      <section className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12" id="mean-detail-content">
        <div className="max-w-[760px]">
          <p className="section-eyebrow">De l’intention à l’action</p>
          <h2 className="section-title mt-3">Une démarche structurée, adaptée aux réalités locales.</h2>
          <p className="mt-5 text-sm leading-7 text-ink/65 sm:text-[15px]">
            Les éléments ci-dessous décrivent des modalités d’action envisagées par l’ONG BK. Leur mise en œuvre dépend des besoins exprimés, des ressources disponibles et des partenariats établis.
          </p>
        </div>
        <ol className="mt-9 grid gap-4 md:grid-cols-2">
          {mean.sections.map((section, index) => (
            <li className="about-action-step" data-reveal key={section.title}>
              <span aria-hidden="true" className="about-action-step-number">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-display text-lg font-bold text-[var(--bk-marine)]">{section.title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink/65">{section.content}</p>
                {section.items ? (
                  <ul className="mt-4 grid gap-2">
                    {section.items.map((item) => (
                      <li className="flex gap-2 text-sm leading-6 text-ink/65" key={item}>
                        <CheckCircle2 aria-hidden="true" className="mt-1 shrink-0 text-[var(--bk-ciel)]" size={15} />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
        <aside className="mt-8 rounded-3xl border border-[rgba(25,167,230,0.16)] bg-[rgba(25,167,230,0.055)] p-6 sm:p-8">
          <p className="section-eyebrow">Actions envisagées</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {mean.actions.map((action) => (
              <li className="flex gap-3 text-sm leading-6 text-ink/70" key={action}>
                <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--bk-ciel)]" size={17} />
                {action}
              </li>
            ))}
          </ul>
        </aside>
        <Link className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[var(--bk-ciel)] hover:gap-3" href="/a-propos#moyens">
          <ArrowLeft aria-hidden="true" size={16} />
          Retour aux moyens d’action
        </Link>
      </section>
    </main>
  );
}
