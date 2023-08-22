const fs = require('fs');
const path = require('path');
const argparse = require('argparse');
const csvWriter = require('csv-write-stream');

function generateRandomHash(length) {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function preprocessColumnName(columnName) {
  // Replace hyphens and dollar signs with underscores
  return columnName.replace(/-/g, '_').replace(/\$/g, '_');
}

function flattenObject(data, prefix) {
  let flattened = {};
  if (data !== null) {
    for (let [key, value] of Object.entries(data)) {
      flattened[`${prefix}__${key}`] = preprocessField(value);
    }
  }
  return flattened;
}

function preprocessField(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return value.toString().replace(/\n/g, ' '); // Replace line breaks with spaces
}

function main(inputFilename, outputFilename) {
  const inputData = fs.readFileSync(inputFilename, 'utf8');
  const data = JSON.parse(inputData);

  const features = data.features;

  const geometryColumns = new Set();
  const propertiesColumns = new Set();

  for (let feature of features) {
    const geometryFields = flattenObject(feature.geometry, 'g');
    const propertiesFields = flattenObject(feature.properties, 'p');
    for (let key of Object.keys(geometryFields)) {
      geometryColumns.add(key);
    }
    for (let key of Object.keys(propertiesFields)) {
      propertiesColumns.add(key);
    }
  }

  const header = ['id', ...Array.from(geometryColumns).sort(), ...Array.from(propertiesColumns).sort()];
  const csvStream = csvWriter({
    headers: header.map(preprocessColumnName),
    separator: ',',
    newline: '\n',
  });

  const outputStream = fs.createWriteStream(outputFilename);
  csvStream.pipe(outputStream);

  for (let feature of features) {
    const featureId = feature.id || generateRandomHash(16);
    const geometryFields = flattenObject(feature.geometry, 'g');
    const propertiesFields = flattenObject(feature.properties, 'p');
    const row = [featureId, ...Array.from(geometryColumns).map((col) => geometryFields[col] || ''), ...Array.from(propertiesColumns).map((col) => propertiesFields[col] || '')];
    csvStream.write(row);
  }

  csvStream.end(() => {
    console.log(`CSV file '${outputFilename}' has been successfully generated!`);
  });
}

const parser = new argparse.ArgumentParser({
  description: 'Convert GeoJSON to CSV',
});
parser.addArgument(['--input'], { required: true, help: 'Input GeoJSON filename' });
parser.addArgument(['--output'], { required: true, help: 'Output CSV filename' });
const args = parser.parseArgs();

const inputFilename = args.input;
const outputFilename = args.output;

main(inputFilename, outputFilename);