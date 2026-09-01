const { createClient } = require('@libsql/client');

let client;
function getClient() {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN
    });
  }
  return client;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  let db;
  try {
    db = getClient();
  } catch (err) {
    res.status(500).json({ error: 'DB_CLIENT_INIT_FAILED' });
    return;
  }

  // -------- READ --------
  if (req.method === 'GET') {
    try {
      // Menggunakan nama tabel secara eksplisit tanpa variabel luar untuk menghindari celah SQL 400
      const result = await db.execute("SELECT id, name, message, status, created_at FROM kresnatiara ORDER BY id DESC LIMIT 50");
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('DB_READ_FAILED', err.message);
      res.status(500).json({ error: 'DB_READ_FAILED', detail: err.message });
    }
    return;
  }

  // -------- CREATE --------
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
      console.error('DB_WRITE_FAILED', err.message);
      res.status(500).json({ error: 'DB_WRITE_FAILED', detail: err.message });
    }
    return;
  }

  res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
};