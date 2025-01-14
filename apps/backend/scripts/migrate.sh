#!/bin/bash

# Check if a migration name is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <migration-name>"
  exit 1
fi

# Assign the migration name to a variable
MIGRATION_NAME=$1

# Run the TypeORM migration generation command
echo "Generating migration: $MIGRATION_NAME"
if npx typeorm-ts-node-esm migration:generate src/migrations/"$MIGRATION_NAME" -d ./ormconfig.ts; then
  echo "Migration $MIGRATION_NAME generated successfully."
else
  echo "Failed to generate migration $MIGRATION_NAME."
  exit 1
fi