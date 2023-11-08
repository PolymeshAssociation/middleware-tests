#!/bin/bash

set -e

SCRIPT_DIR=$(dirname "$0")

IMAGE_REPO=polymeshassociation/polymesh

# Chain version to test
VERSION='6.0.0'

# service manifest
ENV_FILE="$SCRIPT_DIR/../envs/$VERSION.env"

# ensure env file exists
if ! [ -f $ENV_FILE ]; then
  echo "Env file does not exist: $ENV_FILE"
  exit 1
fi
# The chain arm64 docker images are stored in a separate repo
# The arch should be checked and the env modified to accomodate
# the chain incurs large performance penalties when emulated
WORK_ENV_FILE=$ENV_FILE
ARCH=$(uname -m)
if [ $ARCH = 'arm64' ]; then
  WORK_ENV_FILE="/tmp/polymesh-test.env"
  REPO="${IMAGE_REPO}-arm64"
  sed "s|CHAIN_IMAGE=${IMAGE_REPO}:\(.*\)|CHAIN_IMAGE=${REPO}:\1|" "$ENV_FILE" > "$WORK_ENV_FILE"

  echo "Note: arm64 detected chain image from: ${REPO} was used"
fi

echo "starting polymesh test envrionment, env file: $WORK_ENV_FILE"
docker compose --env-file=$WORK_ENV_FILE up -d --force-recreate
./scripts/check-services.sh
