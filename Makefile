#
# Configuration & Defaults
#

endpoint?=http://localhost:8080
passwd?=hasura
project?=data
conn?=default
db=postgres
schema?=public
from?=default
steps?=1
name?=new-migration
q?=select now();

# List all the {schema}.{table} to export/import using the "seed.export" and "seed.restore" commands
export_tables?=public.access_tokens,public.users,public.users_profile,metrics.logs,metrics.values,metrics.history,audit_trail.logs

# List migrations that you want to ignore from the "ai.schema" command
ignore_migrations?=1010_fetchq-schema,1011_fetchq-init,1012_fetchq-tasks

# Project Version
version?=alpha-0.0.1
help:
	@clear
	@echo ""
	@echo "---------------------"
	@echo "PGMate"
	@echo "Version: ${version}"
	@echo "---------------------"
	@echo ""
	@echo "Backend Commands:"
	@echo " 1) make boot ................. Starts the services & initializes the project"
	@echo " 2) make down ................. Stops the services and cleans up the local state"
	@echo " 3) make logs ................. Connects to the docker compose logs"
	@echo "                                and initializes the project"
	@echo ""
	@echo "Frontend Commands:"
	@echo " 4) make app .................. Starts the frontend on local NodeJS"
	@echo " 5) make react.reset .......... Reinstalls dependencies and runs it again"
	@echo ""
	@echo "State Management:               (depends on hasura-cli)"
	@echo " 6) make init ................. Applies the local state"
	@echo " 7) make clear ................ Removes all the application's state"
	@echo "    make meta ................. Applies Hasura metadata"
	@echo "    make meta.export .......... Exports metadata from Hasura"
	@echo "    make seed ................. Applies a seed file"
	@echo ""
	@echo "Migrations:                      (depends on hasura-cli)"
	@echo " 8) make migrate.status ........ Displays the current migration status"
	@echo "    make migrate ............... Applies the local state"
	@echo "    make migrate.clear ......... Reverts all migrations"
	@echo "    make migrate.up steps=1 .... Apply N migrations"
	@echo "    make migrate.down steps=1 .. Revert N migrations"
	@echo "    make migrate.redo .......... Redo the last migration"
	@echo ""
	@echo "    General Utilities"
	@echo "-----------------------------"
	@echo "00) make reset ................ Cleans & reboots the Project"
	@echo ""


