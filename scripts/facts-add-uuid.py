import json
import uuid

def add_missing_uuids_to_json(input_file, output_file):
    """
    Reads a JSON file, adds missing UUIDs to each item, and saves the updated JSON to a new file.

    Args:
        input_file (str): Path to the input JSON file.
        output_file (str): Path to save the updated JSON file.
    """
    try:
        # Read data from the input file
        with open(input_file, 'r') as file:
            data = json.load(file)

        updated_data = []

        for item in data:
            # Add a UUID only if it is missing
            if "uuid" not in item or not item["uuid"]:
                item["uuid"] = str(uuid.uuid4())
            updated_data.append(item)

        # Save the updated data to the output file
        with open(output_file, 'w') as file:
            json.dump(updated_data, file, indent=2)

        print(f"Updated data with missing UUIDs added saved to {output_file}")

    except Exception as e:
        print(f"An error occurred: {e}")

# Usage example
input_file = '/src/api/contents/facts.json'  # Path to your input JSON file
output_file = '/src/api/contents/facts.json'  # Path to save the updated JSON file
add_missing_uuids_to_json(input_file, output_file)
