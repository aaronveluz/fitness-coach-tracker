# MASTER BOILERPLATE PROMPT
## Enterprise Full-Stack Boilerplate — React + Node.js + MariaDB
### Synthesized from prompt1–4 | Optimized for reuse, longevity, and AI-assisted development

---

## ROLE & OBJECTIVE

Act as a **Principal Software Architect**. Design and scaffold a **production-ready, enterprise-grade, multipurpose, reusable, scalable, and secure full-stack boilerplate** intended to serve as a cloneable foundation for multiple distinct business systems:

- POS, Inventory, ERP, Accounting, CRM, HR
- Reporting Dashboards, Integration Platforms

**This is not a single application.** It is a reusable platform/framework that must support:

- Adding new business modules without touching core code
- Adding new pages, routes, and API endpoints by dropping files in
- Adding new database tables via migrations
- Adding new reports with minimal boilerplate
- Adding new integrations via plug-in services

---

## TECHNOLOGY STACK (Locked)

### Frontend
| Layer | Technology |
|---|---|
| Framework | React (Vite) + TypeScript |
| Routing | React Router v7 |
| Data Fetching | TanStack Query (React Query) |
| Global State | Zustand (preferred over Redux for simplicity and longevity) |
| Forms | React Hook Form |
| Validation | Zod (schemas shared with backend via `/shared`) |
| Styling | Vanilla CSS custom design system (or optionally shadcn/ui) |
| Architecture | Feature-based modular |

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js (LTS) + TypeScript |
| Framework | Express.js |
| ORM | Sequelize (configured for MariaDB; native dialect support, mature, widely maintained) |
| Database | MariaDB |
| Auth | JWT access tokens + refresh token rotation |
| Validation | Zod (shared schemas from `/shared`) |
| Logging | Pino (structured, production-grade, low overhead) |
| API Docs | Swagger / OpenAPI (auto-generated from routes) |

> **ORM Rationale:** Sequelize is chosen over Prisma because it has native, battle-tested MariaDB dialect support, does not require Prisma Migrate's shadow database, and integrates cleanly with existing raw SQL when needed. It supports transactions, migrations, and seeding natively.

### Database
- MariaDB (primary)
- Parameterized queries only — no raw string interpolation
- Full migration and seed script support via Sequelize CLI

### DevOps / Developer Experience
- Docker + docker-compose (MariaDB + Node backend + Redis)
- ESLint + Prettier + strict TypeScript (shared config)
- Husky + lint-staged commit hooks
- GitHub Actions CI (lint → typecheck → test → build)
- Environment variable validation at startup (fail-fast)

---

## MONOREPO STRUCTURE

```
/                          ← Monorepo root
├── frontend/              ← React + Vite app
├── backend/               ← Node.js + Express app
├── shared/                ← Shared TypeScript types, Zod schemas, enums, DTOs
├── database/              ← Migrations, seed scripts, SQL helpers
├── docs/                  ← Architecture + developer guides
├── docker/                ← Dockerfiles for frontend and backend
├── scripts/               ← Dev utility scripts (db reset, seed, etc.)
├── .github/               ← GitHub Actions CI pipeline
├── docker-compose.yml
├── .env.example
└── package.json           ← Root workspace config (npm/pnpm workspaces)
```

---

## FRONTEND ARCHITECTURE (Feature-Based)

```
frontend/src/
│
├── app/
│   ├── router/            ← Centralized route config (config-driven, lazy-loaded)
│   ├── providers/         ← QueryClientProvider, AuthProvider, ThemeProvider
│   └── store/             ← Zustand root store
│
├── core/
│   ├── components/        ← Reusable UI components (see list below)
│   ├── layout/            ← AppShell, Sidebar, Topbar, Footer
│   ├── api/               ← Centralized Axios instance, interceptors, token refresh
│   ├── hooks/             ← useAuth, usePermission, usePagination, useDebounce
│   └── utils/             ← formatDate, formatCurrency, downloadFile, etc.
│
└── features/
    ├── auth/              ← Login, Register, ForgotPassword, token refresh
    ├── users/             ← User management (CRUD demo module)
    ├── roles/             ← Role management
    ├── permissions/       ← Permission management
    ├── dashboard/         ← Main dashboard shell with widget system
    ├── reports/           ← Reporting engine shell
    └── sample-module/     ← Template module — copy to add any new feature
```

