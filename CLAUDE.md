# Kumpa website

Kumpa’s Finnish-first dating-app website at kumpa.fi, also served at kuutti.app. Astro builds every language into each static page: Finnish, Swedish and English (`docs/decisions.md`, 45). The app is another repository, `kuutti-ry/kumpa-app`, and its `CLAUDE.md` carries the project's standing rules; what is here is what this site needs of them, and what is the site's own. Where the two disagree about the project, the app's repository wins.

The site's issues live in the app's repository (`kuutti-ry/kumpa-app#53` is the site).

## Commands

`package.json` is the source of truth; keep this list in sync with it.

- `pnpm install --frozen-lockfile`. Node 22.23.4+ and pnpm come from `package.json`; `corepack enable` once.
- `pnpm dev` serves the site at http://127.0.0.1:4321. `pnpm build` writes `dist/`; `pnpm preview` serves it.
- `pnpm typecheck` (`astro check`), `pnpm lint` (Biome, then `scripts/check-content.ts`, then `scripts/check-fonts.ts`: no font file in git but Inter's), `pnpm test` (node's test runner), `pnpm format`.
- `node scripts/fetch-saiga.ts` puts Saiga's files into `public/fonts/saiga/` (git ignores it) from the association's private repository, with a read-only token in `FONTS_TOKEN`; Amplify's build runs it, and a build without the files is in Inter throughout (`docs/decisions.md`, 18 and 28). On a laptop, `FONTS_TOKEN="$(gh auth token)" node scripts/fetch-saiga.ts` does the same with your own login.
- `pnpm check:site` reads `dist/` after a build. It checks local assets, scripts, links, language markup, the sitemap, Saiga fallback, and the app’s legal version anchors and archive.

- `pnpm check:app-versions` reads the app's generated `CONSENT_VERSIONS` on `main` from GitHub and holds it to `src/consent-versions.ts` (`-- --app <file>` reads a local one instead); CI runs it in the `site` job.
- `pnpm check:pinned -- --base origin/main` holds every row of the base's `src/consent-versions.ts` unchanged and in its place; CI runs it in the `lint` job.

Before pushing: typecheck, lint, test, build and check:site pass locally. Do not push red.

## Non-negotiable rules

