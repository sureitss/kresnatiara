# Wishes API (create + read) — versi Turso

Endpoint serverless (format Vercel: `module.exports = async (req, res) => {...}`)
untuk menyimpan dan membaca ucapan/RSVP, sekarang pakai **Turso** (database
SQLite yang di-hosting, diakses lewat HTTPS + token — bukan koneksi socket
MySQL langsung, jadi tidak ada masalah "IP diblokir" seperti sebelumnya).

## 1. Buat database Turso

Install CLI-nya dulu (sekali saja):

```bash
# Windows (lewat PowerShell) — atau lihat cara lain di https://docs.turso.tech/cli/installation
irm get.tur.so/install.ps1 | iex
```

Lalu:

```bash
turso auth signup        # atau `turso auth login` kalau sudah punya akun
turso db create wed-ilham-sahitya
turso db show wed-ilham-sahitya --url          # -> jadi TURSO_DATABASE_URL
turso db tokens create wed-ilham-sahitya       # -> jadi TURSO_AUTH_TOKEN
```

Salin dua nilai itu ke `.env` (`TURSO_DATABASE_URL` & `TURSO_AUTH_TOKEN`).

## 2. Buat tabelnya

```bash
turso db shell wed-ilham-sahitya < schema.sql
```

## 3. Struktur project

```
backend/
├── api/
│   └── wishes.js       ← endpoint GET (baca) & POST (kirim)
├── .env                 ← kredensial asli (JANGAN dicommit ke git publik)
├── .env.example
├── schema.sql
├── dev-server.js        ← untuk coba di lokal
└── package.json
```

## 4. Coba di lokal

```bash
cd backend
npm install
npm run dev
```

Lalu buka:

```
http://localhost:3000
http://localhost:3000?to=Nama%20Tamu     ← untuk cek nama tamu dari URL
```

Form RSVP, tombol salin rekening, galeri, dan countdown semua langsung bisa
dicoba. Kalau gagal, error `DB_READ_FAILED` / `DB_WRITE_FAILED` di terminal
biasanya berarti `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` di `.env` salah,
atau tabelnya belum dibuat (ulangi langkah 2).

> Tinggal dua klik buka `undangan/index.html` langsung juga bisa untuk lihat
> tampilan, tapi RSVP/ucapan tidak akan berfungsi tanpa server. `npm run dev`
> jauh lebih akurat karena backend-nya ikut jalan.

## 5. Deploy ke Vercel

```bash
cd backend
vercel          # login & deploy pertama kali
```

Masukkan `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, dan `DB_TABLE` ke
**Project Settings → Environment Variables** di dashboard Vercel. File
`.env` lokal hanya dipakai kalau kamu jalankan lewat komputer sendiri.

Kalau `undangan/index.html` ikut dideploy di project Vercel yang sama,
endpoint otomatis bisa diakses lewat path relatif `/api/wishes` — tidak
perlu domain terpisah.

## 6. Cara pakai endpoint

**Baca ucapan (GET)**
```
GET /api/wishes?limit=50
```
Balasan: array `[{id, name, message, status, created_at}, ...]`, terbaru
di atas.

**Kirim ucapan (POST)**
```
POST /api/wishes
Content-Type: application/json

{ "name": "Ahmad", "message": "Selamat menempuh hidup baru!", "status": "Hadir" }
```
`status` hanya menerima `"Hadir"` atau `"Tidak Hadir"`. Balasan: objek
ucapan yang baru dibuat (201), atau `{ "error": "BAD_REQUEST" }` (400) kalau
data tidak lengkap/valid.

## Kenapa pindah dari MySQL ke Turso?

Database MySQL sebelumnya (di `103.139.47.170`) menolak koneksi dari luar
kecuali IP-nya di-whitelist lewat cPanel "Remote MySQL" — cocok untuk
aplikasi yang jalan di server yang sama, tapi merepotkan untuk dev lokal
atau serverless (IP Vercel berubah-ubah, jadi whitelist per-IP tidak
praktis). Turso diakses lewat HTTPS + token, bukan IP whitelist, jadi jalan
dari mana saja tanpa konfigurasi tambahan di sisi hosting.

## Catatan keamanan

- `.env` berisi token asli — jangan diunggah ke repo publik. Tambahkan
  `.env` ke `.gitignore`.
- Nama tabel divalidasi (hanya huruf/angka/underscore) sebelum dipakai di
  query, jadi aman meski diambil dari env var.
- Pertimbangkan menambah rate limiting kalau endpoint ini publik, supaya
  tidak dibanjiri spam ucapan.
