const fs = require('fs');
const data = JSON.parse(fs.readFileSync('e:/sekolah-model-oneapp/data-mentah/master_guru-ks_raw.json'));
const slb = data.filter(d => (d.Jenjang && d.Jenjang.toLowerCase() === 'slb') || (d['Satuan Pendidikan'] && d['Satuan Pendidikan'].toLowerCase().includes('slb')));
console.log([...new Set(slb.map(s => s.NPSN))]);
