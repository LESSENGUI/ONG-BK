import { NextResponse } from "next/server";
import { SubmissionStatus, SubmissionType, type Prisma } from "@prisma/client";
import { authorizeApi } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { submissionUpdateSchema } from "@/lib/operations-validation";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const statusTransitions: Record<SubmissionStatus, readonly SubmissionStatus[]> = {
  RECEIVED: ["IN_PROGRESS", "NEEDS_INFORMATION", "CLOSED", "ARCHIVED"],
  IN_PROGRESS: ["NEEDS_INFORMATION", "ANSWERED", "CLOSED", "ARCHIVED"],
  NEEDS_INFORMATION: ["IN_PROGRESS", "ANSWERED", "CLOSED", "ARCHIVED"],
  ANSWERED: ["IN_PROGRESS", "CLOSED", "ARCHIVED"],
  CLOSED: ["IN_PROGRESS", "ARCHIVED"],
  ARCHIVED: [],
};

function safeCell(value: string) {
  return `"${(/^[\s]*[=+\-@]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const exporting = url.searchParams.get("format") === "csv";
  const authorization = await authorizeApi(exporting ? "INBOX_EXPORT" : "INBOX_READ");
  if (authorization.response) return authorization.response;
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? 10) || 10));
  const q = url.searchParams.get("q")?.trim().slice(0, 120);
  const status = url.searchParams.get("status");
  const type = url.searchParams.get("type");
  const where: Prisma.PublicSubmissionWhereInput = {
    ...(Object.values(SubmissionStatus).includes(status as SubmissionStatus) ? { status: status as SubmissionStatus } : {}),
    ...(Object.values(SubmissionType).includes(type as SubmissionType) ? { type: type as SubmissionType } : {}),
    ...(q ? { OR: [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { subject: { contains: q, mode: "insensitive" } },
    ] } : {}),
  };
  if (exporting) {
    const items = await db.publicSubmission.findMany({
      where, orderBy: { createdAt: "desc" }, take: 5000,
      select: { type: true, status: true, firstName: true, lastName: true, email: true, phone: true, subject: true, organization: true, createdAt: true },
    });
    const rows = [
      ["type", "status", "firstName", "lastName", "email", "phone", "subject", "organization", "createdAt"],
      ...items.map((item) => [item.type, item.status, item.firstName, item.lastName, item.email, item.phone ?? "", item.subject, item.organization ?? "", item.createdAt.toISOString()]),
    ];
    return new Response(`\uFEFF${rows.map((row) => row.map(safeCell).join(",")).join("\r\n")}`, {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="ong-bk-demandes.csv"', "Cache-Control": "no-store" },
    });
  }
  const [items, total] = await Promise.all([
    db.publicSubmission.findMany({
      where,
      include: {
        assignee: { select: { id: true, email: true } },
        history: { orderBy: { createdAt: "desc" }, include: { actor: { select: { email: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.publicSubmission.count({ where }),
  ]);
  return NextResponse.json({ items, page, pageSize, total, pages: Math.ceil(total / pageSize) }, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PATCH(request: Request) {
  if (!(await enforceRequestOrigin(request))) return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const id = typeof body.value === "object" && body.value !== null && "id" in body.value
    ? body.value.id
    : null;
  const parsed = submissionUpdateSchema.safeParse(
    typeof body.value === "object" && body.value !== null && "id" in body.value
      ? Object.fromEntries(Object.entries(body.value).filter(([key]) => key !== "id"))
      : null,
  );
  if (typeof id !== "string" || id.length > 191 || !parsed.success) {
    return NextResponse.json({ error: "La mise à jour de la demande est invalide." }, { status: 400 });
  }
  const authorization = await authorizeApi("INBOX_UPDATE");
  if (authorization.response) return authorization.response;
  const current = await db.publicSubmission.findUnique({ where: { id }, select: { status: true } });
  if (!current) return NextResponse.json({ error: "Demande introuvable." }, { status: 404 });
  if (current.status !== parsed.data.status && !statusTransitions[current.status].includes(parsed.data.status)) {
    return NextResponse.json({ error: "Cette transition de traitement n’est pas autorisée." }, { status: 409 });
  }
  if (parsed.data.status === "ANSWERED" && !parsed.data.reply?.trim()) {
    return NextResponse.json({ error: "Une réponse est requise avant de marquer la demande comme traitée." }, { status: 400 });
  }
  if (parsed.data.assigneeId) {
    const assignee = await db.user.findFirst({
      where: { id: parsed.data.assigneeId, isActive: true, archivedAt: null },
      select: { id: true },
    });
    if (!assignee) return NextResponse.json({ error: "Le responsable assigné est invalide." }, { status: 400 });
  }
  const result = await db.$transaction(async (transaction) => {
    const submission = await transaction.publicSubmission.update({
      where: { id },
      data: {
        status: parsed.data.status,
        ...(parsed.data.internalNotes !== undefined ? { internalNotes: parsed.data.internalNotes } : {}),
        ...(parsed.data.reply !== undefined ? { reply: parsed.data.reply } : {}),
        ...(parsed.data.assigneeId !== undefined ? { assigneeId: parsed.data.assigneeId } : {}),
      },
      select: { id: true, status: true, updatedAt: true },
    });
    if (current.status !== parsed.data.status) {
      await transaction.publicSubmissionEvent.create({
        data: {
          submissionId: id,
          actorId: authorization.user.id,
          fromStatus: current.status,
          toStatus: parsed.data.status,
          note: parsed.data.note || null,
        },
      });
    }
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: current.status !== parsed.data.status ? "SENSITIVE_OPERATION" : "USER_UPDATED",
        subjectType: "public-submission",
        subjectId: id,
      },
    });
    return submission;
  });
  return NextResponse.json(result);
}
