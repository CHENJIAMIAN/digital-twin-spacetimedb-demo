# SpacetimeDB Integration Notes (Upgrading from the Current MVP)

> [中文](spacetimedb-integration.md)

The current project first establishes a complete real-business loop:
- The sensor simulator continuously writes telemetry.
- The gateway calculates health scores and alarm levels.
- The dashboard receives real-time subscription updates.

## Replacement points for upgrading to SpacetimeDB

1. Replace the in-memory `Map` in `services/twin-gateway` with SpacetimeDB tables.
2. Move the `POST /ingest` logic into reducers, such as `upsert_telemetry`.
3. Change frontend subscriptions to SpacetimeDB client subscriptions, replacing
   the current WebSocket implementation.

## Suggested table structure (example)

- `device_state`
  - `device_id` (pk)
  - `line`
  - `temperature`
  - `vibration`
  - `power_kw`
  - `health_score`
  - `alarm_level`
  - `updated_at`

- `alarm_event`
  - `id` (auto inc)
  - `device_id`
  - `alarm_level`
  - `message`
  - `created_at`

## Suggested reducers

- `upsert_telemetry(device_id, line, temperature, vibration, power_kw)`
- `ack_alarm(device_id, operator)`
- `set_threshold(line, temp_warn, temp_critical, vib_warn, vib_critical)`

## Direct next steps

1. Install the SpacetimeDB CLI according to the official documentation.
2. Initialize a module in Rust.
3. Implement `upsert_telemetry` and subscribe to `device_state` first.
4. Change the dashboard from `ws://localhost:8787/ws` to a Spacetime subscription.

> With these changes, the project moves from a runnable MVP to a real
> SpacetimeDB-based digital-twin backend.
