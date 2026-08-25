import { EventType, initialJourney, JourneyState, canApplyEvent } from "./state.js";

const AUTH_ROLE_KEY = "carepath:demo-role:v3";
const DEMO_PATIENT = { mobile: "9000000000", appointment: "DEMO-042" };
const DEMO_STAFF = { id: "STAFF-ORTHO", pin: "0420" };

let journey = structuredClone(initialJourney);
let authRole = sessionStorage.getItem(AUTH_ROLE_KEY) || null;
let serverAvailable = false;
let eventStream = null;
let pending = false;
let alertAcknowledged = false;

const stateStep = {
  APPOINTMENT_CONFIRMED: 0,
  ARRIVED: 1,
  WAITING: 2,
  CALLED: 3,
  CONSULTATION: 4,
  COMPLETED: 5
};

const timelineSteps = ["Appointment", "Arrived", "Registered", "Called", "Consultation", "Complete"];

const patientCopy = {
  [JourneyState.APPOINTMENT_CONFIRMED]: ["Appointment confirmed", "You’re seeing Dr. Mehta in Orthopaedics at 10:30 AM. When you reach the hospital, we’ll guide you through the next step.", "Tell us when you arrive", "OPD Block A · Ground Floor", "No queue yet", "Appointment confirmed", "I’m at the hospital"],
  [JourneyState.ARRIVED]: ["You’re here. Check in first.", "Show your appointment ID at Counter 3. You don’t need to figure out where to go next.", "Register at Counter 3", "OPD Block A · Ground Floor", "No queue yet", "Arrival confirmed", "Waiting for registration"],
  [JourneyState.WAITING]: ["Registration complete", "Your token is {token}. Stay near Orthopaedics. We’ll update you if anything changes.", "Wait for your token to be called", "Orthopaedics · Room {room}", "{queue} patients ahead", "Registration complete", "You’re checked in"],
  [JourneyState.CALLED]: ["You’re next", "Token {token}, please go to Room {room} now. Dr. Mehta is ready for you.", "Go to Room {room}", "Orthopaedics · Room {room}", "Please go now", "You’re being seen next", "Proceed to Room {room}"],
  [JourneyState.CONSULTATION]: ["Consultation in progress", "You’re with Dr. Mehta in Room {room}. We’ll mark the visit complete once it ends.", "Your visit will be completed shortly", "Orthopaedics · Room {room}", "In consultation", "Consultation underway", "Consultation in progress"],
  [JourneyState.COMPLETED]: ["You’re done for today", "Your Orthopaedics consultation with Dr. Mehta is complete. There are no further steps in this synthetic visit.", "No further steps today", "City Government Hospital", "No wait", "Appointment · Registration · Consultation complete", "Visit completed"]
};

function fill(text) {
  return text
    .replaceAll("{room}", journey.room)
    .replaceAll("{token}", journey.visit.token)
    .replaceAll("{queue}", journey.queueAhead === 0 ? "No" : journey.queueAhead ?? "No");
}

function setView(view) {
  const allowed = ["start", "login", "patient", "staff"];
  if (!allowed.includes(view)) view = "start";
  if ((view === "patient" || view === "staff") && authRole !== view) view = "login";

  document.querySelectorAll(".view").forEach((el) => el.classList.remove("active"));
  document.querySelector(`#${view}-view`)?.classList.add("active");
  document.querySelectorAll(".view-tab").forEach((button) => {
    button.hidden = !authRole || button.dataset.view !== authRole;
    button.classList.toggle("active", button.dataset.view === view);
  });
  document.querySelector("#logout-button").hidden = !authRole;
  window.scrollTo({ top: 0, behavior: "instant" });
}

