import Link from "next/link";
import { ArrowRight, BookOpen, BriefcaseBusiness, HeartHandshake, Leaf, Palette, Sparkles, Stethoscope } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHero } from "@/components/page-hero";

const domains = [
  {
    title: "Éducation",
    description: "Favoriser l’accès à l’apprentissage et accompagner l’épanouissement des enfants et des jeunes.",
    icon: BookOpen,
  },
  {
    title: "Formation professionnelle",
    description: "Encourager l’acquisition de compétences utiles à l’autonomie et à l’insertion professionnelle.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Entrepreneuriat et autonomisation",
    description: "Soutenir l’initiative, l’esprit d’entreprise et l’autonomisation des personnes et des communautés.",
    icon: Sparkles,
  },
  {
    title: "Culture",
    description: "Valoriser la culture, la créativité, les expressions locales et le partage entre générations.",
    icon: Palette,
  },
  {
    title: "Environnement et développement durable",
    description: "Sensibiliser à la protection de l’environnement et encourager des pratiques durables.",
    icon: Leaf,
  },
  {
    title: "Santé et bien-être communautaire",
    description: "Contribuer à la sensibilisation et au bien-être des communautés.",
    icon: Stethoscope,
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
    "Découvrez la mission, la vision, les valeurs, les domaines d’intervention et les organes de gouvernance de l’ONG-BK.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        description="Une organisation engagée auprès de la jeunesse et des communautés à travers six domaines d’intervention."
        eyebrow="À propos de l’ONG-BK"
        image="/images/action-communaute.jpg"
        primaryHref="#domaines"
        primaryLabel="Nos domaines d’intervention"
        secondaryHref="/adhesion"
        secondaryLabel="Nous rejoindre"
        title="Grandir ensemble, donner de la joie à la jeunesse."
      />

      <section className="mx-auto grid max-w-[1180px] gap-8 px-6 py-16 sm:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:py-20" id="association">
        <div>
          <p className="section-eyebrow">Qui sommes-nous ?</p>
          <h2 className="section-title mt-3">ONG Borja Kouila</h2>
          <p className="mt-4 text-sm font-semibold text-forest">ONG-BK · Brazzaville, République du Congo</p>
        </div>
        <div className="space-y-4 text-sm leading-7 text-ink/70">
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
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-20" id="vision-mission">
        <div className="mx-auto grid max-w-[1180px] gap-5 px-6 sm:grid-cols-2 sm:px-10">
          <Card className="p-7 sm:p-9">
            <span className="grid size-12 place-items-center rounded-2xl bg-[#edf3e8] text-forest">
              <Sparkles size={22} />
            </span>
            <h2 className="mt-5 font-display text-xl font-bold">Notre vision</h2>
            <p className="mt-3 text-sm leading-7 text-ink/65">
              Une jeunesse épanouie, confiante et actrice de son avenir, au sein de communautés
              solidaires et capables de construire un développement durable.
            </p>
          </Card>
          <Card className="p-7 sm:p-9">
            <span className="grid size-12 place-items-center rounded-2xl bg-[#eaf0f6] text-[#47709b]">
              <HeartHandshake size={22} />
            </span>
            <h2 className="mt-5 font-display text-xl font-bold">Notre mission</h2>
            <p className="mt-3 text-sm leading-7 text-ink/65">
              Accompagner la jeunesse et les communautés par des initiatives dans l’éducation,
              la formation, l’autonomisation, la culture, l’environnement, la santé et le
              bien-être communautaire.
            </p>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-6 py-16 sm:px-10 lg:py-20" id="objectifs">
        <p className="section-eyebrow">Notre engagement</p>
        <h2 className="section-title mt-3">Des actions tournées vers la jeunesse et les communautés.</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Contribuer à l’accès à l’éducation et à l’apprentissage.",
            "Encourager la formation professionnelle et l’acquisition de compétences.",
            "Promouvoir l’entrepreneuriat, l’initiative et l’autonomisation.",
            "Valoriser la culture, la créativité et les expressions locales.",
            "Sensibiliser à la protection de l’environnement et au développement durable.",
            "Soutenir la sensibilisation à la santé et au bien-être communautaire.",
          ].map((objective) => (
            <Card className="flex items-start gap-3 p-5" key={objective}>
              <span className="mt-2 size-2 shrink-0 rounded-full bg-[#c98243]" />
              <p className="text-sm leading-6 text-ink/70">{objective}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-20" id="domaines">
        <div className="mx-auto max-w-[1180px] px-6 sm:px-10">
          <p className="section-eyebrow">Nos domaines d’intervention</p>
          <h2 className="section-title mt-3">Six domaines, un engagement commun.</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {domains.map(({ title, description, icon: Icon }) => (
              <Card className="p-6" key={title}>
                <span className="grid size-11 place-items-center rounded-xl bg-[#edf3e8] text-forest">
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/65">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-6 py-16 sm:px-10 lg:py-20" id="valeurs">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="section-eyebrow">Nos valeurs</p>
            <h2 className="section-title mt-3">Amour, Solidarité, Fraternité.</h2>
            <p className="mt-4 text-sm leading-7 text-ink/65">
              Cette devise exprime l’esprit dans lequel l’ONG-BK entend conduire son
              engagement auprès des personnes et des communautés.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {values.map((value) => (
              <Card className="p-5" key={value.title}>
                <h3 className="font-display text-lg font-bold text-forest">{value.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/65">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
        <blockquote className="mt-10 rounded-3xl bg-[#123f34] p-7 font-display text-2xl font-bold leading-snug text-white sm:p-10 sm:text-3xl">
          « Donnons de la joie à la jeunesse. »
        </blockquote>
      </section>

      <section className="bg-paper py-16 sm:py-20" id="gouvernance">
        <div className="mx-auto max-w-[1180px] px-6 sm:px-10">
          <p className="section-eyebrow">Organisation et gouvernance</p>
          <h2 className="section-title mt-3">Deux organes aux responsabilités distinctes.</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <Card className="p-7">
              <h3 className="font-display text-xl font-bold">Bureau exécutif (BE)</h3>
              <p className="mt-3 text-sm leading-7 text-ink/65">
                Le Bureau exécutif assure la conduite et la mise en œuvre des activités de
                l’organisation, dans le respect de ses textes et des décisions de ses instances.
              </p>
            </Card>
            <Card className="p-7">
              <h3 className="font-display text-xl font-bold">Commission de contrôle et d’évaluation (CCE)</h3>
              <p className="mt-3 text-sm leading-7 text-ink/65">
                La CCE exerce une fonction distincte de contrôle et d’évaluation. Elle formule
                des observations et recommandations sans se substituer à la gestion du Bureau
                exécutif.
              </p>
            </Card>
          </div>
          <p className="mt-5 text-sm leading-6 text-ink/55">
            Les noms des titulaires, mandats et documents officiels sont publiés après leur
            validation par l’organisation.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-6 py-16 sm:px-10 lg:py-20" id="historique">
        <div className="grid gap-6 rounded-3xl border border-ink/10 bg-white p-7 sm:grid-cols-[1fr_auto] sm:items-center sm:p-9">
          <div>
            <p className="section-eyebrow">Notre engagement dans la durée</p>
            <h2 className="mt-3 font-display text-2xl font-bold">Construire avec et pour les communautés.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/65">
              L’ONG-BK inscrit son action dans une démarche de proximité, d’écoute et de
              participation. Les étapes détaillées de son histoire et ses documents statutaires
              seront présentés ici après validation de leurs informations officielles.
            </p>
          </div>
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-forest underline" href="/contact">
            Nous contacter <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </main>
  );
}
