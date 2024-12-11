import os
import psycopg2
import psycopg2.extras
from pathlib import Path
from datetime import datetime

# Environment Variables
PGSTRING = os.getenv("PGSTRING")
TARGET = os.getenv("TARGET", "default")  # Default to "default"

if not PGSTRING:
    raise ValueError("Environment variable PGSTRING is required")

# Paths
MIGRATION_DIR = Path(f"/src/data/migrations/{TARGET}")

# Database Connection
def get_db_connection():
    return psycopg2.connect(PGSTRING, cursor_factory=psycopg2.extras.DictCursor)

# Fetch Applied Migrations from the Database
def fetch_db_migrations(conn):
    db_migrations = {}
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id, name, created_at FROM pgmate.migrations WHERE target = %s ORDER BY id ASC",
                (TARGET,),
            )
            db_migrations = {
                f"{row['id']}_{row['name']}": row["created_at"] for row in cursor.fetchall()
            }
    except psycopg2.errors.UndefinedTable:
        print(f"Migrations table does not exist for target '{TARGET}'. Assuming no migrations are applied.")
        conn.rollback()
    return db_migrations

# Fetch Migrations from Disk
def fetch_disk_migrations():
    if not MIGRATION_DIR.exists() or not MIGRATION_DIR.is_dir():
        print(f"Migration directory does not exist for target '{TARGET}': {MIGRATION_DIR}")
        return set()

    disk_migrations = {
        migration.name for migration in MIGRATION_DIR.iterdir() if migration.is_dir()
    }
    return disk_migrations

# Compare and Generate Status
def generate_migration_status(disk_migrations, db_migrations):
    all_migrations = sorted(disk_migrations.union(db_migrations.keys()))
    status = []
    for migration in all_migrations:
        on_disk = "yes" if migration in disk_migrations else "no"
        in_pg = "yes" if migration in db_migrations else "no"
        applied_at = (
            db_migrations[migration].strftime("%Y-%m-%d %H:%M:%S")
            if migration in db_migrations
            else "-"
        )
        migration_id, migration_name = migration.split("_", 1)
        status.append({
            "id": migration_id,
            "name": migration_name,
            "disk": on_disk,
            "pg": in_pg,
            "applied_at": applied_at,
        })
    return status

# Print Status in Tabular Format
def print_status(status):
    print(f"{'ID':<5} | {'NAME':<20} | {'DISK':<5} | {'DB':<5} | {'APPLIED AT':<20}")
    print("-" * 65)
    for row in status:
        print(f"{row['id']:<5} | {row['name']:<20} | {row['disk']:<5} | {row['pg']:<5} | {row['applied_at']:<20}")

# Main Execution
def main():
    with get_db_connection() as conn:
        db_migrations = fetch_db_migrations(conn)

    disk_migrations = fetch_disk_migrations()

    status = generate_migration_status(disk_migrations, db_migrations)
    print_status(status)

if __name__ == "__main__":
    main()