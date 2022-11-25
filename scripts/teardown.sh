#!/bin/bash

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

source ./env.sh

yarn run polymesh-local stop --clean

echo "Stopping: ${VAULT_CONTAINER_NAME}"
docker stop ${VAULT_CONTAINER_NAME}