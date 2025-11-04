# Portfolio Builder API Documentation

## Base URL

```
https://brand.com/api
```

For local development:
```
http://localhost:3000/api
```

## Authentication

### User Authentication

All protected endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

Tokens are obtained via the signup or login endpoints and stored in HTTP-only cookies.

### Admin Authentication

Admin endpoints require the user to have the `admin` or `super_admin` role. This is validated via Supabase RLS policies.

## Public Endpoints

### 1. Signup

Create a new user account and initiate free trial.

**Endpoint**: `POST /auth/signup`

**Request Body**:
```json
{
  "email": "alice@example.com",
  "username": "alice",
  "fullName": "Alice Smith"
}
```

**Validation**:
- Email must be valid and unique
- Username must be 3-30 characters, lowercase letters and numbers only
- Username must be unique

**Response** (201):
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "alice@example.com",
    "username": "alice"
  },
  "site": {
    "id": "uuid",
    "username": "alice",
    "previewToken": "token",
    "launchTime": "2025-10-31T12:00:00Z"
  },
  "message": "Signup successful! Your free trial has started."
}
```

**Error Responses**:
- `400` - Invalid input
- `409` - Email or username already exists
- `429` - Too many signup attempts (rate limited)
- `500` - Server error

---

### 2. Login

Authenticate user and return JWT token.

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "alice@example.com",
  "password": "securepassword"
}
```

**Response** (200):
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "alice@example.com",
    "username": "alice"
  },
  "token": "jwt_token"
}
```

---

### 3. Get Themes

Retrieve all available themes.

**Endpoint**: `GET /themes`

**Response** (200):
```json
{
  "success": true,
  "themes": [
    {
      "id": 1,
      "slug": "minimal-creative",
      "name": "Minimal Creative",
      "description": "Clean, whitespace-driven for designers",
      "demoUrl": "/themes/minimal-creative/demo",
      "previewImageUrl": "https://..."
    },
    ...
  ]
}
```

---

### 4. Get Theme by Slug

Retrieve a specific theme details.

**Endpoint**: `GET /themes/:slug`

**Response** (200):
```json
{
  "success": true,
  "theme": {
    "id": 1,
    "slug": "minimal-creative",
    "name": "Minimal Creative",
    "description": "Clean, whitespace-driven for designers",
    "demoUrl": "/themes/minimal-creative/demo",
    "previewImageUrl": "https://..."
  }
}
```

---

### 5. Get Image Library

Retrieve predefined images for a theme.

**Endpoint**: `GET /images/library?themeId=1&category=hero`

**Query Parameters**:
- `themeId` (optional) - Filter by theme
- `category` (optional) - Filter by category (hero, gallery, testimonial, etc.)

**Response** (200):
```json
{
  "success": true,
  "images": [
    {
      "id": "uuid",
      "themeId": 1,
      "url": "https://cloudinary.com/...",
      "altText": "Hero image 1",
      "category": "hero"
    },
    ...
  ]
}
```

---

### 6. Preview Site

View a site without authentication using preview token.

**Endpoint**: `GET /preview/:token`

**Response** (200):
```html
<!-- Rendered HTML of the site -->
```

---

## Protected User Endpoints

### 1. Get User Dashboard Data

Retrieve user's site and account information.

**Endpoint**: `GET /dashboard/site`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "success": true,
  "site": {
    "id": "uuid",
    "username": "alice",
    "theme_slug": "minimal-creative",
    "palette_id": "pastel-pop",
    "status": "pending",
    "coming_soon": true,
    "launch_time": "2025-10-31T12:00:00Z",
    "content": {
      "headline": "Alice's Portfolio",
      "bio": "Designer and creator"
    },
    "images": ["image-id-1", "image-id-2"]
  }
}
```

---

### 2. Update Site Content

Update site content (headline, bio, services, social links).

