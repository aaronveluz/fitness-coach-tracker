# Troubleshooting Guide

> **Last Updated:** 2026-07-12T16:17:40.398Z (commit `manual`)
>
> This guide is auto-maintained. New issues and solutions are added here as they are discovered.

---

## Quick Diagnostics

Before searching this guide, run:
```bash
# Check server health
curl http://localhost:4000/health

# Check logs
npm run dev --workspace=backend   # watch the colored Pino output

# Check DB connection
docker ps   # is mariadb container running?
docker logs boilerplate_db --tail=20
```

---

## Startup Issues

### ❌ Server exits immediately with "Invalid environment variables"

**Cause:** Missing or invalid `.env` file.

**Fix:**
```bash
# Copy the example file
cp .env.example .env
# Fill in your values — especially:
#   DB_PASSWORD, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
# Secrets must be at least 32 characters
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### ❌ "Unable to connect to the database"

**Cause:** MariaDB is not running, or DB credentials are wrong.

**Fix:**
```bash
# Option 1: Start with Docker
docker-compose up -d mariadb

# Option 2: Check your local MariaDB
# Verify DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in your .env

# Test connection manually
mysql -h 127.0.0.1 -u root -p
```

---

### ❌ Frontend can't reach the backend (CORS error)

**Cause:** `CORS_ORIGIN` in `.env` doesn't match your frontend URL.

**Fix:**
```
# In .env:
CORS_ORIGIN=http://localhost:5173

# If you changed the Vite port, update this to match.
```

---

## Auth Issues

### ❌ "Invalid or expired session" after a short time

**Cause:** Access token expired (default: 15 minutes). The frontend must use the refresh endpoint.

**Fix:** The frontend's Axios interceptor in `core/api/client.ts` should automatically call `/api/v1/auth/refresh` when it receives a 401. If not configured, verify the interceptor is set up.

---

### ❌ "You do not have permission" even with admin account

**Cause:** The user's permissions weren't seeded correctly, or the JWT was issued before the permission was added.

**Fix:**
```bash
# Re-run seeders
npm run db:seed:undo --workspace=backend
npm run db:seed --workspace=backend
# Then log out and log back in to get a fresh JWT with updated permissions
```

---

## Database Issues

### ❌ Migration fails: "Table already exists"

**Cause:** A previous migration partially ran.

**Fix:**
```bash
# Check which migrations ran
npx sequelize-cli db:migrate:status --workspace=backend

# Undo the last migration
npm run db:migrate:undo --workspace=backend

# Then re-run
npm run db:migrate --workspace=backend
```

---

### ❌ Sequelize association error on startup

**Cause:** A model is imported before its association is defined.

**Fix:** Ensure all models are imported in a central `models/index.ts` and associations are defined after all models are loaded.

---

## Docker Issues

### ❌ `docker-compose up` fails: port already in use

**Cause:** Another service is using port 3306 (MariaDB) or 6379 (Redis).

**Fix:**
```bash
# Find what's using port 3306
netstat -ano | findstr :3306

# Option: Change the host port in docker-compose.yml
ports:
  - "3307:3306"   # use 3307 instead
# Then update DB_PORT=3307 in your .env
```

---

## Documentation Issues

### ❌ `scripts/update-docs.js` fails to detect git info

**Cause:** Running in a directory that isn't a git repository yet.

**Fix:**
```bash
git init
git add .
git commit -m "initial commit"
# Now the script can read git history
```

---

## Performance Issues

### ❌ Slow API responses on list endpoints

**Cause:** Missing database indexes on filtered/sorted columns.

**Fix:**
1. Check the query in the repository — what columns are in `WHERE` and `ORDER BY`?
2. Add an index in a new migration:
```js
await qi.addIndex('your_table', ['column_name']);
```

---

## Getting Help

1. Check `docs/ARCHITECTURE.md` for system design context
2. Check `docs/AI_AGENT_RULES.md` for coding rules and patterns
3. Check `docs/CHANGELOG.md` for recent changes that might have caused a regression
4. Search the codebase: the error message from the global error handler is logged with full context via Pino
