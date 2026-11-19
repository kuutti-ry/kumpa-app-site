import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

/** The hosting policy pins these exact scripts and the CSP test verifies their digests. */
export function scriptIntegrity(file: "language.js" | "status.js") {
  return `sha256-${createHash("sha256")
    .update(readFileSync(`public/${file}`))
    .digest("base64")}`;
}
export const languageIntegrity = scriptIntegrity("language.js");
export const statusIntegrity = scriptIntegrity("status.js");