**Endpoint**: `PUT /dashboard/site`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "headline": "Updated Headline",
  "bio": "Updated bio text",
  "services": ["Design", "Development"],
  "socialLinks": [
    {
      "platform": "Instagram",
      "url": "https://instagram.com/alice"
    }
  ]
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Site updated successfully"
}
```

---

### 3. Choose Theme and Palette

Update site theme and color palette.

**Endpoint**: `POST /dashboard/theme`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "themeSlug": "bold-portfolio",
  "paletteId": "vibrant-sunset"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Theme updated successfully"
}
```

---

### 4. Get Analytics

View basic visitor statistics.

**Endpoint**: `GET /dashboard/analytics?period=7d`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `period` - Time period (1d, 7d, 30d, all)

**Response** (200):
```json
{
  "success": true,
  "analytics": {
    "totalVisitors": 150,
    "uniqueVisitors": 120,
    "pageViews": 250,
    "bounceRate": 35.2,
    "avgSessionDuration": 120,
    "topPages": [
      {
        "path": "/",
        "views": 100
      }
    ]
  }
}
```

---

### 5. Initiate Upgrade

Start the upgrade process to a paid plan.

**Endpoint**: `POST /dashboard/upgrade`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "planSlug": "pro"
}
```

**Response** (200):
```json
{
  "success": true,
  "razorpayOrderId": "order_123456",
  "amount": 69900,
  "currency": "INR"
}
```

---

### 6. Request Custom Domain

Request a custom domain for the site.

**Endpoint**: `POST /dashboard/domain/request`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "domain": "alice.com"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Domain request submitted for admin review"
}
```

---

## Protected Admin Endpoints

### 1. Get Pending Sites

List all pending sites for review.

**Endpoint**: `GET /admin/sites?status=pending&limit=10&offset=0`

**Headers**: `Authorization: Bearer <admin_token>`

**Query Parameters**:
- `status` - Filter by status (pending, approved, rejected, expired, all)
- `limit` - Number of results (default: 10)
- `offset` - Pagination offset (default: 0)

**Response** (200):
```json
{
  "success": true,
  "sites": [
    {
      "id": "uuid",
      "username": "alice",
      "theme_slug": "minimal-creative",
      "status": "pending",
      "coming_soon": true,
      "created_at": "2025-10-30T10:00:00Z",
      "user": {
        "email": "alice@example.com",
        "full_name": "Alice Smith"
      }
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 10,
    "offset": 0,
    "pages": 5
  }
}
```

---

### 2. Get Site Details

Retrieve full details of a specific site.

**Endpoint**: `GET /admin/sites/:id`

**Headers**: `Authorization: Bearer <admin_token>`

**Response** (200):
```json
{
  "success": true,
  "site": {
    "id": "uuid",
    "user_id": "uuid",
    "username": "alice",
    "theme_slug": "minimal-creative",
    "palette_id": "pastel-pop",
    "status": "pending",
    "coming_soon": true,
    "launch_time": "2025-10-31T12:00:00Z",
    "content": {
      "headline": "Alice's Portfolio",
      "bio": "Designer and creator"
    },
    "images": ["image-id-1"],
    "created_at": "2025-10-30T10:00:00Z",
    "updated_at": "2025-10-30T10:00:00Z",
    "user": {
      "email": "alice@example.com",
      "full_name": "Alice Smith"
    }
  }
}
```

---

### 3. Approve Site

Approve a pending site and make it fully live.

**Endpoint**: `POST /admin/sites/:id/approve`

**Headers**: `Authorization: Bearer <admin_token>`

**Request Body**:
```json
{
  "comment": "Looks great! Approved."
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Site approved successfully",
  "site": {
    "id": "uuid",
    "username": "alice",
    "status": "approved",
    "coming_soon": false
  }
}
```

---

### 4. Request Changes

Request changes from the user before approval.

**Endpoint**: `POST /admin/sites/:id/request-changes`

