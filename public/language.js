// The language choice stays in this tab. Deep links open the published wording
// they name without changing the reader's preference for the rest of the site.
(() => {
  const radios = document.querySelectorAll('input[name="language"]');
  const title = document.querySelector("title");
  const description = document.querySelector('meta[name="description"]');

  function select(language) {
    if (language !== "fi" && language !== "en") return;
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

  for (const radio of radios) {
    radio.addEventListener("change", () => {
      select(radio.value);
      try {
        sessionStorage.setItem("kumpa-language", radio.value);
      } catch {
        // The native switch also works with browser storage disabled.
      }
    });
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
