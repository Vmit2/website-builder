# At-Solvexx MVP - Project Overview

## 🎯 Project Summary

**Multi-tenant SaaS** that enables influencers and freelancers to create professional portfolio websites in minutes. Users get a **24-hour free trial** on a branded subdomain with optional paid upgrades.

**Repository**: `feature/mvp-website-builder`  
**Status**: ✅ Ready for Testing

---

## ✨ Core Features

### 1. Multi-Tenant Architecture
- **Subdomain-based routing**: `username.localhost` (dev) → `username.at-solvexx.com` (prod)
- **Single Next.js app** serves all users
- **Middleware** extracts subdomain and routes to correct site

### 2. User Signup & Free Trial
- Email/password authentication (Supabase)
- Instant subdomain provisioning
- 24-hour countdown timer
- **Coming Soon page** with user content
- Auto site creation on signup

### 3. Theme System
- **10+ pre-built themes** (minimal-creative, bold-portfolio, tech-personal, etc.)
- 5 color palettes per theme
- Live preview sandbox
- Client-side theme switching

### 4. Admin Approval System
- Admin dashboard for pending sites
- Approve/Request Changes/Reject actions
- Email notifications
- Audit logging

### 5. Payment Integration
- Razorpay subscriptions
- **3 Plans**: Basic (₹1,999 one-time), Pro (₹699/month), Premium (₹1,499/month)
- Webhook handling for payment events

### 6. User Dashboard
- Site management
- Content editing
- Analytics view
- Upgrade to paid plans

---

## 🔄 Key User Flows

### Signup Flow
```
1. User visits landing page → Fills signup form
2. POST /api/auth/signup → Creates user + site record
3. Site created: status="pending", coming_soon=true
4. Redirect to /{username}/dashboard
5. User sees Coming Soon page at {username}.localhost:3000
```

### Site Access Flow
```
1. Visit {username}.localhost:3000
2. Middleware detects subdomain → Sets x-subdomain header
3. Server component checks header → Fetches site data
4. If coming_soon=true → Shows Coming Soon page
5. If approved → Renders portfolio theme
```

### Admin Approval Flow
```
1. Admin views /admin → Sees pending sites
2. Clicks site → Preview modal
3. Approves → coming_soon=false, status="approved"
4. Email sent to user → Site goes live
```

---

## 📁 Project Structure

```
apps/web/
├── app/
│   ├── page.tsx              # Root: Checks subdomain → Routes to LandingPage or SitePage
│   ├── [username]/dashboard/ # User dashboard
│   ├── admin/                # Admin panel
│   ├── api/                  # API routes
│   │   ├── auth/            # Signup, login
│   │   ├── dashboard/       # Site management
│   │   ├── admin/           # Admin operations
│   │   └── themes/          # Theme endpoints
│   └── components/
│       ├── LandingPage.tsx  # Landing/marketing page
│       ├── SitePage.tsx     # Portfolio site renderer
│       ├── themes/          # Theme components
│       └── admin/           # Admin UI
├── lib/
│   ├── db.ts                # Supabase client
│   └── utils.ts             # Utilities (getSiteUrl, etc.)
└── middleware.ts            # Subdomain routing
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | Supabase Auth |
| **Payments** | Razorpay |
| **Email** | Resend |
| **DNS** | Cloudflare API |
| **Deployment** | Vercel |

---

## 🗄️ Database Schema

**Core Tables:**
- `users` - User accounts with roles (user, admin, super_admin)
- `sites` - Portfolio sites (username, theme, status, content)
- `themes` - Available themes
- `plans` - Subscription plans
- `subscriptions` - Active subscriptions with Razorpay tracking
- `audit_logs` - Audit trail for all actions
- `image_library` - Pre-curated images for freemium tier

---

## 🔌 Key API Endpoints

### Authentication
- `POST /api/auth/signup` - Create user + site
- `POST /api/auth/login` - User authentication

### Dashboard
- `GET /api/dashboard/site?username=xxx` - Get site data
- `PUT /api/dashboard/site` - Update site content
- `POST /api/dashboard/theme` - Choose theme
- `GET /api/dashboard/analytics` - View analytics

### Admin
- `GET /api/admin/sites` - List pending sites
- `POST /api/admin/approve` - Approve site
- `POST /api/admin/reject` - Reject site

### Themes
- `GET /api/themes` - List all themes
- `GET /api/themes/[slug]` - Get theme details

### Webhooks
- `POST /api/webhooks/razorpay` - Payment event webhooks

---

## ✅ Current Implementation Status

- ✅ Subdomain routing (`.localhost` for dev, `.at-solvexx.com` for prod)
- ✅ Site auto-creation on signup
- ✅ Coming Soon page with countdown
- ✅ Dashboard for site management
- ✅ Admin approval system
- ✅ Theme rendering system (minimal-creative, bold-portfolio)
- ✅ Local development setup
- ✅ Multi-tenant architecture
- ✅ Database schema with RLS

---

## 🚀 Quick Start

1. **Install dependencies**: `npm install`
2. **Setup environment**: Copy `.env.local.example` to `.env.local`
3. **Configure Supabase**: Add credentials to `.env.local`
4. **Run database schema**: Execute `docs/schema.sql` in Supabase SQL Editor
5. **Start dev server**: `npm run dev`
6. **Visit**: `http://localhost:3000` (landing) or `http://username.localhost:3000` (portfolio)

---

## 📚 Documentation

- **README.md** - Project overview and setup
- **docs/QUICKSTART.md** - 5-minute setup guide
- **docs/SETUP.md** - Detailed service configuration
- **docs/API.md** - API documentation
- **docs/ARCHITECTURE.md** - System design
- **docs/DEPLOYMENT.md** - Production deployment guide

---

**Last Updated**: November 2024

