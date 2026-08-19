# AI Agent Rules

> **Last Updated:** 2026-07-12T16:17:40.398Z (commit `manual`)
>
> **MANDATORY READ** for any AI agent or developer modifying this codebase.
> These rules ensure consistency, security, and maintainability across all changes.

---

## 1. Before Making ANY Change

- [ ] Read `ARCHITECTURE.md` to understand the system structure
- [ ] Identify which layer your change belongs to (controller / service / repository / component)
- [ ] Check `CODING_STANDARDS.md` for naming conventions
- [ ] Never modify the `core/` or `shared/` packages without explicit instruction
- [ ] Run `npm run typecheck` before committing — fix all TypeScript errors

---

## 2. Adding a New Backend Module

Follow this exact order — do not skip steps:

```
Step 1: Create the Sequelize model
  → backend/src/modules/your-module/model/index.ts
  → Must include all standard columns (id, created_at, updated_at, created_by, updated_by, is_active)

Step 2: Create the repository (extends BaseRepository)
  → backend/src/modules/your-module/repository/index.ts
  → Database queries ONLY — no business logic here
  → Use Sequelize methods — never raw string SQL

Step 3: Create the service (extends BaseService)
  → backend/src/modules/your-module/service/index.ts
  → Business logic ONLY — no HTTP context (no req/res), no direct DB calls
  → Throw AppError for expected failures (not found, duplicate, etc.)

Step 4: Create the controller
  → backend/src/modules/your-module/controller/index.ts
  → HTTP handling ONLY: parse req → call service → res.json(success(...))
  → Use asyncHandler() wrapper — never write try/catch here

Step 5: Create the router
  → backend/src/modules/your-module/routes/index.ts
  → Mount middleware: authenticate → authorize(Permission.X) → validate({body: schema}) → controller

Step 6: Register the router in app.ts
  → app.use('/api/v1/your-module', authenticate, yourModuleRouter);

Step 7: Add Swagger JSDoc comments to the router file
Step 8: Write at least one unit test in tests/

NEVER:
  ✗ Put SQL in a service or controller
  ✗ Put business logic in a controller or repository
  ✗ Return raw database errors to the client
  ✗ Skip input validation on any endpoint
  ✗ Use raw string SQL interpolation
```

---

## 3. Adding a New Frontend Page

```
Step 1: Create the feature folder (if new feature)
  → frontend/src/features/your-feature/

Step 2: Create the page component
  → frontend/src/features/your-feature/pages/YourPage.tsx
  → Pages compose components — no business logic, no API calls directly

Step 3: Create hooks for data fetching
  → frontend/src/features/your-feature/hooks/useYourData.ts
  → Use TanStack Query (useQuery, useMutation)

Step 4: Create API functions
  → frontend/src/features/your-feature/api/yourFeature.api.ts
  → ALWAYS use the centralized Axios client from core/api/client.ts

Step 5: Register in navigation.config.ts
  → Add one entry to the navigation array — the sidebar auto-renders it
  → Set required permission key so unauthorized users don't see the menu item

Step 6: Register in router
  → frontend/src/app/router/index.tsx
  → Use React.lazy() for code splitting
  → Wrap with <ProtectedRoute permission="your.permission" />
```

---

## 4. Where Business Logic Belongs

| Logic Type | Location | NEVER in |
|---|---|---|
| HTTP parsing | Controller | Service, Repository |
| Business rules | Service | Controller, Repository, Component |
| Database queries | Repository | Service, Controller, Component |
| UI composition | Page component | Hook, Service |
| Data fetching | Hook (TanStack Query) | Page component directly |
| API calls | Feature `api/` files | Components, hooks directly |
| Validation schemas | `/shared/src/schemas/` | Individual files |
| Reusable UI | `core/components/` | Feature folders |

---

## 5. Adding a New Report

