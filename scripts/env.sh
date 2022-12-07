#!/bin/bash

export CHAIN_VERSION="${CHAIN_VERSION:-latest}"
export VAULT_CONTAINER_NAME="${VAULT_CONTAINER_NAME:-middleware-tests-vault}"
export VAULT_ROOT_TOKEN="${VAULT_ROOT_TOKEN:-root}"
export VAULT_PORT="${VAULT_PORT:-8200}"