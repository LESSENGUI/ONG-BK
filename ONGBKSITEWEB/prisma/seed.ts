import { loadEnvConfig } from "@next/env";
import {
  GoverningBodyCode,
  GoverningPositionCode,
  PrismaClient,
  type PermissionCode as PrismaPermissionCode,
} from "@prisma/client";
import { permissionsForRole, roleLabels, type RoleCode } from "../lib/rbac";
import { languageTrainingOpportunity } from "../lib/public-articles";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

const roleDescriptions: Record<RoleCode, string> = {
  SYSTEM_ADMIN:
    "Administration des comptes et attribution des rôles opérationnels, sans pouvoir d’approbation institutionnelle ou financière.",
  TECHNICAL_ADMIN:
    "Maintenance technique et gestion des comptes, sans pouvoir institutionnel d’approbation.",
  BE_PRESIDENT: "Présidence et validation institutionnelle du Bureau exécutif.",
  BE_VICE_PRESIDENT: "Appui à la conduite des activités du Bureau exécutif.",
  SECRETARY_GENERAL: "Gestion administrative et documentaire du Bureau exécutif.",
  DEPUTY_SECRETARY_GENERAL: "Appui aux fonctions du secrétariat général.",
  TREASURER_GENERAL: "Gestion et suivi des opérations financières.",
  DEPUTY_TREASURER_GENERAL: "Appui aux fonctions de trésorerie.",
  ORGANISATION_COMMUNICATION_SECRETARY:
    "Organisation et gestion des contenus de communication.",
  CCE_PRESIDENT:
    "Contrôle indépendant et production de rapports, sans modification des données contrôlées.",
  CCE_MEMBER:
    "Contrôle indépendant et production de rapports, sans modification des données contrôlées.",
  CONTENT_EDITOR: "Création et préparation des contenus sans pouvoir de validation.",
  ONG_MEMBER: "Accès membre limité aux contenus autorisés.",
};

const governingPositions = [
  { code: GoverningPositionCode.BE_PRESIDENT, bodyCode: GoverningBodyCode.EXECUTIVE_BOARD, title: "Président", ordinal: 1 },
  { code: GoverningPositionCode.BE_VICE_PRESIDENT, bodyCode: GoverningBodyCode.EXECUTIVE_BOARD, title: "Vice-président", ordinal: 2 },
  { code: GoverningPositionCode.BE_SECRETARY_GENERAL, bodyCode: GoverningBodyCode.EXECUTIVE_BOARD, title: "Secrétaire général", ordinal: 3 },
  { code: GoverningPositionCode.BE_DEPUTY_SECRETARY_GENERAL, bodyCode: GoverningBodyCode.EXECUTIVE_BOARD, title: "Secrétaire général adjoint", ordinal: 4 },
  { code: GoverningPositionCode.BE_TREASURER_GENERAL, bodyCode: GoverningBodyCode.EXECUTIVE_BOARD, title: "Trésorier général", ordinal: 5 },
  { code: GoverningPositionCode.BE_DEPUTY_TREASURER_GENERAL, bodyCode: GoverningBodyCode.EXECUTIVE_BOARD, title: "Trésorier général adjoint", ordinal: 6 },
  { code: GoverningPositionCode.BE_ORGANISATION_COMMUNICATION_SECRETARY, bodyCode: GoverningBodyCode.EXECUTIVE_BOARD, title: "Secrétaire chargé de l’organisation, de la communication, des relations publiques et des médias", ordinal: 7 },
  { code: GoverningPositionCode.CCE_PRESIDENT, bodyCode: GoverningBodyCode.CONTROL_COMMISSION, title: "Président", ordinal: 1 },
  { code: GoverningPositionCode.CCE_VICE_PRESIDENT, bodyCode: GoverningBodyCode.CONTROL_COMMISSION, title: "Vice-président", ordinal: 2 },
  { code: GoverningPositionCode.CCE_RAPPORTEUR, bodyCode: GoverningBodyCode.CONTROL_COMMISSION, title: "Rapporteur", ordinal: 3 },
];

