# CarePath — Public Service Journey Layer

A synthetic healthcare proof-of-concept for a broader public-service journey layer. Healthcare is the **implemented** journey; pension, certificates and grievances are scale concepts using the same journey model.

## The working healthcare journey

`Appointment confirmed → Arrived → Registered → Waiting → Called → Consultation → Completed`

The staff simulator changes the shared journey state. The patient view turns those verified state changes into a clear **NOW / NEXT / WHERE / WAIT** instruction.

## Two-device demo

For a real laptop + phone demonstration, run the Node server on a machine that both devices can reach:

```bash
npm start
```

Then open the printed LAN URL on the patient laptop and the staff phone. The server exposes the synthetic journey through `/api/state`, `/api/event` and server-sent events at `/api/events`, so staff actions appear on the patient device without a page refresh.

**Important:** a GitHub file/preview page is static and cannot run `server.mjs`. In that environment the UI falls back to a local synthetic state, which is useful for a single-device walkthrough but not for cross-device sync.

## Demo credentials

- Patient: `9000000000` + `DEMO-042`
- Staff: `STAFF-ORTHO` + `0420`

## Test the journey logic

With Node.js available:

```bash
npm test
```

## Guardrails

All names, data, rooms, timestamps, queue values and SMS messages are synthetic. This prototype does not access government systems, hospital systems or real patient data, and it does not provide medical advice, diagnosis or clinical decisions.
