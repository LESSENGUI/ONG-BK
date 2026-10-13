import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeApi } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { mediaMetadataSchema } from "@/lib/operations-validation";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const actionSchema = z.object({ action: z.enum(["publish", "unpublish", "archive"]) }).strict();

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await enforceRequestOrigin(request))) return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  const { id } = await context.params;
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const action = actionSchema.safeParse(body.value);
  if (action.success) {
    const permission = action.data.action === "archive" ? "MEDIA_ARCHIVE" : "MEDIA_APPROVE";
    const authorization = await authorizeApi(permission);
    if (authorization.response) return authorization.response;
    const current = await db.mediaAsset.findUnique({ where: { id }, select: { status: true, archivedAt: true } });
    if (!current || current.archivedAt) return NextResponse.json({ error: "Média introuvable." }, { status: 404 });
    if (action.data.action === "publish" && current.status === "ARCHIVED") {
      return NextResponse.json({ error: "Un média archivé ne peut pas être republié." }, { status: 409 });
    }
    const result = await db.$transaction(async (transaction) => {
      const updated = await transaction.mediaAsset.update({
        where: { id },
        data: action.data.action === "publish"
          ? { status: "PUBLISHED", publishedAt: new Date() }
          : action.data.action === "unpublish"
            ? { status: "DRAFT", publishedAt: null }
            : { status: "ARCHIVED", archivedAt: new Date(), publishedAt: null },
        select: { id: true, title: true, status: true, publishedAt: true, archivedAt: true },
      });
      await transaction.auditLog.create({ data: { actorId: authorization.user.id, event: "SENSITIVE_OPERATION", subjectType: `media-${action.data.action}`, subjectId: id } });
      return updated;
    });
    return NextResponse.json(result);
  }
  const parsed = mediaMetadataSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Les métadonnées du média sont invalides." }, { status: 400 });
  const authorization = await authorizeApi("MEDIA_UPDATE");
  if (authorization.response) return authorization.response;
  const input = parsed.data;
  const [projectCount, activityCount] = await Promise.all([
    input.projectId ? db.project.count({ where: { id: input.projectId, archivedAt: null } }) : 1,
    input.activityId ? db.activity.count({ where: { id: input.activityId, archivedAt: null } }) : 1,
  ]);
  if (!projectCount || !activityCount) return NextResponse.json({ error: "Le projet ou l’activité associé est invalide." }, { status: 400 });
  const updated = await db.$transaction(async (transaction) => {
    const media = await transaction.mediaAsset.update({
      where: { id },
      data: {
        title: input.title,
        caption: input.caption,
        altText: input.altText,
        source: input.source,
        usageRights: input.usageRights,
        capturedAt: input.capturedAt ? new Date(input.capturedAt) : null,
        projectId: input.projectId || null,
        activityId: input.activityId || null,
      },
      select: { id: true, title: true, caption: true, altText: true, status: true, mediaType: true },
    });
    await transaction.auditLog.create({ data: { actorId: authorization.user.id, event: "USER_UPDATED", subjectType: "media", subjectId: id } });
    return media;
  });
  return NextResponse.json(updated);
}
