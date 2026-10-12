import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeApi } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { publicationSchema } from "@/lib/operations-validation";
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
    const authorization = await authorizeApi("CONTENT_ARCHIVE");
    if (authorization.response) return authorization.response;
    const result = await db.$transaction(async (transaction) => {
      const publication = await transaction.publication.update({
        where: { id },
        data: { status: "ARCHIVED", archivedAt: new Date() },
        select: { id: true, title: true, status: true },
      });
      await transaction.auditLog.create({ data: { actorId: authorization.user.id, event: "SENSITIVE_OPERATION", subjectType: "publication-archive", subjectId: id } });
      return publication;
    });
    return NextResponse.json(result);
  }
  const parsed = publicationSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Les données de la publication sont invalides." }, { status: 400 });
  const requestedAction = parsed.data.action;
  const authorization = await authorizeApi(
    requestedAction === "publish" ? "CONTENT_APPROVE"
      : requestedAction === "archive" ? "CONTENT_ARCHIVE"
        : "CONTENT_UPDATE",
  );
  if (authorization.response) return authorization.response;
  const current = await db.publication.findUnique({
    where: { id },
    include: { gallery: { orderBy: { sortOrder: "asc" } } },
  });
  if (!current || current.archivedAt) return NextResponse.json({ error: "Publication introuvable." }, { status: 404 });
  const slugConflict = await db.publication.findFirst({ where: { slug: parsed.data.slug, id: { not: id } }, select: { id: true } });
  if (slugConflict) return NextResponse.json({ error: "Ce slug est déjà utilisé." }, { status: 409 });
  const requestedMediaIds = [...new Set([
    ...parsed.data.galleryMediaIds,
    ...(parsed.data.coverMediaId ? [parsed.data.coverMediaId] : []),
  ])];
  const media = await db.mediaAsset.findMany({
    where: { id: { in: requestedMediaIds }, status: "PUBLISHED", archivedAt: null },
    select: { id: true },
  });
  if (media.length !== requestedMediaIds.length) {
    return NextResponse.json({ error: "La couverture et la galerie doivent utiliser des médias publiés." }, { status: 400 });
  }
  const status = requestedAction === "publish" ? "PUBLISHED"
    : requestedAction === "submit" ? "PENDING_REVIEW"
      : current.status === "PUBLISHED" ? "PENDING_REVIEW" : "DRAFT";
  const result = await db.$transaction(async (transaction) => {
    await transaction.publicationRevision.create({
      data: {
        publicationId: id,
        version: current.version,
        title: current.title,
        summary: current.summary,
        body: current.body,
        editorId: authorization.user.id,
      },
    });
    const publication = await transaction.publication.update({
      where: { id },
      data: {
        type: parsed.data.type,
        title: parsed.data.title,
        slug: parsed.data.slug,
        summary: parsed.data.summary,
        body: parsed.data.body,
        category: parsed.data.category,
        tags: parsed.data.tags,
        coverMediaId: parsed.data.coverMediaId || null,
        status,
        version: { increment: 1 },
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        ...(status === "PUBLISHED" ? { reviewerId: authorization.user.id, reviewedAt: new Date() } : {}),
        gallery: {
          deleteMany: {},
          create: parsed.data.galleryMediaIds.map((mediaId, sortOrder) => ({ mediaId, sortOrder })),
        },
      },
      select: { id: true, title: true, slug: true, status: true, version: true, publishedAt: true },
    });
    await transaction.auditLog.create({
      data: { actorId: authorization.user.id, event: status === "PUBLISHED" ? "SENSITIVE_OPERATION" : "USER_UPDATED", subjectType: "publication", subjectId: id },
    });
    return publication;
  });
  return NextResponse.json(result);
}
