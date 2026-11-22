import { defineMiddleware } from "astro:middleware";
import { copyOf, linksInCopy } from "./lib/si.ts";

// Runs while the pages are built, never in a browser: a page of a copy links
// inside that copy, /si2/ (src/lib/si.ts), whoever wrote the link, a
// component or a text.
export const onRequest = defineMiddleware(async ({ url }, next) => {
  const response = await next();
  const copy = copyOf(url.pathname);
  if (!copy || !response.headers.get("content-type")?.includes("text/html")) {
    return response;
  }
  return new Response(linksInCopy(await response.text(), copy.prefix), response);
});
