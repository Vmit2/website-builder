# Changelog

All notable changes to At-Solvexx will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-10-31

### Added

#### Core Features
- Multi-tenant SaaS architecture with subdomain-based routing
- User signup with email/password authentication via Supabase
- 24-hour free trial with countdown timer
- Coming-Soon landing page with user content
- Admin approval system for site review
- Theme selection with 10+ pre-built themes
- Color palette customization (5 palettes per theme)
- User dashboard with site management
- Admin dashboard for reviewing pending sites

#### API Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/themes` - List available themes
- `GET /api/themes/:slug` - Get theme details
- `GET /api/images/library` - Get image library
- `GET /api/dashboard/site` - Get user's site
- `PUT /api/dashboard/site` - Update site content
- `POST /api/dashboard/theme` - Choose theme
- `GET /api/dashboard/analytics` - View analytics
- `POST /api/dashboard/upgrade` - Initiate payment
- `GET /api/admin/sites` - List pending sites
- `GET /api/admin/sites/:id` - Get site details
- `POST /api/admin/sites/:id/approve` - Approve site
- `POST /api/admin/request-changes` - Request changes
- `POST /api/admin/reject` - Reject site
- `GET /api/admin/users` - List users
- `POST /api/admin/broadcast` - Send emails
- `POST /api/webhooks/razorpay` - Payment webhook

#### Components
- Theme components (minimal-creative, bold-portfolio, tech-personal)
- Admin dashboard UI
- User dashboard UI
- Theme selector with palette picker
- Site preview component

#### Database
- PostgreSQL schema with 8 core tables
- Row-level security policies
- Audit logging for all actions
- Support for multi-tenant data isolation

#### Integrations
- Supabase for database and authentication
- Razorpay for payment processing
- Cloudflare for DNS and CDN
- Resend for email delivery
- n8n for workflow automation

#### Testing
- Jest configuration for unit tests
- Test stubs for API endpoints
- Test stubs for components
- Playwright configuration for E2E tests

#### CI/CD
- GitHub Actions workflow for linting and testing
- GitHub Actions workflow for Vercel deployment
- ESLint and TypeScript configuration

#### Documentation
- Comprehensive README with quick start
- QUICKSTART guide (5-minute setup)
- SETUP guide with detailed service configuration
- API documentation with examples and Postman collection
- DEPLOYMENT guide for production
- ARCHITECTURE document explaining system design
- CONTRIBUTING guide for developers
- Database schema documentation

#### Development Tools
- Next.js 16 with TypeScript
- Tailwind CSS for styling
- Monorepo structure with npm workspaces
- Environment configuration templates
- Git workflow documentation

### Known Limitations

- Image upload disabled during freemium (library only)
- Theme switching limited to 1 free switch during trial
- Custom domain requires manual admin approval
- Email provisioning requires manual setup
- Static export not automated
- Analytics limited to basic visitor count
- Blogging not included in MVP
- SEO tools limited to basics

### Technical Details

- **Framework**: Next.js 16.0.1
- **Language**: TypeScript 5.3.3
- **Styling**: Tailwind CSS 4.0
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Payments**: Razorpay API
- **Email**: Resend API
- **DNS/CDN**: Cloudflare API
- **Automation**: n8n
- **Deployment**: Vercel
- **Testing**: Jest + Playwright
- **CI/CD**: GitHub Actions

### Migration Guide

N/A - Initial release

### Contributors

- Aariyatech Team

---

## Unreleased

### Planned for Phase 2

- [ ] Custom domain support with automatic DNS setup
- [ ] Advanced analytics (heatmaps, session recordings)
- [ ] Email provisioning automation (Zoho/Google Workspace)
- [ ] Blogging platform with CMS
- [ ] Content management system
- [ ] SEO optimization tools
- [ ] Social media integration
- [ ] Email marketing integration
- [ ] Portfolio item management
- [ ] Client testimonials section

### Planned for Phase 3

- [ ] AI-powered content suggestions
- [ ] Template marketplace
- [ ] White-label solution
- [ ] Third-party API integrations
- [ ] Mobile app (iOS/Android)
- [ ] Offline mode
- [ ] Advanced security features
- [ ] Enterprise features

---

## Version History

### 0.1.0 (Current)
Initial MVP release with core features for portfolio creation, theme selection, admin approval, and payment integration.

---

## How to Report Issues

Please use GitHub Issues to report bugs and request features:
- https://github.com/Vmit2/website-builder/issues

## How to Contribute

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

## License

MIT License - See LICENSE file for details

---

**Last Updated**: October 2025
