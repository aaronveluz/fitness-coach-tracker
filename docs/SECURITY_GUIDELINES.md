# Security Guidelines

> **Last Updated:** (auto-updated on every commit)
>
> Security is not optional. Follow these rules on every feature, not just "security features."

---

## Authentication Flow

```
1. User submits email + password to POST /api/v1/auth/login

2. Backend:
   a. Loads user by email (case-insensitive)
   b. Verifies password with bcrypt.compare() — NEVER store plaintext passwords
   c. Loads user's role + all permissions from DB
   d. Issues JWT access token (15 min expiry) containing: userId, email, roleId, permissions[]
   e. Issues JWT refresh token (7 days) — stored HASHED in refresh_tokens table
   f. Sends access token in response body
   g. Sends refresh token as HttpOnly Secure cookie (not accessible from JavaScript)

3. Frontend:
   a. Stores access token in localStorage (or memory — see note below)
   b. Attaches to every request: Authorization: Bearer <token>
   c. When access token expires (401 response): automatically calls POST /api/v1/auth/refresh
   d. Refresh endpoint verifies the cookie, issues new tokens, revokes old refresh token

4. Logout:
   a. Backend marks refresh_token as revoked in DB
   b. Frontend clears localStorage + Zustand state
```

> **Note on token storage:** Storing access tokens in `localStorage` is simpler but vulnerable to XSS. For high-security apps, store in memory (Zustand only, not persisted) and use the HttpOnly refresh cookie to re-issue on page load.

---

## Password Security

```typescript
// ✅ Always hash with bcrypt, minimum 12 rounds
const hash = await bcrypt.hash(password, 12);

// ✅ Verify safely
const isValid = await bcrypt.compare(inputPassword, storedHash);

// ❌ NEVER
const hash = md5(password);           // weak, cracked instantly
const hash = sha256(password);        // no salt, rainbow table vulnerable
const stored = password;              // plaintext — firing offense
```

---

## SQL Injection Prevention

```typescript
// ✅ Always use Sequelize parameterized queries
await Product.findAll({ where: { name: userInput } });
await sequelize.query('SELECT * FROM products WHERE id = :id', {
  replacements: { id: req.params.id },
});

// ❌ NEVER interpolate user input into SQL
await sequelize.query(`SELECT * FROM products WHERE name = '${userInput}'`);
```

---

## Input Validation

**Every API endpoint that accepts input MUST use the `validate()` middleware.**

```typescript
// ✅ Required on every POST/PUT/PATCH route
router.post('/',
  authenticate,
  authorize('products.create'),
  validate({ body: createProductSchema }),   // ← MANDATORY
  productController.create,
);

// The Zod schema is defined in /shared — same schema validates frontend forms
```

---

## RBAC — Role-Based Access Control

### How permissions work

```
users table → role_id → roles table
roles table → role_permissions → permissions table
permissions table → key column (e.g. 'products.create')
```

At login, the user's full permission list is loaded and embedded in the JWT. On each request, the `authorize()` middleware checks the permission key against `req.user.permissions[]`.

### Protecting a backend route

```typescript
router.delete('/:id',
  authenticate,              // must be logged in
  authorize('products.delete'),  // must have 'products.delete' permission
  productController.delete,
);
```

### Protecting a frontend UI element

```tsx
// Using PermissionGate (Phase 3 component):
<PermissionGate permission="products.delete">
  <button onClick={handleDelete}>Delete</button>
</PermissionGate>

// Using the hook directly:
const { hasPermission } = useAuthStore();
if (hasPermission('products.delete')) { ... }
```

### RBAC is dual-enforced
Permission checks happen on **both** frontend (hide UI) and backend (block API).
Never rely on frontend hiding alone — the backend is the security boundary.

---

## HTTP Security Headers

Helmet is configured in `backend/src/app.ts`. Key headers it sets:

| Header | Protection |
|---|---|
| `X-Content-Type-Options: nosniff` | Prevents MIME type sniffing |
| `X-Frame-Options: DENY` | Prevents clickjacking |
| `X-XSS-Protection: 1; mode=block` | Browser XSS filter |
| `Strict-Transport-Security` | Forces HTTPS (production only) |
| `Content-Security-Policy` | Controls allowed content sources |

For custom CSP configuration, update the `helmet()` call in `app.ts`:
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));
```

---

## Error Handling Security

```typescript
// ✅ Internal error — log everything, return nothing sensitive
logger.error({ err, path: req.path }, 'Unexpected database error');
res.status(500).json({ success: false, message: 'An unexpected error occurred.' });

// ❌ NEVER expose internal details
res.status(500).json({
  error: err.message,     // may contain SQL, file paths, secrets
  stack: err.stack,       // full stack trace exposed to attacker
});
```

---

## Environment Security

```bash
# ✅ Secrets go only in .env (gitignored)
JWT_ACCESS_SECRET=<64-char random hex>

# ✅ Generate secrets properly:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# ❌ NEVER hardcode secrets in source code
const SECRET = 'mysecret123';  // commit this and you're fired
```

**Pre-commit check:** A Husky hook runs `npm run lint` before every commit. If you accidentally add a secret pattern, consider adding `git-secrets` or `detect-secrets` to the pre-commit hook.

---

## Rate Limiting

Two limiters are configured (see `core/middleware/rateLimiter.ts`):
- **Auth endpoints** (`/api/v1/auth/*`): 10 requests/minute — brute force protection
- **All API endpoints**: 100 requests/minute (configurable via `RATE_LIMIT_MAX` env var)

> **Production note:** The default `express-rate-limit` store is in-memory. In a multi-instance deployment, use the Redis store:
> ```typescript
> import { RedisStore } from 'rate-limit-redis';
> // (add to rateLimiter.ts when deploying multiple instances)
> ```

---

## Production Security Checklist

Before deploying:
- [ ] `NODE_ENV=production` is set
- [ ] JWT secrets are 64+ random hex characters (not dev secrets)
- [ ] `CORS_ORIGIN` is set to your exact frontend domain (not wildcard)
- [ ] Database user has minimum required privileges (not root)
- [ ] HTTPS is configured on your reverse proxy (Nginx/Caddy)
- [ ] `DB_PASSWORD` is a strong random password
- [ ] `admin@example.com` default password has been changed
- [ ] Logs are being collected and monitored
- [ ] Database backups are running and tested
- [ ] Firewall blocks direct access to MariaDB port (3306) from internet
