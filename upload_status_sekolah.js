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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

const rawData = JSON.parse(fs.readFileSync('e:/sekolah-model-oneapp/data_status_sekolah_model.json', 'utf8'));

console.log(`Uploading ${Object.keys(rawData).length} schools to Firebase node status_sekolah_model...`);

const promises = [];
for (const npsn in rawData) {
    promises.push(db.ref(`status_sekolah_model/${npsn}`).set(rawData[npsn]));
}

Promise.all(promises).then(() => {
    console.log("Successfully uploaded status_sekolah_model per NPSN to Firebase!");
    process.exit(0);
}).catch(e => {
    console.error("Failed uploading status_sekolah_model:", e);
    process.exit(1);
});