### Each Feature Must Follow:
```
feature-name/
├── pages/         ← UI composition only — no business logic here
├── components/    ← Feature-specific UI components
├── hooks/         ← Data fetching hooks (TanStack Query)
├── services/      ← Business logic and data transformation
├── api/           ← API call definitions (calls centralized Axios instance)
├── types/         ← TypeScript interfaces for this feature
├── schemas/       ← Zod validation schemas (import from /shared when applicable)
└── utils/         ← Feature-specific helpers
```

### Frontend Rules (Enforced in AI_AGENT_RULES.md)
- Pages: UI composition only
- Business logic: hooks and services only
- API calls: through centralized `core/api/` client only
- Zod schemas: defined in `/shared`, imported in both frontend and backend
- All routes: lazy-loaded via `React.lazy()`
- Route protection: via `<ProtectedRoute>` with RBAC permission check
- Sidebar menu: rendered from a `navigation.config.ts` array (config-driven, not hardcoded)
- No duplicated code — extract to `core/` or `shared/`

### Core Reusable Components (Pre-built)
| Component | Description |
|---|---|
| `<DataTable>` | Sortable, filterable, paginated table |
| `<Pagination>` | Controlled pagination with page size |
| `<SearchFilter>` | Debounced text search input |
| `<DateRangeFilter>` | From/To date picker |
| `<Modal>` | Generic dialog with confirm/cancel |
| `<FormField>` | RHF-integrated labeled input |
| `<Dropdown>` | Searchable select |
| `<FileUpload>` | Drag-and-drop with preview |
| `<ExportButton>` | CSV / Excel / PDF download trigger |
| `<DashboardWidget>` | Stat card with trend indicator |
| `<ReportTable>` | Report-specific table with export |
| `<PermissionGate>` | Conditionally renders children by permission |

---

## BACKEND ARCHITECTURE (Modular / Layered)

```
backend/src/
│
├── config/
│   ├── database.ts        ← Sequelize connection + pool config (auto-reconnect)
│   ├── env.ts             ← Zod-validated environment loader (fail-fast)
│   └── swagger.ts         ← OpenAPI definition
│
├── core/
│   ├── middleware/
│   │   ├── auth.ts        ← JWT verification middleware
│   │   ├── rbac.ts        ← Permission guard middleware
│   │   ├── validate.ts    ← Zod request body/query validator
│   │   ├── rateLimiter.ts ← express-rate-limit config
│   │   └── errorHandler.ts← Global error handler (logs internally, returns safe JSON)
│   ├── utils/
│   │   ├── response.ts    ← Uniform API response wrapper { success, data, error }
│   │   ├── pagination.ts  ← Pagination helper for Sequelize queries
│   │   └── auditLog.ts    ← Writes to audit_logs table
│   └── base/
│       ├── BaseRepository.ts ← Generic CRUD repo all modules extend
│       └── BaseService.ts    ← Generic service wrapping BaseRepository
│
└── modules/
    ├── auth/
    ├── users/
    ├── roles/
    ├── permissions/
    ├── reports/
    └── sample-module/     ← Template — copy to add any new module
```

### Each Module Must Follow (Controller → Service → Repository):
```
module-name/
├── controller/    ← HTTP only: parse request, call service, return response
├── service/       ← Business logic, calculations, rules — no HTTP, no DB
├── repository/    ← Sequelize DB operations only — extends BaseRepository
├── model/         ← Sequelize model definition
├── routes/        ← Express router — attaches middleware and controller
├── validation/    ← Zod schemas for this module (re-exports from /shared)
├── types/         ← TypeScript interfaces
└── tests/         ← Vitest unit + integration tests
```

### Backend Rules (Enforced in AI_AGENT_RULES.md)
- Controllers: no business logic, no SQL
- Services: no HTTP context, no direct DB — calls repository only
- Repositories: no business logic — Sequelize only; parameterized queries always
- All responses: use `core/utils/response.ts` wrapper
- All errors: propagate to `core/middleware/errorHandler.ts` — never expose raw errors to client
- Validation: Zod middleware on every public/protected endpoint
- Audit logging: on all CREATE/UPDATE/DELETE operations via `auditLog.ts`

---

## DATABASE DESIGN

### Foundation Tables (All Must Have Standard Columns)

```sql
-- Standard columns on every table:
id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
created_by    BIGINT UNSIGNED NULL REFERENCES users(id)
updated_by    BIGINT UNSIGNED NULL REFERENCES users(id)
is_active     TINYINT(1) NOT NULL DEFAULT 1
```

