import { EventType, initialJourney, JourneyState } from "./state.js";

const AUTH_ROLE_KEY = "carepath:demo-role:v2";
const DEMO_PATIENT = { mobile: "9000000000", appointment: "DEMO-042" };
const DEMO_STAFF = { id: "STAFF-ORTHO", pin: "0420" };

let journey = structuredClone(initialJourney);
let alertAcknowledged = false;
let authRole = sessionStorage.getItem(AUTH_ROLE_KEY) || null;
let eventSource = null;
let serverConnected = false;
let pendingAction = false;

const patientCopy = {
  [JourneyState.APPOINTMENT_CONFIRMED]: ["Appointment confirmed", "You’re seeing Dr. Mehta in Orthopaedics at 10:30 AM. When you reach the hospital, we’ll guide you through the next step.", "Tell us when you arrive", "OPD Block A · Ground Floor", "No queue yet", "Appointment confirmed", "I’m at the hospital →"],
  [JourneyState.ARRIVED]: ["You’re here. Check in first.", "Show your appointment ID at Counter 3. You don’t need to figure out where to go next.", "Register at Counter 3", "OPD Block A · Ground Floor", "No queue yet", "Arrival confirmed", "Waiting for registration"],
  [JourneyState.WAITING]: ["Registration complete", "Your token is {token}. Please stay near Orthopaedics. We’ll update you if anything changes.", "Wait for your token to be called", "Orthopaedics · Room {room}", "{queue} patients ahead", "Registration ✓", "You’re checked in"],
  [JourneyState.CALLED]: ["You’re next", "Token {token}, please go to Room {room} now. Dr. Mehta is ready for you.", "Go to Room {room}", "Orthopaedics · Room {room}", "Please go now", "You’re being seen next", "Proceed to Room {room}"],
  [JourneyState.CONSULTATION]: ["Consultation in progress", "You’re with Dr. Mehta in Room {room}. We’ll mark your journey complete once the visit ends.", "Your visit will be completed shortly", "Orthopaedics · Room {room}", "In consultation", "Consultation underway", "Consultation in progress"],
  [JourneyState.COMPLETED]: ["You’re done for today", "Your Orthopaedics consultation with Dr. Mehta is complete. There are no further steps in this synthetic visit.", "No further steps today", "City Government Hospital", "No wait", "Appointment · Registration · Consultation ✓", "Visit completed"]
};

const timelineSteps = ["Appointment confirmed", "Arrived", "Registered & waiting", "Called", "Consultation", "Completed"];
const stateStep = { APPOINTMENT_CONFIRMED: 0, ARRIVED: 1, WAITING: 2, CALLED: 3, CONSULTATION: 4, COMPLETED: 5 };

function fill(template) {
  return template.replaceAll("{room}", journey.room).replaceAll("{token}", journey.visit.token).replaceAll("{queue}", journey.queueAhead === 0 ? "No" : journey.queueAhead);
}

function formatState(state) { return state.replaceAll("_", " "); }

function setConnectionStatus() {
  const connection = document.querySelector("#connection-status");
  if (!connection) return;
  if (!navigator.onLine) {
    connection.textContent = `Offline · Last known ${journey.lastUpdated}`;
    connection.dataset.status = "offline";
    connection.title = "Offline. Showing the last verified journey state and SMS fallback simulation.";
  } else if (serverConnected) {
    connection.textContent = "Live sync";
    connection.dataset.status = "online";
    connection.title = "Connected to the CarePath demo server.";
  } else {
    connection.textContent = "Waiting for sync";
    connection.dataset.status = "offline";
    connection.title = "The two-device demo server is not connected yet.";
  }
}

