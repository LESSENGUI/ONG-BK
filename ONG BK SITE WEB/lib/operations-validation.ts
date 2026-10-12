import { z } from "zod";

const textList = z.array(z.string().trim().min(1).max(500)).max(40).default([]);
const ids = z.array(z.string().min(1).max(191)).max(100).default([]);
const dateValue = z.string().date().nullable().optional();
const nonNegativeValue = z.number().finite().nonnegative().nullable().optional();

export const projectSchema = z
  .object({
    reference: z.string().trim().min(1).max(60).regex(/^[A-Za-z0-9_-]+$/),
    title: z.string().trim().min(1).max(240),
    description: z.string().max(20_000).default(""),
    justification: z.string().max(20_000).default(""),
    problemStatement: z.string().max(20_000).default(""),
    targetBeneficiaries: z.string().max(10_000).default(""),
    generalObjective: z.string().max(10_000).default(""),
    specificObjectives: textList,
    domain: z.string().trim().min(1).max(120),
    geographicArea: z.string().trim().max(240).default(""),
    plannedBudget: nonNegativeValue,
    plannedBudgetCurrency: z.string().trim().toUpperCase().length(3).nullable().optional(),
    expectedResults: z.string().max(20_000).default(""),
    actualResults: z.string().max(20_000).default(""),
    difficulties: z.string().max(20_000).default(""),
    correctiveMeasures: z.string().max(20_000).default(""),
    startDate: dateValue,
    endDate: dateValue,
    managerId: z.string().min(1).max(191).nullable().optional(),
    teamMemberIds: ids,
    partnerIds: ids,
    documentIds: ids,
    stages: z.array(z.object({
      title: z.string().trim().min(1).max(220),
      description: z.string().max(5_000).default(""),
      startDate: dateValue,
      endDate: dateValue,
    }).strict()).max(100).default([]),
    indicators: z.array(z.object({
      name: z.string().trim().min(1).max(220),
      unit: z.string().trim().min(1).max(60),
      plannedValue: nonNegativeValue,
      actualValue: nonNegativeValue,
      measurement: z.enum(["PLANNED", "ESTIMATED", "REALIZED", "VERIFIED"]).default("PLANNED"),
      evidence: z.string().max(5000).default(""),
      measuredAt: dateValue,
    }).strict()).max(100).default([]),
  })
  .strict()
  .refine((value) => !value.startDate || !value.endDate || value.endDate >= value.startDate, {
    path: ["endDate"],
    message: "La fin du projet ne peut pas précéder son début.",
  })
  .refine((value) => value.indicators.every((item) =>
    item.measurement === "PLANNED" || item.actualValue !== null && item.actualValue !== undefined,
  ), {
    path: ["indicators"],
    message: "Une mesure réalisée, estimée ou vérifiée doit avoir une valeur réelle renseignée.",
  });

export const activitySchema = z
  .object({
    title: z.string().trim().min(1).max(240),
    description: z.string().max(20_000).default(""),
    eventDate: z.string().datetime().nullable().optional(),
    location: z.string().trim().max(240).default(""),
    domain: z.string().trim().min(1).max(120),
    projectId: z.string().min(1).max(191).nullable().optional(),
    managerId: z.string().min(1).max(191).nullable().optional(),
    objectives: z.string().max(10_000).default(""),
    plannedParticipants: z.number().int().nonnegative().nullable().optional(),
    realizedParticipants: z.number().int().nonnegative().nullable().optional(),
    resourcesUsed: z.string().max(10_000).default(""),
    results: z.string().max(20_000).default(""),
    difficulties: z.string().max(10_000).default(""),
    correctiveMeasures: z.string().max(10_000).default(""),
    report: z.string().max(20_000).default(""),
    partnerIds: ids,
    documentIds: ids,
    indicators: z.array(z.object({
      category: z.string().trim().min(1).max(180),
      unit: z.string().trim().min(1).max(60).default("personnes"),
      plannedValue: nonNegativeValue,
      actualValue: nonNegativeValue,
      measurement: z.enum(["PLANNED", "ESTIMATED", "REALIZED", "VERIFIED"]).default("PLANNED"),
    }).strict()).max(100).default([]),
  })
  .strict()
  .refine((value) => value.indicators.every((item) =>
    item.measurement === "PLANNED" || item.actualValue !== null && item.actualValue !== undefined,
  ), {
    path: ["indicators"],
    message: "Une mesure réalisée, estimée ou vérifiée doit avoir une valeur réelle renseignée.",
  });

