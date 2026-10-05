# CSMS Web

Next.js operator-facing web application with a browser-based OCPP 1.6J charger simulator.

## Manual E2E

Start the CSMS API and then run:

```bash
pnpm --filter @csms/web dev
```

Open `http://localhost:3000/charger-simulator` (or the Next.js port shown by the dev server).

The simulator connects directly from the browser to:

```
ws://localhost:3000/ocpp/DC-CHARGER-001
```

Configure the URL in the UI when the API uses another host or port.

Supported messages:

- BootNotification
- StatusNotification
- Heartbeat

The UI explicitly requests the `ocpp1.6` WebSocket subprotocol and displays raw OCPP frames in the live protocol log.
