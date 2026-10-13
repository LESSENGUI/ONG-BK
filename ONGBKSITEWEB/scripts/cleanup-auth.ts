import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const [sessions, resetTokens, throttleBuckets] = await prisma.$transaction([
    prisma.session.deleteMany({ where: { expiresAt: { lte: now } } }),
    prisma.passwordResetToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lte: now } },
          { usedAt: { not: null, lte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } },
        ],
      },
    }),
    prisma.loginThrottle.deleteMany({
      where: { windowStartedAt: { lte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } },
    }),
  ]);
  console.info(
    `Nettoyage terminé : ${sessions.count} sessions, ${resetTokens.count} jetons de récupération et ${throttleBuckets.count} limites d’essais expirés supprimés.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error("Échec du nettoyage des données d’authentification.", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
