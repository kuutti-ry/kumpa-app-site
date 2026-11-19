import type { Locale, TextLanguage } from "./locales.ts";

export const UI = {
  fi: {
    "site.name": "Kumpa",
    skip: "Siirry sisältöön",
    "nav.label": "Päävalikko",
    "nav.menu": "Valikko",
    "nav.home": "Etusivu",
    "nav.about": "Meistä",
    "nav.app": "Sovellus",
    "nav.breadcrumbs": "Murupolku",
    "home.action": "Tutustu sovellukseen",
    "legal.title": "Oikeudelliset tiedot",
    "legal.description": "Kumpa-sovelluksen käyttöehdot, tietosuoja ja yhdistyksen säännöt.",
    "legal.intro": "Käyttöehdot, tietosuoja ja yhdistyksen säännöt.",
    "legal.draft": "Luonnos",
    "legal.filed": "Ilmoitettu rekisteröitäväksi",
    "legal.inForce": "Voimassa",
    "notice.draft.title": "Luonnos",
    "notice.draft.body": "Teksti voi vielä muuttua.",
    "notice.filed.title": "Hyväksytty, rekisteröinti kesken",
    "notice.filed.body": "Rekisteriviranomainen voi vielä pyytää muutoksia.",
    "notice.machine.title": "Konekäännös",
    "consents.title": "Erilliset suostumukset",
    "consents.intro": "Sovelluksessa erikseen annettavat suostumukset.",
    "consents.wording": "Sanamuoto {language}",
    "consents.counts": "Sanamuoto {language} (ensisijainen)",
    "doc.dated": "Teksti päivätty {date}",
    "doc.version": "Versio {version}",
    "doc.draftVersion": "Luonnos {version}",
    "doc.registered": "Rekisteröity {date}",
    "earlier.title": "Aiemmat versiot",
    "earlier.description": "Aiemmat käyttöehdot, tietosuojaselosteet ja suostumustekstit.",
    "earlier.current": "{title} (voimassa)",
    "doc.businessId": "Y-tunnus {businessId}",
    "team.label": "Tiimi",
    "team.linkedin": "{name} LinkedInissä",
    "team.github": "{name} GitHubissa",
    "team.mail": "Lähetä sähköpostia ({name})",
    "notFound.title": "Sivua ei löytynyt",
    "notFound.body": "Osoite on saattanut muuttua.",
    "notFound.home": "Palaa etusivulle",
  },
  en: {
    "site.name": "Kumpa",
    skip: "Skip to content",
    "nav.label": "Main navigation",
    "nav.menu": "Menu",
    "nav.home": "Home",
    "nav.about": "About us",
    "nav.app": "App",
    "nav.breadcrumbs": "Breadcrumbs",
    "home.action": "Explore the app",
    "legal.title": "Legal and privacy",
    "legal.description": "Kumpa’s terms of use, privacy policy and association bylaws.",
    "legal.intro": "Terms of use, privacy and association bylaws.",
    "legal.draft": "Draft",
    "legal.filed": "Filed for registration",
    "legal.inForce": "In force",
    "notice.draft.title": "Draft",
    "notice.draft.body": "This text may still change.",
    "notice.filed.title": "Adopted, awaiting registration",
    "notice.filed.body": "The register may still ask for changes.",
    "notice.machine.title": "Machine translation",
    "consents.title": "Separate consents",
    "consents.intro": "Consents given separately in the app.",
    "consents.wording": "Wording {language}",
    "consents.counts": "Wording {language} (binding)",
    "doc.dated": "Wording of {date}",
    "doc.version": "Version {version}",
    "doc.draftVersion": "Draft version {version}",
    "doc.registered": "Registered {date}",
    "earlier.title": "Earlier versions",
    "earlier.description": "Previous terms of use, privacy policies and consent texts.",
    "earlier.current": "{title} (current version)",
    "doc.businessId": "Business ID {businessId}",
    "team.label": "The team",
    "team.linkedin": "{name} on LinkedIn",
    "team.github": "{name} on GitHub",
    "team.mail": "E-mail {name}",
    "notFound.title": "Page not found",
    "notFound.body": "The address may have changed.",
    "notFound.home": "Back to home",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type UiKey = keyof typeof UI.en;
export const STATUS_KEY = {
  draft: "legal.draft",
  filed: "legal.filed",
  in_force: "legal.inForce",
} as const satisfies Record<string, UiKey>;

export function t(locale: Locale, key: UiKey, values: Record<string, string> = {}): string {
  return UI[locale][key].replace(/\{(\w+)\}/g, (whole, name: string) => values[name] ?? whole);
}

export const LANGUAGE_IN: Record<Locale, Record<TextLanguage, string>> = {
  fi: { fi: "suomeksi", sv: "ruotsiksi", en: "englanniksi" },
  en: { fi: "in Finnish", sv: "in Swedish", en: "in English" },
};

export const LANGUAGE_NAME: Record<TextLanguage, string> = {
  fi: "Suomi",
  sv: "Svenska",
  en: "English",
};

export const formatDate = (locale: Locale, date: Date): string =>
  new Intl.DateTimeFormat(locale === "fi" ? "fi-FI" : "en-FI", {
    dateStyle: "long",
    timeZone: "Europe/Helsinki",
  }).format(date);
