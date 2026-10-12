import "server-only";
import { db } from "@/lib/db";

export async function isPrivateFinanceReceipt(documentId: string): Promise<boolean> {
  const document = await db.officialDocument.findFirst({
    where: {
      id: documentId,
      archivedAt: null,
      confidentiality: "INTERNAL",
    },
    select: { id: true },
  });
  return Boolean(document);
}
