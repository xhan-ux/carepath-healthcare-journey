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
  [JourneyState.APPOINTMENT_CONFIRMED]: ["Appointment confirmed", "You’re seeing Dr. Mehta in Orthopaedics at 10:30 AM. When you reach the hospital, CarePath will guide you through the next step.", "Tell us when you arrive", "OPD Block A · Ground Floor", "No queue yet", "Appointment confirmed", "I’m at the hospital →"],
  [JourneyState.ARRIVED]: ["You’re here. Check in first.", "Show your appointment ID at Counter 3. You don’t need to figure out where to go next.", "Register at Counter 3", "OPD Block A · Ground Floor", "No queue yet", "Arrival confirmed", "Waiting for registration"],
  [JourneyState.WAITING]: ["Registration complete", "Your token is {token}. Stay near Orthopaedics. We’ll update you if anything changes.", "Wait for your token to be called", "Orthopaedics · Room {room}", "{queue} patients ahead", "Registration ✓", "You’re checked in"],
  [JourneyState.CALLED]: ["You’re next", "Token {token}, please go to Room {room} now. Dr. Mehta is ready for you.", "Go to Room {room}", "Orthopaedics · Room {room}", "Please go now", "You’re being seen next", "Proceed to Room {room}"],
  [JourneyState.CONSULTATION]: ["Consultation in progress", "You’re with Dr. Mehta in Room {room}. We’ll mark the visit complete once it ends.", "Your visit will be completed shortly", "Orthopaedics · Room {room}", "In consultation", "Consultation underway", "Consultation in progress"],
  [JourneyState.COMPLETED]: ["You’re done for today", "Your Orthopaedics consultation with Dr. Mehta is complete. There are no further steps in this synthetic visit.", "No further steps today", "City Government Hospital", "No wait", "Appointment · Registration · Consultation ✓", "Visit completed"]
};

function fill(text) {
  return text.replaceAll("{room}", journey.room).replaceAll("{token}", journey.visit.token).replaceAll("{queue}", journey.queueAhead === 0 ? "No" : journey.queueAhead ?? "No");
}

