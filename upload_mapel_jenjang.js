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

const rawText = `TK Adzkia I	PAUD	PAUD	10308571	PAUD
TK Aisyiyah I Bukittinggi	PAUD	PAUD 	10310513	PAUD
TK AL-HUFFAZH	PAUD	PAUD	69832151	PAUD
TK Citra Al Madina	PAUD	PAUD	10308593	PAUD
SD Kristen Kalam Kudus Padang	Guru Kelas Rendah/Bahasa Indonesia	Guru KKA	10304009	SD
SD Negeri 02 Sariak	Guru Kelas Rendah/Bahasa Indonesia	Guru KKA	10300464	SD
SD Negeri 04 Payakumbuh	Guru Kelas Rendah/Bahasa Indonesia	Guru Kelas Tinggi/Matematika	10303924	SD
SD Negeri 26 Jati Utara	Guru Kelas Rendah/Bahasa Indonesia	Guru KKA	10304619	SD
SDIT Adzkia 1 Sumatera Barat	Guru Kelas Rendah/Bahasa Indonesia	Guru KKA	10303992	SD
SDIT Cahaya Madani Lubuk Sikaping	Guru Kelas Rendah/Bahasa Indonesia	Guru Kelas Tinggi/Matematika	69898963	SD
SDIT Qurrata A'yun Batusangkar	Guru Kelas Rendah/Bahasa Indonesia	Guru Kelas Tinggi/Matematika	10307798	SD
SDN 01 Benteng Pasar Atas	Guru Kelas Rendah/Bahasa Indonesia	Guru Kelas Tinggi/Matematika	10307972	SD
SMP Islam Terpadu Sabbihisma	Guru Matematika	Guru Bahasa Indonesia/IPA	10304170	SMP
SMP Kristen Kalam Kudus Padang	Guru Matematika	Guru Bahasa Indonesia/IPA	10304795	SMP
SMP Negeri 03 Solok Selatan	Guru Matematika/Bahasa Indonesia	Guru IPA	10306960	SMP
SMP Negeri 2 Kota Solok	Guru Matematika	Guru Bahasa Indonesia/IPA	10303774	SMP
SMPS Islam Terpadu Kautsar Ilmi	Guru Bahasa Indonesia/Matematika/IPA	Guru KKA	69978638	SMP
SMAN 1 Gunung Talang	Guru Biologi/TIK/KKA	Guru Bahasa Indonesia/Bahasa Inggris	10301592	SMA
SMAN 2 Padang	Guru Bahasa Inggris	Guru Biologi/Bahasa Indonesia/TIK/KKA	10303499	SMA
SMAN 6 Padang	Guru Bahasa Inggris	Guru Biologi/Guru Ekonomi/Guru Bahasa Indonesia/TIK	10303503	SMA
SMKN 1 Pasaman	Guru TIK/KKA	Guru Bahasa Indonesia/Bahasa Inggris	10310877	SMK
SMKN 2 Bukittinggi	Guru Ekonomi	Guru Bahasa Indonesia/Bahasa Inggris/TIK/KKA	10307533	SMK
SMKN 3 Padang	Guru Bahasa Inggris	Guru Bahasa Indonesia/Matematika/TIK/KKA	10304849	SMK
SMKN 4 Payakumbuh	Guru TIK/KKA	Guru Bahasa Indonesia/Matematika/Ekonomi	69947085	SMK`;

const lines = rawText.split('\n');
const result = {};

lines.forEach(line => {
    if (!line.trim()) return;
    const parts = line.split('\t').map(p => p.trim());
    if (parts.length === 5) {
        const npsn = parts[3];
        result[npsn] = {
            sekolah: parts[0],
            mapel_1: parts[1],
            mapel_2: parts[2],
            jenjang: parts[4]
        };
    }
});

db.ref('kebutuhan_mapel').set(result).then(() => {
    console.log("Successfully uploaded kebutuhan_mapel with jenjang to Firebase.");
    process.exit(0);
}).catch(e => {
    console.error("Failed to upload:", e);
    process.exit(1);
});
