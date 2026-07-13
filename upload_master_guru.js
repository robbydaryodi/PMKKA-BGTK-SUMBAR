const fs = require('fs');
const firebase = require('firebase/compat/app');
require('firebase/compat/database');

const firebaseConfig = {
    apiKey: "AIzaSyCAMKzhVnGGUxdVKAWeoPXYTAZvPSq6yKY",
    authDomain: "sekolah-model-oneapp.firebaseapp.com",
    databaseURL: "https://sekolah-model-2026-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "sekolah-model-oneapp",
    storageBucket: "sekolah-model-oneapp.appspot.com",
    messagingSenderId: "36712979207",
    appId: "1:36712979207:web:866e4a2919d7dcfc7bb5e5"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const rawData = JSON.parse(fs.readFileSync('e:/sekolah-model-oneapp/data-mentah/master_guru-ks_raw.json', 'utf8'));

const masterGuru = {};

rawData.forEach((item, index) => {
    const npsn = item["NPSN"];
    if (!npsn) return;
    
    if (!masterGuru[npsn]) {
        masterGuru[npsn] = {};
    }
    
    const safeEmail = item["Email"] || item["Username"] || `no-email-${index}`;
    const guruId = "guru_" + (item["NIK"] || Math.random().toString(36).substr(2, 9));
    
    let kabupaten = "";
    if (item["Kabupaten"] && typeof item["Kabupaten"] === 'object') {
        kabupaten = item["Kabupaten"]["Kota"] || "";
    } else if (typeof item["Kabupaten"] === 'string') {
        kabupaten = item["Kabupaten"];
    }

    masterGuru[npsn][guruId] = {
        nama: item["Nama Lengkap"] || "",
        jenis_ptk: item["Jenis PTK"] || "",
        email: safeEmail,
        asal_sekolah: item["Satuan Pendidikan"] || "",
        jenjang: item["Jenjang"] || "",
        nuptk: item["NUPTK"] || "",
        no_hp: item["No HP"] || "",
        kode_provinsi: item["Provinsi"] || "",
        kode_kabupaten: kabupaten,
        kategori_bimtek: item["Kategori Bimtek"] || "",
        npsn: npsn
    };
});

console.log(`Processing ${Object.keys(masterGuru).length} schools...`);

const promises = [];
for (const npsn in masterGuru) {
    promises.push(db.ref(`master_guru/${npsn}`).set(masterGuru[npsn]));
}

Promise.all(promises).then(() => {
    console.log("Successfully re-uploaded master_guru with ALL fields including Jenjang.");
    process.exit(0);
}).catch(e => {
    console.error("Failed:", e);
    process.exit(1);
});