function injectPrototypeStyles() {
  const style = document.createElement("style");
  style.textContent = `
    html,body{overflow-x:hidden}
    body.cp-routed{background:#f4f8f6!important}
    .cp-route{display:none!important;min-height:calc(100vh - 73px)}
    .cp-route.cp-route-active{display:block!important}
    #start-view.cp-home{display:block!important;height:auto!important;min-height:calc(100vh - 73px)!important;overflow:visible!important;padding:0!important}
    #start-view.cp-home .journey-story,#start-view.cp-home .try-section,#start-view.cp-home .showcase-footer{display:none!important}
    #start-view.cp-home .hero-block{min-height:calc(100vh - 73px)!important;height:calc(100vh - 73px)!important;max-height:820px!important;box-sizing:border-box!important;padding:60px clamp(24px,6vw,96px)!important;display:grid!important;grid-template-columns:minmax(0,1.05fr) minmax(360px,.95fr)!important;align-items:center!important;gap:70px!important}
    #start-view.cp-home .hero-copy h1{font-size:clamp(4.2rem,7.2vw,7.4rem)!important;line-height:.86!important;letter-spacing:-.07em!important;margin:16px 0 28px!important}
    #start-view.cp-home .hero-copy .hero-lede{font-size:20px!important;max-width:650px!important;line-height:1.45!important}
    #start-view.cp-home .hero-actions{margin-top:32px!important;align-items:center!important}
    #start-view.cp-home .hero-button{min-width:290px!important}
    #start-view.cp-home .hero-visual{min-height:480px!important;position:relative!important;display:grid!important;place-items:center!important}
    #start-view.cp-home .journey-ticket{width:min(440px,90%)!important;transform:rotate(2deg)!important;box-shadow:0 30px 80px rgba(16,45,49,.14)!important}
    #start-view.cp-home .journey-ticket:after{content:"ONE JOURNEY · NOW / NEXT";display:block;margin:20px 28px 26px;padding-top:16px;border-top:1px solid #d9e6e4;color:#668084;font-size:11px;font-weight:800;letter-spacing:.08em}
    #showcase-pager{display:none!important}
    .cp-page-shell{max-width:1180px;margin:0 auto;padding:46px 28px 60px}
    .cp-page-head{display:flex;justify-content:space-between;align-items:flex-end;gap:28px;margin-bottom:24px}
    .cp-page-head h1{margin:5px 0 0;font-size:clamp(2.4rem,5vw,4.6rem);line-height:.94;letter-spacing:-.06em}
    .cp-page-head p:last-child{margin:10px 0 0;color:#668084;max-width:680px;line-height:1.5}
    .cp-back{border:1px solid #d9e6e4;background:#fffdf8;color:#16383d;border-radius:12px;padding:11px 15px;font-weight:800;cursor:pointer;white-space:nowrap}
    .cp-login-page{display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:center;min-height:calc(100vh - 73px);box-sizing:border-box;padding:44px clamp(24px,7vw,100px)}
    .cp-login-copy h1{font-size:clamp(3rem,6vw,6rem);line-height:.9;letter-spacing:-.065em;margin:14px 0 24px}
    .cp-login-copy p{font-size:18px;line-height:1.5;color:#668084;max-width:580px}
    .cp-login-card{background:#fffdf8;border:1px solid #d9e6e4;border-radius:26px;padding:28px;box-shadow:0 22px 60px rgba(16,45,49,.09)}
    .cp-login-card h2{margin:0 0 7px;font-size:28px;letter-spacing:-.04em}
    .cp-login-card .role-switch{margin:18px 0 22px}
    .cp-login-card .primary-action{width:100%;margin-top:10px}
    .cp-demo-note{margin:12px 0 0;color:#829497;font-size:12px}
    .cp-patient-route,.cp-staff-route{height:calc(100vh - 73px);min-height:650px;box-sizing:border-box;overflow:hidden}
    #patient-view.cp-patient-route,#staff-view.cp-staff-route{padding-top:0!important}
    .cp-patient-inner{height:100%;max-width:1180px;margin:auto;padding:26px 28px 22px;box-sizing:border-box;display:grid;grid-template-rows:auto 1fr auto;gap:16px}
    .cp-patient-top{display:flex;justify-content:space-between;align-items:end;gap:24px}
    .cp-patient-top h1{margin:4px 0 0;font-size:clamp(2rem,4vw,3.5rem);letter-spacing:-.06em;line-height:.94}
    .cp-patient-top p{margin:7px 0 0;color:#668084}
    .cp-live{display:flex;align-items:center;gap:8px;color:#477176;font-size:12px;font-weight:800}
    .cp-live i{width:8px;height:8px;border-radius:50%;background:#18a579;box-shadow:0 0 0 5px rgba(24,165,121,.1)}
    .cp-patient-main{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(290px,.7fr);gap:16px;min-height:0}
    .cp-now-card{background:#fffdf8;border:1px solid #d9e6e4;border-radius:24px;box-shadow:0 18px 50px rgba(16,45,49,.07);overflow:hidden;display:grid;grid-template-rows:auto 1fr auto}
    .cp-now-status{padding:12px 18px;background:#eef8f5;border-bottom:1px solid #d9e6e4;display:flex;gap:9px;align-items:center;font-size:11px;font-weight:900;letter-spacing:.08em}
    .cp-now-status span:last-child{margin-left:auto;color:#789094;letter-spacing:0;font-weight:600}
    .cp-now-content{padding:24px 28px;display:flex;flex-direction:column;justify-content:center}
    .cp-now-content h2{font-size:clamp(2.3rem,4vw,4.5rem);line-height:.92;letter-spacing:-.065em;margin:7px 0 13px;max-width:800px}
    .cp-now-content>p:last-child{font-size:16px;line-height:1.5;color:#60777a;max-width:760px;margin:0}
    .cp-action-bar{padding:15px 20px;border-top:1px solid #d9e6e4;display:flex;align-items:center;gap:14px}
    .cp-action-bar .primary-action{min-width:220px}
    .cp-simple{border:0;background:transparent;color:#0b6b70;font-weight:800;cursor:pointer}
    .cp-side{display:grid;grid-template-rows:1fr auto;gap:16px;min-height:0}
    .cp-facts{display:grid;grid-template-columns:1fr 1fr;background:#fffdf8;border:1px solid #d9e6e4;border-radius:22px;overflow:hidden}
    .cp-fact{padding:17px;border-bottom:1px solid #d9e6e4}.cp-fact:nth-child(odd){border-right:1px solid #d9e6e4}.cp-fact:nth-last-child(-n+2){border-bottom:0}.cp-fact strong{display:block;margin-top:5px;font-size:14px;line-height:1.3}
    .cp-alert{background:#f7f3ff;border:1px solid #d8c7ff;color:#32226d;border-radius:18px;padding:16px}.cp-alert strong{display:block;margin-top:5px}.cp-alert p{margin:6px 0 0;font-size:12px;line-height:1.4}
    .cp-timeline-wrap{background:rgba(255,253,248,.78);border:1px solid #d9e6e4;border-radius:18px;padding:13px 16px}
    .cp-timeline-wrap .eyebrow{margin:0 0 8px}
    .cp-timeline{display:grid;grid-template-columns:repeat(6,1fr);list-style:none;margin:0;padding:0;gap:4px}
    .cp-timeline li{display:flex;align-items:center;gap:7px;font-size:10px;font-weight:800;color:#8a9a9c;min-width:0}.cp-timeline li:after{content:"";height:2px;flex:1;background:#dbe5e4;margin-left:3px}.cp-timeline li:last-child:after{display:none}.cp-timeline li span{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:#edf2f1;flex:0 0 22px}.cp-timeline li.done{color:#16383d}.cp-timeline li.done span{background:#0b6b70;color:white}.cp-timeline li.current span{box-shadow:0 0 0 5px rgba(11,107,112,.1)}
    .cp-staff-inner{height:100%;max-width:1280px;margin:auto;padding:26px 28px;box-sizing:border-box;display:grid;grid-template-rows:auto 1fr;gap:16px}
    .cp-staff-grid{display:grid;grid-template-columns:330px 1fr;gap:16px;min-height:0}
    .cp-staff-card{background:#fffdf8;border:1px solid #d9e6e4;border-radius:22px;box-shadow:0 14px 35px rgba(16,45,49,.06);padding:20px;min-height:0;overflow:hidden}
    .cp-staff-card h2{margin:5px 0;font-size:28px;letter-spacing:-.05em}.cp-staff-card>p:not(.eyebrow){color:#668084}
    .cp-staff-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:18px 0}.cp-staff-meta div{background:#eef5f2;border-radius:12px;padding:12px}.cp-staff-meta span{display:block;font-size:10px;color:#789094}.cp-staff-meta strong{font-size:18px}
    .cp-controls{display:grid;grid-template-columns:1fr 1fr;gap:9px}.cp-control{min-height:58px;border:1px solid #d9e6e4;border-radius:13px;background:white;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;text-align:left;font-weight:800;color:#16383d;cursor:pointer}.cp-control:disabled{color:#9babad;background:#f5f7f6;cursor:default}.cp-control:not(:disabled):hover{border-color:#9ecac4;background:#f4fbf9}
    .cp-sms{margin-top:14px;background:#103f43;color:#effffc;border-radius:15px;padding:14px;font-size:12px;line-height:1.45}.cp-reset{margin-top:12px;border:0;background:transparent;color:#0b6b70;text-decoration:underline;font-weight:800;cursor:pointer}
    @media(max-width:900px){#start-view.cp-home .hero-block{grid-template-columns:1fr;gap:10px;min-height:calc(100vh - 73px);height:auto;padding-top:45px!important}.cp-login-page{grid-template-columns:1fr;padding:35px 22px}.cp-patient-route,.cp-staff-route{height:auto;min-height:calc(100vh - 73px);overflow:visible}.cp-patient-inner,.cp-staff-inner{height:auto}.cp-patient-main{grid-template-columns:1fr}.cp-side{grid-template-columns:1fr 1fr;grid-template-rows:1fr}.cp-timeline{grid-template-columns:repeat(3,1fr);row-gap:8px}.cp-staff-grid{grid-template-columns:1fr}.cp-controls{grid-template-columns:1fr}}
    @media(max-width:620px){#start-view.cp-home .hero-block{padding:34px 18px!important}.cp-page-shell{padding:30px 18px}.cp-login-page{padding:28px 18px}.cp-login-copy h1{font-size:3.3rem}.cp-patient-inner,.cp-staff-inner{padding:18px 14px}.cp-patient-top{display:block}.cp-now-content{padding:22px 19px}.cp-now-content h2{font-size:2.55rem}.cp-side{grid-template-columns:1fr}.cp-action-bar{flex-wrap:wrap}.cp-action-bar .primary-action{width:100%}.cp-timeline{grid-template-columns:1fr 1fr}.cp-staff-grid{gap:12px}}
  `;
  document.head.appendChild(style);
}

