import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { authorizeApi } from "@/lib/api-auth";
import { financialPeriodSchema } from "@/lib/finance-validation";
import { db } from "@/lib/db";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const authorization = await authorizeApi("FINANCE_READ");
  if (authorization.response) return authorization.response;
  const periods = await db.financialPeriod.findMany({
    orderBy: { startsAt: "desc" },
    take: 100,
    include: {
      responsible: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
      _count: { select: { budgets: true, incomes: true, expenses: true } },
    },
  });
  return NextResponse.json(periods, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const authorization = await authorizeApi("FINANCE_CREATE");
  if (authorization.response) return authorization.response;
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = financialPeriodSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Dates ou exercice invalides." }, { status: 400 });
  const startsAt = new Date(parsed.data.startsAt);
  const endsAt = new Date(parsed.data.endsAt);
  const responsible = await db.user.findFirst({
    where: { id: parsed.data.responsibleId, isActive: true, archivedAt: null },
    select: { id: true },
  });
  if (!responsible) return NextResponse.json({ error: "Responsable inactif ou introuvable." }, { status: 400 });

  let period;
  try {
    period = await db.$transaction(async (transaction) => {
      const overlap = await transaction.financialPeriod.findFirst({
        where: {
          status: { not: "ARCHIVED" },
          startsAt: { lt: endsAt },
          endsAt: { gt: startsAt },
        },
        select: { id: true },
      });
      if (overlap) return null;
    const created = await transaction.financialPeriod.create({
      data: {
        name: parsed.data.name,
        startsAt,
        endsAt,
        responsibleId: responsible.id,
        createdById: authorization.user.id,
      },
    });
    await transaction.financialPeriodEvent.create({
      data: {
        periodId: created.id,
        actorId: authorization.user.id,
        toStatus: "OPEN",
        note: "Création de l’exercice financier.",
      },
    });
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: "SENSITIVE_OPERATION",
        subjectType: "financial-period",
        subjectId: created.id,
      },
    });
    return created;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return NextResponse.json({ error: "Conflit avec un exercice créé simultanément ; réessayez." }, { status: 409 });
    }
    throw error;
  }
  if (!period) {
    return NextResponse.json({ error: "La période chevauche un autre exercice non archivé." }, { status: 409 });
  }
  return NextResponse.json(period, { status: 201, headers: { "Cache-Control": "no-store" } });
}
