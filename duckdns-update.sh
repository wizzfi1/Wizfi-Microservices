#!/bin/bash

# === CONFIGURATION ===
DOMAIN="wizfi-grafana"
TOKEN="997f7b2c-ce52-426f-aea3-b5882e8c728f"
ELB_HOST="a43fec8c4ae6249cfbf9f29c17849194-1926228754.us-east-1.elb.amazonaws.com"

# === GET ELB IP ===
IP=$(dig +short "$ELB_HOST" | tail -n1)

if [[ -z "$IP" ]]; then
  echo "Failed to resolve ELB IP"
  exit 1
fi

# === UPDATE DUCKDNS ===
RESPONSE=$(curl -s "https://www.duckdns.org/update?domains=$DOMAIN&token=$TOKEN&ip=$IP")

echo "$(date): DuckDNS response: $RESPONSE"
