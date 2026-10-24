import { BookOpen, Compass, HandHeart, ShieldCheck } from "lucide-react";
import { AboutDetailLayout } from "@/components/about-detail-layout";
import { preambleIntroduction } from "@/lib/about-preamble";

export const metadata = {
  title: "Notre histoire | ONG-BK",
  description:
    "Découvrez les idées fondatrices de l’ONG-BK, éclairées par son préambule et les dates clés de son parcours.",
};

const foundingIdeas = [
  {
    icon: Compass,
    title: "Une vision complète de la personne",
    description:
      "Le préambule invite à considérer les dimensions physique, morale, émotionnelle, familiale, sociale et culturelle de chaque personne. Cette approche place la dignité humaine au cœur de la réflexion.",
  },
  {
    icon: HandHeart,
    title: "La jeunesse et les communautés comme forces d’avenir",
    description:
      "Les convictions exprimées soulignent les défis liés à l’éducation et aux perspectives de la jeunesse. Elles encouragent la valorisation des capacités, l’apprentissage et la participation au développement des communautés.",
  },
  {
    icon: ShieldCheck,
    title: "Un engagement guidé par l’intégrité",
    description:
      "L’honneur, l’intégrité, l’équilibre des compétences et la responsabilité envers les générations futures constituent des repères pour penser une action durable.",
  },
  {
    icon: BookOpen,
    title: "Des principes tournés vers l’action",
    description:
      "L’éducation, le développement durable, les Objectifs de développement durable et l’Agenda 2063 sont évoqués dans le préambule comme des orientations pour contribuer au progrès collectif.",
  },
];

const milestones = [
  ["24 juin 2024", "Début de l’organisation"],
  ["26 septembre 2026", "Obtention des documents officiels"],
  ["Octobre 2026", "Enregistrement au Journal officiel"],
];

export default function OurHistoryPage() {
  return (
    <AboutDetailLayout
      backHref="/#histoire"
      description="Les idées et les convictions qui éclairent la création et le parcours de l’ONG-BK."
      eyebrow="Notre histoire"
      title="Une idée fondatrice, un engagement partagé."
    >
      <section aria-labelledby="founding-preamble" className="max-w-[820px]">
        <p className="section-eyebrow">À l’origine de l’engagement</p>
        <h2 className="section-title mt-3" id="founding-preamble">
          Une réflexion sur la personne, la jeunesse et l’avenir commun.
        </h2>
        <blockquote className="mt-6 rounded-[24px] border border-[rgba(11,90,155,0.1)] bg-[#f7fafb] p-6 sm:p-8">
          <p className="font-display text-lg font-bold leading-8 text-[var(--bk-bleu-clair)] sm:text-xl">
            {preambleIntroduction}
          </p>
          <p className="mt-4 text-sm leading-7 text-ink/65">
            Le préambule de l’ONG-BK rassemble des constats et des convictions qui donnent un sens à
            son engagement : reconnaître toutes les dimensions de la personne, faire confiance au
            potentiel de la jeunesse et contribuer à des communautés capables de construire leur
            avenir. C’est à partir de ces idées, et non d’un récit d’événements non documentés, que
            se comprend l’intention fondatrice de l’organisation.
          </p>
        </blockquote>
      </section>

      <section aria-labelledby="founding-ideas" className="mt-14">
        <p className="section-eyebrow">Les idées qui la fondent</p>
        <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight text-[var(--bk-marine)] sm:text-3xl" id="founding-ideas">
          Des convictions pour orienter l’action.
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {foundingIdeas.map(({ icon: Icon, title, description }, index) => (
            <article
              className="rounded-[22px] border border-[rgba(11,90,155,0.08)] bg-white p-5 shadow-[0_10px_30px_rgba(11,90,155,0.045)] sm:p-6"
              key={title}
            >
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl bg-[#f2f8fb] text-[var(--bk-marine)]">
                  <Icon aria-hidden="true" size={21} />
                </span>
                <span className="font-display text-xs font-bold tracking-[0.16em] text-ink/30">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-[var(--bk-marine)]">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-ink/65">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="history-milestones" className="mt-14">
        <p className="section-eyebrow">Repères du parcours</p>
        <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight text-[var(--bk-marine)] sm:text-3xl" id="history-milestones">
          Trois dates clés de l’organisation.
        </h2>
        <ol className="mt-6 grid gap-3 sm:grid-cols-3">
          {milestones.map(([date, description], index) => (
            <li
              className="rounded-[20px] border border-[rgba(11,90,155,0.08)] bg-[#f8fafb] p-5"
              key={date}
            >
              <span className="font-display text-xs font-extrabold tracking-[0.12em] text-[var(--bk-ciel)]">
                0{index + 1}
              </span>
              <time className="mt-3 block font-display text-base font-bold text-[var(--bk-marine)]">
                {date}
              </time>
              <p className="mt-2 text-sm leading-6 text-ink/65">{description}</p>
            </li>
          ))}
        </ol>
      </section>
    </AboutDetailLayout>
  );
}
