import { EventType, initialJourney, JourneyState, canApplyEvent } from "./state.js";

const AUTH_ROLE_KEY = "carepath:demo-role:v2";
const DEMO_PATIENT = { mobile: "9000000000", appointment: "DEMO-042" };
const DEMO_STAFF = { id: "STAFF-ORTHO", pin: "0420" };

let journey = structuredClone(initialJourney);
let authRole = sessionStorage.getItem(AUTH_ROLE_KEY) || null;
let serverAvailable = false;
let eventStream = null;
let pending = false;
let alertAcknowledged = false;
let showcaseIndex = 0;

const pages = [
  ["Overview", ".hero-block"],
  ["Start", ".start-story"],
  ["Hospital visit", ".hospital-story"],
  ["Any device", ".access-story"],
  ["AI explainer", ".ai-story"],
  ["Scale", ".scale-story"],
  ["Try it", ".try-section"]
];

const stateStep = { APPOINTMENT_CONFIRMED: 0, ARRIVED: 1, WAITING: 2, CALLED: 3, CONSULTATION: 4, COMPLETED: 5 };
const timelineSteps = ["Appointment", "Arrived", "Registered", "Called", "Consultation", "Complete"];

const patientCopy = {
  [JourneyState.APPOINTMENT_CONFIRMED]: ["Appointment confirmed", "You’re seeing Dr. Mehta in Orthopaedics at 10:30 AM. When you reach the hospital, we’ll guide you through the next step.", "Tell us when you arrive", "OPD Block A · Ground Floor", "No queue yet", "Appointment confirmed", "I’m at the hospital →"],
  [JourneyState.ARRIVED]: ["You’re here. Check in first.", "Show your appointment ID at Counter 3. You don’t need to figure out where to go next.", "Register at Counter 3", "OPD Block A · Ground Floor", "No queue yet", "Arrival confirmed", "Waiting for registration"],
  [JourneyState.WAITING]: ["Registration complete", "Your token is {token}. Please stay near Orthopaedics. We’ll update you if anything changes.", "Wait for your token to be called", "Orthopaedics · Room {room}", "{queue} patients ahead", "Registration ✓", "You’re checked in"],
  [JourneyState.CALLED]: ["You’re next", "Token {token}, please go to Room {room} now. Dr. Mehta is ready for you.", "Go to Room {room}", "Orthopaedics · Room {room}", "Please go now", "You’re being seen next", "Proceed to Room {room}"],
  [JourneyState.CONSULTATION]: ["Consultation in progress", "You’re with Dr. Mehta in Room {room}. We’ll mark your journey complete once the visit ends.", "Your visit will be completed shortly", "Orthopaedics · Room {room}", "In consultation", "Consultation underway", "Consultation in progress"],
  [JourneyState.COMPLETED]: ["You’re done for today", "Your Orthopaedics consultation with Dr. Mehta is complete. There are no further steps in this synthetic visit.", "No further steps today", "City Government Hospital", "No wait", "Appointment · Registration · Consultation ✓", "Visit completed"]
};

function fill(text) {
  return text.replaceAll("{room}", journey.room).replaceAll("{token}", journey.visit.token).replaceAll("{queue}", journey.queueAhead === 0 ? "No" : journey.queueAhead ?? "No");
}

function setLoginRole(role) {
  const patient = role === "patient";
  document.querySelector("#patient-role")?.classList.toggle("active", patient);
  document.querySelector("#staff-role")?.classList.toggle("active", !patient);
  document.querySelector("#patient-login-form")?.toggleAttribute("hidden", !patient);
  document.querySelector("#staff-login-form")?.toggleAttribute("hidden", patient);
  const error = document.querySelector("#login-error"); if (error) error.hidden = true;
}

function setAuthRole(role) {
  authRole = role;
  sessionStorage.setItem(AUTH_ROLE_KEY, role);
  document.querySelector("#logout-button").hidden = false;
  document.querySelectorAll(".view-tab").forEach((button) => { button.hidden = button.dataset.view !== role; });
  switchView(role);
}

