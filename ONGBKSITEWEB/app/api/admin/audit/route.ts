import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/api-auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const format = new URL(request.url).searchParams.get("format");
  const authorization = await authorizeApi(format === "csv" ? "AUDIT_EXPORT" : "AUDIT_READ");
  if (authorization.response) return authorization.response;

  const entries = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true,
      event: true,
      actorId: true,
      subjectType: true,
      subjectId: true,
      createdAt: true,
    },
  });

  if (format === "csv") {
    const escape = (value: string) => {
      const safeValue = /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value;
      return `"${safeValue.replaceAll('"', '""')}"`;
    };
    const rows = [
      ["id", "event", "actorId", "subjectType", "subjectId", "createdAt"],
      ...entries.map((entry) => [
        entry.id,
        entry.event,
        entry.actorId ?? "",
        entry.subjectType ?? "",
        entry.subjectId ?? "",
        entry.createdAt.toISOString(),
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(escape).join(",")).join("\r\n")}`;
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="ong-bk-audit.csv"',
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.json(entries, { headers: { "Cache-Control": "no-store" } });
}
