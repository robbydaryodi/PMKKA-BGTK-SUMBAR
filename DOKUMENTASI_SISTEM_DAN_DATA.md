# 📘 DOKUMENTASI SISTEM INFORMASI PM-KKA BGTK SUMATERA BARAT 2026
**Panduan Komprehensif Arsitektur Sistem, Alur Kerja Bisnis, dan Struktur Basis Data**

---

## 1. Ringkasan Eksekutif & Domain Bisnis

### 1.1 Identitas Aplikasi
* **Nama Sistem**: Portal Sistem Informasi PM-KKA (Pendampingan Komunitas Belajar & Sekolah Model)
* **Instansi Pengembang & Pemilik**: Balai Guru dan Tenaga Kependidikan / Balai Guru Penggerak (BGTK) Provinsi Sumatera Barat — Kementerian Pendidikan Dasar dan Menengah (Kemendikdasmen) Republik Indonesia.
* **Tahun Anggaran / Operasional**: 2026

### 1.2 Latar Belakang & Tujuan
Aplikasi ini dibangun untuk mengorkestrasi, memantau, dan mendokumentasikan dua program intervensi pendidikan strategis di wilayah Provinsi Sumatera Barat:
1. **Track 1 — Program PMKKA Reguler (Kelompok Kerja / Komunitas Belajar)**:
   Program pendampingan berbasis komunitas belajar guru (KKG / MGMP / Komunitas Belajar) untuk **54 kelompok kerja sasaran terpilih** di seluruh kabupaten/kota Sumatera Barat dalam rangka akselerasi implementasi Kurikulum, Pembelajaran Mendalam (PM), dan Koding & Kecerdasan Artifisial (KKA).
2. **Track 2 — Program PMKKA Sekolah Model**:
   Program pendampingan intensif berkesinambungan bagi **25 Satuan Pendidikan Model sasaran** (PAUD, SD, SMP, SMA, SMK, SLB). Pendampingan menerapkan siklus observasi terstruktur (siklus TET: Tentukan, Evaluasi, Tindak Lanjut / Temu, Eksplorasi, Terapan), evaluasi instrumen rubrik baseline capaian, dan penerbitan Surat Tugas serta pelaporan resmi kedinasan.
3. **Pusat Monitoring Terpadu & Administrasi Kepegawaian**:
   Pengelolaan terpusat **57 Pegawai resmi BGTK Sumbar** (PNS, PPPK, PPNPN), direktori fasilitator, manajemen hak akses berjenjang (*Role-Based Access Control* / RBAC), serta penerbitan berkas resmi dinas (`.docx` Word dan `.xlsx` Excel).

---

## 2. Arsitektur Teknologi (Tech Stack)

Sistem mengusung arsitektur **Serverless Single-Page Application (SPA) / Multi-Page Web App** yang terintegrasi secara *realtime*:

```
+-----------------------------------------------------------------------------------+
|                           PENGGUNA / CLIENT BROWSER                              |
| (Super Admin, Admin Program, Admin Sekolah, Fasilitator, Ketua KK, Guru Sasaran)  |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                        FRONTEND RUNTIME (Client-Side)                             |
|  - HTML5 Semantic & Modern Vanilla ES6+ JavaScript                                |
|  - Tailwind CSS v3 (CDN Glassmorphism UI)                                         |
|  - SheetJS / xlsx (Parser Spreadsheet & Generator CSV LMS)                        |
|  - docx@9.0.0 (Client-side Microsoft Word Generator untuk Surat Tugas & Laporan)  |
|  - Chart.js (Visualisasi Radar & Bar Chart Evaluasi Rapor)                        |
|  - FileSaver.js (Ekspor file instan tanpa server backend)                         |
+-----------------------------------------------------------------------------------+
                     |                                       |
                     v                                       v
+--------------------------------------+   +----------------------------------------+
|        FIREBASE AUTHENTICATION       |   |       FIREBASE REALTIME DATABASE       |
|  - Google OAuth 2.0 Single Sign-On   |   |  - Cluster: asia-southeast1           |
|  - Whitelist domain kedinasan        |   |  - NoSQL Realtime Document-Tree        |
|    (@kemendikdasmen.go.id, belajar.id|   |  - Listener: once('value'), on('value')|
+--------------------------------------+   +----------------------------------------+
```