function renderPatient() {
  const copy = patientCopy[journey.state].map(fill);
  document.querySelector("#status-label").textContent = formatState(journey.state);
  document.querySelector("#last-updated").textContent = `Updated ${journey.lastUpdated}`;
  document.querySelector("#now-title").textContent = copy[0];
  document.querySelector("#now-body").textContent = copy[1];
  document.querySelector("#next-text").textContent = copy[2];
  document.querySelector("#where-text").textContent = copy[3];
  document.querySelector("#wait-text").textContent = copy[4];
  document.querySelector("#done-text").textContent = copy[5];

  const button = document.querySelector("#patient-action");
  button.textContent = pendingAction ? "Sending update…" : copy[6];
  button.disabled = journey.state !== JourneyState.APPOINTMENT_CONFIRMED || pendingAction || !serverConnected;
  button.hidden = journey.state === JourneyState.COMPLETED;

  const latestEvent = journey.events.at(-1);
  const alert = document.querySelector("#journey-alert");
  const needsAlert = latestEvent?.type === EventType.ROOM_CHANGED || latestEvent?.type === EventType.CALL_PATIENT;
  alert.hidden = !needsAlert || alertAcknowledged;
  if (needsAlert && !alertAcknowledged) {
    const isRoomChange = latestEvent.type === EventType.ROOM_CHANGED;
    alert.innerHTML = `<div><span class="alert-icon">${isRoomChange ? "↗" : "!"}</span><div><p class="eyebrow">${isRoomChange ? "YOUR NEXT STEP CHANGED" : "YOUR TURN"}</p><strong>${isRoomChange ? `Your consultation is now in Room ${journey.room}` : `Token ${journey.visit.token}, please go to Room ${journey.room}`}</strong><p>${isRoomChange ? "Keep waiting near Orthopaedics. We’ll let you know when you’re called." : "Please proceed now."}</p></div></div><button id="ack-alert" type="button">Got it</button>`;
  }

  document.querySelector("#timeline").innerHTML = timelineSteps.map((step, index) => `<li class="${index <= stateStep[journey.state] ? "reached" : ""} ${index === stateStep[journey.state] ? "current" : ""}"><span>${index < stateStep[journey.state] ? "✓" : index + 1}</span>${step}</li>`).join("");
  const explanation = document.querySelector("#explanation");
  if (!explanation.hidden) explanation.textContent = explanationForState();
}

function control(label, type, enabled) {
  return `<button class="sim-control" data-event="${type}" type="button" ${enabled ? "" : "disabled"}>${label}<span>${enabled ? "→" : "—"}</span></button>`;
}

function renderStaff() {
  document.querySelector("#staff-state").textContent = formatState(journey.state);
  document.querySelector("#staff-room").textContent = journey.room;
  document.querySelector("#staff-queue").textContent = journey.queueAhead ?? "—";
  document.querySelector("#staff-updated").textContent = journey.lastUpdated;
  document.querySelector("#sms-preview").textContent = smsForState();
  const enabled = serverConnected && !pendingAction;
  document.querySelector("#staff-controls").innerHTML = [
    control("Register / check in patient", EventType.CHECKED_IN, enabled && canApplyEvent(journey, EventType.CHECKED_IN)),
    control("Advance queue", EventType.QUEUE_ADVANCED, enabled && canApplyEvent(journey, EventType.QUEUE_ADVANCED) && journey.queueAhead > 0),
    control("Move consultation room 202 → 204", EventType.ROOM_CHANGED, enabled && canApplyEvent(journey, EventType.ROOM_CHANGED) && journey.room === "202"),
    control("Call patient", EventType.CALL_PATIENT, enabled && canApplyEvent(journey, EventType.CALL_PATIENT)),
    control("Start consultation", EventType.START_CONSULTATION, enabled && canApplyEvent(journey, EventType.START_CONSULTATION)),
    control("Complete consultation", EventType.COMPLETE_CONSULTATION, enabled && canApplyEvent(journey, EventType.COMPLETE_CONSULTATION))
  ].join("");
}

