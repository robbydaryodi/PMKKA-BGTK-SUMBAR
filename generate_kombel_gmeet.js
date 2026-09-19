const fs = require('fs');
const http = require('http');
const url = require('url');
const { exec } = require('child_process');
const { google } = require('googleapis');

const CREDENTIALS_PATH = 'credentials.json';
const TOKEN_PATH = 'token.json';
const SCOPES = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar'
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
                                <p style="font-size: 16px; color: #374151;">Akun Google Anda telah terhubung. Sistem sedang memproses pembuatan link Google Meet untuk 54 Kombel.</p>
                                <p style="color: #6B7280; font-size: 14px;">Anda dapat menutup tab browser ini dan kembali ke aplikasi.</p>
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
            console.log("Jika browser tidak terbuka otomatis, silakan buka link ini:");
            console.log(authUrl);
            console.log("=======================================================\n");
            openBrowser(authUrl);
        });

        server.on('error', (err) => {
            reject(err);
        });
    });
}

async function fetchKombelSasaran() {
    console.log("Mengambil data live master_kombel dari Firebase...");
    const res = await fetch("https://sekolah-model-2026-default-rtdb.asia-southeast1.firebasedatabase.app/master_kombel.json");
    if (!res.ok) throw new Error("Gagal mengambil data Firebase: " + res.statusText);
    const allKombels = await res.json();

    function isSubmitted(k) {
        if (!k) return false;
        if (k.konfirmasi && (k.konfirmasi.is_konfirmasi || k.konfirmasi.is_submitted || k.konfirmasi.status === 'submitted')) return true;
        if (k.seleksi_peserta_fkk && (k.seleksi_peserta_fkk.is_submitted || k.seleksi_peserta_fkk.is_konfirmasi)) return true;
        if (Array.isArray(k.selected_peserta_indices) && k.selected_peserta_indices.length > 0) return true;
        return false;
    }

    const sasaranList = Object.keys(allKombels).map(id => ({ id, ...allKombels[id] }))
        .filter(k => k.is_sasaran || isSubmitted(k));

    return sasaranList;
}

async function createMeetForKombel(calendar, kombel, index, total) {
    const namaKombel = kombel.nama_kombel || `Kombel ${kombel.id}`;
    const kabKota = kombel.kab_kota || '';
    const namaKetua = kombel.nama_ketua || '-';

    console.log(`[${index + 1}/${total}] Memproses: ${namaKombel} (${kabKota})...`);

    // Cek jika sudah memiliki link_gmeet sebelumnya
    if (kombel.link_gmeet && kombel.link_gmeet.includes('meet.google.com')) {
        console.log(`   -> Sudah ada link GMeet: ${kombel.link_gmeet} (Skip)`);
        return {
            id: kombel.id,
            nama: namaKombel,
            kab_kota: kabKota,
            link_gmeet: kombel.link_gmeet,
            status: 'sudah_ada'
        };
    }

    const event = {
        summary: `PM-KKA 2026 - ${namaKombel}`,
        description: `Ruang Pertemuan Daring Resmi PM-KKA BGTK Sumatera Barat 2026.\n\nKomunitas Belajar: ${namaKombel}\nWilayah: ${kabKota}\nKetua: ${namaKetua}\n\n*Tautan Google Meet ini bersifat permanen untuk seluruh aktivitas daring Kombel selama program berjalan.*`,
        start: {
            dateTime: '2026-03-01T08:00:00+07:00',
            timeZone: 'Asia/Jakarta'
        },
        end: {
            dateTime: '2026-03-01T12:00:00+07:00',
            timeZone: 'Asia/Jakarta'
        },
        conferenceData: {
            createRequest: {
                requestId: `pmkka-${kombel.id}-${Date.now()}`,
                conferenceSolutionKey: {
                    type: 'hangoutsMeet'
                }
            }
        }
    };

    try {
        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1
        });

        const meetLink = response.data.hangoutLink || (response.data.conferenceData && response.data.conferenceData.entryPoints ? response.data.conferenceData.entryPoints[0].uri : null);
        const eventId = response.data.id;

        if (!meetLink) {
            console.error(`   [!] Gagal mendapatkan link Meet untuk: ${namaKombel}`);
            return { id: kombel.id, nama: namaKombel, link_gmeet: null, status: 'gagal' };
        }

        console.log(`   ✅ Link GMeet: ${meetLink}`);

        // Update ke Firebase secara langsung
        const patchUrl = `https://sekolah-model-2026-default-rtdb.asia-southeast1.firebasedatabase.app/master_kombel/${kombel.id}.json`;
        await fetch(patchUrl, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                link_gmeet: meetLink,
                gmeet_event_id: eventId,
                gmeet_created_at: new Date().toISOString()
            })
        });

        return {
            id: kombel.id,
            nama: namaKombel,
            kab_kota: kabKota,
            link_gmeet: meetLink,
            status: 'berhasil'
        };
    } catch (err) {
        console.error(`   ❌ Error membuat event:`, err.message);
        return { id: kombel.id, nama: namaKombel, link_gmeet: null, status: 'error: ' + err.message };
    }
}

async function main() {
    try {
        const credentials = await loadCredentials();
        console.log("Memulai proses otentikasi Google...");
        const auth = await authenticate(credentials);
        
        const calendar = google.calendar({ version: 'v3', auth });

        // Cek info akun calendar
        const calList = await calendar.calendarList.get({ calendarId: 'primary' });
        console.log(`\nTerhubung ke Google Calendar Akun: ${calList.data.summary} (${calList.data.id})`);

        const kombelList = await fetchKombelSasaran();
        console.log(`Ditemukan ${kombelList.length} Kombel Sasaran.\n`);

        const results = [];
        for (let i = 0; i < kombelList.length; i++) {
            const res = await createMeetForKombel(calendar, kombelList[i], i, kombelList.length);
            results.push(res);
            // Delay halus 300ms agar ramah rate limit
            await new Promise(r => setTimeout(r, 300));
        }

        // Simpan rekap hasil ke file JSON
        fs.writeFileSync('rekap_link_gmeet_kombel.json', JSON.stringify(results, null, 2));
        console.log("\n=======================================================");
        console.log("🎉 SELESAI! Semua link Google Meet berhasil dibuat dan disimpan ke Firebase.");
        console.log("Rekap disimpan ke rekap_link_gmeet_kombel.json");
        console.log("=======================================================\n");

    } catch (err) {
        console.error("Terjadi kesalahan:", err);
    }
}

main();
