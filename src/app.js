import { applyEvent, canApplyEvent, EventType, initialJourney, JourneyState } from "./state.js";

let journey = structuredClone(initialJourney);

const patientCopy = {
  [JourneyState.APPOINTMENT_CONFIRMED]: ["Your appointment is confirmed", "Head to City Government Hospital when it is time to leave. We’ll guide you at every step.", "Tell us when you arrive", "City Government Hospital", "No queue yet", "Your visit will appear here", "I’m at the hospital →"],
  [JourneyState.ARRIVED]: ["You’re here. Let’s check you in.", "Show your appointment ID at the Orthopaedics registration desk.", "Get registered", "Orthopaedics registration desk", "No queue yet", "Registration is next", "Waiting for registration"],
  [JourneyState.WAITING]: ["You’re in the queue", "Please stay near the Orthopaedics waiting area. We’ll update you when it’s your turn.", "Wait for your name to be called", "Orthopaedics · Room {room}", "{queue} ahead of you", "Registration complete", "You’re checked in"],
  [JourneyState.CALLED]: ["It’s your turn", "Please go to Room {room} now. Dr. Mehta is ready for you.", "Go to Room {room}", "Orthopaedics · Room {room}", "Please go now", "You’re being seen next", "Proceed to Room {room}"],
  [JourneyState.CONSULTATION]: ["Your consultation is in progress", "You’re with Dr. Mehta in Room {room}.", "Your visit will be completed shortly", "Orthopaedics · Room {room}", "In consultation", "Consultation underway", "Consultation in progress"],
  [JourneyState.COMPLETED]: ["Your visit is complete", "Your Orthopaedics consultation with Dr. Mehta has been completed.", "No further steps today", "City Government Hospital", "No wait", "Consultation completed", "Visit completed"]
};

const timelineSteps = ["Appointment confirmed", "Arrived", "Registered & waiting", "Called", "Consultation", "Completed"];
const stateStep = { APPOINTMENT_CONFIRMED: 0, ARRIVED: 1, WAITING: 2, CALLED: 3, CONSULTATION: 4, COMPLETED: 5 };

function fill(template) {
  return template.replaceAll("{room}", journey.room).replaceAll("{queue}", journey.queueAhead === 0 ? "No one" : journey.queueAhead);
}
function formatState(state) { return state.replaceAll("_", " "); }
function action(type, extra = {}) { journey = applyEvent(journey, { type, ...extra }); render(); }

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
  button.textContent = copy[6];
  button.disabled = journey.state !== JourneyState.APPOINTMENT_CONFIRMED;
  button.hidden = journey.state === JourneyState.COMPLETED;
  document.querySelector("#timeline").innerHTML = timelineSteps.map((step, index) => `<li class="${index <= stateStep[journey.state] ? "reached" : ""} ${index === stateStep[journey.state] ? "current" : ""}"><span>${index < stateStep[journey.state] ? "✓" : index + 1}</span>${step}</li>`).join("");
}

function control(label, type, enabled, extra) {
  return `<button class="sim-control" data-event="${type}" ${enabled ? "" : "disabled"}>${label}<span>${enabled ? "→" : "—"}</span></button>`;
}
function renderStaff() {
  document.querySelector("#staff-state").textContent = formatState(journey.state);
  document.querySelector("#staff-room").textContent = journey.room;
  document.querySelector("#staff-queue").textContent = journey.queueAhead ?? "—";
  document.querySelector("#staff-updated").textContent = journey.lastUpdated;
  const controls = [
    control("Register / check in patient", EventType.CHECKED_IN, canApplyEvent(journey, EventType.CHECKED_IN)),
    control("Advance queue", EventType.QUEUE_ADVANCED, canApplyEvent(journey, EventType.QUEUE_ADVANCED) && journey.queueAhead > 0),
    control("Move consultation room 202 → 204", EventType.ROOM_CHANGED, canApplyEvent(journey, EventType.ROOM_CHANGED) && journey.room === "202"),
    control("Call patient", EventType.CALL_PATIENT, canApplyEvent(journey, EventType.CALL_PATIENT)),
    control("Start consultation", EventType.START_CONSULTATION, canApplyEvent(journey, EventType.START_CONSULTATION)),
    control("Complete consultation", EventType.COMPLETE_CONSULTATION, canApplyEvent(journey, EventType.COMPLETE_CONSULTATION))
  ];
  document.querySelector("#staff-controls").innerHTML = controls.join("");
}
function render() { renderPatient(); renderStaff(); }

document.querySelector("#patient-action").addEventListener("click", () => action(EventType.PATIENT_ARRIVED, { description: "Ravi arrived at the hospital" }));
document.querySelector("#staff-controls").addEventListener("click", (event) => {
  const type = event.target.closest("button")?.dataset.event;
  if (!type) return;
  const extra = type === EventType.ROOM_CHANGED ? { room: "204", description: "Consultation room changed from 202 to 204" } :
    type === EventType.CHECKED_IN ? { queueAhead: 3, description: "Registration completed — Ravi joined the queue" } : {};
  action(type, extra);
});
document.querySelector("#reset-demo").addEventListener("click", () => { journey = structuredClone(initialJourney); render(); });
document.querySelectorAll(".view-tab").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".view-tab, .view").forEach(el => el.classList.remove("active"));
  button.classList.add("active"); document.querySelector(`#${button.dataset.view}-view`).classList.add("active");
}));
render();
