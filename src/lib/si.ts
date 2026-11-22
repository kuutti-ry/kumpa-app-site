/**
 * The site wears the look of Sini's webpage design: src/styles/si.css under
 * `html.si`, over src/styles/global.css. It was a try under /si/
 * (docs/decisions.md, 41) and is the site's own look since 52; an address
 * under /si/ or /si2/, a second try in a softer yellow (49), leads to the
 * page itself (src/lib/redirects.ts).
 */
export const LOOK = "si";

/** The folder of the look's pictures. */
export const ART = "/si-art";

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
