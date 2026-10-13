import bcrypt from "bcryptjs";
import { RoleCode } from "@prisma/client";
import { NextResponse } from "next/server";
import { initialAdminSchema } from "@/lib/auth-validation";
import { isInitialAdminSetupConfigured, matchesAdminSetupSecret } from "@/lib/admin-setup";
import { db } from "@/lib/db";
import { readJsonBody } from "@/lib/request-body";
import {
  createSecret,
  enforceRequestOrigin,
  getSessionLifetimeMs,
  hashSecret,
  setSessionCookie,
} from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }

  if (!isInitialAdminSetupConfigured()) {
    return NextResponse.json(
      { error: "La création initiale est désactivée. Configurez ADMIN_SETUP_SECRET." },
      { status: 503 },
    );
  }

  const body = await readJsonBody(request);
  if (!body.ok) {
    return NextResponse.json(
      { error: body.status === 413 ? "Requête trop volumineuse." : "Requête invalide." },
      { status: body.status },
    );
  }

  const parsed = initialAdminSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Vérifiez les informations et les exigences du mot de passe." },
      { status: 400 },
    );
  }
  if (!matchesAdminSetupSecret(parsed.data.setupSecret)) {
    return NextResponse.json({ error: "Code de configuration incorrect." }, { status: 403 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const token = createSecret();
  const expiresAt = new Date(Date.now() + getSessionLifetimeMs());

  try {
    await db.$transaction(async (transaction) => {
      await transaction.$queryRaw`
        SELECT "code" FROM "Role"
        WHERE "code" = ${RoleCode.SYSTEM_ADMIN}::"RoleCode"
        FOR UPDATE
      `;

      const adminRole = await transaction.role.findUnique({
        where: { code: RoleCode.SYSTEM_ADMIN },
        select: { code: true },
      });
      if (!adminRole) {
        throw new Error("ADMIN_SETUP_ROLE_MISSING");
      }
      if ((await transaction.user.count()) !== 0) {
        throw new Error("ADMIN_SETUP_ALREADY_COMPLETED");
      }

      const createdUser = await transaction.user.create({
        data: {
          email: parsed.data.email,
          passwordHash,
          roleCode: RoleCode.SYSTEM_ADMIN,
          profile: {
            create: {
              firstName: parsed.data.firstName,
              lastName: parsed.data.lastName,
              title: "Administrateur principal",
            },
          },
        },
      });

      await transaction.session.create({
        data: {
          userId: createdUser.id,
          tokenHash: hashSecret(token),
          expiresAt,
        },
      });
      await transaction.auditLog.createMany({
        data: [
          {
            actorId: createdUser.id,
            event: "USER_CREATED",
            subjectType: "user",
            subjectId: createdUser.id,
          },
          { actorId: createdUser.id, event: "LOGIN_SUCCEEDED" },
        ],
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "ADMIN_SETUP_ALREADY_COMPLETED") {
      return NextResponse.json(
        { error: "Un compte existe déjà. La création initiale est définitivement fermée." },
        { status: 409 },
      );
    }
    if (error instanceof Error && error.message === "ADMIN_SETUP_ROLE_MISSING") {
      return NextResponse.json(
        { error: "Rôle administrateur introuvable. Appliquez les migrations puis le seed." },
        { status: 503 },
      );
    }
    throw error;
  }

  await setSessionCookie(token, expiresAt);
  return NextResponse.json({ ok: true, redirectTo: "/admin/dashboard" }, { status: 201 });
}
