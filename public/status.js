// /health reports HTTP 503 with a JSON body when a dependency fails. A bad
// response or a network error tells us only that the check was inconclusive.
export function interpretHealth(code, body) {
  const unknown = { summary: "unknown", db: "unknown", migrations: "unknown" };
  if (code === 200 && body?.status === "ok" && body.db === "ok" && body.migrations === "current")
    return { summary: "ok", db: "ok", migrations: "current" };
  if ((code === 503 || code === 200) && body?.status === "degraded") {
    if (body.db === "unreachable")
      return { summary: "degraded", db: "unreachable", migrations: "unknown" };
    if (body.db === "ok" && body.migrations === "pending")
      return { summary: "degraded", db: "ok", migrations: "pending" };
  }
  return unknown;
}

function watchStatus() {
  const panels = [...document.querySelectorAll("[data-service-status]")];
  const visible = new Set();
  let checking = false;
  let checkedAt = 0;
  const interval = 60_000;

  function label(panel, selector, state) {
    const element = panel.querySelector(selector);
    element.dataset.state = state;
    element.textContent = element.dataset[state];
  }

  async function check(force = false) {
    if (
      checking ||
      document.hidden ||
      (!force && (!visible.size || Date.now() - checkedAt < interval))
    )
      return;
    checking = true;
    for (const panel of panels) {
      panel.dataset.state = "checking";
      label(panel, "[data-status-summary]", "checking");
      panel.querySelector("button").disabled = true;
    }

    let health;
    try {
      const response = await fetch("/status/health.json", {
        credentials: "omit",
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(7000),
      });
      health = interpretHealth(response.status, await response.json());
    } catch {
      health = interpretHealth(0);
    }
    checkedAt = Date.now();
    const date = new Date(checkedAt);
    for (const panel of panels) {
      panel.dataset.state = health.summary;
      label(panel, "[data-status-summary]", health.summary);
      label(panel, "[data-status-db]", health.db);
      label(panel, "[data-status-migrations]", health.migrations);
      const time = panel.querySelector("time");
      time.dateTime = date.toISOString();
      time.textContent = date.toLocaleString(panel.closest("[lang]").lang, {
        dateStyle: "short",
        timeStyle: "short",
      });
      panel.querySelector("[data-status-timestamp]").hidden = false;
      panel.querySelector("button").disabled = false;
    }
    checking = false;
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    check();
  });
  for (const panel of panels) {
    const button = panel.querySelector("button");
    button.hidden = false;
    button.addEventListener("click", () => check(true));
    observer.observe(panel);
  }
  document.addEventListener("visibilitychange", () => check());
  window.setInterval(() => check(), interval);
}

if (typeof document !== "undefined") watchStatus();
