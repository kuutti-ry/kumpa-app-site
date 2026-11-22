/**
 * The whole site once more under /si/, in the look of Sini's webpage design
 * (docs/decisions.md, 41): the same pages, texts and scripts, drawn by
 * src/styles/si.css. It is a try for the team to look at, so no page of it is
 * indexed, the sitemap leaves it out, and nothing on the site links to it.
 * /si2/ is /si/ once more in a softer yellow, a try of the same kind
 * (docs/decisions.md, 49): its pages wear both classes, and
 * src/styles/si2.css changes only the yellow and the drawings that carry it.
 */
export const SI = "/si";

/** The copies: where each one's pages are, and the classes they wear. */
export const COPIES = [
  { prefix: SI, look: "si" },
  { prefix: "/si2", look: "si si2" },
] as const;

/** The copy an address is of, if it is of one. */
export const copyOf = (pathname: string): (typeof COPIES)[number] | undefined =>
  COPIES.find(({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`));

/** Whether an address is of a copy, and so in the look of Sini's design. */
export const isSi = (pathname: string): boolean => copyOf(pathname) !== undefined;

/**
 * A page's HTML with its links kept inside its copy, /si/ unless another is
 * named: every link to a page of the site leads to that page's twin there. A
 * page's address ends in a slash and a file's does not, so files, anchors of
 * the page itself and other sites stay as they are.
 */
export function linksInSi(html: string, prefix: string = SI): string {
  return html.replace(
    /(<a\b[^>]*?\shref=")(\/[^"]*)"/g,
    (whole, before: string, address: string) => {
      const [path = ""] = address.split(/[?#]/);
      if (isSi(path) || !path.endsWith("/")) return whole;
      return `${before}${prefix}${address}"`;
    },
  );
}

/**
 * "How Kumpa works" as the design draws it: each third-level heading with what
 * follows it is a step with a picture, side by side. A closing paragraph that
 * begins with a link (the line of links to help) stands after the steps.
 */
export function stepped(html: string): string {
  const first = html.search(/<h3[\s>]/);
  if (first === -1) return html;
  const steps = html.slice(first).split(/(?=<h3[\s>])/);
  const last = steps.at(-1) ?? "";
  const closing = last.lastIndexOf("<p>");
  let after = "";
  if (closing > 0 && last.startsWith("<p><a ", closing)) {
    steps[steps.length - 1] = last.slice(0, closing);
    after = last.slice(closing);
  }
  const drawn = steps.map((step) => `<div class="si-step">${step.trim()}</div>`).join("");
  return `${html.slice(0, first)}<div class="si-steps">${drawn}</div>${after}`;
}

/**
 * A text cut in two at a third-level heading, the first or the last one: what
 * stands before it and the rest. About Us in the design's calmer drawing sets
 * a section's opening on a card and the media's last part on a band
 * (docs/decisions.md, 43). A text without such a heading is all opening.
 */
export function cutAtHeading(html: string, which: "first" | "last"): [string, string] {
  const starts = [...html.matchAll(/<h3[\s>]/g)].map((found) => found.index);
  const at = which === "first" ? starts.at(0) : starts.at(-1);
  return at === undefined ? [html, ""] : [html.slice(0, at), html.slice(at)];
}
