const fs = require('fs');
const https = require('https');

https.get("https://sekolah-model-oneapp-default-rtdb.asia-southeast1.firebasedatabase.app/konfirmasi_sekolah.json", (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const db = JSON.parse(data);
        console.log("Total entries:", Object.keys(db).length);
        console.log(Object.keys(db));
    });
});
