import {
  BookOpen,
  BriefcaseBusiness,
  HeartPulse,
  Leaf,
  Palette,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type DomainAxis = {
  title: string;
  description: string;
  details: string;
  practicalExamples: string[];
  icon: LucideIcon;
};

export type Domain = {
  id: string;
  slug: string;
  number: string;
  title: string;
  shortDescription: string;
  subtitle: string;
  introduction: string;
  objectives: string[];
  targetAudience: string;
  approach: string;
  axes: DomainAxis[];
  activities: string[];
  impactIndicators: string[];
  contributions: string[];
  sustainableGoals: { number: number; title: string; relevance: string }[];
  icon: LucideIcon;
  coverImage: string;
  published: boolean;
};

export const domains: Domain[] = [
  {
    id: "education",
    slug: "education",
    number: "01",
    title: "Éducation",
    shortDescription:
      "Favoriser l’accès au savoir, l’accompagnement scolaire et l’épanouissement des jeunes.",
    subtitle: "Ouvrir à chaque jeune le chemin du savoir et de la confiance.",
    introduction:
      "L’éducation contribue à l’autonomie, à la participation et à l’avenir des jeunes. ONG BK souhaite soutenir un environnement où les enfants et les adolescents peuvent apprendre, progresser et exprimer leur potentiel, en lien avec leurs familles et leur communauté.",
    objectives: [
      "Encourager l’accès aux apprentissages et la réussite éducative.",
      "Soutenir l’épanouissement, la confiance et la participation des jeunes.",
      "Renforcer les liens entre les jeunes, les familles et les acteurs éducatifs.",
    ],
    targetAudience:
      "Enfants, adolescents et jeunes, ainsi que leurs familles et les personnes impliquées dans leur accompagnement éducatif.",
    approach:
      "Les actions sont conçues à partir des besoins exprimés localement et privilégient l’écoute, la participation des jeunes et la collaboration avec les familles et les acteurs concernés.",
    axes: [
      { title: "Accès au savoir", description: "Encourager les conditions qui permettent aux jeunes d’apprendre et de développer leur curiosité.", details: "Cet axe vise à rapprocher les enfants et les jeunes des ressources éducatives et à favoriser un environnement où l’apprentissage est accessible, stimulant et valorisé.", practicalExamples: ["Temps de lecture et de découverte", "Mise en valeur de ressources pédagogiques adaptées", "Activités qui encouragent la curiosité et l’apprentissage autonome"], icon: BookOpen },
      { title: "Accompagnement scolaire", description: "Envisager des temps d’appui et des ressources complémentaires aux apprentissages.", details: "L’accompagnement scolaire peut offrir un cadre complémentaire pour revoir des notions, organiser son travail et demander de l’aide. Il est pensé en soutien des apprentissages, sans se substituer à l’école.", practicalExamples: ["Séances d’aide aux devoirs", "Révision en petits groupes", "Méthodes d’organisation et de travail personnel"], icon: Sparkles },
      { title: "Épanouissement des jeunes", description: "Créer des occasions de développer la confiance en soi, l’expression et la participation.", details: "Au-delà des apprentissages, les jeunes ont besoin d’espaces où ils peuvent s’exprimer, prendre des initiatives et développer leur confiance. Cet axe place leur participation au cœur des activités.", practicalExamples: ["Ateliers d’expression et de créativité", "Activités collectives et projets portés par les jeunes", "Temps d’écoute et d’échange adaptés à leur âge"], icon: HeartPulse },
      { title: "Orientation éducative", description: "Aider les jeunes à mieux identifier leurs intérêts et les possibilités qui s’offrent à eux.", details: "L’orientation aide chaque jeune à mieux connaître ses intérêts et à découvrir les parcours possibles. La démarche repose sur l’information, le dialogue et l’encouragement à se projeter.", practicalExamples: ["Découverte de parcours d’études et de métiers", "Échanges avec des personnes ressources", "Aide à identifier les prochaines étapes d’un parcours"], icon: BriefcaseBusiness },
    ],
    activities: ["Ateliers éducatifs et de lecture", "Temps d’accompagnement scolaire", "Rencontres d’échange avec les familles", "Activités d’expression et de découverte"],
    impactIndicators: ["Participation et assiduité aux activités", "Progression des compétences ciblées", "Retours des jeunes et des familles"],
    contributions: [
      "Mettre en place des programmes d’alphabétisation et de rattrapage scolaire pour les enfants déscolarisés et les adultes analphabètes.",
      "Collaborer avec les écoles locales pour améliorer les infrastructures éducatives et l’accès aux fournitures scolaires.",
      "Sensibiliser les communautés à l’importance de l’éducation, en particulier celle des filles.",
    ],
    sustainableGoals: [
      { number: 4, title: "Éducation de qualité", relevance: "Contribuer à l’accès à des apprentissages inclusifs et à des parcours éducatifs continus." },
      { number: 5, title: "Égalité entre les sexes", relevance: "Encourager la sensibilisation et la participation des filles à l’éducation." },
      { number: 10, title: "Inégalités réduites", relevance: "Porter une attention particulière aux obstacles rencontrés par les publics vulnérables." },
    ],
    icon: BookOpen,
    coverImage: "/images/action-education.jpg",
    published: true,
  },
  {
    id: "formation",
    slug: "formation-professionnelle",
    number: "02",
    title: "Formation professionnelle",
    shortDescription:
      "Accompagner le développement des compétences et la préparation à la vie professionnelle.",
    subtitle: "Développer des compétences utiles pour construire son parcours.",
    introduction:
      "L’accès aux compétences peut ouvrir de nouvelles perspectives personnelles et professionnelles. Ce domaine vise à rapprocher les possibilités de formation des besoins des personnes et des réalités locales, en valorisant l’apprentissage pratique et l’orientation.",
    objectives: [
      "Favoriser l’acquisition de compétences techniques et transversales.",
      "Aider les participants à mieux préparer leur parcours professionnel.",
      "Encourager l’apprentissage continu et l’adaptation aux évolutions des métiers.",
    ],
    targetAudience:
      "Jeunes et adultes souhaitant développer leurs compétences, préciser un projet professionnel ou mieux préparer leur insertion.",
    approach:
      "Les parcours peuvent associer identification des besoins, apprentissages pratiques, accompagnement individualisé et mise en relation avec des ressources locales, selon les partenariats disponibles.",
    axes: [
      { title: "Compétences techniques", description: "Développer des savoir-faire pratiques en fonction des besoins et des opportunités locales.", details: "Cet axe porte sur l’acquisition de savoir-faire applicables dans des contextes professionnels. Les contenus sont à déterminer selon les besoins identifiés et les ressources de formation disponibles.", practicalExamples: ["Initiations pratiques liées aux métiers", "Exercices et mises en situation", "Identification des compétences recherchées localement"], icon: BriefcaseBusiness },
      { title: "Compétences numériques", description: "Renforcer l’aisance avec les outils numériques utiles à la formation et au travail.", details: "La maîtrise des outils numériques facilite l’accès à l’information, à la formation et à certaines démarches professionnelles. L’accompagnement peut s’adapter au niveau et aux usages des participants.", practicalExamples: ["Prise en main des outils numériques courants", "Recherche d’information et de ressources en ligne", "Sensibilisation aux usages responsables du numérique"], icon: Sparkles },
      { title: "Préparation à l’emploi", description: "Travailler la connaissance de soi, la recherche d’opportunités et la préparation aux entretiens.", details: "Cet axe aide les participants à mieux comprendre leurs compétences, présenter leur parcours et préparer une recherche d’emploi ou une démarche professionnelle.", practicalExamples: ["Rédaction ou amélioration d’un CV", "Préparation à un entretien", "Repérage des canaux de recherche d’opportunités"], icon: BookOpen },
      { title: "Apprentissage tout au long de la vie", description: "Valoriser la curiosité, l’adaptation et la progression continue des compétences.", details: "Les parcours évoluent et nécessitent parfois de nouvelles compétences. Cet axe encourage une posture d’apprentissage continu et l’identification des moyens de progresser à chaque étape.", practicalExamples: ["Bilan des compétences à développer", "Découverte des ressources de formation disponibles", "Échanges d’expériences et apprentissage entre pairs"], icon: Leaf },
    ],
    activities: ["Ateliers pratiques", "Séances d’initiation numérique", "Accompagnement à l’orientation professionnelle", "Rencontres métiers et partage d’expérience"],
    impactIndicators: ["Compétences acquises ou consolidées", "Assiduité et achèvement des parcours", "Retours des participants sur leur projet professionnel"],
    contributions: [
      "Créer et soutenir des centres de formation professionnelle.",
      "Organiser des formations techniques adaptées aux besoins du marché local.",
      "Proposer des modules de formation sur le changement de paradigme dans les écoles professionnelles et les universités.",
    ],
    sustainableGoals: [
      { number: 4, title: "Éducation de qualité", relevance: "Développer les possibilités de formation et d’apprentissage tout au long de la vie." },
      { number: 8, title: "Travail décent et croissance économique", relevance: "Renforcer les compétences utiles à l’insertion professionnelle et à l’initiative économique." },
      { number: 10, title: "Inégalités réduites", relevance: "Favoriser l’accès à la formation des personnes dont les possibilités sont limitées." },
    ],
    icon: BriefcaseBusiness,
    coverImage: "/images/action-ateliers.jpg",
    published: true,
  },
  {
    id: "entrepreneuriat",
    slug: "entrepreneuriat-autonomisation",
    number: "03",
    title: "Entrepreneuriat & autonomisation",
    shortDescription:
      "Encourager l’initiative, l’autonomie et les projets portés par les membres des communautés.",
    subtitle: "Faire émerger des initiatives locales et accompagner leur progression.",
    introduction:
      "Les initiatives portées par les personnes et les communautés peuvent contribuer à l’autonomie et à la création de perspectives. ONG BK souhaite encourager l’esprit d’initiative et proposer des repères pour transformer une idée en projet réfléchi et adapté à son contexte.",
    objectives: [
      "Développer l’esprit d’initiative et la capacité à construire un projet.",
      "Renforcer les compétences de base en organisation et gestion.",
      "Encourager l’autonomie économique et la coopération locale.",
    ],
    targetAudience:
      "Personnes et groupes de la communauté qui souhaitent structurer une idée, développer une activité ou renforcer leur autonomie.",
    approach:
      "L’accompagnement peut partir de l’idée de chaque participant, puis avancer par étapes : clarifier le besoin, définir une proposition, examiner les ressources nécessaires et identifier les prochaines démarches.",
    axes: [
      { title: "Esprit entrepreneurial", description: "Développer la créativité, l’initiative et la capacité à repérer des besoins locaux.", details: "L’esprit entrepreneurial commence par l’observation des besoins et la capacité à imaginer des réponses utiles. Cet axe encourage la créativité, l’initiative et l’apprentissage par l’expérimentation.", practicalExamples: ["Ateliers d’identification des besoins locaux", "Exercices de créativité et de résolution de problèmes", "Échanges autour d’initiatives inspirantes"], icon: Sparkles },
      { title: "Structuration des idées", description: "Aider à formuler une proposition et à définir des étapes réalistes pour la faire évoluer.", details: "Une idée gagne en clarté lorsqu’elle est confrontée à un besoin, à ses futurs bénéficiaires et aux ressources nécessaires. Cet axe aide à transformer une intention en proposition compréhensible et progressive.", practicalExamples: ["Définition du problème auquel répond l’idée", "Identification des bénéficiaires et de la proposition de valeur", "Élaboration des premières étapes de mise en œuvre"], icon: BookOpen },
      { title: "Gestion de projet", description: "Acquérir des repères pour organiser les ressources, le calendrier et le suivi d’une initiative.", details: "La gestion de projet fournit des outils simples pour planifier une initiative, répartir les responsabilités, suivre les étapes et ajuster le plan en fonction des contraintes.", practicalExamples: ["Planification des principales étapes", "Repérage des ressources et responsabilités", "Suivi des tâches et apprentissages du projet"], icon: BriefcaseBusiness },
      { title: "Autonomie économique", description: "Encourager la prise de décision et la recherche de solutions durables adaptées au contexte.", details: "Cet axe accompagne la capacité des personnes à prendre des décisions économiques éclairées et à envisager des solutions adaptées à leurs réalités et ressources.", practicalExamples: ["Repères de base en gestion d’une activité", "Réflexion sur les coûts et les ressources", "Identification de solutions adaptées au contexte local"], icon: HeartPulse },
    ],
    activities: ["Ateliers de créativité et de formulation d’idées", "Initiation à la gestion de projet", "Échanges entre porteurs d’initiatives", "Accompagnement-conseil selon les besoins"],
    impactIndicators: ["Projets clarifiés et étapes définies", "Compétences de gestion développées", "Progression déclarée par les participants"],
    contributions: [
      "Promouvoir l’entrepreneuriat local et la création d’emplois, notamment pour les jeunes et les femmes.",
      "Faciliter l’accès aux microcrédits et aux programmes de financement avec les organismes partenaires.",
      "Former les acteurs locaux à la gestion de projets et à la mobilisation des ressources.",
    ],
    sustainableGoals: [
      { number: 1, title: "Pas de pauvreté", relevance: "Soutenir des initiatives qui renforcent l’autonomie économique des personnes vulnérables." },
      { number: 5, title: "Égalité entre les sexes", relevance: "Encourager l’autonomisation économique des femmes et des jeunes filles." },
      { number: 8, title: "Travail décent et croissance économique", relevance: "Accompagner les compétences, l’entrepreneuriat local et la création d’activités." },
      { number: 9, title: "Industrie, innovation et infrastructure", relevance: "Stimuler les solutions et initiatives entrepreneuriales adaptées aux besoins du territoire." },
    ],
    icon: Sparkles,
    coverImage: "/images/action-communaute.jpg",
    published: true,
  },
  {
    id: "culture",
    slug: "culture-environnement",
    number: "04",
    title: "Culture & environnement",
    shortDescription:
      "Valoriser l’expression culturelle et contribuer à la protection du cadre de vie.",
    subtitle: "Faire vivre les cultures et prendre soin de notre cadre de vie.",
    introduction:
      "La culture favorise la transmission, le dialogue et le sentiment d’appartenance. La protection du cadre de vie repose, elle aussi, sur une mobilisation collective. Ce domaine rapproche expression culturelle et sensibilisation environnementale au service des communautés.",
    objectives: [
      "Valoriser les expressions, les savoirs et les initiatives culturelles locales.",
      "Sensibiliser à la protection de l’environnement et du cadre de vie.",
      "Favoriser la participation communautaire autour de ces enjeux.",
    ],
    targetAudience:
      "Jeunes, familles, acteurs culturels et membres des communautés intéressés par les initiatives culturelles ou environnementales.",
    approach:
      "Les démarches privilégient l’expression des communautés, la transmission des connaissances et des activités participatives adaptées aux réalités locales.",
    axes: [
      { title: "Expression culturelle", description: "Créer des espaces de partage autour des pratiques, récits et talents locaux.", details: "Cet axe reconnaît la culture comme un vecteur d’expression, de dialogue et de cohésion. Il vise à donner une place aux talents et aux pratiques culturelles de la communauté.", practicalExamples: ["Ateliers d’expression artistique", "Rencontres autour des récits et pratiques culturels", "Événements de partage ouverts à la communauté"], icon: Palette },
      { title: "Transmission des savoirs", description: "Favoriser les échanges entre générations et la valorisation des connaissances locales.", details: "Les savoirs locaux se transmettent par la rencontre et la pratique. Cet axe encourage le dialogue entre générations et la documentation respectueuse des connaissances partagées.", practicalExamples: ["Rencontres intergénérationnelles", "Collecte de récits avec l’accord des participants", "Ateliers de transmission de savoir-faire"], icon: BookOpen },
      { title: "Sensibilisation environnementale", description: "Rendre accessibles les enjeux environnementaux à travers des activités participatives.", details: "La sensibilisation aide les communautés à comprendre les enjeux environnementaux qui les concernent et à identifier des gestes ou initiatives réalisables dans leur contexte.", practicalExamples: ["Séances d’information participatives", "Supports pédagogiques adaptés aux publics", "Échanges sur les pratiques de protection de l’environnement"], icon: Leaf },
      { title: "Cadre de vie", description: "Mobiliser les habitants autour d’initiatives collectives pour un environnement plus sain.", details: "Un cadre de vie agréable dépend de l’implication collective et de solutions adaptées aux réalités du quartier ou du village. Cet axe privilégie l’identification des priorités avec les habitants.", practicalExamples: ["Diagnostic participatif des besoins du cadre de vie", "Journées de mobilisation communautaire", "Actions collectives à définir avec les habitants"], icon: HeartPulse },
    ],
    activities: ["Rencontres et événements culturels", "Ateliers d’expression artistique", "Campagnes de sensibilisation", "Initiatives communautaires pour le cadre de vie"],
    impactIndicators: ["Participation aux activités et diversité des publics", "Connaissances partagées ou renforcées", "Initiatives communautaires suivies"],
    contributions: [
      "Organiser des activités socioculturelles et des rencontres entre générations.",
      "Sensibiliser les communautés à l’égalité des genres et à la protection de l’environnement.",
      "Encourager des projets verts communautaires, notamment le recyclage et l’agroforesterie.",
    ],
    sustainableGoals: [
      { number: 4, title: "Éducation de qualité", relevance: "Valoriser l’apprentissage, les savoirs locaux et la transmission entre générations." },
      { number: 11, title: "Villes et communautés durables", relevance: "Renforcer la participation et la qualité de vie dans les communautés." },
      { number: 12, title: "Consommation et production responsables", relevance: "Sensibiliser à des pratiques locales responsables et à la réduction des déchets." },
      { number: 15, title: "Vie terrestre", relevance: "Encourager la connaissance et la préservation des milieux terrestres." },
    ],
    icon: Palette,
    coverImage: "/images/action-evenement.jpg",
    published: true,
  },
  {
    id: "sante",
    slug: "sante-bien-etre-communautaire",
    number: "05",
    title: "Santé & bien-être communautaire",
    shortDescription:
      "Promouvoir la prévention, le bien-être et la solidarité au sein des communautés.",
    subtitle: "Mieux s’informer, prévenir et prendre soin les uns des autres.",
    introduction:
      "Le bien-être des personnes dépend aussi de l’accès à une information compréhensible, de la prévention et du soutien de la communauté. Ce domaine privilégie la sensibilisation et l’orientation vers les ressources compétentes, sans se substituer aux professionnels de santé.",
    objectives: [
      "Promouvoir des informations de prévention accessibles et responsables.",
      "Encourager les habitudes favorables au bien-être individuel et collectif.",
      "Renforcer la solidarité et l’orientation vers les services appropriés.",
    ],
    targetAudience:
      "Membres des communautés, jeunes et familles, avec une attention portée aux besoins exprimés localement.",
    approach:
      "Les actions d’information doivent s’appuyer sur des sources fiables et, lorsque nécessaire, sur des professionnels ou services compétents. Elles favorisent l’écoute, la confidentialité et l’orientation appropriée.",
    axes: [
      { title: "Prévention", description: "Partager des repères fiables qui aident chacun à mieux comprendre les enjeux de santé.", details: "La prévention permet de mieux comprendre certains enjeux de santé et les moyens de réduire les risques. Les informations diffusées doivent provenir de sources fiables et être adaptées au public.", practicalExamples: ["Partage de messages validés par des sources fiables", "Échanges sur les gestes de prévention", "Orientation vers les professionnels en cas de besoin"], icon: HeartPulse },
      { title: "Sensibilisation", description: "Organiser des échanges adaptés aux questions et aux besoins exprimés par la communauté.", details: "La sensibilisation ouvre un espace de dialogue où les personnes peuvent poser leurs questions et recevoir une information claire, respectueuse et adaptée à leur contexte.", practicalExamples: ["Causeries communautaires", "Campagnes d’information thématiques", "Supports accessibles et adaptés aux participants"], icon: BookOpen },
      { title: "Bien-être", description: "Encourager des pratiques et des environnements favorables à l’équilibre de chacun.", details: "Le bien-être comprend plusieurs dimensions de la vie quotidienne. Cet axe valorise les pratiques favorables à l’équilibre personnel et les environnements qui soutiennent la qualité de vie.", practicalExamples: ["Ateliers autour des habitudes de vie favorables", "Activités collectives propices au lien social", "Échanges sur les ressources locales de soutien"], icon: Sparkles },
      { title: "Solidarité communautaire", description: "Promouvoir l’entraide et l’orientation vers les services et professionnels appropriés.", details: "L’entraide communautaire peut réduire l’isolement et faciliter l’accès aux ressources. Elle complète, sans les remplacer, les services et l’accompagnement des professionnels compétents.", practicalExamples: ["Repérage des ressources et services existants", "Information sur les possibilités d’orientation", "Initiatives d’écoute et d’entraide respectueuses de la confidentialité"], icon: HeartPulse },
    ],
    activities: ["Séances d’information et d’échange", "Campagnes de sensibilisation", "Ateliers de promotion du bien-être", "Orientation vers les services compétents"],
    impactIndicators: ["Participation et compréhension des messages", "Questions et besoins remontés par les participants", "Orientations vers les ressources compétentes, si documentées"],
    contributions: [
      "Organiser des campagnes de sensibilisation sur la santé publique et l’égalité des genres.",
      "Soutenir des projets communautaires liés aux centres de santé et à l’accès à l’information.",
      "Orienter les personnes vers les services et professionnels compétents, sans s’y substituer.",
    ],
    sustainableGoals: [
      { number: 3, title: "Bonne santé et bien-être", relevance: "Promouvoir la prévention, l’information fiable et l’orientation vers les ressources de santé." },
      { number: 5, title: "Égalité entre les sexes", relevance: "Intégrer l’égalité des genres aux campagnes et activités communautaires." },
      { number: 10, title: "Inégalités réduites", relevance: "Rendre l’information et les activités de sensibilisation accessibles à différents publics." },
    ],
    icon: HeartPulse,
    coverImage: "/images/action-solidarite.jpg",
    published: true,
  },
  {
    id: "durable",
    slug: "developpement-durable",
    number: "06",
    title: "Développement durable",
    shortDescription:
      "Présenter les actions visant à promouvoir un développement responsable, la préservation des ressources naturelles et l’amélioration durable des conditions de vie des communautés.",
    subtitle: "Construire des solutions durables avec les communautés.",
    introduction:
      "Le développement durable invite à concilier les besoins des populations, la préservation des ressources naturelles et la capacité des communautés à faire face aux changements. Les actions de ce domaine sont pensées comme des pistes de travail à adapter aux priorités locales.",
    objectives: [
      "Promouvoir des pratiques responsables et la préservation des ressources.",
      "Sensibiliser aux enjeux environnementaux et aux solutions accessibles.",
      "Encourager la résilience et l’amélioration durable des conditions de vie.",
    ],
    targetAudience:
      "Habitants, jeunes, groupes communautaires et acteurs locaux souhaitant contribuer à des initiatives responsables.",
    approach:
      "La démarche repose sur la sensibilisation, le diagnostic participatif des besoins et l’identification de solutions adaptées, mesurables et portées avec les communautés.",
    axes: [
      { title: "Ressources naturelles", description: "Encourager la connaissance et la préservation des ressources locales.", details: "La préservation des ressources naturelles commence par la connaissance des ressources du territoire et des pressions qui les affectent. Cet axe encourage des usages responsables définis avec les communautés.", practicalExamples: ["Repérage participatif des ressources locales", "Sensibilisation à leur préservation", "Échanges sur des pratiques d’utilisation responsables"], icon: Leaf },
      { title: "Gestion des déchets", description: "Sensibiliser à la réduction, au tri et à une gestion plus responsable des déchets.", details: "Une gestion plus responsable des déchets s’appuie sur la réduction à la source et des solutions de collecte ou de tri adaptées aux possibilités locales.", practicalExamples: ["Sensibilisation à la réduction des déchets", "Initiation au tri lorsque des solutions existent", "Diagnostic des pratiques et besoins locaux"], icon: Sparkles },
      { title: "Éducation écologique", description: "Partager des connaissances pratiques sur les enjeux et les gestes environnementaux.", details: "L’éducation écologique transforme les grands enjeux en connaissances compréhensibles et en gestes concrets. Elle s’adresse à différents publics et encourage l’apprentissage par la pratique.", practicalExamples: ["Ateliers pédagogiques sur l’environnement", "Activités de découverte de la nature", "Partage de gestes responsables au quotidien"], icon: BookOpen },
      { title: "Résilience communautaire", description: "Favoriser la préparation collective et les solutions adaptées aux défis locaux.", details: "La résilience renvoie à la capacité d’une communauté à anticiper les difficultés, à s’organiser et à s’adapter. Cet axe mise sur la coopération et les solutions fondées sur les besoins exprimés.", practicalExamples: ["Identification collective des défis prioritaires", "Cartographie des ressources et compétences disponibles", "Planification d’initiatives locales et de mesures de suivi"], icon: HeartPulse },
    ],
    activities: ["Ateliers de sensibilisation écologique", "Journées communautaires autour du cadre de vie", "Échanges sur la gestion des ressources", "Conception participative d’initiatives locales"],
    impactIndicators: ["Participation aux activités et actions de sensibilisation", "Pratiques ou connaissances suivies dans le temps", "Initiatives locales documentées"],
    contributions: [
      "Sensibiliser au respect de l’environnement et aux pratiques agricoles durables.",
      "Encourager des projets verts communautaires, comme le recyclage et l’agroforesterie.",
      "Collaborer avec les collectivités, les ONG et les organismes nationaux et internationaux.",
    ],
    sustainableGoals: [
      { number: 12, title: "Consommation et production responsables", relevance: "Encourager la réduction des déchets, le recyclage et une gestion plus responsable des ressources." },
      { number: 13, title: "Lutte contre les changements climatiques", relevance: "Renforcer la sensibilisation et la capacité des communautés à agir face aux défis environnementaux." },
      { number: 15, title: "Vie terrestre", relevance: "Promouvoir la protection des écosystèmes et les pratiques respectueuses des terres." },
      { number: 17, title: "Partenariats pour la réalisation des objectifs", relevance: "Faire progresser les initiatives grâce à la coopération entre acteurs locaux et partenaires." },
    ],
    icon: Leaf,
    coverImage: "/images/action-communaute.jpg",
    published: true,
  },
];

export const publishedDomains = domains.filter((domain) => domain.published);

export function getDomainBySlug(slug: string) {
  return publishedDomains.find((domain) => domain.slug === slug);
}
