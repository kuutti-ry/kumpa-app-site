import { defineConfig } from "astro/config";
import { redirects } from "./src/lib/redirects.ts";

export default defineConfig({
  site: "https://kumpa.fi",
  output: "static",
  trailingSlash: "always",
  build: { format: "directory", inlineStylesheets: "never" },
  redirects,
  devToolbar: { enabled: false },
});
