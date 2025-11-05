# Quick Start Guide

Get the At-Solvexx running locally in 5 minutes.

## Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account (free tier)
- Razorpay sandbox account

## Step 1: Clone & Install (2 min)

```bash
# Clone repository
git clone https://github.com/Vmit2/website-builder.git
cd website-builder

# Checkout feature branch
git checkout feature/mvp-website-builder

# Install dependencies
npm install
```

## Step 2: Setup Environment (1 min)

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your credentials
nano .env.local
```

Minimal required variables:

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your-secret
```

## Step 3: Setup Local Hosts (1 min)

Add to `/etc/hosts`:

```
127.0.0.1 at-solvexx.test
127.0.0.1 alice.at-solvexx.test
127.0.0.1 admin.at-solvexx.test
```

## Step 4: Start Development Server (1 min)

```bash
npm run dev
```

Visit `http://localhost:3000`

## Step 5: Test the App (1 min)

### Test Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "username": "alice",
    "fullName": "Alice Smith"
  }'
```

### Test Themes
```bash
curl http://localhost:3000/api/themes
```

### Test Admin Sites
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/sites
```

## Common Issues

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### Supabase connection fails
- Verify `SUPABASE_URL` and keys
- Check Supabase project is active
- Ensure firewall allows connection

### Subdomain not resolving
- Verify hosts file entries
- Clear browser cache
- Restart dev server

## Next Steps

1. Read [SETUP.md](./SETUP.md) for detailed service configuration
2. Review [API.md](./API.md) for endpoint documentation
3. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
4. Import [postman-collection.json](./postman-collection.json) into Postman

## Project Structure

```
website-builder/
├── apps/web/              # Next.js app
│   ├── app/              # App router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities
│   └── __tests__/        # Tests
├── services/
│   ├── n8n-workflows/   # Automation workflows
│   └── scripts/         # Deployment scripts
├── docs/                # Documentation
└── package.json         # Root config
```

## Key Files

- **Middleware**: `apps/web/middleware.ts` - Subdomain routing
- **Database**: `lib/db.ts` - Supabase client
- **Utils**: `lib/utils.ts` - Helper functions
- **API Routes**: `app/api/` - Backend endpoints
- **Themes**: `components/themes/` - Theme components

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Run linter
npm run lint

# Type check
npm run type-check
```

## API Examples

### Signup
```bash
POST /api/auth/signup
{
  "email": "user@example.com",
  "username": "username",
  "fullName": "User Name"
}
```

### Get Themes
```bash
GET /api/themes
```

### Admin Approve Site
```bash
POST /api/admin/sites/:id/approve
Authorization: Bearer TOKEN
{
  "comment": "Looks good!"
}
```

## Documentation

- [README.md](../README.md) - Project overview
- [SETUP.md](./SETUP.md) - Detailed service setup
- [API.md](./API.md) - API documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
- [schema.sql](./schema.sql) - Database schema

## Support

- GitHub Issues: https://github.com/Vmit2/website-builder/issues
- Documentation: See `/docs` folder
- Email: support@at-solvexx.com

---

**Happy coding! 🚀**
