const fs = require('fs');
const path = require('path');
const argparse = require('argparse');
const csv = require('csv-parser');

function generateCreateTableSql(tableName, columns) {
  const sqlColumns = columns.map((col) => `${col} TEXT`).join(', ');
  return `CREATE TABLE PUBLIC.${tableName} (id TEXT PRIMARY KEY, ${sqlColumns});`;
}

function readCsvHeader(filePath) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath);
    stream.pipe(csv())
      .on('headers', (headers) => {
        const cleanedHeaders = headers.map(header => 
          header.replace(/ /g, '_').replace(/\(|\)/g, '')
        );
        stream.destroy();
        resolve(cleanedHeaders);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

async function convertCsvToSql(inputFilename, tableName) {
  const csvHeader = await readCsvHeader(inputFilename);
  const propertyColumns = csvHeader.filter((col) => col !== 'id');

  const createTableSql = generateCreateTableSql(tableName, propertyColumns);

  console.log(createTableSql);
}

const parser = new argparse.ArgumentParser({
  description: 'Convert CSV to SQL schema',
});
parser.addArgument(['--input'], { required: true, help: 'Input CSV filename' });
parser.addArgument(['--table'], { required: true, help: 'Output table name' });
const args = parser.parseArgs();

const inputFilename = args.input;
const tableName = args.table;

convertCsvToSql(inputFilename, tableName);