export const partnerSchema = z.object({
  name: z.string().trim().min(1).max(240),
  category: z.enum(["INSTITUTIONAL", "TECHNICAL", "FINANCIAL", "ASSOCIATIVE", "OTHER"]),
  description: z.string().max(20_000).default(""),
  logoPath: z.string().max(500).optional().or(z.literal("")),
  publicEmail: z.string().trim().email().max(254).optional().or(z.literal("")),
  publicPhone: z.string().trim().max(40).optional().or(z.literal("")),
  website: z.string().trim().url().max(500).optional().or(z.literal("")),
  contactName: z.string().trim().max(180).optional().or(z.literal("")),
  contactEmail: z.string().trim().email().max(254).optional().or(z.literal("")),
  contactPhone: z.string().trim().max(40).optional().or(z.literal("")),
  collaboration: z.string().max(20_000).default(""),
  startDate: dateValue,
  endDate: dateValue,
  documentIds: ids,
  status: z.enum(["PROSPECT", "ACTIVE", "INACTIVE", "ARCHIVED"]).default("PROSPECT"),
  showOnPublicSite: z.boolean().default(false),
}).strict().refine((value) => !value.startDate || !value.endDate || value.endDate >= value.startDate, {
  path: ["endDate"],
  message: "La fin du partenariat ne peut pas précéder son début.",
});

export const publicationSchema = z.object({
  type: z.enum([
    "NEWS", "ANNOUNCEMENT", "PRESS_RELEASE", "ACTIVITY_REPORT",
    "VOLUNTEER_CALL", "PROJECT_CALL", "TRAINING_CALL", "CAMPAIGN", "PUBLICATION", "REPORT",
  ]),
  title: z.string().trim().min(1).max(240),
  slug: z.string().trim().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  summary: z.string().trim().min(1).max(1000),
  body: z.string().trim().min(1).max(50_000),
  category: z.string().trim().max(120).default(""),
  tags: z.array(z.string().trim().min(1).max(60)).max(30).default([]),
  coverMediaId: z.string().min(1).max(191).nullable().optional(),
  galleryMediaIds: ids,
  action: z.enum(["save", "submit", "publish", "archive"]).default("save"),
}).strict();

export const publicSubmissionSchema = z.object({
  type: z.enum(["CONTACT", "PARTNERSHIP", "PROJECT_PROPOSAL", "VOLUNTEER", "APPLICATION"]),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().min(1).max(240),
  message: z.string().trim().min(10).max(10_000),
  organization: z.string().trim().max(240).optional().or(z.literal("")),
  consent: z.literal(true),
  website: z.string().max(0).optional(),
}).strict();

export const submissionUpdateSchema = z.object({
  status: z.enum(["IN_PROGRESS", "NEEDS_INFORMATION", "ANSWERED", "CLOSED", "ARCHIVED"]),
  internalNotes: z.string().max(20_000).optional(),
  reply: z.string().max(10_000).optional(),
  assigneeId: z.string().min(1).max(191).nullable().optional(),
  note: z.string().trim().max(1000).optional(),
}).strict();

export const mediaMetadataSchema = z.object({
  title: z.string().trim().min(1).max(240),
  caption: z.string().max(1000).default(""),
  altText: z.string().max(500).default(""),
  source: z.string().max(240).default(""),
  usageRights: z.string().max(500).default(""),
  capturedAt: dateValue,
  projectId: z.string().min(1).max(191).nullable().optional(),
  activityId: z.string().min(1).max(191).nullable().optional(),
}).strict();

export const projectTransitions = {
  DRAFT: ["PENDING_REVIEW", "ARCHIVED"],
  PENDING_REVIEW: ["DRAFT", "PLANNED", "ARCHIVED"],
  PLANNED: ["IN_PROGRESS", "SUSPENDED", "ARCHIVED"],
  IN_PROGRESS: ["SUSPENDED", "COMPLETED", "ARCHIVED"],
  SUSPENDED: ["IN_PROGRESS", "COMPLETED", "ARCHIVED"],
  COMPLETED: ["CLOSED", "ARCHIVED"],
  CLOSED: ["ARCHIVED"],
  ARCHIVED: [],
} as const;

export const activityTransitions = {
  DRAFT: ["PLANNED", "CANCELLED"],
  PLANNED: ["IN_PROGRESS", "COMPLETED", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
} as const;

export function canTransitionProject(from: keyof typeof projectTransitions, to: string): boolean {
  return (projectTransitions[from] as readonly string[]).includes(to);
}

export function canTransitionActivity(from: keyof typeof activityTransitions, to: string): boolean {
  return (activityTransitions[from] as readonly string[]).includes(to);
}
