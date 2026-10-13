import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";
import { z } from "zod";
import { selfServiceAssignableRoles } from "@/lib/rbac";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createUserSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phone: z.string().trim().max(40).optional(),
  roleCode: z.enum(selfServiceAssignableRoles),
}).strict();

export async function GET() {
  const authorization = await authorizeApi("USERS_READ");
  if (authorization.response) return authorization.response;
  if (authorization.user.roleCode !== "SYSTEM_ADMIN") {
    return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true,
      email: true,
      roleCode: true,
      isActive: true,
      createdAt: true,
      profile: { select: { firstName: true, lastName: true, phone: true } },
      role: { select: { name: true } },
    },
  });
  return NextResponse.json(users, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const authorization = await authorizeApi("USERS_CREATE");
  if (authorization.response) return authorization.response;
  if (
    authorization.user.roleCode !== "SYSTEM_ADMIN" ||
    !authorization.user.permissions.includes("USERS_ASSIGN_ROLE")
  ) {
    return NextResponse.json({ error: "Seul l’administrateur principal peut gérer les rôles." }, { status: 403 });
  }

  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = createUserSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Données du compte invalides." }, { status: 400 });

  const temporarySecret = randomBytes(48).toString("base64url");
  const passwordHash = await bcrypt.hash(temporarySecret, 12);
  const created = await db.$transaction(async (transaction) => {
    const user = await transaction.user.create({
      data: {
        email: parsed.data.email,
        passwordHash,
        roleCode: parsed.data.roleCode,
        profile: {
          create: {
            firstName: parsed.data.firstName,
            lastName: parsed.data.lastName,
            phone: parsed.data.phone || null,
          },
        },
      },
      select: { id: true, email: true, roleCode: true, createdAt: true },
    });
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: "USER_CREATED",
        subjectType: "user",
        subjectId: user.id,
      },
    });
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: "PERMISSION_CHANGED",
        subjectType: "user-role",
        subjectId: user.id,
      },
    });
    return user;
  }).catch((error: unknown) => {
    if (error instanceof Error && "code" in error && error.code === "P2002") return null;
    throw error;
  });
  if (!created) {
    return NextResponse.json({ error: "Un compte utilise déjà cette adresse e-mail." }, { status: 409 });
  }

  return NextResponse.json(
    { ...created, nextStep: "Le nouvel utilisateur doit utiliser la récupération de mot de passe pour définir son propre secret." },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
