# Kuutti: the website

The website of Kuutti ry (kuutti.app): what Kumpa is, who is behind it, and the legal texts. A static site made with Astro. The app is another repository, `kuutti-ry/kuutti-app`, and its `CLAUDE.md` carries the project's standing rules; what is here is what this site needs of them, and what is the site's own. Where the two disagree about the project, the app's repository wins.

The site's issues live in the app's repository (`kuutti-ry/kuutti-app#53` is the site).

## Commands

`package.json` is the source of truth; keep this list in sync with it.

- `pnpm install --frozen-lockfile`. Node 22.23.4+ and pnpm come from `package.json`; `corepack enable` once.
- `pnpm dev` serves the site at http://127.0.0.1:4321. `pnpm build` writes `dist/`; `pnpm preview` serves it.
- `pnpm typecheck` (`astro check`), `pnpm lint` (Biome, then `scripts/check-content.ts`, then `scripts/check-fonts.ts`: no font file in git but Inter's), `pnpm test` (node's test runner), `pnpm format`.
- `node scripts/fetch-saiga.ts` puts Saiga's files into `public/fonts/saiga/` (git ignores it) from the association's private repository, with a read-only token in `FONTS_TOKEN`; Amplify's build runs it, and a build without the files is in Inter throughout (`docs/decisions.md`, 18 and 28). On a laptop, `FONTS_TOKEN="$(gh auth token)" node scripts/fetch-saiga.ts` does the same with your own login.
- `pnpm check:site` reads `dist/` after a build: no script, nothing loaded from elsewhere, no dead link, a language and one `h1` on every page, a sitemap of exactly the pages that may be indexed, a `/legal/versions.json` whose every address leads to its version's anchor, a consent on the privacy page that marks the wording that counts and says so where the app does not ask for it, an anchor for every version of `src/consent-versions.ts`, and Saiga's style sheet linked on every page of a build that has Saiga's files and on no page of one that has not.
- `pnpm check:app-versions` reads the app's generated `CONSENT_VERSIONS` on `main` from GitHub and holds it to `src/consent-versions.ts` (`-- --app <file>` reads a local one instead); CI runs it in the `site` job.
- `pnpm check:pinned -- --base origin/main` holds every row of the base's `src/consent-versions.ts` unchanged and in its place; CI runs it in the `lint` job.

Before pushing: typecheck, lint, test, build and check:site pass locally. Do not push red.

## Non-negotiable rules

