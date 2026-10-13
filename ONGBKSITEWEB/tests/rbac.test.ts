import assert from "node:assert/strict";
import test from "node:test";
import {
  permissionsForRole,
  roleHasPermission,
  roleLabels,
  selfServiceAssignableRoles,
} from "../lib/rbac";

test("all institutional roles have explicit, non-empty permission grants", () => {
  for (const role of Object.keys(roleLabels) as (keyof typeof roleLabels)[]) {
    assert.ok(permissionsForRole(role).length > 0, `${role} has explicit grants`);
    assert.equal(
      new Set(permissionsForRole(role)).size,
      permissionsForRole(role).length,
      `${role} has no duplicate grants`,
    );
  }
});

test("technical administrators do not receive institutional approval or business-data access", () => {
  for (const permission of [
    "CONTENT_APPROVE",
    "RECORDS_APPROVE",
    "FINANCE_APPROVE",
    "REPORTS_APPROVE",
    "USERS_ASSIGN_ROLE",
    "CONTENT_READ",
    "RECORDS_READ",
    "FINANCE_READ",
  ] as const) {
    assert.equal(roleHasPermission("TECHNICAL_ADMIN", permission), false);
  }
});

test("institutional role assignment is not granted by default", () => {
  for (const role of Object.keys(roleLabels) as (keyof typeof roleLabels)[]) {
    assert.equal(
      roleHasPermission(role, "USERS_ASSIGN_ROLE"),
      role === "SYSTEM_ADMIN",
      `${role} receives only its explicitly delegated role-assignment grant`,
    );
  }
});

test("the principal administrator self-service UI cannot assign an institutional or financial office", () => {
  assert.deepEqual(selfServiceAssignableRoles, [
    "TECHNICAL_ADMIN",
    "CONTENT_EDITOR",
    "ONG_MEMBER",
  ]);
  for (const role of selfServiceAssignableRoles) {
    assert.ok(role in roleLabels);
  }
});

test("CCE can inspect records and report findings without changing controlled data", () => {
  for (const role of ["CCE_PRESIDENT", "CCE_MEMBER"] as const) {
    assert.equal(roleHasPermission(role, "RECORDS_READ"), true);
    assert.equal(roleHasPermission(role, "FINANCE_READ"), true);
    assert.equal(roleHasPermission(role, "REPORTS_CREATE"), true);
    assert.equal(roleHasPermission(role, "REPORTS_UPDATE"), false);
    for (const permission of [
      "RECORDS_CREATE",
      "RECORDS_UPDATE",
      "RECORDS_APPROVE",
      "RECORDS_ARCHIVE",
      "RECORDS_DELETE",
      "FINANCE_CREATE",
      "FINANCE_UPDATE",
      "FINANCE_APPROVE",
      "FINANCE_ARCHIVE",
      "FINANCE_DELETE",
    ] as const) {
      assert.equal(roleHasPermission(role, permission), false, `${role} cannot ${permission}`);
    }
  }
});

test("content editors can prepare but cannot approve or delete publications", () => {
  assert.equal(roleHasPermission("CONTENT_EDITOR", "CONTENT_CREATE"), true);
  assert.equal(roleHasPermission("CONTENT_EDITOR", "CONTENT_UPDATE"), true);
  assert.equal(roleHasPermission("CONTENT_EDITOR", "CONTENT_APPROVE"), false);
  assert.equal(roleHasPermission("CONTENT_EDITOR", "CONTENT_DELETE"), false);
});

test("CCE meetings and documents stay separated from BE administration", () => {
  for (const role of ["CCE_PRESIDENT", "CCE_MEMBER"] as const) {
    assert.equal(roleHasPermission(role, "CCE_MEETINGS_READ"), true);
    assert.equal(roleHasPermission(role, "CCE_MEETINGS_CREATE"), true);
    assert.equal(roleHasPermission(role, "BE_MEETINGS_READ"), false);
    assert.equal(roleHasPermission(role, "DOCUMENTS_READ"), true);
    assert.equal(roleHasPermission(role, "DOCUMENTS_APPROVE"), false);
    assert.equal(roleHasPermission(role, "DOCUMENTS_ARCHIVE"), false);
    assert.equal(roleHasPermission(role, "MEMBERSHIP_REQUESTS_DECIDE"), false);
  }
  assert.equal(roleHasPermission("BE_PRESIDENT", "BE_MEETINGS_CREATE"), true);
  assert.equal(roleHasPermission("BE_PRESIDENT", "CCE_MEETINGS_READ"), false);
  assert.equal(roleHasPermission("TECHNICAL_ADMIN", "IDENTITY_APPROVE"), false);
  assert.equal(roleHasPermission("TECHNICAL_ADMIN", "BE_GOVERNANCE_CREATE"), false);
});

test("CCE findings are immutable to the BE while response and review duties remain separate", () => {
  for (const role of ["CCE_PRESIDENT", "CCE_MEMBER"] as const) {
    assert.equal(roleHasPermission(role, "CCE_FINDINGS_READ"), true);
    assert.equal(roleHasPermission(role, "CCE_FINDINGS_CREATE"), true);
    assert.equal(roleHasPermission(role, "CCE_FINDINGS_UPDATE"), true);
    assert.equal(roleHasPermission(role, "CCE_RESPONSES_CREATE"), false);
  }
  for (const role of [
    "BE_PRESIDENT",
    "BE_VICE_PRESIDENT",
    "SECRETARY_GENERAL",
    "DEPUTY_SECRETARY_GENERAL",
    "TREASURER_GENERAL",
    "DEPUTY_TREASURER_GENERAL",
    "ORGANISATION_COMMUNICATION_SECRETARY",
  ] as const) {
    assert.equal(roleHasPermission(role, "CCE_FINDINGS_READ"), true);
    assert.equal(roleHasPermission(role, "CCE_RESPONSES_CREATE"), true);
    assert.equal(roleHasPermission(role, "CCE_FINDINGS_UPDATE"), false);
    assert.equal(roleHasPermission(role, "FINANCE_APPROVE"), role === "BE_PRESIDENT");
  }
});

test("BE and CCE governance permissions are independent", () => {
  assert.equal(roleHasPermission("BE_PRESIDENT", "BE_GOVERNANCE_APPROVE"), true);
  assert.equal(roleHasPermission("BE_PRESIDENT", "CCE_GOVERNANCE_APPROVE"), false);
  assert.equal(roleHasPermission("SECRETARY_GENERAL", "BE_GOVERNANCE_CREATE"), true);
  assert.equal(roleHasPermission("SECRETARY_GENERAL", "BE_GOVERNANCE_APPROVE"), false);
  for (const role of [
    "TECHNICAL_ADMIN",
    "BE_VICE_PRESIDENT",
    "SECRETARY_GENERAL",
    "CCE_PRESIDENT",
    "CCE_MEMBER",
  ] as const) {
    assert.equal(roleHasPermission(role, "BE_GOVERNANCE_APPROVE"), false);
    assert.equal(roleHasPermission(role, "CCE_GOVERNANCE_CREATE"), false);
  }
});
