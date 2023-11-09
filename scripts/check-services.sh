#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source "${SCRIPT_DIR}/check-http.sh"

# REST API
check_url "http://localhost:3004/"
# SubQuery Indexer
check_url "http://localhost:3002/health"

