import Link from "next/link";
import { ArrowRight, BookOpen, HeartHandshake, Leaf, Sparkles, UsersRound } from "lucide-react";
import { AboutGlobe } from "@/components/about-globe";
import { AboutInfoDialog } from "@/components/about-info-dialog";
import { Card } from "@/components/ui/card";
import { PageHero } from "@/components/page-hero";
import { aboutObjectives, implementationMeans } from "@/lib/about-objectives";
import { governanceOrgans } from "@/lib/governance";

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

const preamble = [
  "Convaincus que pour un développement harmonieux de nos communautés, il faut une vision holistique de l’être humain, tenant compte de ses dimensions physique, morale, émotionnelle, familiale, sociale et culturelle.",
  "Convaincus que, pour obtenir un changement de paradigmes, nous devons nous changer nous-mêmes, transformer nos mentalités et nos perceptions, et que le développement de la République du Congo et de l’Afrique passe par la mise en valeur des hommes et des femmes d’impact.",
  "Convaincus que devenir des membres pragmatiques, intègres, actifs et efficaces pour le développement intégral de nos localités demande un équilibre entre les apports académiques, éthiques et spirituels.",
  "Conscients que diminuer la pauvreté publique et préserver nos richesses et nos valeurs culturelles pour les générations futures exige de cultiver l’honneur et l’intégrité.",
  "Reconnaissant que la jeunesse africaine, et celle de la République du Congo en particulier, souffre du manque d’emploi, entraînant des fléaux et des formes de dépravation, et qu’il est urgent d’apporter un changement de paradigme.",
  "Tenus de mettre en application les principes du développement durable afin que la République du Congo et l’Afrique prennent pleinement part aux Objectifs de développement durable et à l’Agenda 2063 de l’Union africaine.",
  "Conscients que le déficit éducationnel et l’abandon des études sont des fléaux qui freinent l’évolution de nos communautés.",
];

const previousCommitments = [
  "Contribuer à l’accès à l’éducation et à l’apprentissage.",
  "Encourager la formation professionnelle et l’acquisition de compétences.",
  "Promouvoir l’entrepreneuriat, l’initiative et l’autonomisation.",
  "Valoriser la culture, la créativité et les expressions locales.",
  "Sensibiliser à la protection de l’environnement et au développement durable.",
  "Soutenir la sensibilisation à la santé et au bien-être communautaire.",
];

const preambleDetails = [
  {
    title: "Une vision complète de la personne",
    explanation: "Cette conviction invite à prendre en compte les différentes dimensions de la vie humaine. Une action pertinente s’intéresse aux capacités, à la santé, aux liens familiaux, aux émotions, aux valeurs et à l’environnement social et culturel.",
    application: "Écouter les personnes concernées et tenir compte de leur contexte dans la conception des activités.",
  },
  {
    title: "Un changement qui commence par soi",
    explanation: "Le changement de paradigme suppose un examen des habitudes, des perceptions et des comportements. La transformation collective se construit aussi par l’exemplarité, l’apprentissage et la valorisation des personnes capables d’agir.",
    application: "Favoriser la réflexion, le dialogue et la mise en valeur des initiatives positives au Congo et en Afrique.",
  },
  {
    title: "Des compétences équilibrées",
    explanation: "La capacité d’agir avec intégrité mobilise des connaissances, une éthique et une réflexion personnelle. Leur complémentarité soutient un engagement responsable dans la durée.",
    application: "Associer les apprentissages académiques, la responsabilité et les valeurs dans les parcours de formation.",
  },
  {
    title: "L’honneur et l’intégrité",
    explanation: "La préservation des ressources, des richesses collectives et des patrimoines culturels dépend de comportements responsables et d’une gestion intègre.",
    application: "Encourager la transparence, le respect des engagements et la transmission des patrimoines aux générations futures.",
  },
  {
    title: "Des perspectives pour la jeunesse",
    explanation: "Le manque d’opportunités professionnelles peut fragiliser les parcours et la cohésion. Cette conviction souligne la nécessité de développer les compétences et de soutenir des voies d’insertion adaptées.",
    application: "Contribuer à la formation, à l’initiative économique et à l’accompagnement des jeunes, en lien avec les besoins locaux.",
  },
  {
    title: "Le développement durable",
    explanation: "L’action de l’organisation s’inscrit dans une perspective de long terme et prend en compte les dimensions sociales, économiques et environnementales du développement.",
    application: "Orienter les initiatives vers les objectifs de développement durable et l’Agenda 2063 de l’Union africaine.",
  },
  {
    title: "La continuité de l’éducation",
    explanation: "Le déficit éducatif et l’abandon scolaire limitent les possibilités de développement des personnes et des communautés. Les causes doivent être comprises pour faciliter des réponses adaptées.",
    application: "Soutenir l’apprentissage, le rattrapage scolaire et la sensibilisation avec les familles et les acteurs éducatifs.",
  },
];

