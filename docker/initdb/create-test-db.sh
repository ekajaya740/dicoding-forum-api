#!/bin/bash
set -euo pipefail

if [[ -z "${PGDATABASE_TEST:-}" ]]; then
  echo "PGDATABASE_TEST is not set; skipping test database creation." >&2
  exit 0
fi

psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}" <<EOSQL
SELECT 'CREATE DATABASE ${PGDATABASE_TEST} OWNER ${POSTGRES_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${PGDATABASE_TEST}')
\gexec
EOSQL
