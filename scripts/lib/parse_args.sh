#!/bin/bash

# This script is intended to be sourced, not executed directly
# This library exposes functions for parsing command-line arguments related to chain configuration.
#
# USAGE:
#   1. Source this file: source /path/to/this/file
#   2. Call parse_chain_args with your script's arguments: parse_chain_args "$@"
#   3. Use the resulting CHAIN_URL and CHAIN_ID variables in your script
#
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  echo "Error: This script should be sourced, not executed."
  echo "Usage: source ${BASH_SOURCE[0]}"
  exit 1
fi

# Default values
CHAIN_URL=""
CHAIN_ID=""
SKIP_INIT="false"

# Function to display usage information
show_usage() {
  echo "Usage: $0 [OPTIONS]"
  echo "Options:"
  echo "  --chain-url=URL    Specify the external chain URL (must be used with --chain-id)"
  echo "  --chain-id=ID      Specify the external chain ID (must be used with --chain-id)"
  echo "  --no-init          Skip setup and teardown steps"
  echo "  --help             Display this help message and exit"
  echo ""
  echo "Note: When chain-url and chain-id are provided, the local chain setup is skipped."
  return 1
}

# Function to parse command line arguments
# Call this function after sourcing this script
parse_chain_args() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      --chain-url=*)
        CHAIN_URL="${1#*=}"
        shift
        ;;
      --chain-id=*)
        CHAIN_ID="${1#*=}"
        shift
        ;;
      --no-init)
        SKIP_INIT="true"
        shift
        ;;
      --help)
        show_usage
        return $?
        ;;
      *)
        echo "Error: Unknown option: $1"
        show_usage
        return 1
        ;;
    esac
  done

  # Validate that if one of chain-url or chain-id is provided, the other must be too
  if [[ -n "$CHAIN_URL" && -z "$CHAIN_ID" ]] || [[ -z "$CHAIN_URL" && -n "$CHAIN_ID" ]]; then
    echo "Error: Both --chain-url and --chain-id must be specified together."
    show_usage
    return 1
  fi

  return 0
}
