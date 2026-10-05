# Database Model

Initial entities:

- User
- Role
- ChargingStation
- Connector
- ChargingSession
- MeterValue
- Alarm
- AuditLog
- OcppMessage

Key rule: charging-session state must be persisted independently from transient WebSocket connection state.

Future entities can cover sites, tariffs, RFID tokens, firmware, reservations and charging profiles.
