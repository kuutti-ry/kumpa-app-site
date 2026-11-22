// The language choice stays in this tab. Deep links open the published wording
// they name without changing the reader's preference for the rest of the site.
// A link ending in a language's code ("#sv") chooses that language for the tab:
// the one way to Swedish, which the switch does not offer yet (docs/decisions.md, 40).
(() => {
  const languages = ["fi", "sv", "en"];
  const radios = document.querySelectorAll('input[name="language"]');
  const title = document.querySelector("title");
  const description = document.querySelector('meta[name="description"]');

  function select(language) {
    if (!languages.includes(language)) return;
    document.getElementById(`lang-${language}`).checked = true;
    document.documentElement.lang = language;
    document.title = title.dataset[language];
    description.content = description.dataset[language];
  }

  function followFragment() {
    let id;
    try {
      id = decodeURIComponent(location.hash.slice(1));
    } catch {
      return false;
    }
    if (languages.includes(id)) {
      choose(id);
      return true;
    }
    const target = document.getElementById(id);
    const group = target?.closest("[data-lang]");
    if (!group) return false;
    select(group.dataset.lang);
    const disclosure = target.closest("details");
    if (disclosure) disclosure.open = true;
    target.scrollIntoView();
    return true;
  }

  function restore() {
    if (followFragment()) return;
    try {
      select(sessionStorage.getItem("kumpa-language") || "fi");
    } catch {
      select(document.querySelector('input[name="language"]:checked').value);
    }
  }

  function choose(language) {
    select(language);
    try {
      sessionStorage.setItem("kumpa-language", language);
    } catch {
      // The native switch also works with browser storage disabled.
    }
  }

  for (const radio of radios) {
    radio.addEventListener("change", () => choose(radio.value));
  }
  // A repeated click on the same fragment does not dispatch hashchange.
  document.addEventListener("click", (event) => {
    const link = event.target.closest?.('a[href^="#"]');
    if (link && link.hash === location.hash) followFragment();
  });
  window.addEventListener("hashchange", followFragment);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) restore();
  });
  restore();
})();