function ensureRoutes() {
  const start = document.querySelector("#start-view");
  const trySection = document.querySelector("#try-prototype");
  if (!start || !trySection) return;

  start.classList.add("cp-home");
  trySection.classList.add("cp-route");
  document.body.classList.add("cp-routed");

  const loginRoute = document.createElement("section");
  loginRoute.id = "login-route";
  loginRoute.className = "cp-route";
  loginRoute.innerHTML = `<div class="cp-login-page"><div class="cp-login-copy"><p class="eyebrow">CAREPATH · WORKING PROTOTYPE</p><h1>One visit.<br><em>One clear next step.</em></h1><p>This is the actual patient journey, not a presentation. Sign in to enter the synthetic visit and follow the same state that the hospital staff simulator updates.</p><button class="cp-back" data-route="#home">← Back to CarePath</button></div><div class="cp-login-card"></div></div>`;
  document.body.insertBefore(loginRoute, document.querySelector("#patient-view"));
  loginRoute.querySelector(".cp-login-card").appendChild(trySection);

  const patient = document.querySelector("#patient-view");
  const staff = document.querySelector("#staff-view");
  patient.classList.add("cp-patient-route");
  staff.classList.add("cp-staff-route");
  patient.innerHTML = `<div class="cp-patient-inner"><div class="cp-patient-top"><div><p class="eyebrow">TODAY’S VISIT</p><h1>Good morning, Ravi.</h1><p>City Government Hospital · Orthopaedics · Dr. Mehta</p></div><div class="cp-live"><i></i><span id="connection-status">Waiting for sync</span></div></div><div class="cp-patient-main"><article class="cp-now-card"><div class="cp-now-status"><span id="status-label">APPOINTMENT CONFIRMED</span><span id="last-updated">Updated 10:12 AM</span></div><div class="cp-now-content"><p class="eyebrow">NOW</p><h2 id="now-title">Appointment confirmed</h2><p id="now-body">You’re seeing Dr. Mehta in Orthopaedics at 10:30 AM.</p></div><div class="cp-action-bar"><button id="patient-action" class="primary-action" type="button">I’m at the hospital →</button><button id="explain-action" class="cp-simple" type="button">✦ Explain this simply</button></div><p id="explanation" class="explanation" hidden></p></article><aside class="cp-side"><div class="cp-facts"><div class="cp-fact"><p class="eyebrow">NEXT</p><strong id="next-text">Tell us when you arrive</strong></div><div class="cp-fact"><p class="eyebrow">WHERE</p><strong id="where-text">OPD Block A · Ground Floor</strong></div><div class="cp-fact"><p class="eyebrow">WAIT</p><strong id="wait-text">No queue yet</strong></div><div class="cp-fact"><p class="eyebrow">DONE</p><strong id="done-text">Appointment confirmed</strong></div></div><div id="journey-alert" class="cp-alert" hidden></div></aside></div><div class="cp-timeline-wrap"><p class="eyebrow">YOUR JOURNEY</p><ol id="timeline" class="cp-timeline"></ol></div></div>`;

  staff.innerHTML = `<div class="cp-staff-inner"><div class="cp-page-head"><div><p class="eyebrow">CITY GOVERNMENT HOSPITAL · SYNTHETIC OPERATIONS</p><h1>Orthopaedics desk</h1><p>Move Ravi’s journey forward. The patient view updates through the same shared journey state.</p></div><button class="cp-back" data-route="#patient">Patient view →</button></div><div class="cp-staff-grid"><article class="cp-staff-card"><p class="eyebrow">PATIENT</p><h2>Ravi Kumar</h2><p>DEMO-042 · Dr. Mehta</p><span class="state-pill" id="staff-state">APPOINTMENT CONFIRMED</span><div class="cp-staff-meta"><div><span>ROOM</span><strong id="staff-room">202</strong></div><div><span>QUEUE AHEAD</span><strong id="staff-queue">—</strong></div><div><span>LAST UPDATE</span><strong id="staff-updated">10:12 AM</strong></div><div><span>DEVICE</span><strong>LIVE</strong></div></div><p class="eyebrow">THE SHARED MODEL</p><p style="line-height:1.5">Staff changes the verified event. CarePath turns it into the patient’s next action.</p></article><article class="cp-staff-card"><p class="eyebrow">SIMULATE AN EVENT</p><h2>Patient flow</h2><div id="staff-controls" class="cp-controls"></div><div class="cp-sms"><p class="eyebrow">SMS FALLBACK PREVIEW</p><p id="sms-preview">CAREPATH: Appointment confirmed.</p></div><button id="reset-demo" class="cp-reset" type="button">Reset synthetic journey</button></article></div></div>`;

  // The old presentation sections remain in the source for reference, but are never shown as slides.
  start.querySelectorAll(".journey-story,.try-section,.showcase-footer").forEach((el) => el.setAttribute("aria-hidden", "true"));
}

