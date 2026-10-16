export type AboutObjective = {
  slug: string;
  number: string;
  title: string;
  summary: string;
  description: string;
  approach: string;
  actions: string[];
  outcomes: string[];
};

export const aboutObjectives: AboutObjective[] = [
  {
    slug: "education-inclusive",
    number: "01",
    title: "Une éducation inclusive et de qualité",
    summary: "Améliorer l’accès à une éducation inclusive et de qualité par le biais des formations.",
    description:
      "L’ONG BK veut contribuer à des parcours éducatifs accessibles, continus et adaptés aux réalités des enfants, des jeunes et des adultes. Une éducation de qualité associe apprentissages fondamentaux, accompagnement, confiance en soi et participation des familles.",
    approach:
      "Les actions sont préparées avec les communautés et les acteurs éducatifs locaux. Elles complètent les parcours existants, identifient les obstacles à l’apprentissage et favorisent la poursuite de la scolarité, notamment pour les enfants déscolarisés et les filles.",
    actions: [
      "Mettre en place des programmes d’alphabétisation et de rattrapage scolaire pour les enfants déscolarisés et les adultes analphabètes.",
      "Collaborer avec les écoles locales pour améliorer les infrastructures éducatives et l’accès aux fournitures scolaires.",
      "Sensibiliser les communautés à l’importance de l’éducation, en particulier celle des filles.",
      "Proposer des modules de formation sur le changement de paradigme dans les écoles professionnelles et les universités.",
    ],
    outcomes: [
      "Des possibilités d’apprentissage mieux adaptées aux besoins des publics.",
      "Des enfants, jeunes et adultes accompagnés dans la continuité de leur parcours.",
      "Une mobilisation renforcée des familles et des acteurs éducatifs.",
    ],
  },
  {
    slug: "autonomie-economique",
    number: "02",
    title: "L’autonomie économique des populations vulnérables",
    summary: "Renforcer l’autonomie économique des populations vulnérables à travers les formations et les accompagnements.",
    description:
      "L’autonomie économique donne aux personnes davantage de moyens pour faire des choix, répondre à leurs besoins et contribuer à la vie de leur communauté. L’ONG BK entend renforcer les compétences, l’initiative et l’accès à un accompagnement adapté.",
    approach:
      "Les parcours partent des capacités et des projets des personnes. Ils associent formation professionnelle, conseils pratiques et orientation vers les ressources ou partenaires disponibles, sans promettre un financement qui n’est pas confirmé.",
    actions: [
      "Promouvoir l’entrepreneuriat local et la création d’emplois, notamment pour les jeunes et les femmes.",
      "Organiser des formations professionnelles et techniques adaptées aux besoins du marché local.",
      "Faciliter l’accès à des microcrédits et à des programmes de financement pour soutenir les projets des entrepreneurs locaux, en lien avec les organismes partenaires.",
      "Accompagner les personnes dans la clarification d’une idée, la préparation d’un projet et l’identification des étapes suivantes.",
    ],
    outcomes: [
      "Des compétences professionnelles et entrepreneuriales renforcées.",
      "Des projets locaux mieux préparés et accompagnés.",
      "Une autonomie accrue et de nouvelles perspectives d’insertion.",
    ],
  },
  {
    slug: "developpement-communautaire",
    number: "03",
    title: "Le développement communautaire et la cohésion sociale",
    summary: "Promouvoir le développement communautaire et la cohésion sociale.",
    description:
      "Un développement durable se construit avec les personnes concernées. L’ONG BK favorise la participation, l’entraide et la coopération afin que les communautés puissent identifier leurs priorités et contribuer à des réponses utiles à la vie collective.",
    approach:
      "La démarche privilégie l’écoute, le dialogue entre générations et la mobilisation des ressources locales. Les projets d’infrastructures et les campagnes sont conçus avec les communautés, les collectivités et les partenaires concernés.",
    actions: [
      "Encourager la participation active des communautés dans les initiatives de développement local.",
      "Soutenir des projets de développement communautaire tels que la construction de centres de santé, de bibliothèques et de centres de formation.",
      "Organiser des campagnes de sensibilisation sur la santé publique, l’égalité des genres et la protection de l’environnement.",
      "Organiser des activités socioculturelles qui renforcent les liens, l’expression et la transmission entre générations.",
    ],
    outcomes: [
      "Des communautés mobilisées autour de priorités partagées.",
      "Des liens de solidarité et de coopération consolidés.",
      "Des initiatives locales conçues avec les personnes concernées.",
    ],
  },
  {
    slug: "capacites-entrepreneuriales",
    number: "04",
    title: "Les capacités des acteurs locaux et l’entrepreneuriat",
    summary: "Renforcer les capacités des acteurs locaux dans l’entrepreneuriat.",
    description:
      "Les acteurs locaux, associations et porteurs d’initiatives contribuent directement au développement de leur territoire. L’ONG BK souhaite renforcer leurs compétences afin qu’ils puissent concevoir, conduire et faire évoluer des projets répondant aux besoins locaux.",
    approach:
      "Les formations sont participatives et pratiques. Elles peuvent couvrir la gestion de projet, la mobilisation de ressources, la coopération et le plaidoyer. Les échanges d’expérience et la mise en réseau complètent les apprentissages.",
    actions: [
      "Former les leaders communautaires et les associations locales en gestion de projets, mobilisation des ressources et plaidoyer.",
      "Faciliter la mise en réseau des acteurs locaux avec les partenaires internationaux et nationaux pour le partage de bonnes pratiques et d’expériences.",
      "Créer et soutenir des centres de formation professionnelle.",
      "Collaborer avec les pouvoirs publics, les collectivités, les ONG, les organismes nationaux et internationaux, les associations et les universités.",
    ],
    outcomes: [
      "Des acteurs locaux mieux outillés pour structurer leurs initiatives.",
      "Une coopération renforcée entre associations, institutions et partenaires.",
      "Des pratiques partagées et adaptées aux contextes locaux.",
    ],
  },
  {
    slug: "protection-environnement",
    number: "05",
    title: "La protection de l’environnement",
    summary: "Promouvoir la protection de l’environnement et des pratiques durables.",
    description:
      "La protection de l’environnement et des ressources naturelles est essentielle à la qualité de vie des générations présentes et futures. L’ONG BK entend sensibiliser les communautés et encourager des pratiques respectueuses du cadre de vie.",
    approach:
      "Les initiatives sont définies en fonction des enjeux observés localement. Elles reposent sur l’éducation environnementale, la participation des habitants et la collaboration avec les acteurs concernés.",
    actions: [
      "Sensibiliser au respect de l’environnement et à sa protection.",
      "Sensibiliser aux pratiques agricoles durables et respectueuses de l’environnement.",
      "Encourager la mise en place de projets verts dans les communautés, par exemple le recyclage et l’agroforesterie.",
      "Associer les activités socioculturelles à la transmission de gestes et de savoirs favorables à la préservation du cadre de vie.",
    ],
    outcomes: [
      "Des connaissances environnementales mieux partagées.",
      "Des pratiques locales plus respectueuses de l’environnement.",
      "Des initiatives communautaires vertes encouragées et suivies.",
    ],
  },
];

