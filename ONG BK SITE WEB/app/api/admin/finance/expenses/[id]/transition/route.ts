import { NextResponse } from "next/server";
import type { FinanceExpenseStatus } from "@prisma/client";
import { authorizeApi } from "@/lib/api-auth";
import { expenseTransitionSchema } from "@/lib/finance-validation";
import { db } from "@/lib/db";
import { isPrivateFinanceReceipt } from "@/lib/finance-documents";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";
import type { PermissionCode } from "@/lib/rbac";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedTransitions: Record<FinanceExpenseStatus, readonly FinanceExpenseStatus[]> = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["UNDER_REVIEW", "CANCELLED"],
  UNDER_REVIEW: ["PENDING_APPROVAL", "REJECTED", "CANCELLED"],
  PENDING_APPROVAL: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["PAID", "CANCELLED"],
  REJECTED: ["ARCHIVED"],
  PAID: ["ARCHIVED"],
  CANCELLED: ["ARCHIVED"],
  ARCHIVED: [],
};

const requiredPermission: Partial<Record<FinanceExpenseStatus, PermissionCode>> = {
  SUBMITTED: "FINANCE_UPDATE",
  UNDER_REVIEW: "FINANCE_UPDATE",
  PENDING_APPROVAL: "FINANCE_UPDATE",
  APPROVED: "FINANCE_APPROVE",
  REJECTED: "FINANCE_APPROVE",
  PAID: "FINANCE_CREATE",
  CANCELLED: "FINANCE_UPDATE",
  ARCHIVED: "FINANCE_ARCHIVE",
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const { id } = await context.params;
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = expenseTransitionSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Transition ou justificatif invalide." }, { status: 400 });
  const permission = requiredPermission[parsed.data.transition];
  if (!permission) return NextResponse.json({ error: "Transition non autorisée." }, { status: 400 });
  const authorization = await authorizeApi(permission);
  if (authorization.response) return authorization.response;

  const current = await db.financeExpense.findUnique({
    where: { id },
    include: { period: { select: { status: true } } },
  });
  if (!current) return NextResponse.json({ error: "Dépense introuvable." }, { status: 404 });
  if (!allowedTransitions[current.status].includes(parsed.data.transition)) {
    return NextResponse.json({ error: "Cette transition n’est pas autorisée depuis le statut actuel." }, { status: 409 });
  }
  if (current.period.status !== "OPEN" && parsed.data.transition !== "ARCHIVED") {
    return NextResponse.json({ error: "L’exercice est clôturé ; aucune opération n’y est autorisée." }, { status: 409 });
  }
  if (parsed.data.transition === "UNDER_REVIEW" && current.requesterId === authorization.user.id) {
    return NextResponse.json({ error: "Le demandeur ne peut pas vérifier sa propre dépense." }, { status: 403 });
  }
  if (["APPROVED", "REJECTED"].includes(parsed.data.transition)) {
    if (current.requesterId === authorization.user.id || current.verifierId === authorization.user.id) {
      return NextResponse.json({ error: "La personne ayant demandé ou vérifié la dépense ne peut pas l’approuver seule." }, { status: 403 });
    }
  }
  if (parsed.data.transition === "PAID" && current.requesterId === authorization.user.id) {
    return NextResponse.json({ error: "Le demandeur ne peut pas enregistrer seul le paiement de sa demande." }, { status: 403 });
  }
  if (["CANCELLED", "REJECTED"].includes(parsed.data.transition) && !parsed.data.note?.trim()) {
    return NextResponse.json({ error: "Un motif est requis pour un rejet ou une annulation." }, { status: 400 });
  }
  if (
    parsed.data.transition === "PAID" &&
    parsed.data.receiptKey &&
    !(await isPrivateFinanceReceipt(parsed.data.receiptKey))
  ) {
    return NextResponse.json({ error: "Le justificatif de paiement doit être un document interne privé non archivé." }, { status: 400 });
  }

  const data = {
    status: parsed.data.transition,
    ...(parsed.data.transition === "UNDER_REVIEW" || parsed.data.transition === "PENDING_APPROVAL"
      ? { verifierId: authorization.user.id }
      : {}),
    ...(parsed.data.transition === "APPROVED" ? { approverId: authorization.user.id } : {}),
    ...(parsed.data.transition === "PAID"
      ? {
          payerId: authorization.user.id,
          paidAt: new Date(),
          paymentMethod: parsed.data.paymentMethod,
          receiptKey: parsed.data.receiptKey,
        }
      : {}),
  };

  const updated = await db.$transaction(async (transaction) => {
    const expense = await transaction.financeExpense.update({ where: { id }, data });
    await transaction.financeExpenseEvent.create({
      data: {
        expenseId: id,
        actorId: authorization.user.id,
        fromStatus: current.status,
        toStatus: parsed.data.transition,
        note: parsed.data.note,
      },
    });
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: "SENSITIVE_OPERATION",
        subjectType: `finance-expense:${parsed.data.transition.toLowerCase()}`,
        subjectId: id,
      },
    });
    return expense;
  });
  return NextResponse.json(updated, { headers: { "Cache-Control": "no-store" } });
}
