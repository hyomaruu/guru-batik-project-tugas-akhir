# Walkthrough — Sistem Informasi UMKM Guru Batik

## Apa yang Dibangun

Sistem informasi microservices lengkap dengan **42 file** yang mencakup:

| Service | Teknologi | Port |
|---|---|---|
| Frontend | Next.js 14 + Tailwind CSS | `:3000` |
| Backend API | Go (Fiber) + GORM + PostgreSQL | `:8080` |
| ML Service | Python FastAPI + scikit-learn | `:8000` |
| Database | PostgreSQL 16 | `:5432` |

---

## Cara Menjalankan

### 1. Copy environment variables
```bash
cd skills-codelab/app_build
copy .env.example .env
```

### 2. Jalankan semua service
```bash
docker-compose up --build
```

> Pertama kali build memerlukan 5–10 menit untuk download images dan install dependencies.

### 3. Akses aplikasi
| URL | Keterangan |
|---|---|
| `http://localhost:3000` | Portal Berita Publik |
| `http://localhost:3000/admin/login` | Login Admin |
| `http://localhost:8080/api/v1/health` | Backend health check |
| `http://localhost:8000/ml/health` | ML service health check |
| `http://localhost:8000/ml/docs` | FastAPI Swagger UI |

### 4. Kredensial Admin Default
```
Email    : admin@gurubatik.id
Password : admin123
```

---

## Struktur File yang Dibangun

```
app_build/
├── docker-compose.yml          # Orkestrasi semua service
├── .env.example                # Template environment variables
│
├── backend/                    # Go API
│   ├── cmd/server/main.go      # Entry point + routing
│   ├── internal/
│   │   ├── config/config.go    # Config loader
│   │   ├── database/db.go      # GORM connection pool
│   │   ├── model/              # Article, Customer, Transaction, RFM, Cluster models
│   │   ├── handler/            # auth.go, article.go, customer.go, rfm.go
│   │   └── middleware/auth.go  # JWT middleware
│   ├── migrations/
│   │   ├── 001_schema.sql      # Schema + indexes + triggers
│   │   └── 002_seed.sql        # 1 admin + 5 artikel + 50 pelanggan + 100+ transaksi
│   ├── go.mod
│   └── Dockerfile
│
├── ml-service/                 # Python FastAPI
│   ├── app/
│   │   ├── main.py             # FastAPI app
│   │   ├── routers/segmentation.py  # Endpoint K-Means + Elbow
│   │   └── services/kmeans.py  # K-Means logic: normalize → cluster → PCA → name
│   ├── requirements.txt
│   └── Dockerfile
│
└── frontend/                   # Next.js 14
    ├── src/app/
    │   ├── (public)/           # Portal publik (tema hangat)
    │   │   ├── page.tsx        # Beranda: hero + stats + berita
    │   │   ├── berita/         # List berita (search + filter + pagination)
    │   │   │   └── [slug]/     # Detail artikel
    │   │   └── tentang/        # Tentang kami + timeline
    │   └── admin/              # Admin (tema monokrom)
    │       ├── login/          # Form login JWT
    │       ├── dashboard/      # KPI cards + bar chart + quick actions
    │       ├── berita/         # CRUD artikel + TipTap editor
    │       ├── pelanggan/      # CRUD + upload CSV + modal transaksi
    │       └── segmentasi/
    │           ├── rfm/        # Hitung RFM + tabel skor dot-visualization
    │           └── kmeans/     # Slider k + scatter plot PCA + tabel prioritas
    ├── src/components/
    │   ├── public/             # Navbar, Footer, ArticleCard
    │   └── admin/              # Sidebar, Topbar, TipTapEditor, ArticleEditor
    └── src/lib/api.ts          # API client terpusat
```

---

## Alur Kerja Segmentasi Pelanggan

```
Admin klik "Hitung RFM"
    │
    ▼
Go Backend: SQL NTILE(5) quintile scoring
    ├── Recency  = MAX(tx_date) per pelanggan → skor 1-5 (lebih baru = lebih baik)
    ├── Frequency = COUNT(tx) per pelanggan → skor 1-5
    └── Monetary  = SUM(amount) per pelanggan → skor 1-5
    │
    ▼
Tersimpan di tabel rfm_scores
    │
Admin klik "Jalankan K-Means (k=3)"
    │
    ▼
Go Backend → POST ke FastAPI /ml/clustering/kmeans
    │
    ▼
Python ML Service:
    1. StandardScaler (normalize R, F, M)
    2. KMeans(init="k-means++", n_init=10)
    3. PCA(2D) untuk scatter plot
    4. Composite scoring → assign nama + prioritas
    5. Simpan ke tabel cluster_runs + cluster_results
    │
    ▼
Frontend: tampilkan scatter plot + kartu cluster + tabel prioritas
```

