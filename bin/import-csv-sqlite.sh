#!/bin/bash

CSV_FILENAME=""
SQLITE_DB=""
TABLE_NAME=""

while [[ $# -gt 0 ]]; do
    key="$1"

    case $key in
        --filename|-f)
        CSV_FILENAME="$2"
        shift
        shift
        ;;
        --sqlite|-s)
        SQLITE_DB="$2"
        shift
        shift
        ;;
        --table|-t)
        TABLE_NAME="$2"
        shift
        shift
        ;;
        *)
        shift
        ;;
    esac
done

if [[ -z $CSV_FILENAME || -z $SQLITE_DB || -z $TABLE_NAME ]]; then
    echo "Usage: ./import_csv_sqlite.sh --filename <csv_filename> --sqlite <sqlite_db> --table <table_name>"
    exit 1
fi

echo "Importing CSV data from $CSV_FILENAME to SQLite table $TABLE_NAME in database $SQLITE_DB..."

sqlite3 $SQLITE_DB <<EOF
.mode csv
.import $CSV_FILENAME $TABLE_NAME
.quit
EOF

if [ $? -ne 0 ]; then
    echo "Error: CSV data import failed."
    exit 1
fi

echo "CSV data imported successfully into SQLite table $TABLE_NAME in database $SQLITE_DB."
