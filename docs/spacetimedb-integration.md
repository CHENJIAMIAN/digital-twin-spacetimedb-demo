# SpacetimeDB 接入说明（从当前 MVP 升级）

当前项目先把“真实业务闭环”跑通：
- 传感器模拟器持续写入 telemetry
- 网关计算健康分与告警等级
- Dashboard 实时订阅更新

## 升级到 SpacetimeDB 的替换点

1. 把 `services/twin-gateway` 的内存 `Map` 替换为 SpacetimeDB 表。
2. 把 `POST /ingest` 逻辑迁移为 reducer（例如 `upsert_telemetry`）。
3. 前端订阅改为 SpacetimeDB 客户端订阅（替代当前 WebSocket）。

## 建议表结构（示例）

- `device_state`
  - `device_id`(pk)
  - `line`
  - `temperature`
  - `vibration`
  - `power_kw`
  - `health_score`
  - `alarm_level`
  - `updated_at`

- `alarm_event`
  - `id`(auto inc)
  - `device_id`
  - `alarm_level`
  - `message`
  - `created_at`

## Reducer 建议

- `upsert_telemetry(device_id, line, temperature, vibration, power_kw)`
- `ack_alarm(device_id, operator)`
- `set_threshold(line, temp_warn, temp_critical, vib_warn, vib_critical)`

## 你下一步可以直接做

1. 安装 SpacetimeDB CLI（按官方文档）
2. 初始化 module（Rust）
3. 先实现 `upsert_telemetry` + 订阅 `device_state`
4. 把 dashboard 从 `ws://localhost:8787/ws` 切到 Spacetime 订阅

> 这样改完，你就从“可运行 MVP”升级为“SpacetimeDB 真实时孪生后端”。
