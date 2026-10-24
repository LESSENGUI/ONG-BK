export type ConvictionIcon =
  | "heart"
  | "refresh"
  | "balance"
  | "shield"
  | "users"
  | "leaf"
  | "book";

export type Conviction = {
  number: number;
  title: string;
  statement: string;
  explanation: string;
  application: string;
  keywords: string[];
  icon: ConvictionIcon;
};

export const preambleIntroduction =
  "Nous, hommes et femmes pragmatiques, comme des coéquipiers, leaders intègres et visionnaires :";

export const convictions: Conviction[] = [
  {
    number: 1,
    title: "Une vision complète de la personne",
    statement:
      "Convaincus que pour un développement harmonieux de nos communautés, il faut une vision holistique de l’être humain, tenant compte de ses dimensions physique, morale, émotionnelle, familiale, sociale et culturelle.",
    explanation:
      "Cette conviction invite à prendre en compte les différentes dimensions de la vie humaine. Une action pertinente s’intéresse aux capacités, à la santé, aux liens familiaux, aux émotions, aux valeurs et à l’environnement social et culturel.",
    application:
      "Écouter les personnes concernées et tenir compte de leur contexte dans la conception des activités.",
    keywords: ["Vision holistique", "Personne", "Communautés"],
    icon: "heart",
  },
  {
    number: 2,
    title: "Un changement qui commence par soi",
    statement:
      "Convaincus que, pour obtenir un changement de paradigmes, nous devons nous changer nous-mêmes, transformer nos mentalités et nos perceptions, et que le développement de la République du Congo et de l’Afrique passe par la mise en valeur des hommes et des femmes d’impact.",
    explanation:
      "Le changement de paradigme suppose un examen des habitudes, des perceptions et des comportements. La transformation collective se construit aussi par l’exemplarité, l’apprentissage et la valorisation des personnes capables d’agir.",
    application:
      "Favoriser la réflexion, le dialogue et la mise en valeur des initiatives positives au Congo et en Afrique.",
    keywords: ["Changement", "Mentalités", "Exemplarité"],
    icon: "refresh",
  },
  {
    number: 3,
    title: "Des compétences équilibrées",
    statement:
      "Convaincus que devenir des membres pragmatiques, intègres, actifs et efficaces pour le développement intégral de nos localités demande un équilibre entre les apports académiques, éthiques et spirituels.",
    explanation:
      "La capacité d’agir avec intégrité mobilise des connaissances, une éthique et une réflexion personnelle. Leur complémentarité soutient un engagement responsable dans la durée.",
    application:
      "Associer les apprentissages académiques, la responsabilité et les valeurs dans les parcours de formation.",
    keywords: ["Connaissances", "Éthique", "Intégrité"],
    icon: "balance",
  },
  {
    number: 4,
    title: "L’honneur et l’intégrité",
    statement:
      "Conscients que diminuer la pauvreté publique et préserver nos richesses et nos valeurs culturelles pour les générations futures exige de cultiver l’honneur et l’intégrité.",
    explanation:
      "La préservation des ressources, des richesses collectives et des patrimoines culturels dépend de comportements responsables et d’une gestion intègre.",
    application:
      "Encourager la transparence, le respect des engagements et la transmission des patrimoines aux générations futures.",
    keywords: ["Honneur", "Intégrité", "Transmission"],
    icon: "shield",
  },
  {
    number: 5,
    title: "Des perspectives pour la jeunesse",
    statement:
      "Reconnaissant que la jeunesse africaine, et celle de la République du Congo en particulier, souffre du manque d’emploi, entraînant des fléaux et des formes de dépravation, et qu’il est urgent d’apporter un changement de paradigme.",
    explanation:
      "Le manque d’opportunités professionnelles peut fragiliser les parcours et la cohésion. Cette conviction souligne la nécessité de développer les compétences et de soutenir des voies d’insertion adaptées.",
    application:
      "Contribuer à la formation, à l’initiative économique et à l’accompagnement des jeunes, en lien avec les besoins locaux.",
    keywords: ["Jeunesse", "Formation", "Insertion"],
    icon: "users",
  },
  {
    number: 6,
    title: "Le développement durable",
    statement:
      "Tenus de mettre en application les principes du développement durable afin que la République du Congo et l’Afrique prennent pleinement part aux Objectifs de développement durable et à l’Agenda 2063 de l’Union africaine.",
    explanation:
      "L’action de l’organisation s’inscrit dans une perspective de long terme et prend en compte les dimensions sociales, économiques et environnementales du développement.",
    application:
      "Orienter les initiatives vers les objectifs de développement durable et l’Agenda 2063 de l’Union africaine.",
    keywords: ["Durabilité", "ODD", "Agenda 2063"],
    icon: "leaf",
  },
  {
    number: 7,
    title: "La continuité de l’éducation",
    statement:
      "Conscients que le déficit éducationnel et l’abandon des études sont des fléaux qui freinent l’évolution de nos communautés.",
    explanation:
      "Le déficit éducatif et l’abandon scolaire limitent les possibilités de développement des personnes et des communautés. Les causes doivent être comprises pour faciliter des réponses adaptées.",
    application:
      "Soutenir l’apprentissage, le rattrapage scolaire et la sensibilisation avec les familles et les acteurs éducatifs.",
    keywords: ["Éducation", "Apprentissage", "Persévérance"],
    icon: "book",
  },
];

export function getConvictionByNumber(number: number) {
  return convictions.find((conviction) => conviction.number === number);
}