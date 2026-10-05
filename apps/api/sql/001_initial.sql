CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS charging_stations (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 charge_point_id VARCHAR(100) NOT NULL UNIQUE,
 vendor VARCHAR(100) NOT NULL,
 model VARCHAR(100) NOT NULL,
 serial_number VARCHAR(150),
 last_seen_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS connectors (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 charging_station_id UUID NOT NULL REFERENCES charging_stations(id) ON DELETE CASCADE,
 connector_id INTEGER NOT NULL,
 status VARCHAR(30) NOT NULL DEFAULT 'UNKNOWN',
 error_code VARCHAR(100) NOT NULL DEFAULT 'NoError',
 last_status_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(charging_station_id,connector_id)
);

CREATE INDEX IF NOT EXISTS idx_charging_stations_last_seen ON charging_stations(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_connectors_status ON connectors(status);
