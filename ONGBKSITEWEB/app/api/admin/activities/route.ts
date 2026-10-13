import { NextResponse } from "next/server";
import { ActivityStatus, type Prisma } from "@prisma/client";
import { authorizeApi } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { activitySchema } from "@/lib/operations-validation";
import { canReadDocument } from "@/lib/private-documents";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const activityInclude = {
  project: { select: { id: true, reference: true, title: true, status: true } },
  manager: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
  partners: { include: { partner: { select: { id: true, name: true } } } },
  indicators: true,
  documents: { include: { document: { select: { id: true, title: true, confidentiality: true, status: true } } } },
  media: { select: { id: true, title: true, mediaType: true, status: true } },
} as const;

function safeCell(value: string) {
  return `"${(/^[\s]*[=+\-@]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`;
}

function visibleActivity<T extends { documents: { document: { confidentiality: Parameters<typeof canReadDocument>[1] } }[] }>(
  item: T,
  user: Parameters<typeof canReadDocument>[0],
) {
  return {
    ...item,
    documents: item.documents.filter((entry) => canReadDocument(user, entry.document.confidentiality)),
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const exporting = url.searchParams.get("format") === "csv";
  const authorization = await authorizeApi(exporting ? "ACTIVITIES_EXPORT" : "ACTIVITIES_READ");
  if (authorization.response) return authorization.response;
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? 10) || 10));
  const q = url.searchParams.get("q")?.trim().slice(0, 120);
  const status = url.searchParams.get("status");
  const domain = url.searchParams.get("domain")?.trim().slice(0, 120);
  const projectId = url.searchParams.get("projectId")?.slice(0, 191);
  const validStatus = Object.values(ActivityStatus).includes(status as ActivityStatus) ? status as ActivityStatus : undefined;
  const where: Prisma.ActivityWhereInput = {
    archivedAt: null,
    ...(validStatus ? { status: validStatus } : {}),
    ...(domain ? { domain: { contains: domain, mode: "insensitive" } } : {}),
    ...(projectId ? { projectId } : {}),
    ...(q ? { OR: [
      { title: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
      { project: { title: { contains: q, mode: "insensitive" } } },
    ] } : {}),
  };
  if (exporting) {
    const items = await db.activity.findMany({
      where, orderBy: { eventDate: "desc" }, take: 5000,
      select: { title: true, domain: true, location: true, eventDate: true, status: true, plannedParticipants: true, realizedParticipants: true },
    });
    const rows = [
      ["title", "domain", "location", "date", "status", "plannedParticipants", "realizedParticipants"],
      ...items.map((item) => [
        item.title, item.domain, item.location, item.eventDate?.toISOString() ?? "", item.status,
        item.plannedParticipants?.toString() ?? "", item.realizedParticipants?.toString() ?? "",
      ]),
    ];
    return new Response(`\uFEFF${rows.map((row) => row.map(safeCell).join(",")).join("\r\n")}`, {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="ong-bk-activites.csv"', "Cache-Control": "no-store" },
    });
  }
  const [items, total] = await Promise.all([
    db.activity.findMany({ where, include: activityInclude, orderBy: [{ eventDate: "desc" }, { updatedAt: "desc" }], skip: (page - 1) * pageSize, take: pageSize }),
    db.activity.count({ where }),
  ]);
  return NextResponse.json({
    items: items.map((item) => visibleActivity(item, authorization.user)),
    page, pageSize, total, pages: Math.ceil(total / pageSize),
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!(await enforceRequestOrigin(request))) return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = activitySchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Les données de l’activité sont invalides." }, { status: 400 });
  const authorization = await authorizeApi("ACTIVITIES_CREATE");
  if (authorization.response) return authorization.response;
  const input = parsed.data;
  const [projectCount, managerCount, partnerCount, documents] = await Promise.all([
    input.projectId ? db.project.count({ where: { id: input.projectId, archivedAt: null } }) : 1,
    input.managerId ? db.user.count({ where: { id: input.managerId, isActive: true, archivedAt: null } }) : 1,
    db.partner.count({ where: { id: { in: input.partnerIds }, status: { not: "ARCHIVED" } } }),
    db.officialDocument.findMany({
      where: { id: { in: input.documentIds }, archivedAt: null },
      select: { id: true, confidentiality: true },
    }),
  ]);
  if (!projectCount || !managerCount || partnerCount !== new Set(input.partnerIds).size ||
      documents.length !== new Set(input.documentIds).size ||
      documents.some((document) => !canReadDocument(authorization.user, document.confidentiality))) {
    return NextResponse.json({ error: "Un projet, responsable, partenaire ou document référencé est invalide ou non autorisé." }, { status: 400 });
  }
  const slugBase = input.title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 160) || "activite";
  const activity = await db.$transaction(async (transaction) => {
    const created = await transaction.activity.create({
      data: {
        title: input.title,
        slug: `${slugBase}-${crypto.randomUUID().slice(0, 8)}`,
        description: input.description,
        eventDate: input.eventDate ? new Date(input.eventDate) : null,
        location: input.location,
        domain: input.domain,
        projectId: input.projectId || null,
        managerId: input.managerId || null,
        objectives: input.objectives,
        plannedParticipants: input.plannedParticipants ?? null,
        realizedParticipants: input.realizedParticipants ?? null,
        resourcesUsed: input.resourcesUsed,
        results: input.results,
        difficulties: input.difficulties,
        correctiveMeasures: input.correctiveMeasures,
        report: input.report,
        partners: { create: input.partnerIds.map((partnerId) => ({ partnerId })) },
        documents: { create: input.documentIds.map((documentId) => ({ documentId })) },
        indicators: { create: input.indicators.map((indicator) => ({
          ...indicator,
          plannedValue: indicator.plannedValue ?? null,
          actualValue: indicator.actualValue ?? null,
        })) },
      },
      include: activityInclude,
    });
    await transaction.auditLog.create({ data: { actorId: authorization.user.id, event: "USER_CREATED", subjectType: "activity", subjectId: created.id } });
    return created;
  });
  return NextResponse.json(visibleActivity(activity, authorization.user), { status: 201 });
}