**Headers**: `Authorization: Bearer <admin_token>`

**Request Body**:
```json
{
  "comment": "Please update the bio section with more details about your services."
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Change request sent to user"
}
```

---

### 5. Reject Site

Reject a site submission.

**Endpoint**: `POST /admin/sites/:id/reject`

**Headers**: `Authorization: Bearer <admin_token>`

**Request Body**:
```json
{
  "reason": "Content does not meet community guidelines"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Site rejected"
}
```

---

### 6. Get All Users

List all users with filters.

**Endpoint**: `GET /admin/users?role=user&limit=10&offset=0`

**Headers**: `Authorization: Bearer <admin_token>`

**Query Parameters**:
- `role` - Filter by role (user, admin, super_admin)
- `limit` - Number of results
- `offset` - Pagination offset

**Response** (200):
```json
{
  "success": true,
  "users": [
    {
      "id": "uuid",
      "email": "alice@example.com",
      "username": "alice",
      "full_name": "Alice Smith",
      "role": "user",
      "created_at": "2025-10-30T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 10,
    "offset": 0,
    "pages": 15
  }
}
```

---

### 7. Send Broadcast Email

Send promotional or informational email to all users.

**Endpoint**: `POST /admin/broadcast`

**Headers**: `Authorization: Bearer <admin_token>`

**Request Body**:
```json
{
  "subject": "Limited Time Offer: 50% Off Pro Plan",
  "htmlBody": "<h1>Special Offer</h1><p>Get 50% off Pro plan this month only!</p>",
  "targetRole": "user"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Email sent to 150 users"
}
```

---

## Webhook Endpoints

### 1. Razorpay Webhook

Handle Razorpay payment events.

**Endpoint**: `POST /webhooks/razorpay`

**Headers**:
- `x-razorpay-signature` - Signature for verification

**Payload** (example):
```json
{
  "event": "subscription.activated",
  "payload": {
    "subscription": {
      "entity": {
        "id": "sub_123456",
        "plan_id": "plan_123"
      }
    }
  }
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Webhook processed"
}
```

---

### 2. n8n Signup Webhook

Triggered by n8n when user signs up.

**Endpoint**: `POST /webhooks/signup`

**Payload**:
```json
{
  "user_id": "uuid",
  "email": "alice@example.com",
  "username": "alice",
  "full_name": "Alice Smith"
}
```

---

### 3. n8n Approval Webhook

Triggered by n8n when admin approves a site.

**Endpoint**: `POST /webhooks/approval`

**Payload**:
```json
{
  "site_id": "uuid",
  "admin_id": "uuid",
  "comment": "Approved"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_INPUT` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | User does not have permission |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

---

## Rate Limiting

- **Signup endpoint**: 5 requests per 15 minutes per IP
- **Login endpoint**: 10 requests per 15 minutes per IP
- **API endpoints**: 100 requests per minute per user

---

## Postman Collection

A complete Postman collection is available at `/docs/postman-collection.json`.

Import it into Postman:
1. Open Postman
2. Click "Import"
3. Select the JSON file
4. Set environment variables (API URL, token, etc.)
5. Start testing!

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://brand.com/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get user's site
const { data } = await api.get('/dashboard/site');

// Update site content
await api.put('/dashboard/site', {
  headline: 'New Headline',
  bio: 'Updated bio'
});
```

### Python

```python
import requests

headers = {
    'Authorization': f'Bearer {token}'
}

# Get user's site
response = requests.get(
    'https://brand.com/api/dashboard/site',
    headers=headers
)
site = response.json()

# Update site content
requests.put(
    'https://brand.com/api/dashboard/site',
    headers=headers,
    json={
        'headline': 'New Headline',
        'bio': 'Updated bio'
    }
)
```

---

## Support

For API support and questions:
- Email: api-support@brand.com
- Docs: https://docs.brand.com
- GitHub Issues: https://github.com/Vmit2/website-builder/issues
