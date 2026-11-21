import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { solveChallenge } from "../public/waitlist.js";

const salt = "0123456789abcdef0123456789abcdef";
const signature = "A".repeat(43);
const signal = new AbortController().signal;

function challengeFor(number: number) {
  return {
    algorithm: "SHA-256",
    challenge: createHash("sha256")
      .update(salt + number)
      .digest("hex"),
    maxnumber: 128,
    salt,
    signature,
  };
}

test("a native signup carries the signed ALTCHA fields and matching decimal number", async () => {
  for (const number of [0, 64, 128]) {
    const { maxnumber: _, ...signed } = challengeFor(number);
    const proof = await solveChallenge(challengeFor(number), signal);
    assert.deepEqual(JSON.parse(atob(proof)), { ...signed, number });
  }
});

test("signup refuses malformed and excessive work and stops an interrupted request", async () => {
  const valid = challengeFor(33);
  for (const change of [
    { maxnumber: -1 },
    { maxnumber: 50_001 },
    { maxnumber: 1.5 },
    { algorithm: "unsupported" },
    { challenge: "bad" },
    { salt: "" },
    { signature: "" },
  ]) {
    await assert.rejects(solveChallenge({ ...valid, ...change }, signal), /Invalid signup/);
  }
  await assert.rejects(solveChallenge({ ...valid, maxnumber: 32 }, signal), /no solution/);
  await assert.rejects(solveChallenge(valid, AbortSignal.abort()), { name: "AbortError" });
});
