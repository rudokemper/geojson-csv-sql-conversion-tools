const fs = require('fs');
const argparse = require('argparse');
const { Client } = require('pg');

function getTableColumns(client, table) {
  return client.query(`SELECT * FROM ${table} LIMIT 0`)
    .then(result => result.fields.map(field => field.name));
}

async function insertCSVData(csvFilename, dbParams, table) {
  const client = new Client(dbParams);
  
  try {
    await client.connect();
    console.log("Connected to the database successfully!");

    const tableColumns = await getTableColumns(client, table);
    const csvData = await fs.promises.readFile(csvFilename, 'utf8');
    const csvLines = csvData.split('\n');
    const csvHeader = csvLines[0].split(',');

    function cleanColumnName(columnName) {
      return columnName.replace(/[^a-zA-Z0-9]/g, '');
    }

    const cleanedCsvHeader = csvHeader.map(cleanColumnName);
    const cleanedTableColumns = tableColumns.map(cleanColumnName);

    if (JSON.stringify(cleanedCsvHeader) === JSON.stringify(cleanedTableColumns)) {
      for (let i = 1; i < csvLines.length; i++) {
        const row = csvLines[i].split(',');
        const query = `INSERT INTO ${table} VALUES (${Array(row.length).fill().map((_, idx) => `$${idx + 1}`).join(', ')})`;
        await client.query(query, row);
      }
      console.log("Data inserted successfully!");
    } else {
      console.log("CSV header does not match table columns:");
      console.log("CSV Header:", cleanedCsvHeader);
      console.log("Table Columns:", cleanedTableColumns);
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    client.end();
  }
}

const parser = new argparse.ArgumentParser({
  description: 'Insert CSV data into PostgreSQL'
});
parser.addArgument(['--csv'], { required: true, help: 'CSV filename' });
parser.addArgument(['--dbname'], { required: true, help: 'Database name' });
parser.addArgument(['--user'], { required: true, help: 'Username' });
parser.addArgument(['--password'], { required: true, help: 'Password' });
parser.addArgument(['--host'], { required: true, help: 'Host' });
parser.addArgument(['--port'], { required: true, help: 'Port' });
parser.addArgument(['--table'], { required: true, help: 'Table name' });
const args = parser.parseArgs();

const dbParams = {
  database: args.dbname,
  user: args.user,
  password: args.password,
  host: args.host,
  port: args.port
};

insertCSVData(args.csv, dbParams, args.table);