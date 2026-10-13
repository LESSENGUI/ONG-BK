export const equalityArticle = {
  slug: "egalite-hommes-femmes",
  type: "PUBLICATION",
  title: "L’égalité entre les femmes et les hommes : une responsabilité partagée",
  category: "Égalité et inclusion",
  summary:
    "Faire progresser l’égalité, c’est permettre à chaque personne d’apprendre, de participer et de choisir son avenir dans le respect de ses droits et de sa dignité.",
  publishedAt: "2026-01-18T00:00:00.000Z",
  readingTime: "5 min",
  image: "/images/action-communaute.jpg",
  tags: ["Égalité", "Jeunesse", "Inclusion"],
  sections: [
    {
      heading: "Une égalité qui concerne toute la société",
      paragraphs: [
        "Les femmes et les hommes ont la même dignité et doivent pouvoir exercer leurs droits, participer aux décisions et contribuer à la vie de leur communauté. L’égalité ne signifie pas que chacun doit suivre le même parcours : elle suppose que les possibilités ne soient pas limitées par le sexe, des stéréotypes ou des discriminations.",
        "Cette exigence concerne les familles, les écoles, les associations, les institutions et le monde professionnel. Elle engage les femmes comme les hommes, les filles comme les garçons.",
      ],
    },
    {
      heading: "L’éducation, un levier essentiel",
      paragraphs: [
        "L’accès à une éducation de qualité ouvre des perspectives et renforce la capacité de chacune et chacun à faire des choix éclairés. Encourager les filles à poursuivre leur apprentissage, soutenir les garçons dans des relations respectueuses et prévenir les violences contribuent à des environnements plus sûrs et plus équitables.",
        "À l’école comme dans la communauté, les adultes peuvent veiller à ce que les responsabilités, la parole et l’encouragement soient partagés sans préjugés.",
      ],
    },
    {
      heading: "Partager les responsabilités et les opportunités",
      paragraphs: [
        "La vie quotidienne repose sur de nombreuses responsabilités : prendre soin des proches, participer aux activités collectives, apprendre un métier ou développer une initiative. Leur répartition plus juste permet à toutes et tous de consacrer du temps à leur formation, à leur santé et à leurs projets.",
        "De même, l’accès aux compétences, aux ressources et aux espaces de décision doit reposer sur les capacités et les aspirations, et non sur des attentes imposées.",
      ],
    },
    {
      heading: "Agir concrètement, ensemble",
      paragraphs: [
        "Faire progresser l’égalité commence par des gestes concrets : écouter les personnes concernées, répartir équitablement la parole, refuser les discriminations, prévenir les violences et promouvoir des modèles positifs. Les organisations peuvent aussi examiner leurs pratiques et créer des espaces de participation accessibles et respectueux.",
        "L’ONG-BK inscrit cette réflexion dans son engagement en faveur de la jeunesse et des communautés. Éducation, formation, autonomisation et bien-être sont autant de domaines où chacune et chacun peut contribuer à des relations plus justes.",
      ],
    },
  ],
  conclusion:
    "L’égalité entre les femmes et les hommes se construit dans la durée. Elle devient réelle lorsque les droits sont respectés, que les responsabilités sont partagées et que chaque personne peut participer pleinement à la vie collective.",
} as const;

export type EqualityArticle = typeof equalityArticle;

export function createArticleSlug(value: string): string {
  return value
    .replace(/&/g, " et ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 180);
}

export const languageTrainingOpportunity = {
  slug: "formation-langues-etrangeres",
  type: "TRAINING_CALL",
  title: "Candidatures – Formation en langues étrangères",
  category: "Formation professionnelle",
  summary:
    "L’ONG-BK ouvre les candidatures pour une formation en langues étrangères destinée aux personnes souhaitant développer leurs compétences linguistiques et élargir leurs perspectives d’apprentissage et de parcours professionnel.",
  applicationStart: "2026-11-01T00:00:00.000Z",
  applicationEnd: "2027-06-20T23:59:59.999Z",
  tags: [
    "Formation professionnelle",
    "Langues étrangères",
    "CANDIDATURES:2026-11-01/2027-06-20",
  ],
  body: `PRÉSENTATION
L’ONG-BK lance une campagne de candidatures pour une formation en langues étrangères. Cette initiative s’inscrit dans le domaine de la formation professionnelle et vise à encourager l’apprentissage, la confiance et l’ouverture à de nouvelles ressources.

OBJECTIFS DE LA FORMATION
• Développer des compétences de compréhension et d’expression dans une ou plusieurs langues étrangères.
• Renforcer la capacité à apprendre et à communiquer dans des contextes d’étude, de travail et d’échange.
• Favoriser l’autonomie, la régularité et la confiance dans la pratique linguistique.

PÉRIODE DE CANDIDATURE
Les candidatures sont reçues du 1er novembre 2026 au 20 juin 2027 inclus. La réception d’un dossier ne garantit pas une place en formation. Les candidatures seront examinées selon les modalités qui seront communiquées par l’ONG-BK.

PERSONNES INVITÉES À CANDIDATER
La campagne s’adresse aux personnes intéressées par l’apprentissage d’une langue étrangère et prêtes à s’impliquer dans un parcours de formation. Les éventuels critères d’âge, de niveau initial, de résidence ou de disponibilité seront précisés par l’ONG-BK avant la sélection.

CONTENU ENVISAGÉ
Selon le programme qui sera confirmé par l’équipe de formation, le parcours pourra couvrir les bases de la compréhension orale et écrite, l’expression et la conversation, le vocabulaire usuel, ainsi que des exercices et mises en situation adaptés au niveau des participants. Le niveau d’entrée, les langues proposées, le calendrier des séances, le format (présentiel ou à distance) et la durée totale restent à confirmer.

COMMENT CANDIDATER
Utilisez le bouton « Déposer ma candidature » sur cette page et indiquez vos coordonnées, votre motivation, vos disponibilités et toute expérience linguistique utile. N’envoyez pas de document sensible ou de pièce d’identité dans le champ de message. Si des pièces sont nécessaires, l’équipe indiquera ultérieurement le canal approprié.

ÉTAPES APRÈS CANDIDATURE
1. Accusé de réception de la demande.
2. Examen des candidatures par l’équipe de l’ONG-BK.
3. Contact des personnes dont le profil correspond au programme confirmé.
4. Communication des informations pratiques et des prochaines étapes.

INFORMATIONS PRATIQUES À CONFIRMER
Les langues effectivement ouvertes, le lieu, le calendrier des cours, les niveaux proposés, les frais éventuels, le nombre de places et les pièces justificatives ne sont pas encore précisés. Aucune contribution financière ne doit être versée sur la base de cette annonce avant la communication officielle de ces informations par l’ONG-BK.

CONTACT
Pour une question au sujet de cette campagne, écrivez à l’équipe via la page Contact du site. Une candidature est une demande d’examen et ne vaut ni inscription définitive, ni promesse de sélection, ni attribution automatique d’un statut de membre.`,
} as const;

export function getApplicationPeriod(tags: readonly string[]) {
  const value = tags.find((tag) => tag.startsWith("CANDIDATURES:"));
  const match = value?.match(/^CANDIDATURES:(\d{4}-\d{2}-\d{2})\/(\d{4}-\d{2}-\d{2})$/);
  if (!match) return null;
  const start = new Date(`${match[1]}T00:00:00.000Z`);
  const end = new Date(`${match[2]}T23:59:59.999Z`);
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start.toISOString().slice(0, 10) !== match[1] ||
    end.toISOString().slice(0, 10) !== match[2] ||
    start > end
  ) return null;
  return { start, end };
}
