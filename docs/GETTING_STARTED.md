# Getting Started — Build Your First App on This Boilerplate

> **Last Updated:** (auto-updated on every commit)
>
> **Who this is for:** Developers who just cloned this boilerplate and want to build a real business app. No prior experience with this codebase required.

---

## Part 1 — First 15 Minutes (Setup)

### Step 1: Clone and name your app

```bash
git clone <boilerplate-repo-url> my-app-name
cd my-app-name
```

**Rename the app** — find and replace `EnterpriseApp` with your app name in:
- `package.json` (root) — change `"name": "enterprise-boilerplate"`
- `.env.example` — change `APP_NAME=EnterpriseApp`
- `frontend/index.html` — change `<title>Enterprise App</title>`
- `docs/ARCHITECTURE.md` — update the header

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Set up your environment

```bash
# Create your local config file
copy .env.example .env   # Windows
cp .env.example .env     # Mac/Linux

# Open .env and fill in:
# 1. DB_PASSWORD = your MariaDB password
# 2. Generate JWT secrets (run this twice — once for each):
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Paste the output into JWT_ACCESS_SECRET and JWT_REFRESH_SECRET
```

### Step 4: Start the database

```bash
# Starts MariaDB + Redis + Adminer (web DB viewer) via Docker
docker-compose up -d

# Verify it's running:
docker ps
# You should see: boilerplate_db, boilerplate_redis, boilerplate_adminer
```

### Step 5: Create tables and seed default data

```bash
npm run db:migrate   # creates all 11 foundation tables
npm run db:seed      # adds default roles, permissions, and admin user
```

### Step 6: Start the development servers

```bash
npm run dev
```

You should now have:
- **Backend API:** http://localhost:4000
- **Frontend App:** http://localhost:5173
- **API Docs:** http://localhost:4000/api/docs
- **Database GUI:** http://localhost:8080 (Adminer — server: `mariadb`, user: `root`)

**Default login:** `admin@example.com` / `Admin@1234`
> ⚠️ Change this password before going to production!

---

## Part 2 — Understanding the Structure (15 minutes)

Before writing a single line of code, spend 15 minutes understanding how things are organized. This will save you hours later.

### The Golden Rule: Everything Has a Place

```
You want to...                          → Put it in...
─────────────────────────────────────────────────────
Handle an HTTP request                  Backend: controller/
Write a business rule                   Backend: service/
Query the database                      Backend: repository/
Define a database table                 database/migrations/
Share a type between front and back     shared/src/types/
Share a form validation rule            shared/src/schemas/
Fetch data in a React component         Frontend: features/xxx/hooks/
Make an API call                        Frontend: features/xxx/api/
Compose a page UI                       Frontend: features/xxx/pages/
Reuse a UI component across features    Frontend: core/components/
Add a page to the sidebar               frontend/src/navigation.config.ts
```

### The Request Lifecycle

When a user clicks a button in your app, here's what happens:

```
1. React Component (page)
   └── calls a hook: const { data } = useProducts()

2. TanStack Query Hook (features/products/hooks/useProducts.ts)
   └── calls API function: productsApi.getAll(params)

3. API Function (features/products/api/products.api.ts)
   └── uses Axios client: apiClient.get('/products')
       (JWT token is automatically attached)

4. Express Backend receives the request
   └── Rate limiter → Auth middleware → RBAC check → Zod validator → Controller

5. Controller (modules/products/controller/index.ts)
   └── calls service: const result = await productService.getAll(query)

6. Service (modules/products/service/index.ts)
   └── applies business rules → calls repository

7. Repository (modules/products/repository/index.ts)
   └── runs Sequelize query against MariaDB
   └── returns data

8. Controller wraps result: res.json(success(result.rows, undefined, result.meta))

9. Frontend receives JSON → TanStack Query caches it → React re-renders
```

---

## Part 3 — Building Your First Feature (30 minutes)

Let's build a **Products** module from scratch as a real example.

### 1. Plan your data

Ask yourself: What does a Product look like?
```
Product:
  - name (text, required)
  - sku (code, unique)
  - price (decimal)
  - stock (integer)
  - description (optional text)
  - belongs to a company
```

### 2. Create the database migration

Create `database/migrations/002-create-products.js`:

```js
'use strict';
module.exports = {
  async up(qi, Sequelize) {
    await qi.createTable('products', {
      id:          { type: Sequelize.DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      company_id:  { type: Sequelize.DataTypes.BIGINT.UNSIGNED, allowNull: true },
      name:        { type: Sequelize.DataTypes.STRING(200), allowNull: false },
      sku:         { type: Sequelize.DataTypes.STRING(100), allowNull: false, unique: true },
      price:       { type: Sequelize.DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      stock:       { type: Sequelize.DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
      description: Sequelize.DataTypes.TEXT,
      created_at:  { type: Sequelize.DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at:  { type: Sequelize.DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
      created_by:  Sequelize.DataTypes.BIGINT.UNSIGNED,
      updated_by:  Sequelize.DataTypes.BIGINT.UNSIGNED,
      is_active:   { type: Sequelize.DataTypes.TINYINT(1), defaultValue: 1 },
    });
    await qi.addIndex('products', ['company_id']);
    await qi.addIndex('products', ['sku']);
  },
  async down(qi) {
    await qi.dropTable('products');
  },
};
```

