import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { CceFindingStatus } from "@prisma/client";
import { authorizeApi } from "@/lib/api-auth";
import { cceFindingSchema } from "@/lib/finance-validation";
import { db } from "@/lib/db";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await authorizeApi("CCE_FINDINGS_READ");
  if (authorization.response) return authorization.response;
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const statusFilter = Object.values(CceFindingStatus).find((value) => value === status);
  const findings = await db.cceFinding.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
    take: 500,
    select: {
      id: true,
      reference: true,
      title: true,
      observation: true,
      recommendation: true,
      status: true,
      dueAt: true,
      createdAt: true,
      assignee: { select: { email: true, profile: { select: { firstName: true, lastName: true } } } },
      createdBy: { select: { email: true } },
      responses: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          response: true,
          corrective: true,
          createdAt: true,
          author: { select: { email: true, profile: { select: { firstName: true, lastName: true } } } },
        },
      },
      history: {
        orderBy: { createdAt: "asc" },
        select: {
          fromStatus: true,
          toStatus: true,
          note: true,
          createdAt: true,
          actor: { select: { email: true } },
        },
      },
    },
  });
  return NextResponse.json(findings, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const authorization = await authorizeApi("CCE_FINDINGS_CREATE");
  if (authorization.response) return authorization.response;
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = cceFindingSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Constat invalide." }, { status: 400 });
  if (parsed.data.assigneeId) {
    const assignee = await db.user.findFirst({
      where: { id: parsed.data.assigneeId, isActive: true, archivedAt: null },
      select: { id: true },
    });
    if (!assignee) {
      return NextResponse.json({ error: "Le responsable de suivi est inactif ou introuvable." }, { status: 400 });
    }
  }

  const finding = await db.$transaction(async (transaction) => {
    const created = await transaction.cceFinding.create({
      data: {
        reference: `CCE-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
        title: parsed.data.title,
        observation: parsed.data.observation,
        recommendation: parsed.data.recommendation,
        dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
        assigneeId: parsed.data.assigneeId,
        createdById: authorization.user.id,
      },
      select: { id: true, reference: true, title: true, status: true },
    });
    await transaction.cceFindingEvent.create({
      data: {
        findingId: created.id,
        actorId: authorization.user.id,
        toStatus: "OPEN",
        note: "Création du constat et de la recommandation.",
      },
    });
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: "SENSITIVE_OPERATION",
        subjectType: "cce-finding",
        subjectId: created.id,
      },
    });
    return created;
  });
  return NextResponse.json(finding, { status: 201, headers: { "Cache-Control": "no-store" } });
}