1. **Serve all assets locally.** The CSP pins the three first-party scripts by digest. `/language.js` manages the language selection and deep links. `/status.js` reads the same-origin health proxy while a health panel is visible. `/waitlist.js` runs on `/` and `/app/` for the bilingual launch waiting list, the site's only form. It solves the signed challenge from `https://waitlist.kumpa.fi/challenge` in the browser and submits the form by POST to `https://waitlist.kumpa.fi/join`. Keep both CSP permissions restricted to those paths and update the matching digest when a script changes. Keep the site free of analytics, cookies and third-party embeds.
2. **No product surface** (the app's rule 8). No profile pages, no share links, no sign-in, no browser client of the app. The site says what Kumpa is; it is not Kumpa.
3. **Preserve binding legal wording.** Provide Finnish and English for the current texts. Mark each machine translation and link to the controlling original at the top. Finnish governs the bylaws. English governs the current terms, privacy policy, DPIA summary and sensitive-answers consent. Read earlier versions in their archived wording. Drafts are identified on the page and excluded from indexing.
4. **Identify machine-written Finnish and Swedish.** Finnish and Swedish page copy written or edited by an agent carries `machine: true`. Set `reviewedBy` only when a native speaker has reviewed the text.
5. **Nobody is named who has not asked to be.** No team member, donor, partner or researcher appears on the site without their word, and no name is taken from a planning document.
6. **Nothing is claimed that is not so.** No partner that has not agreed, no date that is not decided, no address that does not answer. Keep unavailable store URLs as `null` in `src/site.ts`. Show download buttons only once both store listings exist.
7. **No asking for money before the association may.** A donate button counts as a collection of money under Finnish law; there is none until the association is registered and has made its notification or has its permit.
8. `.env` files are never read, written or committed. The site needs none.
9. **Saiga's files are never in this repository.** Kuutti's typeface is Spoke Type's, licensed to Kuutti ry for Kuutti's own media, and the maintainer promised Spoke to keep the files out of the public repository: not in a commit, a branch, a pull request, a GitHub workflow's cache, artifact or log. The build fetches them (`scripts/fetch-saiga.ts`); git ignores `public/fonts/saiga/`, and `scripts/check-fonts.ts` refuses any font file but Inter's in `pnpm lint` and before every commit. An agent never opens a font file: it would send it elsewhere (`docs/decisions.md`, 18).

## Git

As in the app's repository:

- `main` only, and only through a pull request: squash merge, the checks green, one approving review.
- Every commit is signed off (`git commit -s`). Enable the hooks once per clone: `git config core.hooksPath .githooks` (the sign-off, and no font file but Inter's).
- Linear history: no merge commits, no force-push, never touch the ruleset or the repository's settings.
- Subject line imperative and under 72 characters; the body says what and why.
- Every pull request body carries `Refs kuutti-ry/kumpa-app#n`. Never a closing keyword: an issue closes when the maintainer has looked at the result.
- Commit only what was asked. No `dist/`, no `.astro/`, no unrelated lockfile churn.

## Code and content

- TypeScript strict. Biome is the formatter and the linter.
- Write ordinary pages in Markdown under `src/content/pages/{fi,sv,en}/`, using matching paths for every language. The site supplies its images and components. The header links to Home, App and About. Use `home.md` for the homepage introduction and `about/` for people, contact, details and media. Keep app support links at their published URLs.
- Lead with Kumpa on public-facing pages. Keep association background on About and keep its legal identity in the original documents. Contact is at `/about/contact/`. Show only the team’s approved names and contact details on the people page. The footer links to contact, social channels and legal documents and displays Code from Finland's Finnish badge on Finnish pages and its English one elsewhere. Keep the street address out of the footer and ordinary copy.
- The headings and the header are in Saiga where a build has its files, and what is read is in Inter (`docs/decisions.md`, 28). `--display` in `src/styles/global.css` is the one place that says what is drawn in Saiga. CI's builds have no file of it (rule 9), so a change to how it looks is looked at in a build that has them.
- `/si/` is the whole site once more in the look of Sini's webpage design, a try for the team: the same pages through `src/pages/si/[...path].astro`, drawn by `src/styles/si.css` under `html.si`, never indexed and linked from nowhere (`docs/decisions.md`, 41). A change to a page's content or markup shows there too, so look at both; a change to the normal look stays out of `si.css`.
- `/sitemap.xml` names the pages that may be indexed; `src/lib/sitemap.ts` makes it from the content, and it is never written by hand (`docs/decisions.md` 11).
- Provide shell labels, navigation, notices and page titles in every language of the site. Shared translations live in `src/i18n/ui.ts`. A language in `HIDDEN_LOCALES` (`src/i18n/locales.ts`) is built and offered to nobody: it shows only through a link ending in its code. None is there now; Swedish was until its native reading (`docs/decisions.md`, 40 and 45).
- Use Kumpa for the app and Kuutti ry for the association. Keep Kumpa uninflected in Finnish, for example `Kumpa-sovelluksessa`.
- A legal text a person agrees to in the app carries `consent_version` (quoted), the app's version of it. The build refuses a heading or a body of the wording that counts (the one that says `binding: true`; the Finnish where none does), or a status or binding, that changed without a new version and its row at the end of `src/consent-versions.ts`; a row is never changed or removed, and its version keeps its anchor, the earlier text copied whole to `src/content/earlier/<language>/<kind>/<version>.md` and shown on `/legal/earlier/`: a new version asks everybody again, so it is the maintainer's bump, never an agent's own. The site's version lands first, the app's follows (`docs/decisions.md`, 14, 29 and 32).
- Use the same root-relative path in every language, including the trailing slash, for example `/legal/privacy/`. Keep published legal version fragments intact.
- Dates and numbers are written as Finland writes them, in every language.
- Do not add a framework, a component library or a build step for something a style sheet can do.

## Accessibility

- Meaning never by colour alone: where you are in the navigation is a line and a weight.
- WCAG AA contrast in the light theme, the only one, and in its high-contrast pair, which answers the system's setting.
- Every target is at least 44 px high. The page holds at 200 % text size and on a 320 px wide screen, without scrolling sideways.
- One visible `h1` per language, ordered headings, a skip link and the selected language on `html`.

## Decisions

`docs/decisions.md` has what was decided for the site and why. `docs/open-questions.md` has what is the maintainer's to decide and what the site says meanwhile.
