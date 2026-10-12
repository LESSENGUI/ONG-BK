import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/api-auth";
import { memberSchema } from "@/lib/institution-validation";
import { db } from "@/lib/db";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const exporting = url.searchParams.get("format") === "csv";
  const authorization = await authorizeApi(exporting ? "MEMBERS_EXPORT" : "MEMBERS_READ");
  if (authorization.response) return authorization.response;
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") ?? 20) || 20));
  const q = url.searchParams.get("q")?.trim().slice(0, 120);
  const status = url.searchParams.get("status");
  const category = url.searchParams.get("category");
  const where = {
    archivedAt: null,
    ...(status && ["ACTIVE", "SUSPENDED", "PENDING"].includes(status)
      ? { status: status as "ACTIVE" }
      : {}),
    ...(category && ["FOUNDING", "ACTIVE", "HONORARY", "SUPPORTER"].includes(category)
      ? { category: category as "ACTIVE" }
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
  const select = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    locality: true,
    category: true,
    status: true,
    joinedAt: true,
    createdAt: true,
  } as const;
  const orderBy = [{ lastName: "asc" as const }, { firstName: "asc" as const }];
  const items = exporting
    ? await db.member.findMany({ where, orderBy, take: 5000, select })
    : await db.member.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select,
      });
  if (exporting) {
    const escape = (value: string) =>
      `"${(/^[\s]*[=+\-@]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`;
    const rows = [
      ["id", "firstName", "lastName", "email", "phone", "locality", "category", "status", "joinedAt"],
      ...items.map((item) => [
        item.id,
        item.firstName,
        item.lastName,
        item.email ?? "",
        item.phone ?? "",
        item.locality ?? "",
        item.category,
        item.status,
        item.joinedAt?.toISOString() ?? "",
      ]),
    ];
    return new Response(`\uFEFF${rows.map((row) => row.map(escape).join(",")).join("\r\n")}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="ong-bk-membres.csv"',
        "Cache-Control": "no-store",
      },
    });
  }
  const total = await db.member.count({ where });
  return NextResponse.json(
    { items, page, pageSize, total, pages: Math.ceil(total / pageSize) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Requête invalide." }, { status: body.status });
  const parsed = memberSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Fiche de membre invalide." }, { status: 400 });
  const authorization = await authorizeApi("MEMBERS_CREATE");
  if (authorization.response) return authorization.response;
  const member = await db.$transaction(async (transaction) => {
    const created = await transaction.member.create({
      data: {
        ...parsed.data,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        locality: parsed.data.locality || null,
        joinedAt: parsed.data.joinedAt ? new Date(parsed.data.joinedAt) : null,
      },
      select: { id: true, firstName: true, lastName: true, category: true, status: true },
    });
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: "USER_CREATED",
        subjectType: "member",
        subjectId: created.id,
      },
    });
    return created;
  }).catch((error: unknown) => {
    if (error instanceof Error && "code" in error && error.code === "P2002") return null;
    throw error;
  });
  if (!member) return NextResponse.json({ error: "Un membre utilise déjà cette adresse électronique." }, { status: 409 });
  return NextResponse.json(member, { status: 201 });
}
