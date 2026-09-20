const fs = require('fs');
const http = require('http');
const url = require('url');
const { exec } = require('child_process');
const { google } = require('googleapis');
const firebase = require('firebase/compat/app');
require('firebase/compat/database');
require('firebase/compat/auth');

const firebaseConfig = {
    apiKey: "AIzaSyCAMKzhVnGGUxdVKAWeoPXYTAZvPSq6yKY",
    authDomain: "sekolah-model-2026.firebaseapp.com",
    databaseURL: "https://sekolah-model-2026-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "sekolah-model-2026",
    storageBucket: "sekolah-model-2026.firebasestorage.app",
    messagingSenderId: "1014570073770",
    appId: "1:1014570073770:web:770e7e6cef2a52a3825ad3"
};

const CREDENTIALS_PATH = 'credentials.json';
const TOKEN_PATH = 'token.json';
const SCOPES = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/meetings.space.settings',
    'https://www.googleapis.com/auth/meetings.space.created'
];

async function loadCredentials() {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
        throw new Error("File credentials.json tidak ditemukan di direktori!");
    }
    const content = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
    const keys = JSON.parse(content);
    return keys.installed || keys.web;
}

function openBrowser(targetUrl) {
    if (process.platform === 'win32') {
        exec(`powershell -NoProfile -Command "Start-Process '${targetUrl.replace(/'/g, "''")}'"`);
    } else if (process.platform === 'darwin') {
        exec(`open "${targetUrl}"`);
    } else {
        exec(`xdg-open "${targetUrl}"`);
    }
}

async function authenticate(credentials) {
    if (fs.existsSync(TOKEN_PATH)) {
        const tokenContent = fs.readFileSync(TOKEN_PATH, 'utf8');
        const token = JSON.parse(tokenContent);
        const oauth2Client = new google.auth.OAuth2(
            credentials.client_id,
            credentials.client_secret,
            'http://localhost:3000'
        );
        oauth2Client.setCredentials(token);
        return oauth2Client;
    }

    return new Promise((resolve, reject) => {
        const port = 3000;
        const redirectUri = `http://localhost:${port}`;
        const oauth2Client = new google.auth.OAuth2(
            credentials.client_id,
            credentials.client_secret,
            redirectUri
        );

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
            prompt: 'consent'
        });

        const server = http.createServer(async (req, res) => {
            try {
                const parsedUrl = url.parse(req.url, true);
                if (parsedUrl.pathname === '/') {
                    const code = parsedUrl.query.code;
                    if (code) {
                        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(`
                            <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                                <h1 style="color: #10B981;">✅ Otentikasi Berhasil!</h1>
                                <p style="font-size: 16px; color: #374151;">Akun Google Anda telah terhubung.</p>
                            </div>
                        `);
                        server.close();

                        const { tokens } = await oauth2Client.getToken(code);
                        oauth2Client.setCredentials(tokens);
                        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
                        console.log("\n[OK] Token berhasil disimpan ke token.json!");
                        resolve(oauth2Client);
                    } else if (parsedUrl.query.error) {
                        res.writeHead(400, { 'Content-Type': 'text/html' });
                        res.end(`<h3>Login Ditolak: ${parsedUrl.query.error}</h3>`);
                        server.close();
                        reject(new Error(`Login ditolak: ${parsedUrl.query.error}`));
                    }
                }
            } catch (err) {
                reject(err);
            }
        });

        server.listen(port, () => {
            console.log("\n=======================================================");
            console.log("👉 MEMBUKA BROWSER UNTUK LOGIN GOOGLE...");
            console.log(authUrl);
            console.log("=======================================================\n");
            openBrowser(authUrl);
        });

        server.on('error', (err) => {
            reject(err);
        });
    });
}

const ADMIN_KELAS_GABUNGAN_MAP = {
    'padang_mkks': {
        id: 'padang_mkks',
        primary_id: '177738',
        secondary_id: '161025',
        nama_kelas: 'MKKS SMP SWASTA KOTA PADANG & TUMBUH BERSAMA'
    },
    'payakumbuh_paud': {
        id: 'payakumbuh_paud',
        primary_id: '182059',
        secondary_id: '187339',
        nama_kelas: 'Kenanga & Seroja'
    },
    'agam_sd': {
        id: 'agam_sd',
        primary_id: '161533',
        secondary_id: '184503',
        nama_kelas: 'KKG GUGUS II TK SD KECAMTAN BANUHAMPU & KKG Gugus 1 Kecamatan Sungaipua'
    }
};

