import type { Locale } from "../i18n/locales.ts";
import { t } from "../i18n/ui.ts";
import { MARKS } from "./marks.ts";

/** A person of the team as About Us shows them: a face, a name, a role, and where to find them. */
export interface Person {
  name: string;
  /** The role, a line each: a board member's place on the board under it. */
  roles: readonly string[];
  /** The face under public/, cut square around it; null draws the initials instead. */
  photo: string | null;
  linkedin?: string;
  github?: string;
  /** At kumpa.fi: an alias of the person's user at the association's Google Workspace (decision 39). */
  email?: string;
}

/**
 * Who we are, on the maintainer's word of 15/11/2026, who gathered their
 * photos and links (rule 5; docs/decisions.md, 25): first names, he first,
 * Olli second, and the rest by name.
 */
export const TEAM: readonly Person[] = [
  {
    name: "Nikolai",
    roles: ["Lead", "Chair of the Board"],
    photo: "/team/nikolai.jpg",
    linkedin: "https://www.linkedin.com/in/nikolaidenissov/",
    github: "https://github.com/superseacat",
    email: "nikolai@kumpa.fi",
  },
  {
    name: "Olli",
    roles: ["Lead", "Member of the Board"],
    photo: "/team/olli.jpg",
    linkedin: "https://www.linkedin.com/in/olli-kiljunen/",
    github: "https://github.com/OlliKiljunen",
    email: "olli@kumpa.fi",
  },
  {
    name: "Denis",
    roles: ["Developer"],
    photo: "/team/denis.jpg",
    linkedin: "https://www.linkedin.com/in/dereden/",
    github: "https://github.com/Dereden399",
  },
  {
    name: "Egor",
    roles: ["Developer"],
    photo: "/team/egor.jpg",
    linkedin: "https://www.linkedin.com/in/egor-kovalenko-046b36262/",
    github: "https://github.com/Egor1o",
  },
  {
    name: "Gaiane",
    roles: ["Design"],
    photo: "/team/gaiane.jpg",
    linkedin: "https://www.linkedin.com/in/gaiane-pogosova/",
    github: "https://github.com/gaianep",
    email: "gaiane@kumpa.fi",
  },
  {
    name: "Hilal",
    roles: ["Operations & Partnerships"],
    photo: "/team/hilal.jpg",
    linkedin: "https://www.linkedin.com/in/hilalnurgercek/",
    github: "https://github.com/hilalnurgercek",
    email: "hilal@kumpa.fi",
  },
  {
    name: "Hilma",
    roles: ["Advisor"],
    photo: null,
    linkedin: "https://www.linkedin.com/in/hilma-kokkoniemi/",
    github: "https://github.com/himpu-k",
  },
  {
    name: "Ilya",
    roles: ["Tech Advisor"],
    photo: "/team/ilya.jpg",
    linkedin: "https://www.linkedin.com/in/ilya-nekrasov/",
    github: "https://github.com/ilya-wd",
    email: "ilya@kumpa.fi",
  },
  {
    name: "Jaakko",
    roles: ["Volunteer"],
    photo: "/team/jaakko.jpg",
    linkedin: "https://www.linkedin.com/in/jaakkonakaza/",
    github: "https://github.com/jaakkonakaza",
  },
  {
    name: "Nanna",
    roles: ["Volunteer"],
    photo: "/team/nanna.jpg",
    linkedin: "https://www.linkedin.com/in/nanna-ruotsalainen-095306294/",
    github: "https://github.com/nannaruotsalainen",
    email: "nanna@kumpa.fi",
  },
  {
    name: "Sini",
    roles: ["CX Lead"],
    photo: "/team/sini.jpg",
    linkedin: "https://www.linkedin.com/in/sini-parkkinen-100/",
    email: "sini@kumpa.fi",
  },
];

/** What an author writes, as a paragraph of its own, where the team goes. */
const MARKER = "<p>@team</p>";

/**
 * An envelope, drawn for the team's addresses beside the channels' marks
 * (src/lib/marks.ts): a 24 x 24 box, filled, its flap cut out.
 */
const ENVELOPE =
  "M3 4h18a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM4 7.3V18h16V7.3l-8 5.4zM5.6 6h12.8L12 10.3z";

const escaped = (text: string): string =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

const icon = (href: string, label: string, path: string, evenodd = false): string =>
  `<a href="${escaped(href)}" aria-label="${escaped(label)}" title="${escaped(label)}"` +
  (href.startsWith("https://") ? ' target="_blank" rel="noopener noreferrer">' : ">") +
  '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">' +
  `<path${evenodd ? ' fill-rule="evenodd"' : ""} d="${path}"></path></svg></a>`;

