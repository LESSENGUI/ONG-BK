import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";

export function isInitialAdminSetupConfigured(): boolean {
  const secret = process.env.ADMIN_SETUP_SECRET;
  return Boolean(secret && Buffer.byteLength(secret, "utf8") >= 32);
}

export async function hasAnyUser(): Promise<boolean> {
  return (await db.user.count()) > 0;
}

export function matchesAdminSetupSecret(candidate: string): boolean {
  const configured = process.env.ADMIN_SETUP_SECRET;
  if (!configured || Buffer.byteLength(configured, "utf8") < 32) return false;

  const configuredHash = createHash("sha256").update(configured).digest();
  const candidateHash = createHash("sha256").update(candidate).digest();
  return timingSafeEqual(configuredHash, candidateHash);
}