function setLoginRole(role) {
  const patient = role === "patient";
  document.querySelector("#patient-role")?.classList.toggle("active", patient);
  document.querySelector("#staff-role")?.classList.toggle("active", !patient);
  document.querySelector("#patient-login-form")?.toggleAttribute("hidden", !patient);
  document.querySelector("#staff-login-form")?.toggleAttribute("hidden", patient);
  document.querySelector("#patient-role")?.setAttribute("aria-selected", String(patient));
  document.querySelector("#staff-role")?.setAttribute("aria-selected", String(!patient));
  const error = document.querySelector("#login-error");
  if (error) error.hidden = true;
}

function setAuthRole(role) {
  authRole = role;
  sessionStorage.setItem(AUTH_ROLE_KEY, role);
  document.querySelector("#logout-button").hidden = false;
  document.querySelectorAll(".view-tab").forEach((button) => { button.hidden = button.dataset.view !== role; });
  goRoute(role === "patient" ? "#patient" : "#staff");
}

function logout() {
  authRole = null;
  sessionStorage.removeItem(AUTH_ROLE_KEY);
  document.querySelector("#logout-button").hidden = true;
  document.querySelectorAll(".view-tab").forEach((b) => { b.hidden = true; });
  setLoginRole("patient");
  goRoute("#home");
}

