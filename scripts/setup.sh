#!/bin/bash

SCRIPT_DIR=$(dirname "$0")
ENV_FILE="$SCRIPT_DIR/../envs/6.0.0.env"

docker compose --env-file=$ENV_FILE up -d
./scripts/check-services.sh