```bash
npm run db:migrate   # apply it
```

### 3. Add validation schemas to /shared

In `shared/src/schemas/index.ts`, add:

```typescript
export const createProductSchema = z.object({
  name:        z.string().min(1).max(200),
  sku:         z.string().min(1).max(100),
  price:       z.number().min(0).default(0),
  stock:       z.number().int().min(0).default(0),
  description: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();
export type CreateProductFormData = z.infer<typeof createProductSchema>;
export type UpdateProductFormData = z.infer<typeof updateProductSchema>;
```

### 4. Copy the sample-module template

```bash
# Windows
xcopy /E /I backend\src\modules\sample-module backend\src\modules\products
xcopy /E /I frontend\src\features\sample-module frontend\src\features\products
```

Then fill in each file following the pattern in `docs/MODULE_CREATION_GUIDE.md`.

### 5. Register the module

In `backend/src/app.ts`:
```typescript
import { productRouter } from './modules/products/routes';
app.use('/api/v1/products', authenticate, productRouter);
```

In `frontend/src/navigation.config.ts`:
```typescript
{ label: 'Products', path: '/products', icon: '📦', group: 'Inventory', permission: 'products.read' }
```

In `frontend/src/app/router/index.tsx`:
```typescript
const ProductsPage = React.lazy(() => import('../../features/products/pages/ProductsPage'));
// Add inside <Routes>:
<Route path="products" element={<ProtectedRoute permission="products.read"><ProductsPage /></ProtectedRoute>} />
```

**Done!** Your Products module is live.

---

## Part 4 — Common Tasks Reference

### How do I add a new field to an existing table?

```bash
# 1. Create a migration
# database/migrations/003-add-category-to-products.js
module.exports = {
  async up(qi, Sequelize) {
    await qi.addColumn('products', 'category', {
      type: Sequelize.DataTypes.STRING(100),
      allowNull: true,
      after: 'name',  # MariaDB supports AFTER
    });
  },
  async down(qi) {
    await qi.removeColumn('products', 'category');
  },
};
# 2. Run it
npm run db:migrate
# 3. Update the Sequelize model to include the new field
# 4. Update the Zod schema in /shared if needed
```

### How do I protect an endpoint so only admins can access it?

```typescript
// In the routes file:
router.delete('/:id',
  authenticate,              // must be logged in
  authorize('products.delete'),  // must have this permission
  productController.delete
);
```

### How do I show data in a table on the frontend?

Use the `<DataTable>` component from `core/components/DataTable.tsx` (Phase 3).
For now, use a regular HTML table with the `.data-table` CSS class.

### How do I run a database backup?

```bash
node scripts/backup-database.js
# Backups are saved to backups/db/ with timestamps
# Old backups are auto-deleted after 30 days
```

### How do I add a new role?

1. Insert a row into the `roles` table via Adminer or a seeder
2. Assign permissions via `role_permissions` table
3. The role is immediately available when assigning to users

---

## Part 5 — Before Going to Production Checklist

- [ ] Change `admin@example.com` password immediately
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Generate new random JWT secrets (not the dev ones)
- [ ] Set `CORS_ORIGIN` to your real frontend domain only
- [ ] Run `npm run db:migrate` on the production database
- [ ] Set up automated database backups (`node scripts/backup-database.js`)
- [ ] Configure log aggregation (Pino outputs JSON to stdout — pipe to your log system)
- [ ] Set up a health check monitor on `/health`
- [ ] Review `docs/SECURITY_GUIDELINES.md` before launch

---

## Glossary (for beginners)

| Term | What it means in this boilerplate |
|---|---|
| **Module** | One business domain (Products, Orders, Customers) with its own folder |
| **Migration** | A versioned script that changes the database schema (add/remove tables/columns) |
| **Seeder** | A script that inserts default/test data into the database |
| **Controller** | Receives HTTP requests, calls the service, sends the response |
| **Service** | Contains all business logic — no HTTP, no SQL |
| **Repository** | Talks to the database — no business logic |
| **Shared** | Code (types/schemas) that both frontend and backend use |
| **RBAC** | Role-Based Access Control — who can do what based on their role |
| **Permission** | A specific action key like `products.create` that is checked on routes |
| **Soft delete** | Setting `is_active = 0` instead of physically removing a database row |
| **JWT** | JSON Web Token — a secure way to prove the user is logged in |
| **Zod schema** | A definition of what valid data looks like — used for form and API validation |
| **TanStack Query** | Library that fetches, caches, and synchronizes server data in React |
| **Zustand** | Lightweight global state manager (stores auth state, UI state) |
