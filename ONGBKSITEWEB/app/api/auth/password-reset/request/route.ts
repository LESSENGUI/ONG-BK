import { NextResponse } from "next/server";
import { passwordResetRequestSchema } from "@/lib/auth-validation";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { readJsonBody } from "@/lib/request-body";
import {
  createSecret,
  enforceRequestOrigin,
  getClientIp,
  hashSecret,
  isThrottled,
  PASSWORD_RESET_TTL_MS,
  recordAudit,
  recordFailedAttempt,
} from "@/lib/security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }

  const body = await readJsonBody(request);
  if (!body.ok) {
    return NextResponse.json(
      { error: body.status === 413 ? "Requête trop volumineuse." : "Requête invalide." },
      { status: body.status },
    );
  }
  const parsed = passwordResetRequestSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  }

  const clientIp = getClientIp(request);
  const throttleKeys = [
    `password-reset-email:${parsed.data.email}`,
    ...(clientIp ? [`password-reset-ip:${clientIp}`] : []),
  ];
  if (await Promise.all(throttleKeys.map(isThrottled)).then((results) => results.some(Boolean))) {
    return NextResponse.json(
      { error: "Trop de demandes. Réessayez dans 15 minutes." },
      { status: 429, headers: { "Retry-After": "900" } },
    );
  }
  await Promise.all(throttleKeys.map(recordFailedAttempt));

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, isActive: true, archivedAt: true },
  });
  const activeUser = user?.isActive && !user.archivedAt ? user : null;
  const token = activeUser ? createSecret() : null;
  if (activeUser && token) {
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
    await db.$transaction(async (transaction) => {
      await transaction.passwordResetToken.updateMany({
        where: { userId: activeUser.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      await transaction.passwordResetToken.create({
        data: { userId: activeUser.id, tokenHash: hashSecret(token), expiresAt },
      });
      await transaction.auditLog.create({
        data: {
          event: "PASSWORD_RESET_REQUESTED",
          subjectType: "user",
          subjectId: activeUser.id,
        },
      });
    });
  } else {
    await recordAudit("PASSWORD_RESET_REQUESTED");
  }

  try {
    await sendPasswordResetEmail(parsed.data.email, token);
  } catch (error) {
    if (token) {
      await db.passwordResetToken.deleteMany({ where: { tokenHash: hashSecret(token) } });
    }
    console.error("Impossible d’envoyer le courriel de réinitialisation.", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return NextResponse.json(
      { error: "Le service de récupération est temporairement indisponible." },
      { status: 503 },
    );
  }

  return NextResponse.json({
    message: "Si cette adresse correspond à un compte actif, un lien sera envoyé.",
  });
}
