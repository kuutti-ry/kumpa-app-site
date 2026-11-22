import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Saiga, Kuutti's typeface, by Spoke Type, licensed to Kuutti ry by e-mail on
 * 20-21/10/2026 for Kuutti's own media, the website among them
 * (docs/decisions.md, 18). Its files are never in this repository, which is
 * public, nor in any of its builds on GitHub: the maintainer promised Spoke
 * to keep them out. Amplify's build fetches them from the association's
 * private repository (scripts/fetch-saiga.ts), a laptop copies them in by
 * hand, and git ignores where they land. Without them, the pages are in Inter.
 */

/** Where the build and a laptop put the files, under the site's root. */
export const SAIGA_DIR = "public/fonts/saiga";

/** Where the files come from: the association's private repository, at a commit. */
export const SAIGA_SOURCE = {
  repository: "kuutti-ry/kumpa-app-fonts",
  commit: "8d672e73e430a182fa19bbdbabe26eb93c8638db",
  folder: "Saiga/WOFF2",
} as const;

/**
 * The faces the site's pages may ask for, each with the SHA-256 of the file
 * Spoke delivered (Saiga 1.002). The headings and the header are drawn in
 * two of them today (docs/decisions.md, 28): Regular for the navigation, and
 * Bold for the headings, since Saiga has no 600 and their 650 is drawn in Bold.
 * The /si/ copy (src/lib/si.ts) reads in Regular and draws its headlines in
 * Black Italic and its wordmark in Black, as Sini's design does.
 */
export const SAIGA_FILES = [
  {
    file: "Saiga-Regular.woff2",
    weight: 400,
    style: "normal",
    sha256: "9714e36dbf9c5f4475d07d1756750b19fb79e286d1b6667a06ae9a084a5aa803",
  },
  {
    file: "Saiga-Italic.woff2",
    weight: 400,
    style: "italic",
    sha256: "e11f4e5425fb2f78ef64f6e55a36c1a5703d51c62b717da51890a4031dae1571",
  },
  {
    file: "Saiga-Medium.woff2",
    weight: 500,
    style: "normal",
    sha256: "88c51c465b236eaf9102fda8753196181392297abe67342c134c538b3ede719b",
  },
  {
    file: "Saiga-Bold.woff2",
    weight: 700,
    style: "normal",
    sha256: "c072666c13379a24c24b1350d921626f92334d6d04c2e572a125e8f908ea4951",
  },
  {
    file: "Saiga-Black.woff2",
    weight: 900,
    style: "normal",
    sha256: "77aebf6edf809ecbc6eaf64168f689b400096dc4d0342ea63fb7336d69e2bf12",
  },
  {
    file: "Saiga-BlackItalic.woff2",
    weight: 900,
    style: "italic",
    sha256: "64b752d4da05964f62b7a2894ff29c6c11f29fd72cc37bf2dff8f6f5cc80f294",
  },
] as const;

/**
 * Whether a build has Saiga: every file, where a page would ask for it. With
 * one missing the pages stay in Inter, never half in each. The layout links
 * Saiga's style sheet by this, and `pnpm check:site` holds the built pages to
 * the same (docs/decisions.md, 28).
 */
export const hasSaiga = (root: string = process.cwd()): boolean =>
  SAIGA_FILES.every(({ file }) => existsSync(join(root, SAIGA_DIR, file)));

/** Inter, the site's own text face: a file of this repository (src/styles/global.css). */
const INTER = "/fonts/inter-latin-wght-normal.woff2";

type SaigaFile = (typeof SAIGA_FILES)[number]["file"];

/**
 * The faces of Saiga every page of a look draws on its first screen, as
 * measured on 22/11/2026 on thirteen pages at 1440 and 390 px: the site's own
 * look has its header in Regular and its headings in Bold; the /si/ copy
 * reads in Regular, has its header in Bold, its wordmark in Black and its
 * headlines in Black Italic.
 */
const FIRST_FACES: Record<"site" | "si", readonly SaigaFile[]> = {
  site: ["Saiga-Regular.woff2", "Saiga-Bold.woff2"],
  si: ["Saiga-Regular.woff2", "Saiga-Bold.woff2", "Saiga-Black.woff2", "Saiga-BlackItalic.woff2"],
};

/**
 * The font files a page asks for in its head, together with its style sheets
 * and not after them. A page that learns of its fonts from a style sheet
 * asks one round to the server later, paints once in the system's font, and
 * moves a frame later when they arrive: at every change of page, since the
 * browser asks again each time (docs/decisions.md, 44). Only what a first
 * screen draws is named, since a file asked for and not drawn is fetched for
 * nothing. The /si/ copy draws nothing in Inter where the build has Saiga.
 */
export function fontsAskedFirst(si: boolean, saiga: boolean = hasSaiga()): string[] {
  if (!saiga) return [INTER];
  const faces = FIRST_FACES[si ? "si" : "site"].map(
    (file) => `/${SAIGA_DIR.slice("public/".length)}/${file}`,
  );
  return si ? faces : [INTER, ...faces];
}