const identityPages = [
  { key: "presentation", title: "Présentation générale", content: "", status: "DRAFT" as const },
  { key: "vision", title: "Vision", content: "", status: "DRAFT" as const },
  { key: "mission", title: "Mission", content: "", status: "DRAFT" as const },
  { key: "objectives", title: "Objectifs", content: "", status: "DRAFT" as const },
  { key: "domains", title: "Domaines d’intervention", content: "Éducation\nFormation professionnelle\nEntrepreneuriat\nCulture\nEnvironnement\nSanté", status: "PUBLISHED" as const },
  { key: "values", title: "Valeurs", content: "", status: "DRAFT" as const },
  { key: "motto", title: "Devise", content: "Amour, Solidarité, Fraternité", status: "PUBLISHED" as const },
  { key: "slogan", title: "Slogan", content: "Donnons de la joie à la jeunesse", status: "PUBLISHED" as const },
  { key: "history", title: "Historique", content: "", status: "DRAFT" as const },
  { key: "headquarters", title: "Siège et coordonnées", content: "", status: "DRAFT" as const },
  { key: "contact", title: "Coordonnées publiques", content: "", status: "DRAFT" as const },
  { key: "statutes", title: "Documents statutaires", content: "", status: "DRAFT" as const },
];

async function main() {
  await prisma.$transaction(async (transaction) => {
    for (const code of Object.keys(roleLabels) as RoleCode[]) {
      await transaction.role.upsert({
        where: { code },
        update: { name: roleLabels[code], description: roleDescriptions[code] },
        create: { code, name: roleLabels[code], description: roleDescriptions[code] },
      });
      await transaction.rolePermission.deleteMany({ where: { roleCode: code } });
      const permissions = permissionsForRole(code).map((permissionCode) => ({
        roleCode: code,
        permissionCode: permissionCode as PrismaPermissionCode,
      }));
      if (permissions.length) {
        await transaction.rolePermission.createMany({ data: permissions });
      }
    }

    for (const [key, value] of [
      ["site.name", "ONG-BK"],
      ["site.contactEmail", ""],
      ["site.defaultLocale", "fr"],
      ["site.timeZone", "Africa/Brazzaville"],
    ]) {
      await transaction.systemSetting.upsert({
        where: { key },
        update: {},
        create: { key, value },
      });
    }

    for (const position of governingPositions) {
      await transaction.governingPosition.upsert({
        where: { code: position.code },
        update: {
          bodyCode: position.bodyCode,
          title: position.title,
          ordinal: position.ordinal,
        },
        create: position,
      });
    }

    const firstAdmin = await transaction.user.findFirst({
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });
    if (firstAdmin) {
      for (const page of identityPages) {
        await transaction.contentPage.upsert({
          where: { key: page.key },
          update: {},
          create: {
            ...page,
            authorId: firstAdmin.id,
            ...(page.status === "PUBLISHED" ? { publishedAt: new Date() } : {}),
          },
        });
      }

      const reviewedAt = new Date();
      await transaction.publication.upsert({
        where: { slug: languageTrainingOpportunity.slug },
        update: {},
        create: {
          slug: languageTrainingOpportunity.slug,
          type: languageTrainingOpportunity.type,
          title: languageTrainingOpportunity.title,
          summary: languageTrainingOpportunity.summary,
          body: languageTrainingOpportunity.body,
          category: languageTrainingOpportunity.category,
          tags: [...languageTrainingOpportunity.tags],
          status: "PUBLISHED",
          authorId: firstAdmin.id,
          reviewerId: firstAdmin.id,
          reviewedAt,
          publishedAt: reviewedAt,
        },
      });
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error("Échec du seed des rôles et permissions.", error);
    await prisma.$disconnect();
    process.exitCode = 1;
  });