### Core Tables
- `users` — user accounts + bcrypt passwords
- `roles` — named roles (Super Admin, Admin, Manager, Staff, Viewer)
- `permissions` — granular action keys (e.g. `users.create`, `reports.export`)
- `role_permissions` — role ↔ permission mapping
- `user_permissions` — per-user permission overrides
- `audit_logs` — who, what, when, before/after JSON diff
- `system_settings` — key/value config store
- `notifications` — in-app notification queue
- `refresh_tokens` — token rotation store (user_id, token_hash, expiry, revoked)

### Multi-Tenant Architecture (Ready, Not Forced)
```sql
companies   ← parent entity
branches    ← belongs to company
warehouses  ← belongs to branch
users       ← belongs to company (company_id FK)
```

All business tables must have `company_id` and optionally `branch_id` as FK columns, indexed.

### Migrations & Seeds
- Sequelize CLI manages all migrations
- Seed files in `/database/seeders/` — deterministic, idempotent
- `/database/migrations/` — versioned, rollback-safe

---

## SECURITY REQUIREMENTS

### Authentication
- JWT access tokens (15 min expiry) + refresh tokens (7 day, rotated on use)
- bcrypt for password hashing (minimum 12 rounds)
- Refresh token stored hashed in DB (`refresh_tokens` table); invalidated on logout
- Secure HttpOnly cookie for refresh token; Bearer header for access token

### Authorization
- RBAC middleware checks `user.permissions[]` array (loaded at login, cached)
- Permission keys follow `resource.action` pattern: `users.create`, `reports.export`
- `<PermissionGate>` on frontend mirrors backend RBAC — dual enforcement

### HTTP Security
- `helmet` — secure HTTP headers
- `cors` — explicit allowlist only (no wildcard in production)
- `express-rate-limit` — per-route limits (auth endpoints: 10/min)
- CSRF protection on state-changing endpoints
- No raw SQL string interpolation — Sequelize parameterized queries only
- XSS: sanitize all user-supplied input before persistence
- Secrets: environment variables only; validated at startup; never bundled into frontend

### Error Handling
- Global error handler catches all unhandled errors
- Logs full stack trace internally via Pino
- Returns only sanitized `{ success: false, message: "..." }` to client
- Never expose MariaDB errors, stack traces, or internal paths to frontend

---

## REUSABLE CRUD ENGINE

New developers add a full CRUD module by only defining:
1. A Sequelize model (extends BaseModel)
2. A Zod validation schema in `/shared`
3. Column/permission config for the DataTable component

The BaseRepository + BaseService + BaseController handle:
- `GET /` — list with pagination, search, sort, filter
- `GET /:id` — single record
- `POST /` — create with validation
- `PUT /:id` — update with validation
- `DELETE /:id` — soft delete (sets `is_active = 0`)
- `GET /export` — CSV/Excel export

---

## REPORTING FRAMEWORK

```
backend/src/modules/reports/
├── base/
│   ├── ReportBuilder.ts   ← Base class: query, transform, format
│   └── exporters/
│       ├── csv.ts         ← csv-writer / json2csv
│       ├── excel.ts       ← exceljs
│       └── pdf.ts         ← pdfkit or puppeteer
└── definitions/
    ├── sales-report/
    ├── inventory-report/
    └── customer-report/

frontend/src/features/reports/
├── components/
│   ├── ReportTable.tsx    ← Generic sortable report table
│   ├── ReportFilters.tsx  ← Date range + multi-filter bar
│   └── ExportButton.tsx   ← Triggers download by format
└── pages/
    └── ReportPage.tsx     ← Generic wrapper for any report definition
```

Reports support: table view, date filtering, multi-filter, export CSV/Excel/PDF, saved configurations.

---

## INTEGRATION FRAMEWORK

```
backend/src/core/integrations/
├── http/          ← Axios-based external REST client with retry + timeout
├── webhooks/      ← Incoming webhook receiver + signature verification
├── scheduler/     ← node-cron for scheduled sync jobs
└── queue/         ← BullMQ + Redis for async background tasks
                     (report generation, email, data sync)
```

---

## LOGGING & MONITORING

- **Pino** — structured JSON logging with request ID correlation
- **Audit Trail** — all mutations logged to `audit_logs` with before/after diff
- **Health Check** — `GET /health` returns DB connectivity + uptime
- **Performance Hooks** — request duration logged for slow-query identification
- **Error Alerting Hook** — pluggable (Slack webhook, email) for critical errors

---

## DOCUMENTATION (Required Files)

