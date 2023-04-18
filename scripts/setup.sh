#!/bin/bash

docker compose up -d
./scripts/check-services.sh
docker compose restart graphql