function logout() {
  authRole = null;
  sessionStorage.removeItem(AUTH_ROLE_KEY);
  document.querySelector("#logout-button").hidden = true;
  document.querySelectorAll(".view-tab").forEach((button) => { button.hidden = true; });
  setLoginRole("patient");
  switchView("start");
}

function switchView(view) {
  if (view !== "start" && !authRole) view = "start";
  if (view !== "start" && authRole !== view) return;
  document.querySelectorAll(".view-tab, .view").forEach((el) => el.classList.remove("active"));
  document.querySelector(`.view-tab[data-view="${view}"]`)?.classList.add("active");
  document.querySelector(`#${view}-view`)?.classList.add("active");
  window.scrollTo({ top: 0, behavior: "instant" });
}

function setupShowcasePages() {
  const showcase = document.querySelector("#start-view");
  if (!showcase) return;
  pages.forEach(([name, selector], index) => {
    const page = showcase.querySelector(selector);
    if (!page) return;
    page.classList.add("showcase-page");
    page.dataset.page = String(index);
    page.dataset.pageName = name;
  });

  const pager = document.createElement("div");
  pager.id = "showcase-pager";
  pager.innerHTML = `<div class="pager-copy"><span id="pager-count">01 / 07</span><strong id="pager-name">Overview</strong></div><div class="pager-steps" aria-label="Journey pages"></div><div class="pager-actions"><button id="pager-back" type="button" aria-label="Previous page">←</button><button id="pager-next" class="pager-next" type="button">Next <span>→</span></button></div>`;
  showcase.appendChild(pager);
  const steps = pager.querySelector(".pager-steps");
  pages.forEach(([name], index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.page = String(index);
    button.title = name;
    button.setAttribute("aria-label", `Go to ${name}`);
    steps.appendChild(button);
    button.addEventListener("click", () => goToShowcasePage(index));
  });
  pager.querySelector("#pager-back").addEventListener("click", () => goToShowcasePage(showcaseIndex - 1));
  pager.querySelector("#pager-next").addEventListener("click", () => goToShowcasePage(showcaseIndex + 1));
  showcase.querySelectorAll("[data-scroll-to]").forEach((button) => button.removeAttribute("data-scroll-to"));
  showcase.querySelector(".hero-button")?.addEventListener("click", () => goToShowcasePage(6));
  renderShowcasePage();
}

function goToShowcasePage(index) {
  showcaseIndex = Math.max(0, Math.min(pages.length - 1, index));
  renderShowcasePage();
}

function renderShowcasePage() {
  const showcase = document.querySelector("#start-view");
  if (!showcase) return;
  showcase.querySelectorAll(".showcase-page").forEach((page) => page.classList.toggle("active-page", Number(page.dataset.page) === showcaseIndex));
  const count = document.querySelector("#pager-count");
  const name = document.querySelector("#pager-name");
  const back = document.querySelector("#pager-back");
  const next = document.querySelector("#pager-next");
  if (count) count.textContent = `${String(showcaseIndex + 1).padStart(2, "0")} / ${String(pages.length).padStart(2, "0")}`;
  if (name) name.textContent = pages[showcaseIndex][0];
  if (back) back.disabled = showcaseIndex === 0;
  if (next) next.innerHTML = showcaseIndex === pages.length - 1 ? `Start journey <span>→</span>` : `Next <span>→</span>`;
  document.querySelectorAll(".pager-steps button").forEach((button) => button.classList.toggle("active", Number(button.dataset.page) === showcaseIndex));
}

async function api(path, options = {}) {
  const response = await fetch(path, { cache: "no-store", headers: { "Content-Type": "application/json", ...(options.headers || {}) }, ...options });
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
    eventStream.addEventListener("journey", (event) => { const data = JSON.parse(event.data); if (data.journey) { journey = data.journey; alertAcknowledged = false; render(); } });
    eventStream.addEventListener("reset", (event) => { const data = JSON.parse(event.data); if (data.journey) { journey = data.journey; alertAcknowledged = false; render(); } });
    eventStream.onerror = () => { serverAvailable = false; render(); };
  } catch { serverAvailable = false; render(); }
}

