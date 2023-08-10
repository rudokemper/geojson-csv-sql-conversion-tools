# GeoJSON to CSV to SQL conversion tools

A small selection of Python, Node, and bash scripts to help convert the contents of a GeoJSON file so they can be ingested into a SQL database.

The Python and Node scripts do the same thing.

## geojson-to-csv

A quick script to convert GeoJSON to CSV.

Python usage:

```
python .\python\geojson_to_csv.py --input [YOUR_FILE].geojson --output [YOUR_OUTPUT].csv
```

Node usage:

```
node .\node\geojson-to-csv.js [YOUR_FILE].geojson --output [YOUR_OUTPUT].csv
```

The scripts assume the following structure of a `feature` in a GeoJSON file.

```
├── id
├── geometry
│   ├── type
│   └── coordinates
│       └── [...]
└── properties
    ├── ...
    └── ...
```

Any keys stored in the `geometry` key are converted to column headers prefixed by `g__` and any keys stored in the `properties` key are converted to column headers prefixed by `p__`. Any `$` and `-` characters in the headers are replaced by `_`.

If no `id` is found, then it creates a random 16 character hash.

The root level key `type` is ignored (but open to understanding use cases where it could be valuable to preserve this for SQL storage)

## create-sql-table

A quick script to generate a SQL command that creates a SQL table on the basis of your CSV file.

Python usage:

```
python .\python\csv-to-sql.py --input [YOUR_FILE].csv --table [YOUR_TABLE_NAME]
```

Node usage:

```
node .\node\csv-to-sql.js --input [YOUR_FILE].csv --table [YOUR_TABLE_NAME]
```

The output is printed to the console for you to copy. You can use this in the SQLite CLI or a tool like Beekeeper Studio to create the table.

Example output:

```
CREATE TABLE geodata (id TEXT PRIMARY KEY, g__coordinates TEXT, g__type TEXT, p__$created TEXT, p__$modified TEXT, p__$photos TEXT, p__$version TEXT);
```

## import-csv-sqlite.sh

A quick bash script to import a CSV file (like one generated through `geojson-to-csv`) into a SQlite table. 

Note: it is not mandatory to run `create-sql-table` beforehand as this script will generate the column headers if not found, but they will likely not follow the desired schema (i.e. with `id` as the key).

Usage:

```
.\bin\import_csv_sqlite.sh --filename [YOUR_FILENAME].csv --sqlite [YOUR_SQLITE_DATABASE].db --table [YOUR_TABLE_NAME]
```

You will likely need to give write permissions to your script:

```
chmod +x .\bin\import_csv_sqlite.sh
```