# OCPP 1.6J

The first protocol target is OCPP 1.6J using WebSocket subprotocol `ocpp1.6`.

Expected endpoint:

`ws(s)://<host>/ocpp/<chargePointId>`

The OCPP layer will validate message type, action and payload before handing work to domain services.

Core lifecycle:

1. Charger connects.
2. CSMS identifies the charge point.
3. Charger sends BootNotification.
4. CSMS accepts/rejects registration.
5. Heartbeat maintains liveness.
6. StatusNotification updates connector state.
7. StartTransaction creates a charging session.
8. MeterValues append telemetry.
9. StopTransaction closes the session.

Remote commands are correlated with their OCPP call IDs and must expose timeout/error handling.
