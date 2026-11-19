import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

/** Amplify permits only this exact file. The CSP test checks its pinned digest. */
export const languageIntegrity = `sha256-${createHash("sha256")
  .update(readFileSync("public/language.js"))
  .digest("base64")}`;