# Work in progress, auto-generates commands based on relative comments
help-auto:
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Available Commands:"
	@grep -E '^[a-zA-Z0-9_.-]+:([^=]|$$).*?##' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = "[:#]{2}"} /^[a-zA-Z0-9_.-]+:[^$$(]/ {printf "  %-25s %s\n", $$1, $$2}'
	@echo ""
	@echo "For more information, check the comments in the Makefile."


# Whatever can be checked before starting the project
_check_boot:
	@if [ ! -f .env ]; then echo "\n\n====== WARNING ======\nLocal '.env' file not found;\nPlease create a '.env' file using the template from '.env.example'\n\n\n"; fi

# Waiting for services to come to life
_check_healthz:
	@until curl -s http://localhost:8080/healthz > /dev/null; do sleep 1; done


start: ## Start all the services binding ports on your machine
	@$(MAKE) -s -f Makefile _check_boot
	@echo "Starting the Project on Docker..."
	@docker compose up -d
	@$(MAKE) -s -f Makefile _check_healthz

stop:
	@echo "Stopping the Project..."
	@docker compose down

down:
	@echo "Destroying the Project..."
	@docker compose down -v

# Applies any initial state to the project
# (migrations, configurations, ...)
# NOTE: this command is idempotent
_init:
	@$(MAKE) -s -f Makefile _migrate
	@$(MAKE) -s -f Makefile _seed
	@$(MAKE) -s -f Makefile _query.run
init:
	@clear
	@echo "\n# Initializing Hasura State from:\n> conn=$(conn) seed=$(from).sql\n"
	@$(MAKE) -s -f Makefile _init

# Removes all the application's state
# think twice before running this, but run this as often as possible
# 🔥 like every morning or in between branch switching 🔥
_clear:
	@$(MAKE) -s -f Makefile migrate.clear
clear:
	@clear
	@echo "\n# Resetting App State from:\n> project=$(project); conn=$(conn) seed=$(from).sql\n"
	@$(MAKE) -s -f Makefile _clear

# Forces a rebuild of any artifact
build:
	@echo "Pulling Docker images..."
	@docker compose pull
	@echo "Building Docker images..."
	@docker compose build
rebuild:
	@echo "Pulling Docker images..."
	@docker compose pull
	@echo "Building Docker images..."
	@docker compose build --no-cache

# Aliases
restart: stop start
reset: down rebuild boot
boot: start init app
reboot: down boot
reinit: clear init


#
# Logging
#
logs.all:
	@docker compose logs -f

logs.api:
	@docker compose logs -f api

logs: logs.all


#
# Frontend Tasks
#
app.install:
	@if [ ! -d ./app/node_modules ]; then \
		echo "Installing node_modules..." ; \
		(cd app && npm install) ; \
	fi ;

app.start:
	@echo "Starting the Frontend App on local NodeJS..." ;
	(cd app && npm run dev) ;

app.clean:
	@echo "Cleaning up frontend dependencies..."
	@rm -rf ./app/package-lock.json
	@rm -rf ./app/node_modules

app.reset: app.clean app
app: app.install app.start



#
# Local Production Configuration
#

prod.build:
	docker compose -f docker-compose.prod.yml build

prod.rebuild:
	docker compose -f docker-compose.prod.yml build --no-cache

prod.start:
	docker compose -f docker-compose.prod.yml up -d
	@$(MAKE) -s -f Makefile _check_healthz

prod.down:
	docker compose -f docker-compose.prod.yml down -v

prod.build.backend:
	docker build --no-cache -t pgmate-backend -f ./Dockerfile.backend .

prod.build.frontend:
	docker compose -f docker-compose.frontend.yml build --no-cache

prod.start.frontend:
	docker compose -f docker-compose.frontend.yml build --no-cache
	docker compose -f docker-compose.frontend.yml up -d
	@$(MAKE) -s -f Makefile _check_healthz

prod: prod.rebuild prod.start

#
# Publishing to Docker Hub
# NOTE: it uses the version variable
#
# Build from an M2 Mac:
# https://marcopeg.com/ditching-docker-desktop/
#
publish.build:
	@docker buildx build --platform linux/amd64,linux/arm64 \
		--build-arg NODE_ENV=production \
		--build-arg VITE_API_PREFIX="/" \
		-t pgmate/pgmate:latest \
		-t pgmate/pgmate:$(version) \
		--push \
		.
publish.build.mac:
	@docker build \
		--build-arg NODE_ENV=production \
		--build-arg VITE_API_PREFIX="/" \
		-t pgmate/pgmate:latest \
		--load .
	@docker tag pgmate/pgmate:latest pgmate/pgmate:$(version)
publish.push:
	@docker push pgmate/pgmate:latest
	@docker push pgmate/pgmate:$(version)
publish.test:
	@if [ ! "$$(docker ps -q -f name=pgmate-test-db)" ]; then \
		if [ "$$(docker ps -aq -f name=pgmate-test-db)" ]; then \
			docker start pgmate-test-db; \
		else \
			docker run -d -p 5432:5432 --name pgmate-test-db -e POSTGRES_PASSWORD=postgres postgres:16; \
		fi; \
	else \
		echo "Postgres container 'pgmate-test-db' is already running."; \
	fi
	docker run --rm \
		-e PGMATE_ADMIN_SECRET=pgmate \
		-e PGSTRING=postgres://postgres:postgres@host.docker.internal:5432/postgres \
		-p 8080:8080 \
		pgmate/pgmate:$(version)
publish.remote:
	curl -sL https://gist.github.com/marcopeg/27bcf40b765de16e8a0193b0d3657673/raw/pgmate.sh | bash -s -- run
publish: publish.build publish.push




#
# Full Production Configuration
#

full.build:
	docker compose -f docker-compose.full.yml build

full.rebuild:
	docker compose -f docker-compose.full.yml build --no-cache

full.start:
	docker compose -f docker-compose.full.yml up -d
	@$(MAKE) -s -f Makefile _check_healthz

full.down:
	docker compose -f docker-compose.full.yml down -v

full: full.rebuild full.start



#
# Migrations Utilities
#

_migrate:
	@$(MAKE) -s -f Makefile py from=migrate-up env="TARGET=$(conn)"
migrate.apply:
	@clear
	@echo "\n# Running migrations from:\n> $(project)/migrations/$(conn)/*\n"
	@$(MAKE) -s -f Makefile _migrate

_migrate.status:
	@$(MAKE) -s -f Makefile py from=migrate-status env="TARGET=$(conn)"
migrate.status:
	@clear
	@echo "\n# Checking migrations status on:\n> project=$(project); conn=$(conn)\n"
	@$(MAKE) -s -f Makefile _migrate.status

migrate.up:
	@clear
	@echo "\n# Migrate $(steps) UP from:\n> $(project)/migrations/$(conn)/*\n"
	@$(MAKE) -s -f Makefile py from=migrate-up env="STEPS=$(steps) TARGET=$(conn)"

migrate.down:
	@clear
	@echo "\n# Migrate $(steps) DOWN from:\n> $(project)/migrations/$(conn)/*\n"
	@$(MAKE) -s -f Makefile py from=migrate-down env="STEPS=$(steps) TARGET=$(conn)"

migrate.clear:
	@clear
	@echo "\n# Destroy migrations on:\n> project=$(project); conn=$(conn)\n"
	@$(MAKE) -s -f Makefile py from=migrate-down env="STEPS=0 TARGET=$(conn)"

migrate.redo: 
	@clear
	@echo "\n# Replaying last $(steps) migrations on:\n> project=$(project); conn=$(conn)\n"
	@$(MAKE) -s -f Makefile py from=migrate-down env="STEPS=$(steps) TARGET=$(conn)"
	@$(MAKE) -s -f Makefile py from=migrate-up env="STEPS=$(steps) TARGET=$(conn)"

migrate.rebuild: 
	@clear
	@echo "\n# Rebuilding migrations on:\n> project=$(project); conn=$(conn)\n"
	@$(MAKE) -s -f Makefile migrate.clear
	@$(MAKE) -s -f Makefile _migrate

migrate: migrate.apply


#
# Hasura seeding utilities
# 2>&1 | sed 's/\x1b\[[0-9;]*m//g' > $(from).errors.txt
_seed:
	@docker compose $(DOCKER_COMPOSE_CHAIN) exec -T postgres psql -U postgres $(db) < $(project)/seeds/$(conn)/$(from).sql
seed.apply:
	@echo "Seeding from: $(project)/$(conn)/$(from).sql"
	@$(MAKE) -s -f Makefile _seed

# Applies a seed script and dumps the output into a txt file stored beside the seed itself
seedbug:
	@hasura seed apply \
		--endpoint $(endpoint) \
		--admin-secret $(passwd) \
		--project $(project) \
		--database-name $(conn) \
		--file $(from).sql \
		2>&1 | sed 's/\x1b\[[0-9;]*m//g' > hasura-app/seeds/$(conn)/$(from).info.txt

seed.create:
	@schema_and_table=$(from); \
	if [[ "$$schema_and_table" == *.* ]]; then \
	  schema=$$(echo $$schema_and_table | cut -d'.' -f1); \
	  table=$$(echo $$schema_and_table | cut -d'.' -f2); \
	else \
	  schema="public"; \
	  table=$$schema_and_table; \
	fi; \
	if [ -n "$(id)" ]; then \
	  file_id="$(id)."; \
	else \
	  file_id=""; \
	fi; \
	output_file=$(project)/seeds/$(conn)/$${file_id}$$schema.$$table.sql; \
	echo "Dumping table $$schema.$$table into $$output_file..."; \
	mkdir -p $(project)/seeds/$(conn); \
	docker compose $(DOCKER_COMPOSE_CHAIN) exec -T postgres pg_dump -U postgres -t $$schema.$$table --data-only --inserts --no-owner --disable-triggers $(db) | \
	grep -v -e "^SET " -e "^SELECT pg_catalog.set_config" -e "^RESET " -e "^ALTER " -e "^--" | \
	awk '!NF{if (++n <= 1) print; next} {n=0; print}' > "$$output_file"; \
	echo "BEGIN;\nTRUNCATE TABLE $$schema.$$table CASCADE;" | cat - "$$output_file" > "$$output_file.tmp" && mv "$$output_file.tmp" "$$output_file"; \
	echo "\nEND;" >> "$$output_file";


seed.export:
	@resolved_id=$(id); \
	if [ -z "$(id)" ]; then \
	  resolved_id="export"; \
	elif [ "$(id)" = "now" ]; then \
	  resolved_id=$$(date +"%y%m%d%H%M"); \
	fi; \
	echo "Using id: $$resolved_id"; \
	tables=$(from); \
	if [ "$(from)" = "default" ]; then \
	  tables=$(export_tables); \
	fi; \
	echo "Exporting tables: $$tables"; \
	for table in $$(echo $$tables | tr ',' ' '); do \
	  echo "Exporting table $$table with id $$resolved_id..."; \
	  $(MAKE) seed.create from=$$table id=$$resolved_id; \
	done

seed.restore:
	@resolved_id=$(id); \
	if [ -z "$(id)" ]; then \
	  resolved_id="export"; \
	fi; \
	echo "Using id: $$resolved_id"; \
	tables=$(from); \
	if [ "$(from)" = "default" ]; then \
	  tables=$(export_tables); \
	fi; \
	echo "Restoring tables: $$tables"; \
	for table in $$(echo $$tables | tr ',' ' '); do \
	  echo "Restoring table $$table with id $$resolved_id..."; \
	  $(MAKE) seed from=$$resolved_id.$$table; \
	done

seed: seed.apply


#
# Postgres Utilities
#
psql:
	@clear
	@echo "\n# Attaching SQL Client to:\n> db=$(db)\n"
	@docker compose $(DOCKER_COMPOSE_CHAIN) exec postgres psql -U postgres $(db)
_query.run:
	@docker compose $(DOCKER_COMPOSE_CHAIN) exec -T postgres psql -U postgres $(db) < $(project)/sql/$(conn)/$(from).sql
query.run:
	@clear
	@echo "\n# Running a SQL script to DB \"$(db)\":\n>$(project)/sql/$(conn)/$(from).sql\n"
	@$(MAKE) -s -f Makefile _query.run

query: query.run

# https://www.postgresql.org/docs/current/pgbench.html
numClients?=10
numThreads?=10
numTransactions?=10
bench.run:
	@clear
	@echo "\n# Running PgBench to:\n> db=$(db); query=$(project)/sql/$(conn).sql\n"
	@docker run --rm \
		-e $(env) \
		-e PGPASSWORD=postgres \
		-v $(CURDIR)/$(project)/sql/$(conn):/sql:ro \
		--network=pgmate \
		postgres:16 \
		pgbench -h postgres -p 5432 -U postgres -d $(db) \
			-c $(numClients) -j $(numThreads) -t $(numTransactions) \
			-f /sql/$(from).sql
bench: bench.run


#
# SQL Testing Utilities
#
case?=*
pgtap.reset:
	@docker exec -i hasura-pg psql -U postgres < $(project)/tests/reset-test-db.sql
	
pgtap.schema: $(CURDIR)/$(project)/migrations/$(conn)/*
	@for file in $(shell find $(CURDIR)/$(project)/migrations/$(conn) -name 'up.sql' | sort ) ; do \
		echo "---> Apply:" $${file}; \
		docker exec -i hasura-pg psql -U postgres test-db < $${file};	\
	done

pgtap.build:
	docker build --no-cache -t pgmate-pgtap ./.docker-images/pg-tap

pgtap.run:
	@docker images -q pgmate-pgtap | grep -q . || docker build -t pgmate-pgtap ./.docker-images/pg-tap
	clear
	@echo "Running Unit Tests ..."
	@docker run --rm \
		--name pgtap \
		--network=pgmate \
		--link hasura-pg:db \
		-v $(CURDIR)/$(project)/tests/$(conn)/:/tests \
		pgmate-pgtap \
    	-h db -u postgres -w postgres -d test-db -t '/tests/$(case).sql'

pgtap: pgtap.reset pgtap.schema pgtap.run


#
# Python Utilities
# Run a script from the project's scripts folder
#
env?="F=F"
py.run:
	@docker images -q pgmate-py-runner | grep -q . || docker build -t pgmate-py-runner ./.docker-images/python
	@docker run --rm \
		--env-file .env \
		$(foreach var,$(shell echo $(env)), -e $(var)) \
		-e HASURA_GRAPHQL_ENDPOINT=http://hasura-engine:8080/v1/graphql \
		-e HASURA_GRAPHQL_ADMIN_SECRET=$(passwd) \
		-e PGSTRING=postgres://postgres:postgres@postgres:5432/postgres \
		-v $(CURDIR)/scripts:/scripts \
		-v $(CURDIR):/src \
		--network=pgmate \
		pgmate-py-runner \
		sh -c "python /scripts/$(from).py"

py.build:
	docker build -t pgmate-py-runner --load ./.docker-images/python
py.rebuild:
	docker build --no-cache -t pgmate-py-runner ./.docker-images/python
py: py.run


#
# AI PROMPT GENERATION
# Those commands aim to generate a prompt
#
ai.schema: $(CURDIR)/$(project)/migrations/$(conn)/*
	@output_file=$(CURDIR)/prompts/$(if $(filter-out new-migration,$(name)),$(name),prompt-$(shell date +%Y%m%d%H%M%S)).txt; \
	rm -f $$output_file; \
	echo "Given the following Postgres schema, perform the task as described below. Provide a detailed step by step explanation of your reasoning and complete the task with a code block that I can copy/paste and execute in my project.\n" >> $$output_file; \
	echo "========================\nTASK\n========================\n\n" >> $$output_file; \
	echo "========================\nPOSTGRES SCHEMA\n========================\n" >> $$output_file; \
	skip_list=$(if $(skip),$(skip),$(ignore_migrations)); \
	for file in $(shell find $(CURDIR)/$(project)/migrations/$(conn) -name 'up.sql' | sort); do \
		skip=0; \
		for folder in $$(echo $$skip_list | tr ',' ' '); do \
			if echo "$$file" | grep -q "/$$folder/"; then skip=1; break; fi; \
		done; \
		if [ $$skip -eq 0 ]; then \
			echo "-- Migration File: $$file" >> $$output_file; \
			cat $$file >> $$output_file; \
			echo "\n" >> $$output_file; \
		fi; \
	done; \
	echo "Prompt created at $$output_file"

ai.py: $(CURDIR)/$(project)/migrations/$(conn)/*
	@output_file=$(CURDIR)/prompts/$(if $(filter-out new-migration,$(name)),$(name),prompt-$(shell date +%Y%m%d%H%M%S)).txt; \
	rm -f $$output_file; \
	echo "You are an expert Python programmer." >> $$output_file; \
	echo "Your job is to create a Python script that resolves the TASK detailed below." >> $$output_file; \
	echo "The generated script will be executed in a Docker container as described in the PYTHON IMAGE section." >> $$output_file; \
	echo "If new dependencies are necessary, provide a DOCKERFILE section in which you explain how to modify the Dockerfile." >> $$output_file; \
	echo "Such container can connect to the Postgres db using the env var PGSTRING, or a fallback value provided in the DB CONNECTION section." >> $$output_file; \
	echo "Try to solve any data-related problem by analyzing and understanding the provided migration code from the POSTGRES SCHEMA section." >> $$output_file; \
	echo "First analyze the task. If necessary, ask questions before attempting to write a solution." >> $$output_file; \
	echo "When you are ready to write the script, provide a step-by-step reasoning of the choices you make, and document this as comments into the script." >> $$output_file; \
	echo "The script should be provided as a ready-to-use code snippet that should be copied into a file and ed executed.\n" >> $$output_file; \
	echo "========================\nTASK\n========================\n\n" >> $$output_file; \
	if [ -f $(CURDIR)/.docker-images/python/Dockerfile ]; then \
		echo "========================\nPYTHON IMAGE\n========================\n" >> $$output_file; \
		cat $(CURDIR)/.docker-images/python/Dockerfile >> $$output_file; \
		echo "\n" >> $$output_file; \
	fi; \
	echo "========================\nDB CONNECTION\n========================\n" >> $$output_file; \
	echo "The database is available with a default connection string PGSTRING from the environment.\n" >> $$output_file; \
	echo "PGSTRING: $${PGSTRING:-postgres://postgres:postgres@localhost:5432/postgres}\n" >> $$output_file; \
	echo "========================\nPOSTGRES SCHEMA\n========================\n" >> $$output_file; \
	skip_list=$(if $(skip),$(skip),$(ignore_migrations)); \
	for file in $(shell find $(CURDIR)/$(project)/migrations/$(conn) -name 'up.sql' | sort); do \
		skip=0; \
		for folder in $$(echo $$skip_list | tr ',' ' '); do \
			if echo "$$file" | grep -q "/$$folder/"; then skip=1; break; fi; \
		done; \
		if [ $$skip -eq 0 ]; then \
			echo "-- Migration File: $$file" >> $$output_file; \
			cat $$file >> $$output_file; \
			echo "\n" >> $$output_file; \
		fi; \
	done; \
	echo "Prompt created at $$output_file"

ai: ai.schema



#
# Numeric API
#

00: reset
h: help
1: start
2: down
3: logs
4: react
5: react.reset
i: init
6: init
7: clear
8: migrate.status