/* Live two-device bridge for the synthetic CarePath demo. */
(() => {
  const STAFF_KEY = "carepath:staff:patients:v2";
  const STATION_KEY = "carepath:staff:station:v1";
  const stations = [
    ["registration", "Registration", "Check-in, registration & queue"],
    ["doctor", "Doctor", "Calling & consultation"],
    ["lab", "Lab", "Tests & diagnostics"],
    ["pharmacy", "Pharmacy", "Medicines & completion"]
  ];
  const labels = {
    registration: { eyebrow: "REGISTRATION DESK", title: "Check-in & registration" },
    doctor: { eyebrow: "DOCTOR DESK", title: "Doctor & consultation" },
    lab: { eyebrow: "LAB DESK", title: "Lab & diagnostics" },
    pharmacy: { eyebrow: "PHARMACY DESK", title: "Pharmacy" }
  };
  let busy = false;
  let lastJourneyKey = "";

  function readPatients() {
    try { return JSON.parse(localStorage.getItem(STAFF_KEY) || "null"); } catch { return null; }
  }

  function syncStaff(journey) {
    if (!journey?.patient?.id) return;
    const patients = readPatients();
    if (!Array.isArray(patients) || patients.length !== 7) return;
    const i = patients.findIndex(p => p.id === journey.patient.id);
    if (i < 0) return;
    patients[i] = { ...patients[i], state: journey.state, room: journey.room, queueAhead: journey.queueAhead, updated: journey.lastUpdated };
    const value = JSON.stringify(patients);
    localStorage.setItem(STAFF_KEY, value);
    window.dispatchEvent(new StorageEvent("storage", { key: STAFF_KEY, newValue: value }));
  }

  function stationForState(state) {
    return ({ APPOINTMENT_CONFIRMED: "registration", ARRIVED: "registration", WAITING: "registration", CALLED: "doctor", CONSULTATION: "doctor", LAB: "lab", PHARMACY: "pharmacy", COMPLETED: "pharmacy" })[state] || "registration";
  }

  function updateStationUI(state) {
    const shell = document.querySelector(".cp-staff-command");
    if (!shell) return;
    const active = localStorage.getItem(STATION_KEY) || stationForState(state);
    shell.querySelectorAll("[data-cp-station]").forEach(b => b.classList.toggle("active", b.dataset.cpStation === active));
  }

  function addStations() {
    const shell = document.querySelector(".cp-staff-command");
    if (!shell || shell.querySelector(".cp-stations")) return;
    const top = shell.querySelector(".cp-staff-top");
    if (!top) return;
    const wrap = document.createElement("section");
    wrap.className = "cp-stations";
    wrap.innerHTML = `<div class="cp-stations-head"><div><span>STAFF WORKSTATIONS</span><b>Choose the part of the journey you manage</b></div><small>All stations update the same patient journey.</small></div><div class="cp-station-tabs">${stations.map(([id, name, hint]) => `<button type="button" data-cp-station="${id}"><strong>${name}</strong><span>${hint}</span></button>`).join("")}</div>`;
    top.insertAdjacentElement("afterend", wrap);
    wrap.querySelectorAll("[data-cp-station]").forEach(button => button.addEventListener("click", () => {
      localStorage.setItem(STATION_KEY, button.dataset.cpStation);
      updateStationUI(button.dataset.cpStation);
    }));
    updateStationUI();
  }

  function applyJourney(journey) {
    if (!journey) return;
    const key = `${journey.state}|${journey.room}|${journey.queueAhead}|${journey.lastUpdated}`;
    if (key === lastJourneyKey) return;
    lastJourneyKey = key;
    syncStaff(journey);
    updateStationUI(journey.state);

    // The main patient app owns its state inside an ES module. When the live bridge
    // detects a change, reload once so that app.js rehydrates from /api/state.
    if (sessionStorage.getItem("carepath:role:v6") === "patient" && location.hash.startsWith("#/healthcare/visit/") && window.__carepathLastJourneyKey && window.__carepathLastJourneyKey !== key) {
      location.reload();
      return;
    }
    window.__carepathLastJourneyKey = key;
  }

  async function pull() {
    if (busy || !location.protocol.startsWith("http")) return;
    busy = true;
    try {
      const response = await fetch("/api/state", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        if (data.journey) applyJourney(data.journey);
      }
    } catch {} finally { busy = false; }
  }

  function connect() {
    if (!window.EventSource || !location.protocol.startsWith("http")) return;
    try {
      const stream = new EventSource("/api/events");
      stream.addEventListener("journey", event => { try { applyJourney(JSON.parse(event.data).journey); } catch {} });
      stream.addEventListener("reset", event => { try { applyJourney(JSON.parse(event.data).journey); } catch {} });
    } catch {}
  }

  const observer = new MutationObserver(() => { addStations(); });
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("DOMContentLoaded", () => { addStations(); pull(); connect(); setInterval(pull, 2000); });
  setTimeout(() => { addStations(); pull(); }, 500);
})();
