import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/api-auth";
import { documentMetadataSchema } from "@/lib/institution-validation";
import { db } from "@/lib/db";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = documentMetadataSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Métadonnées invalides." }, { status: 400 });
  const { id } = await context.params;
  const current = await db.officialDocument.findUnique({
    where: { id },
    select: { id: true, status: true, category: true, confidentiality: true, version: true },
  });
  if (!current) return NextResponse.json({ error: "Document introuvable." }, { status: 404 });

  const permission =
    parsed.data.status === "PUBLISHED" ? "DOCUMENTS_APPROVE" :
      parsed.data.status === "ARCHIVED" ? "DOCUMENTS_ARCHIVE" : "DOCUMENTS_UPDATE";
  const authorization = await authorizeApi(permission);
  if (authorization.response) return authorization.response;
  if (parsed.data.version !== current.version) {
    return NextResponse.json(
      { error: "La version du fichier est immuable. Déposez chaque version comme un nouveau document." },
      { status: 409 },
    );
  }
  const updated = await db.$transaction(async (transaction) => {
    const document = await transaction.officialDocument.update({
      where: { id },
      data: {
        title: parsed.data.title,
        category: parsed.data.category,
        documentDate: parsed.data.documentDate ? new Date(parsed.data.documentDate) : null,
        confidentiality: parsed.data.confidentiality,
        status: parsed.data.status,
        ...(parsed.data.status === "PUBLISHED" ? { publishedAt: new Date() } : {}),
        ...(parsed.data.status === "ARCHIVED" ? { archivedAt: new Date() } : {}),
      },
      select: { id: true, title: true, status: true, confidentiality: true },
    });
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: parsed.data.status === "PUBLISHED" ? "SENSITIVE_OPERATION" : "USER_UPDATED",
        subjectType: `official-document:${current.category}`,
        subjectId: id,
      },
    });
    return document;
  });
  return NextResponse.json(updated);
}
