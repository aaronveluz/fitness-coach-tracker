# Production Deployment and Testing Guide

This guide details how to deploy the application in production environments and configure testing frameworks for continuous validation.

---

## 🚀 Production Deployment Options

There are two primary methods for deploying the enterprise boilerplate in production: **Containerized (Docker)** and **Process Managed (PM2 + Nginx)**.

### Option A: Docker Deployment (Recommended)

This method packages the backend and frontend into self-contained container images, running alongside MariaDB and Redis.

#### 1. Configure production environment
Ensure your root `.env` is configured for production:
```env
NODE_ENV=production
DB_HOST=mariadb   # Docker network link
DB_PORT=3306
DB_NAME=enterprise_db
DB_USER=root
DB_PASSWORD=your_highly_secure_db_password
JWT_ACCESS_SECRET=your_secure_64_character_hex_access_token_secret
JWT_REFRESH_SECRET=your_secure_64_character_hex_refresh_token_secret
CORS_ORIGIN=https://your-domain.com
```

#### 2. Deploy using Docker Compose
We supply a multi-stage `docker-compose.yml` for database services. For full app containment, compile and run the backend/frontend containers.

```bash
# Start container database services in detached mode
docker-compose up -d mariadb redis

# Check status of running containers
docker-compose ps
```

---

### Option B: PM2 & Nginx Deployment (Manual)

Used for traditional Linux/Windows server deployments. PM2 runs the Node process in the background, and Nginx serves frontend static assets and proxies API calls.

#### 1. Install PM2 Globally
```bash
npm install -g pm2
```

#### 2. Build the Monorepo Workspaces
Before starting processes, build all workspaces to generate transpiled Javascript bundles:
```bash
# Runs tsc in shared/backend and tsc + vite build in frontend
npm run build
```

#### 3. Start Backend with PM2
Create a PM2 process file `ecosystem.config.js` at the root:
```javascript
module.exports = {
  apps: [
    {
      name: 'enterprise-backend',
      script: './backend/dist/server.js',
      instances: 'max',  // scales across all CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

Run backend process:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 4. Configure Nginx
Nginx should serve the built frontend assets from `frontend/dist` and proxy `/api` endpoints to PM2.

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Static frontend assets
    location / {
        root /var/www/html/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend Node server
    location /api {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🧪 Testing Guide

The monorepo uses **Vitest** for testing backend and frontend files.

### 1. Running Unit & Integration Tests

To run tests locally:
```bash
# Run tests across all workspaces
npm run test

# Run tests with a watch loop during development
npm run test -- --watch
```

### 2. Testing API Endpoints

We use **Swagger OpenAPIs** for interactive API testing.

1. Start development servers:
   ```bash
   npm run dev
   ```
2. Navigate to: `http://localhost:4000/api/docs`
3. Click **"Authorize"** at the top right:
   - Provide standard JSON Web Token: `Bearer <your_token>`
4. Test endpoints directly inside the browser.

To obtain a token manually via `curl`:
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@1234"}'
```

### 3. Verifying Database Backups
Test your backup redundancy infrastructure to guarantee database restores.

```bash
# Execute a test run of the backup script
node scripts/backup-database.js

# Verify the backup directory exists and has the gzipped SQL file
ls backups/db/
```
