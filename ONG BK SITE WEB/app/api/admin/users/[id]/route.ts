import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeApi } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";
import { selfServiceAssignableRoles } from "@/lib/rbac";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateUserSchema = z.object({
  roleCode: z.enum(selfServiceAssignableRoles).optional(),
  isActive: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0);

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const authorization = await authorizeApi("USERS_UPDATE");
  if (authorization.response) return authorization.response;
  if (
    authorization.user.roleCode !== "SYSTEM_ADMIN" ||
    !authorization.user.permissions.includes("USERS_ASSIGN_ROLE")
  ) {
    return NextResponse.json({ error: "Seul l’administrateur principal peut gérer les comptes." }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = updateUserSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({ error: "Modification invalide." }, { status: 400 });
  }
  if (id === authorization.user.id && parsed.data.isActive === false) {
    return NextResponse.json({ error: "Vous ne pouvez pas désactiver votre propre compte." }, { status: 400 });
  }

  const target = await db.user.findUnique({ where: { id }, select: { id: true, roleCode: true } });
  if (!target) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  if (target.roleCode === "SYSTEM_ADMIN") {
    return NextResponse.json({ error: "Le compte administrateur principal ne peut pas être modifié ici." }, { status: 403 });
  }

  const updated = await db.$transaction(async (transaction) => {
    const user = await transaction.user.update({
      where: { id },
      data: {
        ...(parsed.data.roleCode ? { roleCode: parsed.data.roleCode } : {}),
        ...(parsed.data.isActive !== undefined
          ? { isActive: parsed.data.isActive, archivedAt: parsed.data.isActive ? null : new Date() }
          : {}),
      },
      select: { id: true, email: true, roleCode: true, isActive: true },
    });
    if (parsed.data.roleCode || parsed.data.isActive === false) {
      await transaction.session.deleteMany({ where: { userId: id } });
    }
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: parsed.data.roleCode ? "PERMISSION_CHANGED" : "USER_UPDATED",
        subjectType: "user",
        subjectId: id,
      },
    });
    return user;
  });
  return NextResponse.json(updated, { headers: { "Cache-Control": "no-store" } });
}
