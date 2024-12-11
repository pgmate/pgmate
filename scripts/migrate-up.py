import os
import psycopg2
import psycopg2.extras
from pathlib import Path

# Environment Variables
PGSTRING = os.getenv("PGSTRING")
TARGET = os.getenv("TARGET", "default")  # Default to "default"
STEPS = int(os.getenv("STEPS", 0))  # Default to 0 (apply all migrations)

if not PGSTRING:
    raise ValueError("Environment variable PGSTRING is required")

# Paths
MIGRATION_DIR = Path(f"/src/data/migrations/{TARGET}")

# Database Connection
def get_db_connection():
    return psycopg2.connect(PGSTRING, cursor_factory=psycopg2.extras.DictCursor)

# Fetch Applied Migrations
def fetch_applied_migrations(conn):
    applied_migrations = set()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id FROM pgmate.migrations WHERE target = %s",
                (TARGET,),
            )
            applied_migrations = {row["id"] for row in cursor.fetchall()}  # Already integers
    except psycopg2.errors.UndefinedTable:
        print(f"Migrations table does not exist for target '{TARGET}'. Assuming no migrations have been applied.")
        conn.rollback()
    return applied_migrations

# Apply Migrations
def apply_migrations(conn, steps):
    # Ensure migration directory exists
    if not MIGRATION_DIR.exists() or not MIGRATION_DIR.is_dir():
        raise FileNotFoundError(f"Migration directory not found: {MIGRATION_DIR}")

    # Read and sort migration directories by the numeric part of the name
    migration_dirs = sorted(
        MIGRATION_DIR.iterdir(),
        key=lambda d: int(d.name.split("_")[0]) if d.is_dir() else float("inf"),
    )

    # Fetch applied migrations
    applied_migrations = fetch_applied_migrations(conn)

    migrations_applied = 0
    for migration_dir in migration_dirs:
        if not migration_dir.is_dir():
            continue

        migration_id, *migration_name_parts = migration_dir.name.split("_")
        migration_id = int(migration_id.strip())  # Convert to integer for comparison
        migration_name = "_".join(migration_name_parts)

        # Skip already applied migrations
        if migration_id in applied_migrations:
            print(f"Skipping migration: {migration_dir.name}")
            continue

        # Path to the `up.sql` file
        up_sql_path = migration_dir / "up.sql"
        if not up_sql_path.exists():
            print(f"No up.sql found in migration directory: {migration_dir.name}")
            continue

        # Apply migration
        print(f"Applying migration: {migration_dir.name}")
        try:
            with conn.cursor() as cursor:
                with open(up_sql_path, "r") as sql_file:
                    cursor.execute(sql_file.read())
                cursor.execute(
                    """
                    INSERT INTO pgmate.migrations (target, id, name, created_at)
                    VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
                    """,
                    (TARGET, migration_id, migration_name),
                )
            conn.commit()
            print(f"Migration {migration_dir.name} applied successfully")
        except Exception as e:
            conn.rollback()
            print(f"Error applying migration {migration_dir.name}: {e}")
            raise

        migrations_applied += 1

        # Stop if steps limit is reached
        if steps > 0 and migrations_applied >= steps:
            print(f"Applied {steps} migration(s), stopping as requested.")
            break

# Main Execution
def main():
    print(f"Starting migration process for target '{TARGET}'...")
    with get_db_connection() as conn:
        apply_migrations(conn, STEPS)
    print("Migration process completed.")

if __name__ == "__main__":
    main()