import { z } from "zod";

export const identityKeySchema = z.enum([
  "presentation",
  "vision",
  "mission",
  "objectives",
  "domains",
  "values",
  "motto",
  "slogan",
  "history",
  "headquarters",
  "contact",
  "statutes",
]);

export const identitySchema = z
  .object({
    key: identityKeySchema,
    title: z.string().trim().min(1).max(200),
    content: z.string().max(20_000),
    imagePath: z.string().max(500).nullable().optional(),
    action: z.enum(["save", "submit", "publish", "archive"]).default("save"),
  })
  .strict();

export const publicMembershipRequestSchema = z
  .object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    locality: z.string().trim().max(160).optional().or(z.literal("")),
    motivation: z.string().trim().min(10).max(5000),
    requestedCategory: z.enum(["ACTIVE", "SUPPORTER"]).optional(),
    consent: z.literal(true),
    website: z.string().max(0).optional(),
  })
  .strict();

export const memberSchema = z
  .object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()).optional().or(z.literal("")),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    locality: z.string().trim().max(160).optional().or(z.literal("")),
    category: z.enum(["FOUNDING", "ACTIVE", "HONORARY", "SUPPORTER"]),
    status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"]).optional(),
    joinedAt: z.string().datetime().nullable().optional(),
  })
  .strict();

export const membershipDecisionSchema = z
  .object({
    status: z.enum(["UNDER_REVIEW", "NEEDS_INFORMATION", "ACCEPTED", "REJECTED", "ARCHIVED"]),
    note: z.string().trim().max(1000).optional(),
    category: z.enum(["FOUNDING", "ACTIVE", "HONORARY", "SUPPORTER"]).optional(),
  })
  .strict()
  .refine((value) => value.status !== "ACCEPTED" || Boolean(value.category), {
    path: ["category"],
    message: "La catégorie du membre doit être précisée pour accepter la demande.",
  });

export const mandateSchema = z
  .object({
    bodyCode: z.enum(["EXECUTIVE_BOARD", "CONTROL_COMMISSION"]),
    positionCode: z.enum([
      "BE_PRESIDENT",
      "BE_VICE_PRESIDENT",
      "BE_SECRETARY_GENERAL",
      "BE_DEPUTY_SECRETARY_GENERAL",
      "BE_TREASURER_GENERAL",
      "BE_DEPUTY_TREASURER_GENERAL",
      "BE_ORGANISATION_COMMUNICATION_SECRETARY",
      "CCE_PRESIDENT",
      "CCE_VICE_PRESIDENT",
      "CCE_RAPPORTEUR",
    ]),
    memberId: z.string().min(1).max(191),
    startDate: z.string().date().nullable().optional(),
    endDate: z.string().date().nullable().optional(),
    status: z.enum(["PLANNED", "ACTIVE", "COMPLETED", "REVOKED"]),
    biography: z.string().max(4000).optional().or(z.literal("")),
    photoPath: z
      .string()
      .max(500)
      .regex(/^\/images\/[A-Za-z0-9/_\-.]+$/)
      .refine((value) => !value.split("/").includes(".."))
      .optional()
      .or(z.literal("")),
    appointmentDocumentId: z.string().min(1).max(191).nullable().optional(),
  })
  .strict()
  .refine((value) => value.bodyCode === "EXECUTIVE_BOARD"
    ? value.positionCode.startsWith("BE_")
    : value.positionCode.startsWith("CCE_"), {
    path: ["positionCode"],
    message: "Le poste doit appartenir à l’organe sélectionné.",
  })
  .refine((value) => !value.startDate || !value.endDate || value.endDate >= value.startDate, {
    path: ["endDate"],
    message: "La fin du mandat ne peut pas précéder son début.",
  });

export const meetingSchema = z
  .object({
    bodyCode: z.enum(["EXECUTIVE_BOARD", "CONTROL_COMMISSION"]),
    title: z.string().trim().min(1).max(220),
    scheduledAt: z.string().datetime().nullable().optional(),
    location: z.string().trim().max(240).optional().or(z.literal("")),
    agenda: z.string().max(20_000),
    status: z.enum(["PLANNED", "HELD", "CANCELLED"]).default("PLANNED"),
    participantMemberIds: z.array(z.string().min(1).max(191)).max(100).default([]),
    minutesDocumentId: z.string().min(1).max(191).nullable().optional(),
  })
  .strict()
  .refine((value) => new Set(value.participantMemberIds).size === value.participantMemberIds.length, {
    path: ["participantMemberIds"],
    message: "Un même membre ne peut apparaître plusieurs fois.",
  });

export const meetingAttendanceSchema = z
  .object({
    memberIds: z.array(z.string().min(1).max(191)).min(1).max(100),
  })
  .strict()
  .refine((value) => new Set(value.memberIds).size === value.memberIds.length, {
    path: ["memberIds"],
    message: "Un même membre ne peut apparaître plusieurs fois.",
  });

export const meetingAttendanceDecisionSchema = z
  .object({
    memberId: z.string().min(1).max(191),
    attended: z.boolean().nullable(),
  })
  .strict();

export const decisionSchema = z
  .object({
    title: z.string().trim().min(1).max(220),
    description: z.string().trim().min(1).max(10_000),
    status: z.enum(["PROPOSED", "APPROVED", "REJECTED", "DEFERRED"]),
    actionOwner: z.string().trim().max(180).optional().or(z.literal("")),
    dueAt: z.string().datetime().nullable().optional(),
  })
  .strict();

export const documentMetadataSchema = z
  .object({
    title: z.string().trim().min(1).max(240),
    category: z.enum([
      "STATUTES",
      "INTERNAL_REGULATION",
      "MINUTES",
      "DECISION",
      "APPOINTMENT",
      "ANNUAL_REPORT",
      "ACTIVITY_REPORT",
      "FINANCIAL_REPORT",
      "AGREEMENT",
      "OTHER",
    ]),
    documentDate: z.string().date().nullable().optional(),
    version: z.string().trim().min(1).max(40).default("1"),
    confidentiality: z.enum([
      "PUBLIC",
      "INTERNAL",
      "EXECUTIVE_BOARD",
      "CONTROL_COMMISSION",
      "STRICTLY_CONFIDENTIAL",
    ]),
    status: z.enum(["DRAFT", "PENDING_REVIEW", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  })
  .strict();
