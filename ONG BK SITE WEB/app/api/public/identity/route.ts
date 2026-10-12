import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const pages = await db.contentPage.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { key: "asc" },
    select: { key: true, title: true, content: true, imagePath: true, publishedAt: true },
  });
  return NextResponse.json(pages, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
