import { EventType, initialJourney, JourneyState, canApplyEvent, applyEvent } from "./state.js";

const PATIENT = { mobile: "9000000000", appointment: "DEMO-042" };
const STAFF = { id: "STAFF-ORTHO", pin: "0420" };
const AUTH_KEY = "carepath:role:v5";
const steps = [
  [JourneyState.APPOINTMENT_CONFIRMED, "Appointment"],
  [JourneyState.ARRIVED, "Arrive"],
  [JourneyState.WAITING, "Registration"],
  [JourneyState.CALLED, "Called"],
  [JourneyState.CONSULTATION, "Consultation"],
  [JourneyState.LAB, "Lab"],
  [JourneyState.PHARMACY, "Pharmacy"],
  [JourneyState.COMPLETED, "Complete"]
];

let journey = structuredClone(initialJourney);
let authRole = sessionStorage.getItem(AUTH_KEY);
let serverAvailable = false;
let eventStream = null;
let pending = false;
let explanationOpen = false;

const app = document.querySelector("#app");
const toast = document.querySelector("#toast");

function route() {
  return location.hash.replace(/^#\/?/, "") || "services";
}
function go(path) { location.hash = `/${path}`; }
function esc(value) { return String(value).replace(/[&<>\"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
function notify(message) { toast.textContent = message; toast.hidden = false; clearTimeout(notify.timer); notify.timer = setTimeout(() => { toast.hidden = true; }, 2600); }
function stateIndex() { return Math.max(0, steps.findIndex(([state]) => state === journey.state)); }
function statePath() { return journey.state.toLowerCase().replaceAll("_", "-"); }
function stateLabel() { return journey.state.replaceAll("_", " "); }
function syncRouteToState() { go(`healthcare/visit/${statePath()}`); }

function header({ back = "services", title = "CarePath" } = {}) {
  return `<header class="topbar"><a class="brand" href="#/${back}"><span class="brand-mark">+</span>${title}</a><span class="prototype-chip">SYNTHETIC PUBLIC-SERVICE PROTOTYPE</span><div class="top-actions">${authRole ? `<span class="role-chip">${authRole === "staff" ? "Staff simulator" : "Patient journey"}</span><button class="ghost-button" data-action="logout">Log out</button>` : `<button class="icon-button" aria-label="Back to services" data-action="home">⌂</button>`}</div></header>`;
}

function servicesPage() {
  return `${header({ title: "CarePath" })}<main class="page services-page"><section class="service-hero"><div><p class="eyebrow">PUBLIC SERVICE JOURNEY LAYER</p><h1>One journey.<br><em>Any service.</em></h1><p>CarePath helps people understand which official service to use, what to prepare, and what to do next — without replacing the government system.</p></div><div class="hero-note"><span>01</span><strong>Start with what you need.</strong><p>Choose a service and CarePath will guide the journey in plain language.</p></div></section><section class="service-grid" aria-label="Public services">
    ${serviceCard("healthcare", "Healthcare", "Appointments, hospital visits and tests", "I need to see a doctor", "Working prototype")}
    ${serviceCard("pension", "Pension", "Understand eligibility and application steps", "I need help with my pension", "Journey design")}
    ${serviceCard("certificate", "Certificates", "Know which certificate service to use", "I need a certificate", "Journey design")}
    ${serviceCard("grievance", "Grievances", "Understand how to report a public-service problem", "I want to report a problem", "Journey design")}
  </section><div class="principles"><div><b>01</b><span>Find the right service</span></div><div><b>02</b><span>Understand the official process</span></div><div><b>03</b><span>Know your next step</span></div><div><b>04</b><span>Any device, low connectivity</span></div></div></main>`;
}
function serviceCard(id, title, body, cta, badge) {
  const disabled = id !== "healthcare" ? "service-card-disabled" : "";
  return `<button class="service-card ${disabled}" data-service="${id}" type="button"><div class="service-icon">${id === "healthcare" ? "✚" : id === "pension" ? "₹" : id === "certificate" ? "▤" : "!"}</div><div><p class="service-badge">${badge}</p><h2>${title}</h2><p>${body}</p></div><span class="service-cta">${cta}<b>→</b></span></button>`;
}

function healthcareStart() {
  return `${header()}<main class="page split-page"><section class="split-copy"><p class="eyebrow">HEALTHCARE · START</p><h1>What do you<br><em>need today?</em></h1><p>Tell CarePath what you are trying to do. We will explain the official service and keep the next step simple.</p><div class="notice"><b>CarePath is not the hospital.</b><span>We explain the route to the official service and verified visit updates.</span></div></section><section class="choice-panel"><div class="panel-kicker">HOW CAN WE HELP?</div>${choice("doctor", "I need to see a doctor", "OPD / Appointment", true)}${choice("appointment", "I already have an appointment", "Track my visit", true)}${choice("test", "I need a test / lab", "Lab / Diagnostics", true)}${choice("referral", "I have a referral", "From another doctor", true)}${choice("unsure", "I’m not sure where to start", "Help me understand", true)}<p class="panel-foot">Choose any option. This prototype follows the healthcare path from start to next step.</p></section></main>`;
}
function choice(id, title, meta, working) { return `<button class="choice-row" data-choice="${id}" type="button"><span class="choice-number">${id === "doctor" ? "01" : id === "appointment" ? "02" : id === "test" ? "03" : id === "referral" ? "04" : "05"}</span><span><b>${title}</b><small>${meta}</small></span><span class="choice-arrow">${working ? "→" : ""}</span></button>`; }

function understandPage() {
  return `${header({ back: "healthcare" })}<main class="page split-page"><section class="split-copy"><p class="eyebrow">HEALTHCARE · UNDERSTAND</p><h1>We understand<br><em>what you need.</em></h1><p>Answer two quick questions. You do not need to know the name of the government service before you start.</p><div class="journey-mini"><span class="active">1</span><i></i><span class="active">2</span><i></i><span>3</span><i></i><span>4</span></div></section><section class="question-panel"><div class="question"><p class="eyebrow">QUESTION 01</p><h2>Do you already have an appointment?</h2><div class="segmented"><button data-answer="appointment-no" class="selected">No</button><button data-answer="appointment-yes">Yes</button></div></div><div class="question"><p class="eyebrow">QUESTION 02</p><h2>Which city or area?</h2><label class="input-wrap"><span>City / area</span><input id="city" value="Bengaluru" /></label></div><button class="primary-button" data-action="understand-next">Continue <span>→</span></button><p class="panel-foot">Your answers only shape this synthetic demonstration.</p></section></main>`;
}

function officialPage() {
  return `${header({ back: "healthcare" })}<main class="page split-page"><section class="split-copy"><p class="eyebrow">HEALTHCARE · OFFICIAL SERVICE</p><h1>We found the<br><em>right service.</em></h1><p>For an OPD appointment, the official service is the government Online Registration System. CarePath explains what to do and then gets out of the way.</p><div class="source-card"><span>OFFICIAL SERVICE</span><strong>Online OPD Appointment</strong><small>Used by this hospital · National Health Authority</small></div></section><section class="process-panel"><div class="process-top"><span class="service-icon">ORS</span><div><b>Online Registration System</b><small>Official service for hospital appointments</small></div></div>${["Verify mobile number","Select hospital","Select department","Choose available date & time","Confirm appointment"].map((x,i)=>`<div class="process-row"><span>${i+1}</span><div><b>${x}</b><small>${i===0?"You get an OTP":i===1?"Choose your hospital":i===2?"Choose the department":i===3?"Pick an available slot":"Save your confirmation"}</small></div></div>`).join("")}<button class="primary-button" data-action="official-next">Continue to appointment confirmation <span>→</span></button><p class="panel-foot">This is a guided prototype. The official service remains the source of truth.</p></section></main>`;
}

function confirmationPage() {
  return `${header({ back: "healthcare" })}<main class="page confirmation-page"><div class="confirmation-head"><p class="eyebrow">HEALTHCARE · APPOINTMENT SAVED</p><h1>Your appointment<br><em>is ready.</em></h1><p>Keep this confirmation. When you reach the hospital, CarePath can guide the rest of the visit.</p></div><article class="confirmation-card"><div class="confirmed-mark">✓</div><div><p class="eyebrow">APPOINTMENT CONFIRMED</p><h2>City Government Hospital</h2><p>Orthopaedics · Dr. Mehta</p></div><dl><div><dt>DATE</dt><dd>22 Aug 2026</dd></div><div><dt>TIME</dt><dd>10:30 AM</dd></div><div><dt>APPOINTMENT ID</dt><dd>DEMO-042</dd></div></dl><div class="confirmation-next"><span>NEXT</span><strong>Save this confirmation, then track your visit.</strong></div><button class="primary-button" data-action="open-visit">Track my hospital visit <span>→</span></button></article></main>`;
}

function loginPage() {
  return `${header({ back: "healthcare" })}<main class="page split-page login-page"><section class="split-copy"><p class="eyebrow">YOUR HOSPITAL VISIT</p><h1>Let’s find<br><em>your visit.</em></h1><p>Enter the details from your appointment confirmation. The credentials below are synthetic so you can experience the journey like a patient.</p><button class="secondary-button" data-action="healthcare-back">← Back to healthcare</button></section><section class="login-card"><div class="role-tabs"><button class="active" data-login-role="patient">Patient</button><button data-login-role="staff">Staff</button></div><form id="patient-form"><label>Mobile number<input id="patient-mobile" value="9000000000" inputmode="numeric" required></label><label>Appointment ID<input id="patient-id" value="DEMO-042" required></label><button class="primary-button" type="submit">Open my visit <span>→</span></button><small>Demo: 9000000000 · DEMO-042</small></form><form id="staff-form" hidden><label>Staff ID<input id="staff-id" value="STAFF-ORTHO" required></label><label>PIN<input id="staff-pin" value="0420" type="password" required></label><button class="primary-button" type="submit">Open staff simulator <span>→</span></button><small>Demo: STAFF-ORTHO · 0420</small></form><p id="login-error" class="error" hidden></p></section></main>`;
}

const copy = {
  [JourneyState.APPOINTMENT_CONFIRMED]: { status:"Appointment confirmed", title:"Your appointment is ready.", body:"You’re seeing Dr. Mehta in Orthopaedics at 10:30 AM. When you reach the hospital, we’ll guide you through the next step.", next:"Arrive at the hospital", where:"OPD Block A · Ground Floor", wait:"No queue yet", action:"I’m at the hospital" },
  [JourneyState.ARRIVED]: { status:"You’re at the hospital", title:"Check in first.", body:"Show your appointment ID at Counter 3. You do not need to figure out the rest of the visit yet.", next:"Register at Counter 3", where:"OPD Block A · Ground Floor", wait:"Registration", action:"Waiting for registration" },
  [JourneyState.WAITING]: { status:"Registration complete", title:"You’re checked in.", body:"Your registration is complete. Stay near Orthopaedics and we’ll tell you when the next step changes.", next:"Wait for your turn", where:"Room {room}", wait:"{queue} ahead", action:"Waiting for my turn" },
  [JourneyState.CALLED]: { status:"Your turn", title:"Go to Room {room}.", body:"Your token has been called. Head to the room now; this is the only thing you need to do next.", next:"Go to Room {room}", where:"Orthopaedics · Room {room}", wait:"Called", action:"I’m on my way" },
  [JourneyState.CONSULTATION]: { status:"Consultation in progress", title:"You’re with Dr. Mehta.", body:"Your consultation is in progress. After the consultation, CarePath will show the next official visit step.", next:"Complete consultation", where:"Room {room}", wait:"In consultation", action:"Consultation in progress" },
  [JourneyState.LAB]: { status:"Lab next", title:"Go to the lab.", body:"Your consultation is complete. Follow the hospital instruction to the lab before going to pharmacy.", next:"Complete the lab step", where:"Lab · Ground Floor", wait:"No queue shown", action:"Lab step pending" },
  [JourneyState.PHARMACY]: { status:"Pharmacy next", title:"Collect your medicines.", body:"Your lab step is complete. Go to the pharmacy counter and collect the medicines listed by the hospital.", next:"Complete pharmacy", where:"Pharmacy · OPD Block B", wait:"No queue shown", action:"Pharmacy step pending" },
  [JourneyState.COMPLETED]: { status:"Visit complete", title:"You’re done for today.", body:"Your synthetic healthcare journey is complete. Save the visit summary or start another journey.", next:"No further steps", where:"City Government Hospital", wait:"No wait", action:"Visit complete" }
};
function fill(text) { return text.replaceAll("{room}", journey.room).replaceAll("{queue}", journey.queueAhead === null ? "No" : journey.queueAhead === 0 ? "No one" : journey.queueAhead); }

function visitPage() {
  const c = copy[journey.state];
  const idx = stateIndex();
  const latest = journey.events.at(-1);
  const alert = latest?.type === EventType.ROOM_CHANGED ? `<div class="journey-alert"><b>Your next step changed</b><p>Your consultation is now in Room ${esc(journey.room)}.</p><button data-action="dismiss">Got it</button></div>` : latest?.type === EventType.CALL_PATIENT ? `<div class="journey-alert"><b>It’s your turn</b><p>Token ${esc(journey.visit.token)}. Go to Room ${esc(journey.room)} now.</p><button data-action="dismiss">I’m on my way</button></div>` : "";
  const actionDisabled = [JourneyState.APPOINTMENT_CONFIRMED].includes(journey.state) === false || pending;
  return `${header({ back: "healthcare" })}<main class="page visit-page"><div class="visit-head"><div><p class="eyebrow">TODAY’S VISIT · ${serverAvailable ? "LIVE SYNC" : "LOCAL DEMO"}</p><h1>Good morning, Ravi.</h1><p>City Government Hospital · Orthopaedics · Dr. Mehta</p></div><div class="live-pill"><i></i>${stateLabel()}</div></div><article class="visit-card"><div class="visit-status"><span><i></i>${esc(c.status)}</span><small>Updated ${esc(journey.lastUpdated)}</small></div><div class="visit-main"><p class="eyebrow">NOW</p><h2>${fill(c.title)}</h2><p>${fill(c.body)}</p></div>${alert}<div class="visit-info"><div><span>NEXT</span><b>${fill(c.next)}</b></div><div><span>WHERE</span><b>${fill(c.where)}</b></div><div class="soft"><span>WAIT</span><b>${fill(c.wait)}</b></div><div class="done"><span>DONE</span><b>${esc(idx === 0 ? "Appointment confirmed" : idx < 5 ? "Visit in progress" : "Visit complete")}</b></div></div><button class="primary-button visit-action" ${actionDisabled ? "disabled" : ""} data-action="patient-arrive">${pending ? "Updating…" : c.action}<span>→</span></button><button class="text-button" data-action="explain">✦ Explain this simply</button>${explanationOpen ? `<div class="explanation">${explainText()}</div>` : ""}<p class="fine-print">Appointment ID: DEMO-042 · Synthetic information for a prototype.</p></article><section class="journey-progress"><div class="progress-head"><p class="eyebrow">YOUR JOURNEY</p><span>${idx + 1} / ${steps.length}</span></div><ol>${steps.map(([state,label],i)=>`<li class="${i<=idx?"reached":""} ${i===idx?"current":""}"><span>${i<idx?"✓":i+1}</span><b>${label}</b></li>`).join("")}</ol></section></main>`;
}
function explainText() {
  if (journey.state === JourneyState.WAITING) return `Registration is complete. Your token is ${journey.visit.token}; the number of people ahead is only contextual. CarePath will tell you what to do when the hospital updates your visit.`;
  if (journey.state === JourneyState.CALLED) return `Your turn has been called. Go directly to Room ${journey.room}. You do not need to manage a queue yourself.`;
  if (journey.state === JourneyState.LAB) return "The consultation is complete. The next hospital step shown here is the lab. CarePath is explaining the route, not making a clinical decision.";
  if (journey.state === JourneyState.PHARMACY) return "The lab step is complete. Go to the pharmacy to collect medicines. Follow the hospital’s instructions for what was prescribed.";
  return "CarePath turns verified visit updates into one clear next action. It does not diagnose, prescribe, or replace the official service.";
}

function staffPage() {
  const controls = [
    ["Register patient", EventType.CHECKED_IN, journey.state===JourneyState.ARRIVED, {queueAhead:3,description:"Registration completed — Ravi is checked in"}],
    ["Advance contextual wait", EventType.QUEUE_ADVANCED, journey.state===JourneyState.WAITING && journey.queueAhead>0, {description:`Queue advanced — ${Math.max(0,(journey.queueAhead??1)-1)} ahead`}],
    ["Update room · 202 → 204", EventType.ROOM_CHANGED, [JourneyState.ARRIVED,JourneyState.WAITING,JourneyState.CALLED].includes(journey.state) && journey.room==="202", {room:"204",description:"Consultation room changed from 202 to 204"}],
    ["Call patient", EventType.CALL_PATIENT, journey.state===JourneyState.WAITING && journey.queueAhead===0, {description:"Token 42 called — go to Room 204"}],
    ["Start consultation", EventType.START_CONSULTATION, journey.state===JourneyState.CALLED, {description:"Consultation started in Room 204"}],
    ["Complete consultation", EventType.COMPLETE_CONSULTATION, journey.state===JourneyState.CONSULTATION, {description:"Consultation complete — lab is next"}],
    ["Mark lab complete", EventType.COMPLETE_LAB, journey.state===JourneyState.LAB, {description:"Lab complete — pharmacy is next"}],
    ["Mark pharmacy complete", EventType.COMPLETE_PHARMACY, journey.state===JourneyState.PHARMACY, {description:"Pharmacy complete — visit finished"}]
  ];
  return `${header({ back: "healthcare/visit" })}<main class="page staff-page"><div class="staff-head"><div><p class="eyebrow">CITY GOVERNMENT HOSPITAL · STAFF SIMULATOR</p><h1>Move the journey forward.</h1><p>This is an operations simulator, not a queue-management product. Each action creates a verified synthetic update for the patient device.</p></div><button class="secondary-button" data-action="reset">↺ Reset journey</button></div><div class="staff-layout"><article class="staff-card"><div class="staff-patient-head"><div><p class="eyebrow">PATIENT</p><h2>Ravi Kumar</h2><p>DEMO-042 · Orthopaedics · Dr. Mehta</p></div><span class="state-pill">${esc(stateLabel())}</span></div><div class="staff-facts"><div><span>ROOM</span><b>${esc(journey.room)}</b></div><div><span>CONTEXTUAL WAIT</span><b>${journey.queueAhead ?? "—"}</b></div><div><span>UPDATED</span><b>${esc(journey.lastUpdated)}</b></div></div><div class="staff-timeline"><p class="eyebrow">SHARED JOURNEY</p>${steps.map(([state,label],i)=>`<div class="staff-step ${i<=stateIndex()?"reached":""}"><span>${i<stateIndex()?"✓":i+1}</span><b>${label}</b></div>`).join("")}</div></article><article class="staff-card"><p class="eyebrow">SIMULATE AN UPDATE</p><h2>Hospital-side actions</h2><div class="control-list">${controls.map(([label,type,enabled,extra])=>`<button class="control" data-event="${type}" data-extra='${JSON.stringify(extra).replaceAll("'","&#39;")}' ${enabled&&!pending?"":"disabled"}><span>${label}</span><b>${enabled&&!pending?"→":"—"}</b></button>`).join("")}</div><div class="sms-card"><p class="eyebrow">SMS / LOW-CONNECTIVITY PREVIEW</p><p>${smsText()}</p></div><div class="event-history"><p class="eyebrow">LATEST UPDATES</p>${[...(journey.events||[])].reverse().slice(0,5).map(e=>`<div><b>${esc(e.description)}</b><span>${esc(e.at)}</span></div>`).join("") || `<div><b>Appointment confirmed</b><span>10:12 AM</span></div>`}</div></article></div><p class="fine-print">Synthetic data only. No government system, real patient record, messaging provider or clinical decision is connected.</p></main>`;
}
function smsText() {
  if (journey.state===JourneyState.WAITING) return `CAREPATH: Registration complete. Token ${journey.visit.token}. Orthopaedics, Room ${journey.room}. ${journey.queueAhead} ahead.`;
  if (journey.state===JourneyState.CALLED) return `CAREPATH: Your turn. Token ${journey.visit.token}. Go to Room ${journey.room} now.`;
  if (journey.state===JourneyState.CONSULTATION) return `CAREPATH: Consultation in progress. Room ${journey.room}.`;
  if (journey.state===JourneyState.LAB) return "CAREPATH: Consultation complete. Lab is next.";
  if (journey.state===JourneyState.PHARMACY) return "CAREPATH: Lab complete. Pharmacy is next.";
  if (journey.state===JourneyState.COMPLETED) return "CAREPATH: Your visit is complete.";
  return "CAREPATH: Appointment confirmed. Bring your appointment ID to OPD Block A.";
}

function render() {
  const r = route();
  if (r === "services") app.innerHTML = servicesPage();
  else if (r === "healthcare" || r === "healthcare/") app.innerHTML = healthcareStart();
  else if (r === "healthcare/understand") app.innerHTML = understandPage();
  else if (r === "healthcare/official") app.innerHTML = officialPage();
  else if (r === "healthcare/confirmed") app.innerHTML = confirmationPage();
  else if (r === "healthcare/visit-login") app.innerHTML = loginPage();
  else if (r.startsWith("healthcare/visit") && authRole === "staff") app.innerHTML = staffPage();
  else if (r.startsWith("healthcare/visit") && authRole === "patient") app.innerHTML = visitPage();
  else if (r.startsWith("healthcare/visit")) { go("healthcare/visit-login"); return; }
  else { go("services"); return; }
  bind();
  window.scrollTo(0,0);
}

function bind() {
  document.querySelectorAll("[data-service]").forEach((el)=>el.addEventListener("click",()=> el.dataset.service==="healthcare" ? go("healthcare") : notify("This sector is presented as a scalable journey concept in this prototype.")));
  document.querySelectorAll("[data-choice]").forEach((el)=>el.addEventListener("click",()=> el.dataset.choice==="doctor" ? go("healthcare/understand") : notify("The healthcare prototype currently demonstrates the doctor journey end-to-end.")));
  document.querySelectorAll("[data-answer]").forEach((el)=>el.addEventListener("click",()=>{ document.querySelectorAll("[data-answer]").forEach(b=>b.classList.remove("selected")); el.classList.add("selected"); }));
  document.querySelector("[data-action=understand-next]")?.addEventListener("click",()=>go("healthcare/official"));
  document.querySelector("[data-action=official-next]")?.addEventListener("click",()=>go("healthcare/confirmed"));
  document.querySelector("[data-action=open-visit]")?.addEventListener("click",()=>go("healthcare/visit-login"));
  document.querySelector("[data-action=healthcare-back]")?.addEventListener("click",()=>go("healthcare"));
  document.querySelector("[data-action=home]")?.addEventListener("click",()=>go("services"));
  document.querySelector("[data-action=logout]")?.addEventListener("click",()=>{ authRole=null; sessionStorage.removeItem(AUTH_KEY); go("services"); });
  document.querySelectorAll("[data-login-role]").forEach((b)=>b.addEventListener("click",()=>{ document.querySelectorAll("[data-login-role]").forEach(x=>x.classList.remove("active")); b.classList.add("active"); const patient=b.dataset.loginRole==="patient"; document.querySelector("#patient-form").hidden=!patient; document.querySelector("#staff-form").hidden=patient; }));
  document.querySelector("#patient-form")?.addEventListener("submit",(e)=>{e.preventDefault(); const mobile=document.querySelector("#patient-mobile").value.trim(), id=document.querySelector("#patient-id").value.trim().toUpperCase(); if(mobile!==PATIENT.mobile||id!==PATIENT.appointment){showLoginError("Use the synthetic demo credentials shown below.");return;} authRole="patient"; sessionStorage.setItem(AUTH_KEY,"patient"); go(`healthcare/visit/${statePath()}`);});
  document.querySelector("#staff-form")?.addEventListener("submit",(e)=>{e.preventDefault(); const id=document.querySelector("#staff-id").value.trim().toUpperCase(), pin=document.querySelector("#staff-pin").value.trim(); if(id!==STAFF.id||pin!==STAFF.pin){showLoginError("Use STAFF-ORTHO and PIN 0420 for the synthetic demo.");return;} authRole="staff"; sessionStorage.setItem(AUTH_KEY,"staff"); go("healthcare/visit/staff");});
  document.querySelector("[data-action=patient-arrive]")?.addEventListener("click",()=>{if(journey.state===JourneyState.APPOINTMENT_CONFIRMED) action(EventType.PATIENT_ARRIVED,{description:"Ravi arrived at the hospital"});});
  document.querySelector("[data-action=explain]")?.addEventListener("click",()=>{explanationOpen=!explanationOpen;render();});
  document.querySelector("[data-action=dismiss]")?.addEventListener("click",()=>{ journey.events = journey.events.filter(e=>![EventType.ROOM_CHANGED,EventType.CALL_PATIENT].includes(e.type)); render(); });
  document.querySelectorAll("[data-event]").forEach((b)=>b.addEventListener("click",()=>{ const type=b.dataset.event; let extra={}; try{extra=JSON.parse(b.dataset.extra||"{}");}catch{} action(type,extra); }));
  document.querySelector("[data-action=reset]")?.addEventListener("click",resetJourney);
}
function showLoginError(message){const e=document.querySelector("#login-error");if(e){e.textContent=message;e.hidden=false;}}
async function action(type,extra={}){
  if(pending||!authRole)return;
  pending=true;render();
  try{
    if(serverAvailable){const data=await api("/api/event",{method:"POST",body:JSON.stringify({role:authRole,type,...extra})});journey=data.journey;}
    else {journey=applyEvent(journey,{type,...extra});}
    explanationOpen=false;
    if(authRole==="patient") syncRouteToState(); else render();
  }catch(error){notify(error.message);render();}
  finally{pending=false; if(!route().startsWith("healthcare/visit"))render(); else if(authRole==="patient"&&route().includes("staff"))render();}
}
async function resetJourney(){if(authRole!=="staff"||pending)return;pending=true;try{if(serverAvailable){const data=await api("/api/reset",{method:"POST",body:JSON.stringify({role:"staff"})});journey=data.journey;}else journey=structuredClone(initialJourney);go(`healthcare/visit/${statePath()}`);}catch(e){notify(e.message);}finally{pending=false;}}
async function api(path,options={}){const res=await fetch(path,{cache:"no-store",headers:{"Content-Type":"application/json",...(options.headers||{})},...options});const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.error||`Request failed (${res.status})`);return data;}
async function connect(){if(!window.EventSource||!location.protocol.startsWith("http"))return;try{const data=await api("/api/state");if(data.journey)journey=data.journey;serverAvailable=true;render();eventStream?.close();eventStream=new EventSource("/api/events");eventStream.addEventListener("journey",e=>{const d=JSON.parse(e.data);if(d.journey){journey=d.journey;if(authRole==="patient"&&route().startsWith("healthcare/visit"))go(`healthcare/visit/${statePath()}`);else render();}});eventStream.addEventListener("reset",e=>{const d=JSON.parse(e.data);if(d.journey){journey=d.journey;render();}});eventStream.onerror=()=>{serverAvailable=false;};}catch{serverAvailable=false;}}

window.addEventListener("hashchange",render);
window.addEventListener("online",connect);
render();
connect();