export type ImplementationMean = {
  slug: string;
  title: string;
  description: string;
  actions: string[];
  sections: { title: string; content: string; items?: string[] }[];
};

export const implementationMeans: ImplementationMean[] = [
  {
    slug: "former-informer-accompagner",
    title: "Former, informer et accompagner",
    description: "Transmettre des savoirs utiles et créer des parcours d’apprentissage accessibles.",
    actions: [
      "Sensibiliser, former et éduquer.",
      "Créer et soutenir des centres de formation professionnelle.",
      "Proposer des modules sur le changement de paradigme dans les écoles professionnelles et les universités.",
      "Mettre en place des programmes d’alphabétisation et de rattrapage scolaire.",
    ],
    sections: [
      { title: "Comprendre le levier", content: "La formation, l’information et l’accompagnement permettent de renforcer les capacités et de soutenir des parcours d’apprentissage adaptés aux besoins exprimés." },
      { title: "Finalité", content: "Favoriser l’accès à des apprentissages utiles, encourager la poursuite des études et soutenir l’acquisition progressive de compétences." },
      { title: "Personnes concernées", content: "Les enfants, les jeunes, les adultes en situation d’analphabétisme, les personnes déscolarisées et les acteurs éducatifs peuvent être concernés selon les programmes." },
      { title: "Écoute et préparation", content: "Les besoins et les obstacles à l’apprentissage sont identifiés avec les personnes, les familles, les écoles et les partenaires avant de déterminer une réponse." },
      { title: "Sensibiliser et informer", content: "Des échanges et des campagnes peuvent aider à faire connaître les possibilités d’apprentissage, l’importance de la scolarité et les ressources accessibles." },
      { title: "Organiser les formations", content: "Les formations et modules sont conçus selon le public, les objectifs pédagogiques et les ressources disponibles. Ils peuvent être proposés dans des centres ou en partenariat avec les établissements." },
      { title: "Accompagner les parcours", content: "Un accompagnement peut aider à repérer les difficultés, orienter vers les ressources appropriées et soutenir la progression sans se substituer aux professionnels concernés." },
      { title: "Travailler avec les acteurs éducatifs", content: "L’ONG BK entend collaborer avec les écoles, les centres de formation, les familles et les organismes concernés pour renforcer la continuité des parcours." },
      { title: "Suivre les progrès", content: "Le suivi peut porter sur la participation, les apprentissages acquis, les obstacles rencontrés et les suites proposées, avec des indicateurs adaptés aux activités réalisées." },
    ],
  },
  {
    slug: "infrastructures-services-proximite",
    title: "Renforcer les lieux et les services de proximité",
    description: "Contribuer à des espaces qui soutiennent l’apprentissage, la santé et la vie collective.",
    actions: [
      "Créer, réhabiliter et équiper des infrastructures éducatives, sanitaires, touristiques et culturelles.",
      "Collaborer avec les écoles locales pour améliorer les infrastructures et l’accès aux fournitures scolaires.",
      "Soutenir des projets de centres de santé, bibliothèques et centres de formation.",
    ],
    sections: [
      { title: "Comprendre le levier", content: "Les infrastructures et services de proximité peuvent faciliter l’accès à l’éducation, à la santé, à la culture et à des espaces de rencontre." },
      { title: "Finalité", content: "Contribuer à des lieux utiles, accessibles et adaptés aux besoins des communautés, en lien avec les acteurs compétents." },
      { title: "Identifier les besoins", content: "Les besoins et ressources existants sont examinés avec les communautés, les collectivités, les établissements et les partenaires concernés." },
      { title: "Choisir une réponse pertinente", content: "La création, la réhabilitation ou l’équipement d’un lieu doit répondre à un besoin démontré et tenir compte des coûts d’usage, de la sécurité et de l’entretien." },
      { title: "Concevoir avec les usagers", content: "Les futurs usagers sont associés à la réflexion afin de prendre en compte l’accessibilité, les usages, les horaires et les besoins des différents publics." },
      { title: "Mobiliser les compétences", content: "Les travaux et équipements nécessitent l’intervention de personnes qualifiées et le respect des exigences techniques et réglementaires applicables." },
      { title: "Organiser l’accès", content: "Les modalités de fonctionnement, d’accueil et d’utilisation sont précisées avec les responsables du lieu et les partenaires qui en assurent la gestion." },
      { title: "Prévoir la coopération", content: "L’ONG BK peut collaborer avec les pouvoirs publics, les collectivités, les associations et les partenaires techniques, selon leurs mandats respectifs." },
      { title: "Assurer le suivi", content: "Le suivi peut documenter l’état des équipements, leur utilisation, les besoins d’entretien et les retours des usagers afin d’orienter les améliorations." },
    ],
  },
  {
    slug: "initiatives-locales",
    title: "Faire grandir les initiatives locales",
    description: "Accompagner l’autonomie économique, la création d’activités et la capacité d’action des associations.",
    actions: [
      "Promouvoir l’entrepreneuriat local et la création d’emplois pour les jeunes et les femmes.",
      "Organiser des formations techniques adaptées aux besoins du marché local.",
      "Faciliter l’accès aux dispositifs de microcrédit et de financement avec les partenaires concernés.",
      "Former les leaders et associations à la gestion de projets, à la mobilisation des ressources et au plaidoyer.",
    ],
    sections: [
      { title: "Comprendre le levier", content: "L’accompagnement des initiatives locales vise à renforcer l’autonomie économique et la capacité des acteurs à concevoir des réponses aux besoins de leur territoire." },
      { title: "Finalité", content: "Soutenir le développement de compétences, l’entrepreneuriat local et des projets mieux préparés, notamment pour les jeunes et les femmes." },
      { title: "Personnes concernées", content: "Les porteurs de projets, les jeunes, les femmes, les associations et les acteurs locaux peuvent être accompagnés selon les critères définis pour chaque activité." },
      { title: "Écouter les aspirations", content: "Le parcours commence par l’écoute des objectifs, des compétences disponibles, des contraintes rencontrées et des opportunités du contexte local." },
      { title: "Développer les compétences", content: "Les formations professionnelles, techniques et entrepreneuriales sont ajustées aux besoins locaux et aux perspectives d’activité identifiées." },
      { title: "Structurer les projets", content: "Un accompagnement peut aider à clarifier une idée, identifier les étapes, préparer un budget prévisionnel et considérer les risques et obligations applicables." },
      { title: "Faciliter les liens", content: "La mise en réseau avec les partenaires et les dispositifs de financement peut être facilitée. Elle ne constitue pas une garantie d’obtention de crédit ou de financement." },
      { title: "Renforcer les associations", content: "Les acteurs locaux peuvent bénéficier de formations en gestion de projet, mobilisation des ressources, coopération et plaidoyer." },
      { title: "Apprécier les résultats", content: "Le suivi peut documenter les compétences acquises, les activités démarrées, les collaborations établies et les difficultés à traiter, sans présumer de résultats futurs." },
    ],
  },
  {
    slug: "cooperation-cadre-de-vie",
    title: "Agir en coopération et préserver le cadre de vie",
    description: "Construire des réponses collectives, culturelles et durables avec les communautés.",
    actions: [
      "Organiser des activités socioculturelles et des campagnes de sensibilisation.",
      "Faciliter la participation active des communautés au développement local.",
      "Mettre en réseau les acteurs locaux et les partenaires nationaux et internationaux.",
      "Encourager des projets verts tels que le recyclage et l’agroforesterie.",
      "Collaborer avec les pouvoirs publics, les collectivités, les ONG, les organismes nationaux et internationaux, les associations et les universités.",
    ],
    sections: [
      { title: "Comprendre le levier", content: "La coopération et la préservation du cadre de vie réunissent les initiatives communautaires, les partenariats et les pratiques favorables à un développement durable." },
      { title: "Finalité", content: "Encourager une action collective, une meilleure circulation des expériences et une attention durable aux ressources et aux liens sociaux." },
      { title: "Dialogue communautaire", content: "Les priorités sont discutées avec les communautés afin que les actions envisagées tiennent compte des réalités, des savoirs et des attentes locales." },
      { title: "Organiser des activités communes", content: "Des activités socioculturelles peuvent soutenir l’expression, la créativité, le dialogue intergénérationnel et la participation à la vie collective." },
      { title: "Sensibiliser", content: "Les campagnes peuvent porter sur la santé publique, l’égalité des genres, l’environnement ou d’autres thèmes définis avec les acteurs concernés." },
      { title: "Encourager des pratiques durables", content: "Des actions de sensibilisation peuvent promouvoir la protection de l’environnement, des pratiques agricoles durables et des gestes adaptés au contexte local." },
      { title: "Faire émerger des projets verts", content: "Le recyclage, l’agroforesterie ou d’autres initiatives respectueuses de l’environnement peuvent être encouragés après évaluation de leur pertinence et de leur faisabilité." },
      { title: "Construire des partenariats", content: "La coopération peut associer pouvoirs publics, collectivités, ONG, organismes nationaux et internationaux, associations et universités, selon leurs compétences." },
      { title: "Partager et apprendre", content: "Les retours d’expérience, la participation et le suivi des activités aident les partenaires à identifier les ajustements nécessaires et les pratiques à partager." },
    ],
  },
];
