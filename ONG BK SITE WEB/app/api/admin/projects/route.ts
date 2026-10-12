import { NextResponse } from "next/server";
import { ProjectStatus, type Prisma } from "@prisma/client";
import { authorizeApi } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { projectSchema } from "@/lib/operations-validation";
import { canReadDocument } from "@/lib/private-documents";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const projectInclude = {
  manager: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
  partners: { include: { partner: { select: { id: true, name: true } } } },
  team: { include: { member: { select: { id: true, firstName: true, lastName: true } } } },
  stages: { orderBy: { sortOrder: "asc" as const } },
  indicators: { orderBy: { name: "asc" as const } },
  documents: { include: { document: { select: { id: true, title: true, confidentiality: true, status: true } } } },
} as const;

function visibleProject<T extends { documents: { document: { confidentiality: Parameters<typeof canReadDocument>[1] } }[] }>(
  item: T,
  user: Parameters<typeof canReadDocument>[0],
) {
  return {
    ...item,
    documents: item.documents.filter((entry) => canReadDocument(user, entry.document.confidentiality)),
  };
}

function safeCell(value: string) {
  return `"${(/^[\s]*[=+\-@]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const exporting = url.searchParams.get("format") === "csv";
  const authorization = await authorizeApi(exporting ? "PROJECTS_EXPORT" : "PROJECTS_READ");
  if (authorization.response) return authorization.response;
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? 10) || 10));
  const q = url.searchParams.get("q")?.trim().slice(0, 120);
  const status = url.searchParams.get("status");
  const domain = url.searchParams.get("domain")?.trim().slice(0, 120);
  const managerId = url.searchParams.get("managerId")?.slice(0, 191);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const validStatus = Object.values(ProjectStatus).includes(status as ProjectStatus)
    ? status as ProjectStatus
    : undefined;
  const where: Prisma.ProjectWhereInput = {
    ...(authorization.user.roleCode.startsWith("CCE") ? { archivedAt: null } : {}),
    ...(validStatus ? { status: validStatus } : {}),
    ...(domain ? { domain: { contains: domain, mode: "insensitive" } } : {}),
    ...(managerId ? { managerId } : {}),
    ...(q ? { OR: [
      { title: { contains: q, mode: "insensitive" } },
      { reference: { contains: q, mode: "insensitive" } },
      { geographicArea: { contains: q, mode: "insensitive" } },
    ] } : {}),
    ...((from || to) ? { startDate: {
      ...(from && !Number.isNaN(Date.parse(from)) ? { gte: new Date(from) } : {}),
      ...(to && !Number.isNaN(Date.parse(to)) ? { lte: new Date(to) } : {}),
    } } : {}),
  };
  if (exporting) {
    const items = await db.project.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 5000,
      select: {
        reference: true, title: true, domain: true, geographicArea: true,
        status: true, startDate: true, endDate: true, plannedBudget: true,
        plannedBudgetCurrency: true,
      },
    });
    const rows = [
      ["reference", "title", "domain", "zone", "status", "startDate", "endDate", "plannedBudget", "currency"],
      ...items.map((item) => [
        item.reference, item.title, item.domain, item.geographicArea, item.status,
        item.startDate?.toISOString().slice(0, 10) ?? "",
        item.endDate?.toISOString().slice(0, 10) ?? "",
        item.plannedBudget?.toString() ?? "", item.plannedBudgetCurrency ?? "",
      ]),
    ];
    return new Response(`\uFEFF${rows.map((row) => row.map(safeCell).join(",")).join("\r\n")}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="ong-bk-projets.csv"',
        "Cache-Control": "no-store",
      },
    });
  }
  const [items, total] = await Promise.all([
    db.project.findMany({
      where,
      include: projectInclude,
      orderBy: [{ startDate: "desc" }, { updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.project.count({ where }),
  ]);
  return NextResponse.json({
    items: items.map((item) => ({
      ...visibleProject(item, authorization.user),
      plannedBudget: item.plannedBudget?.toString() ?? null,
    })),
    page, pageSize, total, pages: Math.ceil(total / pageSize),
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = projectSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Les données du projet sont invalides." }, { status: 400 });
  const authorization = await authorizeApi("PROJECTS_CREATE");
  if (authorization.response) return authorization.response;
  const input = parsed.data;
  const relatedCounts = await Promise.all([
    db.member.count({ where: { id: { in: input.teamMemberIds }, archivedAt: null } }),
    db.partner.count({ where: { id: { in: input.partnerIds }, status: { not: "ARCHIVED" } } }),
    input.managerId ? db.user.count({ where: { id: input.managerId, isActive: true, archivedAt: null } }) : 1,
  ]);
  const linkedDocuments = await db.officialDocument.findMany({
    where: { id: { in: input.documentIds }, archivedAt: null },
    select: { id: true, confidentiality: true },
  });
  if (relatedCounts[0] !== new Set(input.teamMemberIds).size ||
      relatedCounts[1] !== new Set(input.partnerIds).size || !relatedCounts[2] ||
      linkedDocuments.length !== new Set(input.documentIds).size ||
      linkedDocuments.some((document) => !canReadDocument(authorization.user, document.confidentiality))) {
    return NextResponse.json({ error: "Un membre, un partenaire ou un responsable référencé est invalide." }, { status: 400 });
  }
  const slugBase = input.title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 160) || "projet";
  const project = await db.$transaction(async (transaction) => {
    const created = await transaction.project.create({
      data: {
        reference: input.reference,
        slug: `${slugBase}-${crypto.randomUUID().slice(0, 8)}`,
        title: input.title,
        description: input.description,
        justification: input.justification,
        problemStatement: input.problemStatement,
        targetBeneficiaries: input.targetBeneficiaries,
        generalObjective: input.generalObjective,
        specificObjectives: input.specificObjectives,
        domain: input.domain,
        geographicArea: input.geographicArea,
        plannedBudget: input.plannedBudget ?? null,
        plannedBudgetCurrency: input.plannedBudgetCurrency || null,
        expectedResults: input.expectedResults,
        actualResults: input.actualResults,
        difficulties: input.difficulties,
        correctiveMeasures: input.correctiveMeasures,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        managerId: input.managerId || null,
        authorId: authorization.user.id,
        stages: { create: input.stages.map((stage, sortOrder) => ({
          title: stage.title,
          description: stage.description,
          startDate: stage.startDate ? new Date(stage.startDate) : null,
          endDate: stage.endDate ? new Date(stage.endDate) : null,
          sortOrder,
        })) },
        indicators: { create: input.indicators.map((indicator) => ({
          ...indicator,
          plannedValue: indicator.plannedValue ?? null,
          actualValue: indicator.actualValue ?? null,
          measuredAt: indicator.measuredAt ? new Date(indicator.measuredAt) : null,
        })) },
        team: { create: input.teamMemberIds.map((memberId) => ({ memberId })) },
        partners: { create: input.partnerIds.map((partnerId) => ({ partnerId })) },
        documents: { create: input.documentIds.map((documentId) => ({ documentId })) },
      },
      include: projectInclude,
    });
    await transaction.auditLog.create({
      data: { actorId: authorization.user.id, event: "USER_CREATED", subjectType: "project", subjectId: created.id },
    });
    return created;
  });
  return NextResponse.json({
    ...visibleProject(project, authorization.user),
    plannedBudget: project.plannedBudget?.toString() ?? null,
  }, { status: 201 });
}
