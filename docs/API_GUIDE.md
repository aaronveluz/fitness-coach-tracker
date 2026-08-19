# API Guide

> **Last Updated:** (auto-updated on every commit)
>
> All API endpoints follow these conventions. The interactive API explorer is at **http://localhost:4000/api/docs** (Swagger UI, dev only).

---

## Base URL

```
Development:  http://localhost:4000/api/v1
Production:   https://yourdomain.com/api/v1
```

---

## Authentication

All protected endpoints require a JWT Bearer token:

```http
Authorization: Bearer <your-access-token>
```

**Getting a token:**
```http
POST /api/v1/auth/login
Content-Type: application/json

{ "email": "admin@example.com", "password": "Admin@1234" }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": 1, "email": "admin@example.com", "role": "super_admin" }
  }
}
```

**When the access token expires (15 min):**
```http
POST /api/v1/auth/refresh
(No body needed — the refresh token is sent automatically via HttpOnly cookie)
```

---

## Standard Response Format

**Every endpoint** returns this exact shape — no exceptions:

```json
{
  "success": true | false,
  "data":    <your result data>,
  "message": "Optional human-readable message",
  "errors":  { "fieldName": ["Error message"] },  // on validation failure
  "meta":    {                                      // on paginated list responses
    "page": 1,
    "pageSize": 20,
    "totalItems": 85,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### HTTP Status Codes Used

| Code | Meaning |
|---|---|
| `200` | Success — data returned |
| `201` | Created — new resource created |
| `204` | Success — no content (e.g. DELETE) |
| `400` | Bad Request — malformed request |
| `401` | Unauthorized — not logged in or token expired |
| `403` | Forbidden — logged in but lacks permission |
| `404` | Not Found — resource doesn't exist |
| `409` | Conflict — duplicate (e.g. duplicate SKU) |
| `422` | Unprocessable — Zod validation failed (see `errors` field) |
| `500` | Internal Server Error — bug, check server logs |

---

## Pagination

All list endpoints support these query parameters:

```
GET /api/v1/products?page=2&pageSize=20&search=apple&sortBy=name&sortOrder=asc&isActive=true
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number (1-indexed) |
| `pageSize` | number | `20` | Items per page (max: 100) |
| `search` | string | — | Search term (searched on configured columns) |
| `sortBy` | string | `created_at` | Column to sort by |
| `sortOrder` | `asc` \| `desc` | `asc` | Sort direction |
| `isActive` | boolean | — | Filter by active/inactive status |

---

## CRUD Endpoints (Standard Pattern)

Every module follows the same URL and method pattern:

```http
GET    /api/v1/{module}          → list (paginated)
GET    /api/v1/{module}/:id      → single record
POST   /api/v1/{module}          → create
PUT    /api/v1/{module}/:id      → full update
PATCH  /api/v1/{module}/:id      → partial update
DELETE /api/v1/{module}/:id      → soft delete (is_active = 0)
GET    /api/v1/{module}/export   → export (CSV or Excel)
```

---

## Error Responses

### Validation Error (422)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Please enter a valid email address"],
    "price": ["Expected number, received string"]
  }
}
```

### Auth Error (401)
```json
{
  "success": false,
  "message": "Invalid or expired session. Please log in again."
}
```

### Permission Error (403)
```json
{
  "success": false,
  "message": "You do not have permission to perform this action."
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Record with ID 42 not found."
}
```

---

## Swagger / OpenAPI

API documentation is auto-generated from JSDoc comments on route files.

**Adding Swagger docs to a new route:**
```typescript
/**
 * @swagger
 * /products:
 *   get:
 *     summary: List all products (paginated)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated list of products
 */
router.get('/', authenticate, validate({ query: paginationSchema }), productController.getAll);
```

---

## Health Check

```http
GET /health
```

```json
{
  "status": "ok",
  "appName": "EnterpriseApp",
  "environment": "development",
  "timestamp": "2026-07-12T15:00:00.000Z"
}
```

This endpoint is public (no auth required). Use it for:
- Docker health checks
- Load balancer health probes
- Uptime monitoring services
