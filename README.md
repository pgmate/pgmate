# PGMate

A battery-charged GUI for Postgres databases.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/pgmate/demo)

Or check out our [demo project](https://github.com/pgmate/demo) 🔗

Or just run it on your Docker-enabled computer (Mac and Linux):

```bash
curl -sL https://gist.github.com/marcopeg/27bcf40b765de16e8a0193b0d3657673/raw/pgmate.sh | bash -s -- run
```

## Development Boot

```bash
# Starts backend on Docker & frontend on local Node
make boot

# Starts the backend only
make start
make init

# Starts the frontend only
make app

# Connects to the backend logs
make logs.api

# Kill the project
make down
```

## Production Run

You can test the production build locally:

```bash
make prod
```

> Kill the development project before you do this.

## PGMate State & Migrations

PGMate needs a default Postgres db connection string (env: `PGSTRING`) and uses is to store its state.

This state is first created at boot time by applying a _migration project_ (`/data/migrations/default`).

During development you may need to mess with the migrations to experiment different approaches to tough problems. Here are a few useful commands:

```bash
make migrate
make migrate.up
make migrate.down
make migrate.clear
make migrate.rebuild
```

Each command can be used with different migration source using the `conn=foobar` variable:

```bash
# Migrate from: "/data/migrations/foobar"
make migrate conn=foobar
```
