import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const expired = await prisma.membershipRequest.findMany({
    where: { retentionUntil: { lte: now } },
    select: {
      id: true,
      documents: { select: { id: true }, take: 1 },
    },
    take: 500,
  });
  const deletableIds = expired.filter((item) => item.documents.length === 0).map((item) => item.id);
  const blockedByDocuments = expired.length - deletableIds.length;
  const deleted = await prisma.$transaction(async (transaction) => {
    const result = deletableIds.length
      ? await transaction.membershipRequest.deleteMany({ where: { id: { in: deletableIds } } })
      : { count: 0 };
    if (result.count) {
      await transaction.auditLog.create({
        data: {
          event: "SENSITIVE_OPERATION",
          subjectType: "membership-request-retention",
          subjectId: null,
        },
      });
    }
    return result.count;
  });
  console.info(
    `Rétention terminée : ${deleted} demandes expirées supprimées ; ${blockedByDocuments} conservées car elles référencent des documents à traiter selon la politique documentaire.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error("Échec du nettoyage des demandes d’adhésion expirées.", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
