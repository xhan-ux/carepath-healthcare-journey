/* Final staff interaction polish: show the queue prominently and surface only the
   action that is relevant to the selected patient's current journey state. */
(() => {
  const STATION_KEY = "carepath:staff:station:v1";
  const state = () => {
    const el = document.querySelector(".cp-dashboard .cp-staff-stats div:first-child strong");
    return (el?.textContent || "").trim().toLowerCase();
  };
  const station = () => {
    try { return localStorage.getItem(STATION_KEY) || "registration"; } catch { return "registration"; }
  };

  function requiredAction(kind, currentState) {
    const s = currentState;
    if (kind === "registration") {
      if (s === "appointment confirmed") return { kind:"context", label:"Mark patient arrived" };
      if (s === "arrived") return { kind:"context", label:"Complete registration" };
      if (s === "waiting") return { kind:"context", label:"Advance queue" };
      return null;
    }
    if (kind === "doctor") {
      if (s === "called") return { kind:"context", label:"Start consultation" };
      if (s === "consultation") return { kind:"context", label:"Complete consultation" };
      return null;
    }
    if (kind === "lab") return s === "lab" ? { kind:"context", label:"Complete lab step" } : null;
    if (kind === "pharmacy") return s === "pharmacy" ? { kind:"context", label:"Complete pharmacy step" } : null;
    return null;
  }

  function updateStation() {
    const host = document.querySelector(".cp-station-screen");
    if (!host) return;

    const buttons = [...host.querySelectorAll("[data-station-action]")];
    if (!buttons.length) return;

    const wanted = requiredAction(station(), state());
    buttons.forEach(button => {
      const isRequired = Boolean(wanted && button.dataset.stationAction === wanted.kind);
      button.classList.toggle("required-action", isRequired);
      button.hidden = !isRequired;
      button.setAttribute("aria-hidden", String(!isRequired));
      if (isRequired) button.innerHTML = `${wanted.label}<span>→</span>`;
    });

    const workspace = host.querySelector(".cp-station-workspace");
    if (workspace) {
      let note = workspace.querySelector(".cp-required-note");
      if (!note) {
        note = document.createElement("small");
        note.className = "cp-required-note";
        workspace.appendChild(note);
      }
      note.textContent = wanted ? "Required next action" : "No action needed at this station for this patient.";
    }
  }

  function init() {
    updateStation();
    setTimeout(updateStation, 100);
    setTimeout(updateStation, 400);
  }

  document.addEventListener("click", event => {
    if (event.target.closest("[data-patient],[data-cp-station],[data-nav]")) setTimeout(updateStation, 60);
  });
  window.addEventListener("storage", event => {
    if (event.key === STATION_KEY) setTimeout(updateStation, 60);
  });
  window.addEventListener("carepath:route-rendered", () => setTimeout(updateStation, 60));
  new MutationObserver(() => updateStation()).observe(document.body, { childList:true, subtree:true });
  init();
})();
