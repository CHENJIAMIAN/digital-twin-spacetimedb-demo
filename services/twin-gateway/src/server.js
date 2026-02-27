import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8787;

const state = new Map();
const SELF_SIMULATE = process.env.SELF_SIMULATE === 'true';

function scoreHealth(t) {
  const tempPenalty = Math.max(0, t.temperature - 70) * 0.8;
  const vibPenalty = Math.max(0, t.vibration - 30) * 1.1;
  return Math.max(0, Math.round(100 - tempPenalty - vibPenalty));
}

function upsertTelemetry(payload) {
  const prev = state.get(payload.deviceId) || {};
  const next = {
    deviceId: payload.deviceId,
    line: payload.line ?? prev.line ?? 'line-a',
    temperature: payload.temperature,
    vibration: payload.vibration,
    powerKw: payload.powerKw,
    updatedAt: Date.now(),
  };
  next.healthScore = scoreHealth(next);
  next.alarmLevel = next.temperature > 85 || next.vibration > 45 ? 'critical'
    : next.temperature > 75 || next.vibration > 35 ? 'warning'
    : 'normal';
  state.set(payload.deviceId, next);
  return next;
}

app.post('/ingest', (req, res) => {
  const body = req.body;
  if (!body?.deviceId) return res.status(400).json({ error: 'deviceId required' });
  const row = upsertTelemetry(body);
  broadcast({ type: 'device_update', payload: row });
  res.json({ ok: true, row });
});

app.get('/snapshot', (_req, res) => {
  res.json({ devices: [...state.values()] });
});

const server = app.listen(PORT, () => {
  console.log(`[gateway] http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server, path: '/ws' });
function broadcast(msg) {
  const data = JSON.stringify(msg);
  wss.clients.forEach((c) => c.readyState === 1 && c.send(data));
}

setInterval(() => {
  const summary = [...state.values()].reduce((acc, d) => {
    acc.total += 1;
    acc.critical += d.alarmLevel === 'critical' ? 1 : 0;
    acc.warning += d.alarmLevel === 'warning' ? 1 : 0;
    return acc;
  }, { total: 0, critical: 0, warning: 0 });
  broadcast({ type: 'fleet_summary', payload: summary });
}, 3000);

if (SELF_SIMULATE) {
  const devices = Array.from({ length: 8 }, (_, i) => ({
    deviceId: `pump-${(i + 1).toString().padStart(2, '0')}`,
    line: i < 4 ? 'line-a' : 'line-b',
    temperature: 58 + Math.random() * 8,
    vibration: 20 + Math.random() * 6,
    powerKw: 11 + Math.random() * 2,
  }));
  const jitter = (x, r = 2) => x + (Math.random() - 0.5) * r;
  setInterval(() => {
    for (const d of devices) {
      d.temperature = jitter(d.temperature, 4);
      d.vibration = jitter(d.vibration, 3);
      d.powerKw = jitter(d.powerKw, 1);
      if (Math.random() < 0.03) d.temperature += 20;
      if (Math.random() < 0.03) d.vibration += 15;
      const row = upsertTelemetry(d);
      broadcast({ type: 'device_update', payload: row });
    }
  }, 1000);
  console.log('[gateway] SELF_SIMULATE enabled');
}
