# Aariyatech At-Solvexx - MVP

A **multi-tenant portfolio builder** that allows influencers and freelancers to create professional portfolio websites in minutes. Users get a **24-hour free trial** on a branded subdomain, with optional paid upgrades for custom domains, advanced features, and professional email provisioning.

## 🎯 Key Features

- **Instant Subdomain Provisioning**: `username.at-solvexx.com` live in seconds
- **24-Hour Free Trial**: Coming-Soon page with countdown timer
- **Theme Gallery**: 10+ pre-built themes with live preview sandbox
- **Admin Approval System**: Super Admin reviews and approves sites
- **Freemium Image Library**: Pre-curated images during trial (no uploads)
- **Subscription Plans**: One-time Basic (₹1,999) or recurring Pro/Premium
- **Multi-Tenant Architecture**: Single Next.js app serving all users
- **Payment Integration**: Razorpay subscriptions with webhook handling
- **Email Notifications**: Transactional emails via Resend
- **Automation Workflows**: n8n for signup, payment, and approval flows

## 📋 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14+ (App Router), React, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, Supabase (PostgreSQL + Auth) |
| **Database** | PostgreSQL (via Supabase) |
| **Storage** | Cloudinary (images), Supabase Storage (backups) |
| **Authentication** | Supabase Auth |
| **Payments** | Razorpay Subscriptions API |
| **Email** | Resend (transactional) |
| **DNS/CDN** | Cloudflare API |
| **Automation** | n8n (workflows) |
| **Deployment** | Vercel |
| **Analytics** | Plausible or Umami |
| **Monitoring** | Sentry (optional) |

## 🏗️ Project Structure

```
website-builder/
├── apps/
│   ├── web/                    # Main Next.js app (frontend + API routes)
│   │   ├── app/
│   │   │   ├── (auth)/        # Authentication pages
│   │   │   ├── (dashboard)/   # User dashboard
│   │   │   ├── admin/         # Admin panel
│   │   │   ├── themes/        # Theme demo pages
│   │   │   ├── api/           # API routes
│   │   │   └── [subdomain]/   # Dynamic tenant routes
│   │   ├── components/
│   │   │   ├── themes/        # Theme components
│   │   │   ├── ui/            # Shared UI components
│   │   │   └── admin/         # Admin UI components
│   │   ├── lib/
│   │   │   ├── db.ts          # Supabase client
│   │   │   ├── auth.ts        # Auth utilities
│   │   │   └── utils.ts       # Helper functions
│   │   └── middleware.ts      # Subdomain routing
│   ├── admin/                  # Admin dashboard (optional separate app)
│   └── api/                    # Serverless functions (optional)
├── services/
│   ├── n8n-workflows/         # n8n workflow exports (JSON)
│   └── scripts/               # Deploy, DNS, and utility scripts
├── infra/
│   └── terraform/             # Infrastructure as Code (optional)
├── docs/
│   ├── README.md              # This file
│   ├── ENV.example            # Environment variables template
│   ├── SETUP.md               # Detailed setup guide
│   ├── API.md                 # API documentation
│   ├── DEPLOYMENT.md          # Deployment instructions
│   └── design/                # Wireframes and design assets
└── package.json               # Root monorepo config
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **npm/pnpm**
- **Git** with GitHub CLI
- **Supabase** account (free tier available)
- **Razorpay** sandbox account
- **Vercel** account for deployment
- **Cloudflare** account for DNS

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/Vmit2/website-builder.git
cd website-builder

# Checkout feature branch
git checkout feature/mvp-website-builder

# Install dependencies
npm install

# Copy environment template
cp docs/ENV.example .env.local
```

### 2. Configure Environment Variables

Edit `.env.local` with your credentials:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Razorpay (Sandbox)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your-secret

# Resend
RESEND_API_KEY=your-resend-key

# Cloudflare
CLOUDFLARE_TOKEN=your-token
CLOUDFLARE_ACCOUNT_ID=your-account-id
```

### 3. Initialize Database

```bash
# Run migrations (Supabase SQL)
npm run db:migrate

