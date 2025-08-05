# NBPoser Auto Mining Bot

Bot ini menjalankan proses mining otomatis setiap 30 menit menggunakan token dari NBPoser. Token disimpan di file `.env` dan tidak memerlukan login email/password.

## 📦 Fitur

- ✅ Auto-mining setiap 30 menit
- 🕒 Menyimpan waktu mining terakhir
- 📁 Log aktivitas ke `log.txt`
- 🔐 Menggunakan token pribadi dari file `.env`
- 📊 Mengambil informasi tambahan:
  - User Info
  - Authentication Details
  - Notice Center
  - Asset List
  - Node Info

---

## ⚙️ Cara Install

```bash
git clone https://github.com/masbad123/nbposer-auto-claim.git
cd nbposer-auto-claim
npm install
```

---

## 📄 Konfigurasi Token

Buat file `.env` di direktori utama dan isi seperti ini:

```
TOKEN=masukkan_token_kamu_disini
```

---

## 🚀 Jalankan Bot

```bash
node miner.js
```

Bot akan berjalan terus dan mining otomatis setiap 30 menit.

---

## 📂 Struktur File

```
nbposer-auto-claim/
├── miner.js           # Script utama
├── .env               # File token pribadi
├── log.txt            # File log mining
├── last_mining.json   # Menyimpan waktu mining terakhir
├── package.json       # Konfigurasi Node.js
└── README.md          # Dokumentasi ini
```

---

## 📜 Lisensi

MIT License.

---

## 🙋 FAQ

**Q: Bot ini login pakai email?**\
A: Tidak, hanya butuh token dari NBPoser.

**Q: Bagaimana mendapatkan token?**\
A: Bisa ambil token dari aplikasi NBPoser di tools browser atau dari API aktif (Bearer Token).

**Q: Bisa dihosting 24 jam?**\
A: Ya, bisa dijalankan di VPS atau layanan seperti Replit / Railway / Render / PM2 / Docker.

---

Happy mining! ⛏️

