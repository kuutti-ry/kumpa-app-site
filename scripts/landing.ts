/**
 * What in a style sheet keeps a link to an anchor from landing where it
 * points, as /about/#who-we-are and the app's links to a consent's version
 * did: they opened with their heading too far down the window, and further
 * on a phone.
 *
 * - Smooth scrolling. A page opened at an anchor glides from its top toward
 *   where the target stood before the fonts arrived, and stops short of it.
 * - A length measured on the font: ch, ex, cap or ic, or the root's (rch,
 *   rex, rcap, ric). It changes when Inter or Saiga swaps in, and a browser
 *   stops holding a link's target in place when a box around it changes.
 *   em and rem are the font's size, which a swap leaves alone.
 *
 * Run by scripts/check-site.ts over every style sheet of a build.
 */
export function landingProblems(css: string): string[] {
  // Comments, strings and addresses can hold any letters: what is left is rules.
  const rules = css.replace(
    /\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|url\([^)]*\)/gi,
    " ",
  );
  const problems: string[] = [];
  if (/scroll-behavior\s*:\s*smooth/i.test(rules)) {
    problems.push(
      "scroll-behavior: smooth; a link to an anchor lands at once, or it stops short of a target the fonts moved",
    );
  }
  for (const [length] of rules.matchAll(/(?<![\w.-])-?\d*\.?\d+r?(?:ch|ex|cap|ic)\b/gi)) {
    problems.push(
      `${length}, a length measured on the font, which moves a link's target when the font arrives; em and rem do not`,
    );
  }
  return problems;
}
