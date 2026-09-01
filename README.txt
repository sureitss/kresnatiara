UNDANGAN DIGITAL — BUDI & SINTA
================================

STRUKTUR FOLDER
----------------
undangan/
├── index.html
├── foto/
│   ├── 3124.jpg        -> foto cover / opening
│   ├── 3130.jpg        -> foto slide salam pembuka (1)
│   ├── 3132.jpg        -> foto slide salam pembuka (2)
│   ├── 3196.jpg        -> foto groom (Budi)
│   ├── 3198.jpg        -> foto bride (Sinta)
│   ├── 3163.jpg        -> foto save the date
│   ├── 3187.jpg        -> foto background (bagian Waktu & Tempat)
│   └── gallery1.jpg ... gallery8.jpg  -> foto grid galeri (ubah jumlahnya
│         lewat variabel GALLERY_COUNT di dalam index.html)
└── audio/
    └── sound.mp3       -> musik latar, otomatis diputar setelah tombol
                            "Buka Undangan" ditekan

Kalau salah satu file foto/audio belum ada, halaman TIDAK akan error —
otomatis diganti foto contoh dari internet (dummy) supaya tampilannya
tetap bisa dicek. Tinggal timpa file dengan nama yang sama di folder foto/
kalau foto asli sudah siap.

NAMA TAMU LEWAT URL
--------------------
Tambahkan parameter ?to= di akhir link, contoh:

  https://domainkamu.com/index.html?to=Bapak%20Ahmad

Spasi bisa pakai %20 atau tanda +. Kalau parameter tidak diisi, akan
tampil "Tamu Undangan".

YANG PERLU KAMU GANTI SENDIRI
-------------------------------
1. Nomor rekening & nama pemilik di bagian "Wedding Gift" (masih contoh).
2. Tanggal countdown ada di index.html, cari baris:
     const WEDDING_DATE = "2026-10-14T08:00:00+07:00";
3. Jumlah foto galeri: variabel GALLERY_COUNT di index.html.

CATATAN PENTING SOAL RSVP / UCAPAN
------------------------------------
File ini adalah HTML statis (tanpa server/database). Form ucapan & 
konfirmasi kehadiran saat ini menyimpan data di localStorage browser 
MASING-MASING tamu — artinya ucapan dari tamu A tidak akan otomatis 
muncul di HP tamu B, karena tidak ada server yang menyimpan data secara 
terpusat. Ini cukup untuk keperluan tampilan/demo.

Kalau kamu mau semua ucapan tamu benar-benar terkumpul di satu tempat 
(dan bisa kamu lihat semua), form ini perlu dihubungkan ke layanan luar, 
misalnya Google Form + Google Sheets, atau Firebase. Bilang saja kalau 
mau aku bantu sambungkan salah satunya.

CARA PAKAI CEPAT
------------------
1. Buka index.html langsung di browser untuk cek tampilan (masih pakai 
   foto dummy kalau foto asli belum ditaruh).
2. Upload seluruh folder (index.html + foto/ + audio/) ke hosting kamu 
   (bisa hosting gratis seperti Netlify/GitHub Pages/Vercel, atau hosting 
   biasa via cPanel).
3. Bagikan link + ?to=NamaTamu ke masing-masing tamu.