1. **The site runs nothing and loads nothing from anybody else.** No script, no analytics, no cookie, no font or image from another host (Inter is the site's own file under `public/fonts/`), no embedded frame, no form. `scripts/check-site.ts` and the content security policy in `customHttp.yml` both hold this; a change that needs an exception is wrong. The one there was, the pond demo, went with Gaiane's structure on 16/11/2026 (`docs/decisions.md`, 27).
2. **No product surface** (the app's rule 8). No profile pages, no share links, no sign-in, no browser client of the app. The site says what Kumpa is; it is not Kumpa.
3. **A legal text is never translated by a machine into a language it did not exist in.** The bylaws exist in Finnish, and their Finnish binds, as registered. The terms of use, the privacy policy and the consents are a model's texts, read by no lawyer, and their English binds: the maintainer's word of 08/11/2026 and 16/11/2026 (`docs/decisions.md`, 29). They name the association Kuutti ry and the app Kumpa, and hold only what the law asks of them. A text is read in the language it was written in, whether or not the site speaks it (`TEXT_LANGUAGES` in `src/i18n/locales.ts`). A draft says that it is a draft, on the page, and search engines are told to leave it alone.
4. **Finnish and Swedish written by a machine say so.** Text an agent writes or edits in Finnish or Swedish carries `machine: true`. `reviewedBy` is written only for a native reader who has read the page, never by an agent on its own.
5. **Nobody is named who has not asked to be.** No team member, donor, partner or researcher appears on the site without their word, and no name is taken from a planning document.
6. **Nothing is claimed that is not so.** No partner that has not agreed, no date that is not decided, no address that does not answer. What is not decided is `null` in `src/site.ts`, and the page says that it is coming.
7. **No asking for money before the association may.** A donate button counts as a collection of money under Finnish law; there is none until the association is registered and has made its notification or has its permit.
8. `.env` files are never read, written or committed. The site needs none.
9. **Saiga's files are never in this repository.** Kuutti's typeface is Spoke Type's, licensed to Kuutti ry for Kuutti's own media, and the maintainer promised Spoke to keep the files out of the public repository: not in a commit, a branch, a pull request, a GitHub workflow's cache, artifact or log. The build fetches them (`scripts/fetch-saiga.ts`); git ignores `public/fonts/saiga/`, and `scripts/check-fonts.ts` refuses any font file but Inter's in `pnpm lint` and before every commit. An agent never opens a font file: it would send it elsewhere (`docs/decisions.md`, 18).

## Git

As in the app's repository:

- `main` only, and only through a pull request: squash merge, the checks green, one approving review.
- Every commit is signed off (`git commit -s`). Enable the hooks once per clone: `git config core.hooksPath .githooks` (the sign-off, and no font file but Inter's).
- Linear history: no merge commits, no force-push, never touch the ruleset or the repository's settings.
- Subject line imperative and under 72 characters; the body says what and why.
- Every pull request body carries `Refs kuutti-ry/kuutti-app#n`. Never a closing keyword: an issue closes when the maintainer has looked at the result.
- Commit only what was asked. No `dist/`, no `.astro/`, no unrelated lockfile churn.

## Code and content

- TypeScript strict. Biome is the formatter and the linter.
- A page is Markdown in `src/content/pages/<language>/`, in every language of the site under one name (`src/i18n/locales.ts`: English only for now, `docs/decisions.md` 8). Markdown only: no HTML and no images in a text.
- The navigation leads to real pages, and the site links to them (`/contact/`). The home page opens with the association's mission (what "About Us" says before its first heading), then says what every other page that carries `nav` is, by what that page says before its first heading, and leads to it (`docs/decisions.md`, 23). So every page of the navigation opens with text, and the build refuses one that does not.
- The site names the association's address, `hello@kuutti.app`, and on "About Us" the team's own (`src/lib/team.ts`, `docs/decisions.md` 25); each a user and not an alias, on the maintainer's word: Google for Nonprofits checks that every address on the site is a user.
- The headings and the header are in Saiga where a build has its files, and what is read is in Inter (`docs/decisions.md`, 28). `--display` in `src/styles/global.css` is the one place that says what is drawn in Saiga. CI's builds have no file of it (rule 9), so a change to how it looks is looked at in a build that has them.
- `/sitemap.xml` names the pages that may be indexed; `src/lib/sitemap.ts` makes it from the content, and it is never written by hand (`docs/decisions.md` 11).
- The site's own words (navigation, notices, the footer) are in `src/i18n/ui.ts`, in every language of the site, and a test holds that none is missing.
- The app is Kumpa and the association Kuutti ry, never Kuutti alone, in everything a visitor reads: the pages, the site's own words and the legal texts. The name beside the logo and after a page's title is the association's. The docs and the code keep Kuutti, the project's name, as the repositories and the address do (the maintainer's word of 16/11/2026, `docs/decisions.md` 30).
- A legal text a person agrees to in the app carries `consent_version` (quoted), the app's version of it. The build refuses a heading or a body of the wording that counts (the one that says `binding: true`; the Finnish where none does), or a status or binding, that changed without a new version and its row at the end of `src/consent-versions.ts`; a row is never changed or removed, and its version keeps its anchor on the page, the earlier text copied whole to `src/content/earlier/<language>/<kind>/<version>.md`: a new version asks everybody again, so it is the maintainer's bump, never an agent's own. The site's version lands first, the app's follows (`docs/decisions.md`, 14 and 29).
- Links inside the site are written in full, with the language's prefix where it has one and a trailing slash (`/legal/privacy/`); the build checks that each leads somewhere.
- Dates and numbers are written as Finland writes them, in every language.
- Do not add a framework, a component library or a build step for something a style sheet can do.

## Accessibility

- Meaning never by colour alone: where you are in the navigation is a line and a weight.
- WCAG AA contrast in the light theme, the only one, and in its high-contrast pair, which answers the system's setting.
- Every target is at least 44 px high. The page holds at 200 % text size and on a 320 px wide screen, without scrolling sideways.
- One `h1` per page, headings in order, a skip link, the language on `html`.

## Decisions

`docs/decisions.md` has what was decided for the site and why. `docs/open-questions.md` has what is the maintainer's to decide and what the site says meanwhile.
