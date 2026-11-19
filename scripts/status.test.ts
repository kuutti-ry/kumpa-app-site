import assert from "node:assert/strict";
import { test } from "node:test";
import { interpretHealth } from "../public/status.js";

test("only a complete healthy reply is green", () => {
  const healthy = { status: "ok", db: "ok", migrations: "current" };
  assert.equal(interpretHealth(200, healthy).summary, "ok");
  for (const body of [undefined, null, {}, { status: "ok" }, { ...healthy, db: "unreachable" }])
    assert.equal(interpretHealth(200, body).summary, "unknown");
  assert.equal(interpretHealth(503, healthy).summary, "unknown");
});

test("reports API degradation and distinguishes a failed check from a service failure", () => {
  for (const status of [200, 503]) {
    const degraded = { status: "degraded", db: "ok", migrations: "pending" };
    assert.deepEqual(interpretHealth(status, degraded), {
      summary: "degraded",
      db: "ok",
      migrations: "pending",
    });
    assert.deepEqual(interpretHealth(status, { ...degraded, db: "unreachable" }), {
      summary: "degraded",
      db: "unreachable",
      migrations: "unknown",
    });
  }
  for (const status of [0, 404, 502, 503])
    assert.deepEqual(interpretHealth(status, undefined), {
      summary: "unknown",
      db: "unknown",
      migrations: "unknown",
    });
});