/** The marks that lead to a person, in the team's order: LinkedIn, GitHub, e-mail. */
const marksOf = (person: Credited & Pick<Person, "email">, locale: Locale): string[] =>
  [
    person.linkedin &&
      icon(person.linkedin, t(locale, "team.linkedin", { name: person.name }), MARKS.linkedin),
    person.github &&
      icon(person.github, t(locale, "team.github", { name: person.name }), MARKS.github),
    person.email &&
      icon(`mailto:${person.email}`, t(locale, "team.mail", { name: person.name }), ENVELOPE, true),
  ].filter((mark): mark is string => Boolean(mark));

/** Someone a page credits who is not of the team, and where to find them. */
export type Credited = Pick<Person, "name" | "linkedin" | "github">;

/**
 * Who a page credits by name, by the key an author writes as `@links(key)`
 * in a sentence: their marks are drawn there, as the team's are on their
 * cards (the maintainer's word of 22/11/2026).
 */
export const CREDITED: Readonly<Record<string, Credited>> = {
  teo: {
    name: "Teo Tuominen",
    linkedin: "https://www.linkedin.com/in/teo-tuominen-31a81223/",
    github: "https://github.com/teotuominen",
  },
};

/**
 * Each role as the cards name it in a language besides English. A role
 * missing here stops the build, rather than showing in English (decision 39).
 */
const ROLE_IN: Record<Exclude<Locale, "en">, Record<string, string>> = {
  fi: {
    Lead: "Tiiminvetäjä",
    "Chair of the Board": "Hallituksen puheenjohtaja",
    "Member of the Board": "Hallituksen jäsen",
    Developer: "Ohjelmistokehittäjä",
    Design: "Muotoilu",
    Volunteer: "Vapaaehtoinen",
    Advisor: "Neuvonantaja",
    "Tech Advisor": "Tekninen neuvonantaja",
    "CX Lead": "Asiakaskokemus",
    "Operations & Partnerships": "Toiminta ja kumppanuudet",
  },
  sv: {
    Lead: "Teamledare",
    "Chair of the Board": "Styrelseordförande",
    "Member of the Board": "Styrelseledamot",
    Developer: "Utvecklare",
    Design: "Design",
    Volunteer: "Frivillig",
    Advisor: "Rådgivare",
    "Tech Advisor": "Teknisk rådgivare",
    "CX Lead": "Kundupplevelse",
    "Operations & Partnerships": "Verksamhet och partnerskap",
  },
};

function roleIn(role: string, locale: Locale): string {
  if (locale === "en") return role;
  const named = ROLE_IN[locale][role];
  if (named === undefined) throw new Error(`the role "${role}" has no name in ${locale}`);
  return named;
}

/** One person: the face in its circle, the name, the role, and the marks that lead to them. */
function card(person: Person, locale: Locale): string {
  const name = escaped(person.name);
  const face =
    person.photo === null
      ? `<span class="team-face team-initials" aria-hidden="true">${escaped(initials(person.name))}</span>`
      : `<img class="team-face" src="${escaped(person.photo)}" alt="" width="400" height="400" loading="lazy" decoding="async">`;
  const links = marksOf(person, locale);
  return (
    `<li>${face}<p class="team-name">${name}</p><p class="team-role">${person.roles.map((role) => escaped(roleIn(role, locale))).join("<br>")}</p>` +
    (links.length > 0
      ? `<ul class="channels team-links">${links.map((link) => `<li>${link}</li>`).join("")}</ul>`
      : "") +
    "</li>"
  );
}

/**
 * The HTML of a rendered text with the team drawn where the author wrote
 * `@team` as a paragraph of its own (About Us), so
 * that the page carries no HTML (the site's rule) and the team has one copy.
 * The marker anywhere else is refused, never shown. `@links(key)` in a
 * sentence becomes the marks of the one CREDITED names by that key; a key it
 * does not name is refused.
 */
export function drawTeam(
  html: string,
  locale: Locale,
  team: readonly Person[] = TEAM,
  credited: Readonly<Record<string, Credited>> = CREDITED,
): string {
  const done = html
    .replaceAll(
      MARKER,
      `<ul class="team" aria-label="${escaped(t(locale, "team.label"))}">${team.map((person) => card(person, locale)).join("")}</ul>`,
    )
    .replace(/@links\(([a-z]+)\)/g, (_, key: string) => {
      const person = Object.hasOwn(credited, key) ? credited[key] : undefined;
      if (!person) throw new Error(`@links(${key}) names nobody credited`);
      return `<span class="channels inline-links">${marksOf(person, locale).join("")}</span>`;
    });
  if (done.includes("@team")) throw new Error("@team is a paragraph of its own");
  return done;
}
