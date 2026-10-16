import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Target } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Card } from "@/components/ui/card";
import { aboutObjectives } from "@/lib/about-objectives";

type ObjectivePageProps = {
  params: Promise<{ slug: string }>;
};

const objectiveImages = [
  "/images/action-education.jpg",
  "/images/action-ateliers.jpg",
  "/images/action-communaute.jpg",
  "/images/action-ateliers.jpg",
  "/images/action-solidarite.jpg",
];

export function generateStaticParams() {
  return aboutObjectives.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ObjectivePageProps) {
  const { slug } = await params;
  const objective = aboutObjectives.find((item) => item.slug === slug);
  if (!objective) return {};
  return {
    title: `${objective.title} | Objectifs de l’ONG-BK`,
    description: objective.summary,
  };
}

export default async function ObjectiveDetailPage({ params }: ObjectivePageProps) {
  const { slug } = await params;
  const index = aboutObjectives.findIndex((item) => item.slug === slug);
  const objective = aboutObjectives[index];
  if (!objective) notFound();

  const next = aboutObjectives[(index + 1) % aboutObjectives.length];

  return (
    <main className="min-h-screen bg-white">
      <PageHero
        description={objective.summary}
        eyebrow={`Objectif stratégique ${objective.number}`}
        image={objectiveImages[index]}
        primaryHref="#actions"
        primaryLabel="Voir les moyens d’action"
        secondaryHref="/a-propos#objectifs"
        secondaryLabel="Tous nos objectifs"
        title={objective.title}
      />
      <nav aria-label="Fil d’Ariane" className="mx-auto flex max-w-[1180px] items-center gap-2 px-5 pt-7 text-xs text-ink/55 sm:px-8 lg:px-12">
        <Link className="hover:text-[var(--bk-ciel)]" href="/">Accueil</Link>
        <ChevronRight aria-hidden="true" size={14} />
        <Link className="hover:text-[var(--bk-ciel)]" href="/a-propos">À propos</Link>
        <ChevronRight aria-hidden="true" size={14} />
        <span aria-current="page" className="font-semibold text-[var(--bk-marine)]">{objective.title}</span>
      </nav>

      <section className="mx-auto grid max-w-[1180px] gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-12">
        <div>
          <p className="section-eyebrow">Pourquoi cet objectif est important</p>
          <h2 className="section-title mt-3">Une réponse ancrée dans les réalités locales.</h2>
          <p className="mt-5 text-sm leading-7 text-ink/70 sm:text-base">{objective.description}</p>
          <div className="mt-8 rounded-2xl border-l-4 border-[var(--bk-ciel)] bg-[var(--bk-fond)] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-white text-[var(--bk-ciel)]"><Target size={20} /></span>
              <h3 className="font-display text-base font-bold text-[var(--bk-marine)]">Notre démarche</h3>
            </div>
            <p className="mt-3 text-sm leading-7 text-ink/70">{objective.approach}</p>
          </div>
        </div>
        <Card className="self-start p-6 sm:p-8">
          <p className="section-eyebrow">Changements recherchés</p>
          <h2 className="mt-2 font-display text-xl font-bold text-[var(--bk-marine)]">À quoi voulons-nous contribuer ?</h2>
          <ul className="mt-5 grid gap-4">
            {objective.outcomes.map((outcome) => (
              <li className="flex gap-3 text-sm leading-6 text-ink/70" key={outcome}>
                <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--bk-ciel)]" size={18} />
                {outcome}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="bg-[var(--bk-fond)] py-14 sm:py-20" id="actions">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-12">
          <div className="max-w-[720px]">
            <p className="section-eyebrow">Moyens d’action</p>
            <h2 className="section-title mt-3">Des pistes concrètes pour avancer.</h2>
            <p className="mt-4 text-sm leading-7 text-ink/65">
              Ces moyens décrivent les actions que l’ONG BK entend entreprendre. Leur mise en
              œuvre dépendra des besoins identifiés, des ressources et des partenariats disponibles.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {objective.actions.map((action, actionIndex) => (
              <Card className="flex gap-4 p-5 sm:p-6" key={action}>
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[rgba(25,167,230,0.1)] font-display text-sm font-bold text-[var(--bk-marine)]">
                  {String(actionIndex + 1).padStart(2, "0")}
                </span>
                <p className="text-sm leading-7 text-ink/70">{action}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-[1180px] flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-ink/65 hover:text-[var(--bk-ciel)]" href="/a-propos#objectifs">
          <ArrowLeft aria-hidden="true" size={16} /> Retour à nos objectifs
        </Link>
        <Link className="inline-flex items-center gap-2 text-sm font-bold text-[var(--bk-marine)] hover:text-[var(--bk-ciel)]" href={`/a-propos/objectifs/${next.slug}`}>
          Objectif suivant : {next.title} <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </section>
    </main>
  );
}
