const fs = require('fs');

const rawText = `TK Adzkia I	PAUD	PAUD	10308571
TK Aisyiyah I Bukittinggi	PAUD	PAUD 	10310513
TK AL-HUFFAZH	PAUD	PAUD	69832151
TK Citra Al Madina	PAUD	PAUD	10308593
SD Kristen Kalam Kudus Padang	Guru Kelas Rendah/Bahasa Indonesia	Guru KKA	10304009
SD Negeri 02 Sariak	Guru Kelas Rendah/Bahasa Indonesia	Guru KKA	10300464
SD Negeri 04 Payakumbuh	Guru Kelas Rendah/Bahasa Indonesia	Guru Kelas Tinggi/Matematika	10303924
SD Negeri 26 Jati Utara	Guru Kelas Rendah/Bahasa Indonesia	Guru KKA	10304619
SDIT Adzkia 1 Sumatera Barat	Guru Kelas Rendah/Bahasa Indonesia	Guru KKA	10303992
SDIT Cahaya Madani Lubuk Sikaping	Guru Kelas Rendah/Bahasa Indonesia	Guru Kelas Tinggi/Matematika	69898963
SDIT Qurrata A'yun Batusangkar	Guru Kelas Rendah/Bahasa Indonesia	Guru Kelas Tinggi/Matematika	10307798
SDN 01 Benteng Pasar Atas	Guru Kelas Rendah/Bahasa Indonesia	Guru Kelas Tinggi/Matematika	10307972
SMP Islam Terpadu Sabbihisma	Guru Matematika	Guru Bahasa Indonesia/IPA	10304170
SMP Kristen Kalam Kudus Padang	Guru Matematika	Guru Bahasa Indonesia/IPA	10304795
SMP Negeri 03 Solok Selatan	Guru Matematika/Bahasa Indonesia	Guru IPA	10306960
SMP Negeri 2 Kota Solok	Guru Matematika	Guru Bahasa Indonesia/IPA	10303774
SMPS Islam Terpadu Kautsar Ilmi	Guru Bahasa Indonesia/Matematika/IPA	Guru KKA	69978638
SMAN 1 Gunung Talang	Guru Biologi/TIK/KKA	Guru Bahasa Indonesia/Bahasa Inggris	10301592
SMAN 2 Padang	Guru Bahasa Inggris	Guru Biologi/Bahasa Indonesia/TIK/KKA	10303499
SMAN 6 Padang	Guru Bahasa Inggris	Guru Biologi/Guru Ekonomi/Guru Bahasa Indonesia/TIK	10303503
SMKN 1 Pasaman	Guru TIK/KKA	Guru Bahasa Indonesia/Bahasa Inggris	10310877
SMKN 2 Bukittinggi	Guru Ekonomi	Guru Bahasa Indonesia/Bahasa Inggris/TIK/KKA	10307533
SMKN 3 Padang	Guru Bahasa Inggris	Guru Bahasa Indonesia/Matematika/TIK/KKA	10304849
SMKN 4 Payakumbuh	Guru TIK/KKA	Guru Bahasa Indonesia/Matematika/Ekonomi	69947085`;

const lines = rawText.split('\n');
const result = {};

lines.forEach(line => {
    if (!line.trim()) return;
    const parts = line.split('\t').map(p => p.trim());
    if (parts.length === 4) {
        const npsn = parts[3];
        result[npsn] = {
            sekolah: parts[0],
            mapel_1: parts[1],
            mapel_2: parts[2]
        };
    }
});

fs.writeFileSync('kebutuhan_mapel.json', JSON.stringify(result, null, 2));
console.log('Saved to kebutuhan_mapel.json. Total:', Object.keys(result).length);
