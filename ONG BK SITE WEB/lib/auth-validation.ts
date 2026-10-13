import { z } from "zod";

const email = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((value) => value.toLowerCase());

const password = z
  .string()
  .min(12, "Le mot de passe doit contenir au moins 12 caractères.")
  .max(72, "Le mot de passe dépasse la limite sécurisée.")
  .refine((value) => Buffer.byteLength(value, "utf8") <= 72, {
    message: "Le mot de passe dépasse la limite sécurisée.",
  });

export const loginSchema = z.object({
  email,
  password: z
    .string()
    .min(1)
    .max(72)
    .refine((value) => Buffer.byteLength(value, "utf8") <= 72),
}).strict();

export const initialAdminSchema = z
  .object({
    setupSecret: z.string().min(32).max(256),
    email,
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    password,
    confirmPassword: z.string(),
  })
  .strict()
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas.",
  });

export const passwordResetRequestSchema = z.object({ email }).strict();

export const passwordResetSchema = z
  .object({
    token: z.string().min(32).max(128),
    password,
    confirmPassword: z.string(),
  })
  .strict()
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas.",
  });

export const systemSettingsSchema = z
  .object({
    siteName: z.string().trim().min(2).max(120),
    contactEmail: z.union([z.literal(""), email]),
    defaultLocale: z.enum(["fr"]),
    timeZone: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .refine((value) => {
        try {
          new Intl.DateTimeFormat("fr", { timeZone: value });
          return true;
        } catch {
          return false;
        }
      }, "Fuseau horaire invalide."),
  })
  .strict();

export function parseJson<T>(
  schema: z.ZodType<T>,
  input: unknown,
): T | null {
  const result = schema.safeParse(input);
  return result.success ? result.data : null;
}