async function action(type, extra = {}) {
  if (!serverAvailable || pending || !authRole) return;
  pending = true; render();
  try { const data = await api("/api/event", { method: "POST", body: JSON.stringify({ type, ...extra, role: authRole }) }); if (data.journey) journey = data.journey; }
  catch (error) { window.alert(error.message); }
  finally { pending = false; render(); }
}

function renderPatient() {
  const copy = patientCopy[journey.state].map(fill);
  document.querySelector("#status-label").textContent = journey.state.replaceAll("_", " ");
  document.querySelector("#last-updated").textContent = `Updated ${journey.lastUpdated}`;
  document.querySelector("#now-title").textContent = copy[0];
  document.querySelector("#now-body").textContent = copy[1];
  document.querySelector("#next-text").textContent = copy[2];
  document.querySelector("#where-text").textContent = copy[3];
  document.querySelector("#wait-text").textContent = copy[4];
  document.querySelector("#done-text").textContent = copy[5];
  const button = document.querySelector("#patient-action");
  button.textContent = pending ? "Sending update…" : copy[6];
  button.disabled = journey.state !== JourneyState.APPOINTMENT_CONFIRMED || pending || !serverAvailable;
  const latest = journey.events?.at(-1);
  const alert = document.querySelector("#journey-alert");
  const needs = latest?.type === EventType.ROOM_CHANGED || latest?.type === EventType.CALL_PATIENT;
  alert.hidden = !needs || alertAcknowledged;
  if (needs && !alertAcknowledged) {
    const roomChange = latest.type === EventType.ROOM_CHANGED;
    alert.innerHTML = `<div><span class="alert-icon">${roomChange ? "↗" : "!"}</span><div><p class="eyebrow">${roomChange ? "YOUR NEXT STEP CHANGED" : "YOUR TURN"}</p><strong>${roomChange ? `Your consultation is now in Room ${journey.room}` : `Token ${journey.visit.token}, please go to Room ${journey.room}`}</strong><p>${roomChange ? "Keep waiting near Orthopaedics. We’ll let you know when you’re called." : "Please proceed now."}</p></div></div><button id="ack-alert" type="button">Got it</button>`;
  }
  document.querySelector("#timeline").innerHTML = timelineSteps.map((step, i) => `<li class="${i <= stateStep[journey.state] ? "reached" : ""} ${i === stateStep[journey.state] ? "current" : ""}"><span>${i < stateStep[journey.state] ? "✓" : i + 1}</span>${step}</li>`).join("");
}

function control(label, type, enabled) { return `<button class="sim-control" data-event="${type}" type="button" ${enabled ? "" : "disabled"}>${label}<span>${enabled ? "→" : "—"}</span></button>`; }

function renderStaff() {
  document.querySelector("#staff-state").textContent = journey.state.replaceAll("_", " ");
  document.querySelector("#staff-room").textContent = journey.room;
  document.querySelector("#staff-queue").textContent = journey.queueAhead ?? "—";
  document.querySelector("#staff-updated").textContent = journey.lastUpdated;
  document.querySelector("#sms-preview").textContent = journey.state === JourneyState.WAITING ? `CAREPATH: Registration complete. Token ${journey.visit.token}. Orthopaedics, Room ${journey.room}. ${journey.queueAhead} ahead.` : journey.state === JourneyState.CALLED ? `CAREPATH: Your turn. Token ${journey.visit.token}, go to Room ${journey.room} now.` : "CAREPATH: Appointment confirmed. Bring your appointment ID to OPD Block A.";
  const enabled = serverAvailable && !pending;
  document.querySelector("#staff-controls").innerHTML = [
    control("Register / check in patient", EventType.CHECKED_IN, enabled && canApplyEvent(journey, EventType.CHECKED_IN)),
    control("Advance queue", EventType.QUEUE_ADVANCED, enabled && canApplyEvent(journey, EventType.QUEUE_ADVANCED) && journey.queueAhead > 0),
    control("Move consultation room 202 → 204", EventType.ROOM_CHANGED, enabled && canApplyEvent(journey, EventType.ROOM_CHANGED) && journey.room === "202"),
    control("Call patient", EventType.CALL_PATIENT, enabled && canApplyEvent(journey, EventType.CALL_PATIENT)),
    control("Start consultation", EventType.START_CONSULTATION, enabled && canApplyEvent(journey, EventType.START_CONSULTATION)),
    control("Complete consultation", EventType.COMPLETE_CONSULTATION, enabled && canApplyEvent(journey, EventType.COMPLETE_CONSULTATION))
  ].join("");
}

