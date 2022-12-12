#!/bin/bash

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

source ./env.sh


echo "Stopping: $VAULT_CONTAINER_NAME"
docker stop $VAULT_CONTAINER_NAME

yarn run polymesh-local stop --clean