function goRoute(route) {
  const target = route || "#home";
  if ((target === "#patient" || target === "#staff") && !authRole) {
    location.hash = "#login";
    return;
  }
  if (target === "#staff" && authRole !== "staff") return;
  if (target === "#patient" && authRole !== "patient") return;
  document.querySelectorAll(".cp-route,.view").forEach((el) => el.classList.remove("cp-route-active","active"));
  if (target === "#home") document.querySelector("#start-view")?.classList.add("active");
  if (target === "#login") document.querySelector("#login-route")?.classList.add("cp-route-active");
  if (target === "#patient") document.querySelector("#patient-view")?.classList.add("cp-route-active");
  if (target === "#staff") document.querySelector("#staff-view")?.classList.add("cp-route-active");
  if (target === "#login") setLoginRole("patient");
  document.querySelectorAll(".view-tab").forEach((button) => button.classList.toggle("active", button.dataset.view === target.slice(1)));
  window.scrollTo(0, 0);
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
  try {
    const data = await api("/api/event", { method: "POST", body: JSON.stringify({ type, ...extra, role: authRole }) });
    if (data.journey) journey = data.journey;
  } catch (error) { window.alert(error.message); }
  finally { pending = false; render(); }
}

async function resetJourney() {
  if (!serverAvailable || pending || !authRole) return;
  pending = true;
  try {
    const data = await api("/api/reset", { method: "POST", body: JSON.stringify({ role: authRole }) });
    if (data.journey) journey = data.journey;
  } catch (error) { window.alert(error.message); }
  finally { pending = false; render(); }
}

