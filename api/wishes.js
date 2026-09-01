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

// PERBAIKAN: Menggunakan nama tabel kresnatiara
const RAW_TABLE = process.env.DB_TABLE || 'kresnatiara';
const T = /^[A-Za-z0-9_]+$/.test(RAW_TABLE) ? RAW_TABLE : 'kresnatiara';

const STATUS_VALUES = ['Hadir', 'Tidak Hadir'];

module.exports = async (req, res) => {
  // CORS sederhana
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
    console.error('DB_CLIENT_INIT_FAILED', err);
    res.status(500).json({ error: 'DB_CLIENT_INIT_FAILED' });
    return;
  }

  // -------- READ --------
  if (req.method === 'GET') {
    try {
      const limitRaw = parseInt((req.query?.limit ?? '100'), 10);
      const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 100 : limitRaw, 1), 200);

      const result = await db.execute({
        sql: `SELECT id, name, message, status, created_at FROM ${T} ORDER BY id DESC LIMIT ?`,
        args: [limit]
      });
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('DB_READ_FAILED', err);
      res.status(500).json({ error: 'DB_READ_FAILED' });
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

      if (!nm || !msg || !STATUS_VALUES.includes(status)) {
        res.status(400).json({ error: 'BAD_REQUEST' });
        return;
      }

      // Solusi Constraint Failed: Node.js mengirim waktu
      const now = new Date().toISOString();

      const inserted = await db.execute({
        sql: `INSERT INTO ${T} (name, message, status, created_at) VALUES (?, ?, ?, ?)`,
        args: [nm, msg, status, now]
      });

      const newId = Number(inserted.lastInsertRowid);
      const result = await db.execute({
        sql: `SELECT id, name, message, status, created_at FROM ${T} WHERE id = ?`,
        args: [newId]
      });
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('DB_WRITE_FAILED', err);
      res.status(500).json({ error: 'DB_WRITE_FAILED' });
    }
    return;
  }

  res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
};