# Healthcare Journey Layer — Hackathon Prototype

A deliberately small, synthetic end-to-end healthcare journey demo for one patient at one government hospital.

## Run it

Open `index.html` in a browser. The patient and staff views share the same in-browser state, so actions in the staff simulator update the patient view immediately.

## Test the journey logic

With Node.js available, run `npm test` from this folder.

## Guardrails

All names, data, rooms, timestamps, and queue values are synthetic. This prototype has no real integrations, login, payments, messaging, medical advice, or clinical system access.
