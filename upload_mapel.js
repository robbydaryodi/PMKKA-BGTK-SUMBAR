const firebase = require('firebase/compat/app');
require('firebase/compat/database');
const fs = require('fs');

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

const data = JSON.parse(fs.readFileSync('kebutuhan_mapel.json'));

db.ref('kebutuhan_mapel').set(data).then(() => {
    console.log("Successfully uploaded kebutuhan_mapel to Firebase.");
    process.exit(0);
}).catch(e => {
    console.error("Failed to upload:", e);
    process.exit(1);
});
