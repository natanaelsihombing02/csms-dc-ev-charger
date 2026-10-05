# CSMS Architecture

## Goals

The system is designed for operational reliability first. Charger connectivity and OCPP state are separated from the web UI so an operator dashboard outage does not terminate charger sessions.

## Components

### API / CSMS

Responsibilities:

- OCPP WebSocket termination
- Charger identity and connection lifecycle
- OCPP message validation and routing
- Transaction/session state
- Remote commands
- REST API for the dashboard
- Authentication, RBAC and audit logging

### Web

Responsibilities:

- Fleet overview
- Charger status
- Connector state
- Live session telemetry
- Transaction history
- Alarms/faults
- Administration

### PostgreSQL

System of record for chargers, connectors, transactions, meter values, alarms, users and audit events.

### Redis

Used for ephemeral connection state, pub/sub and background jobs where appropriate. Redis is not the source of truth for charging transactions.

## OCPP 1.6J initial message set

Client -> CSMS:

- BootNotification
- Heartbeat
- StatusNotification
- Authorize
- StartTransaction
- MeterValues
- StopTransaction

CSMS -> Charger:

- RemoteStartTransaction
- RemoteStopTransaction

Additional OCPP operations will be added behind explicit domain handlers.