```
docs/
├── ARCHITECTURE.md          ← System overview, data flow diagrams, folder map
├── CODING_STANDARDS.md      ← TypeScript rules, naming conventions, patterns
├── DATABASE_GUIDELINES.md   ← Schema conventions, indexing rules, migration guide
├── SECURITY_GUIDELINES.md   ← Auth flow, permission model, secret management
├── MODULE_CREATION_GUIDE.md ← Step-by-step: "Add a new module in 5 steps"
├── API_GUIDE.md             ← REST conventions, response formats, error codes
└── AI_AGENT_RULES.md        ← Critical: rules for future AI assistants
```

### `AI_AGENT_RULES.md` Must Explicitly Document:
1. How to add a new backend module (exact folder structure + files to create)
2. How to add a new frontend page and register it in the nav
3. Where business logic belongs (never in controllers, never in pages)
4. How to add a new report
5. How to run and write tests before submitting a change
6. Security rules: validation required, parameterized SQL only, no secrets in code
7. How to add a new database table (migration → model → repository)
8. Error handling: always propagate to global handler, never swallow errors
9. Naming conventions: files, functions, API endpoints, DB columns
10. How the RBAC system works and how to protect a new route

---

## DEVELOPMENT TOOLS

| Tool | Purpose |
|---|---|
| ESLint + Prettier | Code quality (shared config at root) |
| Husky + lint-staged | Pre-commit quality gate |
| Vitest | Unit + integration tests |
| Playwright | E2E tests |
| Swagger UI | Auto-generated API docs at `/api/docs` |
| Docker Compose | Local dev stack (MariaDB + Redis + Node) |
| GitHub Actions | CI: lint → typecheck → test → build |
| `.env.example` | All environment variable templates documented |

---

## IMPLEMENTATION PLAN (Phased — Do Not Skip Steps)

> **Before coding each phase:** Explain design decisions and wait for explicit approval.

### Phase 1 — Foundation
Monorepo structure, TypeScript config, ESLint/Prettier, Docker Compose, `.env` templates, `/shared` package skeleton, DB connection + pool, Swagger init, Pino logger, global error handler, `ARCHITECTURE.md`.

### Phase 2 — Auth & RBAC
JWT access + refresh token system, bcrypt, login/register/logout endpoints, RBAC middleware, permission seeder, frontend Auth context, protected routes, login page.

### Phase 3 — Reusable CRUD Engine
BaseRepository, BaseService, BaseController. Users module as the first real implementation demonstrating all CRUD + pagination + search + export. Frontend DataTable, Modal, FormField components.

### Phase 4 — Reporting Framework
ReportBuilder base class, CSV/Excel/PDF exporters, first report implementation (e.g. user activity report). Frontend ReportTable, ReportFilters, ExportButton. Saved config persistence.

### Phase 5 — Sample Business Module
A complete `sample-module` on both frontend and backend that demonstrates every pattern in the codebase. This is the template developers clone to start new modules.

### Phase 6 — Developer Experience & Hardening
Vitest unit tests, Playwright e2e tests, GitHub Actions CI pipeline, remaining documentation files, security review checklist, performance health check endpoint, BullMQ queue stub.

---

## ACCEPTANCE CRITERIA

The boilerplate is considered complete when:

- [ ] `docker-compose up` starts full local stack in one command
- [ ] Frontend loads at `localhost:5173` with login page
- [ ] Auth flow (login → JWT → protected route → refresh → logout) works end-to-end
- [ ] User CRUD module fully functional with pagination, search, export
- [ ] At least one report generates and downloads as CSV and Excel
- [ ] A new module can be added by copying `sample-module/` and changing 3 files
- [ ] A new page can be added by adding one entry to `navigation.config.ts`
- [ ] All CI checks pass: lint, typecheck, unit tests, build
- [ ] `AI_AGENT_RULES.md` is self-sufficient for any future AI agent to extend the system
- [ ] No raw errors, stack traces, or DB internals exposed to the frontend

---

## STACK RATIONALE SUMMARY

| Decision | Why |
|---|---|
| Vite over Next.js | Simpler, faster, no SSR overhead for internal business apps; easier to reason about |
| Express over NestJS | Lower learning curve, less magic, full control; NestJS is overkill for a cloneable boilerplate |
| Sequelize over Prisma | Native MariaDB dialect, no shadow DB required, stable, works with raw SQL when needed |
| Zustand over Redux | Dramatically simpler API; sufficient for enterprise business app state |
| Pino over Winston | Faster, structured JSON by default, better for containerized log aggregation |
| Vanilla CSS over Tailwind | No build-time dependency, easier to maintain custom design systems per clone |
| Monorepo (npm workspaces) | Shared types without a publish step; no Turborepo overhead for initial scaffold |
