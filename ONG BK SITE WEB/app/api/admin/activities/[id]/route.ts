import { NextResponse } from "next/server";
import { ActivityStatus } from "@prisma/client";
import { z } from "zod";
import { authorizeApi } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { activityTransitions, activitySchema, canTransitionActivity } from "@/lib/operations-validation";
import { canReadDocument } from "@/lib/private-documents";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const activityInclude = {
  project: { select: { id: true, reference: true, title: true, status: true } },
  manager: { select: { id: true, email: true } },
  partners: { include: { partner: { select: { id: true, name: true } } } },
  indicators: true,
  documents: { include: { document: { select: { id: true, title: true, confidentiality: true, status: true } } } },
  media: { select: { id: true, title: true, mediaType: true, status: true } },
} as const;

function visible<T extends { documents: { document: { confidentiality: Parameters<typeof canReadDocument>[1] } }[] }>(
  activity: T,
  user: Parameters<typeof canReadDocument>[0],
) {
  return { ...activity, documents: activity.documents.filter((entry) => canReadDocument(user, entry.document.confidentiality)) };
}

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("status"), status: z.enum(["DRAFT", "PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]) }).strict(),
  z.object({ action: z.literal("publish") }).strict(),
  z.object({ action: z.literal("unpublish") }).strict(),
  z.object({ action: z.literal("archive") }).strict(),
]);

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeApi("ACTIVITIES_READ");
  if (authorization.response) return authorization.response;
  const { id } = await context.params;
  const activity = await db.activity.findFirst({ where: { id, archivedAt: null }, include: activityInclude });
  if (!activity) return NextResponse.json({ error: "Activité introuvable." }, { status: 404 });
  return NextResponse.json(visible(activity, authorization.user), { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await enforceRequestOrigin(request))) return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  const { id } = await context.params;
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const action = actionSchema.safeParse(body.value);
  if (action.success) {
    const current = await db.activity.findFirst({ where: { id, archivedAt: null }, select: { status: true, public: true } });
    if (!current) return NextResponse.json({ error: "Activité introuvable." }, { status: 404 });
    let permission: "ACTIVITIES_APPROVE" | "ACTIVITIES_ARCHIVE" | "ACTIVITIES_UPDATE" = "ACTIVITIES_UPDATE";
    let data: { status?: ActivityStatus; public?: boolean; archivedAt?: Date | null } = {};
    if (action.data.action === "publish") {
      if (!["PLANNED", "IN_PROGRESS", "COMPLETED"].includes(current.status)) {
        return NextResponse.json({ error: "Seules les activités planifiées ou réalisées peuvent être publiées." }, { status: 409 });
      }
      permission = "ACTIVITIES_APPROVE";
      data = { public: true };
    } else if (action.data.action === "unpublish") {
      permission = "ACTIVITIES_APPROVE";
      data = { public: false };
    } else if (action.data.action === "archive") {
      permission = "ACTIVITIES_ARCHIVE";
      data = { archivedAt: new Date(), public: false };
    } else {
      if (!canTransitionActivity(current.status, action.data.status)) {
        return NextResponse.json({ error: "Cette transition de statut n’est pas autorisée." }, { status: 409 });
      }
      data = { status: action.data.status };
      if (current.public) {
        permission = "ACTIVITIES_APPROVE";
        data.public = true;
      }
    }
    const authorization = await authorizeApi(permission);
    if (authorization.response) return authorization.response;
    const result = await db.$transaction(async (transaction) => {
      const updated = await transaction.activity.update({ where: { id }, data, select: { id: true, status: true, public: true, archivedAt: true } });
      await transaction.auditLog.create({
        data: { actorId: authorization.user.id, event: "SENSITIVE_OPERATION", subjectType: `activity-${action.data.action}`, subjectId: id },
      });
      return updated;
    });
    return NextResponse.json(result);
  }

  const parsed = activitySchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Les données de l’activité sont invalides." }, { status: 400 });
  const authorization = await authorizeApi("ACTIVITIES_UPDATE");
  if (authorization.response) return authorization.response;
  const input = parsed.data;
  const current = await db.activity.findFirst({
    where: { id, archivedAt: null },
    include: {
      indicators: true,
      partners: { include: { partner: { select: { name: true } } } },
      documents: { include: { document: { select: { id: true, title: true, confidentiality: true } } } },
    },
  });
  if (!current) return NextResponse.json({ error: "Activité introuvable." }, { status: 404 });
  const [projectCount, managerCount, partnerCount, documents] = await Promise.all([
    input.projectId ? db.project.count({ where: { id: input.projectId, archivedAt: null } }) : 1,
    input.managerId ? db.user.count({ where: { id: input.managerId, isActive: true, archivedAt: null } }) : 1,
    db.partner.count({ where: { id: { in: input.partnerIds }, status: { not: "ARCHIVED" } } }),
    db.officialDocument.findMany({ where: { id: { in: input.documentIds }, archivedAt: null }, select: { id: true, confidentiality: true } }),
  ]);
  if (!projectCount || !managerCount || partnerCount !== new Set(input.partnerIds).size ||
      documents.length !== new Set(input.documentIds).size ||
      documents.some((document) => !canReadDocument(authorization.user, document.confidentiality))) {
    return NextResponse.json({ error: "Un projet, responsable, partenaire ou document référencé est invalide ou non autorisé." }, { status: 400 });
  }
  const updated = await db.$transaction(async (transaction) => {
    await transaction.activityRevision.create({
      data: {
        activityId: id,
        version: current.version,
        editorId: authorization.user.id,
        snapshot: {
          title: current.title,
          description: current.description,
          eventDate: current.eventDate?.toISOString() ?? null,
          location: current.location,
          domain: current.domain,
          projectId: current.projectId,
          objectives: current.objectives,
          plannedParticipants: current.plannedParticipants,
          realizedParticipants: current.realizedParticipants,
          resourcesUsed: current.resourcesUsed,
          results: current.results,
          difficulties: current.difficulties,
          correctiveMeasures: current.correctiveMeasures,
          report: current.report,
          status: current.status,
          indicators: current.indicators.map((item) => ({
            ...item,
            plannedValue: item.plannedValue?.toString() ?? null,
            actualValue: item.actualValue?.toString() ?? null,
          })),
          partners: current.partners.map((item) => ({ id: item.partnerId, name: item.partner.name })),
          documents: current.documents.map((item) => ({ id: item.document.id, title: item.document.title, confidentiality: item.document.confidentiality })),
        },
      },
    });
    const result = await transaction.activity.update({
      where: { id },
      data: {
        title: input.title,
        slug: current.slug,
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
        status: current.status,
        public: false,
        version: { increment: 1 },
        partners: { deleteMany: {}, create: input.partnerIds.map((partnerId) => ({ partnerId })) },
        documents: { deleteMany: {}, create: input.documentIds.map((documentId) => ({ documentId })) },
        indicators: {
          deleteMany: {},
          create: input.indicators.map((indicator) => ({
            ...indicator,
            plannedValue: indicator.plannedValue ?? null,
            actualValue: indicator.actualValue ?? null,
          })),
        },
      },
      include: activityInclude,
    });
    await transaction.auditLog.create({ data: { actorId: authorization.user.id, event: "USER_UPDATED", subjectType: "activity", subjectId: id } });
    return result;
  });
  return NextResponse.json(visible(updated, authorization.user));
}
