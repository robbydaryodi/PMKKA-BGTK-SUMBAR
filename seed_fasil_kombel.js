const firebase = require('firebase/compat/app');
require('firebase/compat/database');

const firebaseConfig = {
    apiKey: "AIzaSyCAMKzhVnGGUxdVKAWeoPXYTAZvPSq6yKY",
    authDomain: "sekolah-model-2026.firebaseapp.com",
    databaseURL: "https://sekolah-model-2026-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "sekolah-model-2026",
    storageBucket: "sekolah-model-2026.firebasestorage.app",
    messagingSenderId: "1014570073770",
    appId: "1:1014570073770:web:770e7e6cef2a52a3825ad3"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const rawData = [
  { no: 1, nama: "Surya Marlina, M. Pd.", jabatan: "PTP", instansi: "BGTK Sumbar", mapel: "Bahasa Indonesia SD", kab_instansi: "Kota Pariaman", kab_penugasan: "Kota Padang", fkk_1: "KKG_Guru Kelas SD Kota Padang" },
  { no: 2, nama: "Robi Rahman, M. Pd.", jabatan: "WI", instansi: "BGTK Sumbar", mapel: "Bahasa Indonesia SD", kab_instansi: "Kota Pariaman", kab_penugasan: "Kota Payakumbuh", fkk_1: "KKG SD - Payakumbuh Utara - KKG Gugus I" },
  { no: 3, nama: "Animar, M. Pd.", jabatan: "Pengawas", instansi: "Cabdin Wil. II Prov. Sumbar", mapel: "Bahasa Indonesia SMA", kab_instansi: "Kota Padang", kab_penugasan: "Kota Sawahlunto", fkk_1: "" },
  { no: 4, nama: "Asliati, M. Pd.", jabatan: "Pengawas", instansi: "Dinas Pendidikan dan Kebudayaan Kab. Agam", mapel: "Bahasa Indonesia SMP", kab_instansi: "Kab. Agam", kab_penugasan: "Kota Pariaman", fkk_1: "" },
  { no: 5, nama: "Ernia Devita, M. Pd.", jabatan: "Pengawas", instansi: "Dinas Pendidikan dan Kebudayaan Kabupaten Pasaman", mapel: "Bahasa Indonesia SMP", kab_instansi: "Kab. Pasaman Barat", kab_penugasan: "Kab. Pasaman Barat", fkk_1: "" },
  { no: 6, nama: "Dr. Yuni Cenrikawaty, M.Pd", jabatan: "Pengawas", instansi: "Cabdin Wilayah VII", mapel: "Bahasa Inggris SMA", kab_instansi: "Kab. Pesisir Selatan", kab_penugasan: "Kab. Solok", fkk_1: "" },
  { no: 7, nama: "Refnita, S. Pd., M. Pd.", jabatan: "Pengawas", instansi: "Cabdin Wil. II Prov. Sumbar", mapel: "Bahasa Inggris SMA", kab_instansi: "Kota Padang", kab_penugasan: "Kota Padang", fkk_1: "" },
  { no: 8, nama: "Oria Lasmana, M. Pd", jabatan: "Guru", instansi: "SMA N. 1 Payakumbuh/ Cabdin Wil. IV", mapel: "Biologi SMA", kab_instansi: "Kota Payakumbuh", kab_penugasan: "Kota Payakumbuh", fkk_1: "" },
  { no: 9, nama: "Misdawati, M.Pd.", jabatan: "Pengawas", instansi: "Cabdin Wil. II Prov. Sumbar", mapel: "Biologi SMA", kab_instansi: "Kab. Padang Pariaman", kab_penugasan: "Kota Pariaman", fkk_1: "" },
  { no: 10, nama: "Intan Sari Ramadani, S. Pd. Gr.", jabatan: "Guru", instansi: "SMK N. 1 Painan/ Cabdin Wil. VI", mapel: "Ekonomi SMA/SMK", kab_instansi: "Kab. Pesisir Selatan", kab_penugasan: "Kab. Pesisir Selatan", fkk_1: "" },
  { no: 11, nama: "Nefri Leni, S.E, S. Pd., M. Pd.", jabatan: "WI", instansi: "Balai Diklat Keagamaan", mapel: "Ekonomi SMA/SMK", kab_instansi: "Kota Padang", kab_penugasan: "Kota Bukittinggi", fkk_1: "" },
  { no: 12, nama: "Rosa Ria Ayu, S. Pd.", jabatan: "Fungsional Umum", instansi: "BGTK Sumbar", mapel: "Guru Kesetaraan", kab_instansi: "Kota Pariaman", kab_penugasan: "Kab. Padang Pariaman", fkk_1: "" },
  { no: 13, nama: "Nannsi Marwarinda", jabatan: "Pengawas", instansi: "Cabdin Wil. VI", mapel: "IPA SMP", kab_instansi: "Kab. Pasaman", kab_penugasan: "Kab. Pasaman", fkk_1: "" },
  { no: 14, nama: "Wirza Nengsih, S.Pd, M.M", jabatan: "Guru", instansi: "SMPN. 1 Solok Selatan", mapel: "IPA SMP", kab_instansi: "Kab. Solok Selatan", kab_penugasan: "Kab. Solok Selatan", fkk_1: "MGMP IPA KAB.SOLOK SELATAN" },
  { no: 15, nama: "Musda Rahmawati, S. Si., M. Pd.", jabatan: "Pengawas", instansi: "Dinas Pendidikan dan Kebudayaan Kota Padang", mapel: "IPA SMP", kab_instansi: "Kota Padang", kab_penugasan: "Kab. Sijunjung", fkk_1: "" },
  { no: 16, nama: "Dr. SIlvi Hevria, M. Pd.", jabatan: "PTP", instansi: "BGTK Sumbar", mapel: "Kepala Sekolah", kab_instansi: "Kota Pariaman", kab_penugasan: "Kota Bukittinggi", fkk_1: "" },
  { no: 17, nama: "Irawati, S. Pd., M. Pd.", jabatan: "PTP", instansi: "BGTK Sumbar", mapel: "Kepala Sekolah", kab_instansi: "Kota Pariaman", kab_penugasan: "Kota Padang", fkk_1: "" },
  { no: 18, nama: "Doni Aizus Indris, A.Md.KG., S.Pd.", jabatan: "Praktisi", instansi: "PKBM", mapel: "Kepala Sekolah Kesetaraan", kab_instansi: "Kab. Agam", kab_penugasan: "Kab. Lima Puluh Kota, Kab. Pasaman", fkk_1: "" },
  { no: 19, nama: "Rita Marlinda", jabatan: "Penilik", instansi: "Dinas Pendidikan dan Kebudayaan Kota Padang", mapel: "Kesetaraan", kab_instansi: "Kota Padang", kab_penugasan: "Kab. Lima Puluh Kota", fkk_1: "" },
  { no: 20, nama: "Rahmi Isra, S.Pd", jabatan: "Guru", instansi: "SMPN. 5 Kota Solok", mapel: "KKA SD", kab_instansi: "Kota Solok", kab_penugasan: "Kab. Agam", fkk_1: "KKG SD - Guru Kelas SD - GUGUS I KEC. BANUHAMPU" },
  { no: 21, nama: "Rusva R, S. Kom., M. Pd", jabatan: "PTP", instansi: "BGTK Sumbar", mapel: "KKA SD", kab_instansi: "Kota Pariaman", kab_penugasan: "Kota Padang", fkk_1: "" },
  { no: 22, nama: "Nazman, S. Pd., Gr.", jabatan: "Guru", instansi: "SMK N. 1 Bukittinggi/ Cabdin Wil. I", mapel: "KKA SMA/SMK", kab_instansi: "Kota Bukittinggi", kab_penugasan: "Kab. Pasaman Barat", fkk_1: "" },
  { no: 23, nama: "Riyan Fernandes, S. Pd. M. Kom.T.", jabatan: "WI", instansi: "BGTK Sumbar", mapel: "KKA SMA/SMK", kab_instansi: "Kota Pariaman", kab_penugasan: "Kota Payakumbuh", fkk_1: "" },
  { no: 24, nama: "Susanda Febriani, M.Pd", jabatan: "Guru", instansi: "SMP N. 4 Bukittinggi", mapel: "KKA SMP", kab_instansi: "Kota Bukittinggi", kab_penugasan: "Kota Bukittinggi", fkk_1: "" },
  { no: 25, nama: "Herry Herlambang, S. Kom., M.T.", jabatan: "WP", instansi: "BBPMP Sumbar", mapel: "KKA SMP", kab_instansi: "Kota Padang", kab_penugasan: "Kab. Sijunjung", fkk_1: "" },
  { no: 26, nama: "Septiana Aisyah, M. Pd.", jabatan: "Guru", instansi: "SD Negeri 44 Kalumbuk", mapel: "Matematika SD", kab_instansi: "Kota Padang", kab_penugasan: "Kab. Tanah Datar", fkk_1: "" },
  { no: 27, nama: "Azwar, M. Pd.", jabatan: "Pengawas", instansi: "Dinas Pendidikan dan Kebudayaan Kota Padang", mapel: "Matematika SD", kab_instansi: "Kota Padang", kab_penugasan: "Kab. Pasaman", fkk_1: "" },
  { no: 28, nama: "Rahmat Istiqlal, S. Pd.", jabatan: "PTP", instansi: "BGTK Sumbar", mapel: "Matematika SD", kab_instansi: "Kota Pariaman", kab_penugasan: "Kota Bukittinggi", fkk_1: "" },
  { no: 29, nama: "Zulkifli, M. Pd.", jabatan: "Pengawas", instansi: "Dinas Pendidikan dan Kebudayaan Kota Padang Panjang", mapel: "Matematika SMA", kab_instansi: "Kota Padang Panjang", kab_penugasan: "Kota Padang Panjang", fkk_1: "" },
  { no: 30, nama: "Rahma Maulida, S.Pd, M.Si, CPEC.", jabatan: "Pengawas", instansi: "Cabdin Wil. V Prov. Sumbar", mapel: "Matematika SMA", kab_instansi: "Kab. Sijunjung", kab_penugasan: "Kab. Dharmasraya, Sawahlunto", fkk_1: "" },
  { no: 31, nama: "Syafrial Nurdin, S.Pd.I., M.Pd.", jabatan: "Kepala Sekolah", instansi: "SMP N. 1 Siberut Selatan", mapel: "Matematika SMP", kab_instansi: "Kab. Kepulauan Mentawai", kab_penugasan: "Kab. Kepulauan Mentawai-Siberut Selatan, Kab. Kepulauan Mentawai-Tua Pejat", fkk_1: "" },
  { no: 32, nama: "Madesa Rini Saputri, S. Si.", jabatan: "PTP", instansi: "BGTK Sumbar", mapel: "Matematika SMP", kab_instansi: "Kota Pariaman", kab_penugasan: "Kota Padang", fkk_1: "" },
  { no: 33, nama: "Desfiar Hanif", jabatan: "Penilik", instansi: "Dinas Pendidikan dan Kebudayaan Kota Padang", mapel: "PAUD", kab_instansi: "Kota Padang", kab_penugasan: "Kota Payakumbuh", fkk_1: "" },
  { no: 34, nama: "Pitria Gusliati, M .Pd.", jabatan: "PTP", instansi: "BGTK Sumbar", mapel: "PAUD", kab_instansi: "Kota Pariaman", kab_penugasan: "Kab. Agam", fkk_1: "" },
  { no: 35, nama: "Afri Dewita, S. Pd., M. Pd.", jabatan: "WI", instansi: "BGTK Sumbar", mapel: "PAUD", kab_instansi: "Kota Pariaman", kab_penugasan: "Kota Bukittinggi", fkk_1: "" },
  { no: 36, nama: "Yanti Liwasdilla, M. Pd.", jabatan: "WI", instansi: "BGTK Sumbar", mapel: "Pengawas", kab_instansi: "Kota Pariaman", kab_penugasan: "Kota Padang", fkk_1: "PS DIKDAS - MKPS SMP KOTA PADANG" },
  { no: 37, nama: "Novri Wahyuni", jabatan: "Guru", instansi: "SLBN. 1 Padang", mapel: "SLB", kab_instansi: "Kota Padang", kab_penugasan: "Kota Padang", fkk_1: "" },
  { no: 38, nama: "Rizka Asyriati, M.Si.", jabatan: "Praktisi", instansi: "JSIT", mapel: "SLB", kab_instansi: "Kota Padang", kab_penugasan: "Kab. Padang Pariaman", fkk_1: "" }
];

function cleanName(n) {
    return (n || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function seedFasilKombel() {
    console.log("Membaca fasilitator existing...");
    const fasilSnap = await db.ref('fasilitator').once('value');
    const existingFasils = fasilSnap.val() || {};

    const kombelSnap = await db.ref('master_kombel').once('value');
    const masterKombel = kombelSnap.val() || {};

    let updatedCount = 0;
    let createdCount = 0;
    let sasaranMatchedCount = 0;

    for (const item of rawData) {
        const cName = cleanName(item.nama);
        
        // Find existing fasil by clean name
        let matchedId = null;
        for (const [id, f] of Object.entries(existingFasils)) {
            if (cleanName(f.nama) === cName || cleanName(f.nama).includes(cName) || cName.includes(cleanName(f.nama))) {
                matchedId = id;
                break;
            }
        }

        if (matchedId) {
            console.log(`[MATCHED] ${item.nama} -> ${matchedId}`);
            const exFasil = existingFasils[matchedId];
            let programs = exFasil.programs || ['sekolah_model'];
            if (!programs.includes('kombel')) programs.push('kombel');

            await db.ref('fasilitator/' + matchedId).update({
                programs: programs,
                program_kombel: true,
                jabatan: item.jabatan || exFasil.jabatan || '',
                instansi: item.instansi || exFasil.instansi || '',
                mapel_kombel: item.mapel,
                kab_instansi_kombel: item.kab_instansi,
                kab_penugasan_kombel: item.kab_penugasan,
                fkk_1: item.fkk_1 || ''
            });
            updatedCount++;
        } else {
            console.log(`[NEW] Creating new fasilitator: ${item.nama}`);
            const newRef = db.ref('fasilitator').push();
            matchedId = newRef.key;
            await newRef.set({
                id: matchedId,
                nama: item.nama,
                hp: '08123456789', // default placeholder
                nip: '-',
                pangkat_gol: '-',
                jabatan: item.jabatan || '',
                instansi: item.instansi || '',
                programs: ['kombel'],
                program_kombel: true,
                mapel_kombel: item.mapel,
                kab_instansi_kombel: item.kab_instansi,
                kab_penugasan_kombel: item.kab_penugasan,
                fkk_1: item.fkk_1 || ''
            });
            createdCount++;
        }

        // Match FKK 1 with master_kombel if present
        if (item.fkk_1) {
            const fkkClean = cleanName(item.fkk_1);
            for (const [kId, kObj] of Object.entries(masterKombel)) {
                const kNameClean = cleanName(kObj.nama_kombel);
                if (kNameClean === fkkClean || kNameClean.includes(fkkClean) || fkkClean.includes(kNameClean)) {
                    await db.ref(`master_kombel/${kId}`).update({
                        is_sasaran: true,
                        fasil_id: matchedId,
                        fasil_nama: item.nama
                    });
                    console.log(`  ⭐ Flagged Kombel Sasaran: ${kObj.nama_kombel} -> Fasil: ${item.nama}`);
                    sasaranMatchedCount++;
                    break;
                }
            }
        }
    }

    console.log(`\n✅ PROSES SELESAI!`);
    console.log(`- Fasilitator Updated (2 Program): ${updatedCount}`);
    console.log(`- Fasilitator Kombel Baru Dibuat: ${createdCount}`);
    console.log(`- Kombel Sasaran Otomatis Terhubung: ${sasaranMatchedCount}`);
    process.exit(0);
}

seedFasilKombel().catch(err => {
    console.error("Gagal seed fasil kombel:", err);
    process.exit(1);
});