function render() {
  renderPatient(); renderStaff();
  const status = document.querySelector("#connection-status");
  if (status) status.textContent = !navigator.onLine ? "Offline" : serverAvailable ? "Live sync" : "Waiting for sync";
  const logoutButton = document.querySelector("#logout-button");
  if (!authRole) { logoutButton.hidden = true; document.querySelectorAll(".view-tab").forEach((b) => b.hidden = true); }
  else { logoutButton.hidden = false; document.querySelectorAll(".view-tab").forEach((b) => b.hidden = b.dataset.view !== authRole); }
}

function bind() {
  document.querySelector("#patient-role").addEventListener("click", () => setLoginRole("patient"));
  document.querySelector("#staff-role").addEventListener("click", () => setLoginRole("staff"));
  document.querySelector("#patient-login-form").addEventListener("submit", (event) => { event.preventDefault(); const mobile = document.querySelector("#patient-mobile").value.trim(); const appointment = document.querySelector("#patient-appointment").value.trim().toUpperCase(); if (mobile !== DEMO_PATIENT.mobile || appointment !== DEMO_PATIENT.appointment) { const e = document.querySelector("#login-error"); e.textContent = "For this synthetic demo, use 9000000000 and DEMO-042."; e.hidden = false; return; } setAuthRole("patient"); });
  document.querySelector("#staff-login-form").addEventListener("submit", (event) => { event.preventDefault(); const id = document.querySelector("#staff-id").value.trim().toUpperCase(); const pin = document.querySelector("#staff-pin").value.trim(); if (id !== DEMO_STAFF.id || pin !== DEMO_STAFF.pin) { const e = document.querySelector("#login-error"); e.textContent = "For this synthetic demo, use STAFF-ORTHO and PIN 0420."; e.hidden = false; return; } setAuthRole("staff"); });
  document.querySelector("#patient-action").addEventListener("click", () => action(EventType.PATIENT_ARRIVED, { description: "Ravi arrived at the hospital" }));
  document.querySelector("#staff-controls").addEventListener("click", (event) => { if (authRole !== "staff") return; const type = event.target.closest("button")?.dataset.event; if (!type) return; const extra = type === EventType.ROOM_CHANGED ? { room: "204", description: "Consultation room changed from 202 to 204" } : type === EventType.CHECKED_IN ? { queueAhead: 3, description: "Registration completed — Ravi joined the queue" } : type === EventType.QUEUE_ADVANCED ? { description: `Queue advanced — ${Math.max(0, journey.queueAhead - 1)} patient(s) ahead` } : {}; action(type, extra); });
  document.querySelector("#explain-action").addEventListener("click", () => { const detail = document.querySelector("#explanation"); detail.textContent = journey.state === JourneyState.WAITING ? `Your registration is done. Token ${journey.visit.token}; ${journey.queueAhead} people are currently ahead.` : journey.state === JourneyState.CALLED ? `Your token has been called. Go directly to Room ${journey.room}.` : "CarePath turns verified visit updates into one clear next action. It does not provide medical advice."; detail.hidden = !detail.hidden; });
  document.querySelector("#journey-alert").addEventListener("click", (event) => { if (event.target.closest("#ack-alert")) { alertAcknowledged = true; render(); } });
  document.querySelectorAll(".view-tab").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
  document.querySelector("#logout-button").addEventListener("click", logout);
  document.addEventListener("keydown", (event) => { if (!document.querySelector("#start-view").classList.contains("active")) return; if (event.key === "ArrowRight") goToShowcasePage(showcaseIndex + 1); if (event.key === "ArrowLeft") goToShowcasePage(showcaseIndex - 1); });
  window.addEventListener("online", connectToJourneyServer); window.addEventListener("offline", render);
}

setupShowcasePages();
bind();
setLoginRole("patient");
render();
if (authRole) setAuthRole(authRole); else switchView("start");
connectToJourneyServer();
