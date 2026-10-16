export type GovernanceSection = {
  title: string;
  content: string;
  items?: string[];
};

export type GovernanceOrgan = {
  slug: string;
  shortTitle: string;
  title: string;
  eyebrow: string;
  summary: string;
  composition: string;
  responsibilities: string[];
  sections: GovernanceSection[];
};

export const governanceOrgans: GovernanceOrgan[] = [
  {
    slug: "assemblee-generale",
    shortTitle: "Assemblée générale",
    title: "Assemblée générale (AG)",
    eyebrow: "Organe souverain",
    summary: "L’Assemblée générale réunit les membres de l’ONG BK et fixe ses orientations collectives.",
    composition: "Elle est constituée de l’ensemble des membres de l’O.N.G BK.",
    responsibilities: [
      "Adopter et modifier les statuts ainsi que le règlement intérieur.",
      "Définir les grandes orientations et décider de l’affiliation à d’autres associations internationales.",
      "Élire le Bureau exécutif et la Commission de contrôle et d’évaluation.",
      "Examiner les rapports d’activités et financiers, donner quitus au Bureau exécutif, voter le budget et approuver le programme d’activités.",
      "Fixer les taux de cotisation, statuer sur l’exclusion d’un membre pour faute grave et décider de la dissolution ainsi que de la destination des biens.",
      "Délibérer sur les questions inscrites à l’ordre du jour.",
    ],
    sections: [
      { title: "Rôle dans l’organisation", content: "L’Assemblée générale est l’organe de l’O.N.G BK. Elle rassemble les membres et constitue le cadre de délibération sur les grandes orientations et les décisions qui engagent l’organisation." },
      { title: "Composition", content: "L’Assemblée générale est constituée de tous les membres de l’O.N.G BK, conformément aux statuts." },
      { title: "Convocation et sessions", content: "Elle se réunit en session ordinaire deux fois l’an sur convocation du président national. Elle peut également être convoquée lorsque les circonstances l’exigent." },
      { title: "Orientations et textes", content: "Elle adopte les statuts et le règlement intérieur, en définit les modifications éventuelles, fixe les grandes orientations et délibère sur les points inscrits à son ordre du jour." },
      { title: "Élections et membres", content: "Elle élit les membres du Bureau exécutif et de la Commission de contrôle et d’évaluation. Elle peut statuer sur l’exclusion d’un membre pour une faute jugée grave." },
      { title: "Programme et finances", content: "Elle entend et délibère sur les rapports d’activités et financiers, donne quitus au Bureau exécutif, vote le budget, approuve le programme d’activités proposé et fixe les taux de cotisations." },
      { title: "Décisions", content: "Les décisions sont prises à la majorité simple des membres. Le vote peut se tenir au scrutin secret, à main levée ou par acclamation." },
      { title: "Quorum", content: "L’Assemblée générale délibère valablement lorsque les deux tiers au moins des membres sont atteints. À défaut, elle est convoquée à nouveau avec le même ordre du jour dans un délai de quinze jours et peut alors délibérer quel que soit le nombre des membres présents." },
      { title: "Traçabilité des délibérations", content: "Les délibérations sont constatées par des procès-verbaux consignés dans un registre et signés conjointement par le président, le vice-président et le secrétaire général." },
      { title: "Dissolution et affiliation", content: "L’Assemblée générale décide de la dissolution et de la destination des biens de l’organisation, et délibère sur son affiliation à d’autres associations internationales." },
    ],
  },
  {
    slug: "bureau-executif",
    shortTitle: "Bureau exécutif",
    title: "Bureau exécutif (BE)",
    eyebrow: "Administration et mise en œuvre",
    summary: "Le Bureau exécutif administre l’organisation et assure la mise en œuvre quotidienne des décisions de l’Assemblée générale.",
    composition: "Le Bureau comprend sept membres élus parmi les membres actifs pour un mandat de trois ans renouvelable.",
    responsibilities: [
      "Mettre en œuvre les décisions de l’Assemblée générale conformément aux directives qu’elle fixe.",
      "Assurer l’administration, l’animation et la gestion quotidienne de l’O.N.G BK.",
      "Créer, au besoin, des commissions ad hoc.",
      "Arrêter le projet de budget et le soumettre à l’approbation de l’Assemblée générale.",
    ],
    sections: [
      { title: "Rôle et fonctionnement", content: "Le Bureau exécutif est l’organe d’administration, d’animation et de gestion quotidienne de l’O.N.G BK. Il met en œuvre les décisions conformément aux directives fixées par l’Assemblée générale." },
      { title: "Composition", content: "Le Bureau exécutif comprend sept membres.", items: ["Un président", "Un vice-président", "Un secrétaire général", "Un secrétaire général adjoint", "Un trésorier général", "Un trésorier général adjoint", "Un secrétaire chargé de l’organisation, de la communication, des relations publiques et des médias"] },
      { title: "Désignation", content: "Les membres du Bureau sont proposés ou élus parmi les membres actifs, au scrutin secret uninominal majoritaire à un tour." },
      { title: "Durée du mandat", content: "Le mandat est de trois ans et peut être renouvelé." },
      { title: "Exécution des décisions", content: "Le Bureau traduit les décisions de l’Assemblée générale en programmes de travail et veille à leur exécution dans le respect des orientations adoptées." },
      { title: "Administration quotidienne", content: "Il anime la vie de l’organisation et coordonne ses activités courantes, en favorisant la collaboration entre ses membres et partenaires." },
      { title: "Commissions ad hoc", content: "Le Bureau peut créer des commissions ad hoc lorsque des sujets ou des activités nécessitent une mobilisation spécifique. Leur mandat est défini selon les besoins." },
      { title: "Budget et programme", content: "Le Bureau arrête le projet de budget et le soumet à l’approbation de l’Assemblée générale. Il lui présente également le programme d’activités." },
      { title: "Responsabilités des postes", content: "Le cahier des charges précisant les missions de chaque poste est établi dans le règlement intérieur." },
      { title: "Bénévolat et redevabilité", content: "Les fonctions exercées par les membres sont bénévoles et n’entraînent pas de rémunération. Le Bureau rend compte de ses activités et de sa gestion à l’Assemblée générale." },
    ],
  },
  {
    slug: "commission-controle-evaluation",
    shortTitle: "Commission de contrôle et d’évaluation",
    title: "Commission de contrôle et d’évaluation (CCE)",
    eyebrow: "Contrôle et évaluation",
    summary: "La CCE constitue une instance distincte chargée d’exercer le contrôle et l’évaluation au sein de l’organisation.",
    composition: "Elle est composée de trois membres élus par l’Assemblée générale pour un mandat de trois ans, renouvelable deux fois.",
    responsibilities: [
      "Examiner les informations et éléments utiles à l’exercice de ses missions de contrôle.",
      "Évaluer les activités et le fonctionnement au regard des orientations et décisions de l’organisation.",
      "Formuler des observations et recommandations à l’attention des instances compétentes.",
    ],
    sections: [
      { title: "Rôle de la commission", content: "La Commission de contrôle et d’évaluation (CCE) exerce une fonction distincte de contrôle et d’évaluation. Elle contribue à la transparence et à l’apprentissage organisationnel." },
      { title: "Composition", content: "La commission comprend trois membres.", items: ["Un président", "Un vice-président", "Un rapporteur"] },
      { title: "Élection", content: "Les membres de la CCE sont élus par l’Assemblée générale." },
      { title: "Durée du mandat", content: "Le mandat est de trois ans et peut être renouvelé deux fois." },
      { title: "Contrôle", content: "Dans le cadre de ses attributions, la commission examine les éléments nécessaires pour exercer sa mission de contrôle et porte ses constats à la connaissance des instances compétentes." },
      { title: "Évaluation", content: "La commission apprécie les activités et leur cohérence avec les orientations et décisions de l’organisation, afin de contribuer à l’amélioration des pratiques." },
      { title: "Observations et recommandations", content: "Ses observations et recommandations alimentent le dialogue institutionnel. Elles ne se substituent pas à la gestion quotidienne du Bureau exécutif." },
      { title: "Indépendance fonctionnelle", content: "La distinction entre le contrôle-évaluation et la gestion exécutive favorise une lecture responsable des actions, des ressources et des résultats." },
      { title: "Redevabilité", content: "La CCE rend compte à l’Assemblée générale selon les modalités prévues par les textes de l’organisation." },
    ],
  },
  {
    slug: "representants-locaux",
    shortTitle: "Représentants locaux",
    title: "Représentants locaux des communautés",
    eyebrow: "Relais de proximité",
    summary: "Des relais désignés par le Bureau exécutif pour faciliter le dialogue entre les communautés locales et l’ONG BK.",
    composition: "Les représentants locaux sont désignés par le Bureau exécutif. Leur nombre, leur couverture territoriale et la durée de leur mission sont à formaliser par l’organisation.",
    responsibilities: [
      "Faire remonter au Bureau exécutif les besoins, priorités et propositions exprimés dans les communautés.",
      "Transmettre aux communautés les informations validées sur les activités et démarches de l’ONG BK.",
      "Faciliter la participation et le dialogue autour des initiatives locales.",
      "Partager les retours de terrain et les difficultés observées, dans le respect des personnes.",
    ],
    sections: [
      { title: "Une présence de proximité", content: "Les représentants locaux servent de relais de dialogue entre les communautés et l’ONG BK. Leur présence aide l’organisation à rester attentive aux réalités locales." },
      { title: "Désignation", content: "Selon l’orientation retenue, les représentants sont désignés par le Bureau exécutif. La désignation doit être communiquée de manière transparente aux communautés concernées." },
      { title: "Composition et couverture", content: "L’organe regroupe des relais liés aux communautés locales. Le nombre de représentants et les zones couvertes seront précisés par une décision ou un texte interne de l’ONG BK." },
      { title: "Écoute des communautés", content: "Les représentants recueillent les préoccupations, idées et priorités exprimées par les habitants, sans se substituer à leur parole ni promettre une réponse qui n’a pas été décidée." },
      { title: "Transmission d’informations", content: "Ils peuvent relayer des informations institutionnelles validées sur les programmes, consultations et activités, en veillant à leur exactitude et à leur accessibilité." },
      { title: "Participation locale", content: "Ils facilitent les échanges et encouragent une participation inclusive des jeunes, des femmes et des autres groupes concernés aux démarches auxquelles ils sont invités." },
      { title: "Retour d’expérience", content: "Ils transmettent au Bureau exécutif des retours de terrain utiles à l’adaptation des actions, dans le respect de la confidentialité et de la dignité des personnes." },
      { title: "Limites du rôle", content: "Le mandat de relais ne confère pas, à lui seul, un pouvoir de décision, de représentation juridique ou de gestion financière. Toute délégation éventuelle doit être formellement définie par l’ONG BK." },
      { title: "Cadre à préciser", content: "Les critères de désignation, la durée de mission, les modalités de reddition de compte et les éventuels renouvellements restent à formaliser dans les textes internes de l’organisation." },
    ],
  },
];

export function getGovernanceOrgan(slug: string) {
  return governanceOrgans.find((organ) => organ.slug === slug);
}
