import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  HandHeart,
  HeartPulse,
  Leaf,
  Lightbulb,
  Palette,
  School,
  UsersRound,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { OpportunitiesTable } from "@/components/opportunities-table";
import { db } from "@/lib/db";
import { getApplicationPeriod, languageTrainingOpportunity } from "@/lib/public-articles";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Nos actions et appels à candidature | ONG-BK",
  description: "Découvrez les domaines d’intervention de l’ONG-BK, son approche et les appels à candidature et projets publiés.",
};

const domains = [
  {
    slug: "education",
    number: "01",
    title: "Éducation",
    description: "Favoriser l’apprentissage, la réussite et l’épanouissement des enfants et des jeunes, en encourageant l’accès aux connaissances et le développement des capacités.",
    icon: School,
    color: "bg-[#e9f1e9] text-forest",
  },
  {
    slug: "formation-professionnelle",
    number: "02",
    title: "Formation professionnelle",
    description: "Valoriser l’acquisition de compétences utiles, l’orientation et la préparation des jeunes à des parcours professionnels adaptés à leurs aspirations.",
    icon: BookOpenCheck,
    color: "bg-[#e9f1fa] text-[#315a88]",
  },
  {
    slug: "entrepreneuriat-autonomisation",
    number: "03",
    title: "Entrepreneuriat et autonomisation",
    description: "Encourager l’initiative, la créativité et l’autonomie économique des jeunes, en mettant en valeur leurs idées et leur potentiel.",
    icon: Lightbulb,
    color: "bg-[#fcf2db] text-[#98711b]",
  },
  {
    slug: "culture-environnement",
    number: "04",
    title: "Culture et environnement",
    description: "Valoriser l’expression culturelle et contribuer à la protection du cadre de vie, à la transmission des savoirs et aux initiatives collectives.",
    icon: Palette,
    color: "bg-[#f9eaf1] text-[#a64370]",
  },
  {
    slug: "sante-bien-etre-communautaire",
    number: "05",
    title: "Santé et bien-être communautaire",
    description: "Contribuer à l’information, à la prévention, au bien-être et à la solidarité, en orientant vers les ressources et professionnels compétents.",
    icon: HeartPulse,
    color: "bg-[#fcebea] text-[#b55450]",
  },
  {
    slug: "developpement-durable",
    number: "06",
    title: "Développement durable",
    description: "Encourager la préservation des ressources, la sensibilisation environnementale et des solutions durables définies avec les communautés.",
    icon: Leaf,
    color: "bg-[#eaf4e8] text-[#4c7d43]",
  },
];

const principles = [
  {
    title: "Partir des besoins",
    description: "Écouter les personnes et les acteurs locaux pour comprendre les priorités avant de définir une action.",
    icon: UsersRound,
  },
  {
    title: "Construire avec les communautés",
    description: "Favoriser la participation, l’inclusion et la collaboration plutôt que des réponses conçues sans les personnes concernées.",
    icon: Building2,
  },
  {
    title: "Agir avec responsabilité",
    description: "Privilégier des initiatives adaptées, respectueuses de la dignité et attentives à leur continuité.",
    icon: CheckCircle2,
  },
  {
    title: "Apprendre et améliorer",
    description: "Prendre du recul sur les activités afin d’identifier les enseignements utiles et les prochaines étapes.",
    icon: Lightbulb,
  },
];

