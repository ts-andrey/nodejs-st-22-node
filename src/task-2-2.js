var { join, extname, basename } = require('path');
var { createWriteStream } = require('fs');
var { readdir, mkdir } = require('fs');

var csv = require('csvtojson');

// check csv folder on .csv files and work with them if they exists
function csvManager() {
  readdir(join(__dirname, '..', 'csv'), function (err, files) {
    if (!err) {
      files.forEach(file => {
        var isCSV = extname(file) === '.csv';
        if (isCSV) {
          txtConverter(file);
        }
      });
    }
  });
}
// provide .txt files with required information into txt folder
function txtConverter(file) {
  var fileName = basename(file, '.csv');
  var writer;
  try {
    readdir('txt', function (err, files) {
      if (err) {
        mkdir('txt', function () {
          return (writer = createWriteStream(join('txt', `${fileName}.txt`)));
        });
      }
      writer = createWriteStream(join('txt', `${fileName}.txt`));
    });
  } catch (error) {
    console.log(error);
  }

  var headers = [];
  var headerString = '';
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
function write({ writer, data, headerString, headers }) {
  var csvLine = JSON.parse(data);
  var obj = csvLine.field1;
  var remainder = csvLine.field2;

  if (headerString !== obj) {
    var values = obj.split(';');
    var resultObj = {};
    values.forEach((val, index) => {
      // if value is price then add remainder to it, which is stored in another json property, named "field2"
      resultObj[headers[index].toLowerCase()] = Number.isInteger(+val) ? +`${val}.${remainder}` : val;
    });
    var { book, author, price } = resultObj;
    writer.write(`${JSON.stringify({ book, author, price })}\n`);
  }
}

csvManager();
