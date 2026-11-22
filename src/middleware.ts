import { defineMiddleware } from "astro:middleware";
import { isSi, linksInSi } from "./lib/si.ts";

// Runs while the pages are built, never in a browser: a page of /si/ links to
// /si/ (src/lib/si.ts), whoever wrote the link, a component or a text.
export const onRequest = defineMiddleware(async ({ url }, next) => {
  const response = await next();
  if (!isSi(url.pathname) || !response.headers.get("content-type")?.includes("text/html")) {
    return response;
  }
  return new Response(linksInSi(await response.text()), response);
});