```
Backend:
  1. Create: backend/src/modules/reports/definitions/your-report/index.ts
  2. Extend ReportBuilder base class
  3. Implement: query(), transform(), and optionally export()
  4. Register in the reports router with a permission check

Frontend:
  1. Create: frontend/src/features/reports/pages/YourReportPage.tsx
  2. Use <ReportTable> component with your column definitions
  3. Use <ReportFilters> for date range and filter controls
  4. Use <ExportButton> for CSV/Excel/PDF download
  5. Add to navigation.config.ts with reports.read permission
```

---

## 6. Security Rules (Non-Negotiable)

```
✅ ALWAYS:
  - Validate all API inputs with Zod middleware
  - Use Sequelize parameterized queries (no string interpolation)
  - Throw AppError for expected errors — let global handler format the response
  - Log sensitive operations to audit_logs
  - Store secrets in .env only — never in code

✗ NEVER:
  - Return raw DB errors, stack traces, or internal paths to the client
  - Use string interpolation in SQL: `WHERE id = ${req.params.id}` ← NEVER
  - Skip the validate() middleware on POST/PUT/PATCH routes
  - Commit .env files to git
  - Log passwords, tokens, or personal data
  - Bypass authenticate or authorize middleware
```

---

## 7. Adding a Database Table

```
Step 1: Create a migration file
  → database/migrations/NNN-create-your-table.js
  → Use the YYYYMMDDHHMMSS prefix for ordering
  → Must include all standard columns
  → Must include indexes on all FK columns and frequently-queried columns
  → Always implement the `down` function for rollback

Step 2: Create the Sequelize model
  → backend/src/modules/your-module/model/index.ts

Step 3: Run migration
  → npm run db:migrate (from backend/)

Standard columns REQUIRED on every table:
  id, created_at, updated_at, created_by, updated_by, is_active
```

---

## 8. Error Handling Rules

```
In Services:    throw new AppError('Message', statusCode)
In Repositories: let errors bubble up naturally (don't catch Sequelize errors)
In Controllers: use asyncHandler() — never write try/catch
In the app:     the global errorHandler in core/middleware/errorHandler.ts catches everything

DO NOT:
  - Swallow errors with empty catch blocks
  - Catch errors just to re-throw the same error
  - Log the same error more than once
```

---

## 9. Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Files | kebab-case | `user-service.ts` |
| Classes | PascalCase | `UserService` |
| Functions | camelCase | `getUserById()` |
| Variables | camelCase | `const userId` |
| DB columns | snake_case | `first_name`, `created_at` |
| API endpoints | kebab-case | `/api/v1/user-roles` |
| React components | PascalCase | `<DataTable />` |
| Hooks | camelCase, prefix `use` | `useUserList` |
| Permission keys | `resource.action` | `users.create` |
| Env variables | UPPER_SNAKE_CASE | `JWT_ACCESS_SECRET` |

---

## 10. Testing Requirements

```
Before every PR/commit:
  - npm run typecheck  (zero TypeScript errors)
  - npm run lint       (zero ESLint errors)
  - npm run test       (all tests pass)

Every new module MUST have:
  - Unit tests for the Service layer (mock the repository)
  - Integration test for the main CRUD endpoints
  - Test file location: backend/src/modules/your-module/tests/
```

---

## 11. How the RBAC System Works

```
1. On login: user's permissions are loaded from DB and embedded in the JWT payload
2. On each request: authenticate middleware verifies JWT and sets req.user.permissions
3. authorize(Permission.USERS_CREATE) middleware checks if the permission is in the array
4. On the frontend: <PermissionGate permission="users.create"> wraps UI elements
5. Navigation items have a 'permission' field — items are hidden if user lacks it

Adding a new permission:
  1. Add to Permission enum in shared/src/enums/index.ts
  2. Add to database/seeders with INSERT
  3. Assign to appropriate roles in role_permissions
  4. Use in routes: authorize(Permission.YOUR_NEW_PERM)
  5. Use in frontend: <PermissionGate permission={Permission.YOUR_NEW_PERM}>
```
