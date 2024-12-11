#!/bin/bash

function cli {
  if ! command -v hasura &> /dev/null
  then /bin/hasura-cli "$@"
  else hasura "$@"
  fi
}

__ENDPOINT=${HASURA_GRAPHQL_ENDPOINT:-"*"}
__SECRET=${HASURA_GRAPHQL_ADMIN_SECRET:-"*"}
__DATABASE=${HASURA_GRAPHQL_DATABASE:-"default"}
__SEED=${HASURA_GRAPHQL_SEED:-"default"}

if [[ "${HASURA_APPLY_MIGRATIONS}" == "true" ]]
then
  echo "Apply SQL migrations..."
  cli migrate apply \
    --admin-secret ${__SECRET} \
    --endpoint ${__ENDPOINT} \
    --database-name=${__DATABASE} \
    --skip-update-check || exit 1
else
    echo "Skipping migrations"
fi

if [[ "${HASURA_APPLY_METADATA}" == "true" ]]
then
  echo "Apply Hasura metadata..."
  cli metadata apply \
    --admin-secret ${__SECRET} \
    --endpoint ${__ENDPOINT} \
    --skip-update-check || exit 1
else  
    echo "Skipping metadata"
fi

if [[ "${HASURA_APPLY_SEEDS}" == "true" ]]
then
  echo "Apply SQL seeds..."
  cli seeds apply \
    --admin-secret ${__SECRET} \
    --endpoint ${__ENDPOINT} \
    --database-name=${__DATABASE} \
    --file ${__SEED}.sql \
    --skip-update-check || exit 1
else
  echo "Skipping seeds"
fi

if [[ "${HASURA_VERIFY}" == "true" ]]
then
  echo "Check migration status..."
  cli migrate status \
    --admin-secret ${__SECRET} \
    --endpoint ${__ENDPOINT} \
    --database-name=${__DATABASE}
fi