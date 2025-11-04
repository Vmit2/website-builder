# System Architecture

## Overview

The Portfolio Builder is a **multi-tenant SaaS application** that enables users to create professional portfolio websites in minutes. The architecture is designed for scalability, security, and ease of deployment.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                          │
│  (Next.js Frontend + React Components)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Vercel (CDN + Edge)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js App (API Routes + SSR/SSG)                 │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │ Middleware: Subdomain → Tenant Routing        │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
    ┌────────┐  ┌────────┐  ┌─────────────┐
    │Supabase│  │Cloudify│  │Razorpay API│
    │(DB+Auth)  │(Images)│  │(Payments)   │
    └────────┘  └────────┘  └─────────────┘
        │
        ▼
    ┌────────────────────────┐
    │ PostgreSQL Database    │
    │ (Multi-tenant tables)  │
    └────────────────────────┘
        │
        ├─ users
        ├─ sites
        ├─ themes
        ├─ subscriptions
        └─ audit_logs
```

## Multi-Tenant Model

### Subdomain-Based Tenancy

Each user gets a unique subdomain: `username.brand.com`

**Routing Flow**:
1. User visits `alice.brand.com`
2. Middleware extracts subdomain: `alice`
3. Query database: `SELECT * FROM sites WHERE username = 'alice'`
4. Render user's site with their theme and content

**Benefits**:
- Simple URL structure
- Easy subdomain provisioning
- Automatic DNS via Cloudflare
- Scales to thousands of users

### Data Isolation

All tenant data is isolated at the database level:

```sql
-- User can only see their own site
SELECT * FROM sites WHERE user_id = auth.uid();

-- Admin can see all sites
SELECT * FROM sites WHERE role = 'admin';
```

## Component Architecture

### Frontend (Next.js)

```
apps/web/
├── app/
│   ├── (auth)/          # Login, signup pages
│   ├── (dashboard)/     # User dashboard
│   ├── admin/           # Admin panel
│   ├── themes/          # Theme demo pages
│   ├── api/             # API routes
│   ├── [subdomain]/     # Dynamic tenant routes
│   └── layout.tsx       # Root layout
├── components/
│   ├── themes/          # Theme components
│   ├── ui/              # Shared UI components
│   └── admin/           # Admin components
├── lib/
│   ├── db.ts            # Supabase client
│   ├── utils.ts         # Utilities
│   └── auth.ts          # Auth helpers
└── middleware.ts        # Subdomain routing
```

### Backend (API Routes)

All backend logic runs as Next.js API routes:

```
/api/
├── auth/
│   ├── signup           # Create user + site
│   └── login            # User authentication
├── themes/
│   ├── GET              # List themes
│   └── GET :slug        # Get theme details
├── dashboard/
│   ├── site             # Get/update site
│   ├── theme            # Choose theme
│   ├── analytics        # View stats
│   └── upgrade          # Initiate payment
├── admin/
│   ├── sites            # List pending sites
│   ├── sites/:id        # Get site details
│   ├── sites/:id/approve    # Approve site
│   └── broadcast        # Send emails
└── webhooks/
    ├── razorpay         # Payment events
    ├── signup           # n8n signup flow
    └── approval         # n8n approval flow
```

## Data Flow

### 1. Signup Flow

```
User fills signup form
    ↓
POST /api/auth/signup
    ↓
Validate username/email
    ↓
Create user in Supabase Auth
    ↓
Create site record in DB
    ↓
Trigger n8n workflow (webhook)
    ├─ Provision subdomain (Cloudflare)
    ├─ Send welcome email (Resend)
    └─ Schedule trial expiry
    ↓
Return preview token
    ↓
Redirect to dashboard
```

### 2. Admin Approval Flow

```
Admin views pending sites
    ↓
GET /api/admin/sites?status=pending
    ↓
Query DB for pending sites
    ↓
Admin clicks "Approve"
    ↓
POST /api/admin/sites/:id/approve
    ↓
Update sites.coming_soon = false
    ↓
Trigger n8n workflow
    ├─ Send approval email
    ├─ Optional: trigger static export
    └─ Log audit entry
    ↓
Site becomes fully live
```

### 3. Payment Flow

```
User clicks "Upgrade"
    ↓
POST /api/dashboard/upgrade
    ↓
Create Razorpay subscription
    ↓
Return order details
    ↓
Frontend opens Razorpay modal
    ↓
User completes payment
    ↓
Razorpay sends webhook
    ↓
POST /api/webhooks/razorpay
    ↓
Verify signature
    ↓
Update subscriptions table
    ↓
If admin approved → set coming_soon=false
    ↓
Send confirmation email
```

## Database Schema

### Core Tables

```
users
├── id (UUID)
├── email (unique)
├── username (unique)
├── role (user/admin/super_admin)
└── created_at

sites
├── id (UUID)
├── user_id (FK → users)
├── username (unique, subdomain)
├── theme_slug
├── status (pending/approved/rejected)
├── coming_soon (boolean)
├── content (JSONB)
├── images (JSONB array)
└── created_at

