/**
 * Server lokal untuk testing — MENIRU perilaku Vercel:
 * - Menyajikan undangan/index.html sebagai static site
 * - Memasang endpoint /api/wishes yang sama persis dengan yang dipakai di produksi
 *
 * Jalankan:
 *   cd backend
 *   npm install
 *   npm run dev
 * lalu buka: http://localhost:3000?to=Nama%20Tamu
 */
require('dotenv').config();
const express = require('express');
const path = require('path');
const wishesHandler = require('./api/wishes');

const app = express();
app.use(express.json());

// sajikan folder undangan/ sebagai root situs
app.use(express.static(path.join(__dirname, '..', 'undangan')));

// endpoint yang sama dengan production: GET (baca) & POST (kirim)
app.all('/api/wishes', (req, res) => wishesHandler(req, res));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\nUndangan jalan di: http://localhost:${PORT}`);
  console.log(`Coba dengan nama tamu: http://localhost:${PORT}?to=Nama%20Tamu\n`);
});
