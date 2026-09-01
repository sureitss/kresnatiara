const { createClient } = require('@libsql/client');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    res.status(500).json({ error: 'DB_CONFIG_MISSING' });
    return;
  }

  // Inisialisasi client stabil
  let db;
  try {
    db = createClient({ url, authToken });
  } catch (err) {
    res.status(500).json({ error: 'DB_CLIENT_INIT_FAILED', detail: err.message });
    return;
  }

  // -------- READ (GET) --------
  if (req.method === 'GET') {
    try {
      const result = await db.execute("SELECT id, name, message, status, created_at FROM kresnatiara ORDER BY id DESC LIMIT 50");
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('DB_READ_FAILED', err);
      res.status(500).json({ error: 'DB_READ_FAILED', detail: err.message });
    }
    return;
  }

  // -------- CREATE (POST) --------
  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { body = {}; }
      }
      const { name, message, status } = body || {};

      const nm = String(name || '').trim().slice(0, 100);
      const msg = String(message || '').trim().slice(0, 1000);
      const validStatus = ['Hadir', 'Tidak Hadir', 'Berhalangan Hadir', 'Masih Ragu'].includes(status) ? status : 'Tidak Hadir';

      if (!nm || !msg) {
        res.status(400).json({ error: 'BAD_REQUEST' });
        return;
      }

      const now = new Date().toISOString();

      const inserted = await db.execute({
        sql: "INSERT INTO kresnatiara (name, message, status, created_at) VALUES (?, ?, ?, ?)",
        args: [nm, msg, validStatus, now]
      });

      const result = await db.execute({
        sql: "SELECT id, name, message, status, created_at FROM kresnatiara WHERE id = ?",
        args: [Number(inserted.lastInsertRowid)]
      });

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('DB_WRITE_FAILED', err);
      res.status(500).json({ error: 'DB_WRITE_FAILED', detail: err.message });
    }
    return;
  }

  res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
};