const fs = require('fs');
const XLSX = require('xlsx');

async function main() {
    console.log("Mengambil data live master_kombel dari Firebase...");
    const res = await fetch("https://sekolah-model-2026-default-rtdb.asia-southeast1.firebasedatabase.app/master_kombel.json");
    if (!res.ok) {
        throw new Error("Gagal mengambil data dari Firebase: " + res.statusText);
    }
    const allKombels = await res.json();
    console.log("Berhasil memuat", Object.keys(allKombels).length, "kombel dari Firebase.");

    // Filter kombel sasaran (atau yang submit)
    const sasaranList = [];
    for (let id in allKombels) {
        const k = { id, ...allKombels[id] };
        const isSubmitted = k.konfirmasi && (k.konfirmasi.is_konfirmasi || k.konfirmasi.status === 'submitted' || k.konfirmasi.tgl_konfirmasi);
        if (k.is_sasaran || isSubmitted) {
            sasaranList.push(k);
        }
    }

    // Urutkan: yang sudah submit lebih dulu, lalu nama kombel
    sasaranList.sort((a, b) => {
        const aSub = (a.konfirmasi && a.konfirmasi.is_konfirmasi) ? 1 : 0;
        const bSub = (b.konfirmasi && b.konfirmasi.is_konfirmasi) ? 1 : 0;
        if (aSub !== bSub) return bSub - aSub;
        return (a.nama_kombel || '').localeCompare(b.nama_kombel || '');
    });

    console.log(`Ditemukan ${sasaranList.length} Kombel Sasaran / Siap Pengkelasan.`);

    // 1. DATA SHEET REKAP KOMBEL
    const sheetKombelData = [];
    // 2. DATA SHEET DETAIL PESERTA (SEMUA PESERTA KOMBEL SASARAN)
    const sheetPesertaDetailData = [];
    // 3. DATA SHEET PESERTA TERPILIH LMS SAJA (ROLE MURID)
    const sheetPesertaTerpilihLMS = [];

    let totalPesertaCount = 0;
    let totalTerpilihCount = 0;

    sasaranList.forEach((kombel, kIdx) => {
        const isSubmitted = !!(kombel.konfirmasi && (kombel.konfirmasi.is_konfirmasi || kombel.konfirmasi.tgl_konfirmasi));
        const statusStr = isSubmitted ? 'Sudah Disetujui / Submit' : 'Belum Submit / Pending';
        const tglSubmit = (kombel.konfirmasi && kombel.konfirmasi.tgl_konfirmasi) || '-';

        // Peserta asli
        const rawPeserta = kombel.peserta ? (Array.isArray(kombel.peserta) ? kombel.peserta : Object.values(kombel.peserta)) : [];
        
        // Cek jika ada gabungan kombel (merge)
        let combinedPeserta = [...rawPeserta];
        if (Array.isArray(kombel.merged_kombel_ids)) {
            kombel.merged_kombel_ids.forEach(mId => {
                const mKombel = allKombels[mId];
                if (mKombel && mKombel.peserta) {
                    const mList = Array.isArray(mKombel.peserta) ? mKombel.peserta : Object.values(mKombel.peserta);
                    combinedPeserta.push(...mList);
                }
            });
        }

        // Peserta terpilih (jika ada selected_peserta_indices atau konfirmasi.peserta_konfirmasi)
        let selectedPeserta = [];
        if (Array.isArray(kombel.selected_peserta_indices) && kombel.selected_peserta_indices.length > 0) {
            selectedPeserta = combinedPeserta.filter((_, idx) => kombel.selected_peserta_indices.includes(idx));
        } else if (kombel.konfirmasi && Array.isArray(kombel.konfirmasi.peserta_konfirmasi)) {
            selectedPeserta = kombel.konfirmasi.peserta_konfirmasi;
        } else {
            // Default semua atau max 35
            selectedPeserta = combinedPeserta.slice(0, 35);
        }

        // Simpan ke Rekap Kombel
        sheetKombelData.push({
            "No": kIdx + 1,
            "ID Kombel": kombel.id || kombel.id_komunitas || '',
            "Nama Komunitas Belajar": kombel.nama_kombel || '',
            "Jenjang": kombel.jenjang || '',
            "Mata Pelajaran": kombel.mapel || '',
            "Kabupaten / Kota": kombel.kab_kota || '',
            "Kecamatan": kombel.kecamatan || '',
            "Nama Ketua": kombel.nama_ketua || '',
            "Kontak Ketua": kombel.no_hp || kombel.kontak || '',
            "Fasilitator": kombel.fasil_nama || '-',
            "Admin BGTK": kombel.admin_nama || '-',
            "Status Submission": statusStr,
            "Tanggal Submit": tglSubmit,
            "Total Anggota Terdaftar": combinedPeserta.length,
            "Jumlah Peserta Terpilih LMS": selectedPeserta.length
        });

        // Set untuk identifikasi siapa saja yang terpilih
        const selectedNiks = new Set(selectedPeserta.map(p => String(p.nik || p.nik_peserta || '')).filter(Boolean));
        const selectedEmails = new Set(selectedPeserta.map(p => String(p.email || p.email_belajar_id || p.email_login || '')).filter(Boolean));
        const selectedNames = new Set(selectedPeserta.map(p => String(p.nama || p.nama_lengkap || p.nama_anggota || '').trim().toLowerCase()));

        // Loop semua peserta kombel
        combinedPeserta.forEach((p, pIdx) => {
            totalPesertaCount++;
            const pNama = p.nama || p.nama_lengkap || p.nama_anggota || '-';
            const pNik = p.nik || p.nik_peserta || '';
            const pEmail = p.email || p.email_belajar_id || p.email_login || '';
            const pNpsn = p.npsn || '';
            const pSekolah = p.sekolah || p.instansi || '-';
            const pNoHp = p.no_hp || p.telepon || p.kontak || '';
            const pJabatan = p.jabatan || p.peran || p.role || 'Anggota';

            // Cek apakah peserta terpilih
            let isTerpilih = false;
            if (Array.isArray(kombel.selected_peserta_indices) && kombel.selected_peserta_indices.length > 0) {
                isTerpilih = kombel.selected_peserta_indices.includes(pIdx);
            } else if (pNik && selectedNiks.has(String(pNik))) {
                isTerpilih = true;
            } else if (pEmail && selectedEmails.has(String(pEmail))) {
                isTerpilih = true;
            } else if (selectedNames.has(pNama.trim().toLowerCase())) {
                isTerpilih = true;
            } else if (!kombel.konfirmasi && pIdx < 35) {
                isTerpilih = true; // Default kuota
            }

            const statusLms = isTerpilih ? 'Terpilih (Murid LMS)' : 'Cadangan / Belum Terpilih';

            const pesertaRow = {
                "No Urut Global": totalPesertaCount,
                "No Urut Kombel": pIdx + 1,
                "Nama Kombel": kombel.nama_kombel || '',
                "Jenjang": kombel.jenjang || '',
                "Kabupaten / Kota": kombel.kab_kota || '',
                "Nama Peserta": pNama,
                "NIK": pNik ? `'${pNik}` : '', // prefix single quote to prevent scientific notation in Excel
                "NPSN": pNpsn,
                "Asal Sekolah / Instansi": pSekolah,
                "Email Belajar.id / Pribadi": pEmail,
                "No HP / WhatsApp": pNoHp ? `'${pNoHp}` : '',
                "Jabatan / Peran": pJabatan,
                "Status LMS": statusLms,
                "Status Submission Kombel": statusStr,
                "Fasilitator": kombel.fasil_nama || '-',
                "Admin BGTK": kombel.admin_nama || '-'
            };

            sheetPesertaDetailData.push(pesertaRow);

            if (isTerpilih) {
                totalTerpilihCount++;
                sheetPesertaTerpilihLMS.push({
                    "No": totalTerpilihCount,
                    "Nama Kombel": kombel.nama_kombel || '',
                    "Jenjang": kombel.jenjang || '',
                    "Kabupaten / Kota": kombel.kab_kota || '',
                    "Nama Peserta (Murid LMS)": pNama,
                    "NIK": pNik ? `'${pNik}` : '',
                    "NPSN": pNpsn,
                    "Asal Sekolah": pSekolah,
                    "Email": pEmail,
                    "No HP / WA": pNoHp ? `'${pNoHp}` : '',
                    "Fasilitator (Instruktur)": kombel.fasil_nama || '-',
                    "Admin BGTK (Admin Kelas)": kombel.admin_nama || '-'
                });
            }
        });
    });

    console.log(`Menyusun Workbook Excel:`);
    console.log(`- Sheet 1: ${sheetKombelData.length} Kombel`);
    console.log(`- Sheet 2: ${sheetPesertaDetailData.length} Total Seluruh Peserta`);
    console.log(`- Sheet 3: ${sheetPesertaTerpilihLMS.length} Peserta Terpilih Masuk LMS`);

    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.json_to_sheet(sheetKombelData);
    ws1['!cols'] = [
        { wch: 6 },  // No
        { wch: 14 }, // ID Kombel
        { wch: 42 }, // Nama Kombel
        { wch: 12 }, // Jenjang
        { wch: 25 }, // Mapel
        { wch: 22 }, // Kab/Kota
        { wch: 20 }, // Kecamatan
        { wch: 25 }, // Nama Ketua
        { wch: 16 }, // Kontak Ketua
        { wch: 25 }, // Fasilitator
        { wch: 25 }, // Admin BGTK
        { wch: 24 }, // Status Submission
        { wch: 20 }, // Tanggal Submit
        { wch: 20 }, // Total Anggota
        { wch: 22 }  // Jml Terpilih LMS
    ];
    XLSX.utils.book_append_sheet(wb, ws1, "Rekap Kombel");

    const ws2 = XLSX.utils.json_to_sheet(sheetPesertaDetailData);
    ws2['!cols'] = [
        { wch: 8 },  // No Urut Global
        { wch: 8 },  // No Urut Kombel
        { wch: 38 }, // Nama Kombel
        { wch: 10 }, // Jenjang
        { wch: 20 }, // Kab/Kota
        { wch: 30 }, // Nama Peserta
        { wch: 20 }, // NIK
        { wch: 12 }, // NPSN
        { wch: 32 }, // Sekolah
        { wch: 32 }, // Email
        { wch: 18 }, // No HP
        { wch: 16 }, // Jabatan
        { wch: 22 }, // Status LMS
        { wch: 24 }, // Status Submission
        { wch: 22 }, // Fasilitator
        { wch: 22 }  // Admin BGTK
    ];
    XLSX.utils.book_append_sheet(wb, ws2, "Semua Peserta Kombel");

    const ws3 = XLSX.utils.json_to_sheet(sheetPesertaTerpilihLMS);
    ws3['!cols'] = [
        { wch: 6 },  // No
        { wch: 38 }, // Nama Kombel
        { wch: 10 }, // Jenjang
        { wch: 20 }, // Kab/Kota
        { wch: 30 }, // Nama Peserta
        { wch: 20 }, // NIK
        { wch: 12 }, // NPSN
        { wch: 32 }, // Sekolah
        { wch: 32 }, // Email
        { wch: 18 }, // No HP
        { wch: 24 }, // Fasilitator
        { wch: 24 }  // Admin BGTK
    ];
    XLSX.utils.book_append_sheet(wb, ws3, "Peserta Terpilih LMS");

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Data_Semua_Kombel_dan_Peserta_PMKKA_${dateStr}.xlsx`;
    XLSX.writeFile(wb, fileName);
    console.log(`✅ File Excel berhasil dibuat: ${fileName}`);
}

main().catch(err => {
    console.error("Error:", err);
    process.exit(1);
});
