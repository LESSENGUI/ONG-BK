-- Completes the migration history to match prisma/schema.prisma.
-- Review against a restored copy of the target database before deployment.
BEGIN;
ALTER TYPE "PermissionCode" ADD VALUE 'INBOX_EXPORT';

ALTER TYPE "PermissionCode" ADD VALUE 'INBOX_UPDATE';

ALTER TYPE "PermissionCode" ADD VALUE 'INBOX_READ';

ALTER TYPE "PermissionCode" ADD VALUE 'MEDIA_EXPORT';

ALTER TYPE "PermissionCode" ADD VALUE 'MEDIA_ARCHIVE';

ALTER TYPE "PermissionCode" ADD VALUE 'MEDIA_APPROVE';

ALTER TYPE "PermissionCode" ADD VALUE 'MEDIA_UPDATE';

ALTER TYPE "PermissionCode" ADD VALUE 'MEDIA_CREATE';

ALTER TYPE "PermissionCode" ADD VALUE 'MEDIA_READ';

ALTER TYPE "PermissionCode" ADD VALUE 'PARTNERS_EXPORT';

ALTER TYPE "PermissionCode" ADD VALUE 'PARTNERS_ARCHIVE';

ALTER TYPE "PermissionCode" ADD VALUE 'PARTNERS_APPROVE';

ALTER TYPE "PermissionCode" ADD VALUE 'PARTNERS_UPDATE';

ALTER TYPE "PermissionCode" ADD VALUE 'PARTNERS_CREATE';

ALTER TYPE "PermissionCode" ADD VALUE 'PARTNERS_READ';

ALTER TYPE "PermissionCode" ADD VALUE 'ACTIVITIES_EXPORT';

ALTER TYPE "PermissionCode" ADD VALUE 'ACTIVITIES_ARCHIVE';

ALTER TYPE "PermissionCode" ADD VALUE 'ACTIVITIES_APPROVE';

ALTER TYPE "PermissionCode" ADD VALUE 'ACTIVITIES_UPDATE';

ALTER TYPE "PermissionCode" ADD VALUE 'ACTIVITIES_CREATE';

ALTER TYPE "PermissionCode" ADD VALUE 'ACTIVITIES_READ';

ALTER TYPE "PermissionCode" ADD VALUE 'PROJECTS_EXPORT';

ALTER TYPE "PermissionCode" ADD VALUE 'PROJECTS_ARCHIVE';

ALTER TYPE "PermissionCode" ADD VALUE 'PROJECTS_APPROVE';

ALTER TYPE "PermissionCode" ADD VALUE 'PROJECTS_UPDATE';

ALTER TYPE "PermissionCode" ADD VALUE 'PROJECTS_CREATE';

ALTER TYPE "PermissionCode" ADD VALUE 'PROJECTS_READ';

ALTER TYPE "PermissionCode" ADD VALUE 'CCE_RESPONSES_CREATE';

ALTER TYPE "PermissionCode" ADD VALUE 'CCE_FINDINGS_UPDATE';

ALTER TYPE "PermissionCode" ADD VALUE 'CCE_FINDINGS_CREATE';

ALTER TYPE "PermissionCode" ADD VALUE 'CCE_FINDINGS_READ';

ALTER TYPE "PermissionCode" ADD VALUE 'TASKS_UPDATE';

ALTER TYPE "PermissionCode" ADD VALUE 'TASKS_ASSIGN';

ALTER TYPE "PermissionCode" ADD VALUE 'TASKS_CREATE';

ALTER TYPE "PermissionCode" ADD VALUE 'TASKS_READ';

ALTER TYPE "RoleCode" ADD VALUE 'SYSTEM_ADMIN';

