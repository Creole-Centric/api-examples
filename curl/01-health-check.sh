#!/bin/bash
# Check API Health Status

API_KEY="${CREOLECENTRIC_API_KEY}"
BASE_URL="https://creolecentric.com/api/v1"

curl -X GET "${BASE_URL}/health/" \
  -H "Authorization: ApiKey ${API_KEY}" \
  -H "Content-Type: application/json"