function renderPatient() {
  const copy = patientCopy[journey.state].map(fill);
  const q = document.querySelector.bind(document);
  q("#status-label").textContent = journey.state.replaceAll("_", " ");
  q("#last-updated").textContent = `Updated ${journey.lastUpdated}`;
  q("#now-title").textContent = copy[0];
  q("#now-body").textContent = copy[1];
  q("#next-text").textContent = copy[2];
  q("#where-text").textContent = copy[3];
  q("#wait-text").textContent = copy[4];
  q("#done-text").textContent = copy[5];
  const button = q("#patient-action");
  button.textContent = pending ? "Updating…" : copy[6];
  button.disabled = journey.state !== JourneyState.APPOINTMENT_CONFIRMED || pending || !serverAvailable;
  const latest = journey.events?.at(-1);
  const alert = q("#journey-alert");
  const needs = latest?.type === EventType.ROOM_CHANGED || latest?.type === EventType.CALL_PATIENT;
  alert.hidden = !needs || alertAcknowledged;
  if (needs && !alertAcknowledged) {
    const roomChange = latest.type === EventType.ROOM_CHANGED;
    alert.innerHTML = `<strong>${roomChange ? `Your next step changed · Room ${journey.room}` : `Your turn · Token ${journey.visit.token}`}</strong><p>${roomChange ? "Your consultation room changed. Keep following the live journey." : `Please go to Room ${journey.room} now.`}</p><button id="ack-alert" type="button">Got it</button>`;
  }
  q("#timeline").innerHTML = timelineSteps.map((step, i) => `<li class="${i <= stateStep[journey.state] ? "done" : ""} ${i === stateStep[journey.state] ? "current" : ""}"><span>${i < stateStep[journey.state] ? "✓" : i + 1}</span>${step}</li>`).join("");
  const status = q("#connection-status");
  status.textContent = !navigator.onLine ? "Offline" : serverAvailable ? "Live sync" : "Waiting for sync";
}

function control(label, type, enabled) {
  return `<button class="cp-control" data-event="${type}" type="button" ${enabled ? "" : "disabled"}>${label}<span>${enabled ? "→" : "—"}</span></button>`;
}

function renderStaff() {
  const q = document.querySelector.bind(document);
  q("#staff-state").textContent = journey.state.replaceAll("_", " ");
  q("#staff-room").textContent = journey.room;
  q("#staff-queue").textContent = journey.queueAhead ?? "—";
  q("#staff-updated").textContent = journey.lastUpdated;
  q("#sms-preview").textContent = journey.state === JourneyState.WAITING ? `CAREPATH: Registration complete. Token ${journey.visit.token}. Orthopaedics, Room ${journey.room}. ${journey.queueAhead} ahead.` : journey.state === JourneyState.CALLED ? `CAREPATH: Your turn. Token ${journey.visit.token}. Go to Room ${journey.room} now.` : journey.state === JourneyState.COMPLETED ? "CAREPATH: Your Orthopaedics visit is complete. Thank you." : "CAREPATH: Appointment confirmed. Bring your appointment ID to OPD Block A.";
  const enabled = serverAvailable && !pending;
  q("#staff-controls").innerHTML = [
    control("Register / check in patient", EventType.CHECKED_IN, enabled && canApplyEvent(journey, EventType.CHECKED_IN)),
    control("Advance queue", EventType.QUEUE_ADVANCED, enabled && canApplyEvent(journey, EventType.QUEUE_ADVANCED) && journey.queueAhead > 0),
    control("Move consultation room 202 → 204", EventType.ROOM_CHANGED, enabled && canApplyEvent(journey, EventType.ROOM_CHANGED) && journey.room === "202"),
    control("Call patient", EventType.CALL_PATIENT, enabled && canApplyEvent(journey, EventType.CALL_PATIENT)),
    control("Start consultation", EventType.START_CONSULTATION, enabled && canApplyEvent(journey, EventType.START_CONSULTATION)),
    control("Complete consultation", EventType.COMPLETE_CONSULTATION, enabled && canApplyEvent(journey, EventType.COMPLETE_CONSULTATION))
  ].join("");
}

