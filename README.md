# kumpa-app-site

The Finnish-first website for Kumpa, a free dating app for adults in Finland. Its home is [kumpa.fi](https://kumpa.fi). The same site is served at kuutti.app. The app itself is at [kuutti-ry/kumpa-app](https://github.com/kuutti-ry/kumpa-app).

Astro builds static pages containing Finnish and English at the same URL. A local script remembers the chosen language in the current tab. The site uses only its own assets and sets no cookies. Body text uses Inter under the SIL Open Font License 1.1 (`public/fonts/LICENSE-Inter.txt`). Headings and navigation use Teo Tuominen’s Saiga when the licensed files are available during the build. Amplify fetches them privately. Local builds fall back to Inter.

## Run it

Node 22.23.4 or newer (Astro asks for it); pnpm comes from Corepack at the version `package.json` pins (`corepack enable` once).

```bash
pnpm install --frozen-lockfile
pnpm dev          # http://127.0.0.1:4321
```

| command | what it does |
|---|---|
| `pnpm dev` | the site with live reload |
| `pnpm build` | the site into `dist/` |
| `pnpm preview` | serves `dist/` as it will be served |
| `pnpm typecheck` | `astro check`, TypeScript strict |
| `pnpm lint` | Biome, then what the content must hold (`scripts/check-content.ts`) |
| `pnpm test` | the tests of the site's own code |
| `pnpm check:site` | checks static output, language markup, local assets, links, version anchors and sitemap |
| `pnpm check:app-versions` | the app's consent versions on `main`, read from GitHub, against the site's (`scripts/check-app-versions.ts`; `-- --app <file>` reads a local one) |
| `pnpm check:pinned -- --base origin/main` | every row of the base's `src/consent-versions.ts` is still there, unchanged, in its place (`scripts/check-pinned.ts`) |
| `pnpm format` | Biome writes |

## Where things are

```
src/content/pages/<language>/<slug>.md    page copy, including nested About pages
src/content/legal/<language>/<slug>.md    current legal documents and their translations
src/content/consents/<language>/<kind>.md the app's sensitive-answers consent, read on the privacy page
src/consent-versions.ts                   every version of each text a person agrees to, with its fingerprint
src/i18n/                                 the languages, and the site's own words (navigation, notices)
src/site.ts                               contact details, channels and store links
src/pages/[...path].astro                 the template the site's pages are made from
src/lib/                                  which pages there are, how a text is listed, Saiga's files and their sums
src/styles/global.css                     the look, on the app's design tokens
public/                                   the logo, icons, Inter and the language and status scripts
public/fonts/saiga/                       Saiga, put there by the build or by hand; git ignores it
scripts/                                  the checks, the tests, and the fetch of Saiga
docs/                                     decisions, open questions, what waits for a native reader
```

Each ordinary page has a Markdown file under both `src/content/pages/fi/` and `src/content/pages/en/`, at matching paths. `home.md` supplies the opening paragraph at `/`. The top-level navigation leads to Home, App and About. On desktop, About displays People, Contact, Technical details and For the media as sections of one page. The mobile menu links to their individual pages under `/about/`. App support remains available at `/help/`, `/delete-account/` and `/child-safety/`.

## Languages and legal versions

- Finnish is the default. The language control switches the page in place. `public/language.js` keeps the choice in session storage, updates the page language, title and description, and reveals deep links to the wording they identify.
- Finnish page copy written by a machine carries `machine: true`. A native speaker may replace it with `reviewedBy` after reviewing the page. See `docs/translation-review.md`.
- Current legal documents show the machine-translation notice and link to the controlling original above each translation. The registered Finnish bylaws take precedence. English takes precedence for the terms, privacy policy, DPIA summary and current sensitive-answers consent.
- Keep the binding wording, its version anchors and archived texts intact. The build checks the current wording against `src/consent-versions.ts`, publishes app links in `/legal/versions.json` and serves earlier versions at `/legal/earlier/`. Editing a translation does not create a new consent version.

## Hosting

Amplify Hosting builds from `main` using `amplify.yml`. The content security policy in `customHttp.yml` pins the SHA-256 digests of the language and service-status scripts. Update the appropriate digest after editing either file.

The status panel reads `/status/health.json` on the website origin. Before releasing it, add this exact **200 rewrite** in the Amplify app’s existing redirects and rewrites, ahead of fallback rules. Keep the other domain rules in place.

```json
{ "source": "/status/health.json", "target": "https://api.kumpa.fi/health", "status": "200" }
```

Use a rewrite so the browser receives the API JSON at the website URL, which identifies both healthy and degraded service. Confirm the content type and body on both website domains after rollout. Local dev and preview apply the same mapping in `astro.config.ts`. The panel checks while visible and offers a manual refresh. A failed check displays an unknown state with a direct link to the API.

The pre-redesign site is tagged `website-before-finnish-first-2026-11-20`. To inspect or rebuild it separately, use `git worktree add --detach ../kumpa-site-before-finnish-first website-before-finnish-first-2026-11-20` and run the normal build commands there.

## Rules

The rules of the app's repository hold here: `main` only through a pull request, squash merge, every commit signed off (`git commit -s`; enable the hook once with `git config core.hooksPath .githooks`), `Refs` and never a closing keyword. `CLAUDE.md` has them, with what is this site's own.

## Licence

The code is under the GNU Affero General Public License, version 3 (`LICENSE`), like the app. The name Kuutti and the logo are the association's and are not licensed with the code. The App Store and Google Play badges in `public/badges/` are Apple's and Google's, as they publish them for marketing, and the Code from Finland badges beside them, in English and in Finnish, are Koodia Suomesta ry's, as it gives them to its members; none is licensed with the code either.
