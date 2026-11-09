// Connects the game to this server. The same game also runs as a Claude artifact,
// where Claude provides storage; outside Claude this file provides it instead.
(function () {
  if (window.claude) return;
  const enc = encodeURIComponent;
  const meta = { fromCache: false, hasPendingWrites: false };
  const snap = (id, data) => ({ id, exists: data !== null && data !== undefined, data: () => (data == null ? undefined : data), metadata: meta });
  const query = (arr) => ({ docs: arr.map((x) => snap(x.id, x.data)), size: arr.length, empty: !arr.length, docChanges: () => [], metadata: meta });
  const fail = (status) => ({ code: status === 400 ? 'invalid_argument' : 'unavailable', message: 'Request failed (' + status + ')' });

  function watch(url, onData) {
    const es = new EventSource(url);   // reconnects by itself and gets the current state again
    es.onmessage = (e) => { try { onData(JSON.parse(e.data)); } catch (err) {} };
    return () => es.close();
  }
  function doc(path) {
    const id = path.split('/').pop();
    return {
      id, path,
      async get() { const r = await fetch('/api/doc?p=' + enc(path)); if (!r.ok) throw fail(r.status); const j = await r.json(); return snap(id, j.exists ? j.data : null); },
      async set(data) {
        const r = await fetch('/api/doc?p=' + enc(path), { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
        if (!r.ok) throw fail(r.status);
      },
      async acquire(o) {
        const r = await fetch('/api/lease?p=' + enc(path), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ holder: o.holder, ttlMs: o.ttlMs }) });
        if (!r.ok) throw fail(r.status); return r.json();
      },
      onSnapshot(next) { return watch('/api/watch?type=doc&p=' + enc(path), (j) => next(snap(id, j.exists ? j.data : null))); },
      collection(sub) { return col(path + '/' + sub); },
    };
  }
  function col(path) {
    return {
      path,
      doc: (id) => doc(path + '/' + id),
      async get() { const r = await fetch('/api/list?p=' + enc(path)); if (!r.ok) throw fail(r.status); return query(await r.json()); },
      onSnapshot(next) { return watch('/api/watch?type=col&p=' + enc(path), (arr) => next(query(arr))); },
    };
  }
  const db = { doc, collection: col };
  window.claude = { use: (name) => Promise.resolve(name === 'db' ? db : null) };
})();
