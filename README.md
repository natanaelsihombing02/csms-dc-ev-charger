# CSMS DC EV Charger

Web-based Charging Station Management System (CSMS) for DC EV Chargers.

## Initial scope

- OCPP 1.6J over WebSocket
- Charger/connector management
- Live charger status
- Charging sessions and transaction history
- Meter values
- Remote start/stop
- Alarm and fault monitoring
- Web dashboard
- JWT authentication and RBAC
- PostgreSQL persistence
- Redis for realtime/queue workloads

## Architecture

```
DC EV Charger
      |
      | OCPP 1.6J / WebSocket
      v
+-----------------------+
| CSMS API              |
| - OCPP gateway        |
| - charger management  |
| - sessions            |
| - commands            |
+-----------+-----------+
            |
     +------+------+
     |             |
 PostgreSQL       Redis
     |
     v
Web Dashboard / REST API
```

## Repository layout

- `apps/api` — NestJS CSMS backend and OCPP gateway
- `apps/web` — Next.js operator dashboard
- `packages/shared` — shared TypeScript contracts
- `packages/ocpp` — OCPP protocol/domain package
- `docs` — architecture, protocol and database documentation
- `.github/workflows` — CI automation
- `infra` — infrastructure configuration

## Development

The repository uses pnpm workspaces.

Prerequisites:

- Node.js 22+
- pnpm 10+
- Docker / Docker Compose

OCPP implementation will be introduced incrementally, starting with connection lifecycle and core 1.6J messages.
