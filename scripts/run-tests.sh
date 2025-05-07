#!/bin/bash
#
# This script orchestrates the test execution process:
# 1. Parses command line arguments for test configuration
# 2. Sets up the test environment (calls setup.sh) unless --no-init is specified
# 3. Runs the tests using yarn test:run
# 4. Performs test environment teardown unless --no-init is specified
#

set -e

# Get the directory where this script is located
SCRIPT_DIR=$(dirname "$0")

# parse args
source "$SCRIPT_DIR/lib/parse_args.sh"
parse_chain_args "$@"

# If argument parsing fails, exit the script with an error code
if [ $? -ne 0 ]; then
  exit 1
fi

# Setup the environment unless --no-init is specified
if [ "$SKIP_INIT" != "true" ]; then
  ./scripts/setup.sh "$@"
fi

NODE_URL="$CHAIN_URL" jest --maxWorkers=8

# Clean up the environment after tests complete unless --no-init is specified
if [ "$SKIP_INIT" != "true" ]; then
  yarn test:teardown
fi
