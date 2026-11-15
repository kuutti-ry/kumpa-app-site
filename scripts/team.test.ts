import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { drawTeam, type Person, TEAM } from "../src/lib/team.ts";

// The team on About Us, and through it on /ga/about/ (src/lib/team.ts).

const ada: Person = {
  name: "Ada Lovelace",
  roles: ["Lead", "Chair"],
  photo: "/team/ada.jpg",
  linkedin: "https://www.linkedin.com/in/ada/",
  github: "https://github.com/ada",
  email: "ada@kuutti.app",
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
    /<a href="https:\/\/www\.linkedin\.com\/in\/ada\/" aria-label="Ada Lovelace on LinkedIn">/,
  );
  assert.match(html, /<a href="https:\/\/github\.com\/ada" aria-label="Ada Lovelace on GitHub">/);
  assert.match(html, /<a href="mailto:ada@kuutti\.app" aria-label="E-mail Ada Lovelace">/);
  assert.equal(html.match(/<a /g)?.length, 3);
  assert.equal(html.match(/class="channels team-links"/g)?.length, 1);
});

test("somebody without a photo has their initials in the circle, and names are escaped", () => {
  const html = drawTeam("<p>@team</p>", "en", [bo]);
  assert.match(html, /<span class="team-face team-initials" aria-hidden="true">B&lt;<\/span>/);
  assert.match(html, /<p class="team-name">Bo &lt;B&gt; &amp; &quot;Co&quot;<\/p>/);
  assert.doesNotMatch(html, /<img/);
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

test("the maintainer first, Olli second, the rest by first name", () => {
  assert.equal(TEAM[0]?.name, "Nikolai");
  assert.equal(TEAM[1]?.name, "Olli");
  const rest = TEAM.slice(2).map((person) => person.name);
  assert.deepEqual(
    rest,
    [...rest].sort((a, b) => a.localeCompare(b, "en")),
  );
});

test("everybody has a role, every face is in the site, and every way to reach a person is a profile or a kuutti.app address", () => {
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
    if (person.email) assert.match(person.email, /^[a-z]+@kuutti\.app$/);
  }
});
