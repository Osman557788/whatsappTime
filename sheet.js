const xlsx = require('xlsx');
const workbook = xlsx.readFile('example.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const range = xlsx.utils.decode_range(sheet['!ref']);

for (let i = range.s.r; i <= range.e.r; i++) {
  const cell = sheet[xlsx.utils.encode_cell({ r: i, c: 1 })];
  if (cell) {
    const phoneNumber = cell.v.toString().replace(/\+/g, '');
    console.log(phoneNumber);
  }
}

umuB2ekmseqm72O14eT60DFVoB8R



