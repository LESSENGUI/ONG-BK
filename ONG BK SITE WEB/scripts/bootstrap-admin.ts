import { loadEnvConfig } from "@next/env";
import bcrypt from "bcryptjs";
import { PrismaClient, RoleCode } from "@prisma/client";
import { z } from "zod";

loadEnvConfig(process.cwd());

const environmentSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(12)
    .max(72)
    .refine((value) => Buffer.byteLength(value, "utf8") <= 72),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
});

const input = environmentSchema.safeParse({
  email: process.env.BOOTSTRAP_ADMIN_EMAIL,
  password: process.env.BOOTSTRAP_ADMIN_PASSWORD,
  firstName: process.env.BOOTSTRAP_ADMIN_FIRST_NAME,
  lastName: process.env.BOOTSTRAP_ADMIN_LAST_NAME,
});

const prisma = new PrismaClient();

async function main() {
  if (!input.success) {
    throw new Error(
      "Définissez BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD, BOOTSTRAP_ADMIN_FIRST_NAME et BOOTSTRAP_ADMIN_LAST_NAME dans votre environnement avant de continuer.",
    );
  }
  const admin = input.data;

  const passwordHash = await bcrypt.hash(admin.password, 12);
  await prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw`
      SELECT "code" FROM "Role"
      WHERE "code" = ${RoleCode.SYSTEM_ADMIN}::"RoleCode"
      FOR UPDATE
    `;
    const administratorRole = await transaction.role.findUnique({
      where: { code: RoleCode.SYSTEM_ADMIN },
    });
    if (!administratorRole) {
      throw new Error("Exécutez npm run db:seed avant le bootstrap administrateur.");
    }
    if ((await transaction.user.count()) !== 0) {
      throw new Error(
        "Le bootstrap est désactivé car un compte existe déjà. Créez les comptes suivants depuis un processus d’administration autorisé.",
      );
    }

    const createdUser = await transaction.user.create({
      data: {
        email: admin.email,
        passwordHash,
        roleCode: RoleCode.SYSTEM_ADMIN,
        profile: {
          create: {
            firstName: admin.firstName,
            lastName: admin.lastName,
            title: "Administrateur principal",
          },
        },
      },
    });
    await transaction.auditLog.create({
      data: { event: "USER_CREATED", subjectType: "user", subjectId: createdUser.id },
    });
  });
  console.info("Compte administrateur principal initial créé. Aucun mot de passe n’a été affiché.");
}

main()
  .catch((error: unknown) => {
    console.error("Échec du bootstrap administrateur.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    delete process.env.BOOTSTRAP_ADMIN_EMAIL;
    delete process.env.BOOTSTRAP_ADMIN_PASSWORD;
    delete process.env.BOOTSTRAP_ADMIN_FIRST_NAME;
    delete process.env.BOOTSTRAP_ADMIN_LAST_NAME;
  });
