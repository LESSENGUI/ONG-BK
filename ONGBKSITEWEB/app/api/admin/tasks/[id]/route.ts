import { NextResponse } from "next/server";
import { AdminTaskStatus } from "@prisma/client";
import { z } from "zod";
import { authorizeApi } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({ status: z.nativeEnum(AdminTaskStatus) }).strict();

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const authorization = await authorizeApi("TASKS_UPDATE");
  if (authorization.response) return authorization.response;
  const { id } = await context.params;
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = updateSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Statut de tâche invalide." }, { status: 400 });
  const task = await db.adminTask.findUnique({ where: { id }, select: { id: true, assigneeId: true } });
  if (!task) return NextResponse.json({ error: "Tâche introuvable." }, { status: 404 });
  if (
    authorization.user.roleCode !== "SYSTEM_ADMIN" &&
    task.assigneeId !== authorization.user.id
  ) {
    return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  }
  const updated = await db.$transaction(async (transaction) => {
    const result = await transaction.adminTask.update({
      where: { id },
      data: { status: parsed.data.status },
      select: { id: true, status: true, updatedAt: true },
    });
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: "SENSITIVE_OPERATION",
        subjectType: "admin-task-status",
        subjectId: id,
      },
    });
    return result;
  });
  return NextResponse.json(updated, { headers: { "Cache-Control": "no-store" } });
}
