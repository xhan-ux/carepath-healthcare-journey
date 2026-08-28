/* Final two-device demo bridge.
   Demo contract:
   - phone = patient
   - laptop = hospital staff
   - staff actions update the patient device
   - patient arrival updates the staff device
   - staff can reset the entire shared demo
*/
(() => {
  const ROLE_KEY = "carepath:role:v6";
  const SYNC_KEY = "carepath:two-device-key:v1";
  const role = () => { try { return sessionStorage.getItem(ROLE_KEY); } catch { return null; } };
  const route = () => location.hash.replace(/^#\/?/, "") || "services";
  const isPatientVisit = () => route().startsWith("healthcare/visit/");
  const isStaff = () => role() === "staff";
  const statePath = (journey) => String(journey?.state || "APPOINTMENT_CONFIRMED").toLowerCase().replaceAll("_", "-");
  const journeyKey = (journey) => `${journey?.patient?.id || ""}|${journey?.state || ""}|${journey?.room || ""}|${journey?.queueAhead ?? ""}|${journey?.lastUpdated || ""}`;

  let stream;
  let busy = false;

  function remember(key) {
    try { sessionStorage.setItem(SYNC_KEY, key); } catch {}
  }
  function remembered() {
    try { return sessionStorage.getItem(SYNC_KEY) || ""; } catch { return ""; }
  }

  function patientApply(journey) {
    if (!journey || !isPatientVisit()) return;
    const key = journeyKey(journey);
    if (remembered() === key) return;
    remember(key);
    const target = `#/healthcare/visit/${statePath(journey)}`;
    if (location.hash !== target) history.replaceState(null, "", target);
    /* app.js owns the in-memory journey. Reloading is deliberate here: it
       gives the patient page the exact server state without duplicating its
       internal state machine. */
    setTimeout(() => location.reload(), 30);
  }

  function handleReset(journey) {
    if (isPatientVisit()) {
      remember(journeyKey(journey));
      history.replaceState(null, "", "#/healthcare/visit/appointment-confirmed");
      setTimeout(() => location.reload(), 30);
    } else if (isStaff()) {
      remember(journeyKey(journey));
      if (!route().startsWith("staff")) history.replaceState(null, "", "#/staff");
      setTimeout(() => location.reload(), 30);
    }
  }

  function connect() {
    if (!window.EventSource || !location.protocol.startsWith("http")) return;
    try {
      stream = new EventSource("/api/events");
      stream.addEventListener("journey", event => {
        try {
          const data = JSON.parse(event.data);
          if (isPatientVisit()) patientApply(data.journey);
        } catch {}
      });
      stream.addEventListener("reset", event => {
        try { handleReset(JSON.parse(event.data).journey); } catch {}
      });
      stream.onerror = () => {};
    } catch {}
  }

  async function pullOnce() {
    if (busy || !location.protocol.startsWith("http")) return;
    busy = true;
    try {
      const response = await fetch("/api/state", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      if (isPatientVisit()) patientApply(data.journey);
    } catch {} finally { busy = false; }
  }

  function addResetButton() {
    if (!isStaff()) return;
    const shell = document.querySelector(".cp-staff-command") || document.querySelector("main");
    if (!shell || shell.querySelector("[data-demo-reset]")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.dataset.demoReset = "true";
    button.className = "demo-reset-button";
    button.innerHTML = `<span aria-hidden="true">↻</span><span><strong>Start new demo</strong><small>Reset patient + queue</small></span>`;
    button.addEventListener("click", async () => {
      if (button.disabled) return;
      const ok = window.confirm("Start a new demo? This resets the patient journey for both devices.");
      if (!ok) return;
      button.disabled = true;
      try {
        const response = await fetch("/api/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "staff" })
        });
        if (!response.ok) throw new Error("reset failed");
        const data = await response.json();
        remember(journeyKey(data.journey));
        if (!route().startsWith("staff")) history.replaceState(null, "", "#/staff");
        setTimeout(() => location.reload(), 30);
      } catch {
        button.disabled = false;
        const toast = document.querySelector("#toast");
        if (toast) {
          toast.textContent = "Could not reset the demo. Try again.";
          toast.hidden = false;
          setTimeout(() => { toast.hidden = true; }, 2600);
        }
      }
    });

    const actions = shell.querySelector(".cp-staff-top") || shell.firstElementChild;
    if (actions) actions.insertAdjacentElement("afterend", button);
    else shell.prepend(button);
  }

  const observer = new MutationObserver(addResetButton);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener("DOMContentLoaded", () => {
    addResetButton();
    connect();
    pullOnce();
    setInterval(pullOnce, 2500);
  });

  setTimeout(() => { addResetButton(); connect(); pullOnce(); }, 400);
})();
