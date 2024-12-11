FROM hasura/graphql-engine:v2.41.0-beta.1.cli-migrations-v3

COPY . /hasura-app
RUN chmod +x /hasura-app/migrate.sh

WORKDIR /hasura-app
ENTRYPOINT [ "/hasura-app/migrate.sh" ]