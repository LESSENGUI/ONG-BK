import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/api-auth";
import { identitySchema } from "@/lib/institution-validation";
import { db } from "@/lib/db";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const authorization = await authorizeApi("IDENTITY_READ");
  if (authorization.response) return authorization.response;
  const pages = await db.contentPage.findMany({
    orderBy: { key: "asc" },
    select: {
      id: true,
      key: true,
      title: true,
      content: true,
      imagePath: true,
      status: true,
      version: true,
      publishedAt: true,
      updatedAt: true,
      author: { select: { email: true } },
      reviewer: { select: { email: true } },
    },
  });
  return NextResponse.json(pages, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = identitySchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({ error: "Le contenu institutionnel est invalide." }, { status: 400 });
  }
  const { key, title, content, imagePath, action } = parsed.data;
  if (action === "publish" && !content.trim()) {
    return NextResponse.json({ error: "Un contenu non vide est requis pour publier." }, { status: 400 });
  }

  const existing = await db.contentPage.findUnique({ where: { key }, select: { id: true, version: true } });
  const requiredPermission = action === "publish" ? "IDENTITY_APPROVE" : existing ? "IDENTITY_UPDATE" : "IDENTITY_CREATE";
  const authorization = await authorizeApi(requiredPermission);
  if (authorization.response) return authorization.response;
  const user = authorization.user;

  const result = await db.$transaction(async (transaction) => {
    const page = await transaction.contentPage.findUnique({ where: { key } });
    const version = page ? page.version + 1 : 1;
    if (page) {
      await transaction.contentRevision.create({
        data: {
          pageId: page.id,
          version: page.version,
          title: page.title,
          content: page.content,
          imagePath: page.imagePath,
          editorId: user.id,
        },
      });
    }
    const status =
      action === "publish"
        ? "PUBLISHED"
        : action === "submit"
          ? "PENDING_REVIEW"
          : action === "archive"
            ? "ARCHIVED"
            : "DRAFT";
    const updated = await transaction.contentPage.upsert({
      where: { key },
      update: {
        title,
        content,
        imagePath: imagePath || null,
        status,
        version,
        ...(action === "publish"
          ? { reviewerId: user.id, reviewedAt: new Date(), publishedAt: new Date() }
          : {}),
      },
      create: {
        key,
        title,
        content,
        imagePath: imagePath || null,
        authorId: user.id,
        status,
        version,
        ...(action === "publish"
          ? { reviewerId: user.id, reviewedAt: new Date(), publishedAt: new Date() }
          : {}),
      },
      select: { id: true, key: true, status: true, version: true },
    });
    await transaction.auditLog.create({
      data: {
        actorId: user.id,
        event: action === "publish" ? "SENSITIVE_OPERATION" : "USER_UPDATED",
        subjectType: `identity:${key}`,
        subjectId: updated.id,
      },
    });
    return updated;
  });

  return NextResponse.json(result);
}
