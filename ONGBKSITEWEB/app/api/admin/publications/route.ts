import { NextResponse } from "next/server";
import { ContentStatus, PublicationType, type Prisma } from "@prisma/client";
import { authorizeApi } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { publicationSchema } from "@/lib/operations-validation";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeCell(value: string) {
  return `"${(/^[\s]*[=+\-@]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const exporting = url.searchParams.get("format") === "csv";
  const authorization = await authorizeApi(exporting ? "CONTENT_EXPORT" : "CONTENT_READ");
  if (authorization.response) return authorization.response;
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? 10) || 10));
  const q = url.searchParams.get("q")?.trim().slice(0, 120);
  const status = url.searchParams.get("status");
  const type = url.searchParams.get("type");
  const where: Prisma.PublicationWhereInput = {
    archivedAt: null,
    ...(Object.values(ContentStatus).includes(status as ContentStatus) ? { status: status as ContentStatus } : {}),
    ...(Object.values(PublicationType).includes(type as PublicationType) ? { type: type as PublicationType } : {}),
    ...(q ? { OR: [
      { title: { contains: q, mode: "insensitive" } },
      { summary: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
    ] } : {}),
  };
  if (exporting) {
    const items = await db.publication.findMany({
      where, orderBy: { updatedAt: "desc" }, take: 5000,
      select: { type: true, title: true, slug: true, status: true, category: true, publishedAt: true, author: { select: { email: true } } },
    });
    const rows = [
      ["type", "title", "slug", "status", "category", "publishedAt", "author"],
      ...items.map((item) => [
        item.type, item.title, item.slug, item.status, item.category,
        item.publishedAt?.toISOString() ?? "", item.author.email,
      ]),
    ];
    return new Response(`\uFEFF${rows.map((row) => row.map(safeCell).join(",")).join("\r\n")}`, {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="ong-bk-publications.csv"', "Cache-Control": "no-store" },
    });
  }
  const [items, total] = await Promise.all([
    db.publication.findMany({
      where,
      include: {
        author: { select: { id: true, email: true } },
        reviewer: { select: { id: true, email: true } },
        coverMedia: { select: { id: true, title: true, mediaType: true, status: true } },
        gallery: { include: { media: { select: { id: true, title: true, mediaType: true, status: true } } }, orderBy: { sortOrder: "asc" } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.publication.count({ where }),
  ]);
  return NextResponse.json({ items, page, pageSize, total, pages: Math.ceil(total / pageSize) }, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  if (!(await enforceRequestOrigin(request))) return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = publicationSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Les données de la publication sont invalides." }, { status: 400 });
  const requestedAction = parsed.data.action;
  const permission = requestedAction === "publish" ? "CONTENT_APPROVE" : requestedAction === "archive" ? "CONTENT_ARCHIVE" : "CONTENT_CREATE";
  const authorization = await authorizeApi(permission);
  if (authorization.response) return authorization.response;
  const requestedMediaIds = [...new Set([
    ...parsed.data.galleryMediaIds,
    ...(parsed.data.coverMediaId ? [parsed.data.coverMediaId] : []),
  ])];
  const publishedMedia = await db.mediaAsset.findMany({
    where: { id: { in: requestedMediaIds }, status: "PUBLISHED", archivedAt: null },
    select: { id: true },
  });
  if (publishedMedia.length !== requestedMediaIds.length) {
    return NextResponse.json({ error: "La couverture et la galerie doivent utiliser des médias publiés." }, { status: 400 });
  }
  const status = requestedAction === "publish" ? "PUBLISHED" : requestedAction === "submit" ? "PENDING_REVIEW" : requestedAction === "archive" ? "ARCHIVED" : "DRAFT";
  const publicationData = {
    type: parsed.data.type,
    slug: parsed.data.slug,
    title: parsed.data.title,
    summary: parsed.data.summary,
    body: parsed.data.body,
    category: parsed.data.category,
    tags: parsed.data.tags,
    coverMediaId: parsed.data.coverMediaId,
  };
  const galleryMediaIds = parsed.data.galleryMediaIds;
  const publicationRecord = publicationData;
  const created = await db.$transaction(async (transaction) => {
    const publication = await transaction.publication.create({
      data: {
        ...publicationRecord,
        coverMediaId: publicationRecord.coverMediaId || null,
        authorId: authorization.user.id,
        status,
        archivedAt: status === "ARCHIVED" ? new Date() : null,
        ...(status === "PUBLISHED" ? { reviewerId: authorization.user.id, reviewedAt: new Date(), publishedAt: new Date() } : {}),
        gallery: { create: galleryMediaIds.map((mediaId, sortOrder) => ({ mediaId, sortOrder })) },
      },
      select: { id: true, slug: true, title: true, status: true, publishedAt: true, version: true },
    });
    await transaction.auditLog.create({
      data: { actorId: authorization.user.id, event: status === "PUBLISHED" ? "SENSITIVE_OPERATION" : "USER_CREATED", subjectType: "publication", subjectId: publication.id },
    });
    return publication;
  });
  return NextResponse.json(created, { status: 201 });
}
