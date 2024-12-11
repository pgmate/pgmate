import json
import os
import psycopg2
from psycopg2.extras import execute_values

# File path
FILE_PATH = "/src/api/contents/facts.json"

def upsert_facts(facts, connection_string):
    """Upsert facts into the pgmate.facts table."""
    query = """
    INSERT INTO pgmate.facts (uuid, title, description, emoticon, publish_date, tags, relevant_links, updated_at)
    VALUES %s
    ON CONFLICT (uuid) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        emoticon = EXCLUDED.emoticon,
        publish_date = EXCLUDED.publish_date,
        tags = EXCLUDED.tags,
        relevant_links = EXCLUDED.relevant_links,
        updated_at = EXCLUDED.updated_at;
    """

    # Convert facts into tuples for batch insertion
    data = [
        (
            fact["uuid"],
            fact["title"],
            fact["description"],
            fact.get("emoticon"),
            fact.get("publish_date"),
            fact.get("tags"),
            fact.get("relevant_links"),
            "now()"
        )
        for fact in facts
    ]

    # Connect to the database and execute the query
    try:
        conn = psycopg2.connect(connection_string)
        with conn.cursor() as cursor:
            execute_values(cursor, query, data)
        conn.commit()
        print("Upsert completed successfully.")
    except psycopg2.Error as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

def main():
    # Load connection string from environment
    connection_string = os.getenv("PGSTRING")
    if not connection_string:
        print("Error: PGSTRING environment variable is not set.")
        return

    # Load JSON data
    try:
        with open(FILE_PATH, "r") as file:
            facts = json.load(file)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading JSON: {e}")
        return

    # Validate JSON structure
    if not isinstance(facts, list):
        print("Invalid JSON format: Expected an array of facts.")
        return

    # Perform the upsert
    upsert_facts(facts, connection_string)

if __name__ == "__main__":
    main()