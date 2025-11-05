#!/bin/bash

# At-Solvexx Setup Script
# This script helps you set up the development environment

set -e

echo "🚀 At-Solvexx Setup Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f "apps/web/.env.local" ]; then
  echo -e "${YELLOW}⚠️  .env.local not found. Creating from template...${NC}"
  cp apps/web/.env.local.example apps/web/.env.local 2>/dev/null || cp docs/ENV.example apps/web/.env.local
  echo -e "${GREEN}✓ Created apps/web/.env.local${NC}"
  echo -e "${YELLOW}⚠️  Please edit apps/web/.env.local with your credentials${NC}"
else
  echo -e "${GREEN}✓ .env.local already exists${NC}"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
  echo -e "${GREEN}✓ Dependencies installed${NC}"
else
  echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

# Check if apps/web/node_modules exists
if [ ! -d "apps/web/node_modules" ]; then
  echo -e "${YELLOW}Installing web app dependencies...${NC}"
  cd apps/web && npm install && cd ../..
  echo -e "${GREEN}✓ Web app dependencies installed${NC}"
else
  echo -e "${GREEN}✓ Web app dependencies already installed${NC}"
fi

# Check environment variables
echo ""
echo "Checking environment variables..."
MISSING_VARS=()

if ! grep -q "SUPABASE_URL=https://your-project" apps/web/.env.local 2>/dev/null; then
  SUPABASE_URL=$(grep "^SUPABASE_URL=" apps/web/.env.local 2>/dev/null | cut -d '=' -f2)
  if [ -z "$SUPABASE_URL" ] || [ "$SUPABASE_URL" = "https://your-project.supabase.co" ]; then
    MISSING_VARS+=("SUPABASE_URL")
  fi
fi

if ! grep -q "SUPABASE_ANON_KEY=your-anon-key" apps/web/.env.local 2>/dev/null; then
  SUPABASE_ANON=$(grep "^SUPABASE_ANON_KEY=" apps/web/.env.local 2>/dev/null | cut -d '=' -f2)
  if [ -z "$SUPABASE_ANON" ] || [ "$SUPABASE_ANON" = "your-anon-key" ]; then
    MISSING_VARS+=("SUPABASE_ANON_KEY")
  fi
fi

if ! grep -q "SUPABASE_SERVICE_ROLE_KEY=your-service-role-key" apps/web/.env.local 2>/dev/null; then
  SUPABASE_SERVICE=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" apps/web/.env.local 2>/dev/null | cut -d '=' -f2)
  if [ -z "$SUPABASE_SERVICE" ] || [ "$SUPABASE_SERVICE" = "your-service-role-key" ]; then
    MISSING_VARS+=("SUPABASE_SERVICE_ROLE_KEY")
  fi
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo -e "${RED}✗ Missing required environment variables:${NC}"
  for var in "${MISSING_VARS[@]}"; do
    echo -e "  ${RED}- $var${NC}"
  done
  echo ""
  echo -e "${YELLOW}Please update apps/web/.env.local with your Supabase credentials${NC}"
  echo -e "${YELLOW}Get them from: https://app.supabase.com/project/_/settings/api${NC}"
else
  echo -e "${GREEN}✓ All required environment variables are set${NC}"
fi

# Check /etc/hosts for local subdomain setup
echo ""
echo "Checking /etc/hosts configuration..."
if grep -q "at-solvexx.test" /etc/hosts 2>/dev/null; then
  echo -e "${GREEN}✓ at-solvexx.test found in /etc/hosts${NC}"
else
  echo -e "${YELLOW}⚠️  at-solvexx.test not found in /etc/hosts${NC}"
  echo -e "${YELLOW}Add these lines to /etc/hosts for local subdomain testing:${NC}"
  echo -e "  ${YELLOW}127.0.0.1 at-solvexx.test${NC}"
  echo -e "  ${YELLOW}127.0.0.1 alice.at-solvexx.test${NC}"
  echo -e "  ${YELLOW}127.0.0.1 admin.at-solvexx.test${NC}"
fi

# Database setup reminder
echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Database Setup:"
echo "   - Go to your Supabase project: https://app.supabase.com"
echo "   - Navigate to SQL Editor"
echo "   - Copy and run the SQL from: docs/schema.sql"
echo "   - Verify all tables are created"
echo ""
echo "2. Environment Variables:"
echo "   - Edit apps/web/.env.local with your credentials"
echo "   - Required: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "3. Start Development Server:"
echo "   npm run dev"
echo ""
echo "4. Visit:"
echo "   http://localhost:3000"
echo ""

echo -e "${GREEN}Setup complete! 🎉${NC}"
