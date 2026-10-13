import assert from "node:assert/strict";
import test from "node:test";
import { readJsonBody } from "../lib/request-body";

test("bounded JSON reader parses a valid request body", async () => {
  const request = new Request("http://localhost/api", {
    method: "POST",
    body: JSON.stringify({ email: "user@example.org" }),
  });
  assert.deepEqual(await readJsonBody(request), {
    ok: true,
    value: { email: "user@example.org" },
  });
});

test("bounded JSON reader rejects invalid JSON and oversized bodies", async () => {
  const malformed = new Request("http://localhost/api", {
    method: "POST",
    body: "{",
  });
  assert.deepEqual(await readJsonBody(malformed), { ok: false, status: 400 });

  const oversized = new Request("http://localhost/api", {
    method: "POST",
    body: "x".repeat(65),
  });
  assert.deepEqual(await readJsonBody(oversized, 64), { ok: false, status: 413 });
});
