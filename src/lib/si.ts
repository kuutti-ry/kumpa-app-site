/**
 * The whole site once more under /si/, in the look of Sini's webpage design
 * (docs/decisions.md, 41): the same pages, texts and scripts, drawn by
 * src/styles/si.css. It is a try for the team to look at, so no page of it is
 * indexed, the sitemap leaves it out, and nothing on the site links to it.
 */
export const SI = "/si";

/** Whether an address is of the /si/ copy. */
export const isSi = (pathname: string): boolean => pathname === SI || pathname.startsWith(`${SI}/`);

/**
 * A page's HTML with its links kept inside /si/: every link to a page of the
 * site leads to that page's /si/ twin. A page's address ends in a slash and a
 * file's does not, so files, anchors of the page itself and other sites stay
 * as they are.
 */
export function linksInSi(html: string): string {
  return html.replace(
    /(<a\b[^>]*?\shref=")(\/[^"]*)"/g,
    (whole, before: string, address: string) => {
      const [path = ""] = address.split(/[?#]/);
      if (isSi(path) || !path.endsWith("/")) return whole;
      return `${before}${SI}${address}"`;
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
