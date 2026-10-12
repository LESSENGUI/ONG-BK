import assert from "node:assert/strict";
import test from "node:test";
import {
  documentMetadataSchema,
  mandateSchema,
  meetingAttendanceSchema,
  meetingSchema,
} from "../lib/institution-validation";

test("a governance mandate cannot assign a CCE post to the BE", () => {
  const result = mandateSchema.safeParse({
    bodyCode: "EXECUTIVE_BOARD",
    positionCode: "CCE_PRESIDENT",
    memberId: "member-1",
    status: "PLANNED",
  });
  assert.equal(result.success, false);
});

test("mandate dates cannot reverse the term and photo paths cannot escape public assets", () => {
  const base = {
    bodyCode: "EXECUTIVE_BOARD",
    positionCode: "BE_PRESIDENT",
    memberId: "member-1",
    status: "PLANNED",
  };
  assert.equal(mandateSchema.safeParse({ ...base, startDate: "2027-02-01", endDate: "2027-01-01" }).success, false);
  assert.equal(mandateSchema.safeParse({ ...base, photoPath: "/images/../private.jpg" }).success, false);
  assert.equal(mandateSchema.safeParse({ ...base, photoPath: "https://example.org/photo.jpg" }).success, false);
});

test("meeting participants are deduplicated and meeting bodies remain explicit", () => {
  assert.equal(meetingAttendanceSchema.safeParse({ memberIds: ["one", "one"] }).success, false);
  assert.equal(
    meetingSchema.safeParse({
      bodyCode: "CONTROL_COMMISSION",
      title: "Réunion de contrôle",
      participantMemberIds: ["one", "one"],
    }).success,
    false,
  );
});

test("document metadata accepts only defined publication statuses", () => {
  const result = documentMetadataSchema.safeParse({
    title: "Document",
    category: "STATUTES",
    confidentiality: "PUBLIC",
    status: "PUBLISHED",
  });
  assert.equal(result.success, true);
  assert.equal(documentMetadataSchema.safeParse({
    title: "Document",
    category: "STATUTES",
    confidentiality: "PUBLIC",
    status: "PUBLISHED_NOW",
  }).success, false);
});
