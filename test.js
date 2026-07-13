const f = require('fs');
const data = JSON.parse(f.readFileSync('e:/sekolah-model-oneapp/data-mentah/master_guru-ks_raw.json'));
console.log(data[0]);
