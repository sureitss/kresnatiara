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

const RAW_TABLE = process.env.DB_TABLE || 'kresnatiara';
const T = /^[A-Za-z0-9_]+$/.test(RAW_TABLE) ? RAW_TABLE : 'kresnatiara';

// Pastikan semua pilihan status masuk di sini agar tidak error 400 Bad Request
const STATUS_VALUES = ['Hadir', 'Tidak Hadir', 'Berhalangan Hadir', 'Masih Ragu'];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  let db;
  try { db = getClient(); } catch (err) { res.status(500).json({ error: 'DB_CLIENT_INIT_FAILED' }); return; }

  // -------- READ --------
  if (req.method === 'GET') {
    try {
      const limitRaw = parseInt((req.query?.limit ?? '100'), 10);
      const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 100 : limitRaw, 1), 200);

      // FIX ERROR 400 TURSO: Memasukkan angka limit langsung ke string SQL (Aman karena sudah di-parse ke Integer)
      const result = await db.execute(`SELECT * FROM ${T} ORDER BY id DESC LIMIT ${limit}`);
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
      if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
      const { name, message, status } = body || {};

      const nm = String(name || '').trim().slice(0, 100);
      const msg = String(message || '').trim().slice(0, 1000);
      const validStatus = STATUS_VALUES.includes(status) ? status : 'Tidak Hadir';

      if (!nm || !msg) { res.status(400).json({ error: 'BAD_REQUEST' }); return; }

      const now = new Date().toISOString();

      const inserted = await db.execute({
        sql: `INSERT INTO ${T} (name, message, status, created_at) VALUES (?, ?, ?, ?)`,
        args: [nm, msg, validStatus, now]
      });

      const result = await db.execute({
        sql: `SELECT * FROM ${T} WHERE id = ?`,
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