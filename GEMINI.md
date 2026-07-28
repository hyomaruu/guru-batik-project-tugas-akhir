<!-- CODEGRAPH_START -->
## 1. CodeGraph

In repositories indexed by CodeGraph (a `.codegraph/` directory exists at the repo root), reach for it BEFORE grep/find or reading files when you need to understand or locate code:

- **MCP tool** (when available): `codegraph_explore` answers most code questions in one call — the relevant symbols' verbatim source plus the call paths between them, including dynamic-dispatch hops grep can't follow. Name a file or symbol in the query to read its current line-numbered source. If it's listed but deferred, load it by name via tool search.
- **Shell** (always works): `codegraph explore "<symbol names or question>"` prints the same output.

If there is no `.codegraph/` directory, skip CodeGraph entirely — indexing is the user's decision.
<!-- CODEGRAPH_END -->

## 2. Arsitektur Proyek & Referensi Konteks (WAJIB DIBACA!)
Sistem "Guru Batik" adalah aplikasi berbasis **Microservices** dan Docker yang terbagi dalam tiga layanan utama:
- **Frontend**: Next.js 14 / TypeScript / TailwindCSS (di dalam direktori `app_build/frontend`)
- **Backend**: Go (Golang 1.22) / Fiber / PostgreSQL / GORM (di dalam direktori `app_build/backend`)
- **Machine Learning Service**: Python / FastAPI / Scikit-learn untuk K-Means Clustering (di dalam direktori `app_build/ml-service`)

> [!IMPORTANT]
> Sebelum menambahkan atau memodifikasi fitur baru, merubah skema database, atau menyentuh alur integrasi antar layanan, agen AI **WAJIB** membaca dan meniru pola/aturan standar pada dokumentasi utama sistem:
> 1. `informasi_sistem.MD` - Rencana spesifikasi, use case, struktur entitas, dan daftar library resmi yang dipakai.
> 2. `diagram-sistem.md` - Referensi diagram alur sistem dan rancangan bisnis lokal.
> 3. `isi_database.md` - Spesifikasi isi dan rancangan relasional tabel database aktual.

---

## 3. Aturan Verifikasi Kode Mandiri (Self-Verification Rules)
Setiap agen AI dilarang menyelesaikan tugas dengan keadaan build rusak (*broken build*). Selalu eksekusi pengecekan syntax dan testing di terminal lokal setiap selesai melakukan pengubahan file kode:
- **Pada Backend (Go)**: Jalankan verifikasi build di dalam foldernya dengan perintah:
  `cd app_build/backend && go test ./...` atau `cd app_build/backend && go build ./...`
- **Pada Frontend (TypeScript / Next.js)**: Verifikasi kesesuaian TypeScript secara statik tanpa menghasilkan file output dengan menjalankan:
  `cd app_build/frontend && npx tsc --noEmit`

---

## 4. Pengoptimalan Alur Kerja (Workflows & Skills)
- **Code Explorer**: Manfaatkan semaksimal mungkin fungsionalitas **CodeGraph** untuk mengecek asal-usul simbol fungsi dibanding membanjiri sistem dengan perintah grep manual.
- **Matt Pocock Skills**: Saat melakukan analisa mendalam pada kode ataupun meraba sumber kendala pada alur pengetesan (*bug tracking*), pertimbangkan untuk memverifikasi langkah-langkah di skill yang relevan pada direktori `.agents/skills/` (misal: `diagnosing-bugs` atau `tdd`).

