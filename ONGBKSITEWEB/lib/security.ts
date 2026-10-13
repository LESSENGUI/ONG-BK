import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { AuditEvent, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "ongbk_session";
export const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;

export function hashSecret(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function createSecret(): string {
  return randomBytes(32).toString("base64url");
}

export function getSessionLifetimeMs(): number {
  const hours = Number(process.env.AUTH_SESSION_HOURS ?? "8");
  if (!Number.isInteger(hours) || hours < 1 || hours > 24) {
    throw new Error("AUTH_SESSION_HOURS must be an integer from 1 to 24.");
  }
  return hours * 60 * 60 * 1000;
}

export async function recordAudit(
  event: AuditEvent,
  options: {
    actorId?: string;
    subjectType?: string;
    subjectId?: string;
    transaction?: Prisma.TransactionClient;
  } = {},
): Promise<void> {
  const client = options.transaction ?? db;
  await client.auditLog.create({
    data: {
      event,
      actorId: options.actorId,
      subjectType: options.subjectType,
      subjectId: options.subjectId,
    },
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: new Date(0),
  });
}

export async function enforceRequestOrigin(
  request: Request,
): Promise<boolean> {
  const origin = request.headers.get("origin");
  const appUrl = process.env.APP_URL;
  if (!origin || !appUrl) return false;

  try {
    const configuredUrl = new URL(appUrl);
    if (process.env.NODE_ENV === "production" && configuredUrl.protocol !== "https:") {
      return false;
    }
    return (
      new URL(origin).origin === configuredUrl.origin &&
      (new URL(origin).protocol === "https:" || process.env.NODE_ENV !== "production")
    );
  } catch {
    return false;
  }
}

export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const candidate = realIp || forwarded;
  if (!candidate || candidate.length > 64) return null;
  return /^[\da-fA-F.:]+$/.test(candidate) ? candidate : null;
}

export async function isThrottled(key: string): Promise<boolean> {
  const bucket = await db.loginThrottle.findUnique({
    where: { key: hashSecret(key) },
    select: { blockedUntil: true },
  });
  return Boolean(bucket?.blockedUntil && bucket.blockedUntil > new Date());
}

export async function recordFailedAttempt(key: string): Promise<void> {
  const hashedKey = hashSecret(key);
  await db.$executeRaw`
    INSERT INTO "LoginThrottle" ("key", "count", "windowStartedAt", "blockedUntil")
    VALUES (${hashedKey}, 1, NOW(), NULL)
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "LoginThrottle"."windowStartedAt" < NOW() - INTERVAL '15 minutes'
          THEN 1
        ELSE "LoginThrottle"."count" + 1
      END,
      "windowStartedAt" = CASE
        WHEN "LoginThrottle"."windowStartedAt" < NOW() - INTERVAL '15 minutes'
          THEN NOW()
        ELSE "LoginThrottle"."windowStartedAt"
      END,
      "blockedUntil" = CASE
        WHEN "LoginThrottle"."windowStartedAt" < NOW() - INTERVAL '15 minutes'
          THEN NULL
        WHEN "LoginThrottle"."count" + 1 >= 5
          THEN NOW() + INTERVAL '15 minutes'
        ELSE "LoginThrottle"."blockedUntil"
      END
  `;
}

export async function clearFailedAttempts(key: string): Promise<void> {
  await db.loginThrottle.deleteMany({ where: { key: hashSecret(key) } });
}

export async function setSessionCookie(token: string, expiresAt: Date): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
}
