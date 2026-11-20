const hex = /^[0-9a-f]{64}$/;
const encoder = new TextEncoder();

// ALTCHA v1 hashes the UTF-8 salt followed by the decimal candidate number.
export async function solveChallenge(payload, signal) {
  const { algorithm, challenge, salt, maxnumber, signature } = payload;
  if (
    algorithm !== "SHA-256" ||
    typeof challenge !== "string" ||
    !hex.test(challenge) ||
    typeof salt !== "string" ||
    !/^[0-9a-f]{32}$/.test(salt) ||
    typeof signature !== "string" ||
    !/^[A-Za-z0-9_-]{43}$/.test(signature) ||
    !Number.isInteger(maxnumber) ||
    maxnumber < 0 ||
    maxnumber > 50_000
  ) {
    throw new Error("Invalid signup challenge");
  }

  const expected = Uint8Array.from(challenge.match(/../g), (pair) => Number.parseInt(pair, 16));
  const batchSize = 64;
  for (let start = 0; start <= maxnumber; start += batchSize) {
    signal.throwIfAborted();
    const length = Math.min(batchSize, maxnumber - start + 1);
    const checks = Array.from({ length }, async (_, index) => {
      const hash = await crypto.subtle.digest("SHA-256", encoder.encode(salt + (start + index)));
      const bytes = new Uint8Array(hash);
      return expected.every((value, offset) => value === bytes[offset]);
    });
    const match = (await Promise.all(checks)).indexOf(true);
    if (match >= 0) {
      return btoa(JSON.stringify({ algorithm, challenge, salt, number: start + match, signature }));
    }
  }
  throw new Error("Signup challenge has no solution");
}

function enableWaitlist(form) {
  const button = form.querySelector("button");
  const email = form.elements.namedItem("email");
  const proof = form.elements.namedItem("altcha");
  const feedback = form.querySelector("[role=status]");
  const emailError = form.querySelector(".waitlist-email-error");

  function clearEmailError() {
    email.removeAttribute("aria-invalid");
    emailError.textContent = "";
  }

  function showEmailError() {
    email.setAttribute("aria-invalid", "true");
    emailError.textContent = email.validity.valueMissing
      ? emailError.dataset.missing
      : emailError.dataset.invalid;
    email.focus();
  }

  function reset() {
    proof.value = "";
    email.readOnly = false;
    button.disabled = false;
    feedback.textContent = "";
    clearEmailError();
  }

  email.addEventListener("input", () => {
    if (email.hasAttribute("aria-invalid") && email.validity.valid) clearEmailError();
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (button.disabled) return;
    feedback.textContent = "";
    if (!email.validity.valid) {
      showEmailError();
      return;
    }
    clearEmailError();
    button.disabled = true;
    email.readOnly = true;
    feedback.textContent = feedback.dataset.busy;
    try {
      const fields = new URLSearchParams();
      for (const name of ["email", "locale", "website"])
        fields.set(name, form.elements[name].value);
      const signal = AbortSignal.timeout(45_000);
      const reply = await fetch(new URL("challenge", form.action), {
        method: "POST",
        body: fields,
        credentials: "omit",
        cache: "no-store",
        redirect: "error",
        signal,
      });
      if (reply.status === 422) {
        reset();
        showEmailError();
        return;
      }
      if (!reply.ok) throw new Error("Signup service unavailable");
      proof.value = await solveChallenge(await reply.json(), signal);
      form.submit();
    } catch {
      reset();
      feedback.textContent = feedback.dataset.error;
    }
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) reset();
  });
  form.noValidate = true;
  form.querySelector("[data-waitlist-controls]").hidden = false;
  form.querySelector("[data-waitlist-contact]").hidden = true;
}

if (
  typeof document !== "undefined" &&
  globalThis.crypto?.subtle &&
  globalThis.AbortSignal?.timeout
) {
  for (const form of document.querySelectorAll("form.waitlist")) enableWaitlist(form);
}
