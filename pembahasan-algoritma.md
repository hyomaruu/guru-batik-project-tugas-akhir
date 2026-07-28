# Pembahasan Algoritma Sistem Guru Batik

Aplikasi Guru Batik ini menggunakan perpaduan algoritma analisis deskriptif dan prediktif (Machine Learning) untuk melakukan segmentasi pelanggan tingkat lanjut. Ada dua algoritma utama yang bekerja berdampingan: **Analisis RFM** dan **K-Means Clustering**.

Berikut adalah pembahasan detail mengenai cara kerja masing-masing algoritma dalam aplikasi ini:

---

## 1. Analisis RFM (Recency, Frequency, Monetary)

RFM bukanlah algoritma Machine Learning murni, melainkan kerangka analisis pemasaran berbasis aturan (*rule-based*) untuk menilai perilaku belanja pelanggan berdasarkan tiga dimensi waktu dan moneter.

### A. Tiga Dimensi RFM
1. **Recency (R)**: Jumlah hari berlalu sejak pelanggan melakukan transaksi terakhir. (Semakin kecil semakin baik).
2. **Frequency (F)**: Total jumlah transaksi yang dilakukan pelanggan. (Semakin besar semakin baik).
3. **Monetary (M)**: Total uang yang dibelanjakan oleh pelanggan dalam rentang waktu tertentu. (Semakin besar semakin baik).

### B. Tahapan Algoritma RFM dalam Sistem
Sistem *Backend (Golang)* melakukan perhitungan dengan langkah-langkah berikut:

1. **Pengumpulan Data Mentah (Agregasi):**
   Sistem membaca seluruh data dari tabel `transactions`. Untuk setiap pelanggan, dicari:
   * Tanggal transaksi paling baru (`MAX(transaction_date)`).
   * Total jumlah baris transaksi (`COUNT(id)`).
   * Total pengeluaran (`SUM(amount)`).

2. **Pembentukan Skor (Quintile Scoring 1-5):**
   Nilai-nilai R, F, dan M tersebut kemudian diurutkan dari seluruh data pelanggan dan dibagi ke dalam 5 bagian yang sama besar (Quintile).
   * **Skor R**: Pelanggan yang baru saja berbelanja diberi skor 5, yang paling lama diberi skor 1.
   * **Skor F**: Pelanggan yang paling sering belanja diberi skor 5, paling jarang skor 1.
   * **Skor M**: Pelanggan dengan total uang terbanyak diberi skor 5, paling sedikit skor 1.

3. **Pengelompokan Segmen (Segmentation Labeling):**
   Sistem akan menggabungkan skor `R` dan `F` (sering kali `M` juga menjadi pertimbangan tambahan) untuk menentukan label baku. Aturan IF-ELSE diterapkan di sini. Contoh:
   * Jika $R=5, F=5, M=5$, pelanggan masuk ke label **"Champions"**.
   * Jika $R=1, F=1, M=1$, pelanggan masuk ke label **"Hibernating"** atau **"Lost"**.
   * Jika $R=2, F=5, M=5$, pelanggan masuk ke label **"At Risk"** (Sering belanja, tapi belakangan ini menghilang).

**Kelebihan RFM**: Sangat transparan, mudah diinterpretasikan oleh admin dan pemilik toko.

---

## 2. K-Means Clustering (Unsupervised Machine Learning)

K-Means digunakan ketika admin ingin sistem mencari *pola tersembunyi* dan membagi pelanggan ke dalam $K$ kelompok (klaster) tanpa harus menentukan aturan IF-ELSE manual seperti RFM.

Algoritma ini diimplementasikan di **ML Service (Python)** dengan library *Scikit-Learn*. Algoritma tidak bekerja langsung dari data mentah, melainkan menggunakan hasil hitung Recency, Frequency, dan Monetary yang sudah dicari sebelumnya.

### A. Tahapan Algoritma K-Means

1. **Persiapan Data (Preprocessing & Scaling):**
   Data (R, F, M) memiliki satuan yang sangat berbeda. Recency bersatuan "hari" (misal: 10), Frequency bersatuan "kali" (misal: 2), dan Monetary bersatuan "Rupiah" (misal: 1.000.000). 
   Agar Monetary tidak mendominasi perhitungan jarak, dilakukan standardisasi (Z-Score Normalization) menggunakan fungsi StandardScaler:
   
   $z = \frac{(x - \mu)}{\sigma}$
   
   Sehingga ketiga dimensi kini memiliki rata-rata 0 dan variansi 1.

2. **Inisialisasi Pusat Klaster (Centroids):**
   K-Means memilih $K$ titik secara acak dari data sebagai titik tengah awal (*centroid*). Jumlah $K$ ditentukan oleh Admin melalui antarmuka web.

3. **Perhitungan Jarak Euclidean (Assignment Step):**
   Sistem menghitung jarak tiap pelanggan ke semua *centroid* yang ada menggunakan formula *Euclidean Distance*:
   
   $d(p, q) = \sqrt{(p_R - q_R)^2 + (p_F - q_F)^2 + (p_M - q_M)^2}$

   Pelanggan dimasukkan ke dalam klaster yang *centroid*-nya paling dekat dengannya.

4. **Pembaruan Centroid (Update Step):**
   Setelah semua pelanggan memiliki klaster, posisi *centroid* digeser. Titik baru *centroid* dihitung berdasarkan nilai rata-rata (mean) R, F, dan M dari semua pelanggan di dalam klaster tersebut.

5. **Konvergensi (Iterasi):**
   Langkah 3 dan 4 diulang terus-menerus hingga letak *centroid* tidak lagi berubah (konvergen).

### B. PCA (Principal Component Analysis)
Karena data memiliki 3 Dimensi (R, F, M), kita tidak bisa melihat grafiknya dalam layar 2D dengan mudah. Di sinilah **PCA (Principal Component Analysis)** digunakan.
Algoritma PCA merangkum informasi dari 3 dimensi (R, F, M) menjadi 2 Dimensi (PCA_X, PCA_Y) dengan tetap menjaga variansi data semaksimal mungkin. Hasil inilah yang Anda lihat pada grafik titik (*Scatter Plot*) di halaman admin.

### C. Penentuan "Prioritas" Otomatis
Setelah K-Means selesai menentukan klaster, sistem Go Backend melakukan perhitungan statistik (Rata-rata Moneter dan Frekuensi) untuk setiap klaster yang terbentuk dan menyematkan **Label Prioritas Otomatis**:
- Jika nilai Monetary & Frequency rata-ratanya tinggi, klaster otomatis dinamai **"HIGH Priority"**.
- Jika rendah, dinamai **"LOW Priority"**.

---

## 3. Kombinasi Hybrid (RFM + K-Means)

Aplikasi Guru Batik ini merupakan implementasi **Hybrid AI Pipeline**.
1. Golang menghitung metrik RFM murni.
2. Hasil perhitungan Golang dilempar ke Python via HTTP API.
3. Python membersihkan (StandardScaler), menjalankan ML (K-Means), dan memproyeksikan visualisasinya (PCA).
4. Golang menerima hasilnya dan menyimpannya ke database untuk dianalisis dan diekspor (PDF) oleh Admin.

Hasil akhirnya, Anda mendapatkan keuntungan ganda: Penjelasan logis berbasis manusia (RFM Segments) dan kemampuan menemukan kelompok pelanggan tersembunyi (K-Means Clusters).
