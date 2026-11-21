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
    "waitlist.title": "Liity odotuslistalle",
    "waitlist.purpose": "Saat meiltä yhden sähköpostin, kun Kumpa-sovellus julkaistaan.",
    "waitlist.email": "Sähköpostiosoite",
    "waitlist.emailMissing": "Kirjoita sähköpostiosoitteesi.",
    "waitlist.emailInvalid": "Tarkista osoite. Kirjoita se muodossa nimi@esimerkki.fi.",
    "waitlist.submit": "Ilmoita minulle",
    "waitlist.busy": "Liittymistä käsitellään…",
    "waitlist.error": "Liittyminen ei onnistunut. Yritä hetken kuluttua uudelleen.",
    "waitlist.contact": "Voit pyytää julkaisuilmoitusta sähköpostitse osoitteesta",
    "waitlist.leaveEmpty": "Jätä tämä kenttä tyhjäksi",
    "waitlist.privacy": "Miten käytämme tietojasi?",
    "waitlist.data":
      "Kuutti ry on odotuslistan rekisterinpitäjä. Kun liityt listalle, annat meille luvan lähettää yhden ilmoituksen julkaisusta. Tallennamme sähköpostiosoitteesi, valitsemasi kielen, liittymisajan ja suostumustekstin version.",
    "waitlist.storage":
      "Amazon Web Services (AWS) säilyttää listaa puolestamme Frankfurtissa. Vain listan ylläpitoon valtuutetut henkilöt pääsevät tietoihin.",
    "waitlist.retention":
      "Lopetamme tietojesi käytön, kun olemme lähettäneet ilmoituksen, peruutat suostumuksesi tai liittymisestäsi on kulunut vuosi. Poistaminen tallennusjärjestelmästä voi kestää muutaman päivän. Tiedot voivat säilyä varmuuskopioissa vielä seitsemän päivää poistamisen jälkeen.",
    "waitlist.rights":
      "Voit pyytää pääsyä omiin tietoihisi tai peruuttaa suostumuksesi milloin tahansa kirjoittamalla osoitteeseen",
    "waitlist.complaint": "Voit tehdä ilmoituksen tietosuojavaltuutetulle",
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
    "waitlist.title": "Join the waiting list",
    "waitlist.purpose": "We’ll send you one email when Kumpa launches.",
    "waitlist.email": "Email address",
    "waitlist.emailMissing": "Enter your email address.",
    "waitlist.emailInvalid": "Check the address. Use a format like name@example.com.",
    "waitlist.submit": "Notify me",
    "waitlist.busy": "Joining the list…",
    "waitlist.error": "We couldn’t complete your signup. Please try again in a moment.",
    "waitlist.contact": "To request a launch notification by email, write to",
    "waitlist.leaveEmpty": "Leave this field empty",
    "waitlist.privacy": "How we use your details",
    "waitlist.data":
      "Kuutti ry is the controller for the waiting list. When you join, you consent to one launch email. We record your email address, your chosen language, when you joined and the version of the consent wording.",
    "waitlist.storage":
      "Amazon Web Services (AWS) stores the list for us in Frankfurt. Only people authorised to manage the list can access it.",
    "waitlist.retention":
      "We stop using your details when we send the email, you withdraw consent or one year has passed since signup, whichever comes first. Deletion from storage can take a few days. Backups can retain a copy for up to seven more days after deletion.",
    "waitlist.rights": "To access your details or withdraw consent at any time, email",
    "waitlist.complaint": "You can lodge a complaint with Finland’s Data Protection Ombudsman",
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
