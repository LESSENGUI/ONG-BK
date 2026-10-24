import { aboutObjectives } from "@/lib/about-objectives";

export type AboutPillarIcon = "sparkles" | "heart" | "globe" | "target";

export type AboutPillar = {
  slug: string;
  number: string;
  title: string;
  eyebrow: string;
  tagline: string;
  summary: string;
  description: string;
  principles: string[];
  commitments: string[];
  keywords: string[];
  icon: AboutPillarIcon;
};

export const aboutPillars: AboutPillar[] = [
  {
    slug: "vision",
    number: "01",
    title: "Notre vision",
    eyebrow: "Notre cap",
    tagline: "Une jeunesse épanouie, confiante et actrice de son avenir.",
    summary:
      "Une jeunesse épanouie, confiante et actrice de son avenir, au sein de communautés solidaires.",
    description:
      "La vision de l’ONG BK est celle d’une jeunesse épanouie, confiante et actrice de son avenir, au sein de communautés solidaires et capables de construire un développement durable. Elle invite à reconnaître le potentiel de chacun et à créer des conditions qui facilitent la participation, l’apprentissage et l’initiative.",
    principles: [
      "Placer la jeunesse au cœur de la démarche.",
      "Faire grandir la solidarité et la participation.",
      "Inscrire l’action dans une perspective durable.",
    ],
    commitments: [
      "Reconnaître le potentiel des jeunes et leur capacité à agir.",
      "Favoriser la participation, l’apprentissage et l’initiative.",
      "Contribuer à des communautés solidaires et à un développement durable.",
    ],
    keywords: ["Jeunesse", "Épanouissement", "Solidarité"],
    icon: "sparkles",
  },
  {
    slug: "mission",
    number: "02",
    title: "Notre mission",
    eyebrow: "Notre engagement",
    tagline: "Accompagner la jeunesse et les communautés par des initiatives utiles.",
    summary:
      "Accompagner la jeunesse et les communautés grâce à des initiatives utiles et accessibles.",
    description:
      "La mission consiste à accompagner la jeunesse et les communautés par des initiatives dans l’éducation, la formation, l’autonomisation, la culture, l’environnement, la santé et le bien-être communautaire. Les actions sont pensées en proximité avec les personnes concernées et en coopération avec les acteurs locaux et les partenaires pertinents.",
    principles: [
      "Écouter les besoins exprimés.",
      "Renforcer les capacités et l’autonomie.",
      "Coopérer pour des réponses adaptées.",
    ],
    commitments: [
      "Agir dans les domaines d’intervention de l’ONG BK selon les besoins identifiés.",
      "Concevoir les initiatives avec les personnes concernées.",
      "Coopérer avec les acteurs locaux et les partenaires pertinents.",
    ],
    keywords: ["Accompagnement", "Capacités", "Coopération"],
    icon: "heart",
  },
  {
    slug: "but",
    number: "03",
    title: "Notre but",
    eyebrow: "Notre raison d’agir",
    tagline: "Contribuer à un développement durable et inclusif au Congo et en Afrique.",
    summary:
      "Contribuer à un développement durable et inclusif au Congo et en Afrique.",
    description:
      "L’ONG BK a pour but de contribuer au développement durable et inclusif de la République du Congo en particulier et de l’Afrique en général. Cette contribution vise à améliorer les conditions socio-économiques des populations vulnérables et à renforcer l’accès de toutes et tous à une éducation de qualité.",
    principles: [
      "Contribuer au développement durable et inclusif.",
      "Améliorer les conditions socio-économiques des populations vulnérables.",
      "Renforcer l’accès à une éducation de qualité.",
    ],
    commitments: [
      "Orienter les initiatives vers les besoins des populations et des communautés.",
      "Soutenir l’accès à l’éducation et aux possibilités de formation.",
      "Contribuer à l’autonomie et à la cohésion communautaire.",
    ],
    keywords: ["Développement inclusif", "Éducation", "Autonomie"],
    icon: "globe",
  },
  {
    slug: "objectifs",
    number: "04",
    title: "Nos objectifs",
    eyebrow: "Nos priorités",
    tagline: "Cinq priorités structurent les démarches de l’organisation.",
    summary: "Cinq priorités structurent les actions et les démarches de l’organisation.",
    description:
      "Les objectifs traduisent le but de l’organisation en priorités de travail : éducation inclusive, autonomie économique, développement communautaire, capacités entrepreneuriales et protection de l’environnement. Chaque priorité s’accompagne d’une présentation détaillée des démarches envisagées et des actions auxquelles l’ONG BK entend contribuer.",
    principles: aboutObjectives.map((objective) => objective.title),
    commitments: aboutObjectives.map((objective) => objective.summary),
    keywords: ["Éducation", "Autonomie", "Communautés", "Environnement"],
    icon: "target",
  },
];

export function getAboutPillarBySlug(slug: string) {
  return aboutPillars.find((pillar) => pillar.slug === slug);
}
