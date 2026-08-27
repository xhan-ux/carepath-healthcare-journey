import test from "node:test";
import assert from "node:assert/strict";
import { applyEvent, EventType, initialJourney, JourneyState } from "../src/state.js";

const time = new Date("2026-08-22T10:30:00+05:30");

test("the core journey proceeds through consultation, lab, pharmacy, and completion", () => {
  let journey = initialJourney;
  journey = applyEvent(journey, { type: EventType.PATIENT_ARRIVED }, time);
  journey = applyEvent(journey, { type: EventType.CHECKED_IN, queueAhead: 1 }, time);
  journey = applyEvent(journey, { type: EventType.QUEUE_ADVANCED }, time);
  journey = applyEvent(journey, { type: EventType.CALL_PATIENT }, time);
  journey = applyEvent(journey, { type: EventType.START_CONSULTATION }, time);
  assert.equal(journey.state, JourneyState.CONSULTATION);

  journey = applyEvent(journey, { type: EventType.COMPLETE_CONSULTATION }, time);
  assert.equal(journey.state, JourneyState.LAB);

  journey = applyEvent(journey, { type: EventType.COMPLETE_LAB }, time);
  assert.equal(journey.state, JourneyState.PHARMACY);

  journey = applyEvent(journey, { type: EventType.COMPLETE_PHARMACY }, time);
  assert.equal(journey.state, JourneyState.COMPLETED);
  assert.equal(journey.events.length, 9);
});

test("a room change is a real event visible in the state", () => {
  let journey = applyEvent(initialJourney, { type: EventType.PATIENT_ARRIVED }, time);
  journey = applyEvent(journey, { type: EventType.CHECKED_IN, queueAhead: 3 }, time);
  journey = applyEvent(journey, { type: EventType.ROOM_CHANGED, room: "204", description: "Room changed to 204" }, time);
  assert.equal(journey.room, "204");
  assert.equal(journey.events.at(-1).description, "Room changed to 204");
});

test("a patient cannot be called while the queue is ahead", () => {
  let journey = applyEvent(initialJourney, { type: EventType.PATIENT_ARRIVED }, time);
  journey = applyEvent(journey, { type: EventType.CHECKED_IN, queueAhead: 2 }, time);
  assert.throws(() => applyEvent(journey, { type: EventType.CALL_PATIENT }, time), /not next yet/);
});
