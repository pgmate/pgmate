#!/bin/bash

# Default values
POSTGRES_PORT=13378
PGMATE_PORT=1337
VERSION="latest"
SECRET="pgmate"
PGSTRING="postgres://postgres:postgres@172.17.0.1:${POSTGRES_PORT}/postgres"

# Function to display usage
usage() {
  echo "Usage: $0 [options] [command]"
  echo
  echo "Commands:"
  echo "  run        Run the pgmate and postgres containers"
  echo "  stop       Stop and remove the pgmate and postgres containers"
  echo
  echo "Options:"
  echo "  --version=<version>        Specify the pgmate version (default: $VERSION)"
  echo "  --secret=<secret>          Specify the admin secret (default: $SECRET)"
  echo "  --pgstring=<pgstring>      Specify the PostgreSQL connection string (default to local postgres)"
  echo "  --pgport=<port>            Specify the PostgreSQL port (default: $POSTGRES_PORT)"
  echo "  --port=<port>              Specify the pgmate port (default: $PGMATE_PORT)"
  echo
  exit 1
}

# Parse command-line arguments
for arg in "$@"; do
  case $arg in
    --version=*)
      VERSION="${arg#*=}"
      shift
      ;;
    --pgstring=*)
      PGSTRING="${arg#*=}"
      shift
      ;;
    --secret=*)
      SECRET="${arg#*=}"
      shift
      ;;
    --pgport=*)
      POSTGRES_PORT="${arg#*=}"
      PGSTRING="postgres://postgres:postgres@host.docker.internal:${POSTGRES_PORT}/postgres"
      shift
      ;;
    --port=*)
      PGMATE_PORT="${arg#*=}"
      shift
      ;;
    run|stop)
      COMMAND=$arg
      shift
      ;;
    *)
      usage
      ;;
  esac
done

# Ensure a command is provided
if [[ -z "$COMMAND" ]]; then
  usage
fi

# Wait for PostgreSQL to be ready
wait_for_postgres() {
  echo "Waiting for PostgreSQL to be ready..."
  local retries=30
  local count=0

  while ! docker exec pgmate-test-db pg_isready -U postgres > /dev/null 2>&1; do
    sleep 1
    count=$((count + 1))
    if [[ $count -ge $retries ]]; then
      echo "PostgreSQL is not ready after $retries seconds. Exiting."
      exit 1
    fi
  done

  echo "PostgreSQL is ready!"
}

# Run containers
run_containers() {
  echo "Running PostgreSQL and pgmate containers..."
  
  # Start PostgreSQL container idempotently
  if [ ! "$(docker ps -q -f name=pgmate-test-db)" ]; then
    if [ "$(docker ps -aq -f name=pgmate-test-db)" ]; then
      echo "Starting existing postgres container..."
      docker start pgmate-test-db
    else
      echo "Creating and starting postgres container..."
      docker run -d -p ${POSTGRES_PORT}:5432 --name pgmate-test-db -e POSTGRES_PASSWORD=postgres postgres:16
    fi
  else
    echo "Postgres container 'pgmate-test-db' is already running."
  fi

  # Wait for PostgreSQL to be ready
  wait_for_postgres

  # Run pgmate container
  echo "Starting pgmate container with version: $VERSION"
  docker run \
    --name pgmate-gui \
    -e PGMATE_ADMIN_SECRET="$SECRET" \
    -e PGSTRING="$PGSTRING" \
    -p ${PGMATE_PORT}:8080 \
    pgmate/pgmate:"$VERSION"
}

# Stop and remove containers
remove_containers() {
  echo "Stopping and removing containers..."
  docker rm -f pgmate-test-db || echo "No postgres container to remove."
  docker rm -f pgmate-gui || echo "No pgmate container to remove."
}

# Handle commands
case $COMMAND in
  run)
    run_containers
    ;;
  stop)
    remove_containers
    ;;
  *)
    usage
    ;;
esac