async function initFirebase() {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    await firebase.auth().signInAnonymously();
    console.log("✅ Terhubung ke Firebase RTDB (Auth Anonim: " + firebase.auth().currentUser.uid + ")");
    return firebase.database();
}

async function fetchDistinctKelasList(db) {
    console.log("Mengambil data live master_kombel dari Firebase...");
    const snap = await db.ref('master_kombel').once('value');
    const allKombels = snap.val() || {};

    const distinctKelas = [];
    const processedIds = new Set();

    // 1. Tambahkan 3 kelas gabungan
    Object.values(ADMIN_KELAS_GABUNGAN_MAP).forEach(cfg => {
        processedIds.add(cfg.primary_id);
        processedIds.add(cfg.secondary_id);
        const k1 = allKombels[cfg.primary_id] || {};
        distinctKelas.push({
            id: cfg.id,
            primary_id: cfg.primary_id,
            secondary_id: cfg.secondary_id,
            nama_kelas: cfg.nama_kelas,
            kab_kota: k1.kab_kota || 'Sumatera Barat',
            bor_links: k1.bor_links || null
        });
    });

    // 2. Tambahkan kelas mandiri yang sasaran
    function isSubmitted(k) {
        if (!k) return false;
        if (k.konfirmasi && (k.konfirmasi.is_konfirmasi || k.konfirmasi.is_submitted || k.konfirmasi.status === 'submitted')) return true;
        if (k.seleksi_peserta_fkk && (k.seleksi_peserta_fkk.is_submitted || k.seleksi_peserta_fkk.is_konfirmasi)) return true;
        if (Array.isArray(k.selected_peserta_indices) && k.selected_peserta_indices.length > 0) return true;
        return false;
    }

    Object.entries(allKombels).forEach(([id, k]) => {
        if (!k) return;
        if (processedIds.has(id)) return;
        if (k.is_sasaran || isSubmitted(k)) {
            processedIds.add(id);
            distinctKelas.push({
                id: id,
                primary_id: id,
                secondary_id: null,
                nama_kelas: k.nama_kombel || `Kombel ${id}`,
                kab_kota: k.kab_kota || '-',
                bor_links: k.bor_links || null
            });
        }
    });

    return distinctKelas;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function createBorSpaceWithRetry(meet, borName, maxRetries = 5) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const res = await meet.spaces.create({
                resource: {
                    config: {
                        accessType: 'OPEN',
                        moderation: 'OFF',
                        artifactConfig: {
                            recordingConfig: {
                                autoRecordingGeneration: 'ON'
                            }
                        }
                    }
                }
            });
            return {
                nama: borName,
                link: res.data.meetingUri,
                code: res.data.meetingCode,
                space_name: res.data.name
            };
        } catch (err) {
            const isRateLimit = err.message && (err.message.includes('Quota exceeded') || err.message.includes('rateLimitExceeded') || err.status === 429);
            if (isRateLimit && attempt <= maxRetries) {
                console.warn(`\n   ⏳ [Rate Limit] Kuota per menit tercapai. Istirahat 65 detik sebelum coba lagi (Percobaan ${attempt}/${maxRetries})...`);
                await sleep(65000);
            } else {
                throw err;
            }
        }
    }
}