### Rincian Komponen Teknologi:
* **UI & Styling**: HTML5, Tailwind CSS via CDN dengan tema kustom *glassmorphism* (`backdrop-filter`, border semi-transparan, badge status dinamis).
* **Database Engine**: Firebase Realtime Database (`sekolah-model-2026-default-rtdb.asia-southeast1.firebasedatabase.app`), database NoSQL berbasis pohon JSON dengan latensi rendah.
* **Otentikasi**: Firebase Auth via Google Sign-In Popup, divalidasi ke node `master_pegawai`, `user_roles`, dan whitelist email.
* **Document Processing**:
  * `docx` (IIFE bundle): Menyusun dokumen dinas Word resmi lengkap dengan kop surat BGTK, tabel personil bertingkat, dan format tanda tangan digital.
  * `xlsx` (SheetJS): Mengonversi basis data peserta ke format CSV impor LMS resmi Kemendikdasmen dan buku kerja Excel (`.xlsx`).

---

## 3. Peta Halaman & Komponen Antarmuka (Pages Map)

| Berkas Halaman | Target Pengguna | Peran & Fungsionalitas |
| :--- | :--- | :--- |
| `index.html` | Publik & Seluruh Pengguna | Gerbang utama portal, menu pintas per peran, dan Modal Login Google SSO terpadu. |
| `admin.html` | Super Admin & Admin BGTK | Dasbor terpadu: Workflow PMKKA Reguler (4 tahap), Workflow Sekolah Model, Master Pegawai (57), RBAC Hak Akses. |
| `fasilitator.html` | Fasilitator Pendamping | Portal Widyaiswara/Pengawas/PTP: Kalender kegiatan, pengisian instrumen rubrik observasi kunjungan, unduh laporan Word, dan rapor baseline sekolah. |
| `submit-peserta-fkk.html` | Ketua Kelompok Kerja (KK) | Portal Ketua KK: Verifikasi email ketua, checklist seleksi peserta, deteksi peserta Sekolah Model, serta penandaan peringatan data anomali (Sindara). |
| `konfirmasipmkkareguler.html` | Ketua KK / Komunitas | Antarmuka alternatif verifikasi keikutsertaan Komunitas Belajar pada PMKKA Reguler. |
| `konfirmasi-kehadiran.html` | Sekolah Model Sasaran | Portal konfirmasi kehadiran pengawas pembina, kepala sekolah, dan guru sasaran pendampingan. |
| `persuratan.html` | Admin Persuratan BGTK | Master kalender jadwal kunjungan, rekapitulasi personil, dan generator Surat Tugas dinas otomatis format `.docx`. |
| `kehadiran.html` / `absen.html`| Peserta Kegiatan | Form presensi daring realtime untuk peserta kunjungan pendampingan di lapangan. |

---

## 4. Alur Kerja Bisnis (Core Workflows)

### 4.1 Track 1: Workflow PMKKA Reguler (Komunitas Belajar - 54 Sasaran)
Terdiri dari 4 tahapan sekuensial yang saling berkesinambungan:

```
[TAHAP 1: PEMILIHAN KOMBEL]
  │   - Dari master 1.804 komunitas di Sumatera Barat (kombel.csv),
  │     Admin menyaring dan menetapkan 54 sasaran (flag: is_sasaran = true).
  ▼
[TAHAP 2: PENUGASAN FASILITATOR & ADMIN]
  │   - Admin menugaskan Fasilitator Pendamping (Widyaiswara/Pengawas/PTP)
  │     dan Admin Pegawai BGTK ke masing-masing Kombel.
  │   - Tersedia fitur Merge Kombel untuk menggabungkan kombel kecil (merged_kombel_ids).
  ▼
[TAHAP 3: VERIFIKASI & SUBMISSION KETUA KK]
  │   - Ketua KK membuka portal submit-peserta-fkk.html dan login dengan email belajar.id.
  │   - Ketua melakukan checklist peserta aktif.
  │   - Sistem otomatis memberi tag peserta dari Sekolah Model (SM).
  │   - Anomali data (nama/email kosong) diarahkan untuk diperbaiki melalui sistem Sindara.
  │   - Ketua mengirimkan persetujuan (konfirmasi.is_konfirmasi = true).
  ▼
[TAHAP 4: PENGKELASAN & EXPORT CSV LMS]
      - Admin BGTK memvalidasi data submission.
      - Sistem mengekspor data peserta terkonfirmasi ke format standar CSV LMS Kemendikdasmen
        serta format Excel (.xlsx) per kelas/wilayah.
```

---

### 4.2 Track 2: Workflow PMKKA Sekolah Model (25 Sekolah Sasaran)

```
[1. Penetapan Baseline & Kebutuhan Mapel]
  │   - Pemetaan profil 25 Sekolah Model (data_status_sekolah_model.json).
  │   - Pemetaan kebutuhan guru mapel per sekolah (kebutuhan_mapel.json).
  ▼
[2. Penugasan Pendamping & Administrasi Persuratan]
  │   - Fasilitator dipetakan ke sekolah model (node: fasilitator_sekolah).
  │   - Portal persuratan.html menerbitkan Surat Tugas dinas otomatis (.docx).
  ▼
[3. Konfirmasi Kehadiran Pihak Sekolah]
  │   - Pengawas, Kepala Sekolah, dan Guru sasaran melakukan konfirmasi presensi
  │     melalui konfirmasi-kehadiran.html.
  ▼
[4. Kunjungan Observasi Lapangan (Siklus TET)]
  │   - Fasilitator mengisi jadwal, jam, status pelaksanaan siklus TET.
  │   - Pengisian instrumen rubrik penilaian:
  │       * Kategori A: Keunggulan Belajar Murid (skala 1-4)
  │       * Kategori B: Keunggulan Mengajar Pendidik (skala 1-4)
  │       * Kategori C: Keunggulan Kepemimpinan Kepala Sekolah (skala 1-4)
  │   - Dokumentasi kendala, solusi, rekomendasi tindak lanjut, dan daftar hadir.
  ▼
[5. Pelaporan & Analisis Rapor]
      - Fasilitator dan Admin mengunduh Laporan Kunjungan resmi dalam format Word (.docx)
        dan mengevaluasi grafik radar/bar komparasi baseline vs capaian aktual.
```

---

## 5. Struktur Basis Data (Firebase Database Schema)

Struktur data dalam Firebase Realtime Database disimpan dalam simpul (*root nodes*) berikut:

### 5.1 Node: `/master_pegawai/{nip_atau_id}`
Menyimpan master data 57 Pegawai resmi Balai Guru Penggerak / BGTK Sumatera Barat.
```json
{
  "197005042009012002": {
    "id": "197005042009012002",
    "no": 1,
    "nama_murni": "LEINDRAWATI MEGAHAYU",
    "nama_lengkap": "LEINDRAWATI MEGAHAYU, S.P.",
    "gelar_depan": "",
    "gelar_belakang": "S.P.",
    "nip": "197005042009012002",
    "nik": "1371...",
    "jenis_kelamin": "Perempuan",
    "tempat_lahir": "Padang",
    "tgl_lahir": "1970-05-04",
    "usia": "55",
    "pendidikan": "S1 Pertanian",
    "jabatan": "Pengembang Teknologi Pembelajaran Ahli Muda",
    "jenis_jabatan": "Fungsional Tertentu",
    "pangkat_golongan": "Penata Tk. I / III/d",
    "status_pegawai": "PNS",
    "satker": "Balai GTK Provinsi Sumatera Barat",
    "email_dikbud": "leindrawati.megahayu@kemendikdasmen.go.id",
    "email_pribadi": "leindrawatimegahayu70@gmail.com",
    "no_hp": "08126789xxxx",
    "is_active": true
  }
}
```

