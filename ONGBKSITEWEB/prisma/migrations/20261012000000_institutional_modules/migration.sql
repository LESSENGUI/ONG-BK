ALTER TYPE "PermissionCode" ADD VALUE 'IDENTITY_READ';
ALTER TYPE "PermissionCode" ADD VALUE 'IDENTITY_CREATE';
ALTER TYPE "PermissionCode" ADD VALUE 'IDENTITY_UPDATE';
ALTER TYPE "PermissionCode" ADD VALUE 'IDENTITY_APPROVE';
ALTER TYPE "PermissionCode" ADD VALUE 'GOVERNANCE_READ';
ALTER TYPE "PermissionCode" ADD VALUE 'BE_GOVERNANCE_CREATE';
ALTER TYPE "PermissionCode" ADD VALUE 'BE_GOVERNANCE_UPDATE';
ALTER TYPE "PermissionCode" ADD VALUE 'BE_GOVERNANCE_APPROVE';
ALTER TYPE "PermissionCode" ADD VALUE 'BE_GOVERNANCE_ARCHIVE';
ALTER TYPE "PermissionCode" ADD VALUE 'BE_GOVERNANCE_EXPORT';
ALTER TYPE "PermissionCode" ADD VALUE 'CCE_GOVERNANCE_CREATE';
ALTER TYPE "PermissionCode" ADD VALUE 'CCE_GOVERNANCE_UPDATE';
ALTER TYPE "PermissionCode" ADD VALUE 'CCE_GOVERNANCE_APPROVE';
ALTER TYPE "PermissionCode" ADD VALUE 'CCE_GOVERNANCE_ARCHIVE';
ALTER TYPE "PermissionCode" ADD VALUE 'CCE_GOVERNANCE_EXPORT';
ALTER TYPE "PermissionCode" ADD VALUE 'GOVERNANCE_EXPORT';
ALTER TYPE "PermissionCode" ADD VALUE 'MEMBERS_READ';
ALTER TYPE "PermissionCode" ADD VALUE 'MEMBERS_CREATE';
ALTER TYPE "PermissionCode" ADD VALUE 'MEMBERS_UPDATE';
ALTER TYPE "PermissionCode" ADD VALUE 'MEMBERS_ARCHIVE';
ALTER TYPE "PermissionCode" ADD VALUE 'MEMBERS_EXPORT';
ALTER TYPE "PermissionCode" ADD VALUE 'MEMBERSHIP_REQUESTS_CREATE';
ALTER TYPE "PermissionCode" ADD VALUE 'MEMBERSHIP_REQUESTS_READ';
ALTER TYPE "PermissionCode" ADD VALUE 'MEMBERSHIP_REQUESTS_DECIDE';
ALTER TYPE "PermissionCode" ADD VALUE 'DOCUMENTS_READ';
ALTER TYPE "PermissionCode" ADD VALUE 'DOCUMENTS_CREATE';
ALTER TYPE "PermissionCode" ADD VALUE 'DOCUMENTS_UPDATE';
ALTER TYPE "PermissionCode" ADD VALUE 'DOCUMENTS_APPROVE';
ALTER TYPE "PermissionCode" ADD VALUE 'DOCUMENTS_ARCHIVE';
ALTER TYPE "PermissionCode" ADD VALUE 'DOCUMENTS_EXPORT';
ALTER TYPE "PermissionCode" ADD VALUE 'BE_MEETINGS_READ';
ALTER TYPE "PermissionCode" ADD VALUE 'BE_MEETINGS_CREATE';
ALTER TYPE "PermissionCode" ADD VALUE 'BE_MEETINGS_UPDATE';
ALTER TYPE "PermissionCode" ADD VALUE 'CCE_MEETINGS_READ';
ALTER TYPE "PermissionCode" ADD VALUE 'CCE_MEETINGS_CREATE';
ALTER TYPE "PermissionCode" ADD VALUE 'CCE_MEETINGS_UPDATE';

CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "MembershipCategory" AS ENUM ('FOUNDING', 'ACTIVE', 'HONORARY', 'SUPPORTER');
CREATE TYPE "MembershipStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'ARCHIVED', 'REJECTED');
CREATE TYPE "MembershipRequestStatus" AS ENUM ('RECEIVED', 'UNDER_REVIEW', 'NEEDS_INFORMATION', 'ACCEPTED', 'REJECTED', 'ARCHIVED');
CREATE TYPE "GoverningBodyCode" AS ENUM ('EXECUTIVE_BOARD', 'CONTROL_COMMISSION');
CREATE TYPE "GoverningPositionCode" AS ENUM ('BE_PRESIDENT', 'BE_VICE_PRESIDENT', 'BE_SECRETARY_GENERAL', 'BE_DEPUTY_SECRETARY_GENERAL', 'BE_TREASURER_GENERAL', 'BE_DEPUTY_TREASURER_GENERAL', 'BE_ORGANISATION_COMMUNICATION_SECRETARY', 'CCE_PRESIDENT', 'CCE_VICE_PRESIDENT', 'CCE_RAPPORTEUR');
CREATE TYPE "MandateStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'REVOKED');
CREATE TYPE "DocumentCategory" AS ENUM ('STATUTES', 'INTERNAL_REGULATION', 'MINUTES', 'DECISION', 'APPOINTMENT', 'ANNUAL_REPORT', 'ACTIVITY_REPORT', 'FINANCIAL_REPORT', 'AGREEMENT', 'OTHER');
CREATE TYPE "DocumentConfidentiality" AS ENUM ('PUBLIC', 'INTERNAL', 'EXECUTIVE_BOARD', 'CONTROL_COMMISSION', 'STRICTLY_CONFIDENTIAL');
CREATE TYPE "MeetingStatus" AS ENUM ('PLANNED', 'HELD', 'CANCELLED');
CREATE TYPE "MeetingDecisionStatus" AS ENUM ('PROPOSED', 'APPROVED', 'REJECTED', 'DEFERRED');

CREATE TABLE "ContentPage" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(80) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "imagePath" VARCHAR(500),
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "authorId" TEXT NOT NULL,
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ContentPage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContentRevision" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "imagePath" VARCHAR(500),
    "editorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContentRevision_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(254),
    "phone" VARCHAR(40),
    "locality" VARCHAR(160),
    "category" "MembershipCategory" NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MembershipRequest" (
    "id" TEXT NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "phone" VARCHAR(40),
    "locality" VARCHAR(160),
    "motivation" VARCHAR(5000) NOT NULL,
    "requestedCategory" "MembershipCategory",
    "status" "MembershipRequestStatus" NOT NULL DEFAULT 'RECEIVED',
    "internalNotes" TEXT,
    "memberId" TEXT,
    "decisionAt" TIMESTAMP(3),
    "decisionById" TEXT,
    "retentionUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MembershipRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MembershipRequestDocument" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    CONSTRAINT "MembershipRequestDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MembershipRequestEvent" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "actorId" TEXT,
    "fromStatus" "MembershipRequestStatus",
    "toStatus" "MembershipRequestStatus" NOT NULL,
    "note" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MembershipRequestEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GoverningPosition" (
    "code" "GoverningPositionCode" NOT NULL,
    "bodyCode" "GoverningBodyCode" NOT NULL,
    "title" VARCHAR(220) NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "GoverningPosition_pkey" PRIMARY KEY ("code")
);

