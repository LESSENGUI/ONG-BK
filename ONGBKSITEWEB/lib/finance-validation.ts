import { z } from "zod";

const identifier = z.string().trim().min(1).max(191);
const amount = z
  .string()
  .trim()
  .regex(/^(?:0|[1-9]\d{0,15})(?:\.\d{1,2})?$/, "Montant invalide.")
  .refine((value) => Number(value) > 0, "Le montant doit être supérieur à zéro.");
const currency = z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/);
const date = z.string().datetime({ offset: true });
const optionalId = z.union([identifier, z.literal("")]).transform((value) => value || null);

export const financialPeriodSchema = z
  .object({
    name: z.string().trim().min(3).max(120),
    startsAt: date,
    endsAt: date,
    responsibleId: identifier,
  })
  .strict()
  .refine(
    (value) => new Date(value.startsAt).getTime() < new Date(value.endsAt).getTime(),
    { path: ["endsAt"], message: "La fin de l’exercice doit être postérieure à son début." },
  );

export const financeBudgetSchema = z
  .object({
    periodId: identifier,
    category: z.string().trim().min(2).max(120),
    domain: z.string().trim().min(2).max(120),
    initialAmount: amount,
    revisedAmount: amount,
    currency,
    justification: z.string().trim().min(10).max(4000),
    fundingSource: z.union([z.string().trim().max(240), z.literal("")]).optional(),
    projectId: optionalId.optional(),
    activityId: optionalId.optional(),
  })
  .strict();

export const financeIncomeSchema = z
  .object({
    periodId: identifier,
    date,
    amount,
    currency,
    category: z.enum([
      "MEMBERSHIP_DUES",
      "DONATION",
      "GRANT",
      "PARTNERSHIP",
      "EVENT",
      "SPONSORSHIP",
      "OTHER",
    ]),
    source: z.string().trim().min(2).max(240),
    status: z.enum(["EXPECTED", "COMMITTED", "RECEIVED"]),
    paymentMethod: z.union([z.string().trim().max(80), z.literal("")]).optional(),
    receiptKey: z.union([identifier, z.literal("")]).optional(),
    observations: z.string().trim().max(2000).optional(),
    projectId: optionalId.optional(),
    activityId: optionalId.optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.status !== "RECEIVED" ||
      Boolean(value.receiptKey && value.paymentMethod),
    { path: ["receiptKey"], message: "Un justificatif et le mode de paiement sont requis pour une recette encaissée." },
  );

export const financeExpenseSchema = z
  .object({
    periodId: identifier,
    amount,
    currency,
    category: z.string().trim().min(2).max(120),
    purpose: z.string().trim().min(10).max(2000),
    beneficiary: z.union([z.string().trim().max(240), z.literal("")]).optional(),
    projectId: optionalId.optional(),
    activityId: optionalId.optional(),
    observations: z.string().trim().max(2000).optional(),
  })
  .strict();

export const expenseTransitionSchema = z
  .object({
    transition: z.enum([
      "SUBMITTED",
      "UNDER_REVIEW",
      "PENDING_APPROVAL",
      "APPROVED",
      "REJECTED",
      "PAID",
      "CANCELLED",
      "ARCHIVED",
    ]),
    note: z.string().trim().max(1000).optional(),
    paymentMethod: z.string().trim().min(2).max(80).optional(),
    receiptKey: identifier.optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.transition !== "PAID" ||
      Boolean(value.paymentMethod && value.receiptKey),
    { path: ["receiptKey"], message: "Le mode de paiement et le justificatif sont requis." },
  );

export const cceFindingSchema = z
  .object({
    title: z.string().trim().min(3).max(240),
    observation: z.string().trim().min(10).max(5000),
    recommendation: z.string().trim().min(10).max(5000),
    dueAt: date.optional(),
    assigneeId: optionalId.optional(),
  })
  .strict();

export const cceResponseSchema = z
  .object({
    response: z.string().trim().min(5).max(5000),
    corrective: z.string().trim().max(5000).optional(),
  })
  .strict();
