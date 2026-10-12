import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeApi } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { partnerSchema } from "@/lib/operations-validation";
import { canReadDocument } from "@/lib/private-documents";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const archiveSchema = z.object({ action: z.literal("archive") }).strict();

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await enforceRequestOrigin(request))) return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  const { id } = await context.params;
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const archive = archiveSchema.safeParse(body.value);
  if (archive.success) {
    const authorization = await authorizeApi("PARTNERS_ARCHIVE");
    if (authorization.response) return authorization.response;
    const result = await db.$transaction(async (transaction) => {
      const partner = await transaction.partner.update({
        where: { id },
        data: { status: "ARCHIVED", showOnPublicSite: false },
        select: { id: true, name: true, status: true },
      });
      await transaction.auditLog.create({ data: { actorId: authorization.user.id, event: "SENSITIVE_OPERATION", subjectType: "partner-archive", subjectId: id } });
      return partner;
    });
    return NextResponse.json(result);
  }
  const parsed = partnerSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Les données du partenaire sont invalides." }, { status: 400 });
  const authorization = await authorizeApi("PARTNERS_UPDATE");
  if (authorization.response) return authorization.response;
  const linkedDocuments = await db.officialDocument.findMany({
    where: { id: { in: parsed.data.documentIds }, archivedAt: null },
    select: { id: true, confidentiality: true },
  });
  if (linkedDocuments.length !== new Set(parsed.data.documentIds).size ||
      linkedDocuments.some((document) => !canReadDocument(authorization.user, document.confidentiality))) {
    return NextResponse.json({ error: "Un document associé est invalide ou non autorisé." }, { status: 400 });
  }
  if (parsed.data.showOnPublicSite && !authorization.user.permissions.includes("PARTNERS_APPROVE")) {
    return NextResponse.json({ error: "La publication d’un partenaire doit être validée." }, { status: 403 });
  }
  const current = await db.partner.findUnique({ where: { id }, select: { showOnPublicSite: true, status: true } });
  if (!current) return NextResponse.json({ error: "Partenaire introuvable." }, { status: 404 });
  const showOnPublicSite = parsed.data.showOnPublicSite && parsed.data.status === "ACTIVE";
  const result = await db.$transaction(async (transaction) => {
    const { documentIds, ...partnerData } = parsed.data;
    const partner = await transaction.partner.update({
      where: { id },
      data: {
        ...partnerData,
        logoPath: partnerData.logoPath || null,
        publicEmail: partnerData.publicEmail || null,
        publicPhone: partnerData.publicPhone || null,
        website: partnerData.website || null,
        contactName: partnerData.contactName || null,
        contactEmail: partnerData.contactEmail || null,
        contactPhone: partnerData.contactPhone || null,
        startDate: partnerData.startDate ? new Date(partnerData.startDate) : null,
        endDate: partnerData.endDate ? new Date(partnerData.endDate) : null,
        showOnPublicSite: current.showOnPublicSite && !authorization.user.permissions.includes("PARTNERS_APPROVE")
          ? false
          : showOnPublicSite,
      },
      select: { id: true, name: true, status: true, showOnPublicSite: true },
    });
    await transaction.partnerDocument.createMany({
      data: documentIds.map((documentId) => ({ partnerId: id, documentId })),
      skipDuplicates: true,
    });
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: current.showOnPublicSite !== partner.showOnPublicSite ? "SENSITIVE_OPERATION" : "USER_UPDATED",
        subjectType: "partner",
        subjectId: id,
      },
    });
    return partner;
  });
  return NextResponse.json(result);
}
