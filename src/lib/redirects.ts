/**
 * Keep inbound links to sections of the previous site useful. An address under
 * /si/, where the site's look was first tried (docs/decisions.md, 52), leads
 * to the page itself.
 */
export const redirects = {
  "/si/[...path]": "/[...path]",
  "/contact/": "/about/contact/",
  "/work/": "/about/details/",
  "/support-us/": "/about/contact/",
  "/membership/": "/about/",
} as const;
