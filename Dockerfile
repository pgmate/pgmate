#
# Base stage for building the React app
#
FROM node:21 AS builder-frontend

# Set working directory for the React app
WORKDIR /app

# Copy the monorepo files
COPY . .

# Navigate to the React app directory
WORKDIR /app/app

# Define build arguments
ARG NODE_ENV
ARG VITE_API_PREFIX

# Pass the build argument as an environment variable
ENV VITE_NODE_ENV=${NODE_ENV}
ENV VITE_API_PREFIX=${VITE_API_PREFIX}

# Install dependencies and build the React app
RUN npm install --production=false
RUN npm run build




#
# Base stage for building the NestJS app
#
FROM node:21 AS builder-backend

# Set working directory for the NestJS app
WORKDIR /api

# Copy the monorepo files
COPY . .

# Navigate to the NestJS app directory
WORKDIR /api/api

# Install dependencies and build the NestJS app
RUN npm install --production=false
RUN npm run build

# Re-install production dependencies
RUN rm -rf node_modules
RUN npm install --production=true


#
# Final production stage
#
FROM node:21 AS production
# FROM node:21-slim AS production

# Install PostgreSQL clients and contrib packages for all versions
# RUN apt-get update && apt-get install -y wget gnupg && \
#     wget -qO - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - && \
#     echo "deb http://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" > /etc/apt/sources.list.d/pgdg.list && \
#     apt-get update && apt-get install -y \
#         postgresql-client-9.6 postgresql-contrib-9.6 \
#         postgresql-client-10 postgresql-contrib-10 \
#         postgresql-client-11 postgresql-contrib-11 \
#         postgresql-client-12 postgresql-contrib-12 \
#         postgresql-client-13 postgresql-contrib-13 \
#         postgresql-client-14 postgresql-contrib-14 \
#         postgresql-client-15 postgresql-contrib-15 \
#         postgresql-client-16 postgresql-contrib-16 && \
#     # Create version-specific aliases for pgbench
#     ln -s /usr/lib/postgresql/9.6/bin/pgbench /usr/bin/pgbench-9.6 && \
#     ln -s /usr/lib/postgresql/10/bin/pgbench /usr/bin/pgbench-10 && \
#     ln -s /usr/lib/postgresql/11/bin/pgbench /usr/bin/pgbench-11 && \
#     ln -s /usr/lib/postgresql/12/bin/pgbench /usr/bin/pgbench-12 && \
#     ln -s /usr/lib/postgresql/13/bin/pgbench /usr/bin/pgbench-13 && \
#     ln -s /usr/lib/postgresql/14/bin/pgbench /usr/bin/pgbench-14 && \
#     ln -s /usr/lib/postgresql/15/bin/pgbench /usr/bin/pgbench-15 && \
#     ln -s /usr/lib/postgresql/16/bin/pgbench /usr/bin/pgbench-16 && \
#     # Create version-specific aliases for pg_dump
#     ln -s /usr/lib/postgresql/9.6/bin/pg_dump /usr/bin/pg_dump-9.6 && \
#     ln -s /usr/lib/postgresql/10/bin/pg_dump /usr/bin/pg_dump-10 && \
#     ln -s /usr/lib/postgresql/11/bin/pg_dump /usr/bin/pg_dump-11 && \
#     ln -s /usr/lib/postgresql/12/bin/pg_dump /usr/bin/pg_dump-12 && \
#     ln -s /usr/lib/postgresql/13/bin/pg_dump /usr/bin/pg_dump-13 && \
#     ln -s /usr/lib/postgresql/14/bin/pg_dump /usr/bin/pg_dump-14 && \
#     ln -s /usr/lib/postgresql/15/bin/pg_dump /usr/bin/pg_dump-15 && \
#     ln -s /usr/lib/postgresql/16/bin/pg_dump /usr/bin/pg_dump-16 &&


RUN apt-get update && apt-get install -y wget gnupg && \
    wget -qO - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - && \
    echo "deb http://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" > /etc/apt/sources.list.d/pgdg.list && \
    apt-get update && apt-get install -y \
        postgresql-client-9.6 postgresql-contrib-9.6 \
        postgresql-client-10 postgresql-contrib-10 \
        postgresql-client-11 postgresql-contrib-11 \
        postgresql-client-12 postgresql-contrib-12 \
        postgresql-client-13 postgresql-contrib-13 \
        postgresql-client-14 postgresql-contrib-14 \
        postgresql-client-15 postgresql-contrib-15 \
        postgresql-client-16 postgresql-contrib-16
RUN ln -s /usr/lib/postgresql/9.6/bin/pgbench /usr/bin/pgbench-9.6 && \
    ln -s /usr/lib/postgresql/10/bin/pgbench /usr/bin/pgbench-10 && \
    ln -s /usr/lib/postgresql/11/bin/pgbench /usr/bin/pgbench-11 && \
    ln -s /usr/lib/postgresql/12/bin/pgbench /usr/bin/pgbench-12 && \
    ln -s /usr/lib/postgresql/13/bin/pgbench /usr/bin/pgbench-13 && \
    ln -s /usr/lib/postgresql/14/bin/pgbench /usr/bin/pgbench-14 && \
    ln -s /usr/lib/postgresql/15/bin/pgbench /usr/bin/pgbench-15 && \
    ln -s /usr/lib/postgresql/16/bin/pgbench /usr/bin/pgbench-16
RUN ln -s /usr/lib/postgresql/9.6/bin/pg_dump /usr/bin/pg_dump-9.6 && \
    ln -s /usr/lib/postgresql/10/bin/pg_dump /usr/bin/pg_dump-10 && \
    ln -s /usr/lib/postgresql/11/bin/pg_dump /usr/bin/pg_dump-11 && \
    ln -s /usr/lib/postgresql/12/bin/pg_dump /usr/bin/pg_dump-12 && \
    ln -s /usr/lib/postgresql/13/bin/pg_dump /usr/bin/pg_dump-13 && \
    ln -s /usr/lib/postgresql/14/bin/pg_dump /usr/bin/pg_dump-14 && \
    ln -s /usr/lib/postgresql/15/bin/pg_dump /usr/bin/pg_dump-15 && \
    ln -s /usr/lib/postgresql/16/bin/pg_dump /usr/bin/pg_dump-16

# Install tini
RUN apt-get update && apt-get install -y tini && apt-get clean

# Clean up to reduce image size
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Set tini as the entrypoint
ENTRYPOINT ["/usr/bin/tini", "--"]

# Set working directory for the production container
WORKDIR /app

# Copy NestJS build files
COPY --from=builder-backend /api/api/dist ./dist
COPY --from=builder-backend /api/api/contents ./contents
COPY --from=builder-backend /api/api/node_modules ./node_modules
COPY --from=builder-backend /api/api/package.json ./

# Copy React build files into the NestJS public directory
COPY --from=builder-frontend /app/app/dist ./dist/public

# Copy the migrations directory
COPY --from=builder-backend /api/data/migrations ./migrations

# Expose the port that NestJS will run on
EXPOSE 8080

# Start the NestJS application
ENV NODE_ENV=production
CMD ["node", "dist/main"]