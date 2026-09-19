# 🏛️ PANDUAN PRINSIP UI/UX & ARSITEKTUR INFORMASI (MASTER BLUEPRINT)
**Balai Guru dan Tenaga Kependidikan (BGTK) Provinsi Sumatera Barat — Kemendikdasmen**  
*Dokumen Acuan Wajib Pengembang (Developer North Star) Sebelum Mengeksekusi Fitur atau Antarmuka Baru*

---

> [!IMPORTANT]
> **ATURAN WAJIB BAGI DEVELOPER / AGENT**:  
> Sebelum menambahkan, merombak, atau mengeksekusi fitur antarmuka apa pun di sistem ini, Anda **WAJIB** membaca dan mematuhi prinsip-prinsip dalam dokumen ini. Jangan pernah membangun fitur secara *ad-hoc* tanpa mengidentifikasi tahapan proses bisnisnya terlebih dahulu.

---

## 1. Filosofi & Nilai Inti Desain (*Core Philosophy*)

1. **Aplikasi Kedinasan Harus Tenang, Bersih, dan Tidak Mengintimidasi**
   * Pengguna utama sistem ini adalah Guru, Kepala Sekolah, Pengawas, Fasilitator, dan Pegawai UPT BGTK.
   * Tingkat literasi digital beragam. Antarmuka yang gelap, padat, berisik, atau penuh teks teknis akan memicu rasa cemas (*techno-stress*) dan membuat pengguna **malas serta enggan menggunakan aplikasi**.
2. **Satu Layar, Satu Fokus Utama (*Job-to-be-Done*)**
   * Saat fasilitator membuka kalender, layar harus 100% didedikasikan untuk kalender.
   * Saat peserta mencari link GMeet, layar harus langsung menyajikan pencarian kelas dan tombol GMeet.
   * Hindari menumpuk banner raksasa, kartu penjelasan pilar, atau data statistik admin di atas ruang kerja pengguna.
3. ***Whitespace* adalah Teman, Bukan Ruang Kosong**
   * Ruang kosong yang lapang memberikan waktu bagi mata untuk bernapas dan memproses informasi secara santai.

---

## 2. Teori-Teori Fundamental yang Wajib Diadopsi

### A. Teori *Progressive Disclosure* (Pengungkapan Bertahap 3-Tingkat)
Informasi tidak boleh ditumpahkan sekaligus. Terapkan pola hierarki 3 tingkat (*3-Tier Depth Pattern*):

```
┌─────────────────────────────────────────────────────────────┐
│ LEVEL 1: GLANCEABLE SURFACE (Ringkasan Pokok)               │
│ • Hanya nama entitas utama & 1 tombol aksi primer.          │
│ • Tampil langsung tanpa klik, bersih, lapang.               │
└──────────────────────────────┬──────────────────────────────┘
                               │
                      (Klik tombol/kartu)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ LEVEL 2: ON-DEMAND LIST (Daftar Anggota / Sesi)             │
│ • Menampilkan daftar nama saja (tanpa no HP, NIP, email).   │
│ • Muncul via Slide-over Drawer (panel kanan) / Modal tipis. │
└──────────────────────────────┬──────────────────────────────┘
                               │
                        (Klik nama orang)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ LEVEL 3: DEEP-DIVE DETAIL (Rincian Spesifik)                │
│ • No HP (klik langsung chat WA), Email belajar.id, asal SK. │
│ • Kartu kontak personal ringkas.                            │
└─────────────────────────────────────────────────────────────┘
```

### B. *Hick's Law* & Pengendalian Beban Kognitif (*Cognitive Load Theory*)
* Semakin banyak elemen, tombol, dan warna yang bersaing di layar, semakin lama waktu yang dibutuhkan pengguna untuk mengambil keputusan.
* **Haramkan duplikasi tombol**: Jika sudah ada tab di atas (*Kalender, Daftar, Status*), jangan buat lagi 4 kartu raksasa di bawahnya yang membuka halaman yang sama.

### C. Teori *L.A.T.C.H.* & *Domain-Driven Design (DDD)*
* Jangan mencampuradukkan **Kategori Program** (Sekolah Model vs Kombel vs Pensif) dengan **Tahapan Waktu/Siklus** dalam satu daftar menu yang datar (*flat list*).
* Setiap program adalah entitas mandiri yang melewati siklus waktu yang konsisten.

---

## 3. Peta 4 Siklus Proses Bisnis Universal BGTK (*The Universal 4-Stage Lifecycle*)

Setiap program kedinasan di BGTK Sumbar (**PMKKA Reguler**, **Sekolah Model**, **Pensif**, **BCKS**, **STEM**, dll.) **selalu** memiliki alur hidup yang identik. Struktur menu dan data harus selalu mengacu pada 4 tahapan ini:

```text
TAHAP 1: PERSIAPAN & PENETAPAN
├── Sasaran (Sekolah / Kombel / Peserta)
├── Petugas (Fasilitator / Pengajar Praktik)
├── Plotting Kelas & Kuota
└── Sinkronisasi Format LMS Pusat

TAHAP 2: PELAKSANAAN PENDAMPINGAN
├── Jadwal (Kunjungan TET / Sesi GMeet)
├── Administrasi Persuratan (Surat Tugas)
└── Ruang Pertemuan (GMeet / Visitasi Fisik) & Presensi

TAHAP 3: ASESMEN & EVALUASI
├── Instrumen Rubrik / Observasi
├── Rapor Baseline vs Akhir
└── Monitoring Keterlaksanaan Program

TAHAP 4: PELAPORAN & REPOSITORI
├── Repositori Rekaman & Materi
├── Rekapitulasi Capaian Provinsi
└── Cetak Laporan Resmi Kedinasan
```

---

## 4. Standar Struktur Menu Sidebar Admin

Untuk menjaga agar sidebar tetap ringkas dan tidak menjadi 'gudang penampung fitur':

### Tingkat 1: *Global Program Context Switcher* (Dropdown Paling Atas Sidebar)
Admin memilih program aktif terlebih dahulu:
* 🏛️ **Ringkasan Eksekutif (Lintas Seluruh Program BGTK)**
* 🏫 **Program: Pendampingan 25 Sekolah Model**
* 👥 **Program: PMKKA Reguler (57 Komunitas Belajar)**
* ♿ *Program: Pendidikan Inklusif / Pensif (Siap Ditambahkan)*
* 🎓 *Program: Pelatihan BCKS (Siap Ditambahkan)*

### Tingkat 2: Kelompok Menu Berbasis 4 Tahap Proses Bisnis
Menu di bawah dropdown akan menyesuaikan program yang dipilih, terkelompok rapi dalam 4 tahap:

```text
📁 1. PERSIAPAN & PLOTTING
   • Sasaran & Kuota
   • Fasilitator Pendamping
   • Plotting & Pembagian Kelas
   • Integrasi LMS (Ekspor CSV Standar Pusat)

🗓️ 2. PELAKSANAAN PENDAMPINGAN
   • Kalender & Jadwal Sesi
   • Surat Tugas Kedinasan
   • Ruang Temu (GMeet / Visitasi) & Presensi

📈 3. ASESMEN & EVALUASI
   • Instrumen Rubrik & Observasi
   • Status Keterlaksanaan & Rapor

📦 4. REPOSITORI & LAPORAN
   • Repositori Rekaman & Materi
   • Rekapitulasi Capaian & Ekspor Berkas
```

---

## 5. Aturan Larangan Mutlak (*Forbidden Anti-Patterns*)

1. 🚫 **DILARANG membuat Banner Raksasa Gelap / Ungu Tebal** yang memakan lebih dari 15-20% tinggi layar pada halaman kerja operasional.
2. 🚫 **DILARANG menampilkan Kartu Angka Statistik Global** (seperti *'Total 1.411 Peserta'*, *'54 Kelas Aktif'*) kepada pengguna tingkat Fasilitator atau Peserta. Angka-angka itu hanya milik Dashboard Admin Eksekutif.
3. 🚫 **DILARANG membuat tombol/fitur ganda** yang membuka dialog atau halaman yang sama di layar yang sama.
4. 🚫 **DILARANG menjejalkan tabel dengan belasan kolom data mentah** di halaman depan. Cukup tampilkan 3-4 kolom utama; rincian lainnya dibuka melalui klik (Drawer samping).
5. 🚫 **DILARANG menempelkan paragraf instruksi panjang** di header. Gunakan *microcopy* singkat dan intuitif.

---

## 6. Daftar Periksa Sebelum Eksekusi (*Pre-Execution Checklist*)

Sebelum developer atau agen menulis baris kode baru, jawab 5 pertanyaan ini:
- [ ] **1. Masuk di tahapan proses bisnis mana fitur ini?** (Persiapan, Pelaksanaan, Evaluasi, atau Pelaporan?)
- [ ] **2. Apakah antarmukanya sudah menerapkan *Progressive Disclosure*?** (Apakah ada data sekunder yang bisa disembunyikan di balik klik?)
- [ ] **3. Apakah layar kerja utama langsung terlihat tanpa perlu digulir (*above the fold*)?**
- [ ] **4. Apakah desain menggunakan palet warna yang tenang, bersih (*light/clean UI*), dan konsisten?**
- [ ] **5. Apakah pengguna awam akan merasa tenang dan nyaman saat membuka halaman ini?**

---
*Dokumen ini merupakan standar baku arsitektur dan UI/UX resmi untuk pengembangan sistem BGTK Sumatera Barat.*
