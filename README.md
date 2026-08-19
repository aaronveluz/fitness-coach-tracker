# Enterprise Full-Stack Boilerplate

> **Last Updated:** (auto-updated on every commit)
>
> A production-ready, multipurpose, reusable foundation for enterprise business applications.
> Built with React + Vite, Node.js + Express, and MariaDB.

---

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ and npm 9+
- Docker Desktop (for MariaDB + Redis)
- Git

### 1. Clone and Install
```bash
git clone <your-repo-url> my-app
cd my-app
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env — fill in your DB password and generate JWT secrets:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Start the Database
```bash
docker-compose up -d
# This starts MariaDB, Redis, and Adminer (DB GUI at http://localhost:8080)
```

### 4. Run Database Migrations and Seeds
```bash
npm run db:migrate   # creates all tables
npm run db:seed      # adds default roles, permissions, and admin user
```

### 5. Start Development Servers
```bash
npm run dev
# Backend:  http://localhost:4000
# Frontend: http://localhost:5173
# API Docs: http://localhost:4000/api/docs
# DB GUI:   http://localhost:8080
```

### Default Login
- **Email:** `admin@example.com`
- **Password:** `Admin@1234`
- ⚠️ Change this immediately!

---

## What's Included

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + Vite + TypeScript | UI, routing, forms |
| State | Zustand | Global state management |
| Data Fetching | TanStack Query | Server state, caching |
| Backend | Node.js + Express + TypeScript | REST API |
| Database | MariaDB + Sequelize | Data persistence |
| Auth | JWT + Refresh Tokens | Authentication |
| Access Control | RBAC | Permission-based authorization |
| Validation | Zod (shared) | Frontend forms + backend API validation |
| Logging | Pino | Structured JSON logging |
| API Docs | Swagger UI | Auto-generated at `/api/docs` |
| Dev Stack | Docker Compose | MariaDB + Redis + Adminer |

---

## Project Structure

```
/
├── frontend/          React + Vite app
│   └── src/
│       ├── core/      Shared components, API client, layout
│       ├── features/  Business modules (auth, users, reports...)
│       └── app/       Router, providers, global store
├── backend/           Node.js + Express app
│   └── src/
│       ├── config/    Database, env, swagger
│       ├── core/      Middleware, base classes, utilities
│       └── modules/   Business modules (auth, users, reports...)
├── shared/            Zod schemas + TypeScript types (used by both)
├── database/          Migrations + seeders
├── docs/              Auto-maintained documentation
└── scripts/           Dev utilities + auto-doc updater
```

---

## Key Commands

| Command | Description |
|---|---|
| `npm run dev` | Start frontend + backend in dev mode |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed default data |
| `npm run db:reset` | Reset database (undo + migrate + seed) |
| `npm run lint` | Lint all workspaces |
| `npm run typecheck` | TypeScript check all workspaces |
| `npm run test` | Run all tests |
| `docker-compose up -d` | Start MariaDB + Redis + Adminer |

---

## Documentation

All docs are in `/docs/` and **auto-update on every git commit**:

| Document | Description |
|---|---|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, data flow, folder structure |
| [AI_AGENT_RULES.md](docs/AI_AGENT_RULES.md) | Rules for developers and AI agents |
| [MODULE_CREATION_GUIDE.md](docs/MODULE_CREATION_GUIDE.md) | How to add a new module in 5 steps |
| [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common issues and fixes |
| [CHANGELOG.md](docs/CHANGELOG.md) | Full change history |
| [RELEASE_NOTES.md](docs/RELEASE_NOTES.md) | Latest release summary |

---

## Built-in Roles

| Role | Access |
|---|---|
| `super_admin` | Everything |
| `admin` | Manage users and settings |
| `manager` | View reports, manage staff |
| `staff` | Day-to-day operations |
| `viewer` | Read-only |

---

## Implementation Phases

- [x] **Phase 1** — Foundation (this release)
- [ ] **Phase 2** — Auth & RBAC (JWT login, refresh, logout, protected routes)
- [ ] **Phase 3** — Reusable CRUD Engine (Users module, DataTable, forms)
- [ ] **Phase 4** — Reporting Framework (ReportBuilder, CSV/Excel/PDF export)
- [ ] **Phase 5** — Sample Business Module (fully copyable template)
- [ ] **Phase 6** — Testing & DevOps (CI/CD, Vitest, Playwright)
