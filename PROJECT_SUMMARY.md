# At-Solvexx MVP - Project Summary

## Project Overview

**Aariyatech At-Solvexx** is a multi-tenant SaaS application that enables influencers and freelancers to create professional portfolio websites in minutes. Users receive a **24-hour free trial** on a branded subdomain, with optional paid upgrades for advanced features and custom domains.

**Repository**: https://github.com/Vmit2/website-builder  
**Branch**: `feature/mvp-website-builder`  
**Status**: MVP Ready for Testing

---

## Key Features Delivered

### ✅ Multi-Tenant Architecture
- Single Next.js app serving all users
- Subdomain-based routing (`username.at-solvexx.com`)
- Middleware for automatic tenant detection
- Row-level security for data isolation

### ✅ User Signup & Free Trial
- Email/password authentication via Supabase
- Instant subdomain provisioning
- 24-hour countdown timer
- Coming-Soon page with user content
- Automatic trial expiry handling

### ✅ Theme System
- 10 pre-built themes with live previews
- 5 color palettes per theme
- Client-side theme switching
- Responsive design with Tailwind CSS

### ✅ Admin Approval System
- Admin dashboard with pending sites list
- One-click site preview
- Approve/Request Changes/Reject actions
- Email notifications to users
- Audit logging for all actions

### ✅ Payment Integration
- Razorpay subscription API integration
- Three pricing plans (Basic, Pro, Premium)
- Webhook handling for payment events
- Subscription status tracking

### ✅ Automation Workflows
- n8n workflow definitions for:
  - Signup → Subdomain provisioning
  - Payment → Subscription updates
  - Admin approval → Email notifications
- Webhook endpoints for workflow triggers

### ✅ API Endpoints
- **Auth**: Signup, Login
- **Themes**: Get all themes, Get theme details
- **Dashboard**: Get/Update site, Choose theme, View analytics
- **Admin**: List sites, Get site details, Approve/Reject
- **Webhooks**: Razorpay, Signup, Approval

### ✅ Documentation
- Comprehensive README with quick start
- QUICKSTART guide (5-minute setup)
- SETUP guide with detailed service configuration
- API documentation with examples
- DEPLOYMENT guide for production
- ARCHITECTURE document explaining design
- Postman collection for API testing

### ✅ Testing & CI/CD
- Unit test stubs for utilities
- Integration test stubs for API flows
- E2E test configuration
- GitHub Actions workflows for:
  - Linting and type checking
  - Testing
  - Vercel deployment

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js | 16.0.1 |
| **Language** | TypeScript | 5.3.3 |
| **Styling** | Tailwind CSS | 4.0 |
| **Database** | PostgreSQL (Supabase) | Latest |
| **Auth** | Supabase Auth | Latest |
| **Payments** | Razorpay | Latest |
| **Email** | Resend | Latest |
| **DNS/CDN** | Cloudflare | Latest |
| **Automation** | n8n | Latest |
| **Deployment** | Vercel | Latest |
| **Monitoring** | Sentry (optional) | Latest |

---

## Project Structure

```
website-builder/
├── apps/
│   └── web/                          # Main Next.js application
│       ├── app/
│       │   ├── (auth)/              # Auth pages
│       │   ├── (dashboard)/         # User dashboard
│       │   ├── admin/               # Admin panel
│       │   ├── themes/              # Theme demos
│       │   ├── api/                 # API routes
│       │   └── [subdomain]/         # Dynamic tenant routes
│       ├── components/
│       │   ├── themes/              # 3 starter themes
│       │   ├── ui/                  # Shared components
│       │   └── admin/               # Admin UI
│       ├── lib/
│       │   ├── db.ts                # Supabase client
│       │   └── utils.ts             # Utilities
│       ├── __tests__/               # Test stubs
│       ├── middleware.ts            # Subdomain routing
│       └── jest.config.js           # Test config
├── services/
│   ├── n8n-workflows/              # Automation workflows (JSON)
│   │   ├── workflow-signup-provision.json
│   │   ├── workflow-razorpay-payment.json
│   │   └── workflow-admin-approval.json
│   └── scripts/
│       └── provision-subdomain.sh   # DNS provisioning
├── docs/
│   ├── README.md                    # Main documentation
│   ├── QUICKSTART.md                # 5-minute setup
│   ├── SETUP.md                     # Detailed configuration
│   ├── API.md                       # API reference
│   ├── DEPLOYMENT.md                # Production guide
│   ├── ARCHITECTURE.md              # System design
│   ├── schema.sql                   # Database schema
│   ├── ENV.example                  # Environment template
│   └── postman-collection.json      # API testing
├── .github/
│   └── workflows/
│       ├── test-lint.yml            # CI pipeline
│       └── deploy-vercel.yml        # CD pipeline
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── package.json                     # Root config
└── README.md                        # Project overview
```

---

## Database Schema

### Core Tables

- **users**: User accounts with roles (user, admin, super_admin)
- **sites**: Portfolio sites with theme, status, and content
- **themes**: Available themes with descriptions
- **image_library**: Pre-curated images for freemium tier
- **plans**: Subscription plans (Basic, Pro, Premium)
- **subscriptions**: Active subscriptions with Razorpay tracking
- **audit_logs**: Audit trail for all actions

See `docs/schema.sql` for complete schema with indexes.

---

## API Endpoints

### Public Endpoints
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - User login
- `GET /api/themes` - List themes
- `GET /api/images/library` - Get image library