function smsForState() {
  const room = journey.room;
  if (journey.state === JourneyState.WAITING) return `CAREPATH: Registration complete. Token ${journey.visit.token}. Orthopaedics, Room ${room}. ${journey.queueAhead} ahead. Updated ${journey.lastUpdated}.`;
  if (journey.state === JourneyState.CALLED) return `CAREPATH: Your turn. Token ${journey.visit.token}, go to Orthopaedics Room ${room} now.`;
  if (journey.state === JourneyState.COMPLETED) return "CAREPATH: Your Orthopaedics visit is complete. Thank you.";
  return "CAREPATH: Appointment confirmed. Bring your appointment ID to OPD Block A.";
}

function explanationForState() {
  if (journey.state === JourneyState.WAITING) return `Your registration is done. Your place in the queue is token ${journey.visit.token}; ${journey.queueAhead} people are currently ahead. We show the last verified update instead of guessing a wait time.`;
  if (journey.state === JourneyState.CALLED) return `The hospital system has marked your token as called. Go directly to Room ${journey.room}.`;
  if (journey.state === JourneyState.ARRIVED) return "Your appointment is recognised. The next verified step is simply registration at Counter 3.";
  return "This page turns verified visit updates into a clear next action. It does not provide medical advice or make clinical decisions.";
}

function setLoginRole(role) {
  const isPatient = role === "patient";
  document.querySelector("#patient-role").classList.toggle("active", isPatient);
  document.querySelector("#staff-role").classList.toggle("active", !isPatient);
  document.querySelector("#patient-role").setAttribute("aria-selected", String(isPatient));
  document.querySelector("#staff-role").setAttribute("aria-selected", String(!isPatient));
  document.querySelector("#patient-login-form").hidden = !isPatient;
  document.querySelector("#staff-login-form").hidden = isPatient;
  document.querySelector("#login-error").hidden = true;
}

function setAuthRole(role) {
  authRole = role;
  sessionStorage.setItem(AUTH_ROLE_KEY, role);
  document.querySelector("#logout-button").hidden = false;
  document.querySelectorAll(".view-tab").forEach((button) => { button.hidden = button.dataset.view !== role; });
  document.querySelector("#start-view").classList.remove("active");
  switchView(role === "staff" ? "staff" : "patient");
}

function logout() {
  authRole = null;
  sessionStorage.removeItem(AUTH_ROLE_KEY);
  document.querySelector("#logout-button").hidden = true;
  document.querySelectorAll(".view-tab").forEach((button) => { button.hidden = true; });
  setLoginRole("patient");
  switchView("start");
}

function showLoginError(message) {
  const error = document.querySelector("#login-error");
  error.textContent = message;
  error.hidden = false;
}

function renderAuthChrome() {
  const logoutButton = document.querySelector("#logout-button");
  const tabs = document.querySelectorAll(".view-tab");
  if (!authRole) {
    logoutButton.hidden = true;
    tabs.forEach((button) => { button.hidden = true; });
    return;
  }
  logoutButton.hidden = false;
  tabs.forEach((button) => { button.hidden = button.dataset.view !== authRole; });
}

function render() {
  renderPatient();
  renderStaff();
  setConnectionStatus();
  renderAuthChrome();
}

function switchView(view) {
  if (view !== "start" && !authRole) {
    document.querySelectorAll(".view-tab, .view").forEach((el) => el.classList.remove("active"));
    document.querySelector("#start-view").classList.add("active");
    return;
  }
  if (view !== "start" && authRole !== view) return;
  document.querySelectorAll(".view-tab, .view").forEach((el) => el.classList.remove("active"));
  const tab = document.querySelector(`.view-tab[data-view="${view}"]`);
  if (tab) tab.classList.add("active");
  document.querySelector(`#${view}-view`).classList.add("active");
}

