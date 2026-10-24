import Link from "next/link";
import { ArrowRight, BookOpen, HeartHandshake, Leaf, Sparkles, UsersRound } from "lucide-react";
import { AboutGlobe } from "@/components/about-globe";
import { AboutExplorerSection } from "@/components/about-explorer-section";
import { AboutInfoDialog } from "@/components/about-info-dialog";
import { AboutPillarsSection } from "@/components/about-pillars-section";
import { AboutPreambleSection } from "@/components/about-preamble-section";
import { Card } from "@/components/ui/card";
import { PageHero } from "@/components/page-hero";
import { aboutObjectives, implementationMeans } from "@/lib/about-objectives";
import {
  complementaryCommitments,
  governanceExplorerItems,
} from "@/lib/about-secondary-sections";

const domains = [
  {
    slug: "education",
    title: "Éducation",
    description: "Favoriser l’accès à l’apprentissage et accompagner l’épanouissement des enfants et des jeunes.",
    icon: BookOpen,
  },
  {
    slug: "formation-professionnelle",
    title: "Formation professionnelle",
    description: "Encourager l’acquisition de compétences utiles à l’autonomie et à l’insertion professionnelle.",
    icon: UsersRound,
  },
  {
    slug: "entrepreneuriat-autonomisation",
    title: "Entrepreneuriat et autonomisation",
    description: "Soutenir l’initiative, l’esprit d’entreprise et l’autonomisation des personnes et des communautés.",
    icon: Sparkles,
  },
  {
    slug: "culture-environnement",
    title: "Culture",
    description: "Valoriser la culture, la créativité, les expressions locales et le partage entre générations.",
    icon: HeartHandshake,
  },
  {
    slug: "developpement-durable",
    title: "Environnement et développement durable",
    description: "Sensibiliser à la protection de l’environnement et encourager des pratiques durables.",
    icon: Leaf,
  },
  {
    slug: "sante-bien-etre-communautaire",
    title: "Santé et bien-être communautaire",
    description: "Contribuer à la sensibilisation et au bien-être des communautés.",
    icon: HeartHandshake,
  },
];

const values = [
  {
    title: "Amour",
    description: "Placer la dignité humaine, l’écoute et le respect des personnes au cœur de l’engagement.",
  },
  {
    title: "Solidarité",
    description: "Agir ensemble et porter une attention particulière aux besoins des communautés.",
  },
  {
    title: "Fraternité",
    description: "Encourager l’entraide, l’unité et des relations fondées sur le respect mutuel.",
  },
];

