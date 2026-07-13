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

firebase.database().ref('konfirmasi_sekolah').once('value').then(snap => {
    const data = snap.val() || {};
    console.log("Total konfirmasi:", Object.keys(data).length);
    console.log("Data SLB (10307647):", data['10307647']);
    console.log("Keys:", Object.keys(data));
    process.exit(0);
}).catch(e => {
    console.error("Error:", e);
    process.exit(1);
});
