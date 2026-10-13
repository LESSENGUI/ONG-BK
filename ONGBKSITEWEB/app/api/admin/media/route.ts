import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { authorizeApi } from "@/lib/api-auth";
import { mediaMetadataSchema } from "@/lib/operations-validation";
import { MAX_MEDIA_BYTES, removePrivateMedia, storePrivateMedia } from "@/lib/private-media";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const exporting = url.searchParams.get("format") === "csv";
  const authorization = await authorizeApi(exporting ? "MEDIA_EXPORT" : "MEDIA_READ");
  if (authorization.response) return authorization.response;
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? 10) || 10));
  const q = url.searchParams.get("q")?.trim().slice(0, 120);
  const where: Prisma.MediaAssetWhereInput = {
    archivedAt: null,
    ...(q ? { OR: [
      { title: { contains: q, mode: "insensitive" } },
      { caption: { contains: q, mode: "insensitive" } },
      { source: { contains: q, mode: "insensitive" } },
    ] } : {}),
  };
  const select = {
    id: true, title: true, caption: true, altText: true, source: true, usageRights: true,
    capturedAt: true, mediaType: true, fileSize: true, status: true, projectId: true, activityId: true,
    createdAt: true, publishedAt: true,
    project: { select: { id: true, title: true } },
    activity: { select: { id: true, title: true } },
  } as const;
  const orderBy = { createdAt: "desc" as const };
  const items = exporting
    ? await db.mediaAsset.findMany({ where, select, orderBy, take: 5000 })
    : await db.mediaAsset.findMany({ where, select, orderBy, skip: (page - 1) * pageSize, take: pageSize });
  if (exporting) {
    const escape = (value: string) => `"${(/^[\s]*[=+\-@]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`;
    const rows = [
      ["title", "type", "status", "capturedAt", "project", "activity", "fileSize"],
      ...items.map((item) => [item.title, item.mediaType, item.status, item.capturedAt?.toISOString() ?? "", item.project?.title ?? "", item.activity?.title ?? "", String(item.fileSize)]),
    ];
    return new Response(`\uFEFF${rows.map((row) => row.map(escape).join(",")).join("\r\n")}`, {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="ong-bk-medias.csv"', "Cache-Control": "no-store" },
    });
  }
  const total = await db.mediaAsset.count({ where: { archivedAt: null, ...(q ? { OR: [
    { title: { contains: q, mode: "insensitive" } },
    { caption: { contains: q, mode: "insensitive" } },
    { source: { contains: q, mode: "insensitive" } },
  ] } : {}) } });
  return NextResponse.json({ items, page, pageSize, total, pages: Math.ceil(total / pageSize) }, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  if (!(await enforceRequestOrigin(request))) return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  const authorization = await authorizeApi("MEDIA_CREATE");
  if (authorization.response) return authorization.response;
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (!contentLength || contentLength > MAX_MEDIA_BYTES + 64_000) {
    return NextResponse.json({ error: "La taille du fichier est invalide ou dépasse la limite de 25 Mo." }, { status: 413 });
  }
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Le formulaire de téléversement est invalide." }, { status: 400 });
  }
  const metadataValue = form.get("metadata");
  const file = form.get("file");
  if (typeof metadataValue !== "string" || !(file instanceof File)) {
    return NextResponse.json({ error: "Un fichier et ses métadonnées sont requis." }, { status: 400 });
  }
  let metadata: unknown;
  try {
    metadata = JSON.parse(metadataValue);
  } catch {
    return NextResponse.json({ error: "Les métadonnées du média sont invalides." }, { status: 400 });
  }
  const parsed = mediaMetadataSchema.safeParse(metadata);
  if (!parsed.success) return NextResponse.json({ error: "Les métadonnées du média sont invalides." }, { status: 400 });
  if (file.size === 0 || file.size > MAX_MEDIA_BYTES) {
    return NextResponse.json({ error: "Le média doit faire moins de 25 Mo." }, { status: 413 });
  }
  const input = parsed.data;
  const [projectCount, activityCount] = await Promise.all([
    input.projectId ? db.project.count({ where: { id: input.projectId, archivedAt: null } }) : 1,
    input.activityId ? db.activity.count({ where: { id: input.activityId, archivedAt: null } }) : 1,
  ]);
  if (!projectCount || !activityCount) return NextResponse.json({ error: "Le projet ou l’activité associé est invalide." }, { status: 400 });
  const stored = await storePrivateMedia(new Uint8Array(await file.arrayBuffer()), file.type);
  try {
    const media = await db.$transaction(async (transaction) => {
      const created = await transaction.mediaAsset.create({
        data: {
          title: input.title,
          caption: input.caption,
          altText: input.altText,
          source: input.source,
          usageRights: input.usageRights,
          capturedAt: input.capturedAt ? new Date(input.capturedAt) : null,
          projectId: input.projectId || null,
          activityId: input.activityId || null,
          mediaType: stored.mediaType,
          storageKey: stored.storageKey,
          fileSize: stored.fileSize,
          uploaderId: authorization.user.id,
        },
        select: { id: true, title: true, mediaType: true, fileSize: true, status: true, createdAt: true },
      });
      await transaction.auditLog.create({ data: { actorId: authorization.user.id, event: "USER_CREATED", subjectType: "media", subjectId: created.id } });
      return created;
    });
    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    try {
      await removePrivateMedia(stored.storageKey);
    } catch (cleanupError) {
      console.error("Impossible de nettoyer un média dont l’enregistrement a échoué.", cleanupError);
    }
    throw error;
  }
}