const commitmentDetails = [
  "Les besoins éducatifs sont identifiés avec les personnes concernées, puis orientés vers des actions d’apprentissage, de sensibilisation ou d’accompagnement selon les moyens disponibles.",
  "Les formations envisagées partent des compétences recherchées localement et s’appuient sur des formateurs, centres et partenaires qualifiés.",
  "Les porteurs d’initiatives peuvent être accompagnés dans la clarification de leurs projets et mis en relation avec des ressources adaptées, sans garantie automatique de financement.",
  "Les activités culturelles donnent une place aux expressions locales, à la créativité et aux échanges entre générations, avec la participation des communautés.",
  "La sensibilisation environnementale encourage des pratiques accessibles et adaptées au contexte local, en lien avec les acteurs compétents.",
  "Les actions de sensibilisation au bien-être communautaire sont préparées avec les acteurs concernés et orientent les personnes vers les services compétents lorsque cela est nécessaire.",
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

      <section className="bg-[var(--bk-fond)] py-16 sm:py-20" id="vision-mission">
        <div className="mx-auto max-w-[1180px] px-6 sm:px-10 lg:px-12">
          <p className="section-eyebrow">Notre cap et notre raison d’agir</p>
          <h2 className="section-title mt-3 max-w-[720px]">Une vision, une mission et des objectifs en action.</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AboutInfoDialog
              eyebrow="Notre cap"
              index="01"
              paragraphs={[
                "La vision de l’ONG BK est celle d’une jeunesse épanouie, confiante et actrice de son avenir, au sein de communautés solidaires et capables de construire un développement durable.",
                "Elle invite à reconnaître le potentiel de chacun et à créer des conditions qui facilitent la participation, l’apprentissage et l’initiative.",
              ]}
              points={["Placer la jeunesse au cœur de la démarche.", "Faire grandir la solidarité et la participation.", "Inscrire l’action dans une perspective durable."]}
              summary="Une jeunesse épanouie, confiante et actrice de son avenir, au sein de communautés solidaires."
              title="Notre vision"
            />
            <AboutInfoDialog
              eyebrow="Notre engagement"
              index="02"
              paragraphs={[
                "La mission consiste à accompagner la jeunesse et les communautés par des initiatives dans l’éducation, la formation, l’autonomisation, la culture, l’environnement, la santé et le bien-être communautaire.",
                "Les actions sont pensées en proximité avec les personnes concernées et en coopération avec les acteurs locaux et les partenaires pertinents.",
              ]}
              points={["Écouter les besoins exprimés.", "Renforcer les capacités et l’autonomie.", "Coopérer pour des réponses adaptées."]}
              summary="Accompagner la jeunesse et les communautés grâce à des initiatives utiles et accessibles."
              title="Notre mission"
            />
            <AboutInfoDialog
              eyebrow="Notre raison d’agir"
              index="03"
              paragraphs={[
                "L’ONG BK a pour but de contribuer au développement durable et inclusif de la République du Congo en particulier et de l’Afrique en général.",
                "Cette contribution vise à améliorer les conditions socio-économiques des populations vulnérables et à renforcer l’accès de toutes et tous à une éducation de qualité.",
              ]}
              points={["Développement durable et inclusif.", "Amélioration des conditions socio-économiques.", "Accès renforcé à une éducation de qualité."]}
              summary="Contribuer à un développement durable et inclusif au Congo et en Afrique."
              title="Notre but"
            />
            <AboutInfoDialog
              eyebrow="Nos priorités"
              index="04"
              paragraphs={[
                "Les objectifs traduisent le but de l’organisation en priorités de travail : éducation inclusive, autonomie économique, développement communautaire, capacités entrepreneuriales et protection de l’environnement.",
                "Chaque priorité s’accompagne d’une présentation détaillée des démarches envisagées et des actions auxquelles l’ONG BK entend contribuer.",
              ]}
              points={aboutObjectives.map((objective) => objective.summary)}
              summary="Cinq priorités structurent les actions et les démarches de l’organisation."
              title="Nos objectifs"
            />
          </div>
        </div>
      </section>

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

      <section className="about-preamble py-16 text-white sm:py-20" id="preambule">
        <div className="mx-auto max-w-[1180px] px-6 sm:px-10 lg:px-12">
          <div className="max-w-[760px]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--bk-jaune)]">Notre préambule</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
              Des convictions communes, un engagement partagé.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/75">
              Nous, hommes et femmes pragmatiques, comme des coéquipiers, leaders intègres et visionnaires :
            </p>
          </div>
          <ol className="mt-8 grid gap-3 md:grid-cols-2">
            {preamble.map((statement, index) => (
              <li className="list-none" key={statement}>
                <AboutInfoDialog
                  eyebrow={`Conviction ${String(index + 1).padStart(2, "0")}`}
                  index={String(index + 1).padStart(2, "0")}
                  paragraphs={[statement, preambleDetails[index].explanation]}
                  points={[preambleDetails[index].application]}
                  summary={statement}
                  title={preambleDetails[index].title}
                />
              </li>
            ))}
          </ol>
        </div>
      </section>

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

      <section className="bg-[var(--bk-fond)] py-16 sm:py-20" id="engagements-complementaires">
        <div className="mx-auto max-w-[1180px] px-6 sm:px-10 lg:px-12">
          <p className="section-eyebrow">Nos engagements complémentaires</p>
          <h2 className="section-title mt-3">Des actions tournées vers la jeunesse et les communautés.</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {previousCommitments.map((commitment, index) => (
              <AboutInfoDialog
                eyebrow="Engagement complémentaire"
                index={String(index + 1).padStart(2, "0")}
                key={commitment}
                paragraphs={[commitmentDetails[index]]}
                summary={commitment}
                title={commitment}
              />
            ))}
          </div>
        </div>
      </section>

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

      <section className="bg-[var(--bk-fond)] py-16 sm:py-20" id="gouvernance">
        <div className="mx-auto max-w-[1180px] px-6 sm:px-10 lg:px-12">
          <p className="section-eyebrow">Organisation et gouvernance</p>
          <h2 className="section-title mt-3">Des organes complémentaires, des responsabilités lisibles.</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {governanceOrgans.map((organ) => (
              <Link className="about-governance-card group" href={`/a-propos/gouvernance/${organ.slug}`} key={organ.slug}>
                <p className="section-eyebrow">{organ.eyebrow}</p>
                <h3 className="mt-3 font-display text-xl font-bold text-[var(--bk-marine)]">{organ.shortTitle}</h3>
                <p className="mt-3 text-sm leading-7 text-ink/65">{organ.summary}</p>
                <p className="mt-4 text-xs leading-6 text-ink/55">{organ.composition}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--bk-ciel)]">
                  Rôle et fonctionnement
                  <ArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-1" size={15} />
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-ink/55">
            La composition nominative du Bureau exécutif est présentée selon les informations communiquées par l’ONG-BK. Les mandats sont précisés après validation officielle.
          </p>
        </div>
      </section>

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
