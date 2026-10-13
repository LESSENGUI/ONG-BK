import { NextResponse } from "next/server";
import { AdminTaskStatus } from "@prisma/client";
import { z } from "zod";
import { authorizeApi } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const taskSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(4000).optional(),
  assigneeId: z.string().trim().min(1).max(191),
  dueAt: z.string().datetime({ offset: true }).optional(),
}).strict();

export async function GET() {
  const authorization = await authorizeApi("TASKS_READ");
  if (authorization.response) return authorization.response;
  const isAdministrator = authorization.user.roleCode === "SYSTEM_ADMIN";
  const tasks = await db.adminTask.findMany({
    where: isAdministrator ? undefined : { assigneeId: authorization.user.id },
    orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
    take: 500,
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      dueAt: true,
      createdAt: true,
      assignee: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
      createdBy: { select: { email: true } },
    },
  });
  return NextResponse.json(tasks, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const authorization = await authorizeApi("TASKS_ASSIGN");
  if (authorization.response) return authorization.response;
  if (authorization.user.roleCode !== "SYSTEM_ADMIN") {
    return NextResponse.json({ error: "Seul l’administrateur principal peut attribuer des tâches." }, { status: 403 });
  }
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = taskSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Tâche invalide." }, { status: 400 });
  const assignee = await db.user.findFirst({
    where: { id: parsed.data.assigneeId, isActive: true, archivedAt: null },
    select: { id: true },
  });
  if (!assignee) return NextResponse.json({ error: "Le compte destinataire est inactif ou introuvable." }, { status: 400 });

  const task = await db.$transaction(async (transaction) => {
    const created = await transaction.adminTask.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description ?? "",
        assigneeId: assignee.id,
        createdById: authorization.user.id,
        ...(parsed.data.dueAt ? { dueAt: new Date(parsed.data.dueAt) } : {}),
      },
      select: { id: true, title: true, assigneeId: true, status: true, dueAt: true, createdAt: true },
    });
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: "SENSITIVE_OPERATION",
        subjectType: "admin-task",
        subjectId: created.id,
      },
    });
    return created;
  });
  return NextResponse.json(task, { status: 201, headers: { "Cache-Control": "no-store" } });
}
