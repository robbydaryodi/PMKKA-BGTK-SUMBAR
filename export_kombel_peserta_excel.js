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

    // Fungsi status submission PERSIS 100% seperti di admin.html
    function getKombelSubmissionStatus(k) {
        if (!k) return { isSubmitted: false, date: '', count: 0, total: 0 };
        
        // 1. Cek node konfirmasi
        if (k.konfirmasi && (k.konfirmasi.is_konfirmasi || k.konfirmasi.is_submitted || k.konfirmasi.status === 'submitted')) {
            return {
                isSubmitted: true,
                date: k.konfirmasi.tgl_konfirmasi || k.konfirmasi.tanggal_konfirmasi || '',
                count: k.konfirmasi.total_konfirmasi || k.konfirmasi.total_dipilih || (Array.isArray(k.selected_peserta_indices) ? k.selected_peserta_indices.length : 0),
                total: k.konfirmasi.total_peserta_impor || k.konfirmasi.total_peserta || (k.peserta ? (Array.isArray(k.peserta) ? k.peserta.length : Object.keys(k.peserta).length) : 0)
            };
        }
        
        // 2. Cek node seleksi_peserta_fkk
        if (k.seleksi_peserta_fkk && (k.seleksi_peserta_fkk.is_submitted || k.seleksi_peserta_fkk.is_konfirmasi)) {
            return {
                isSubmitted: true,
                date: k.seleksi_peserta_fkk.tgl_seleksi || k.seleksi_peserta_fkk.tgl_konfirmasi || '',
                count: k.seleksi_peserta_fkk.total_dipilih || k.seleksi_peserta_fkk.total_konfirmasi || 0,
                total: k.seleksi_peserta_fkk.total_peserta || (k.peserta ? (Array.isArray(k.peserta) ? k.peserta.length : Object.keys(k.peserta).length) : 0)
            };
        }

        // 3. Cek array selected_peserta_indices
        if (Array.isArray(k.selected_peserta_indices) && k.selected_peserta_indices.length > 0) {
            return {
                isSubmitted: true,
                date: 'Disimpan',
                count: k.selected_peserta_indices.length,
                total: k.peserta ? (Array.isArray(k.peserta) ? k.peserta.length : Object.keys(k.peserta).length) : 0
            };
        }

        return { isSubmitted: false, date: '', count: 0, total: 0 };
    }

    function getCombinedPesertaForKombel(kombelId) {
        const kombel = allKombels[kombelId];
        if (!kombel) return [];

        let list = [];
        const mainPeserta = kombel.peserta ? (Array.isArray(kombel.peserta) ? kombel.peserta : Object.values(kombel.peserta)) : [];
        mainPeserta.forEach(p => {
            list.push({ ...p, source_kombel_id: kombelId, source_kombel_nama: kombel.nama_kombel });
        });

        if (Array.isArray(kombel.merged_kombel_ids)) {
            kombel.merged_kombel_ids.forEach(mId => {
                const mKombel = allKombels[mId];
                if (mKombel) {
                    const mPeserta = mKombel.peserta ? (Array.isArray(mKombel.peserta) ? mKombel.peserta : Object.values(mKombel.peserta)) : [];
                    mPeserta.forEach(p => {
                        list.push({ ...p, source_kombel_id: mId, source_kombel_nama: mKombel.nama_kombel });
                    });
                }
            });
        }

        return list;
    }

    function getSelectedPesertaForKombel(k) {
        if (!k) return [];
        const allPeserta = getCombinedPesertaForKombel(k.id);

        if (Array.isArray(k.selected_peserta_indices) && k.selected_peserta_indices.length > 0) {
            return allPeserta.filter((_, i) => k.selected_peserta_indices.includes(i)).slice(0, 35);
        }

        if (k.konfirmasi && Array.isArray(k.konfirmasi.peserta_konfirmasi) && k.konfirmasi.peserta_konfirmasi.length > 0) {
            return k.konfirmasi.peserta_konfirmasi.slice(0, 35);
        }

        if (k.seleksi_peserta_fkk && Array.isArray(k.seleksi_peserta_fkk.peserta_terpilih) && k.seleksi_peserta_fkk.peserta_terpilih.length > 0) {
            return k.seleksi_peserta_fkk.peserta_terpilih.slice(0, 35);
        }

        return allPeserta.slice(0, 35);
    }

    // Filter daftar Kombel sasaran
    const sasaranList = Object.keys(allKombels).map(id => ({ id, ...allKombels[id] }))
        .filter(k => k.is_sasaran || getKombelSubmissionStatus(k).isSubmitted);

    sasaranList.sort((a, b) => {
        const aSub = getKombelSubmissionStatus(a).isSubmitted ? 1 : 0;
        const bSub = getKombelSubmissionStatus(b).isSubmitted ? 1 : 0;
        if (aSub !== bSub) return bSub - aSub;
        return (a.nama_kombel || '').localeCompare(b.nama_kombel || '');
    });

    const submittedList = sasaranList.filter(k => getKombelSubmissionStatus(k).isSubmitted);
    const pendingList = sasaranList.filter(k => !getKombelSubmissionStatus(k).isSubmitted);

    console.log(`Statistik Kombel Sasaran:`);
    console.log(`- Total Sasaran: ${sasaranList.length}`);
    console.log(`- Sudah Submit / Selesai: ${submittedList.length}`);
    console.log(`- Belum Submit / Pending: ${pendingList.length}`);

    // 1. DATA SHEET REKAP KOMBEL
    const sheetKombelData = [];
    // 2. DATA SHEET DETAIL PESERTA
    const sheetPesertaDetailData = [];
    // 3. DATA SHEET PESERTA TERPILIH LMS
    const sheetPesertaTerpilihLMS = [];

    let totalPesertaCount = 0;
    let totalTerpilihCount = 0;

    sasaranList.forEach((kombel, kIdx) => {
        const subStatus = getKombelSubmissionStatus(kombel);
        const isSubmitted = subStatus.isSubmitted;
        const statusStr = isSubmitted ? 'Sudah Disetujui / Submit' : 'Belum Submit / Pending';
        const tglSubmit = subStatus.date || '-';

        const allPeserta = getCombinedPesertaForKombel(kombel.id);
        const selectedPeserta = getSelectedPesertaForKombel(kombel);

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
            "Link Google Meet": kombel.link_gmeet || '-',
            "Status Submission": statusStr,
            "Waktu Submission": tglSubmit,
            "Total Anggota Terdaftar": allPeserta.length,
            "Jumlah Peserta Terpilih LMS": isSubmitted ? selectedPeserta.length : 0
        });

        const selectedNiks = new Set(selectedPeserta.map(p => String(p.nik || p.nik_peserta || '')).filter(Boolean));
        const selectedEmails = new Set(selectedPeserta.map(p => String(p.email || p.email_belajar_id || p.email_login || '')).filter(Boolean));
        const selectedNames = new Set(selectedPeserta.map(p => String(p.nama || p.nama_lengkap || p.nama_anggota || '').trim().toLowerCase()));

        allPeserta.forEach((p, pIdx) => {
            totalPesertaCount++;
            const pNama = p.nama || p.nama_lengkap || p.nama_anggota || '-';
            const pNik = p.nik || p.nik_peserta || '';
            const pEmail = p.email || p.email_belajar_id || p.email_login || '';
            const pNpsn = p.npsn || '';
            const pSekolah = p.sekolah || p.instansi || '-';
            const pNoHp = p.no_hp || p.telepon || p.kontak || '';
            const pJabatan = p.jabatan || p.peran || p.role || 'Anggota';

            let isTerpilih = false;
            if (isSubmitted) {
                if (Array.isArray(kombel.selected_peserta_indices) && kombel.selected_peserta_indices.length > 0) {
                    isTerpilih = kombel.selected_peserta_indices.includes(pIdx);
                } else if (pNik && selectedNiks.has(String(pNik))) {
                    isTerpilih = true;
                } else if (pEmail && selectedEmails.has(String(pEmail))) {
                    isTerpilih = true;
                } else if (selectedNames.has(pNama.trim().toLowerCase())) {
                    isTerpilih = true;
                }
            }

            const statusLms = isTerpilih ? 'Terpilih (Murid LMS)' : (isSubmitted ? 'Cadangan' : 'Belum Submit');

            sheetPesertaDetailData.push({
                "No Urut Global": totalPesertaCount,
                "No Urut Kombel": pIdx + 1,
                "Nama Kombel": kombel.nama_kombel || '',
                "Jenjang": kombel.jenjang || '',
                "Kabupaten / Kota": kombel.kab_kota || '',
                "Nama Peserta": pNama,
                "NIK": pNik ? `'${pNik}` : '',
                "NPSN": pNpsn,
                "Asal Sekolah / Instansi": pSekolah,
                "Email Belajar.id / Pribadi": pEmail,
                "No HP / WhatsApp": pNoHp ? `'${pNoHp}` : '',
                "Jabatan / Peran": pJabatan,
                "Status LMS": statusLms,
                "Status Submission Kombel": statusStr,
                "Fasilitator": kombel.fasil_nama || '-',
                "Admin BGTK": kombel.admin_nama || '-'
            });

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
    console.log(`✅ File Excel berhasil diperbarui: ${fileName}`);
}

main().catch(err => {
    console.error("Error:", err);
    process.exit(1);
});