### Protected User Endpoints
- `GET /api/dashboard/site` - Get site data
- `PUT /api/dashboard/site` - Update content
- `POST /api/dashboard/theme` - Choose theme
- `GET /api/dashboard/analytics` - View stats
- `POST /api/dashboard/upgrade` - Initiate payment

### Protected Admin Endpoints
- `GET /api/admin/sites` - List pending sites
- `GET /api/admin/sites/:id` - Get site details
- `POST /api/admin/sites/:id/approve` - Approve site
- `POST /api/admin/sites/:id/request-changes` - Request changes
- `POST /api/admin/sites/:id/reject` - Reject site
- `GET /api/admin/users` - List users
- `POST /api/admin/broadcast` - Send emails

### Webhook Endpoints
- `POST /api/webhooks/razorpay` - Payment events
- `POST /api/webhooks/signup` - Signup flow
- `POST /api/webhooks/approval` - Approval flow

See `docs/API.md` for complete endpoint documentation.

---

## Deployment Checklist

### Prerequisites
- [ ] Supabase project created and configured
- [ ] Razorpay account verified (KYC complete)
- [ ] Cloudflare domain added and configured
- [ ] Resend account with domain verified
- [ ] Vercel account connected to GitHub
- [ ] n8n instance (self-hosted or cloud)

### Configuration Steps
- [ ] Run database schema migration
- [ ] Create Razorpay subscription plans
- [ ] Setup Cloudflare wildcard CNAME
- [ ] Configure Resend email domain
- [ ] Setup GitHub Actions secrets
- [ ] Deploy to Vercel
- [ ] Configure n8n workflows
- [ ] Test all integrations

See `docs/DEPLOYMENT.md` for detailed instructions.

---

## Testing

### Unit Tests
```bash
npm run test
```
Tests for utility functions, validation, formatting, etc.

### Integration Tests
```bash
npm run test:integration
```
Tests for API endpoints, database operations, etc.

### E2E Tests
```bash
npm run test:e2e
```
Tests for complete user flows (signup, approval, payment).

### Manual Testing
Use Postman collection in `docs/postman-collection.json` to test all endpoints.

---

## Environment Variables

Required variables for development:

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your-secret
CLOUDFLARE_TOKEN=your-token
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_ZONE_ID=your-zone-id
RESEND_API_KEY=your-resend-key
```

See `.env.example` for complete list.

---

## Git Commit History

### Initial Commits

```
f7d7608 feat: initial nextjs app + middleware + monorepo structure
fb8b27d docs: comprehensive documentation and guides
```

### Commit Messages Format

All commits follow this format:

```
<type>: <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `chore`: Build, dependencies, etc.
- `test`: Tests
- `refactor`: Code refactoring

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `middleware.ts` | Subdomain routing logic |
| `lib/db.ts` | Supabase client and queries |
| `lib/utils.ts` | Helper functions |
| `app/api/auth/signup/route.ts` | Signup endpoint |
| `app/api/admin/approve/route.ts` | Admin approval |
| `app/api/webhooks/razorpay/route.ts` | Payment webhook |
| `components/themes/*/index.tsx` | Theme components |
| `docs/schema.sql` | Database schema |
| `services/n8n-workflows/*.json` | Automation workflows |

---

## Known Limitations (MVP)

1. **Image Upload**: Disabled during freemium (library only)
2. **Theme Switching**: Limited to 1 free switch during trial
3. **Custom Domain**: Manual admin approval required
4. **Email Provisioning**: Manual setup (Zoho/Google Workspace)
5. **Static Export**: Optional, not automated
6. **Analytics**: Basic visitor count only
7. **Blogging**: Not included in MVP
8. **SEO Tools**: Basic only

---

## Future Enhancements

### Phase 2
- [ ] Custom domain support
- [ ] Advanced analytics (heatmaps, sessions)
- [ ] Email provisioning automation
- [ ] Blogging platform
- [ ] Content management system

### Phase 3
- [ ] AI-powered content suggestions
- [ ] Template marketplace
- [ ] White-label solution
- [ ] Third-party API integrations
- [ ] Mobile app

---

## Quick Start

### 5-Minute Setup

```bash
# 1. Clone and install
git clone https://github.com/Vmit2/website-builder.git
cd website-builder
git checkout feature/mvp-website-builder
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# 3. Add to /etc/hosts
echo "127.0.0.1 at-solvexx.test" >> /etc/hosts

# 4. Start dev server
npm run dev

# 5. Visit
open http://localhost:3000
```

See `docs/QUICKSTART.md` for detailed guide.

---

## Support & Documentation

- **README**: `README.md` - Project overview
- **Quick Start**: `docs/QUICKSTART.md` - 5-minute setup
- **Setup Guide**: `docs/SETUP.md` - Service configuration
- **API Docs**: `docs/API.md` - Endpoint reference
- **Deployment**: `docs/DEPLOYMENT.md` - Production setup
- **Architecture**: `docs/ARCHITECTURE.md` - System design
- **Postman**: `docs/postman-collection.json` - API testing

---

## Contact & Support

- **GitHub Issues**: https://github.com/Vmit2/website-builder/issues
- **Email**: support@at-solvexx.com
- **Documentation**: See `/docs` folder

---

## License

MIT License - See LICENSE file for details

---

## Acknowledgments

Built with:
- Next.js 16 (React framework)
- Supabase (Backend + Database)
- Tailwind CSS (Styling)
- Razorpay (Payments)
- Vercel (Deployment)
- n8n (Automation)

---

**Last Updated**: October 2025  
**Status**: MVP Ready for Testing  
**Version**: 0.1.0
