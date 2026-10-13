import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/api-auth";
import { membershipDecisionSchema } from "@/lib/institution-validation";
import { db } from "@/lib/db";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedTransitions: Record<string, readonly string[]> = {
  RECEIVED: ["UNDER_REVIEW", "NEEDS_INFORMATION", "ACCEPTED", "REJECTED", "ARCHIVED"],
  UNDER_REVIEW: ["NEEDS_INFORMATION", "ACCEPTED", "REJECTED", "ARCHIVED"],
  NEEDS_INFORMATION: ["UNDER_REVIEW", "ACCEPTED", "REJECTED", "ARCHIVED"],
  ACCEPTED: ["ARCHIVED"],
  REJECTED: ["ARCHIVED"],
  ARCHIVED: [],
};

export async function GET(request: Request) {
  const authorization = await authorizeApi("MEMBERSHIP_REQUESTS_READ");
  if (authorization.response) return authorization.response;

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? 20) || 20));
  const q = url.searchParams.get("q")?.trim().slice(0, 120);
  const status = url.searchParams.get("status");
  const where = {
    ...(status && ["RECEIVED", "UNDER_REVIEW", "NEEDS_INFORMATION", "ACCEPTED", "REJECTED", "ARCHIVED"].includes(status)
      ? { status: status as "RECEIVED" }
      : {}),
    ...(q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" as const } },
            { lastName: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const [items, total] = await db.$transaction([
    db.membershipRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        locality: true,
        motivation: true,
        requestedCategory: true,
        status: true,
        internalNotes: true,
        decisionAt: true,
        createdAt: true,
        decisionBy: { select: { email: true } },
        history: {
          orderBy: { createdAt: "asc" },
          select: { fromStatus: true, toStatus: true, note: true, createdAt: true },
        },
      },
    }),
    db.membershipRequest.count({ where }),
  ]);
  return NextResponse.json({ items, page, pageSize, total, pages: Math.ceil(total / pageSize) }, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PATCH(request: Request) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const envelope = body.value as { id?: unknown; decision?: unknown } | null;
  if (!envelope || typeof envelope.id !== "string" || envelope.id.length > 191) {
    return NextResponse.json({ error: "Demande invalide." }, { status: 400 });
  }
  const parsed = membershipDecisionSchema.safeParse(envelope.decision);
  if (!parsed.success) {
    return NextResponse.json({ error: "Décision invalide." }, { status: 400 });
  }
  const authorization = await authorizeApi("MEMBERSHIP_REQUESTS_DECIDE");
  if (authorization.response) return authorization.response;
  const user = authorization.user;

  const updated = await db.$transaction(async (transaction) => {
    const current = await transaction.membershipRequest.findUnique({
      where: { id: envelope.id as string },
    });
    if (!current) throw new Error("MEMBERSHIP_REQUEST_NOT_FOUND");
    if (!allowedTransitions[current.status].includes(parsed.data.status)) {
      throw new Error("MEMBERSHIP_TRANSITION_NOT_ALLOWED");
    }

    let memberId = current.memberId;
    if (parsed.data.status === "ACCEPTED") {
      const existingMember = await transaction.member.findUnique({
        where: { email: current.email },
        select: { id: true, archivedAt: true },
      });
      if (existingMember && !existingMember.archivedAt) {
        throw new Error("MEMBER_EMAIL_ALREADY_ACTIVE");
      }
      if (existingMember) {
        const reactivated = await transaction.member.update({
          where: { id: existingMember.id },
          data: {
            firstName: current.firstName,
            lastName: current.lastName,
            phone: current.phone,
            locality: current.locality,
            category: parsed.data.category!,
            status: "ACTIVE",
            joinedAt: new Date(),
            archivedAt: null,
          },
          select: { id: true },
        });
        memberId = reactivated.id;
      } else {
        const member = await transaction.member.create({
          data: {
            firstName: current.firstName,
            lastName: current.lastName,
            email: current.email,
            phone: current.phone,
            locality: current.locality,
            category: parsed.data.category!,
            status: "ACTIVE",
            joinedAt: new Date(),
          },
          select: { id: true },
        });
        memberId = member.id;
      }
    }

    const result = await transaction.membershipRequest.update({
      where: { id: current.id },
      data: {
        status: parsed.data.status,
        internalNotes: parsed.data.note || current.internalNotes,
        memberId,
        decisionAt: new Date(),
        decisionById: user.id,
      },
      select: { id: true, status: true, memberId: true, decisionAt: true },
    });
    await transaction.membershipRequestEvent.create({
      data: {
        requestId: current.id,
        actorId: user.id,
        fromStatus: current.status,
        toStatus: parsed.data.status,
        note: parsed.data.note || null,
      },
    });
    await transaction.auditLog.create({
      data: {
        actorId: user.id,
        event: "SENSITIVE_OPERATION",
        subjectType: "membership-request",
        subjectId: current.id,
      },
    });
    return result;
  }).catch((error: unknown) => {
    if (error instanceof Error && error.message === "MEMBERSHIP_REQUEST_NOT_FOUND") return null;
    if (error instanceof Error && error.message === "MEMBERSHIP_TRANSITION_NOT_ALLOWED") return "TRANSITION" as const;
    if (error instanceof Error && error.message === "MEMBER_EMAIL_ALREADY_ACTIVE") return "DUPLICATE" as const;
    throw error;
  });

  if (!updated) return NextResponse.json({ error: "Demande introuvable." }, { status: 404 });
  if (updated === "TRANSITION") {
    return NextResponse.json({ error: "Cette transition de statut n’est pas autorisée." }, { status: 409 });
  }
  if (updated === "DUPLICATE") {
    return NextResponse.json({ error: "Un membre actif possède déjà cette adresse." }, { status: 409 });
  }
  return NextResponse.json(updated);
}
