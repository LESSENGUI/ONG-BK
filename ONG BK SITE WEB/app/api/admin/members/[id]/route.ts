import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/api-auth";
import { memberSchema } from "@/lib/institution-validation";
import { db } from "@/lib/db";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = memberSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Fiche de membre invalide." }, { status: 400 });
  const authorization = await authorizeApi("MEMBERS_UPDATE");
  if (authorization.response) return authorization.response;
  const { id } = await context.params;

  const updated = await db.$transaction(async (transaction) => {
    const member = await transaction.member.update({
      where: { id },
      data: {
        ...parsed.data,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        locality: parsed.data.locality || null,
        joinedAt: parsed.data.joinedAt ? new Date(parsed.data.joinedAt) : null,
      },
      select: { id: true, firstName: true, lastName: true, category: true, status: true },
    });
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: "USER_UPDATED",
        subjectType: "member",
        subjectId: id,
      },
    });
    return member;
  }).catch((error: unknown) => {
    if (error instanceof Error && "code" in error && error.code === "P2025") return null;
    if (error instanceof Error && "code" in error && error.code === "P2002") return "DUPLICATE" as const;
    throw error;
  });
  if (!updated) return NextResponse.json({ error: "Membre introuvable." }, { status: 404 });
  if (updated === "DUPLICATE") return NextResponse.json({ error: "Un membre utilise déjà cette adresse électronique." }, { status: 409 });
  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const authorization = await authorizeApi("MEMBERS_ARCHIVE");
  if (authorization.response) return authorization.response;
  const { id } = await context.params;
  const member = await db.$transaction(async (transaction) => {
    const archived = await transaction.member.update({
      where: { id },
      data: { status: "ARCHIVED", archivedAt: new Date() },
      select: { id: true },
    });
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: "USER_ARCHIVED",
        subjectType: "member",
        subjectId: id,
      },
    });
    return archived;
  }).catch((error: unknown) => {
    if (error instanceof Error && "code" in error && error.code === "P2025") return null;
    throw error;
  });
  if (!member) return NextResponse.json({ error: "Membre introuvable." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
