import type { Mark } from "./lib/marks.ts";

/**
 * What the site knows about the association and its channels. A value that is
 * not decided yet is null, and the page says that it is coming: nothing here
 * is a placeholder that looks like the real thing.
 */
export const SITE = {
  /**
   * The association's business ID (Y-tunnus), given by the Finnish Patent and
   * Registration Office when the notice of founding was filed on 01/10/2026.
   */
  businessId: "3659478-7",
  /** Where the app's source is published (AGPL-3.0). */
  appSource: "https://github.com/kuutti-ry/kumpa-app",
  /**
   * Where anybody proposes a feature: the app repository's Proposal form, open
   * to every GitHub account (the maintainer's word of 27/10/2026).
   */
  proposals: "https://github.com/kuutti-ry/kumpa-app/issues/new?template=proposal.yml",
  /** Where this site's source is published (AGPL-3.0). */
  siteSource: "https://github.com/kuutti-ry/kumpa-app-site" as string | null,
  /**
   * The address people write to, the association's only one on the site (the
   * team's own are on About Us, src/lib/team.ts): a user of the
   * association's Google Workspace since 30/10/2026, not an alias, because
   * Google for Nonprofits checks that every address on the site is a user
   * (docs/decisions.md, 19, 22 and 25).
   */
  contactEmail: "hello@kumpa.fi" as string | null,
  /** The association's channels, as full addresses; the footer links to each by its mark. */
  social: [
    { name: "LinkedIn", href: "https://www.linkedin.com/company/kumpa-fi/", mark: "linkedin" },
    { name: "GitHub", href: "https://github.com/kuutti-ry", mark: "github" },
    { name: "TikTok", href: "https://www.tiktok.com/@kumpa_fi", mark: "tiktok" },
    { name: "Instagram", href: "https://www.instagram.com/kumpa_fi/", mark: "instagram" },
  ] as { name: string; href: string; mark: Mark }[],
  /**
   * Code from Finland (Koodia Suomesta ry), whose community member Kuutti ry
   * is: the footer shows its badge and links here (docs/decisions.md, 24).
   */
  codeFromFinland: "https://koodiasuomesta.fi/en/",
  /**
   * The app's listings in the stores. Null until the app is published: a
   * store's badge is then dimmed, not a link (src/components/StoreBadges.astro),
   * and the home page shows no badge until there is a listing
   * (docs/decisions.md, 19).
   */
  stores: { apple: null as string | null, google: null as string | null },
} as const;
