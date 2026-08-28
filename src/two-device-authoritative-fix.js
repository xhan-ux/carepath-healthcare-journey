/* Authoritative two-device bridge for the synthetic Ravi demo.
   Staff actions for Ravi are validated by /api/state and sent to /api/event.
   Patient screens subscribe to the same SSE stream and refresh to the verified state. */
(() => {
  const ROLE_KEYS = ["carepath:role:v6", "carepath:demo-role:v2", "carepath:role:v2"];
  const role = () => ROLE_KEYS.map(k => { try { return sessionStorage.getItem(k); } catch { return null; } }).find(Boolean) || null;
  const isStaff = () => role() === "staff";
  const isPatient = () => role() === "patient";
  const RAVI = "DEMO-042";
  let patientStream = null;
  let patientPolling = null;
  let lastPatientKey = "";
  let syncing = false;

  const statePath = state => String(state || "APPOINTMENT_CONFIRMED").toLowerCase().replaceAll("_", "-");
  const journeyKey = j => `${j?.state || ""}|${j?.room || ""}|${j?.queueAhead ?? ""}|${j?.lastUpdated || ""}`;

  async function getJourney() {
    const r = await fetch(`/api/state?authoritative=${Date.now()}`, { cache: "no-store" });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.journey) throw new Error(data.error || "Could not read the shared journey.");
    return data.journey;
  }

  function patientApply(j) {
    if (!isPatient() || !j?.patient || j.patient.id !== RAVI) return;
    const next = journeyKey(j);
    if (!lastPatientKey) {
      lastPatientKey = next;
      return;
    }
    if (next === lastPatientKey) return;
    lastPatientKey = next;
    const target = `#/healthcare/visit/${statePath(j.state)}`;
    if (location.hash !== target) history.replaceState(null, "", target);
    setTimeout(() => location.reload(), 40);
  }

  function connectPatient() {
    if (!isPatient() || !window.EventSource || !location.protocol.startsWith("http")) return;
    if (patientStream) patientStream.close();
    try {
      patientStream = new EventSource(`/api/events?authoritative=${Date.now()}`);
      patientStream.addEventListener("journey", e => { try { patientApply(JSON.parse(e.data).journey); } catch {} });
      patientStream.addEventListener("reset", e => { try { patientApply(JSON.parse(e.data).journey); } catch {} });
    } catch {}
    clearInterval(patientPolling);
    patientPolling = setInterval(async () => {
      try { patientApply(await getJourney()); } catch {}
    }, 1500);
  }

  async function sendRaviEvent(type, extra = {}) {
    if (syncing) return;
    syncing = true;
    try {
      const current = await getJourney();
      if (current.patient?.id !== RAVI) throw new Error("The shared demo patient is not Ravi Kumar.");
      const allowed = {
        PATIENT_ARRIVED: ["APPOINTMENT_CONFIRMED"],
        CHECKED_IN: ["ARRIVED"],
        QUEUE_ADVANCED: ["WAITING"],
        ROOM_CHANGED: ["ARRIVED", "WAITING", "CALLED", "CONSULTATION"],
        CALL_PATIENT: ["WAITING"],
        START_CONSULTATION: ["CALLED"],
        COMPLETE_CONSULTATION: ["CONSULTATION"],
        COMPLETE_LAB: ["LAB"],
        COMPLETE_PHARMACY: ["PHARMACY"]
      };
      if (!allowed[type]?.includes(current.state)) {
        throw new Error(`Ravi is currently ${String(current.state).replaceAll("_", " ")}. Refreshing the staff view.`);
      }
      if (type === "CALL_PATIENT" && (current.queueAhead ?? 0) > 0) {
        throw new Error(`Ravi still has ${current.queueAhead} patient(s) ahead. Advance the queue first.`);
      }
      const body = { role: "staff", type, ...extra };
      const r = await fetch("/api/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || "Could not update the shared journey.");
      return data.journey;
    } finally {
      syncing = false;
    }
  }

  function selectedRavi() {
    const row = document.querySelector('.cp-patient-row[data-patient="DEMO-042"]');
    return !!row?.classList.contains("selected");
  }

  function staffNotice(message) {
    let n = document.querySelector(".cp-staff-notice");
    if (!n) return;
    n.hidden = false;
    n.textContent = message;
    setTimeout(() => { n.hidden = true; }, 3200);
  }

  async function handleStaffClick(event) {
    if (!isStaff()) return;
    const context = event.target.closest?.("[data-cp-context]");
    const action = event.target.closest?.("[data-cp-staff]");
    if (!context && !action) return;
    if (!selectedRavi()) return;
    event.preventDefault();
    event.stopImmediatePropagation();

    let type = null;
    let extra = {};
    if (context) {
      try {
        const j = await getJourney();
        type = ({
          APPOINTMENT_CONFIRMED: "PATIENT_ARRIVED",
          ARRIVED: "CHECKED_IN",
          WAITING: "QUEUE_ADVANCED",
          CALLED: "START_CONSULTATION",
          CONSULTATION: "COMPLETE_CONSULTATION",
          LAB: "COMPLETE_LAB",
          PHARMACY: "COMPLETE_PHARMACY"
        })[j.state];
        if (type === "CHECKED_IN") extra = { queueAhead: 3, description: "Registration completed — Ravi joined the queue" };
        else if (type === "PATIENT_ARRIVED") extra = { description: "Ravi arrived at the hospital" };
        else if (type === "COMPLETE_CONSULTATION") extra = { description: "Consultation completed — lab is next" };
        else if (type === "COMPLETE_LAB") extra = { description: "Lab step completed — pharmacy is next" };
        else if (type === "COMPLETE_PHARMACY") extra = { description: "Pharmacy step completed — visit done" };
        else if (type === "START_CONSULTATION") extra = { description: "Patient moved into consultation" };
        else if (type === "QUEUE_ADVANCED") extra = { description: "Queue advanced" };
      } catch (e) { staffNotice(e.message); return; }
    } else if (action.dataset.cpStaff === "call") {
      type = "CALL_PATIENT";
      extra = { description: "Token 42 called to Room 202" };
    } else if (action.dataset.cpStaff === "room") {
      const j = await getJourney().catch(() => null);
      if (!j) return;
      type = "ROOM_CHANGED";
      extra = { room: j.room === "202" ? "204" : "202", description: `Consultation room changed from ${j.room} to ${j.room === "202" ? "204" : "202"}` };
    } else if (action.dataset.cpStaff === "complete") {
      type = "COMPLETE_CONSULTATION";
      extra = { description: "Consultation completed — lab is next" };
    } else {
      return;
    }

    try {
      await sendRaviEvent(type, extra);
      const j = await getJourney();
      staffNotice(`Shared journey updated · ${String(j.state).replaceAll("_", " ")}`);
      // Let the existing staff shell catch the server event, then force a fresh authoritative read.
      setTimeout(() => window.location.reload(), 80);
    } catch (e) {
      staffNotice(e.message);
      try {
        const j = await getJourney();
        if (j) setTimeout(() => window.location.reload(), 80);
      } catch {}
    }
  }

  document.addEventListener("click", handleStaffClick, true);

  function boot() {
    if (isPatient()) {
      getJourney().then(j => { lastPatientKey = journeyKey(j); }).catch(() => {});
      connectPatient();
    }
  }

  window.addEventListener("DOMContentLoaded", boot);
  setInterval(() => {
    if (isPatient() && !patientStream) connectPatient();
  }, 1000);
  setTimeout(boot, 700);
})();
