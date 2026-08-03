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

async function tagMasterGuruPrograms() {
    console.log("Membaca data master_guru...");
    const snap = await db.ref('master_guru').once('value');
    const masterGuru = snap.val() || {};

    let totalUpdated = 0;
    const updates = {};

    for (const [npsn, guruMap] of Object.entries(masterGuru)) {
        if (!guruMap || typeof guruMap !== 'object') continue;
        for (const [guruId, guruObj] of Object.entries(guruMap)) {
            if (!guruObj.programs) {
                updates[`master_guru/${npsn}/${guruId}/programs`] = ['sekolah_model'];
                totalUpdated++;
            }
        }
    }

    if (Object.keys(updates).length > 0) {
        console.log(`Meng-update ${totalUpdated} data guru di master_guru dengan atribut programs = ['sekolah_model']...`);
        await db.ref().update(updates);
        console.log("✅ UPDATE SELESAI!");
    } else {
        console.log("Semua data master_guru sudah memiliki atribut programs.");
    }
    process.exit(0);
}

tagMasterGuruPrograms().catch(err => {
    console.error("Gagal update master_guru programs:", err);
    process.exit(1);
});
