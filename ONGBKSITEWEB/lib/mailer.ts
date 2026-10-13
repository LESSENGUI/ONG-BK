import "server-only";

import nodemailer from "nodemailer";
import { z } from "zod";

const mailConfigurationSchema = z.object({
  host: z.string().min(1),
  port: z.coerce.number().int().min(1).max(65535),
  secure: z.enum(["true", "false"]).transform((value) => value === "true"),
  user: z.string().min(1),
  password: z.string().min(1),
  from: z.string().email().or(z.string().min(3)),
  appUrl: z
    .string()
    .url()
    .refine(
      (value) =>
        ["http:", "https:"].includes(new URL(value).protocol) &&
        (process.env.NODE_ENV !== "production" || new URL(value).protocol === "https:"),
    ),
});

export async function sendPasswordResetEmail(
  email: string,
  token: string | null,
): Promise<void> {
  const result = mailConfigurationSchema.safeParse({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ?? "587",
    secure: process.env.SMTP_SECURE ?? "false",
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM,
    appUrl: process.env.APP_URL,
  });

  if (!result.success) {
    throw new Error("SMTP password recovery is not configured.");
  }

  const { host, port, secure, user, password, from, appUrl } = result.data;
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    auth: { user, pass: password },
  });
  const resetUrl = token
    ? new URL("/admin/reset-password", appUrl)
    : null;
  if (resetUrl && token) resetUrl.searchParams.set("token", token);

  await transporter.sendMail({
    from,
    to: email,
    subject: "Réinitialisation de votre mot de passe ONG-BK",
    text: resetUrl
      ? `Une demande de réinitialisation a été effectuée. Ce lien expire dans 30 minutes : ${resetUrl.toString()}\n\nSi vous n’êtes pas à l’origine de cette demande, ignorez ce message.`
      : "Une demande de récupération a été effectuée pour cette adresse. Si elle correspond à un compte actif, un lien de réinitialisation sera envoyé. Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.",
  });
}
