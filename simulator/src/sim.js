const devices = Array.from({ length: 8 }, (_, i) => ({
  deviceId: `pump-${(i + 1).toString().padStart(2, '0')}`,
  line: i < 4 ? 'line-a' : 'line-b',
  temperature: 58 + Math.random() * 8,
  vibration: 20 + Math.random() * 6,
  powerKw: 11 + Math.random() * 2,
}));

function jitter(x, range = 2) { return x + (Math.random() - 0.5) * range; }

async function tick() {
  for (const d of devices) {
    d.temperature = jitter(d.temperature, 4);
    d.vibration = jitter(d.vibration, 3);
    d.powerKw = jitter(d.powerKw, 1);

    if (Math.random() < 0.03) d.temperature += 20;
    if (Math.random() < 0.03) d.vibration += 15;

    await fetch('http://localhost:8787/ingest', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(d),
    }).catch(() => undefined);
  }
}

setInterval(tick, 1000);
console.log('[simulator] running, sending telemetry each second');
