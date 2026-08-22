export const JourneyState = Object.freeze({
  APPOINTMENT_CONFIRMED: "APPOINTMENT_CONFIRMED",
  ARRIVED: "ARRIVED",
  WAITING: "WAITING",
  CALLED: "CALLED",
  CONSULTATION: "CONSULTATION",
  COMPLETED: "COMPLETED"
});

export const EventType = Object.freeze({
  PATIENT_ARRIVED: "PATIENT_ARRIVED",
  CHECKED_IN: "CHECKED_IN",
  QUEUE_ADVANCED: "QUEUE_ADVANCED",
  ROOM_CHANGED: "ROOM_CHANGED",
  CALL_PATIENT: "CALL_PATIENT",
  START_CONSULTATION: "START_CONSULTATION",
  COMPLETE_CONSULTATION: "COMPLETE_CONSULTATION"
});

export const initialJourney = Object.freeze({
  patient: { name: "Ravi Kumar", id: "DEMO-042" },
  appointment: {
    hospital: "City Government Hospital",
    department: "Orthopaedics",
    clinician: "Dr. Mehta",
    date: "22 Aug 2026",
    time: "10:30 AM"
  },
  state: JourneyState.APPOINTMENT_CONFIRMED,
  room: "202",
  queueAhead: null,
  lastUpdated: "10:12 AM",
  events: []
});

const allowedTransitions = {
  [EventType.PATIENT_ARRIVED]: [JourneyState.APPOINTMENT_CONFIRMED],
  [EventType.CHECKED_IN]: [JourneyState.ARRIVED],
  [EventType.QUEUE_ADVANCED]: [JourneyState.WAITING],
  [EventType.ROOM_CHANGED]: [JourneyState.ARRIVED, JourneyState.WAITING, JourneyState.CALLED],
  [EventType.CALL_PATIENT]: [JourneyState.WAITING],
  [EventType.START_CONSULTATION]: [JourneyState.CALLED],
  [EventType.COMPLETE_CONSULTATION]: [JourneyState.CONSULTATION]
};

function assertTransition(journey, type) {
  if (!allowedTransitions[type]?.includes(journey.state)) {
    throw new Error(`${type} is not available while journey is ${journey.state}.`);
  }
}

function formatTime(date) {
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(date);
}

export function applyEvent(journey, event, now = new Date()) {
  assertTransition(journey, event.type);
  const lastUpdated = event.at ?? formatTime(now);
  const next = { ...journey, lastUpdated };

  switch (event.type) {
    case EventType.PATIENT_ARRIVED:
      next.state = JourneyState.ARRIVED;
      break;
    case EventType.CHECKED_IN:
      next.state = JourneyState.WAITING;
      next.queueAhead = event.queueAhead ?? 3;
      break;
    case EventType.QUEUE_ADVANCED:
      next.queueAhead = Math.max(0, journey.queueAhead - 1);
      break;
    case EventType.ROOM_CHANGED:
      if (!event.room) throw new Error("ROOM_CHANGED needs a room.");
      next.room = event.room;
      break;
    case EventType.CALL_PATIENT:
      if (journey.queueAhead !== 0) throw new Error("Cannot call a patient while others are ahead.");
      next.state = JourneyState.CALLED;
      next.queueAhead = 0;
      break;
    case EventType.START_CONSULTATION:
      next.state = JourneyState.CONSULTATION;
      break;
    case EventType.COMPLETE_CONSULTATION:
      next.state = JourneyState.COMPLETED;
      next.queueAhead = null;
      break;
  }

  const description = event.description ?? event.type.replaceAll("_", " ");
  next.events = [...journey.events, { type: event.type, description, at: lastUpdated }];
  return next;
}

export function canApplyEvent(journey, type) {
  if (!allowedTransitions[type]?.includes(journey.state)) return false;
  return type !== EventType.CALL_PATIENT || journey.queueAhead === 0;
}
