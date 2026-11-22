import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { CREDITED, type Credited, drawTeam, type Person, TEAM } from "../src/lib/team.ts";

// The team on About Us (src/lib/team.ts).

const ada: Person = {
  name: "Ada Lovelace",
  roles: ["Lead", "Chair"],
  photo: "/team/ada.jpg",
  linkedin: "https://www.linkedin.com/in/ada/",
  github: "https://github.com/ada",
  email: "ada@kumpa.fi",
};
const bo: Person = { name: 'Bo <B> & "Co"', roles: ["Design"], photo: null };

test("the marker becomes the team, each with a face, a name and a role, in the order given", () => {
  const html = drawTeam("<h2>Who we are</h2>\n<p>@team</p>\n<p>The board.</p>", "en", [ada, bo]);
  assert.match(html, /^<h2>Who we are<\/h2>\n<ul class="team" aria-label="The team"><li>/);
  assert.match(html, /<\/ul>\n<p>The board\.<\/p>$/);
  assert.ok(html.indexOf("Ada Lovelace") < html.indexOf("Bo &lt;B&gt;"));
  assert.match(
    html,
    /<img class="team-face" src="\/team\/ada\.jpg" alt="" width="400" height="400"/,
  );
  assert.match(
    html,
    /<p class="team-name">Ada Lovelace<\/p><p class="team-role">Lead<br>Chair<\/p>/,
  );
});

test("each way to reach a person is a mark with its words for a screen reader, and only the ways they have", () => {
  const html = drawTeam("<p>@team</p>", "en", [ada, bo]);
  assert.match(
    html,
    /<a href="https:\/\/www\.linkedin\.com\/in\/ada\/" aria-label="Ada Lovelace on LinkedIn" title="Ada Lovelace on LinkedIn" target="_blank" rel="noopener noreferrer">/,
  );
  assert.match(
    html,
    /<a href="https:\/\/github\.com\/ada" aria-label="Ada Lovelace on GitHub" title="Ada Lovelace on GitHub" target="_blank" rel="noopener noreferrer">/,
  );
  assert.match(
    html,
    /<a href="mailto:ada@kumpa\.fi" aria-label="E-mail Ada Lovelace" title="E-mail Ada Lovelace">/,
  );
  assert.equal(html.match(/<a /g)?.length, 3);
  assert.equal(html.match(/class="channels team-links"/g)?.length, 1);
});

test("somebody without a photo has their initials in the circle, and names are escaped", () => {
  const html = drawTeam("<p>@team</p>", "en", [bo]);
  assert.match(html, /<span class="team-face team-initials" aria-hidden="true">B&lt;<\/span>/);
  assert.match(html, /<p class="team-name">Bo &lt;B&gt; &amp; &quot;Co&quot;<\/p>/);
  assert.doesNotMatch(html, /<img/);
});

test("on the Finnish and the Swedish page every role of the team has its own name, and on the English page it is as written", () => {
  const rolesOf = (html: string): string[] =>
    [...html.matchAll(/<p class="team-role">(.*?)<\/p>/g)].flatMap((m) =>
      (m[1] ?? "").split("<br>"),
    );
  const english = TEAM.flatMap((person) => person.roles).map((role) =>
    role.replaceAll("&", "&amp;"),
  );
  const fi = rolesOf(drawTeam("<p>@team</p>", "fi"));
  assert.equal(fi.length, english.length);
  for (const role of fi) assert.ok(!english.includes(role), `"${role}" has no Finnish name`);
  assert.deepEqual(rolesOf(drawTeam("<p>@team</p>", "en")), english);
  assert.ok(fi.includes("Toiminta ja kumppanuudet"));
  assert.ok(english.includes("Operations &amp; Partnerships"));
  const sv = rolesOf(drawTeam("<p>@team</p>", "sv"));
  assert.equal(sv.length, english.length);
  for (const role of ["Teamledare", "Styrelseordförande", "Verksamhet och partnerskap", "Design"])
    assert.ok(sv.includes(role), role);
  assert.ok(!sv.includes("Lead"));
});

