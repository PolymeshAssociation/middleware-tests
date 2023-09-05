#!/bin/bash

SCRIPT_DIR=$(dirname "$0")
ENV_FILE="$SCRIPT_DIR/../envs/5.4.0.env"

docker compose --env-file=$ENV_FILE down

