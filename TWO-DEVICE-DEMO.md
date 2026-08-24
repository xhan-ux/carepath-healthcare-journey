# CarePath — two-device demo

This prototype now has a tiny Node server so the patient laptop and staff phone share one synthetic journey in real time.

## Run it

1. Install Node.js 20+ on the laptop.
2. In the CarePath repository folder, run:

```bash
npm start
```

3. The terminal will show the local URL and remind you to use the laptop's LAN IP for the phone, for example:

```text
http://192.168.1.10:3000
```

4. Open that same LAN URL on both devices while they are on the same Wi-Fi network.
5. On the laptop use the patient demo login:
   - Mobile: `9000000000`
   - Appointment: `DEMO-042`
6. On the phone use the staff demo login:
   - Staff ID: `STAFF-ORTHO`
   - PIN: `0420`

## Demo flow

Patient laptop → **I'm at the hospital**

Staff phone → **Register / check in patient**

Staff phone → **Advance queue** until 0

Staff phone → **Call patient**

Patient laptop → sees the **YOUR TURN** alert

Staff phone → **Move consultation room 202 → 204**

Patient laptop → sees the room-change alert

Staff phone → **Start consultation** → **Complete consultation**

## Offline / SMS behavior

The patient screen detects loss of network connectivity and keeps showing the last verified journey state. The staff view also displays the synthetic SMS that would be sent by a production messaging service.

The SMS is deliberately simulated; this prototype does not send real messages or connect to a hospital system.

## Important

The server keeps the synthetic journey in memory. Restarting `npm start` resets the demo. This is intentional for a portfolio/demo prototype and avoids storing real patient information.
