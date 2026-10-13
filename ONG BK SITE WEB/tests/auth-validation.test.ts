import assert from "node:assert/strict";
import test from "node:test";
import {
  initialAdminSchema,
  loginSchema,
  passwordResetSchema,
  systemSettingsSchema,
} from "../lib/auth-validation";

test("initial administrator setup requires strong matching credentials and a setup secret", () => {
  const valid = {
    setupSecret: "s".repeat(43),
    email: "  ADMIN@ONG-BK.ORG ",
    firstName: "Amina",
    lastName: "Kouila",
    password: "long-secure-password",
    confirmPassword: "long-secure-password",
  };
  assert.deepEqual(initialAdminSchema.parse(valid), {
    ...valid,
    email: "admin@ong-bk.org",
  });
  assert.equal(
    initialAdminSchema.safeParse({ ...valid, setupSecret: "short" }).success,
    false,
  );
  assert.equal(
    initialAdminSchema.safeParse({ ...valid, confirmPassword: "different-password" }).success,
    false,
  );
  assert.equal(
    initialAdminSchema.safeParse({ ...valid, password: "short", confirmPassword: "short" }).success,
    false,
  );
});

test("login input normalizes email and rejects extra fields", () => {
  assert.deepEqual(
    loginSchema.parse({ email: "  ADMIN@ONG-BK.ORG ", password: "existing-password" }),
    { email: "admin@ong-bk.org", password: "existing-password" },
  );
  assert.equal(
    loginSchema.safeParse({
      email: "admin@ong-bk.org",
      password: "password",
      isAdmin: true,
    }).success,
    false,
  );
});

test("password reset requires a strong matching password", () => {
  assert.equal(
    passwordResetSchema.safeParse({
      token: "a".repeat(32),
      password: "long-secure-password",
      confirmPassword: "long-secure-password",
    }).success,
    true,
  );
  assert.equal(
    passwordResetSchema.safeParse({
      token: "short",
      password: "short",
      confirmPassword: "different",
    }).success,
    false,
  );
});

test("system settings validate time zones and reject unknown keys", () => {
  const valid = {
    siteName: "ONG-BK",
    contactEmail: "",
    defaultLocale: "fr",
    timeZone: "Africa/Brazzaville",
  };
  assert.equal(systemSettingsSchema.safeParse(valid).success, true);
  assert.equal(
    systemSettingsSchema.safeParse({ ...valid, timeZone: "Mars/Olympus" }).success,
    false,
  );
  assert.equal(
    systemSettingsSchema.safeParse({ ...valid, isAdmin: true }).success,
    false,
  );
});
