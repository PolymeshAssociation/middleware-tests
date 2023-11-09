#!/bin/bash

SCRIPT_DIR=$(dirname "$0")

VERSION='6.0.0'

# Note: for teardown the specifics don't matter to much, as long as the compose file can be properly templated
ENV_FILE="$SCRIPT_DIR/../envs/$VERSION.env"

docker compose --env-file $ENV_FILE down

