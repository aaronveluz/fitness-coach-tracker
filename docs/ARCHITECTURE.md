# Architecture Guide

> **Last Updated:** 2026-07-12T16:17:40.398Z (commit `manual`)

This document is the **primary reference** for the system architecture. All developers and AI agents must read this before making changes.

---

## Overview

This is a **feature-driven, modular monorepo** boilerplate designed to be cloned and extended for any business system (POS, ERP, CRM, HR, Reporting, etc.).

```
enterprise-boilerplate/
├── frontend/     React + Vite + TypeScript
├── backend/      Node.js + Express + TypeScript
├── shared/       Zod schemas + TypeScript types (used by both)
├── database/     Migrations + seeders (Sequelize CLI)
├── docs/         Living documentation (auto-updated on commit)
├── scripts/      Dev utilities + auto-doc updater
└── docker/       Dockerfiles
```

---

## Data Flow

```
Browser
  │
  ▼
React Frontend (Vite, port 5173)
  │  Axios + TanStack Query
  ▼
Express Backend (port 4000)
  │
  ├── Middleware stack (in order):
  │     1. Helmet (security headers)
  │     2. CORS (allowlisted origins only)
  │     3. Rate Limiter
  │     4. Body Parser
  │     5. Pino HTTP Logger
  │     6. authenticate (JWT verification)  ← protected routes only
  │     7. authorize (RBAC check)           ← permission-gated routes only
  │     8. validate (Zod schema)            ← all mutation routes
  │
  ├── Module Router (e.g. /api/v1/users)
  │     │
  │     ├── Controller  (HTTP: parse → call service → respond)
  │     ├── Service     (Business logic: rules, calculations)
  │     └── Repository  (Database: Sequelize queries only)
  │
  └── Global Error Handler (catches all errors, returns safe JSON)
        │
        ▼
MariaDB (port 3306, Docker)
```

---

## Module Structure

Every feature module on the backend follows this exact structure:

```
backend/src/modules/your-module/
├── controller/   index.ts   → HTTP handling only
├── service/      index.ts   → Business logic only
├── repository/   index.ts   → Database queries only (extends BaseRepository)
├── model/        index.ts   → Sequelize model definition
├── routes/       index.ts   → Express router with middleware
├── validation/   index.ts   → Zod schemas (re-exports from /shared)
├── types/        index.ts   → TypeScript interfaces
└── tests/        *.test.ts  → Vitest unit tests
```

Every feature module on the frontend follows this structure:

```
frontend/src/features/your-feature/
├── pages/        → UI composition only (no logic)
├── components/   → Feature-specific React components
├── hooks/        → TanStack Query hooks (data fetching)
├── api/          → API call functions (use core Axios client)
├── types/        → TypeScript interfaces
├── schemas/      → Zod schemas (import from @boilerplate/shared)
└── utils/        → Helper functions
```

---

## Core Principles

| Principle | Rule |
|---|---|
| Thin Controllers | Controllers only parse request and return response — zero business logic |
| Fat Services | All business rules live in the service layer |
| Repository-only DB | No raw SQL outside repository files |
| Shared Schemas | Zod schemas defined in `/shared` — used by both frontend and backend |
| Uniform Responses | Every API response uses `{ success, data, message, meta }` |
| Soft Deletes | Records are never physically deleted — `is_active = 0` |
| Parameterized Queries | No string interpolation in SQL — Sequelize handles parameterization |
| Config-driven Nav | Sidebar is driven by `navigation.config.ts` — not hardcoded |

---

## Database Schema

See [DATABASE_GUIDELINES.md](./DATABASE_GUIDELINES.md) for full schema documentation.

**Core tables:** `companies`, `branches`, `roles`, `permissions`, `users`, `role_permissions`, `user_permissions`, `refresh_tokens`, `audit_logs`, `system_settings`, `notifications`

**Standard columns on every table:**
```sql
id, created_at, updated_at, created_by, updated_by, is_active
```

---

## Security Architecture

See [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md) for full security documentation.

**Auth flow:** Login → JWT access token (15 min) + HttpOnly refresh token (7 days) → Refresh on expiry → Logout revokes refresh token

**Permission format:** `resource.action` (e.g. `users.create`, `reports.export`)

---

## Adding a New Module

See [MODULE_CREATION_GUIDE.md](./MODULE_CREATION_GUIDE.md) — it takes about **5 steps**.

---

## Full Technology Stack & Frameworks

The application utilizes a curated selection of modern, high-performance technologies across all monorepo workspaces:

### 💻 Frontend (React SPA)
*   **Framework/Bundler:** React 18.3 & Vite (fast HMR, lightweight dev server proxy)
*   **Routing:** React Router DOM (client-side dynamic route-split matching)
*   **State Management:** Zustand (minimalistic, persistent global stores)
*   **Data Fetching/Caching:** TanStack Query v5 (automatic query/mutation status sync, retry logic, server cache)
*   **Form Validation:** React Hook Form & Zod resolvers (stateless validation triggers)
*   **Styling & Components:** Vanilla CSS custom properties (Indigo-themed design tokens, premium glassmorphism layouts)

### ⚙️ Backend (RESTful API)
*   **Runtime/Framework:** Node.js, Express.js & TypeScript (routing engine, strong contracts)
*   **Object-Relational Mapping (ORM):** Sequelize v6 (MariaDB dialect, automated migrations/seeding)
*   **Logging Engine:** Pino & Pino-HTTP (high-throughput JSON structured logs, pino-pretty console formatter)
*   **API Documentation:** Swagger UI & swagger-jsdoc (JSDoc JSDoc-driven OpenAPI schemas)
*   **Security & Protection:** 
    *   `helmet` (HTTP header hardening)
    *   `cors` (secure domain cross-origin permissions)
    *   `express-rate-limit` (DDoS mitigation on sensitive endpoints)
    *   `bcrypt` (secure salted hashes for credentials)
    *   `jsonwebtoken` (JWT issuance & stateless validations)

### 🤝 Shared Library
*   **Schema Enforcement:** Zod (unified type definition & validation parser shared between frontend forms and backend controllers)
*   **Type Safety:** TypeScript (shared namespace interfaces, UserDTO models)

### 🗄️ Database & Storage
*   **Primary Relational DB:** MariaDB 11.3 (high-concurrency, drop-in MySQL replacement with window analytics)
*   **Memory Store & Queue:** Redis 7.2 (optional caching, BullMQ backplane support)

### 🛠️ Tooling & Infrastructure
*   **Test Runner:** Vitest (native ESM workspace runner)
*   **Process Manager:** PM2 (clustering, autorestarts, system daemonization)
*   **Environment Management:** Zod-backed Fail-Fast environment loaders, `dotenv`
*   **Orchestration:** Docker & Docker Compose (MariaDB + Redis container configurations)