---

## Desain UI

### Portal Publik (Tema Hangat)
- Background: `#FFFBF5` (warm off-white)
- Primary: `#C4612A` (terracotta)
- Accent: `#E8A838` (amber gold)
- Font display: Playfair Display (serif)
- Hero: radial gradient amber + terracotta
- Cards: shadow hangat `rgba(196,97,42, 0.15)`

### Admin Dasbor (Monokrom Vercel)
- Canvas: `#ffffff` / `#fafafa`
- Ink: `#171717`
- Hairline: `#ebebeb`
- Font: Inter (sans) + JetBrains Mono (labels teknis)
- Elevation: stacked shadow system Level 1–5
- Components: `ex-data-table-cell`, `ex-app-shell-row`, `form-input` dari vercel-DESIGN.md

---

## Untuk Development Lokal (Tanpa Docker)

### Backend Go
```bash
cd app_build/backend
go mod tidy
# Set environment variable DATABASE_URL dan JWT_SECRET
go run cmd/server/main.go
```

### ML Service Python
```bash
cd app_build/ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Next.js
```bash
cd app_build/frontend
npm install
npm run dev
```

---

## Data Seed yang Tersedia

- **1 Admin**: `admin@gurubatik.id` / `admin123`
- **5 Artikel**: sudah dipublikasikan (berbagai kategori)
- **50 Pelanggan**: dengan variasi nama dan lokasi
- **100+ Transaksi**: dirancang untuk menghasilkan 4 cluster bermakna:
  - Champions (pelanggan 1–5): sering beli, baru, nilai besar
  - Loyal Customers (6–15): frekuensi sedang, nilai sedang
  - At Risk (16–25): sudah 4–8 bulan tidak beli
  - Hibernating (26–40): >9 bulan tidak aktif
  - New/One-time (41–50): baru beli sekali

---

## Update Fitur Baru: Pengaturan User & Website

Telah ditambahkan fitur baru di dalam Dasbor Admin yaitu **Halaman Pengaturan** (`/admin/pengaturan`) untuk mengontrol preferensi akun dan tampilan aplikasi:

### 1. Pengaturan Profil Admin
- **Akses Pengaturan:**
  Masuk ke menu **Pengaturan** di _sidebar_ Dasbor Admin.
- **Ubah Profil:**
  Isi _username_ dan _password_ baru pada formulir. (Perubahan ini telah diperbaiki sehingga perubahan _username_ dapat langsung terlihat di navigasi atas setelah disimpan berkat mekanisme _event listener_ internal, dan masalah _Bad Request_ juga telah diselesaikan).
- **Dark Mode:**
  Klik _toggle switch_ mode gelap. Pengaturan ini akan tersimpan otomatis di perangkat dan diterapkan langsung tanpa _loading_. Semua grafik dan tabel kini telah dioptimalkan (menggunakan variabel warna adaptif CSS `var(--ink)`, `var(--canvas)`) untuk keterbacaan yang sempurna dalam mode gelap.

## 6. Manajemen Transaksi (Baru)

- **Menu Transaksi:**
  Akses melalui menu **Manajemen Transaksi** di bawah menu Pelanggan.
- **Daftar Transaksi:**
  Tabel ini akan memuat seluruh riwayat transaksi secara langsung beserta paginasinya. Data mencakup Tanggal, Nama Pelanggan, Keterangan, dan Nominal Rupiah.
- **Edit Transaksi:**
  Anda dapat menekan tombol **Edit** yang tersedia pada setiap baris data transaksi untuk mengubah Nominal, Tanggal, atau Keterangan transaksi tersebut secara langsung.

## 7. Paginasi K-Means Clustering

- **Tabel Detail Pelanggan:**
  Kini hasil clustering tidak lagi ditampilkan seluruhnya ke bawah secara sekaligus. Data dipotong dan ditampilkan dengan batas **15 baris per halaman**.
- **Navigasi Halaman:**
  Anda bisa menekan tombol halaman (1, 2, 3...) di bawah tabel K-Means untuk melihat daftar selanjutnya. Angka halaman juga akan me-reset dengan sendirinya apabila Anda memfilter daftar berdasarkan grup Cluster (klik pada legenda grafik).

## 8. Upload Gambar Thumbnail (Baru)

- **Upload Gambar Lokal:**
  Sekarang Anda bisa mengunggah file gambar (JPG, PNG, WebP) dari komputer Anda secara langsung saat membuat atau mengedit berita.
- **Penyimpanan Internal:**
  Gambar akan diunggah ke _backend_ dan disimpan secara permanen di dalam folder `uploads/images/`. _Server_ akan otomatis membuatkan tautan URL yang akan muncul di kolom URL Thumbnail.
- **Dukungan Hybrid:**
  Anda tetap bisa menggunakan URL eksternal secara manual jika tidak ingin mengunggah gambar.

## 9. Export PDF Laporan (Baru)

- **Tombol Export Terpusat:**
  Pada halaman **Manajemen Pelanggan**, **Transaksi**, **Analisis RFM**, dan **K-Means Clustering**, telah ditambahkan tombol **"Export PDF"**.
- **Format Resmi (Kop Surat):**
  Laporan PDF secara otomatis dibuat lengkap dengan **Kop Surat (Guru Batik)**, alamat perusahaan, dan garis pemisah.
- **Tabel Otomatis & Tanda Tangan:**
  Data yang Anda saring di layar akan di-_export_ menjadi tabel rapi dalam PDF (menyesuaikan warna tema). Pada bagian bawah laporan juga disertakan **Kolom Tanda Tangan** (misal: "Yogyakarta, [Tanggal hari ini]" beserta Pimpinan Perusahaan).

## 10. Perombakan Visual (Redesign) Admin Dashboard (Baru)

Sistem _UI Dashboard Admin_ kini telah ditingkatkan agar jauh lebih modern, mewah, dan interaktif (mengadaptasi gaya _Vercel Design System_ dengan sentuhan _Glassmorphism_):

- **Glassmorphism (Efek Kaca):** 
  _Sidebar_, _Topbar_, Kartu Statistik, dan Tabel kini terlihat melayang dengan efek tembus pandang (_blur_ latar belakang) yang sangat cantik.
- **Dynamic Backgrounds & Gradients:**
  Latar belakang kini memiliki pedaran gradasi warna biru dan ungu yang sangat halus. Tombol-tombol juga telah menggunakan _gradient shadow_ sehingga memiliki kedalaman (_depth_).
- **Animasi Mikro:**
  Ketika Anda menyorot (*hover*) pada tabel, kartu, atau menu _sidebar_, efek cahaya dan perpindahan elemen terasa jauh lebih mulus.
- **Dark Mode yang Disempurnakan:**
  Tampilan _Dark Mode_ kini menggunakan _deep black_ sejati untuk latar belakang dengan kontras teks dan tepian transparan bercahaya, membuatnya tidak menyilaukan mata sekaligus sangat keren.

## 11. Peningkatan Keamanan Tipe (Type Safety) & Arsitektur Komponen (Baru)

Sistem telah di-refactor secara besar-besaran untuk memenuhi standar _Enterprise_ dengan implementasi TypeScript yang sangat ketat:

- **Tipe Data Terpusat (`src/lib/types.ts`):**
  Semua penggunaan tipe `any` telah dihilangkan dan diganti dengan antarmuka (_interface_) data yang presisi (seperti `Customer`, `Transaction`, `RFMResultsData`, `ClusterResultsData`, dll) yang persis mencocokkan struktur kembalian dari API _backend_.
- **API Interceptor 401 (Otomatis Logout):**
  Klien API kini dilengkapi interceptor pintar. Apabila sesi _token_ kedaluwarsa (mendapatkan respons 401), sistem akan langsung membersihkan _local storage_ dan menendang (redirect) pengguna kembali ke halaman Login secara otomatis tanpa error tampilan.
- **Pemisahan Komponen Monolitik:**
  File halaman yang awalnya sangat gemuk (seperti halaman Pelanggan dan Transaksi yang mencapai lebih dari 400 baris kode) telah dipecah. Formulis-formulir _modal_ kini dipisahkan menjadi komponen-komponen mandiri yang _reusable_ (`CustomerModal.tsx`, `TransactionModal.tsx`, `EditTransactionModal.tsx`), membuat struktur kode sangat rapi dan mudah dirawat di masa depan.
