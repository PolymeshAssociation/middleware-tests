#!/bin/bash

set -e

# Chain version to test
VERSION='7.2.0'

# Get the script directory
SCRIPT_DIR=$(dirname "$0")

# Parse command line arguments
source "$SCRIPT_DIR/lib/parse_args.sh"
parse_chain_args "$@"

if [ $? -ne 0 ]; then
  exit 1
fi

# Function to check if chain is ready
check_chain_ready() {
  local max_attempts=30
  local attempt=1
  local sleep_seconds=2

  echo "Waiting for chain to be ready..."
  while [ $attempt -le $max_attempts ]; do
    if curl --silent -H 'Content-Type: application/json' -d '{"id":"1", "jsonrpc":"2.0", "method": "chain_getBlockHash", "params":[0]}' http://localhost:9933 > /dev/null 2>&1; then
      echo "Chain is ready!"
      return 0
    fi

    sleep $sleep_seconds
    attempt=$((attempt + 1))
  done

  echo "Chain failed to become ready after $max_attempts attempts"
  return 1
}

IMAGE_REPO=polymeshassociation/polymesh

# service manifest
ENV_FILE="$SCRIPT_DIR/../envs/$VERSION.env"

# ensure env file exists
if ! [ -f $ENV_FILE ]; then
  echo "Env file does not exist: $ENV_FILE"
  exit 1
fi

# The chain arm64 docker images are stored in a separate repo
# The arch should be checked and the env modified because
# the chain incurs large performance penalties when emulated
WORK_ENV_FILE=$ENV_FILE
ARCH=$(uname -m)
if [ $ARCH = 'arm64' ]; then
  WORK_ENV_FILE="/tmp/polymesh-test.env"
  REPO="${IMAGE_REPO}-arm64"
  sed "s|CHAIN_IMAGE=${IMAGE_REPO}:\(.*\)|CHAIN_IMAGE=${REPO}:\1|" "$ENV_FILE" > "$WORK_ENV_FILE"
  echo "Note: arm64 detected, chain repo from was set to ${REPO}. env file written to: ${WORK_ENV_FILE}"
fi

echo "starting polymesh test environment"

UP_OPTS="--detach --force-recreate --renew-anon-volumes"

# Only start chain if no chain URL was provided
if [ -z "$CHAIN_URL" ]; then
  echo "Starting local chain..."
  docker compose --profile=chain --env-file=$WORK_ENV_FILE up $UP_OPTS

  # Wait for chain to be ready
  if ! check_chain_ready; then
    echo "Failed to start chain"
    exit 1
  fi
else
  echo "Skipping local chain setup - using provided chain URL: $CHAIN_URL"
fi

CHAIN_URL="$CHAIN_URL" \
CHAIN_ID="$CHAIN_ID" \
docker compose \
  --profile=query \
  --profile=api \
  --env-file=$WORK_ENV_FILE \
  up $UP_OPTS

./scripts/check-services.sh