test("a role with no name in a language stops the build, never shown in English", () => {
  for (const locale of ["fi", "sv"] as const) {
    assert.throws(() => drawTeam("<p>@team</p>", locale, [ada]), {
      message: `the role "Chair" has no name in ${locale}`,
    });
  }
  assert.match(drawTeam("<p>@team</p>", "en", [ada]), /Lead<br>Chair/);
});

test("a text without the marker stays as it is", () => {
  assert.equal(drawTeam("<p>Nobody here.</p>", "en", [ada]), "<p>Nobody here.</p>");
});

test("the marker inside a sentence is refused, never shown", () => {
  assert.throws(
    () => drawTeam("<p>See @team below.</p>", "en", [ada]),
    /@team is a paragraph of its own/,
  );
});

const cy: Credited = {
  name: "Cy <C>",
  linkedin: "https://www.linkedin.com/in/cy/",
  github: "https://github.com/cy",
};

test("@links(key) in a sentence becomes the marks of the one credited, in place and in the reader's language", () => {
  const html = drawTeam(
    '<p>Drawn by <a href="https://cy.example/">Cy</a> @links(cy) of Type.</p>',
    "fi",
    [],
    { cy },
  );
  assert.match(
    html,
    /^<p>Drawn by <a href="https:\/\/cy\.example\/">Cy<\/a> <span class="channels inline-links"><a href="https:\/\/www\.linkedin\.com\/in\/cy\/" aria-label="Cy &lt;C&gt; LinkedInissä" title="Cy &lt;C&gt; LinkedInissä" target="_blank" rel="noopener noreferrer"><svg [\s\S]*?<\/a><a href="https:\/\/github\.com\/cy" aria-label="Cy &lt;C&gt; GitHubissa"[\s\S]*?<\/a><\/span> of Type\.<\/p>$/,
  );
  assert.doesNotMatch(html, /<li>/);
});

test("@links(key) shows only the ways the credited person has", () => {
  const html = drawTeam("<p>@links(cy)</p>", "en", [], {
    cy: { name: "Cy", github: "https://github.com/cy" },
  });
  assert.equal(html.match(/<a /g)?.length, 1);
  assert.match(html, /aria-label="Cy on GitHub"/);
});

test("@links with a key nobody is credited by is refused, never shown", () => {
  assert.throws(
    () => drawTeam("<p>By @links(nobody).</p>", "en", [], { cy }),
    /@links\(nobody\) names nobody credited/,
  );
  assert.throws(
    () => drawTeam("<p>By @links(constructor).</p>", "en", [], { cy }),
    /names nobody credited/,
  );
});

test("Teo is credited with his LinkedIn and GitHub", () => {
  assert.equal(CREDITED.teo?.name, "Teo Tuominen");
  assert.match(CREDITED.teo?.linkedin ?? "", /^https:\/\/www\.linkedin\.com\/in\/[^/]+\/$/);
  assert.match(CREDITED.teo?.github ?? "", /^https:\/\/github\.com\/[^/]+$/);
});

test("the maintainer first, Olli second, the rest by first name", () => {
  assert.equal(TEAM[0]?.name, "Nikolai");
  assert.equal(TEAM[1]?.name, "Olli");
  const rest = TEAM.slice(2).map((person) => person.name);
  assert.deepEqual(
    rest,
    [...rest].sort((a, b) => a.localeCompare(b, "en")),
  );
});

test("everybody has a role, every face is in the site, and every way to reach a person is a profile or a kumpa.fi address", () => {
  for (const person of TEAM) {
    assert.ok(person.roles.length > 0, `${person.name} has no role`);
    if (person.photo !== null) {
      assert.ok(
        existsSync(join("public", person.photo)),
        `${person.name}: ${person.photo} is missing`,
      );
    }
    if (person.linkedin)
      assert.match(person.linkedin, /^https:\/\/www\.linkedin\.com\/in\/[^/]+\/$/);
    if (person.github) assert.match(person.github, /^https:\/\/github\.com\/[A-Za-z0-9-]+$/);
    if (person.email) assert.match(person.email, /^[a-z]+@kumpa\.fi$/);
  }
});
