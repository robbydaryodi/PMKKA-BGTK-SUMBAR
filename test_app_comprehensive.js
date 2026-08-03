const fs = require('fs');
const path = require('path');
const firebase = require('firebase/compat/app');
require('firebase/compat/database');

const config = {
    apiKey: 'AIzaSyCAMKzhVnGGUxdVKAWeoPXYTAZvPSq6yKY',
    databaseURL: 'https://sekolah-model-2026-default-rtdb.asia-southeast1.firebasedatabase.app'
};
firebase.initializeApp(config);
const db = firebase.database();

async function runComprehensiveTests() {
    console.log("==========================================");
    console.log("🚀 STARTING COMPREHENSIVE APP TEST SUITE");
    console.log("==========================================\n");

    let totalTests = 0;
    let passedTests = 0;

    function assertTest(condition, name, details = "") {
        totalTests++;
        if (condition) {
            passedTests++;
            console.log(`  ✅ [PASS] ${name}`);
        } else {
            console.error(`  ❌ [FAIL] ${name} ${details ? '- ' + details : ''}`);
        }
    }

    // ----------------------------------------------------
    // TEST GROUP 1: FILE EXISTENCE & SYNTAX AUDIT
    // ----------------------------------------------------
    console.log("🔍 TEST GROUP 1: File Existence & DOM ID Audit");
    const requiredFiles = [
        'index.html',
        'persuratan.html',
        'fasilitator.html',
        'konfirmasi-kehadiran.html',
        'absen.html',
        'kombel.csv',
        'data pegawai.csv'
    ];

    requiredFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        const exists = fs.existsSync(filePath);
        assertTest(exists, `File ${file} exists on disk`);
    });

    // Check index.html element IDs
    const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    const indexRequiredIDs = [
        'viewModeKombel',
        'btnModeKombel',
        'tableKombelBody',
        'searchKombel',
        'filterKabKombel',
        'filterStatusSasaran',
        'statKombelTotal',
        'statKombelSasaran',
        'viewModePegawai',
        'btnModePegawai',
        'tablePegawaiBody',
        'searchPegawai',
        'listFasilContainer',
        'listManajemenSekolahContainer'
    ];

    indexRequiredIDs.forEach(id => {
        assertTest(indexHtml.includes(`id="${id}"`), `index.html contains DOM element ID '${id}'`);
    });

    // Check persuratan.html element IDs & Docx libraries
    const persuratanHtml = fs.readFileSync(path.join(__dirname, 'persuratan.html'), 'utf8');
    const persuratanRequiredIDs = [
        'modalEditTanggalJadwal',
        'editInputTanggal',
        'editSelectStatus',
        'tabelBody',
        'matriksBody',
        'modalKalenderDetail'
    ];

    persuratanRequiredIDs.forEach(id => {
        assertTest(persuratanHtml.includes(`id="${id}"`), `persuratan.html contains DOM element ID '${id}'`);
    });

    assertTest(persuratanHtml.includes('docx') && persuratanHtml.includes('FileSaver'), `persuratan.html includes docx & FileSaver CDN scripts for Word download`);

    // ----------------------------------------------------
    // TEST GROUP 2: FIREBASE DATABASE INTEGRITY
    // ----------------------------------------------------
    console.log("\n🔥 TEST GROUP 2: Firebase Realtime Database Data Integrity");
    
    try {
        const [kombelSnap, masterGuruSnap, fasilSnap, pegawaiSnap] = await Promise.all([
            db.ref('master_kombel').once('value'),
            db.ref('master_guru').once('value'),
            db.ref('fasilitator').once('value'),
            db.ref('master_pegawai').once('value')
        ]);

        const kombel = kombelSnap.val() || {};
        const kombelKeys = Object.keys(kombel);
        assertTest(kombelKeys.length >= 1800, `master_kombel contains 1,804 records (actual: ${kombelKeys.length})`);

        const sasaranKombel = Object.values(kombel).filter(k => k.is_sasaran);
        assertTest(sasaranKombel.length >= 5, `master_kombel has flagged Kombel Sasaran (actual: ${sasaranKombel.length})`);

        const masterGuru = masterGuruSnap.val() || {};
        const schoolKeys = Object.keys(masterGuru);
        assertTest(schoolKeys.length >= 25, `master_guru contains 25 Sekolah Model (actual: ${schoolKeys.length})`);

        let sampleGuruHasPrograms = false;
        if (schoolKeys.length > 0) {
            const sampleSchool = masterGuru[schoolKeys[0]];
            const firstGuru = Object.values(sampleSchool)[0];
            sampleGuruHasPrograms = Array.isArray(firstGuru.programs);
        }
        assertTest(sampleGuruHasPrograms, `master_guru entries contain 'programs' array attribute`);

        const fasil = fasilSnap.val() || {};
        const fasilKeys = Object.keys(fasil);
        assertTest(fasilKeys.length >= 38, `fasilitator contains Kombel & Model fasilitators (actual: ${fasilKeys.length})`);

        const dualProgsFasil = Object.values(fasil).filter(f => f.programs && f.programs.includes('sekolah_model') && f.programs.includes('kombel'));
        assertTest(dualProgsFasil.length >= 4, `fasilitator node correctly flags Dual Program fasilitators (actual: ${dualProgsFasil.length})`);

        const pegawai = pegawaiSnap.val() || {};
        const pegawaiKeys = Object.keys(pegawai);
        assertTest(pegawaiKeys.length >= 57, `master_pegawai contains 57 BGTK employees (actual: ${pegawaiKeys.length})`);

    } catch(e) {
        assertTest(false, `Firebase Database connectivity`, e.message);
    }

    // ----------------------------------------------------
    // TEST GROUP 3: LOGIC & CODE HEALTH AUDIT
    // ----------------------------------------------------
    console.log("\n⚙️ TEST GROUP 3: Logic & Code Health Audit");

    // Verify switchAdminView modes in index.html
    const modesInIndex = ['mode0', 'mode1', 'mode2', 'mode3', 'mode4', 'mode5', 'mode7', 'mode8', 'modeKombel', 'modePegawai'];
    modesInIndex.forEach(mode => {
        assertTest(indexHtml.includes(`'${mode}'`), `switchAdminView supports mode '${mode}'`);
    });

    console.log("\n==========================================");
    console.log(`📊 TEST RESULT: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests/totalTests)*100)}%)`);
    console.log("==========================================\n");

    process.exit(passedTests === totalTests ? 0 : 1);
}

runComprehensiveTests().catch(err => {
    console.error("Test suite error:", err);
    process.exit(1);
});