---

### 5.2 Node: `/master_kombel/{kombel_id}`
Menyimpan data komunitas belajar, penugasan fasilitator/admin, daftar anggota, dan status submission.
```json
{
  "kombel_123": {
    "id": "kombel_123",
    "nama_kombel": "KKG Guru Kelas SD Kota Padang",
    "id_komunitas": "KOM-100234",
    "mapel": "Guru Kelas SD",
    "jenjang": "SD",
    "provinsi": "Prov. Sumatera Barat",
    "kab_kota": "Kota Padang",
    "kecamatan": "Padang Barat",
    "nama_ketua": "Ahmad Fauzi, S.Pd.",
    "email": "ahmad.fauzi@guru.sd.belajar.id",
    "no_hp": "08137411xxxx",
    "jumlah_anggota": 35,
    "is_sasaran": true,
    "fasil_id": "fasil_01",
    "admin_fkk": "abidigi92@gmail.com",
    "admin_fkk_nama": "ABI RAFDHI, S.Kom.",
    "admin_fkk_nip": "199204062025211055",
    "merged_kombel_ids": ["kombel_124"],
    "merged_into_kombel_id": null,
    "peserta": [
      {
        "nama": "Siti Rahma, S.Pd.",
        "nip": "198801122011012003",
        "sekolah": "SD Negeri 01 Padang",
        "npsn": "10303992",
        "email": "siti.rahma@guru.sd.belajar.id",
        "no_hp": "0821xxxx",
        "is_sm": true,
        "catatan_ketua": ""
      }
    ],
    "selected_peserta_indices": [0, 1, 2, 4],
    "konfirmasi": {
      "is_konfirmasi": true,
      "tgl_konfirmasi": "2026-03-08T10:15:30Z",
      "konfirmasi_oleh": "ahmad.fauzi@guru.sd.belajar.id",
      "catatan": "Semua data peserta telah diverifikasi."
    }
  }
}
```

---

### 5.3 Node: `/status_sekolah_model/{npsn}`
Menyimpan profil 25 Sekolah Model sasaran beserta nilai baseline evaluasi PM dan KKA.
```json
{
  "10308593": {
    "npsn": "10308593",
    "nama_sekolah": "TK Citra Al Madina",
    "jenjang": "PAUD",
    "wilayah_upt": "BGTK Sumatera Barat",
    "provinsi": "Sumatera Barat",
    "kab_kota": "Kota Padang",
    "status_sekolah": "Swasta",
    "status_pelaksana_kka": "Pelaksana",
    "jumlah_guru": 5,
    "status_pemilihan": "Pemda",
    "pm": {
      "skor": 2.72,
      "kategori": "Maju",
      "murid": "Unggul",
      "guru": "Maju",
      "kepsek": "Berkembang",
      "sub_indikator": {
        "1_1_1": "Maju",
        "1_1_2": "Maju",
        "2_1_1": "Maju",
        "3_1_1": "Berkembang"
      }
    },
    "kka": {
      "skor": 1.62,
      "kategori": "Pra-Berkembang",
      "guru": "Unggul",
      "kepsek": "Berkembang",
      "sub_indikator": {
        "2_1_1": "Maju",
        "2_2_1": "Berkembang"
      }
    }
  }
}
```

---

### 5.4 Node: `/fasilitator/{fasil_id}` & `/fasilitator_sekolah/{fasil_id}`
Menyimpan profil fasilitator dan relasi pemetaan ke sekolah model sasaran.
```json
{
  "fasilitator": {
    "fasil_01": {
      "id": "fasil_01",
      "nama": "Surya Marlina, M. Pd.",
      "nip": "197503122000032001",
      "pangkat_gol": "Pembina / IV-a",
      "jabatan": "Pengembang Teknologi Pembelajaran",
      "instansi": "BGTK Sumbar",
      "kab_instansi": "Kota Pariaman",
      "kab_penugasan": "Kota Padang",
      "email": "surya.marlina@kemendikdasmen.go.id",
      "no_hp": "0812xxxx",
      "is_internal_bgtk": true
    }
  },
  "fasilitator_sekolah": {
    "fasil_01": ["10308593", "10303992"]
  }
}
```

