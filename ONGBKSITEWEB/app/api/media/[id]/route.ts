import { NextResponse } from "next/server";
import { getCurrentUser, userCan } from "@/lib/auth";
import { db } from "@/lib/db";
import { readPrivateMedia } from "@/lib/private-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const media = await db.mediaAsset.findFirst({
    where: { id, archivedAt: null },
    select: { storageKey: true, mediaType: true, status: true, publishedAt: true },
  });
  if (!media) return NextResponse.json({ error: "Média introuvable." }, { status: 404 });
  const publicMedia = media.status === "PUBLISHED" && Boolean(media.publishedAt);
  if (!publicMedia) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
    if (!userCan(user, "MEDIA_READ")) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  }
  try {
    const bytes = await readPrivateMedia(media.storageKey);
    return new Response(bytes, {
      headers: {
        "Content-Type": media.mediaType,
        "Content-Length": String(bytes.length),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": publicMedia ? "public, max-age=60" : "private, no-store",
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    console.error("Impossible de lire le fichier média privé.", error);
    return NextResponse.json({ error: "Le fichier média est temporairement indisponible." }, { status: 500 });
  }
}
