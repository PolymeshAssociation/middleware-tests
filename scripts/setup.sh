#!/bin/bash

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"
source ./env.sh

echo "starting vault on port: '${VAULT_PORT}' root token: '${VAULT_ROOT_TOKEN}'"
docker run -p 8200:8200 --rm -d --name ${VAULT_CONTAINER_NAME} --env VAULT_DEV_ROOT_TOKEN_ID=${VAULT_ROOT_TOKEN} vault
sleep 3

echo 'enabling vault transit engine'
docker exec --env VAULT_ADDR='http://localhost:8200' --env VAULT_TOKEN=${VAULT_ROOT_TOKEN} ${VAULT_CONTAINER_NAME} sh -c 'vault secrets enable transit'

echo 'creating a default key'
curl  --silent --header "X-Vault-Token: $VAULT_ROOT_TOKEN" "http://localhost:8200/v1/transit/keys/first" -d '{"type": "ed25519"}'

yarn run polymesh-local start -v ${CHAIN_VERSION} -c --vaultUrl="http://10.10.36.122:${VAULT_PORT}/v1/transit" --vaultToken=${VAULT_ROOT_TOKEN}

docker network create vault || true
docker network connect vault middleware-test-vault
docker network connect --ip 10.10.36.122 vault local_rest_api_1