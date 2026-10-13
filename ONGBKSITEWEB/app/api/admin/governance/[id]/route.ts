import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/api-auth";
import { mandateSchema } from "@/lib/institution-validation";
import { db } from "@/lib/db";
import { canReadDocument } from "@/lib/private-documents";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = mandateSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Mandat invalide." }, { status: 400 });
  const { id } = await context.params;
  const existing = await db.governingMandate.findUnique({
    where: { id },
    select: { id: true, bodyCode: true, positionCode: true, memberId: true },
  });
  if (!existing) return NextResponse.json({ error: "Mandat introuvable." }, { status: 404 });
  if (
    existing.positionCode !== parsed.data.positionCode ||
    existing.bodyCode !== parsed.data.bodyCode ||
    existing.memberId !== parsed.data.memberId
  ) {
    return NextResponse.json(
      { error: "Le titulaire, le poste et l’organe d’un mandat existant sont immuables. Créez un nouveau mandat pour une nouvelle nomination." },
      { status: 409 },
    );
  }
  const updatePermission = existing.bodyCode === "EXECUTIVE_BOARD"
    ? "BE_GOVERNANCE_UPDATE"
    : "CCE_GOVERNANCE_UPDATE";
  const authorization = await authorizeApi(updatePermission);
  if (authorization.response) return authorization.response;
  if (parsed.data.status === "COMPLETED" || parsed.data.status === "REVOKED") {
    const archivePermission = existing.bodyCode === "EXECUTIVE_BOARD"
      ? "BE_GOVERNANCE_ARCHIVE"
      : "CCE_GOVERNANCE_ARCHIVE";
    const archiveAuthorization = await authorizeApi(archivePermission);
    if (archiveAuthorization.response) return archiveAuthorization.response;
  }
  if (parsed.data.status === "ACTIVE") {
    const approvalPermission = existing.bodyCode === "EXECUTIVE_BOARD"
      ? "BE_GOVERNANCE_APPROVE"
      : "CCE_GOVERNANCE_APPROVE";
    const approval = await authorizeApi(approvalPermission);
    if (approval.response) return approval.response;
  }
  if (parsed.data.appointmentDocumentId) {
    const document = await db.officialDocument.findUnique({
      where: { id: parsed.data.appointmentDocumentId },
      select: { category: true, confidentiality: true, archivedAt: true },
    });
    if (
      !document ||
      document.category !== "APPOINTMENT" ||
      document.archivedAt ||
      !canReadDocument(authorization.user, document.confidentiality)
    ) {
      return NextResponse.json({ error: "Document de nomination introuvable ou non autorisé." }, { status: 422 });
    }
  }
  if (parsed.data.status === "ACTIVE") {
    const active = await db.governingMandate.findFirst({
      where: {
        id: { not: id },
        bodyCode: parsed.data.bodyCode,
        positionCode: parsed.data.positionCode,
        status: "ACTIVE",
      },
      select: { id: true },
    });
    if (active) return NextResponse.json({ error: "Un mandat actif existe déjà pour ce poste." }, { status: 409 });
  }
  const updated = await db.$transaction(async (transaction) => {
    const mandate = await transaction.governingMandate.update({
      where: { id },
      data: {
        activeSlot: parsed.data.status === "ACTIVE" ? parsed.data.positionCode : null,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
        status: parsed.data.status,
        biography: parsed.data.biography || null,
        photoPath: parsed.data.photoPath || null,
        appointmentDocumentId: parsed.data.appointmentDocumentId || null,
      },
      select: { id: true, status: true },
    });
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: parsed.data.status === "COMPLETED" || parsed.data.status === "REVOKED"
          ? "USER_ARCHIVED"
          : "USER_UPDATED",
        subjectType: "governing-mandate",
        subjectId: id,
      },
    });
    return mandate;
  }).catch((error: unknown) => {
    if (error instanceof Error && "code" in error && error.code === "P2002") return null;
    throw error;
  });
  if (!updated) return NextResponse.json({ error: "Un mandat actif existe déjà pour ce poste." }, { status: 409 });
  return NextResponse.json(updated);
}
