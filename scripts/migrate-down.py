import os
import psycopg2
import psycopg2.extras
from pathlib import Path

# Environment Variables
PGSTRING = os.getenv("PGSTRING")
TARGET = os.getenv("TARGET", "default")  # Default to "default"
STEPS = int(os.getenv("STEPS", 0))  # Default to 0 (rollback all migrations)

if not PGSTRING:
    raise ValueError("Environment variable PGSTRING is required")

# Paths
MIGRATION_DIR = Path(f"/src/data/migrations/{TARGET}")

# Database Connection
def get_db_connection():
    return psycopg2.connect(PGSTRING, cursor_factory=psycopg2.extras.DictCursor)

# Fetch Applied Migrations in Reverse Order
def fetch_applied_migrations(conn):
    applied_migrations = []
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id, name FROM pgmate.migrations WHERE target = %s ORDER BY id DESC",
                (TARGET,),
            )
            applied_migrations = [
                {"id": row["id"], "name": row["name"]} for row in cursor.fetchall()
            ]
    except psycopg2.errors.UndefinedTable:
        print(f"Migrations table does not exist for target '{TARGET}'. No migrations to rollback.")
        conn.rollback()
    return applied_migrations

# Rollback Migrations
def rollback_migrations(conn, steps):
    # Fetch applied migrations in reverse order
    applied_migrations = fetch_applied_migrations(conn)

    if not applied_migrations:
        print(f"No migrations to rollback for target '{TARGET}'.")
        return

    migrations_rolled_back = 0
    for migration in applied_migrations:
        migration_id = migration["id"]
        migration_name = migration["name"]
        migration_dir = MIGRATION_DIR / f"{migration_id}_{migration_name}"
        down_sql_path = migration_dir / "down.sql"

        # Ensure the `down.sql` file exists
        if not down_sql_path.exists():
            print(f"No down.sql found for migration: {migration_id}_{migration_name}")
            continue

        print(f"Rolling back migration: {migration_id}_{migration_name}")
        try:
            # Execute the rollback SQL script
            with conn.cursor() as cursor:
                with open(down_sql_path, "r") as sql_file:
                    cursor.execute(sql_file.read())
                conn.commit()  # Commit immediately after executing the down.sql
                print(f"Migration {migration_id}_{migration_name} rolled back successfully")

        except Exception as e:
            conn.rollback()
            print(f"Error rolling back migration {migration_id}_{migration_name}: {e}")
            raise

        # Attempt to delete the migration record
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "DELETE FROM pgmate.migrations WHERE target = %s AND id = %s",
                    (TARGET, migration_id),
                )
                conn.commit()  # Commit deletion separately
                print(f"Migration record {migration_id}_{migration_name} deleted successfully")
        except Exception as delete_error:
            conn.rollback()
            print(f"Error deleting migration record {migration_id}_{migration_name}: {delete_error}")
            # Continue without raising an exception

        migrations_rolled_back += 1

        # Stop if steps limit is reached
        if steps > 0 and migrations_rolled_back >= steps:
            print(f"Rolled back {steps} migration(s) for target '{TARGET}', stopping as requested.")
            break

# Main Execution
def main():
    print(f"Starting rollback process for target '{TARGET}'...")
    with get_db_connection() as conn:
        rollback_migrations(conn, STEPS)
    print(f"Rollback process for target '{TARGET}' completed.")

if __name__ == "__main__":
    main()