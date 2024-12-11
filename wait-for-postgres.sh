# wait-for-postgres.sh
#!/bin/bash
until pg_isready -h localhost -p 5432; do
    echo "Waiting for PostgreSQL to be ready..."
    sleep 2
done
echo "PostgreSQL is ready!"