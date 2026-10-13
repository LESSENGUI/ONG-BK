import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  clearSessionCookie,
  enforceRequestOrigin,
  hashSecret,
  recordAudit,
  SESSION_COOKIE,
} from "@/lib/security";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }

  const user = await getCurrentUser();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token && user) {
    await db.$transaction(async (transaction) => {
      await transaction.session.deleteMany({
        where: { tokenHash: hashSecret(token), userId: user.id },
      });
      await transaction.auditLog.create({
        data: { actorId: user.id, event: "LOGOUT" },
      });
    });
  }
  await clearSessionCookie();
  return NextResponse.json({ ok: true, redirectTo: "/admin/login" });
}
