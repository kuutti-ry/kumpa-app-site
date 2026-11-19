# Translation review

The site opens in Finnish. Each ordinary page has matching files under `src/content/pages/fi/` and `src/content/pages/en/`. The FI/EN switch works at the same URL.

## Finnish copy awaiting review

Finnish page files with `machine: true` still need a native reader. This includes Home, App, the About pages, help, child safety and account deletion. Review the Finnish navigation, footer, notices and metadata alongside the pages. For the current list of flagged files, run the following command.

```bash
rg -l '^machine: true$' src/content/pages/fi
```

After checking a page against the English copy and the app’s terminology, replace its `machine: true` with `reviewedBy` naming the reader. The field records an actual review.

## Legal texts

The Finnish versions of the terms, privacy policy and DPIA summary are machine translations of the English originals. The English bylaws are a machine translation of the registered Finnish original. Each translation opens with its status and a link to the version that takes precedence. The sensitive-answers consent uses the app’s wording, with English controlling the current version.

Correct a translation in its own file. Keep binding wording, consent fingerprints and previously published versions intact when reviewing translations.
