import { CheckCircle2, Compass, HandHeart, ShieldCheck } from "lucide-react";
import { AboutDetailLayout } from "@/components/about-detail-layout";
import { convictions, preambleIntroduction } from "@/lib/about-preamble";

export const metadata = {
  title: "Notre préambule | ONG-BK",
  description:
    "Découvrez le préambule et les convictions qui fondent l’engagement de l’ONG-BK.",
};

const foundations = [
  {
    icon: Compass,
    title: "Une vision holistique de la personne",
    description:
      "Le préambule considère les dimensions physique, morale, émotionnelle, familiale, sociale et culturelle de l’être humain.",
  },
  {
    icon: HandHeart,
    title: "Un changement porté collectivement",
    description:
      "Il souligne la transformation des mentalités et la mise en valeur des hommes et des femmes d’impact au Congo et en Afrique.",
  },
  {
    icon: ShieldCheck,
    title: "L’intégrité et la responsabilité",
    description:
      "L’honneur, l’intégrité, l’équilibre des apports académiques, éthiques et spirituels et la préservation des richesses sont mis en avant.",
  },
  {
    icon: CheckCircle2,
    title: "Un développement durable et inclusif",
    description:
      "Le texte mentionne la jeunesse, l’éducation, les Objectifs de développement durable et l’Agenda 2063 de l’Union africaine.",
  },
];

export default function PreambulePage() {
  return (
    <AboutDetailLayout
      description="Le préambule rassemble les convictions de l’ONG-BK sur la personne, la jeunesse, l’éducation et le développement durable."
      eyebrow="Notre préambule"
      title="Des convictions communes, un engagement partagé."
    >
      <div className="max-w-[800px]">
        <p className="section-eyebrow">Texte fondateur</p>
        <h2 className="section-title mt-3">Les idées qui éclairent notre engagement.</h2>
        <p className="mt-5 text-base font-semibold leading-8 text-[var(--bk-bleu-clair)]">
          {preambleIntroduction}
        </p>
        <p className="mt-4 text-sm leading-7 text-ink/65 sm:text-[15px]">
          Le préambule exprime les constats et les principes qui orientent l’action de
          l’organisation. Il relie le développement des communautés à une vision complète de la
          personne, à l’intégrité, aux perspectives de la jeunesse et à la continuité de
          l’éducation.
        </p>
      </div>

      <section aria-labelledby="preamble-principles" className="mt-12">
        <p className="section-eyebrow">Principes fondateurs</p>
        <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight text-[var(--bk-marine)] sm:text-3xl" id="preamble-principles">
          Les fondations exprimées dans le préambule.
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {foundations.map(({ icon: Icon, title, description }) => (
            <article
              className="rounded-[22px] border border-[rgba(11,90,155,0.08)] bg-[#f8fafb] p-5 sm:p-6"
              key={title}
            >
              <span className="grid size-11 place-items-center rounded-xl bg-white text-[var(--bk-marine)] shadow-sm">
                <Icon aria-hidden="true" size={21} />
              </span>
              <h3 className="mt-4 font-display text-base font-bold text-[var(--bk-marine)]">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-ink/65">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="preamble-full-text" className="mt-14">
        <p className="section-eyebrow">Le texte intégral</p>
        <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight text-[var(--bk-marine)] sm:text-3xl" id="preamble-full-text">
          Sept convictions pour guider la réflexion.
        </h2>
        <ol className="mt-6 grid gap-4">
          {convictions.map((conviction) => (
            <li
              className="grid gap-4 rounded-[22px] border border-[rgba(11,90,155,0.08)] bg-white p-5 shadow-[0_10px_30px_rgba(11,90,155,0.045)] sm:grid-cols-[56px_1fr] sm:p-6"
              key={conviction.number}
            >
              <span className="grid size-11 place-items-center rounded-xl bg-[rgba(25,167,230,0.1)] font-display text-sm font-extrabold text-[var(--bk-marine)]">
                {String(conviction.number).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-base font-bold text-[var(--bk-marine)] sm:text-lg">
                  {conviction.title}
                </h3>
                <p className="mt-3 text-sm font-medium leading-7 text-ink/75">
                  {conviction.statement}
                </p>
                <p className="mt-3 text-sm leading-7 text-ink/60">
                  {conviction.explanation}
                </p>
                <p className="mt-3 border-l-2 border-[var(--bk-jaune)] pl-4 text-sm leading-6 text-ink/65">
                  {conviction.application}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </AboutDetailLayout>
  );
}