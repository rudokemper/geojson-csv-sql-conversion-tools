import csv
import argparse
import psycopg2
import re

def get_table_columns(cur, table_name):
    cur.execute(f"SELECT * FROM {table_name} LIMIT 0")
    return [desc[0] for desc in cur.description]

def clean_column_name(column_name):
    return re.sub(r'[^a-zA-Z0-9]', '', column_name)

def insert_csv_data(csv_filename, db_params, table_name):
    try:
        conn = psycopg2.connect(**db_params)
        print("Connected to the database successfully!")
        cur = conn.cursor()

        table_columns = get_table_columns(cur, table_name)
        
        with open(csv_filename, 'r') as csv_file:
            csv_reader = csv.reader(csv_file)
            csv_header = next(csv_reader)

            if all(clean_column_name(col) for col in csv_header) == all(clean_column_name(col) for col in table_columns):                
                for row in csv_reader:
                    query = f"INSERT INTO {table_name} VALUES ({', '.join(['%s']*len(row))})"
                    cur.execute(query, row)

                conn.commit()
                print("Data inserted successfully!")

            else:
                print("CSV header does not match table columns:")
                print("CSV Header:", csv_header)
                print("Table Columns:", table_columns)

        cur.close()
        conn.close()

    except (Exception, psycopg2.Error) as error:
        print("Error:", error)

    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Insert CSV data into PostgreSQL')
    parser.add_argument('--csv', required=True, help='CSV filename')
    parser.add_argument('--dbname', required=True, help='Database name')
    parser.add_argument('--user', required=True, help='Username')
    parser.add_argument('--password', required=True, help='Password')
    parser.add_argument('--host', required=True, help='Host')
    parser.add_argument('--port', required=True, help='Port')
    parser.add_argument('--table', required=True, help='Table name')
    args = parser.parse_args()

    db_params = {
        'dbname': args.dbname,
        'user': args.user,
        'password': args.password,
        'host': args.host,
        'port': args.port
    }

    insert_csv_data(args.csv, db_params, args.table)
