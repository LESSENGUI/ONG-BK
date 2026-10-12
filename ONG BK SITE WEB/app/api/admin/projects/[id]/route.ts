import { NextResponse } from "next/server";
import { ProjectStatus } from "@prisma/client";
import { authorizeApi } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { canTransitionProject, projectSchema } from "@/lib/operations-validation";
import { canReadDocument } from "@/lib/private-documents";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const projectInclude = {
  manager: { select: { id: true, email: true } },
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

const transitionSchema = z.object({
  action: z.literal("transition"),
  status: z.enum(["DRAFT", "PENDING_REVIEW", "PLANNED", "IN_PROGRESS", "SUSPENDED", "COMPLETED", "CLOSED", "ARCHIVED"]),
}).strict();

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeApi("PROJECTS_READ");
  if (authorization.response) return authorization.response;
  const { id } = await context.params;
  const project = await db.project.findUnique({ where: { id }, include: projectInclude });
  if (!project || (authorization.user.roleCode.startsWith("CCE") && project.archivedAt)) {
    return NextResponse.json({ error: "Projet introuvable." }, { status: 404 });
  }
  return NextResponse.json({
    ...visibleProject(project, authorization.user),
    plannedBudget: project.plannedBudget?.toString() ?? null,
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const { id } = await context.params;
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const transition = transitionSchema.safeParse(body.value);
  if (transition.success) {
    const current = await db.project.findUnique({ where: { id }, select: { status: true, publishedAt: true } });
    if (!current) return NextResponse.json({ error: "Projet introuvable." }, { status: 404 });
    if (!canTransitionProject(current.status, transition.data.status)) {
      return NextResponse.json({ error: "Cette transition de statut n’est pas autorisée." }, { status: 409 });
    }
    const permission = transition.data.status === "ARCHIVED" ? "PROJECTS_ARCHIVE"
      : current.status === "PENDING_REVIEW" && transition.data.status === "PLANNED"
        ? "PROJECTS_APPROVE"
        : "PROJECTS_UPDATE";
    const authorization = await authorizeApi(permission);
    if (authorization.response) return authorization.response;
    const updated = await db.$transaction(async (transaction) => {
      const result = await transaction.project.update({
        where: { id },
        data: {
          status: transition.data.status as ProjectStatus,
          archivedAt: transition.data.status === "ARCHIVED" ? new Date() : null,
          ...(transition.data.status === "PLANNED" && current.status === "PENDING_REVIEW"
            ? { publishedAt: new Date(), reviewerId: authorization.user.id, reviewedAt: new Date() }
            : {}),
        },
        select: { id: true, status: true },
      });
      await transaction.auditLog.create({
        data: {
          actorId: authorization.user.id,
          event: "SENSITIVE_OPERATION",
          subjectType: `project-status:${current.status}->${result.status}`,
          subjectId: id,
        },
      });
      return result;
    });
    return NextResponse.json(updated);
  }

  const parsed = projectSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Les données du projet sont invalides." }, { status: 400 });
  const authorization = await authorizeApi("PROJECTS_UPDATE");
  if (authorization.response) return authorization.response;
  const input = parsed.data;
  const current = await db.project.findUnique({
    where: { id },
    include: {
      stages: true,
      indicators: true,
      team: { include: { member: { select: { firstName: true, lastName: true } } } },
      partners: { include: { partner: { select: { name: true } } } },
      documents: { include: { document: { select: { id: true, title: true, confidentiality: true } } } },
    },
  });
  if (!current) return NextResponse.json({ error: "Projet introuvable." }, { status: 404 });
  const [memberCount, partnerCount, managerCount] = await Promise.all([
    db.member.count({ where: { id: { in: input.teamMemberIds }, archivedAt: null } }),
    db.partner.count({ where: { id: { in: input.partnerIds }, status: { not: "ARCHIVED" } } }),
    input.managerId ? db.user.count({ where: { id: input.managerId, isActive: true, archivedAt: null } }) : 1,
  ]);
  const linkedDocuments = await db.officialDocument.findMany({
    where: { id: { in: input.documentIds }, archivedAt: null },
    select: { id: true, confidentiality: true },
  });
  if (memberCount !== new Set(input.teamMemberIds).size ||
      partnerCount !== new Set(input.partnerIds).size || !managerCount ||
      linkedDocuments.length !== new Set(input.documentIds).size ||
      linkedDocuments.some((document) => !canReadDocument(authorization.user, document.confidentiality))) {
    return NextResponse.json({ error: "Un membre, un partenaire ou un responsable référencé est invalide." }, { status: 400 });
  }
  const project = await db.$transaction(async (transaction) => {
    await transaction.projectRevision.create({
      data: {
        projectId: id,
        version: current.version,
        editorId: authorization.user.id,
        snapshot: {
          reference: current.reference,
          title: current.title,
          description: current.description,
          justification: current.justification,
          problemStatement: current.problemStatement,
          targetBeneficiaries: current.targetBeneficiaries,
          generalObjective: current.generalObjective,
          specificObjectives: current.specificObjectives,
          domain: current.domain,
          geographicArea: current.geographicArea,
          plannedBudget: current.plannedBudget?.toString() ?? null,
          plannedBudgetCurrency: current.plannedBudgetCurrency,
          expectedResults: current.expectedResults,
          actualResults: current.actualResults,
          difficulties: current.difficulties,
          correctiveMeasures: current.correctiveMeasures,
          status: current.status,
          startDate: current.startDate?.toISOString() ?? null,
          endDate: current.endDate?.toISOString() ?? null,
          stages: current.stages.map((item) => ({
            title: item.title,
            description: item.description,
            startDate: item.startDate?.toISOString() ?? null,
            endDate: item.endDate?.toISOString() ?? null,
            completedAt: item.completedAt?.toISOString() ?? null,
            sortOrder: item.sortOrder,
          })),
          indicators: current.indicators.map((item) => ({
            ...item,
            plannedValue: item.plannedValue?.toString() ?? null,
            actualValue: item.actualValue?.toString() ?? null,
            measuredAt: item.measuredAt?.toISOString() ?? null,
          })),
          team: current.team.map((item) => ({ id: item.memberId, name: `${item.member.firstName} ${item.member.lastName}`, role: item.role })),
          partners: current.partners.map((item) => ({ id: item.partnerId, name: item.partner.name })),
          documents: current.documents.map((item) => ({
            id: item.document.id,
            title: item.document.title,
            confidentiality: item.document.confidentiality,
          })),
        },
      },
    });
    const updated = await transaction.project.update({
      where: { id },
      data: {
        reference: input.reference,
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
        status: current.status === "DRAFT" ? "DRAFT" : "PENDING_REVIEW",
        version: { increment: 1 },
        publishedAt: null,
        stages: {
          deleteMany: {},
          create: input.stages.map((stage, sortOrder) => ({
            title: stage.title,
            description: stage.description,
            startDate: stage.startDate ? new Date(stage.startDate) : null,
            endDate: stage.endDate ? new Date(stage.endDate) : null,
            sortOrder,
          })),
        },
        indicators: {
          deleteMany: {},
          create: input.indicators.map((indicator) => ({
            ...indicator,
            plannedValue: indicator.plannedValue ?? null,
            actualValue: indicator.actualValue ?? null,
            measuredAt: indicator.measuredAt ? new Date(indicator.measuredAt) : null,
          })),
        },
        team: { deleteMany: {}, create: input.teamMemberIds.map((memberId) => ({ memberId })) },
        partners: { deleteMany: {}, create: input.partnerIds.map((partnerId) => ({ partnerId })) },
        documents: { deleteMany: {}, create: input.documentIds.map((documentId) => ({ documentId })) },
      },
      include: projectInclude,
    });
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: "USER_UPDATED",
        subjectType: "project",
        subjectId: id,
      },
    });
    return updated;
  });
  return NextResponse.json({
    ...visibleProject(project, authorization.user),
    plannedBudget: project.plannedBudget?.toString() ?? null,
  });
}