function render() {
  renderPatient();
  renderStaff();
  const logoutButton = document.querySelector("#logout-button");
  if (!authRole) { logoutButton.hidden = true; document.querySelectorAll(".view-tab").forEach((b) => b.hidden = true); }
  else { logoutButton.hidden = false; document.querySelectorAll(".view-tab").forEach((b) => b.hidden = b.dataset.view !== authRole); }
}

function bind() {
  document.addEventListener("click", (event) => {
    const route = event.target.closest("[data-route]")?.dataset.route;
    if (route) { event.preventDefault(); location.hash = route; return; }
  });
  document.querySelector("#patient-role")?.addEventListener("click", () => setLoginRole("patient"));
  document.querySelector("#staff-role")?.addEventListener("click", () => setLoginRole("staff"));
  document.querySelector("#patient-login-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const mobile = document.querySelector("#patient-mobile").value.trim();
    const appointment = document.querySelector("#patient-appointment").value.trim().toUpperCase();
    if (mobile !== DEMO_PATIENT.mobile || appointment !== DEMO_PATIENT.appointment) { const e = document.querySelector("#login-error"); e.textContent = "For this synthetic demo, use 9000000000 and DEMO-042."; e.hidden = false; return; }
    setAuthRole("patient");
  });
  document.querySelector("#staff-login-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const id = document.querySelector("#staff-id").value.trim().toUpperCase();
    const pin = document.querySelector("#staff-pin").value.trim();
    if (id !== DEMO_STAFF.id || pin !== DEMO_STAFF.pin) { const e = document.querySelector("#login-error"); e.textContent = "For this synthetic demo, use STAFF-ORTHO and PIN 0420."; e.hidden = false; return; }
    setAuthRole("staff");
  });
  document.querySelector("#patient-action")?.addEventListener("click", () => action(EventType.PATIENT_ARRIVED, { description: "Ravi arrived at the hospital" }));
  document.querySelector("#staff-controls")?.addEventListener("click", (event) => {
    if (authRole !== "staff") return;
    const type = event.target.closest("button")?.dataset.event;
    if (!type) return;
    const extra = type === EventType.ROOM_CHANGED ? { room: "204", description: "Consultation room changed from 202 to 204" } : type === EventType.CHECKED_IN ? { queueAhead: 3, description: "Registration completed — Ravi joined the queue" } : type === EventType.QUEUE_ADVANCED ? { description: `Queue advanced — ${Math.max(0, journey.queueAhead - 1)} patient(s) ahead` } : {};
    action(type, extra);
  });
  document.querySelector("#reset-demo")?.addEventListener("click", resetJourney);
  document.querySelector("#explain-action")?.addEventListener("click", () => {
    const detail = document.querySelector("#explanation");
    detail.textContent = journey.state === JourneyState.WAITING ? `Your registration is complete. Token ${journey.visit.token}; ${journey.queueAhead} people are ahead.` : journey.state === JourneyState.CALLED ? `Your token has been called. Go directly to Room ${journey.room}.` : "CarePath turns verified visit updates into one clear next action. It does not provide medical advice.";
    detail.hidden = !detail.hidden;
  });
  document.querySelector("#journey-alert")?.addEventListener("click", (event) => { if (event.target.closest("#ack-alert")) { alertAcknowledged = true; render(); } });
  document.querySelectorAll(".view-tab").forEach((button) => button.addEventListener("click", () => { location.hash = `#${button.dataset.view}`; }));
  document.querySelector("#logout-button")?.addEventListener("click", logout);
  window.addEventListener("hashchange", () => goRoute(location.hash));
  window.addEventListener("online", connectToJourneyServer);
  window.addEventListener("offline", render);
}

injectPrototypeStyles();
ensureRoutes();
setLoginRole("patient");
bind();
render();
if (authRole) setAuthRole(authRole); else goRoute(location.hash || "#home");
connectToJourneyServer();