async function main() {
    try {
        const credentials = await loadCredentials();
        console.log("Memulai proses otentikasi Google Meet...");
        const auth = await authenticate(credentials);
        const meet = google.meet({ version: 'v2', auth });

        const db = await initFirebase();
        const kelasList = await fetchDistinctKelasList(db);
        console.log(`\nDitemukan ${kelasList.length} Kelas Kombel untuk dibuatkan 5 BOR per kelas.\n`);

        // Load existing rekap jika ada untuk resume
        let rekapMap = {};
        if (fs.existsSync('rekap_bor_kombel.json')) {
            try {
                const existing = JSON.parse(fs.readFileSync('rekap_bor_kombel.json', 'utf8'));
                if (Array.isArray(existing)) {
                    existing.forEach(item => {
                        if (item.id && Array.isArray(item.bor_links) && item.bor_links.length > 0) {
                            rekapMap[item.id] = item.bor_links;
                        }
                    });
                }
            } catch (e) {
                console.warn("Gagal membaca rekap_bor_kombel.json:", e.message);
            }
        }

        const allResults = [];

        for (let i = 0; i < kelasList.length; i++) {
            const k = kelasList[i];
            console.log(`\n-----------------------------------------------------------`);
            console.log(`[${i + 1}/${kelasList.length}] Memproses Kelas: ${k.nama_kelas} (${k.kab_kota})`);

            // Cek sumber BOR yang sudah ada: dari Firebase atau dari rekap lokal
            let currentBorLinks = (Array.isArray(k.bor_links) && k.bor_links.length > 0) 
                ? k.bor_links 
                : (rekapMap[k.primary_id] || []);

            // Jika sudah punya 5 BOR lengkap
            if (currentBorLinks.length === 5) {
                console.log(`   -> Kelas ini sudah memiliki 5 BOR lengkap.`);
                
                // Pastikan tersimpan di Firebase (kalau sebelumnya baru tersimpan di file)
                if (!Array.isArray(k.bor_links) || k.bor_links.length !== 5) {
                    process.stdout.write(`   Sync ke Firebase... `);
                    await db.ref(`master_kombel/${k.primary_id}/bor_links`).set(currentBorLinks);
                    if (k.secondary_id) {
                        await db.ref(`master_kombel/${k.secondary_id}/bor_links`).set(currentBorLinks);
                    }
                    console.log(`✅ Saved!`);
                }

                allResults.push({ id: k.primary_id, nama: k.nama_kelas, bor_links: currentBorLinks, status: 'berhasil' });
                fs.writeFileSync('rekap_bor_kombel.json', JSON.stringify(allResults, null, 2));
                continue;
            }

            // Buat BOR yang belum ada (nomor 1 sampai 5)
            const finalBorList = [...currentBorLinks];
            for (let b = 1; b <= 5; b++) {
                const existingBor = finalBorList.find(item => item.nomor === b);
                if (existingBor && existingBor.link) {
                    console.log(`   BOR ${b}: Sudah ada (${existingBor.link})`);
                    continue;
                }

                const borTitle = `${k.nama_kelas} - BOR ${b}`;
                process.stdout.write(`   Membuat BOR ${b}... `);
                try {
                    const borObj = await createBorSpaceWithRetry(meet, borTitle);
                    borObj.nomor = b;
                    console.log(`✅ ${borObj.link}`);
                    finalBorList.push(borObj);
                    // Pacing 3500ms antar pembuatan room
                    await sleep(3500);
                } catch (err) {
                    console.log(`❌ Gagal: ${err.message}`);
                }
            }

            // Urutkan nomor 1 - 5
            finalBorList.sort((a, b) => (a.nomor || 0) - (b.nomor || 0));

            // Simpan ke Firebase
            if (finalBorList.length === 5) {
                await db.ref(`master_kombel/${k.primary_id}/bor_links`).set(finalBorList);
                if (k.secondary_id) {
                    await db.ref(`master_kombel/${k.secondary_id}/bor_links`).set(finalBorList);
                }
                console.log(`   💾 Berhasil disimpan ke Firebase untuk ${k.primary_id}${k.secondary_id ? ' & ' + k.secondary_id : ''}!`);
                allResults.push({ id: k.primary_id, nama: k.nama_kelas, bor_links: finalBorList, status: 'berhasil' });
            } else {
                console.warn(`   ⚠️ Tersedia ${finalBorList.length}/5 BOR untuk kelas ini.`);
                if (finalBorList.length > 0) {
                    await db.ref(`master_kombel/${k.primary_id}/bor_links`).set(finalBorList);
                    if (k.secondary_id) {
                        await db.ref(`master_kombel/${k.secondary_id}/bor_links`).set(finalBorList);
                    }
                }
                allResults.push({ id: k.primary_id, nama: k.nama_kelas, bor_links: finalBorList, status: 'sebagian' });
            }

            // Simpan progres ke file
            fs.writeFileSync('rekap_bor_kombel.json', JSON.stringify(allResults, null, 2));
            await sleep(1000);
        }

        console.log("\n=======================================================");
        console.log("🎉 SELESAI! Seluruh Breakout Room (BOR 1-5) berhasil diproses dan disimpan ke Firebase.");
        console.log("File rekap tersimpan di rekap_bor_kombel.json");
        console.log("=======================================================\n");

        process.exit(0);
    } catch (err) {
        console.error("Terjadi kesalahan fatal:", err);
        process.exit(1);
    }
}

main();
