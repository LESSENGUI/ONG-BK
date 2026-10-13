import { NextResponse } from "next/server";
import { PartnerCategory, PartnerStatus, type Prisma } from "@prisma/client";
import { authorizeApi } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { partnerSchema } from "@/lib/operations-validation";
import { canReadDocument } from "@/lib/private-documents";
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
  const authorization = await authorizeApi(exporting ? "PARTNERS_EXPORT" : "PARTNERS_READ");
  if (authorization.response) return authorization.response;
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? 10) || 10));
  const q = url.searchParams.get("q")?.trim().slice(0, 120);
  const category = url.searchParams.get("category");
  const status = url.searchParams.get("status");
  const where: Prisma.PartnerWhereInput = {
    ...(Object.values(PartnerCategory).includes(category as PartnerCategory) ? { category: category as PartnerCategory } : {}),
    ...(Object.values(PartnerStatus).includes(status as PartnerStatus) ? { status: status as PartnerStatus } : {}),
    ...(q ? { OR: [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { collaboration: { contains: q, mode: "insensitive" } },
    ] } : {}),
  };
  if (exporting) {
    const items = await db.partner.findMany({
      where, take: 5000, orderBy: { name: "asc" },
      select: { name: true, category: true, status: true, startDate: true, endDate: true, publicEmail: true, publicPhone: true, website: true },
    });
    const rows = [
      ["name", "category", "status", "startDate", "endDate", "email", "phone", "website"],
      ...items.map((item) => [
        item.name, item.category, item.status, item.startDate?.toISOString().slice(0, 10) ?? "",
        item.endDate?.toISOString().slice(0, 10) ?? "", item.publicEmail ?? "", item.publicPhone ?? "", item.website ?? "",
      ]),
    ];
    return new Response(`\uFEFF${rows.map((row) => row.map(safeCell).join(",")).join("\r\n")}`, {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="ong-bk-partenaires.csv"', "Cache-Control": "no-store" },
    });
  }
  const select = {
    id: true, name: true, category: true, description: true, logoPath: true,
    publicEmail: true, publicPhone: true, website: true, collaboration: true,
    startDate: true, endDate: true, status: true, showOnPublicSite: true,
    createdAt: true, updatedAt: true,
    projects: { include: { project: { select: { id: true, reference: true, title: true } } } },
    activities: { include: { activity: { select: { id: true, title: true, eventDate: true } } } },
    documents: { include: { document: { select: { id: true, title: true, confidentiality: true } } } },
    ...(!authorization.user.roleCode.startsWith("CCE") ? {
      contactName: true, contactEmail: true, contactPhone: true,
    } : {}),
  } as const;
  const [items, total] = await Promise.all([
    db.partner.findMany({ where, select, orderBy: { name: "asc" }, skip: (page - 1) * pageSize, take: pageSize }),
    db.partner.count({ where }),
  ]);
  const visibleItems = items.map((item) => ({
    ...item,
    documents: item.documents.filter((entry) =>
      canReadDocument(authorization.user, entry.document.confidentiality),
    ),
  }));
  return NextResponse.json({ items: visibleItems, page, pageSize, total, pages: Math.ceil(total / pageSize) }, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  if (!(await enforceRequestOrigin(request))) return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = partnerSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Les données du partenaire sont invalides." }, { status: 400 });
  const authorization = await authorizeApi("PARTNERS_CREATE");
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
  const created = await db.$transaction(async (transaction) => {
    const { documentIds, ...partnerData } = parsed.data;
    const partner = await transaction.partner.create({
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
        showOnPublicSite: partnerData.showOnPublicSite && partnerData.status === "ACTIVE",
        documents: { create: documentIds.map((documentId) => ({ documentId })) },
      },
    });
    await transaction.auditLog.create({ data: { actorId: authorization.user.id, event: "USER_CREATED", subjectType: "partner", subjectId: partner.id } });
    return partner;
  });
  return NextResponse.json(created, { status: 201 });
}
