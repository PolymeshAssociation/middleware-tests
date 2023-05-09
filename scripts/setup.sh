#!/bin/bash

docker compose up -d
./scripts/check-services.sh

# graphql needs to contact the indexer for the schema, restart makes sure its ready to serve traffic
docker compose restart graphql