# Seed themes and images
npm run db:seed
```

### 4. Start Development Server

```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Terminal 2 (optional): Start n8n for workflows
npm run n8n:dev
```

Visit `http://localhost:3000` to see the landing page.

### 5. Test with Local Subdomains

Add to your `/etc/hosts` file:

```
127.0.0.1 at-solvexx.test
127.0.0.1 alice.at-solvexx.test
127.0.0.1 bob.at-solvexx.test
127.0.0.1 admin.at-solvexx.test
```

Then visit:
- `http://alice.at-solvexx.test:3000` → User's portfolio
- `http://admin.at-solvexx.test:3000/admin` → Admin panel

## 📚 Core User Flows

### 1. Signup & Free Trial

```
User visits landing page → Clicks "Try Free for 24 hrs" → 
Enters username, email, chooses theme + palette → 
Preview sandbox shows live preview → 
Clicks "Start Free Trial" → 
DB creates site record (coming_soon=true, launch_time=now+24h) → 
Subdomain username.at-solvexx.com provisioned → 
Email sent with preview link → 
User sees Coming-Soon page with countdown
```

### 2. Admin Approval

```
Admin logs in to /admin → Views pending sites list → 
Clicks site → preview modal opens → Reviews content → 
Clicks "Approve" → coming_soon flag toggled to false → 
Email notification sent to user → Site becomes fully live
```

### 3. Upgrade to Paid Plan

```
User clicks "Upgrade" → Selects Pro/Premium → 
Razorpay payment modal → User completes payment → 
Webhook received → subscription created → 
Site goes live if admin approved → Email confirmation sent
```

## 🎨 Theme System

### Available Themes (MVP)

1. **minimal-creative** — Clean, whitespace-driven
2. **visual-grid** — Photography-first grid layout
3. **bold-portfolio** — Large hero, bold typography
4. **fitness-pro** — Energetic, CTA-focused
5. **lifestyle-blog** — Blog + feed emphasis
6. **music-stage** — Dark, media-heavy
7. **tech-personal** — Developer portfolio
8. **beauty-studio** — Feminine palette
9. **travel-log** — Map + itinerary sections
10. **ecommerce-lite** — Simple products + contact

Each theme has 5 preset palettes + auto-palette extraction from images.

## 🔌 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create user account |
| POST | `/api/auth/login` | User login |
| GET | `/api/preview/:token` | Preview site without login |
| POST | `/api/themes/choose` | Select theme + palette |
| POST | `/api/content/save` | Save site content |
| POST | `/api/trial/start` | Start 24-hour free trial |

### Protected Endpoints (User)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/site` | Get user's site data |
| PUT | `/api/dashboard/site` | Update site content |
| GET | `/api/dashboard/analytics` | View visitor stats |
| POST | `/api/dashboard/upgrade` | Initiate upgrade flow |

### Protected Endpoints (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/sites` | List all sites |
| POST | `/api/admin/sites/:id/approve` | Approve site |
| POST | `/api/admin/sites/:id/request-changes` | Request changes |
| POST | `/api/admin/sites/:id/reject` | Reject site |

## 🗄️ Database Schema

Core tables: `users`, `sites`, `themes`, `image_library`, `plans`, `subscriptions`, `audit_logs`.

See [docs/SETUP.md](./docs/SETUP.md) for complete schema.

## 💳 Payment Integration

**Razorpay** handles subscriptions with webhook verification. Plans:
- **Basic**: ₹1,999 (one-time)
- **Pro**: ₹699/month
- **Premium**: ₹1,499/month

## 🤖 Automation Workflows (n8n)

- **Workflow A**: Signup → Provision trial subdomain
- **Workflow B**: Razorpay webhook → Update subscription
- **Workflow C**: Admin approval → Toggle coming_soon flag

See [services/n8n-workflows/](./services/n8n-workflows/) for JSON exports.

## 🚀 Deployment

```bash
# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
# Configure custom domain in Cloudflare
```

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed steps.

## 📖 Documentation

- **[SETUP.md](./docs/SETUP.md)** — Service setup guide
- **[API.md](./docs/API.md)** — API reference
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** — Deployment guide

## 📄 License

MIT License

---

**Built with ❤️ by the Aariyatech Team**
