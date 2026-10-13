import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/auth-validation";
import { db } from "@/lib/db";
import { readJsonBody } from "@/lib/request-body";
import {
  clearFailedAttempts,
  enforceRequestOrigin,
  getSessionLifetimeMs,
  getClientIp,
  hashSecret,
  isThrottled,
  recordAudit,
  recordFailedAttempt,
  setSessionCookie,
  createSecret,
} from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const dummyHash = bcrypt.hashSync("not-a-real-account-password", 12);

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
  const parsed = loginSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({ error: "Adresse e-mail ou mot de passe invalide." }, { status: 400 });
  }

  const clientIp = getClientIp(request);
  const throttleKeys = [
    `login-attempt:${parsed.data.email}:${clientIp ?? "unavailable"}`,
    ...(clientIp ? [`login-ip:${clientIp}`] : []),
  ];
  if (await Promise.all(throttleKeys.map(isThrottled)).then((results) => results.some(Boolean))) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans 15 minutes." },
      { status: 429, headers: { "Retry-After": "900" } },
    );
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, passwordHash: true, isActive: true, archivedAt: true },
  });
  const passwordMatches = await bcrypt.compare(
    parsed.data.password,
    user?.passwordHash ?? dummyHash,
  );

  if (!user || !passwordMatches || !user.isActive || user.archivedAt) {
    await Promise.all(throttleKeys.map(recordFailedAttempt));
    await recordAudit("LOGIN_FAILED");
    return NextResponse.json(
      { error: "Adresse e-mail ou mot de passe invalide." },
      { status: 401 },
    );
  }

  await clearFailedAttempts(`login-attempt:${parsed.data.email}:${clientIp ?? "unavailable"}`);
  const token = createSecret();
  const expiresAt = new Date(Date.now() + getSessionLifetimeMs());
  await db.$transaction(async (transaction) => {
    await transaction.session.deleteMany({ where: { expiresAt: { lte: new Date() } } });
    await transaction.session.create({
      data: { userId: user.id, tokenHash: hashSecret(token), expiresAt },
    });
    await transaction.auditLog.create({
      data: { actorId: user.id, event: "LOGIN_SUCCEEDED" },
    });
  });
  await setSessionCookie(token, expiresAt);
  return NextResponse.json({ ok: true, redirectTo: "/admin/dashboard" });
}
