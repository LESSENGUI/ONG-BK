import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { canReadDocument, readPrivateDocument } from "@/lib/private-documents";
import { recordAudit } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const document = await db.officialDocument.findUnique({
    where: { id },
    select: {
      title: true,
      status: true,
      confidentiality: true,
      storageKey: true,
      mediaType: true,
      fileSize: true,
      uploadedById: true,
      archivedAt: true,
    },
  });
  if (!document || document.archivedAt) {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }
  const user = await getCurrentUser();
  const isFinanceReceipt = user
    ? document.confidentiality === "INTERNAL" &&
      (await Promise.all([
        db.financeIncome.findFirst({ where: { receiptKey: id }, select: { id: true } }),
        db.financeExpense.findFirst({ where: { receiptKey: id }, select: { id: true } }),
      ])).some(Boolean) &&
      user.permissions.includes("FINANCE_READ")
    : false;
  if (
    (!canReadDocument(user, document.confidentiality) && !isFinanceReceipt) ||
    (document.confidentiality === "PUBLIC" && document.status !== "PUBLISHED")
  ) {
    if (user) {
      await recordAudit("ACCESS_DENIED", { actorId: user.id, subjectType: "official-document" });
    }
    return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  }

  let file: Buffer;
  try {
    file = await readPrivateDocument(document.storageKey);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      console.error("Fichier documentaire absent du stockage privé.", { documentId: id });
      return NextResponse.json({ error: "Fichier indisponible." }, { status: 503 });
    }
    if (isFinanceReceipt && user) {
      await recordAudit("SENSITIVE_OPERATION", { actorId: user.id, subjectType: "finance-receipt", subjectId: id });
    }
    throw error;
  }

  const safeFileName = `${id}.${document.mediaType === "application/pdf" ? "pdf" : document.mediaType === "image/jpeg" ? "jpg" : "png"}`;
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": document.mediaType,
      "Content-Length": String(document.fileSize),
      "Content-Disposition": `inline; filename="${safeFileName}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Referrer-Policy": "no-referrer",
    },
  });
}
