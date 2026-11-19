# Contributing

The site follows the rules of the app's repository: [CONTRIBUTING.md there](https://github.com/kuutti-ry/kumpa-app/blob/main/CONTRIBUTING.md) says how, and why every commit is signed off.

In short:

1. Every commit carries a sign-off (`git commit -s`): you certify the [Developer Certificate of Origin](https://developercertificate.org/). Enable the hook once per clone: `git config core.hooksPath .githooks`.
2. Changes reach `main` through a pull request whose body says `Refs kuutti-ry/kumpa-app#<n>`, never a closing keyword.
3. `pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm check:site` pass before you push.

See `CLAUDE.md` for the site’s content, privacy and licensing rules. Update both Finnish and English when changing a page. `docs/translation-review.md` explains how to review machine translations and identifies the authoritative legal texts.
