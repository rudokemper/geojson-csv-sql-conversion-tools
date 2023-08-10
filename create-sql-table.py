import argparse
import csv

def generate_create_table_sql(table_name, columns):
    sql_columns = ", ".join([f"{col} TEXT" for col in columns])
    return f"CREATE TABLE {table_name} (id TEXT PRIMARY KEY, {sql_columns});"

def read_csv_header(file_path):
    with open(file_path, 'r') as csv_file:
        csv_reader = csv.reader(csv_file)
        return next(csv_reader)

def convert_csv_to_sql(input_filename, table_name):
    csv_header = read_csv_header(input_filename)
    property_columns = [col for col in csv_header if col != 'id']

    create_table_sql = generate_create_table_sql(table_name, property_columns)

    print(create_table_sql)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Convert CSV to SQL schema')
    parser.add_argument('--input', required=True, help='Input CSV filename')
    parser.add_argument('--table', required=True, help='Output table name')
    args = parser.parse_args()

    input_filename = args.input
    table_name = args.table

    convert_csv_to_sql(input_filename, table_name)