subscriptions
├── id (UUID)
├── site_id (FK → sites)
├── plan_id (FK → plans)
├── razorpay_subscription_id
├── status (active/paused/cancelled)
└── created_at

audit_logs
├── id (UUID)
├── user_id (FK → users)
├── action (string)
├── resource_type (string)
├── resource_id (string)
├── changes (JSONB)
└── created_at
```

### Query Patterns

**Get user's site**:
```sql
SELECT * FROM sites WHERE user_id = $1;
```

**Get pending sites for admin**:
```sql
SELECT s.*, u.email, u.full_name
FROM sites s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'pending'
ORDER BY s.created_at DESC;
```

**Get user's subscription**:
```sql
SELECT sub.*, p.name, p.price_cents
FROM subscriptions sub
JOIN plans p ON sub.plan_id = p.id
WHERE sub.site_id = $1;
```

## Authentication & Authorization

### User Authentication

1. **Signup**: Email + password → Supabase Auth
2. **Login**: Email + password → JWT token
3. **Token Storage**: HTTP-only cookie (secure)
4. **Session**: Validated on each request

### Authorization

**Role-Based Access Control (RBAC)**:

```
User:
  - View own site
  - Update own site
  - View own analytics
  - Upgrade subscription

Admin:
  - View all sites
  - Approve/reject sites
  - View all users
  - Send broadcast emails

Super Admin:
  - All admin permissions
  - Manage other admins
  - System configuration
```

**Row-Level Security (RLS)**:

All database access is controlled via Supabase RLS policies:

```sql
-- Users can only see their own data
CREATE POLICY "Users see own data" ON sites
  FOR SELECT USING (user_id = auth.uid());

-- Admins see all data
CREATE POLICY "Admins see all" ON sites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );
```

## External Services

### Supabase (Database + Auth)

- **PostgreSQL**: Multi-tenant data storage
- **Auth**: Email/password + OAuth
- **RLS**: Row-level security policies
- **Realtime**: Optional live updates

### Razorpay (Payments)

- **Subscriptions API**: Create/manage subscriptions
- **Webhooks**: Payment event notifications
- **Sandbox Mode**: Testing without real payments

### Cloudflare (DNS + CDN)

- **DNS Records**: CNAME for subdomains
- **API**: Programmatic DNS management
- **CDN**: Global content distribution
- **SSL/TLS**: Automatic certificate management

### Resend (Email)

- **Transactional Emails**: Welcome, approval, payment
- **Domain Verification**: SPF, DKIM, DMARC
- **Templates**: Pre-designed email templates

### n8n (Automation)

- **Workflows**: Signup, payment, approval flows
- **Webhooks**: Trigger workflows from app
- **Integrations**: Connect multiple services

## Deployment Architecture

### Development

```
Local Machine
├── Next.js dev server (port 3000)
├── Local Supabase (optional)
└── .env.local (secrets)
```

### Production

```
Vercel
├── Edge Functions (middleware)
├── Serverless Functions (API routes)
├── Static Assets (CDN)
└── Environment Variables (secrets)
    ↓
Supabase (Cloud)
├── PostgreSQL Database
├── Auth Service
└── Storage
    ↓
Cloudflare
├── DNS Records
└── CDN
    ↓
Razorpay
├── Payment Processing
└── Webhooks
```

## Scaling Considerations

### Horizontal Scaling

- **Stateless API**: Each request is independent
- **Database Pooling**: Connection pooling via Supabase
- **CDN**: Vercel edge network for global distribution

### Performance Optimization

- **Caching**: Browser cache + CDN cache
- **Image Optimization**: Cloudinary for responsive images
- **Database Indexes**: On frequently queried columns
- **Query Optimization**: Efficient SQL queries

### Security Measures

- **HTTPS**: All traffic encrypted
- **JWT Tokens**: Secure session management
- **RLS Policies**: Database-level access control
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Sanitize user input
- **CORS**: Restrict cross-origin requests

## Monitoring & Observability

### Logging

- **Application Logs**: Vercel logs
- **Database Logs**: Supabase logs
- **API Logs**: Request/response tracking

### Monitoring

- **Uptime**: Vercel status page
- **Performance**: Vercel Analytics
- **Errors**: Sentry (optional)
- **Database**: Supabase dashboard

### Metrics

- **User Signups**: Daily/weekly/monthly
- **Sites Created**: Total and active
- **Subscriptions**: Active, paused, cancelled
- **Payment Success Rate**: Razorpay metrics
- **API Response Time**: Performance tracking

## Future Enhancements

### Phase 2

- Custom domain support
- Advanced analytics (heatmaps, sessions)
- Email provisioning (Zoho/Google Workspace)
- Content management (blog, portfolio items)
- SEO optimization tools

### Phase 3

- AI-powered content suggestions
- Template marketplace
- White-label solution
- API for third-party integrations
- Mobile app

---

**Last Updated**: October 2025
