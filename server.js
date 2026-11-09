// Proost! server.
// The games run in the host's browser; this server only stores the shared game data
// and pushes every change to the other phones straight away (Server-Sent Events).
const express = require('express');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;
const KEEP_HOURS = 12;

app.use(express.json({ limit: '300kb' }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h', etag: true }));

// ---------- storage (in memory) ----------
const docs = new Map();      // path -> { data, at }
const leases = new Map();    // path -> { holder, exp }
const watchers = new Set();  // { type: 'doc'|'col', path, res }

const SEG = /^[A-Za-z0-9_\-.~:@+]{1,200}$/;
function cleanPath(p, wantDoc) {
  const parts = String(p || '').split('/');
  if (!parts.length || parts.length > 16 || !parts.every((s) => SEG.test(s) && s !== '.' && s !== '..')) return null;
  if (wantDoc !== undefined && (parts.length % 2 === 0) !== wantDoc) return null;
  return parts.join('/');
}
const parentOf = (p) => p.split('/').slice(0, -1).join('/');
const listCol = (col) => {
  const out = [];
  for (const [p, v] of docs) if (parentOf(p) === col) out.push({ id: p.split('/').pop(), data: v.data });
  return out.sort((a, b) => (a.id < b.id ? -1 : 1));
};
const send = (res, payload) => res.write(`data: ${JSON.stringify(payload)}\n\n`);
function notify(p) {
  const col = parentOf(p);
  for (const w of watchers) {
    if (w.type === 'doc' && w.path === p) { const d = docs.get(p); send(w.res, { exists: !!d, data: d ? d.data : null }); }
    else if (w.type === 'col' && w.path === col) send(w.res, listCol(col));
  }
}

// ---------- API used by public/sync.js ----------
app.get('/api/doc', (req, res) => {
  const p = cleanPath(req.query.p, true); if (!p) return res.status(400).json({ error: 'bad path' });
  const d = docs.get(p); res.json({ exists: !!d, data: d ? d.data : null });
});
app.put('/api/doc', (req, res) => {
  const p = cleanPath(req.query.p, true); if (!p) return res.status(400).json({ error: 'bad path' });
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) return res.status(400).json({ error: 'body must be an object' });
  docs.set(p, { data: req.body, at: Date.now() });
  notify(p); res.json({ ok: true });
});
app.get('/api/list', (req, res) => {
  const p = cleanPath(req.query.p, false); if (!p) return res.status(400).json({ error: 'bad path' });
  res.json(listCol(p));
});
app.post('/api/lease', (req, res) => {
  const p = cleanPath(req.query.p, true); if (!p) return res.status(400).json({ error: 'bad path' });
  const holder = String((req.body && req.body.holder) || '').slice(0, 100);
  const ttl = Math.min(600000, Math.max(1000, Number(req.body && req.body.ttlMs) || 30000));
  const now = Date.now(), cur = leases.get(p);
  if (!cur || cur.exp < now || cur.holder === holder) { leases.set(p, { holder, exp: now + ttl }); return res.json({ acquired: true, expiresAt: new Date(now + ttl).toISOString() }); }
  res.json({ acquired: false, expiresAt: new Date(cur.exp).toISOString() });
});
app.get('/api/watch', (req, res) => {
  const type = req.query.type === 'col' ? 'col' : 'doc';
  const p = cleanPath(req.query.p, type === 'doc'); if (!p) return res.status(400).end();
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
  res.flushHeaders();
  const w = { type, path: p, res };
  watchers.add(w);
  if (type === 'doc') { const d = docs.get(p); send(res, { exists: !!d, data: d ? d.data : null }); } else send(res, listCol(p));
  const ping = setInterval(() => res.write(': ping\n\n'), 25000);
  req.on('close', () => { clearInterval(ping); watchers.delete(w); });
});
app.get('/healthz', (req, res) => res.send('ok'));

// ---------- forget old games ----------
setInterval(() => {
  const cutoff = Date.now() - KEEP_HOURS * 3600 * 1000;
  for (const [p, v] of docs) if (v.at < cutoff) docs.delete(p);
  for (const [p, l] of leases) if (l.exp < Date.now()) leases.delete(p);
}, 15 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Proost! draait op http://localhost:${PORT}`);
  for (const list of Object.values(os.networkInterfaces())) for (const i of list || [])
    if (i.family === 'IPv4' && !i.internal) console.log(`Op je wifi: http://${i.address}:${PORT}`);
});
