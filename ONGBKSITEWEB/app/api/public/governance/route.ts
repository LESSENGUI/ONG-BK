import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const bodyCode = new URL(request.url).searchParams.get("body");
  if (bodyCode !== "EXECUTIVE_BOARD" && bodyCode !== "CONTROL_COMMISSION") {
    return NextResponse.json({ error: "Organe institutionnel invalide." }, { status: 400 });
  }

  const mandates = await db.governingMandate.findMany({
    where: {
      bodyCode,
      status: "ACTIVE",
      member: { is: { status: "ACTIVE", archivedAt: null } },
      appointmentDocument: {
        is: {
          category: "APPOINTMENT",
          status: "PUBLISHED",
          confidentiality: "PUBLIC",
          publishedAt: { not: null },
          archivedAt: null,
        },
      },
    },
    orderBy: [{ position: { ordinal: "asc" } }, { startDate: "desc" }],
    select: {
      position: { select: { title: true } },
      member: { select: { firstName: true, lastName: true } },
      startDate: true,
      endDate: true,
    },
  });

  return NextResponse.json(
    {
      members: mandates.map((mandate) => ({
        position: mandate.position.title,
        name: `${mandate.member.firstName} ${mandate.member.lastName}`,
        startDate: mandate.startDate?.toISOString().slice(0, 10) ?? null,
        endDate: mandate.endDate?.toISOString().slice(0, 10) ?? null,
      })),
    },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
