/**
 * Keep inbound links to sections of the previous site useful. An address under
 * /si/ or /si2/, where the site's look was first tried (docs/decisions.md,
 * 52), leads to the page itself.
 */
export const redirects = {
  "/si/[...path]": "/[...path]",
  "/si2/[...path]": "/[...path]",
  "/contact/": "/about/contact/",
  "/work/": "/about/details/",
  "/support-us/": "/about/contact/",
  "/membership/": "/about/",
} as const;