-- CreateEnum
CREATE TYPE "FinancialPeriodStatus" AS ENUM ('OPEN', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FinanceIncomeStatus" AS ENUM ('EXPECTED', 'COMMITTED', 'RECEIVED', 'VERIFIED', 'CANCELLED', 'REVERSED');

-- CreateEnum
CREATE TYPE "FinanceIncomeCategory" AS ENUM ('MEMBERSHIP_DUES', 'DONATION', 'GRANT', 'PARTNERSHIP', 'EVENT', 'SPONSORSHIP', 'OTHER');

-- CreateEnum
CREATE TYPE "FinanceExpenseStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CceFindingStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'TREATED', 'CLOSED');

-- CreateEnum
CREATE TYPE "AdminTaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE');

-- CreateEnum
CREATE TYPE "FinanceBudgetStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PLANNED', 'IN_PROGRESS', 'SUSPENDED', 'COMPLETED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('DRAFT', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PartnerCategory" AS ENUM ('INSTITUTIONAL', 'TECHNICAL', 'FINANCIAL', 'ASSOCIATIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('PROSPECT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PublicationType" AS ENUM ('NEWS', 'ANNOUNCEMENT', 'PRESS_RELEASE', 'ACTIVITY_REPORT', 'VOLUNTEER_CALL', 'PROJECT_CALL', 'CAMPAIGN', 'PUBLICATION', 'REPORT');

-- CreateEnum
CREATE TYPE "SubmissionType" AS ENUM ('CONTACT', 'PARTNERSHIP', 'PROJECT_PROPOSAL', 'VOLUNTEER');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('RECEIVED', 'IN_PROGRESS', 'NEEDS_INFORMATION', 'ANSWERED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MeasurementStatus" AS ENUM ('PLANNED', 'ESTIMATED', 'REALIZED', 'VERIFIED');

-- CreateTable
CREATE TABLE "PartnerDocument" (
    "partnerId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,

    CONSTRAINT "PartnerDocument_pkey" PRIMARY KEY ("partnerId","documentId")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "reference" VARCHAR(60) NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "justification" TEXT NOT NULL DEFAULT '',
    "problemStatement" TEXT NOT NULL DEFAULT '',
    "targetBeneficiaries" TEXT NOT NULL DEFAULT '',
    "generalObjective" TEXT NOT NULL DEFAULT '',
    "specificObjectives" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "domain" VARCHAR(120) NOT NULL,
    "geographicArea" VARCHAR(240) NOT NULL DEFAULT '',
    "plannedBudget" DECIMAL(18,2),
    "plannedBudgetCurrency" CHAR(3),
    "expectedResults" TEXT NOT NULL DEFAULT '',
    "actualResults" TEXT NOT NULL DEFAULT '',
    "difficulties" TEXT NOT NULL DEFAULT '',
    "correctiveMeasures" TEXT NOT NULL DEFAULT '',
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "managerId" TEXT,
    "authorId" TEXT NOT NULL,
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectRevision" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "editorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectStage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" VARCHAR(220) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectIndicator" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" VARCHAR(220) NOT NULL,
    "unit" VARCHAR(60) NOT NULL,
    "plannedValue" DECIMAL(18,4),
    "actualValue" DECIMAL(18,4),
    "measurement" "MeasurementStatus" NOT NULL DEFAULT 'PLANNED',
    "evidence" TEXT NOT NULL DEFAULT '',
    "measuredAt" TIMESTAMP(3),

    CONSTRAINT "ProjectIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTeamMember" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "role" VARCHAR(180) NOT NULL DEFAULT '',

    CONSTRAINT "ProjectTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(240) NOT NULL,
    "category" "PartnerCategory" NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "logoPath" VARCHAR(500),
    "publicEmail" VARCHAR(254),
    "publicPhone" VARCHAR(40),
    "website" VARCHAR(500),
    "contactName" VARCHAR(180),
    "contactEmail" VARCHAR(254),
    "contactPhone" VARCHAR(40),
    "collaboration" TEXT NOT NULL DEFAULT '',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "PartnerStatus" NOT NULL DEFAULT 'PROSPECT',
    "showOnPublicSite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectPartner" (
    "projectId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,

    CONSTRAINT "ProjectPartner_pkey" PRIMARY KEY ("projectId","partnerId")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "eventDate" TIMESTAMP(3),
    "location" VARCHAR(240) NOT NULL DEFAULT '',
    "domain" VARCHAR(120) NOT NULL,
    "projectId" TEXT,
    "managerId" TEXT,
    "objectives" TEXT NOT NULL DEFAULT '',
    "plannedParticipants" INTEGER,
    "realizedParticipants" INTEGER,
    "resourcesUsed" TEXT NOT NULL DEFAULT '',
    "results" TEXT NOT NULL DEFAULT '',
    "difficulties" TEXT NOT NULL DEFAULT '',
    "correctiveMeasures" TEXT NOT NULL DEFAULT '',
    "report" TEXT NOT NULL DEFAULT '',
    "status" "ActivityStatus" NOT NULL DEFAULT 'DRAFT',
    "public" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityRevision" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "editorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityIndicator" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "category" VARCHAR(180) NOT NULL,
    "unit" VARCHAR(60) NOT NULL DEFAULT 'personnes',
    "plannedValue" DECIMAL(18,4),
    "actualValue" DECIMAL(18,4),
    "measurement" "MeasurementStatus" NOT NULL DEFAULT 'PLANNED',

    CONSTRAINT "ActivityIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityPartner" (
    "activityId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,

    CONSTRAINT "ActivityPartner_pkey" PRIMARY KEY ("activityId","partnerId")
);

-- CreateTable
CREATE TABLE "ProjectDocument" (
    "projectId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,

    CONSTRAINT "ProjectDocument_pkey" PRIMARY KEY ("projectId","documentId")
);

-- CreateTable
CREATE TABLE "ActivityDocument" (
    "activityId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,

    CONSTRAINT "ActivityDocument_pkey" PRIMARY KEY ("activityId","documentId")
);

-- CreateTable
CREATE TABLE "Publication" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "type" "PublicationType" NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "summary" VARCHAR(1000) NOT NULL,
    "body" TEXT NOT NULL,
    "category" VARCHAR(120) NOT NULL DEFAULT '',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "authorId" TEXT NOT NULL,
    "reviewerId" TEXT,
    "coverMediaId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicationRevision" (
    "id" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "summary" VARCHAR(1000) NOT NULL,
    "body" TEXT NOT NULL,
    "editorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublicationRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "caption" VARCHAR(1000) NOT NULL DEFAULT '',
    "altText" VARCHAR(500) NOT NULL DEFAULT '',
    "source" VARCHAR(240) NOT NULL DEFAULT '',
    "usageRights" VARCHAR(500) NOT NULL DEFAULT '',
    "capturedAt" TIMESTAMP(3),
    "mediaType" VARCHAR(100) NOT NULL,
    "storageKey" VARCHAR(500) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "uploaderId" TEXT NOT NULL,
    "projectId" TEXT,
    "activityId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicationMedia" (
    "publicationId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PublicationMedia_pkey" PRIMARY KEY ("publicationId","mediaId")
);

-- CreateTable
CREATE TABLE "PublicSubmission" (
    "id" TEXT NOT NULL,
    "type" "SubmissionType" NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'RECEIVED',
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "phone" VARCHAR(40),
    "subject" VARCHAR(240) NOT NULL,
    "message" VARCHAR(10000) NOT NULL,
    "organization" VARCHAR(240),
    "internalNotes" TEXT NOT NULL DEFAULT '',
    "reply" TEXT NOT NULL DEFAULT '',
    "assigneeId" TEXT,
    "retentionUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicSubmissionEvent" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "actorId" TEXT,
    "fromStatus" "SubmissionStatus",
    "toStatus" "SubmissionStatus" NOT NULL,
    "note" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublicSubmissionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminTask" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" VARCHAR(4000) NOT NULL DEFAULT '',
    "status" "AdminTaskStatus" NOT NULL DEFAULT 'TODO',
    "dueAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "assigneeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialPeriod" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "FinancialPeriodStatus" NOT NULL DEFAULT 'OPEN',
    "responsibleId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceBudget" (
    "id" TEXT NOT NULL,
    "reference" VARCHAR(60) NOT NULL,
    "periodId" TEXT NOT NULL,
    "category" VARCHAR(120) NOT NULL,
    "domain" VARCHAR(120) NOT NULL,
    "initialAmount" DECIMAL(18,2) NOT NULL,
    "revisedAmount" DECIMAL(18,2) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "justification" VARCHAR(4000) NOT NULL,
    "fundingSource" VARCHAR(240),
    "projectId" TEXT,
    "activityId" TEXT,
    "status" "FinanceBudgetStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceBudget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceIncome" (
    "id" TEXT NOT NULL,
    "reference" VARCHAR(60) NOT NULL,
    "periodId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "category" "FinanceIncomeCategory" NOT NULL,
    "source" VARCHAR(240) NOT NULL,
    "status" "FinanceIncomeStatus" NOT NULL DEFAULT 'EXPECTED',
    "paymentMethod" VARCHAR(80),
    "receiptKey" VARCHAR(100),
    "observations" VARCHAR(2000) NOT NULL DEFAULT '',
    "projectId" TEXT,
    "activityId" TEXT,
    "recordedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceIncome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceExpense" (
    "id" TEXT NOT NULL,
    "reference" VARCHAR(60) NOT NULL,
    "periodId" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "category" VARCHAR(120) NOT NULL,
    "purpose" VARCHAR(2000) NOT NULL,
    "beneficiary" VARCHAR(240),
    "paymentMethod" VARCHAR(80),
    "receiptKey" VARCHAR(100),
    "status" "FinanceExpenseStatus" NOT NULL DEFAULT 'DRAFT',
    "projectId" TEXT,
    "activityId" TEXT,
    "requesterId" TEXT NOT NULL,
    "verifierId" TEXT,
    "approverId" TEXT,
    "payerId" TEXT,
    "observations" VARCHAR(2000) NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceExpenseEvent" (
    "id" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "fromStatus" "FinanceExpenseStatus",
    "toStatus" "FinanceExpenseStatus" NOT NULL,
    "note" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinanceExpenseEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialPeriodEvent" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "fromStatus" "FinancialPeriodStatus",
    "toStatus" "FinancialPeriodStatus" NOT NULL,
    "note" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialPeriodEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceBudgetEvent" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "fromStatus" "FinanceBudgetStatus",
    "toStatus" "FinanceBudgetStatus" NOT NULL,
    "note" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinanceBudgetEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceIncomeEvent" (
    "id" TEXT NOT NULL,
    "incomeId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "fromStatus" "FinanceIncomeStatus",
    "toStatus" "FinanceIncomeStatus" NOT NULL,
    "note" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinanceIncomeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CceFinding" (
    "id" TEXT NOT NULL,
    "reference" VARCHAR(60) NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "observation" VARCHAR(5000) NOT NULL,
    "recommendation" VARCHAR(5000) NOT NULL,
    "status" "CceFindingStatus" NOT NULL DEFAULT 'OPEN',
    "dueAt" TIMESTAMP(3),
    "assigneeId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CceFinding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CceResponse" (
    "id" TEXT NOT NULL,
    "findingId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "response" VARCHAR(5000) NOT NULL,
    "corrective" VARCHAR(5000) NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CceResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CceFindingEvent" (
    "id" TEXT NOT NULL,
    "findingId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "fromStatus" "CceFindingStatus",
    "toStatus" "CceFindingStatus" NOT NULL,
    "note" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CceFindingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartnerDocument_documentId_idx" ON "PartnerDocument"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_reference_key" ON "Project"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_status_startDate_endDate_idx" ON "Project"("status", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "Project_domain_status_idx" ON "Project"("domain", "status");

-- CreateIndex
CREATE INDEX "Project_managerId_status_idx" ON "Project"("managerId", "status");

-- CreateIndex
CREATE INDEX "Project_archivedAt_idx" ON "Project"("archivedAt");

-- CreateIndex
CREATE INDEX "ProjectRevision_projectId_createdAt_idx" ON "ProjectRevision"("projectId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectRevision_projectId_version_key" ON "ProjectRevision"("projectId", "version");

-- CreateIndex
CREATE INDEX "ProjectStage_projectId_sortOrder_idx" ON "ProjectStage"("projectId", "sortOrder");

-- CreateIndex
CREATE INDEX "ProjectIndicator_projectId_measurement_idx" ON "ProjectIndicator"("projectId", "measurement");

-- CreateIndex
CREATE INDEX "ProjectTeamMember_memberId_idx" ON "ProjectTeamMember"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectTeamMember_projectId_memberId_key" ON "ProjectTeamMember"("projectId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_name_key" ON "Partner"("name");

-- CreateIndex
CREATE INDEX "Partner_category_status_showOnPublicSite_idx" ON "Partner"("category", "status", "showOnPublicSite");

-- CreateIndex
CREATE INDEX "ProjectPartner_partnerId_idx" ON "ProjectPartner"("partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_slug_key" ON "Activity"("slug");

-- CreateIndex
CREATE INDEX "Activity_status_eventDate_idx" ON "Activity"("status", "eventDate");

-- CreateIndex
CREATE INDEX "Activity_domain_status_idx" ON "Activity"("domain", "status");

-- CreateIndex
CREATE INDEX "Activity_projectId_eventDate_idx" ON "Activity"("projectId", "eventDate");

-- CreateIndex
CREATE INDEX "Activity_managerId_status_idx" ON "Activity"("managerId", "status");

-- CreateIndex
CREATE INDEX "ActivityRevision_activityId_createdAt_idx" ON "ActivityRevision"("activityId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityRevision_activityId_version_key" ON "ActivityRevision"("activityId", "version");

-- CreateIndex
CREATE INDEX "ActivityIndicator_activityId_measurement_idx" ON "ActivityIndicator"("activityId", "measurement");

-- CreateIndex
CREATE INDEX "ActivityPartner_partnerId_idx" ON "ActivityPartner"("partnerId");

-- CreateIndex
CREATE INDEX "ProjectDocument_documentId_idx" ON "ProjectDocument"("documentId");

-- CreateIndex
CREATE INDEX "ActivityDocument_documentId_idx" ON "ActivityDocument"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "Publication_slug_key" ON "Publication"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Publication_coverMediaId_key" ON "Publication"("coverMediaId");

-- CreateIndex
CREATE INDEX "Publication_status_publishedAt_idx" ON "Publication"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Publication_type_status_idx" ON "Publication"("type", "status");

-- CreateIndex
CREATE INDEX "PublicationRevision_publicationId_createdAt_idx" ON "PublicationRevision"("publicationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PublicationRevision_publicationId_version_key" ON "PublicationRevision"("publicationId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_storageKey_key" ON "MediaAsset"("storageKey");

-- CreateIndex
CREATE INDEX "MediaAsset_status_publishedAt_idx" ON "MediaAsset"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "MediaAsset_projectId_activityId_idx" ON "MediaAsset"("projectId", "activityId");

-- CreateIndex
CREATE INDEX "PublicationMedia_mediaId_idx" ON "PublicationMedia"("mediaId");

-- CreateIndex
CREATE INDEX "PublicSubmission_type_status_createdAt_idx" ON "PublicSubmission"("type", "status", "createdAt");

-- CreateIndex
CREATE INDEX "PublicSubmission_assigneeId_status_idx" ON "PublicSubmission"("assigneeId", "status");

-- CreateIndex
CREATE INDEX "PublicSubmission_retentionUntil_idx" ON "PublicSubmission"("retentionUntil");

-- CreateIndex
CREATE INDEX "PublicSubmissionEvent_submissionId_createdAt_idx" ON "PublicSubmissionEvent"("submissionId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminTask_assigneeId_status_dueAt_idx" ON "AdminTask"("assigneeId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "AdminTask_createdById_createdAt_idx" ON "AdminTask"("createdById", "createdAt");

-- CreateIndex
CREATE INDEX "FinancialPeriod_status_startsAt_endsAt_idx" ON "FinancialPeriod"("status", "startsAt", "endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceBudget_reference_key" ON "FinanceBudget"("reference");

-- CreateIndex
CREATE INDEX "FinanceBudget_periodId_category_status_idx" ON "FinanceBudget"("periodId", "category", "status");

-- CreateIndex
CREATE INDEX "FinanceBudget_projectId_activityId_idx" ON "FinanceBudget"("projectId", "activityId");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceIncome_reference_key" ON "FinanceIncome"("reference");

-- CreateIndex
CREATE INDEX "FinanceIncome_periodId_status_date_idx" ON "FinanceIncome"("periodId", "status", "date");

-- CreateIndex
CREATE INDEX "FinanceIncome_category_source_idx" ON "FinanceIncome"("category", "source");

-- CreateIndex
CREATE INDEX "FinanceIncome_projectId_activityId_idx" ON "FinanceIncome"("projectId", "activityId");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceExpense_reference_key" ON "FinanceExpense"("reference");

-- CreateIndex
CREATE INDEX "FinanceExpense_periodId_status_requestedAt_idx" ON "FinanceExpense"("periodId", "status", "requestedAt");

-- CreateIndex
CREATE INDEX "FinanceExpense_projectId_activityId_idx" ON "FinanceExpense"("projectId", "activityId");

-- CreateIndex
CREATE INDEX "FinanceExpenseEvent_expenseId_createdAt_idx" ON "FinanceExpenseEvent"("expenseId", "createdAt");

-- CreateIndex
CREATE INDEX "FinancialPeriodEvent_periodId_createdAt_idx" ON "FinancialPeriodEvent"("periodId", "createdAt");

-- CreateIndex
CREATE INDEX "FinanceBudgetEvent_budgetId_createdAt_idx" ON "FinanceBudgetEvent"("budgetId", "createdAt");

-- CreateIndex
CREATE INDEX "FinanceIncomeEvent_incomeId_createdAt_idx" ON "FinanceIncomeEvent"("incomeId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CceFinding_reference_key" ON "CceFinding"("reference");

-- CreateIndex
CREATE INDEX "CceFinding_status_dueAt_idx" ON "CceFinding"("status", "dueAt");

-- CreateIndex
CREATE INDEX "CceFinding_createdById_createdAt_idx" ON "CceFinding"("createdById", "createdAt");

-- CreateIndex
CREATE INDEX "CceResponse_findingId_createdAt_idx" ON "CceResponse"("findingId", "createdAt");

-- CreateIndex
CREATE INDEX "CceFindingEvent_findingId_createdAt_idx" ON "CceFindingEvent"("findingId", "createdAt");

-- AddForeignKey
ALTER TABLE "PartnerDocument" ADD CONSTRAINT "PartnerDocument_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerDocument" ADD CONSTRAINT "PartnerDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "OfficialDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRevision" ADD CONSTRAINT "ProjectRevision_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRevision" ADD CONSTRAINT "ProjectRevision_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectStage" ADD CONSTRAINT "ProjectStage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectIndicator" ADD CONSTRAINT "ProjectIndicator_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTeamMember" ADD CONSTRAINT "ProjectTeamMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTeamMember" ADD CONSTRAINT "ProjectTeamMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPartner" ADD CONSTRAINT "ProjectPartner_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPartner" ADD CONSTRAINT "ProjectPartner_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityRevision" ADD CONSTRAINT "ActivityRevision_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityRevision" ADD CONSTRAINT "ActivityRevision_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityIndicator" ADD CONSTRAINT "ActivityIndicator_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityPartner" ADD CONSTRAINT "ActivityPartner_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityPartner" ADD CONSTRAINT "ActivityPartner_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "OfficialDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityDocument" ADD CONSTRAINT "ActivityDocument_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityDocument" ADD CONSTRAINT "ActivityDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "OfficialDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicationRevision" ADD CONSTRAINT "PublicationRevision_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicationMedia" ADD CONSTRAINT "PublicationMedia_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicationMedia" ADD CONSTRAINT "PublicationMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicSubmission" ADD CONSTRAINT "PublicSubmission_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicSubmissionEvent" ADD CONSTRAINT "PublicSubmissionEvent_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "PublicSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicSubmissionEvent" ADD CONSTRAINT "PublicSubmissionEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminTask" ADD CONSTRAINT "AdminTask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminTask" ADD CONSTRAINT "AdminTask_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialPeriod" ADD CONSTRAINT "FinancialPeriod_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialPeriod" ADD CONSTRAINT "FinancialPeriod_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceBudget" ADD CONSTRAINT "FinanceBudget_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "FinancialPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceBudget" ADD CONSTRAINT "FinanceBudget_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceBudget" ADD CONSTRAINT "FinanceBudget_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceBudget" ADD CONSTRAINT "FinanceBudget_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceBudget" ADD CONSTRAINT "FinanceBudget_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceIncome" ADD CONSTRAINT "FinanceIncome_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "FinancialPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceIncome" ADD CONSTRAINT "FinanceIncome_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceIncome" ADD CONSTRAINT "FinanceIncome_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceIncome" ADD CONSTRAINT "FinanceIncome_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceExpense" ADD CONSTRAINT "FinanceExpense_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "FinancialPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceExpense" ADD CONSTRAINT "FinanceExpense_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceExpense" ADD CONSTRAINT "FinanceExpense_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceExpense" ADD CONSTRAINT "FinanceExpense_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceExpense" ADD CONSTRAINT "FinanceExpense_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceExpense" ADD CONSTRAINT "FinanceExpense_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceExpense" ADD CONSTRAINT "FinanceExpense_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceExpenseEvent" ADD CONSTRAINT "FinanceExpenseEvent_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "FinanceExpense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceExpenseEvent" ADD CONSTRAINT "FinanceExpenseEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialPeriodEvent" ADD CONSTRAINT "FinancialPeriodEvent_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "FinancialPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialPeriodEvent" ADD CONSTRAINT "FinancialPeriodEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceBudgetEvent" ADD CONSTRAINT "FinanceBudgetEvent_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "FinanceBudget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceBudgetEvent" ADD CONSTRAINT "FinanceBudgetEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceIncomeEvent" ADD CONSTRAINT "FinanceIncomeEvent_incomeId_fkey" FOREIGN KEY ("incomeId") REFERENCES "FinanceIncome"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceIncomeEvent" ADD CONSTRAINT "FinanceIncomeEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CceFinding" ADD CONSTRAINT "CceFinding_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CceFinding" ADD CONSTRAINT "CceFinding_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CceResponse" ADD CONSTRAINT "CceResponse_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "CceFinding"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CceResponse" ADD CONSTRAINT "CceResponse_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CceFindingEvent" ADD CONSTRAINT "CceFindingEvent_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "CceFinding"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CceFindingEvent" ADD CONSTRAINT "CceFindingEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
