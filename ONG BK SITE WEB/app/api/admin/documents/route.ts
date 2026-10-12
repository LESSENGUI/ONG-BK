import { NextResponse } from "next/server";
import type { DocumentConfidentiality } from "@prisma/client";
import { authorizeApi } from "@/lib/api-auth";
import { documentMetadataSchema } from "@/lib/institution-validation";
import { db } from "@/lib/db";
import {
  canReadDocument,
  MAX_DOCUMENT_BYTES,
  storePrivateDocument,
} from "@/lib/private-documents";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const exporting = url.searchParams.get("format") === "csv";
  const authorization = await authorizeApi(exporting ? "DOCUMENTS_EXPORT" : "DOCUMENTS_READ");
  if (authorization.response) return authorization.response;
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? 10) || 10));
  const q = url.searchParams.get("q")?.trim().slice(0, 120);
  const category = url.searchParams.get("category");
  const allowedCategories = [
    "STATUTES",
    "INTERNAL_REGULATION",
    "MINUTES",
    "DECISION",
    "APPOINTMENT",
    "ANNUAL_REPORT",
    "ACTIVITY_REPORT",
    "FINANCIAL_REPORT",
    "AGREEMENT",
    "OTHER",
  ];
  const validCategory = category && allowedCategories.includes(category) ? category as
    | "STATUTES"
    | "INTERNAL_REGULATION"
    | "MINUTES"
    | "DECISION"
    | "APPOINTMENT"
    | "ANNUAL_REPORT"
    | "ACTIVITY_REPORT"
    | "FINANCIAL_REPORT"
    | "AGREEMENT"
    | "OTHER" : undefined;
  const visibleConfidentialities: DocumentConfidentiality[] = ["PUBLIC", "INTERNAL"];
  if (
    authorization.user.roleCode.startsWith("BE_") ||
    ["SECRETARY_GENERAL", "DEPUTY_SECRETARY_GENERAL", "ORGANISATION_COMMUNICATION_SECRETARY"].includes(authorization.user.roleCode)
  ) visibleConfidentialities.push("EXECUTIVE_BOARD");
  if (authorization.user.roleCode === "CCE_PRESIDENT" || authorization.user.roleCode === "CCE_MEMBER") {
    visibleConfidentialities.push("CONTROL_COMMISSION");
  }
  if (authorization.user.roleCode === "BE_PRESIDENT" || authorization.user.roleCode === "CCE_PRESIDENT") {
    visibleConfidentialities.push("STRICTLY_CONFIDENTIAL");
  }
  const where = {
    archivedAt: null,
    confidentiality: { in: visibleConfidentialities },
    ...(validCategory ? { category: validCategory } : {}),
    ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
  };
  const select = {
    id: true,
    title: true,
    category: true,
    documentDate: true,
    version: true,
    status: true,
    confidentiality: true,
    mediaType: true,
    fileSize: true,
    createdAt: true,
    uploadedBy: { select: { email: true } },
  } as const;
  if (exporting) {
    const items = await db.officialDocument.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 5000,
      select,
    });
    const visible = items.filter((item) => canReadDocument(authorization.user, item.confidentiality));
    const escape = (value: string) =>
      `"${(/^[\s]*[=+\-@]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`;
    const rows = [
      ["title", "category", "documentDate", "version", "status", "confidentiality", "mediaType", "fileSize"],
      ...visible.map((item) => [
        item.title,
        item.category,
        item.documentDate?.toISOString().slice(0, 10) ?? "",
        item.version,
        item.status,
        item.confidentiality,
        item.mediaType,
        String(item.fileSize),
      ]),
    ];
    return new Response(`\uFEFF${rows.map((row) => row.map(escape).join(",")).join("\r\n")}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="ong-bk-documents.csv"',
        "Cache-Control": "no-store",
      },
    });
  }
  const [items, total] = await Promise.all([
    db.officialDocument.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select,
    }),
    db.officialDocument.count({ where }),
  ]);
  const visible = items.filter((item) => canReadDocument(authorization.user, item.confidentiality));
  return NextResponse.json({
    items: visible,
    page,
    pageSize,
    total,
    pages: Math.ceil(total / pageSize),
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (!contentLength || contentLength > MAX_DOCUMENT_BYTES + 64_000) {
    return NextResponse.json({ error: "La taille du fichier est invalide ou dépasse la limite." }, { status: 413 });
  }
  const authorization = await authorizeApi("DOCUMENTS_CREATE");
  if (authorization.response) return authorization.response;
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const rawMetadata = form?.get("metadata");
  if (!(file instanceof File) || typeof rawMetadata !== "string") {
    return NextResponse.json({ error: "Fichier et métadonnées requis." }, { status: 400 });
  }
  let metadata: unknown;
  try {
    metadata = JSON.parse(rawMetadata);
  } catch {
    return NextResponse.json({ error: "Métadonnées documentaires invalides." }, { status: 400 });
  }
  const parsed = documentMetadataSchema.safeParse(metadata);
  if (!parsed.success || file.size === 0 || file.size > MAX_DOCUMENT_BYTES) {
    return NextResponse.json({ error: "Fichier ou métadonnées invalides." }, { status: 400 });
  }
  if (parsed.data.status !== "DRAFT" && parsed.data.status !== "PENDING_REVIEW") {
    return NextResponse.json({ error: "Un dépôt initial ne peut être publié ou archivé." }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  let stored: Awaited<ReturnType<typeof storePrivateDocument>>;
  try {
    stored = await storePrivateDocument(bytes, file.type);
  } catch (error) {
    if (error instanceof Error && error.message === "DOCUMENT_SIZE_INVALID") {
      return NextResponse.json({ error: "Le fichier dépasse la taille autorisée." }, { status: 413 });
    }
    if (error instanceof Error && error.message === "DOCUMENT_CONTENT_TYPE_INVALID") {
      return NextResponse.json({ error: "Seuls les PDF et images JPEG/PNG vérifiés sont acceptés." }, { status: 415 });
    }
    throw error;
  }

  try {
    const document = await db.$transaction(async (transaction) => {
      const created = await transaction.officialDocument.create({
        data: {
          title: parsed.data.title,
          category: parsed.data.category,
          documentDate: parsed.data.documentDate ? new Date(parsed.data.documentDate) : null,
          version: parsed.data.version,
          confidentiality: parsed.data.confidentiality,
          status: parsed.data.status,
          storageKey: stored.storageKey,
          mediaType: stored.mediaType,
          fileSize: stored.fileSize,
          uploadedById: authorization.user.id,
        },
        select: { id: true, title: true, status: true, confidentiality: true },
      });
      await transaction.auditLog.create({
        data: {
          actorId: authorization.user.id,
          event: "SENSITIVE_OPERATION",
          subjectType: "official-document",
          subjectId: created.id,
        },
      });
      return created;
    });
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    const { removePrivateDocument } = await import("@/lib/private-documents");
    await removePrivateDocument(stored.storageKey);
    throw error;
  }
}