---

### 5.5 Node: `/jadwal_kunjungan/{npsn}/kunjungan_{nomor}`
Menyimpan logistik tanggal, status kunjungan, instrumen rubrik penilaian, catatan TET, dan daftar hadir.
```json
{
  "10308593": {
    "kunjungan_1": {
      "tanggal": "2026-03-15",
      "jam_mulai": "08:00",
      "jam_selesai": "12:30",
      "status": "selesai",
      "fasil_id": "fasil_01",
      "fasil_nama": "Surya Marlina, M. Pd.",
      "partisipasi_guru": "Tinggi",
      "catatan_pelaksanaan": "Siklus TET berjalan terstruktur dan guru interaktif.",
      "kendala_ditemukan": "Perangkat lab komputer sebagian butuh pembaruan browser.",
      "rekomendasi_tindak_lanjut": "Koordinasi dengan teknisi sekolah sebelum kunjungan 2.",
      "rubrik": {
        "A1": 3,
        "A2": 4,
        "B1": 3,
        "B2": 3,
        "C1": 2
      },
      "daftar_hadir": {
        "hdr_01": {
          "nama": "Zulfa, S.Pd.",
          "peran": "Guru Kelas",
          "waktu": "2026-03-15 08:05:12"
        }
      }
    }
  }
}
```

---

### 5.6 Node: `/user_roles/{sanitized_email}`
Menyimpan matriks hak akses pengguna berbasis email (karakter `.` dan `@` disanitasi menjadi `_`).
```json
{
  "irawati_kemendikdasmen_go_id": {
    "email": "irawati@kemendikdasmen.go.id",
    "nama": "IRAWATI, S.Pd, M.Pd.",
    "role": "Super Admin",
    "permissions": {
      "dashboard": true,
      "kombel": true,
      "sekolah_model": true,
      "fasilitator": true,
      "jadwal_kunjungan": true,
      "setting_jadwal": true,
      "pegawai": true,
      "akses": true
    }
  }
}
```

---

## 6. Model Hak Akses & Matriks Keamanan (RBAC)

Otentikasi menggunakan Google OAuth 2.0. Begitu berhasil login, sistem membaca tingkatan otorisasi berikut:

1. **Super Admin** (`SUPER_ADMIN_EMAILS`):
   * Hak akses absolut (CRUD) di seluruh modul: Dasbor Utama, PMKKA Reguler, Sekolah Model, Master Pegawai BGTK, dan Konfigurasi Hak Akses.
2. **Admin Program / Admin FKK** (`ADMIN_FKK_MAPPING`):
   * Bertanggung jawab terhadap pendampingan Kombel (Tahap 1 s.d. Tahap 4), manajemen fasilitator kombel, dan ekspor LMS.
3. **Admin Sekolah Model**:
   * Bertanggung jawab mengelola 25 sekolah model, penugasan pendamping, jadwal kunjungan, dan status baseline capaian.
4. **Admin Pegawai**:
   * Mengelola data 57 staf dan integrasi data profil pegawai BGTK.
5. **Fasilitator**:
   * Akses terbatas pada portal `fasilitator.html` untuk sekolah/kombel yang ditugaskan kepada dirinya.
6. **Ketua KK / Pihak Sekolah (Akses Publik Terverifikasi)**:
   * Mengakses form seleksi/konfirmasi dengan verifikasi email `belajar.id` atau NPSN tanpa memerlukan akun admin.

---

## 7. Kamus Rubrik Penilaian (Rubric Dictionaries)

Skala evaluasi instrumen terdiri dari 4 tingkat:
* **1 = Pra-Berkembang**
* **2 = Berkembang**
* **3 = Maju**
* **4 = Unggul**

