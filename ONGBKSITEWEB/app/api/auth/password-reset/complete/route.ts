import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { passwordResetSchema } from "@/lib/auth-validation";
import { db } from "@/lib/db";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin, hashSecret } from "@/lib/security";

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
  const parsed = passwordResetSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides ou mot de passe trop faible." }, { status: 400 });
  }

  const tokenHash = hashSecret(parsed.data.token);
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const now = new Date();
  const completed = await db.$transaction(async (transaction) => {
    const resetToken = await transaction.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: now }, user: { isActive: true, archivedAt: null } },
      select: { id: true, userId: true },
    });
    if (!resetToken) return false;

    const consumed = await transaction.passwordResetToken.updateMany({
      where: { id: resetToken.id, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    });
    if (consumed.count !== 1) return false;

    await transaction.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });
    await transaction.session.deleteMany({ where: { userId: resetToken.userId } });
    await transaction.passwordResetToken.updateMany({
      where: { userId: resetToken.userId, usedAt: null },
      data: { usedAt: now },
    });
    await transaction.auditLog.create({
      data: {
        event: "PASSWORD_RESET_COMPLETED",
        subjectType: "user",
        subjectId: resetToken.userId,
      },
    });
    return true;
  });

  if (!completed) {
    return NextResponse.json(
      { error: "Ce lien est invalide ou a expiré. Demandez un nouveau lien." },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true, redirectTo: "/admin/login?reset=success" });
}
