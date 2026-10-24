import { governanceOrgans } from "@/lib/governance";

export type AboutExplorerIcon =
  | "book"
  | "users"
  | "heart"
  | "leaf"
  | "shield";

export type AboutExplorerItem = {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  summary: string;
  description: string;
  keywords: string[];
  icon: AboutExplorerIcon;
  href: string;
  details?: string[];
  complement?: string;
};

const commitmentIcons: AboutExplorerIcon[] = ["book", "users", "heart", "heart", "leaf", "shield"];
const commitmentKeywords = [
  ["Éducation", "Apprentissage"],
  ["Formation", "Compétences"],
  ["Entrepreneuriat", "Autonomisation"],
  ["Culture", "Créativité"],
  ["Environnement", "Durabilité"],
  ["Santé", "Bien-être"],
];
const commitmentRoutes = [
  "/domaines/education",
  "/domaines/formation-professionnelle",
  "/domaines/entrepreneuriat-autonomisation",
  "/domaines/culture-environnement",
  "/domaines/developpement-durable",
  "/domaines/sante-bien-etre-communautaire",
];

const previousCommitments = [
  "Contribuer à l’accès à l’éducation et à l’apprentissage.",
  "Encourager la formation professionnelle et l’acquisition de compétences.",
  "Promouvoir l’entrepreneuriat, l’initiative et l’autonomisation.",
  "Valoriser la culture, la créativité et les expressions locales.",
  "Sensibiliser à la protection de l’environnement et au développement durable.",
  "Soutenir la sensibilisation à la santé et au bien-être communautaire.",
];

const commitmentDescriptions = [
  "Les besoins éducatifs sont identifiés avec les personnes concernées, puis orientés vers des actions d’apprentissage, de sensibilisation ou d’accompagnement selon les moyens disponibles.",
  "Les formations envisagées partent des compétences recherchées localement et s’appuient sur des formateurs, centres et partenaires qualifiés.",
  "Les porteurs d’initiatives peuvent être accompagnés dans la clarification de leurs projets et mis en relation avec des ressources adaptées, sans garantie automatique de financement.",
  "Les activités culturelles donnent une place aux expressions locales, à la créativité et aux échanges entre générations, avec la participation des communautés.",
  "La sensibilisation environnementale encourage des pratiques accessibles et adaptées au contexte local, en lien avec les acteurs compétents.",
  "Les actions de sensibilisation au bien-être communautaire sont préparées avec les acteurs concernés et orientent les personnes vers les services compétents lorsque cela est nécessaire.",
];

export const complementaryCommitments: AboutExplorerItem[] = previousCommitments.map(
  (commitment, index) => ({
    id: `engagement-${index + 1}`,
    number: String(index + 1).padStart(2, "0"),
    eyebrow: "Engagement complémentaire",
    title: commitment,
    summary: commitment,
    description: commitmentDescriptions[index],
    keywords: commitmentKeywords[index],
    icon: commitmentIcons[index],
    href: commitmentRoutes[index],
  }),
);

export const governanceExplorerItems: AboutExplorerItem[] = governanceOrgans.map(
  (organ, index) => ({
    id: organ.slug,
    number: String(index + 1).padStart(2, "0"),
    eyebrow: organ.eyebrow,
    title: organ.shortTitle,
    summary: organ.summary,
    description: organ.composition,
    keywords: [organ.eyebrow, organ.shortTitle],
    icon: "shield",
    href: `/a-propos/gouvernance/${organ.slug}`,
    details: organ.responsibilities,
    complement: "Le détail du rôle et du fonctionnement de cet organe est disponible sur sa page dédiée.",
  }),
);