async function api(path, options = {}) {
  const response = await fetch(path, { headers: { "Content-Type": "application/json", ...(options.headers || {}) }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

async function connectRealtime() {
  try {
    const data = await api("/api/state");
    journey = data.journey;
    serverConnected = true;
    render();
  } catch (error) {
    serverConnected = false;
    render();
    console.warn("CarePath demo server is not available.", error);
    return;
  }

  if (eventSource) eventSource.close();
  eventSource = new EventSource("/api/events");
  eventSource.addEventListener("open", () => { serverConnected = true; render(); });
  eventSource.addEventListener("journey", (event) => {
    try {
      const data = JSON.parse(event.data);
      journey = data.journey;
      pendingAction = false;
      alertAcknowledged = false;
      render();
    } catch (error) { console.warn("Invalid journey event", error); }
  });
  eventSource.addEventListener("reset", (event) => {
    try {
      const data = JSON.parse(event.data);
      journey = data.journey;
      pendingAction = false;
      alertAcknowledged = false;
      render();
    } catch (error) { console.warn("Invalid reset event", error); }
  });
  eventSource.addEventListener("error", () => { serverConnected = false; render(); });
}

async function sendEvent(type, extra = {}) {
  if (!serverConnected || pendingAction) return;
  pendingAction = true;
  render();
  try {
    const data = await api("/api/event", { method: "POST", body: JSON.stringify({ type, ...extra, role: authRole }) });
    journey = data.journey;
  } catch (error) {
    alert(error.message);
  } finally {
    pendingAction = false;
    render();
  }
}

document.querySelector("#patient-role").addEventListener("click", () => setLoginRole("patient"));
document.querySelector("#staff-role").addEventListener("click", () => setLoginRole("staff"));

document.querySelector("#patient-login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const mobile = document.querySelector("#patient-mobile").value.trim();
  const appointment = document.querySelector("#patient-appointment").value.trim().toUpperCase();
  if (mobile !== DEMO_PATIENT.mobile || appointment !== DEMO_PATIENT.appointment) {
    showLoginError("For this synthetic demo, use 9000000000 and DEMO-042.");
    return;
  }
  setAuthRole("patient");
});

document.querySelector("#staff-login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const staffId = document.querySelector("#staff-id").value.trim().toUpperCase();
  const pin = document.querySelector("#staff-pin").value.trim();
  if (staffId !== DEMO_STAFF.id || pin !== DEMO_STAFF.pin) {
    showLoginError("For this synthetic demo, use STAFF-ORTHO and PIN 0420.");
    return;
  }
  setAuthRole("staff");
});

document.querySelector("#patient-action").addEventListener("click", () => {
  if (authRole !== "patient") return;
  sendEvent(EventType.PATIENT_ARRIVED, { description: "Ravi arrived at the hospital" });
});

document.querySelector("#staff-controls").addEventListener("click", (event) => {
  if (authRole !== "staff") return;
  const type = event.target.closest("button")?.dataset.event;
  if (!type) return;
  const extra = type === EventType.ROOM_CHANGED
    ? { room: "204", description: "Consultation room changed from 202 to 204" }
    : type === EventType.CHECKED_IN
      ? { queueAhead: 3, description: "Registration completed — Ravi joined the queue" }
      : {};
  sendEvent(type, extra);
});

document.querySelector("#reset-demo").addEventListener("click", async () => {
  if (authRole !== "staff" || !serverConnected || pendingAction) return;
  pendingAction = true;
  render();
  try {
    const data = await api("/api/reset", { method: "POST", body: JSON.stringify({ role: authRole }) });
    journey = data.journey;
    alertAcknowledged = false;
  } catch (error) {
    alert(error.message);
  } finally {
    pendingAction = false;
    render();
  }
});

document.querySelector("#explain-action").addEventListener("click", () => {
  if (authRole !== "patient") return;
  const detail = document.querySelector("#explanation");
  detail.textContent = explanationForState();
  detail.hidden = !detail.hidden;
});

document.querySelector("#journey-alert").addEventListener("click", (event) => {
  if (event.target.closest("#ack-alert")) {
    alertAcknowledged = true;
    render();
  }
});

document.querySelectorAll(".view-tab").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
document.querySelector("#logout-button").addEventListener("click", logout);

window.addEventListener("online", connectRealtime);
window.addEventListener("offline", () => {
  serverConnected = false;
  if (eventSource) eventSource.close();
  render();
});

setLoginRole("patient");
render();
connectRealtime();
if (authRole) setAuthRole(authRole);
else switchView("start");