function setLoginRole(role) {
  const patient = role === "patient";
  document.querySelector("#patient-role")?.classList.toggle("active", patient);
  document.querySelector("#staff-role")?.classList.toggle("active", !patient);
  document.querySelector("#patient-role")?.setAttribute("aria-selected", String(patient));
  document.querySelector("#staff-role")?.setAttribute("aria-selected", String(!patient));
  document.querySelector("#patient-login-form")?.toggleAttribute("hidden", !patient);
  document.querySelector("#staff-login-form")?.toggleAttribute("hidden", patient);
  const error = document.querySelector("#login-error");
  if (error) error.hidden = true;
}

function setAuthRole(role) {
  authRole = role;
  sessionStorage.setItem(AUTH_ROLE_KEY, role);
  setView(role);
}

function logout() {
  authRole = null;
  sessionStorage.removeItem(AUTH_ROLE_KEY);
  setLoginRole("patient");
  setView("start");
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

async function connectToJourneyServer() {
  if (!window.fetch || !window.EventSource || !location.protocol.startsWith("http")) return;
  try {
    const payload = await api("/api/state");
    if (payload.journey) journey = payload.journey;
    serverAvailable = true;
    render();
    eventStream?.close();
    eventStream = new EventSource("/api/events");
    eventStream.addEventListener("journey", (event) => {
      const data = JSON.parse(event.data);
      if (data.journey) {
        journey = data.journey;
        alertAcknowledged = false;
        render();
      }
    });
    eventStream.addEventListener("reset", (event) => {
      const data = JSON.parse(event.data);
      if (data.journey) {
        journey = data.journey;
        alertAcknowledged = false;
        render();
      }
    });
    eventStream.onerror = () => {
      serverAvailable = false;
      render();
    };
  } catch {
    serverAvailable = false;
    render();
  }
}

async function action(type, extra = {}) {
  if (!authRole || pending) return;
  if (!serverAvailable) {
    window.alert("The live demo server is not connected. Run the CarePath server first.");
    return;
  }
  pending = true;
  render();
  try {
    const data = await api("/api/event", {
      method: "POST",
      body: JSON.stringify({ type, ...extra, role: authRole })
    });
    if (data.journey) journey = data.journey;
  } catch (error) {
    window.alert(error.message);
  } finally {
    pending = false;
    render();
  }
}

function renderPatient() {
  const copy = patientCopy[journey.state].map(fill);
  const stateIndex = stateStep[journey.state];

  document.querySelector("#status-label").textContent = journey.state.replaceAll("_", " ");
  document.querySelector("#last-updated").textContent = `Updated ${journey.lastUpdated}`;
  document.querySelector("#now-title").textContent = copy[0];
  document.querySelector("#now-body").textContent = copy[1];
  document.querySelector("#next-text").textContent = copy[2];
  document.querySelector("#where-text").textContent = copy[3];
  document.querySelector("#wait-text").textContent = copy[4];
  document.querySelector("#done-text").textContent = copy[5];
  document.querySelector("#connection-status").textContent = !navigator.onLine ? "Offline" : serverAvailable ? "Live sync" : "Waiting for sync";

  const button = document.querySelector("#patient-action");
  button.textContent = pending ? "Updating…" : copy[6];
  button.disabled = journey.state !== JourneyState.APPOINTMENT_CONFIRMED || pending || !serverAvailable || authRole !== "patient";

  document.querySelector("#timeline").innerHTML = timelineSteps.map((step, index) => {
    const reached = index <= stateIndex;
    const current = index === stateIndex;
    return `<li class="${reached ? "reached" : ""} ${current ? "current" : ""}"><span>${index < stateIndex ? "✓" : index + 1}</span>${step}</li>`;
  }).join("");

  const events = [...(journey.events || [])].reverse().slice(0, 4);
  const eventList = document.querySelector("#patient-events");
  if (eventList) {
    eventList.innerHTML = events.length
      ? events.map((event) => `<li><strong>${event.description}</strong><span>${event.at}</span></li>`).join("")
      : "<li><strong>Appointment confirmed</strong><span>10:12 AM</span></li>";
  }

  const latest = journey.events?.at(-1);
  const alert = document.querySelector("#journey-alert");
  const needsAlert = latest?.type === EventType.ROOM_CHANGED || latest?.type === EventType.CALL_PATIENT;
  alert.hidden = !needsAlert || alertAcknowledged;
  if (needsAlert && !alertAcknowledged) {
    const roomChange = latest.type === EventType.ROOM_CHANGED;
    alert.innerHTML = `<strong>${roomChange ? `Your room changed to ${journey.room}.` : `Token ${journey.visit.token}, it’s your turn.`}</strong><p>${roomChange ? `Your consultation is now in Room ${journey.room}.` : `Please go to Room ${journey.room} now.`}</p><button id="ack-alert" type="button">Got it</button>`;
  }
}

function control(label, type, enabled) {
  return `<button class="sim-control" data-event="${type}" type="button" ${enabled ? "" : "disabled"}>${label}<span>${enabled ? "→" : "—"}</span></button>`;
}

function renderStaff() {
  document.querySelector("#staff-state").textContent = journey.state.replaceAll("_", " ");
  document.querySelector("#staff-room").textContent = journey.room;
  document.querySelector("#staff-queue").textContent = journey.queueAhead ?? "—";
  document.querySelector("#staff-updated").textContent = journey.lastUpdated;

  const enabled = serverAvailable && !pending && authRole === "staff";
  document.querySelector("#staff-controls").innerHTML = [
    control("Register / check in patient", EventType.CHECKED_IN, enabled && canApplyEvent(journey, EventType.CHECKED_IN)),
    control("Advance queue", EventType.QUEUE_ADVANCED, enabled && canApplyEvent(journey, EventType.QUEUE_ADVANCED) && journey.queueAhead > 0),
    control("Move Room 202 → 204", EventType.ROOM_CHANGED, enabled && canApplyEvent(journey, EventType.ROOM_CHANGED) && journey.room === "202"),
    control("Call patient", EventType.CALL_PATIENT, enabled && canApplyEvent(journey, EventType.CALL_PATIENT)),
    control("Start consultation", EventType.START_CONSULTATION, enabled && canApplyEvent(journey, EventType.START_CONSULTATION)),
    control("Complete consultation", EventType.COMPLETE_CONSULTATION, enabled && canApplyEvent(journey, EventType.COMPLETE_CONSULTATION))
  ].join("");

  const sms = document.querySelector("#sms-preview");
  if (sms) {
    sms.textContent = journey.state === JourneyState.WAITING
      ? `CAREPATH: Registration complete. Token ${journey.visit.token}. Orthopaedics, Room ${journey.room}. ${journey.queueAhead} ahead.`
      : journey.state === JourneyState.CALLED
        ? `CAREPATH: Your turn. Token ${journey.visit.token}. Go to Room ${journey.room} now.`
        : journey.state === JourneyState.CONSULTATION
          ? `CAREPATH: Consultation in progress. Room ${journey.room}.`
          : journey.state === JourneyState.COMPLETED
            ? "CAREPATH: Your visit is complete."
            : "CAREPATH: Appointment confirmed. Bring your appointment ID to OPD Block A.";
  }

  const events = [...(journey.events || [])].reverse().slice(0, 5);
  const eventList = document.querySelector("#staff-events");
  if (eventList) {
    eventList.innerHTML = events.length
      ? events.map((event) => `<li><strong>${event.description}</strong><span>${event.at}</span></li>`).join("")
      : "<li><strong>No events yet</strong><span>10:12 AM</span></li>";
  }
}

function render() {
  renderPatient();
  renderStaff();
  document.querySelector("#logout-button").hidden = !authRole;
  document.querySelectorAll(".view-tab").forEach((button) => {
    button.hidden = !authRole || button.dataset.view !== authRole;
  });
}

function bind() {
  document.querySelector("#patient-entry").addEventListener("click", () => {
    setLoginRole("patient");
    setView("login");
  });
  document.querySelector("#staff-entry").addEventListener("click", () => {
    setLoginRole("staff");
    setView("login");
  });
  document.querySelector("#back-to-start").addEventListener("click", () => setView("start"));
  document.querySelector("#patient-role").addEventListener("click", () => setLoginRole("patient"));
  document.querySelector("#staff-role").addEventListener("click", () => setLoginRole("staff"));

  document.querySelector("#patient-login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const mobile = document.querySelector("#patient-mobile").value.trim();
    const appointment = document.querySelector("#patient-appointment").value.trim().toUpperCase();
    if (mobile !== DEMO_PATIENT.mobile || appointment !== DEMO_PATIENT.appointment) {
      const error = document.querySelector("#login-error");
      error.textContent = "For this synthetic demo, use 9000000000 and DEMO-042.";
      error.hidden = false;
      return;
    }
    setAuthRole("patient");
  });

  document.querySelector("#staff-login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const id = document.querySelector("#staff-id").value.trim().toUpperCase();
    const pin = document.querySelector("#staff-pin").value.trim();
    if (id !== DEMO_STAFF.id || pin !== DEMO_STAFF.pin) {
      const error = document.querySelector("#login-error");
      error.textContent = "For this synthetic demo, use STAFF-ORTHO and PIN 0420.";
      error.hidden = false;
      return;
    }
    setAuthRole("staff");
  });

  document.querySelector("#patient-action").addEventListener("click", () => {
    action(EventType.PATIENT_ARRIVED, { description: "Ravi arrived at the hospital" });
  });

  document.querySelector("#staff-controls").addEventListener("click", (event) => {
    const type = event.target.closest("button")?.dataset.event;
    if (!type || authRole !== "staff") return;
    const extra = type === EventType.ROOM_CHANGED
      ? { room: "204", description: "Consultation room changed from 202 to 204" }
      : type === EventType.CHECKED_IN
        ? { queueAhead: 3, description: "Registration completed — Ravi joined the queue" }
        : type === EventType.QUEUE_ADVANCED
          ? { description: `Queue advanced — ${Math.max(0, journey.queueAhead - 1)} patient(s) ahead` }
          : {};
    action(type, extra);
  });

  document.querySelector("#explain-action").addEventListener("click", () => {
    const detail = document.querySelector("#explanation");
    detail.textContent = journey.state === JourneyState.WAITING
      ? `Your registration is complete. Token ${journey.visit.token}; ${journey.queueAhead} people are currently ahead.`
      : journey.state === JourneyState.CALLED
        ? `Your token has been called. Go directly to Room ${journey.room}.`
        : "CarePath turns verified visit updates into one clear next action. It does not diagnose or provide medical advice.";
    detail.hidden = !detail.hidden;
  });

  document.querySelector("#journey-alert").addEventListener("click", (event) => {
    if (event.target.closest("#ack-alert")) {
      alertAcknowledged = true;
      render();
    }
  });

  document.querySelectorAll(".view-tab").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });
  document.querySelector("#logout-button").addEventListener("click", logout);

  document.querySelector("#reset-demo").addEventListener("click", async () => {
    if (authRole !== "staff" || !serverAvailable || pending) return;
    pending = true;
    render();
    try {
      const data = await api("/api/reset", { method: "POST", body: JSON.stringify({ role: "staff" }) });
      if (data.journey) journey = data.journey;
      alertAcknowledged = false;
    } catch (error) {
      window.alert(error.message);
    } finally {
      pending = false;
      render();
    }
  });

  window.addEventListener("online", connectToJourneyServer);
  window.addEventListener("offline", render);
}

bind();
setLoginRole("patient");
render();
if (authRole === "patient" || authRole === "staff") setView(authRole);
else setView("start");
connectToJourneyServer();
