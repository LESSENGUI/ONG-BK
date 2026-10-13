import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { authorizeApi } from "@/lib/api-auth";
import { mandateSchema } from "@/lib/institution-validation";
import { db } from "@/lib/db";
import { canReadDocument } from "@/lib/private-documents";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const exporting = url.searchParams.get("format") === "csv";
  const authorization = await authorizeApi(exporting ? "GOVERNANCE_EXPORT" : "GOVERNANCE_READ");
  if (authorization.response) return authorization.response;
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? 10) || 10));
  const bodyCode = url.searchParams.get("body");
  const where: Prisma.GoverningMandateWhereInput = {
    ...(bodyCode === "EXECUTIVE_BOARD" || bodyCode === "CONTROL_COMMISSION"
      ? { bodyCode: bodyCode as "EXECUTIVE_BOARD" | "CONTROL_COMMISSION" }
      : {}),
  };
  const select = {
    id: true,
    bodyCode: true,
    positionCode: true,
    startDate: true,
    endDate: true,
    status: true,
    biography: true,
    photoPath: true,
    createdAt: true,
    position: { select: { title: true, ordinal: true } },
    member: {
      select: { id: true, firstName: true, lastName: true, email: true, phone: true },
    },
    appointmentDocument: {
      select: { id: true, title: true, confidentiality: true, status: true },
    },
  } as const;
  const orderBy = [
    { bodyCode: "asc" as const },
    { position: { ordinal: "asc" as const } },
    { startDate: "desc" as const },
  ];
  const items = exporting
    ? await db.governingMandate.findMany({ where, orderBy, take: 1000, select })
    : await db.governingMandate.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select,
      });
  if (exporting) {
    const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const rows = [
      ["body", "position", "firstName", "lastName", "status", "startDate", "endDate"],
      ...items.map((item) => [
        item.bodyCode,
        item.position.title,
        item.member.firstName,
        item.member.lastName,
        item.status,
        item.startDate?.toISOString().slice(0, 10) ?? "",
        item.endDate?.toISOString().slice(0, 10) ?? "",
      ]),
    ];
    return new Response(`\uFEFF${rows.map((row) => row.map(escape).join(",")).join("\r\n")}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="ong-bk-gouvernance.csv"',
        "Cache-Control": "no-store",
      },
    });
  }
  const visibleItems = items.map((item) => ({
    ...item,
    appointmentDocument:
      item.appointmentDocument &&
      canReadDocument(authorization.user, item.appointmentDocument.confidentiality) &&
      (item.appointmentDocument.confidentiality !== "PUBLIC" ||
        item.appointmentDocument.status === "PUBLISHED")
        ? {
            id: item.appointmentDocument.id,
            title: item.appointmentDocument.title,
          }
        : null,
  }));
  const total = await db.governingMandate.count({ where });
  return NextResponse.json({
    items: visibleItems,
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
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = mandateSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Mandat invalide." }, { status: 400 });
  const createPermission = parsed.data.bodyCode === "EXECUTIVE_BOARD"
    ? "BE_GOVERNANCE_CREATE"
    : "CCE_GOVERNANCE_CREATE";
  const authorization = await authorizeApi(createPermission);
  if (authorization.response) return authorization.response;
  if (parsed.data.status === "ACTIVE") {
    const approvalPermission = parsed.data.bodyCode === "EXECUTIVE_BOARD"
      ? "BE_GOVERNANCE_APPROVE"
      : "CCE_GOVERNANCE_APPROVE";
    const approval = await authorizeApi(approvalPermission);
    if (approval.response) return approval.response;
  }

  const member = await db.member.findUnique({
    where: { id: parsed.data.memberId },
    select: { id: true, status: true, archivedAt: true },
  });
  if (!member || member.status !== "ACTIVE" || member.archivedAt) {
    return NextResponse.json({ error: "Un membre actif est requis pour un mandat." }, { status: 422 });
  }
  const position = await db.governingPosition.findUnique({
    where: { code: parsed.data.positionCode },
    select: { bodyCode: true, enabled: true },
  });
  if (!position || !position.enabled || position.bodyCode !== parsed.data.bodyCode) {
    return NextResponse.json({ error: "Poste institutionnel invalide ou désactivé." }, { status: 422 });
  }
  if (parsed.data.appointmentDocumentId) {
    const document = await db.officialDocument.findUnique({
      where: { id: parsed.data.appointmentDocumentId },
      select: { category: true, confidentiality: true, archivedAt: true },
    });
    if (
      !document ||
      document.category !== "APPOINTMENT" ||
      document.archivedAt ||
      !canReadDocument(authorization.user, document.confidentiality)
    ) {
      return NextResponse.json({ error: "Document de nomination introuvable ou non autorisé." }, { status: 422 });
    }
  }
  if (parsed.data.status === "ACTIVE") {
    const active = await db.governingMandate.findFirst({
      where: {
        bodyCode: parsed.data.bodyCode,
        positionCode: parsed.data.positionCode,
        status: "ACTIVE",
      },
      select: { id: true },
    });
    if (active) {
      return NextResponse.json({ error: "Ce poste a déjà un mandat actif. Clôturez-le avant une nouvelle nomination." }, { status: 409 });
    }
  }
  const created = await db.$transaction(async (transaction) => {
    const mandate = await transaction.governingMandate.create({
      data: {
        ...parsed.data,
        activeSlot: parsed.data.status === "ACTIVE" ? parsed.data.positionCode : null,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
        biography: parsed.data.biography || null,
        photoPath: parsed.data.photoPath || null,
        appointmentDocumentId: parsed.data.appointmentDocumentId || null,
      },
      select: { id: true, status: true, bodyCode: true, positionCode: true },
    });
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: "SENSITIVE_OPERATION",
        subjectType: "governing-mandate",
        subjectId: mandate.id,
      },
    });
    return mandate;
  }).catch((error: unknown) => {
    if (error instanceof Error && "code" in error && error.code === "P2002") return null;
    throw error;
  });
  if (!created) {
    return NextResponse.json({ error: "Ce poste possède déjà un mandat actif." }, { status: 409 });
  }
  return NextResponse.json(created, { status: 201 });
}
