const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data pegawai.csv');
const rawContent = fs.readFileSync(filePath, 'utf8');

const lines = rawContent.split(/\r?\n/).filter(line => line.trim() !== '');

console.log(`Total non-empty lines: ${lines.length}`);
console.log('Header line:', lines[0]);
console.log('\nFirst 5 data rows:');
lines.slice(1, 6).forEach((line, idx) => {
    console.log(`Row ${idx + 1}:`, line);
});
