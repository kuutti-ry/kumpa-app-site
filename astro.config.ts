import { defineConfig } from "astro/config";
import { redirects } from "./src/lib/redirects.ts";

// The public API is read server-to-server. Amplify uses the same exact-path
// reverse proxy in production. The local server never forwards browser cookies.
const healthProxy = {
  "^/status/health\\.json$": {
    target: "https://api.kumpa.fi",
    changeOrigin: true,
    rewrite: () => "/health",
    headers: { cookie: "", authorization: "" },
    proxyTimeout: 5000,
  },
};

export default defineConfig({
  vite: { server: { proxy: healthProxy }, preview: { proxy: healthProxy } },
  site: "https://kumpa.fi",
  output: "static",
  trailingSlash: "always",
  build: { format: "directory", inlineStylesheets: "never" },
  redirects,
  devToolbar: { enabled: false },
});