CREATE TABLE "GoverningMandate" (
    "id" TEXT NOT NULL,
    "bodyCode" "GoverningBodyCode" NOT NULL,
    "positionCode" "GoverningPositionCode" NOT NULL,
    "memberId" TEXT NOT NULL,
    "activeSlot" VARCHAR(80),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "MandateStatus" NOT NULL DEFAULT 'PLANNED',
    "biography" VARCHAR(4000),
    "photoPath" VARCHAR(500),
    "appointmentDocumentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GoverningMandate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OfficialDocument" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "documentDate" TIMESTAMP(3),
    "version" VARCHAR(40) NOT NULL DEFAULT '1',
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "confidentiality" "DocumentConfidentiality" NOT NULL DEFAULT 'INTERNAL',
    "storageKey" VARCHAR(500) NOT NULL,
    "mediaType" VARCHAR(100) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OfficialDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "bodyCode" "GoverningBodyCode" NOT NULL,
    "title" VARCHAR(220) NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "location" VARCHAR(240),
    "agenda" TEXT NOT NULL DEFAULT '',
    "status" "MeetingStatus" NOT NULL DEFAULT 'PLANNED',
    "organizerId" TEXT NOT NULL,
    "minutesDocumentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MeetingAttendance" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "memberId" TEXT,
    "userId" TEXT,
    "attended" BOOLEAN,
    CONSTRAINT "MeetingAttendance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MeetingDecision" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "title" VARCHAR(220) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "MeetingDecisionStatus" NOT NULL DEFAULT 'PROPOSED',
    "actionOwner" VARCHAR(180),
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MeetingDecision_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContentPage_key_key" ON "ContentPage"("key");
CREATE INDEX "ContentPage_status_updatedAt_idx" ON "ContentPage"("status", "updatedAt");
CREATE INDEX "ContentRevision_pageId_createdAt_idx" ON "ContentRevision"("pageId", "createdAt");
CREATE UNIQUE INDEX "ContentRevision_pageId_version_key" ON "ContentRevision"("pageId", "version");
CREATE UNIQUE INDEX "Member_userId_key" ON "Member"("userId");
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");
CREATE INDEX "Member_category_status_idx" ON "Member"("category", "status");
CREATE INDEX "Member_lastName_firstName_idx" ON "Member"("lastName", "firstName");
CREATE INDEX "Member_archivedAt_idx" ON "Member"("archivedAt");
CREATE INDEX "MembershipRequest_status_createdAt_idx" ON "MembershipRequest"("status", "createdAt");
CREATE INDEX "MembershipRequest_email_createdAt_idx" ON "MembershipRequest"("email", "createdAt");
CREATE INDEX "MembershipRequest_retentionUntil_idx" ON "MembershipRequest"("retentionUntil");
CREATE UNIQUE INDEX "MembershipRequestDocument_documentId_key" ON "MembershipRequestDocument"("documentId");
CREATE INDEX "MembershipRequestDocument_requestId_idx" ON "MembershipRequestDocument"("requestId");
CREATE INDEX "MembershipRequestEvent_requestId_createdAt_idx" ON "MembershipRequestEvent"("requestId", "createdAt");
CREATE INDEX "GoverningPosition_bodyCode_enabled_idx" ON "GoverningPosition"("bodyCode", "enabled");
CREATE UNIQUE INDEX "GoverningPosition_bodyCode_ordinal_key" ON "GoverningPosition"("bodyCode", "ordinal");
CREATE INDEX "GoverningMandate_bodyCode_status_positionCode_idx" ON "GoverningMandate"("bodyCode", "status", "positionCode");
CREATE INDEX "GoverningMandate_memberId_startDate_idx" ON "GoverningMandate"("memberId", "startDate");
CREATE UNIQUE INDEX "GoverningMandate_activeSlot_key" ON "GoverningMandate"("activeSlot");
CREATE UNIQUE INDEX "OfficialDocument_storageKey_key" ON "OfficialDocument"("storageKey");
CREATE INDEX "OfficialDocument_category_status_confidentiality_idx" ON "OfficialDocument"("category", "status", "confidentiality");
CREATE INDEX "OfficialDocument_documentDate_idx" ON "OfficialDocument"("documentDate");
CREATE INDEX "OfficialDocument_archivedAt_idx" ON "OfficialDocument"("archivedAt");
CREATE INDEX "Meeting_bodyCode_scheduledAt_status_idx" ON "Meeting"("bodyCode", "scheduledAt", "status");
CREATE INDEX "MeetingAttendance_meetingId_idx" ON "MeetingAttendance"("meetingId");
CREATE UNIQUE INDEX "MeetingAttendance_meetingId_memberId_key" ON "MeetingAttendance"("meetingId", "memberId");
CREATE UNIQUE INDEX "MeetingAttendance_meetingId_userId_key" ON "MeetingAttendance"("meetingId", "userId");
CREATE INDEX "MeetingDecision_meetingId_status_idx" ON "MeetingDecision"("meetingId", "status");
CREATE INDEX "MeetingDecision_dueAt_completedAt_idx" ON "MeetingDecision"("dueAt", "completedAt");

ALTER TABLE "ContentPage" ADD CONSTRAINT "ContentPage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContentPage" ADD CONSTRAINT "ContentPage_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContentRevision" ADD CONSTRAINT "ContentRevision_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "ContentPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MembershipRequest" ADD CONSTRAINT "MembershipRequest_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MembershipRequest" ADD CONSTRAINT "MembershipRequest_decisionById_fkey" FOREIGN KEY ("decisionById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MembershipRequestDocument" ADD CONSTRAINT "MembershipRequestDocument_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "MembershipRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MembershipRequestDocument" ADD CONSTRAINT "MembershipRequestDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "OfficialDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MembershipRequestEvent" ADD CONSTRAINT "MembershipRequestEvent_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "MembershipRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MembershipRequestEvent" ADD CONSTRAINT "MembershipRequestEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GoverningMandate" ADD CONSTRAINT "GoverningMandate_positionCode_fkey" FOREIGN KEY ("positionCode") REFERENCES "GoverningPosition"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GoverningMandate" ADD CONSTRAINT "GoverningMandate_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GoverningMandate" ADD CONSTRAINT "GoverningMandate_appointmentDocumentId_fkey" FOREIGN KEY ("appointmentDocumentId") REFERENCES "OfficialDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OfficialDocument" ADD CONSTRAINT "OfficialDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_minutesDocumentId_fkey" FOREIGN KEY ("minutesDocumentId") REFERENCES "OfficialDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MeetingAttendance" ADD CONSTRAINT "MeetingAttendance_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MeetingAttendance" ADD CONSTRAINT "MeetingAttendance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MeetingAttendance" ADD CONSTRAINT "MeetingAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MeetingDecision" ADD CONSTRAINT "MeetingDecision_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MeetingDecision" ADD CONSTRAINT "MeetingDecision_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