export default async function ActionsPage() {
  const storedOpportunities = process.env.DATABASE_URL
    ? await db.publication.findMany({
      where: {
        type: { in: ["VOLUNTEER_CALL", "PROJECT_CALL", "TRAINING_CALL"] },
        status: "PUBLISHED",
        archivedAt: null,
        publishedAt: { not: null },
      },
      orderBy: { publishedAt: "desc" },
      take: 50,
      select: { slug: true, type: true, title: true, summary: true, category: true, tags: true, publishedAt: true },
    })
    : null;
  const opportunities = storedOpportunities
    ? storedOpportunities.map((item) => ({
      ...item,
      type: item.type === "VOLUNTEER_CALL" || item.type === "TRAINING_CALL"
        ? item.type
        : "PROJECT_CALL" as const,
      publishedAt: item.publishedAt?.toISOString() ?? null,
      applicationPeriod: getApplicationPeriod(item.tags),
    }))
    : [{
      ...languageTrainingOpportunity,
      tags: [...languageTrainingOpportunity.tags],
      publishedAt: null,
      type: "TRAINING_CALL" as const,
      applicationPeriod: getApplicationPeriod(languageTrainingOpportunity.tags),
    }];

  return (
    <main className="min-h-screen bg-white">
      <PageHero
        eyebrow="Nos projets et actions"
        title="Des engagements concrets, construits avec les communautés."
        description="Éducation, formation, autonomisation, culture, environnement et bien-être : découvrez les domaines qui guident l’action de l’ONG-BK et les façons de contribuer."
        image="/images/action-solidarite.jpg"
        primaryLabel="Explorer nos domaines"
        primaryHref="#domaines"
        secondaryLabel="Voir les appels à candidature"
        secondaryHref="#candidatures"
      />

      <section className="mx-auto max-w-[1240px] px-5 py-14 sm:px-8 sm:py-20" id="domaines">
        <div className="grid gap-8 lg:grid-cols-[1fr_.72fr] lg:items-end">
          <div>
            <p className="section-eyebrow">Six domaines d’intervention</p>
            <h2 className="section-title mt-3">Agir là où la jeunesse et les communautés en ont besoin.</h2>
          </div>
          <p className="text-sm leading-7 text-ink/65">
            Les domaines de l’ONG-BK expriment ses axes d’engagement. Les projets et activités précis sont présentés lorsqu’ils sont documentés et validés par l’organisation.
          </p>
        </div>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {domains.map(({ slug, number, title, description, icon: Icon, color }) => (
            <article className="group rounded-3xl border border-ink/[0.08] bg-white p-6 shadow-[0_12px_40px_-34px_rgba(17,39,33,.35)] transition hover:-translate-y-1 hover:border-forest/20 hover:shadow-[0_22px_48px_-34px_rgba(17,39,33,.45)] sm:p-7" key={title}>
              <div className="flex items-start justify-between gap-3">
                <span className={`grid size-12 place-items-center rounded-2xl ${color}`}><Icon size={22} /></span>
                <span className="font-display text-sm font-bold tracking-widest text-ink/25">{number}</span>
              </div>
              <h3 className="mt-6 font-display text-xl font-bold text-ink">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-ink/65">{description}</p>
              <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-forest transition group-hover:gap-3" href={`/domaines/${slug}`}>
                Découvrir le domaine <ArrowRight size={15} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#f7f8f5] py-14 sm:py-20" id="approche">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-5 sm:px-8 lg:grid-cols-[.8fr_1fr] lg:items-center">
          <div>
            <p className="section-eyebrow">Notre manière d’agir</p>
            <h2 className="section-title mt-3">Une démarche attentive, participative et responsable.</h2>
            <p className="mt-5 text-sm leading-7 text-ink/65">
              Une action utile commence par une écoute réelle. Elle se construit avec les personnes concernées, s’adapte au contexte et tient compte des moyens disponibles. Cette approche place la dignité, la participation et la coopération au centre de l’engagement.
            </p>
            <Link className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-forest px-5 text-sm font-semibold text-white transition hover:bg-forest/90" href="/a-propos#vision-mission">
              Comprendre notre mission <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {principles.map(({ title, description, icon: Icon }, index) => (
              <article className={`rounded-2xl border border-ink/[0.06] bg-white p-5 sm:p-6 ${index === 1 || index === 2 ? "sm:translate-y-5" : ""}`} key={title}>
                <span className="grid size-10 place-items-center rounded-xl bg-forest/5 text-forest"><Icon size={19} /></span>
                <h3 className="mt-4 font-bold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/60">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-14 sm:px-8 sm:py-20" id="projets">
        <div className="grid gap-8 lg:grid-cols-[1fr_.7fr] lg:items-end">
          <div>
            <p className="section-eyebrow">Du projet à l’action</p>
            <h2 className="section-title mt-3">Chaque initiative mérite une préparation solide.</h2>
          </div>
          <p className="text-sm leading-7 text-ink/65">
            Les actions peuvent prendre des formes différentes selon les besoins, les partenariats et les ressources disponibles. Voici les repères qui aident à les construire et à les suivre.
          </p>
        </div>
        <div className="mt-8 grid gap-0 overflow-hidden rounded-3xl border border-ink/10 bg-white md:grid-cols-4">
          {[
            ["01", "Écouter", "Identifier une préoccupation et les personnes concernées."],
            ["02", "Préparer", "Clarifier l’objectif, les partenaires et les moyens à réunir."],
            ["03", "Réaliser", "Mettre en œuvre des activités adaptées et inclusives."],
            ["04", "Faire le bilan", "Documenter les réalisations et les enseignements disponibles."],
          ].map(([number, title, text], index) => (
            <div className={`p-5 sm:p-6 ${index > 0 ? "border-t border-ink/10 md:border-l md:border-t-0" : ""}`} key={number}>
              <span className="text-xs font-bold tracking-[.16em] text-magenta">{number}</span>
              <h3 className="mt-3 font-display text-lg font-bold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/60">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#10243d] py-14 text-white sm:py-20" id="terrain">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#f3ce6e]">L’engagement en images</p>
              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">La proximité au cœur de nos actions.</h2>
            </div>
            <Link className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-white/25 px-5 text-sm font-semibold text-white transition hover:bg-white/10 sm:self-auto" href="/actualites">
              Suivre nos actualités <ArrowRight size={16} />
            </Link>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65">
            Ces visuels illustrent les thèmes d’engagement du site. Ils ne constituent pas des comptes rendus d’activités datés ni des résultats chiffrés.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["/images/action-education.jpg", "Apprentissage et éducation"],
              ["/images/action-ateliers.jpg", "Ateliers et transmission"],
              ["/images/action-communaute.jpg", "Participation communautaire"],
            ].map(([src, title]) => (
              <figure className="overflow-hidden rounded-2xl border border-white/10 bg-white/5" key={src}>
                <div className="relative h-56 sm:h-64">
                  <Image alt={title} className="object-cover transition duration-700 hover:scale-[1.03]" fill sizes="(max-width: 768px) 100vw, 33vw" src={src} />
                </div>
                <figcaption className="flex items-center gap-2 p-4 text-sm font-semibold text-white/85"><HandHeart className="text-[#f3ce6e]" size={17} />{title}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-14 sm:px-8 sm:py-20" id="candidatures">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="section-eyebrow">Opportunités de contribution</p>
            <h2 className="section-title mt-3">Appels à candidature et offres.</h2>
            <p className="mt-4 text-sm leading-7 text-ink/65">
              Retrouvez ici les appels officiels à bénévoles et les opportunités liées aux projets. Chaque offre publiée dispose de sa fiche détaillée et de ses modalités de candidature.
            </p>
          </div>
          <Link className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-forest/20 px-5 text-sm font-semibold text-forest transition hover:bg-forest/5" href="/adhesion">
            Proposer mon engagement <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-7">
          <OpportunitiesTable opportunities={opportunities} />
        </div>
        <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-[#f7f8f5] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h3 className="font-bold text-ink">Vous souhaitez contribuer autrement ?</h3>
            <p className="mt-1 text-sm leading-6 text-ink/60">Présentez votre démarche, votre proposition de projet ou votre souhait de bénévolat à l’équipe ONG-BK.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="inline-flex min-h-10 items-center gap-2 rounded-full bg-forest px-4 text-sm font-semibold text-white hover:bg-forest/90" href="/adhesion?type=benevole">Devenir bénévole <ArrowRight size={15} /></Link>
            <Link className="inline-flex min-h-10 items-center gap-2 rounded-full border border-ink/15 bg-white px-4 text-sm font-semibold text-ink hover:bg-paper" href="/contact">Proposer un projet <ArrowRight size={15} /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
