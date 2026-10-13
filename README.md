# 🚨 CityReport — Smart Community Road & Incident Map

> **Platform Pemantauan & Pelaporan Gangguan Jalan Real-Time Berbasis Komunitas**

CityReport adalah aplikasi web & mobile interaktif yang dirancang untuk pelaporan cepat kondisi infrastruktur jalan (seperti jalan berlubang, banjir, lampu penerangan jalan mati, pohon tumbang, kemacetan, dan kecelakaan lalu lintas).

---

## ✨ Fitur Unggulan

1. **Full-Screen Interactive Map (OpenStreetMap)**:
   - Tampilan peta langsung penuh 100% tanpa halaman pembuka (*landing page*) panjang.
   - Marker khusus dengan animasi *pulsing ring* berwarna sesuai kategori gangguan.
   - Penggunaan ubin **OpenStreetMap publik gratis** tanpa perlu API key.
2. **Floating UI Ergonomis**:
   - **Floating Search Bar**: Pencarian lokasi dan chip filter kategori instan.
   - **Floating Action Buttons (FAB)**: Tombol *Lokasi Saya* (GPS radar), tombol *Laporkan (+)*, dan penggantian gaya peta (*Dark / Satelit / Standar*).
3. **Interactive Draggable Bottom Sheet**:
   - Menampilkan ringkasan dan daftar gangguan di sekitar pengguna yang diurutkan berdasarkan jarak (km).
   - Mode detail lengkap: foto bukti lapangan, status, hitung mundur kedaluwarsa, dan integrasi navigasi ke Google Maps.
4. **Alur Tanpa Hambatan (Frictionless / No-Login Required for View)**:
   - Siapa saja dapat menjelajahi peta, melihat detail gangguan, dan mengecek rute **tanpa perlu registrasi/login**.
   - Otentikasi Google hanya diwajibkan saat pengguna ingin mengirimkan laporan atau memvalidasi status demi mencegah spam.
5. **Mekanisme Validasi Komunitas & Kedaluwarsa**:
   - Tombol konfirmasi warga: **"Masih Terjadi"** (memperpanjang durasi aktif) dan **"Sudah Selesai"** (mengubah status menjadi terselesaikan jika terkonfirmasi).
   - Laporan kedaluwarsa otomatis dalam 48 jam jika tidak ada konfirmasi lebih lanjut.
6. **Backend & Basis Data Supabase**:
   - Skema PostgreSQL siap pakai (`supabase/schema.sql`) dengan *Row Level Security (RLS)*, pemicu (*triggers*), dan bucket penyimpanan foto (`incident-photos`).

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Peta & Geospasial**: Leaflet, OpenStreetMap Tile Provider
- **Desain & Ikon**: Vanilla CSS (Modern Design Tokens, Glassmorphism, Micro-animations), Lucide React
- **Backend & Database**: Supabase (PostgreSQL, Row Level Security, Auth via Google OAuth, Storage)

---

## 📁 Struktur Direktori

```
city_report/
├── supabase/
│   ├── schema.sql           # DDL PostgreSQL, RLS Policies, Storage Buckets, Triggers
│   └── seed.sql             # Data awal contoh gangguan di Jakarta & sekitarnya
├── src/
│   ├── components/
│   │   ├── BottomSheet/     # Bottom Sheet geser & detail validasi
│   │   ├── FAB/             # Floating Action Buttons (Lokasi, +, Layer)
│   │   ├── Header/          # Floating Search Bar & Kategori Filter
│   │   ├── Map/             # Peta Full-screen Leaflet & OpenStreetMap
│   │   └── Modal/           # Form Laporan Gangguan & Google Auth Gate
│   ├── hooks/
│   │   ├── useGeolocation.ts # Deteksi GPS akurasi tinggi
│   │   └── useIncidents.ts  # Sinkronisasi data & mekanisme vote komunitas
│   ├── lib/
│   │   ├── supabase.ts      # Klien Supabase & Google Sign-In helper
│   │   └── mockData.ts      # Data gangguan offline / fallback
│   ├── styles/              # Desain sistem & animasi CSS
│   ├── types/               # TypeScript interfaces & Enums
│   ├── App.tsx              # Komponen utama
│   └── main.tsx
├── .env.example             # Contoh variabel lingkungan Supabase
└── README.md
```

---

## 🚀 Memulai (Quick Start)

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Konfigurasi Lingkungan (Opsional untuk Supabase)
Salin berkas `.env.example` ke `.env`:
```bash
cp .env.example .env
```
Isi nilai kredensial Supabase Anda:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
> *Catatan: Aplikasi memiliki fallback bawaan lokal & mode demo, sehingga dapat langsung dijalankan dan diuji bahkan sebelum menghubungkan Supabase!*

### 3. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser di [http://localhost:5173](http://localhost:5173).

### 4. Build Produksi
```bash
npm run build
```

---

## 📜 Lisensi
MIT License © 2026 CityReport Team.
