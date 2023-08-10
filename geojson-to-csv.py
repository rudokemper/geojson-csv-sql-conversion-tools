import argparse
import json
import csv
import random
import string

def generate_random_hash(length):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

def preprocess_column_name(column_name):
    # Replace hyphens and dollar signs with underscores
    return column_name.replace('-', '_').replace('$', '_')

def flatten_dict(data, prefix):
    flattened = {}
    for key, value in data.items():
        flattened[f"{prefix}__{key}"] = value
    return flattened

def main(input_filename, output_filename):
    with open(input_filename, 'r') as geojson_file:
        data = json.load(geojson_file)

    features = data['features']

    geometry_columns = set()
    properties_columns = set()

    for feature in features:
        geometry_columns.update(flatten_dict(feature['geometry'], 'g').keys())
        properties_columns.update(flatten_dict(feature['properties'], 'p').keys())

    with open(output_filename, 'w', newline='') as csv_file:
        csv_writer = csv.writer(csv_file)
        header = ['id'] + sorted(geometry_columns) + sorted(properties_columns)
        csv_writer.writerow([preprocess_column_name(col) for col in header])  # Preprocess header names

        for feature in features:
            if 'id' in feature:
                feature_id = feature['id']
            else:
                feature_id = generate_random_hash(16)
            
            geometry_fields = flatten_dict(feature['geometry'], 'g')
            properties_fields = flatten_dict(feature['properties'], 'p')
            
            row = [feature_id] + [geometry_fields.get(col, '') for col in sorted(geometry_columns)] + [properties_fields.get(col, '') for col in sorted(properties_columns)]
            csv_writer.writerow(row)

    print(f"CSV file '{output_filename}' has been successfully generated!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Convert GeoJSON to CSV')
    parser.add_argument('--input', required=True, help='Input GeoJSON filename')
    parser.add_argument('--output', required=True, help='Output CSV filename')
    args = parser.parse_args()

    input_filename = args.input
    output_filename = args.output

    main(input_filename, output_filename)
