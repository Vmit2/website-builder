#!/bin/bash

# Cloudflare DNS Provisioning Script
# Provisions a new subdomain CNAME record for a user's portfolio site
# Usage: ./provision-subdomain.sh <username> <vercel-alias>

set -e

USERNAME=$1
VERCEL_ALIAS=$2

if [ -z "$USERNAME" ] || [ -z "$VERCEL_ALIAS" ]; then
  echo "Usage: $0 <username> <vercel-alias>"
  echo "Example: $0 alice your-vercel-alias.vercel.app"
  exit 1
fi

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

# Validate required environment variables
if [ -z "$CLOUDFLARE_TOKEN" ] || [ -z "$CLOUDFLARE_ZONE_ID" ]; then
  echo "Error: CLOUDFLARE_TOKEN and CLOUDFLARE_ZONE_ID must be set in .env.local"
  exit 1
fi

echo "Provisioning subdomain: $USERNAME.brand.com -> $VERCEL_ALIAS"

# Create CNAME record via Cloudflare API
RESPONSE=$(curl -s -X POST \
  "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"CNAME\",
    \"name\": \"$USERNAME\",
    \"content\": \"$VERCEL_ALIAS\",
    \"ttl\": 3600,
    \"proxied\": true
  }")

# Check if successful
if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✓ Subdomain provisioned successfully!"
  echo "Visit: https://$USERNAME.brand.com"
  exit 0
else
  echo "✗ Failed to provision subdomain"
  echo "Response: $RESPONSE"
  exit 1
fi
