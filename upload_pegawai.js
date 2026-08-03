const fs = require('fs');
const path = require('path');
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

// Simple CSV parser supporting quotes
function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length === 0) return [];

    // Header line is line 1 (line 0 is "UNIT KERJA...")
    let headerIdx = 0;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('NAMA PEGAWAI')) {
            headerIdx = i;
            break;
        }
    }

    const headers = parseCSVLine(lines[headerIdx]);
    const dataRows = [];

    for (let i = headerIdx + 1; i < lines.length; i++) {
        const row = parseCSVLine(lines[i]);
        if (row.length === 0 || !row[1]) continue; // row[1] is NAMA PEGAWAI

        const item = {};
        headers.forEach((h, colIdx) => {
            const cleanKey = h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
            item[cleanKey] = row[colIdx] !== undefined ? row[colIdx].trim() : '';
        });
        dataRows.push(item);
    }
    return dataRows;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

function cleanName(n) {
    return (n || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function uploadPegawai() {
    const filePath = path.join(__dirname, 'data pegawai.csv');
    const content = fs.readFileSync(filePath, 'utf8');
    const rows = parseCSV(content);

    console.log(`Berhasil mem-parse ${rows.length} data pegawai Balai GTK Sumbar.`);

    const pegawaiObj = {};
    let count = 0;

    for (const r of rows) {
        const id = r.nip || r.nik || `peg_${Date.now()}_${count}`;
        
        // Construct Full Display Name with Titles
        let namaLengkap = r.nama_pegawai || '';
        if (r.gelar_depan && r.gelar_depan !== '-') {
            namaLengkap = r.gelar_depan + ' ' + namaLengkap;
        }
        if (r.gelar_belakang && r.gelar_belakang !== '-') {
            namaLengkap = namaLengkap + ', ' + r.gelar_belakang;
        }

        pegawaiObj[id] = {
            id: id,
            no: r.no_ || count + 1,
            nama_murni: r.nama_pegawai || '',
            nama_lengkap: namaLengkap,
            gelar_depan: r.gelar_depan || '',
            gelar_belakang: r.gelar_belakang || '',
            nip: r.nip || '',
            jenis_kelamin: r.jenis_kelamin || '',
            tempat_lahir: r.tempat_lahir || '',
            tgl_lahir: r.tgl__lahir || '',
            usia: r.usia || '',
            tgl_pensiun: r.tgl__pensiun || '',
            pendidikan: r.pendidikan || '',
            agama: r.agama || '',
            jenis_jabatan: r.jenis_jab_ || '',
            kelas_jabatan: r.kelas_jab_ || '',
            jabatan: r.jabatan || '',
            pangkat_golongan: r.pangkat__golongan || '',
            tmt: r.tmt || '',
            status_pegawai: r.status_pegawai || '',
            satker: r.nama_satker || 'Balai GTK Provinsi Sumatera Barat',
            nik: r.nik || '',
            no_hp: r.nomor_hp || '',
            email_pribadi: r.email || '',
            email_dikbud: r.email_dikbud || '',
            is_active: true
        };
        count++;
    }

    console.log("Meng-upload ke Firebase node master_pegawai...");
    await db.ref('master_pegawai').set(pegawaiObj);
    console.log(`✅ ${count} Data Pegawai Balai GTK Sumbar BERHASIL DI-UPLOAD!`);

    // Sync with existing fasilitator
    console.log("\nMemeriksa sinkronisasi dengan Fasilitator...");
    const fasilSnap = await db.ref('fasilitator').once('value');
    const fasils = fasilSnap.val() || {};

    let syncedCount = 0;
    for (const [pegId, p] of Object.entries(pegawaiObj)) {
        const pClean = cleanName(p.nama_murni);
        for (const [fId, f] of Object.entries(fasils)) {
            const fClean = cleanName(f.nama);
            if (fClean.includes(pClean) || pClean.includes(fClean)) {
                await db.ref(`fasilitator/${fId}`).update({
                    nip: p.nip || f.nip,
                    pangkat_gol: p.pangkat_golongan || f.pangkat_gol,
                    jabatan: p.jabatan || f.jabatan,
                    email: p.email_dikbud || p.email_pribadi || f.email || '',
                    is_internal_bgtk: true
                });
                console.log(`  🔗 Synced Pegawai ${p.nama_lengkap} -> Fasilitator ${f.nama}`);
                syncedCount++;
                break;
            }
        }
    }

    console.log(`✅ Sinkronisasi Selesai: ${syncedCount} Fasilitator dihubungkan dengan data resmi Pegawai BGTK!`);
    process.exit(0);
}

uploadPegawai().catch(err => {
    console.error("Gagal upload pegawai:", err);
    process.exit(1);
});