export const metadata = {
  title: "À propos | ONG-BK",
  description:
    "Découvrez la mission, la vision, les valeurs, les objectifs, les moyens d’action, les domaines d’intervention et la gouvernance de l’ONG-BK.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        description="Une organisation engagée auprès de la jeunesse et des communautés à travers six domaines d’intervention."
        eyebrow="À propos de l’ONG-BK"
        image="/images/action-communaute.jpg"
        primaryHref="#objectifs"
        primaryLabel="Découvrir nos objectifs"
        secondaryHref="/adhesion"
        secondaryLabel="Nous rejoindre"
        title="Grandir ensemble, donner de la joie à la jeunesse."
      />

      <section className="about-intro relative isolate overflow-hidden" id="association">
        <div className="about-intro-glow" aria-hidden="true" />
        <div className="mx-auto grid max-w-[1180px] items-center gap-8 px-6 py-14 sm:px-10 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14 lg:px-12">
          <div className="relative z-10">
            <p className="section-eyebrow">Qui sommes-nous ?</p>
            <AboutGlobe />
          </div>
          <div className="relative z-10 space-y-4 text-sm leading-7 text-ink/70 sm:text-[15px]">
            <p>
              L’ONG Borja Kouila (ONG-BK) est une organisation engagée pour la jeunesse et le
              développement des communautés. À travers ses actions, elle entend contribuer à
              l’épanouissement des personnes et encourager des initiatives utiles à la vie
              collective.
            </p>
            <p>
              Son engagement s’articule autour de l’éducation, de la formation professionnelle,
              de l’entrepreneuriat et de l’autonomisation, de la culture, de l’environnement et
              du développement durable, ainsi que de la santé et du bien-être communautaire.
            </p>
            <p>
              L’ONG-BK place la jeunesse au cœur de sa démarche et privilégie la solidarité,
              la participation et le travail avec les communautés.
            </p>
            <p className="rounded-2xl border-l-4 border-[var(--bk-rose)] bg-white/75 px-5 py-4 font-display text-base font-bold leading-7 text-[var(--bk-marine)] shadow-[0_12px_36px_rgba(11,90,155,0.07)]">
              Venons proclamer notre engagement à nous regrouper pour réaliser ces desseins au
              sein d’une organisation non gouvernementale.
            </p>
          </div>
        </div>
      </section>

      <AboutPillarsSection />

      <section className="mx-auto max-w-[1180px] px-6 py-16 sm:px-10 lg:px-12 lg:py-20" id="objectifs">
        <div className="max-w-[740px]">
          <p className="section-eyebrow">Nos objectifs</p>
          <h2 className="section-title mt-3">Des priorités concrètes pour un développement inclusif.</h2>
          <p className="mt-4 text-sm leading-7 text-ink/65">
            Ouvre chaque carte pour comprendre la démarche, puis consulte la page détaillée de l’objectif.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {aboutObjectives.map((objective) => (
            <AboutInfoDialog
              detailHref={`/a-propos/objectifs/${objective.slug}`}
              detailLabel="Voir la page de cet objectif"
              eyebrow={`Objectif ${objective.number}`}
              index={objective.number}
              key={objective.slug}
              paragraphs={[objective.description, objective.approach]}
              points={objective.actions}
              summary={objective.summary}
              title={objective.title}
            />
          ))}
        </div>
      </section>

      <AboutPreambleSection />

      <section className="bg-[var(--bk-fond)] py-16 sm:py-20" id="moyens">
        <div className="mx-auto max-w-[1180px] px-6 sm:px-10 lg:px-12">
          <div className="max-w-[760px]">
            <p className="section-eyebrow">Nos moyens d’action</p>
            <h2 className="section-title mt-3">Transformer les objectifs en initiatives utiles.</h2>
            <p className="mt-4 text-sm leading-7 text-ink/65">
              Pour atteindre ses objectifs, l’ONG BK entend agir par la formation, l’accompagnement,
              la coopération et le soutien à des services de proximité.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {implementationMeans.map((mean, index) => (
              <Link className="about-mean-card group" href={`/a-propos/moyens/${mean.slug}`} key={mean.slug}>
                <p className="section-eyebrow">Levier 0{index + 1}</p>
                <h3 className="mt-2 font-display text-xl font-bold text-[var(--bk-marine)]">{mean.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/65">{mean.description}</p>
                <ul className="mt-5 grid gap-3">
                  {mean.actions.slice(0, 3).map((action) => (
                    <li className="flex gap-3 text-sm leading-6 text-ink/70" key={action}>
                      <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--bk-rose)]" />
                      {action}
                    </li>
                  ))}
                </ul>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--bk-ciel)]">
                  Découvrir les étapes
                  <ArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-1" size={15} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-6 py-16 sm:px-10 lg:px-12 lg:py-20" id="domaines">
        <p className="section-eyebrow">Nos domaines d’intervention</p>
        <h2 className="section-title mt-3">Six domaines, un engagement commun.</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map(({ slug, title, description, icon: Icon }) => (
            <Link className="group" href={`/domaines/${slug}`} key={title}>
              <Card className="h-full p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-[rgba(25,167,230,0.1)] text-[var(--bk-marine)]">
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-[var(--bk-marine)]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/65">{description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--bk-ciel)] group-hover:gap-3">
                  Explorer ce domaine <ArrowRight aria-hidden="true" size={15} />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <AboutExplorerSection
        eyebrow="Nos engagements complémentaires"
        id="engagements-complementaires"
        items={complementaryCommitments}
        navigationLabel="Nos engagements"
        title="Des actions tournées vers la jeunesse et les communautés."
      />

      <section className="mx-auto max-w-[1180px] px-6 py-16 sm:px-10 lg:px-12 lg:py-20" id="valeurs">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="section-eyebrow">Nos valeurs</p>
            <h2 className="section-title mt-3">Amour, Solidarité, Fraternité.</h2>
            <p className="mt-4 text-sm leading-7 text-ink/65">
              Cette devise exprime l’esprit dans lequel l’ONG-BK entend conduire son engagement
              auprès des personnes et des communautés.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {values.map((value) => (
              <Card className="p-5" key={value.title}>
                <h3 className="font-display text-lg font-bold text-[var(--bk-marine)]">{value.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/65">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
        <blockquote className="about-slogan mt-10 rounded-3xl p-7 font-display text-2xl font-bold leading-snug text-white sm:p-10 sm:text-3xl">
          « Donnons de la joie à la jeunesse. »
        </blockquote>
      </section>

      <AboutExplorerSection
        eyebrow="Organisation et gouvernance"
        id="gouvernance"
        items={governanceExplorerItems}
        navigationLabel="Nos organes"
        title="Des organes complémentaires, des responsabilités lisibles."
        footerNote="La composition nominative du Bureau exécutif est présentée selon les informations communiquées par l’ONG-BK. Les mandats sont précisés après validation officielle."
      />

      <section className="mx-auto max-w-[1180px] px-6 py-16 sm:px-10 lg:px-12 lg:py-20" id="historique">
        <div className="grid gap-6 rounded-3xl border border-ink/10 bg-white p-7 sm:grid-cols-[1fr_auto] sm:items-center sm:p-9">
          <div>
            <p className="section-eyebrow">Notre engagement dans la durée</p>
            <h2 className="mt-3 font-display text-2xl font-bold text-[var(--bk-marine)]">Construire avec et pour les communautés.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/65">
              L’ONG-BK inscrit son action dans une démarche de proximité, d’écoute et de
              participation. Les étapes détaillées de son histoire et ses documents statutaires
              seront présentés ici après validation de leurs informations officielles.
            </p>
          </div>
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--bk-ciel)] underline" href="/contact">
            Nous contacter <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </main>
  );
}
