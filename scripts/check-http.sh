check_url() {
  SERVICE_URL="$1"
  EXPECTED_STATUS_CODE=200

  # Maximum number of attempts
  MAX_ATTEMPTS=30
  INTERVAL=20

  # Current attempt number
  ATTEMPT=1

  while [ "${ATTEMPT}" -le "${MAX_ATTEMPTS}" ]; do
    STATUS_CODE=$(curl -s -o /dev/null -w '%{http_code}' "${SERVICE_URL}")

    if [ "${STATUS_CODE}" -eq "${EXPECTED_STATUS_CODE}" ]; then
      echo "${SERVICE_URL} is up and running!"
      break
    else
      echo "${SERVICE_URL} is not up yet (attempt ${ATTEMPT}/${MAX_ATTEMPTS}), retrying in $INTERVAL seconds..."
      sleep $INTERVAL
      ATTEMPT=$((ATTEMPT + 1))
    fi
  done

  if [ "${ATTEMPT}" -gt "${MAX_ATTEMPTS}" ]; then
    echo "REST API at ${SERVICE_URL} did not start after ${MAX_ATTEMPTS} attempts. Exiting."
    exit 1
  fi
}