### 7.1 Dimensi Pembelajaran Mendalam (PM)
* **Domain 1: Murid (Budaya Belajar)**
  * `1.1.1` Memuliakan
  * `1.1.2` Berkesadaran
  * `1.1.3` Bermakna
  * `1.1.4` Menggembirakan
  * `1.1.5` Otonomi Belajar
  * `1.1.6` Refleksi
* **Domain 2: Guru (Mengajar Efektif, Asesmen & Pengembangan Diri)**
  * `2.1.1` Memuliakan dalam Pembelajaran
  * `2.1.2` Pengelolaan Pembelajaran Efektif
  * `2.1.3` Refleksi Pendidik
  * `2.2.1` Asesmen Formatif
  * `2.2.2` Asesmen Sumatif Otentik
  * `2.3.1` Belajar secara Mandiri
  * `2.3.2` Belajar bersama Komunitas
* **Domain 3: Kepala Satuan Pendidikan (Kepemimpinan & Ekosistem)**
  * `3.1.1 - 3.1.4` Kepemimpinan PM, Penyelarasan Visi Misi, Supervisi Instruksional, Refleksi
  * `3.2.1 - 3.2.3` Pengelolaan Sumber Daya dan Kapasitas PTK
  * `3.3.1 - 3.3.2` Kemitraan Orang Tua/Masyarakat & Lingkungan Belajar Aman
  * `3.4.1 - 3.4.2` Pemanfaatan & Penguatan Infrastruktur TIK

### 7.2 Dimensi Koding dan Kecerdasan Artifisial (KKA)
* **Domain 1: Murid**
  * `1.1.1` Projek Koding dan KA yang dikembangkan murid
* **Domain 2: Guru**
  * `2.1.1` Literasi digital guru
  * `2.1.2` Pemanfaatan teknologi secara kontekstual dalam pelaksanaan pembelajaran
  * `2.2.1` Pemanfaatan teknologi secara kontekstual dalam asesmen
* **Domain 3: Kepala Satuan Pendidikan**
  * `3.1.1` Kepemimpinan transformasi pembelajaran digital dan KKA di satuan pendidikan

---

## 8. Panduan Teknis untuk AI / Rekayasawan Lanjutan

Bila sistem ini dikembangkan atau dipelihara oleh AI atau engineer lain di kemudian hari, perhatikan ketentuan teknis berikut:
1. **Pola Mutasi Data**: Semua mutasi data tersimpan langsung ke Firebase Realtime Database. Tidak ada server backend perantara; validasi sisi klien dilakukan sebelum memanggil `set()`, `update()`, atau `remove()`.
2. **Kunci Identitas Unik (Primary Keys)**:
   * Sekolah Model diidentifikasi oleh **NPSN** (8 digit angka).
   * Komunitas Belajar diidentifikasi oleh string ID (misal `kombel_xxx`).
   * Pegawai BGTK diidentifikasi oleh **NIP** (18 digit angka).
   * Akun User Roles di-index oleh string email yang disanitasi (`email.replace(/[.#$\\[\\]]/g, '_')`).
3. **Dokumentasi Word & Cetak**: Modul generator Surat Tugas berada pada `persuratan.html` dan generator Laporan Observasi Kunjungan berada pada `fasilitator.html`, keduanya memanfaatkan pustaka `window.docx`.
4. **Skrip Batch & Utilitas**: Di direktori utama (*root directory*) tersedia skrip pembantu berbasis Node.js:
   * `upload_pegawai.js`: Mengimpor file CSV pegawai ke simpul `master_pegawai`.
   * `upload_kombel.js`: Mengimpor file CSV 1.804 kombel ke simpul `master_kombel`.
   * `upload_status_sekolah.js`: Mengunggah baseline status sekolah ke simpul `status_sekolah_model`.
   * `export_kombel_peserta_excel.js`: Mengunduh dan menyusun rekapitulasi data peserta ke dalam berkas Excel multiset.
