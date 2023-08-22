# GeoJSON to CSV to SQL conversion tools

A small selection of Python, Node, and bash scripts to help convert the contents of a GeoJSON file so they can be ingested into a SQL database.

The Python and Node scripts do the same thing.

## geojson-to-csv

A quick script to convert GeoJSON to CSV.

Python usage:

```
python python/geojson_to_csv.py --input [YOUR_FILE].geojson --output [YOUR_OUTPUT].csv
```

Node usage:

```
node node/geojson-to-csv.js [YOUR_FILE].geojson --output [YOUR_OUTPUT].csv
```

The scripts will generate the following columns per the standard GeoJSON fields:

| CSV Column | GeoJSON Field |
|------------|---------------|
| id         | id            |
| g\_\_type    | geometry.type |
| g\_\_coordinates | geometry.coordinates |
| p\_\_...     | properties... |
| p\_\_\_...     | properties.$... |

If no `id` is found, then it creates a random 16 character hash.

The root level key `type` is ignored (but open to understanding use cases where it could be valuable to preserve this for SQL storage)

## create-sql-table

A quick script to generate a SQL command that creates a SQL table on the basis of your CSV file.

Python usage:

```
python python/create-sql-table.py --input [YOUR_FILE].csv --table [YOUR_TABLE_NAME]
```

Node usage:

```
node node/create-sql-table.py --input [YOUR_FILE].csv --table [YOUR_TABLE_NAME]
```

The output is printed to the console for you to copy. You can use this in the SQLite CLI or a tool like Beekeeper Studio to create the table.

Example output:

```
CREATE TABLE geodata (id TEXT PRIMARY KEY, g__coordinates TEXT, g__type TEXT, p__$created TEXT, p__$modified TEXT, p__$photos TEXT, p__$version TEXT);
```

## import-csv-to-postgres

A quick script to import your CSV file into a PostgreSQL database.

Python usage:

```
Python python/import-csv-to-postgres.py --csv [YOUR_FILE].csv --dbname [YOUR_DATABASE] --user [USERNAME] --password [PASSWORD] --host [HOST] --port [PORT] --table [YOUR_DB_TABLE]
```

Node usage:

```
node node/import-csv-to-postgres.js --csv [YOUR_FILE].csv --dbname [YOUR_DATABASE] --user [USERNAME] --password [PASSWORD] --host [HOST] --port [PORT] --table [YOUR_DB_TABLE]
```

The script will validate if your CSV headers are the same as the database table column headers.

The script will alert you if the connection to the database was successful or not, and if the data import was successful or not.

## import-csv-sqlite.sh

A quick bash script to import a CSV file (like one generated through `geojson-to-csv`) into a SQlite table. 

Note: it is not mandatory to run `create-sql-table` beforehand as this script will generate the column headers if not found, but they will likely not follow the desired schema (i.e. with `id` as the key).

Usage:

```
bin/import_csv_sqlite.sh --filename [YOUR_FILENAME].csv --sqlite [YOUR_SQLITE_DATABASE].db --table [YOUR_TABLE_NAME]
```

You will likely need to give write permissions to your script:

```
chmod +x .\bin\import_csv_sqlite.sh
```