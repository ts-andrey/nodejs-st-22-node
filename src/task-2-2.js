const { join, extname, basename } = require('path');
const { createWriteStream } = require('fs');
const { readdir, mkdir } = require('fs/promises');

const csv = require('csvtojson');

// check csv folder on .csv files and work with them if they exists
async function csvManager() {
  const files = await readdir(join(__dirname, '..', 'csv'));
  files.forEach(file => {
    const isCSV = extname(file) === '.csv';
    if (isCSV) {
      try {
        txtConverter(file);
      } catch (error) {
        console.log(error);
      }
    }
  });
}
// provide .txt files with required information into txt folder
async function txtConverter(file) {
  try {
    await readdir('txt');
  } catch (err) {
    await mkdir('txt');
  }
  const fileName = basename(file, '.csv');
  const writer = createWriteStream(join('txt', `${fileName}.txt`));
  let headers = [];
  let headerString = '';
  csv({ trim: true })
    .fromFile(join('csv', file))
    .on('header', header => {
      headerString = header[0];
      headers = headerString.split(';');
    });

  csv({ noheader: true, trim: true })
    .fromFile(join('csv', file))
    .on('data', data => write({ writer, headerString, headers, data }));
}
// separate async func to do writing operation into the file
async function write({ writer, data, headerString, headers }) {
  const csvLine = JSON.parse(data);
  const obj = csvLine.field1;
  const remainder = csvLine.field2;

  if (headerString !== obj) {
    const values = obj.split(';');
    const resultObj = {};
    values.forEach((val, index) => {
      // if value is price then add remainder to it, which is stored in another json property, named "field2"
      resultObj[headers[index].toLowerCase()] = Number.isInteger(+val) ? +`${val}.${remainder}` : val;
    });
    const { book, author, price } = resultObj;
    writer.write(`${JSON.stringify({ book, author, price })}\n`);
  }
}

csvManager();
