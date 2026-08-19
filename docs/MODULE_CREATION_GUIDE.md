# How to Add a New Module (5-Step Guide)

> **Last Updated:** (auto-updated on every commit by `scripts/update-docs.js`)
>
> This guide walks you through adding a complete new business module end-to-end.
> Estimated time: **15–30 minutes** for a full CRUD module.

---

## Overview

A "module" is one business domain — e.g. Products, Customers, Invoices, Inventory.

Adding a module requires:
- 1 database migration
- 1 backend module (model, repository, service, controller, router)  
- 1 frontend feature (hooks, api, page, components)
- Registration in 2 files (app.ts + navigation.config.ts)

---

## Step 1 — Database Migration

Create the table for your new entity.

**File:** `database/migrations/NNN-create-products.js`

```js
'use strict';
module.exports = {
  async up(qi, Sequelize) {
    await qi.createTable('products', {
      id:          { type: Sequelize.DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      company_id:  { type: Sequelize.DataTypes.BIGINT.UNSIGNED, allowNull: true },
      name:        { type: Sequelize.DataTypes.STRING(200), allowNull: false },
      sku:         { type: Sequelize.DataTypes.STRING(100), allowNull: false, unique: true },
      price:       { type: Sequelize.DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      stock:       { type: Sequelize.DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
      description: Sequelize.DataTypes.TEXT,
      // Standard columns — REQUIRED on every table
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
npm run db:migrate    # applies the migration
```

---

## Step 2 — Backend Module

**Copy the sample-module template and rename:**
```
backend/src/modules/products/
├── model/      index.ts  ← Sequelize model
├── repository/ index.ts  ← extends BaseRepository
├── service/    index.ts  ← extends BaseService
├── controller/ index.ts  ← HTTP handler
├── routes/     index.ts  ← Express router
├── validation/ index.ts  ← Zod schemas
├── types/      index.ts  ← TypeScript interfaces
└── tests/      product.test.ts
```

**model/index.ts — minimal example:**
```typescript
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../../../config/database';

export class Product extends Model {
  declare id: number;
  declare name: string;
  declare sku: string;
  declare price: number;
  declare isActive: number;
}

Product.init({
  id:         { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  name:       { type: DataTypes.STRING(200), allowNull: false },
  sku:        { type: DataTypes.STRING(100), allowNull: false },
  price:      { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  is_active:  { type: DataTypes.TINYINT(1), defaultValue: 1 },
}, { sequelize, tableName: 'products', underscored: true });
```

**repository/index.ts:**
```typescript
import { BaseRepository } from '../../../../core/base/BaseRepository';
import { Product } from '../model';

export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super(Product);
  }
  // Override findAll or add custom queries here if needed
}
```

**service/index.ts:**
```typescript
import { BaseService } from '../../../../core/base/BaseService';
import { ProductRepository } from '../repository';
import { Product } from '../model';

export class ProductService extends BaseService<Product> {
  constructor() {
    super(new ProductRepository(), ['name', 'sku']); // searchable columns
  }
  // Add your business logic methods here
}
```

**controller/index.ts:**
```typescript
import type { Request, Response } from 'express';
import { ProductService } from '../service';
import { success } from '../../../../core/utils/response';
import { asyncHandler } from '../../../../core/middleware/errorHandler';

const service = new ProductService();

export const productController = {
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const result = await service.getAll(req.query as any);
    res.json(success(result.rows, undefined, result.meta));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const product = await service.getById(Number(req.params.id));
    res.json(success(product));
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await service.delete(Number(req.params.id));
    res.json(success(null, 'Product deactivated successfully'));
  }),
};
```

**routes/index.ts:**
```typescript
import { Router } from 'express';
import { authenticate } from '../../../../core/middleware/auth';
import { authorize } from '../../../../core/middleware/rbac';
import { validate } from '../../../../core/middleware/validate';
import { paginationSchema } from '@boilerplate/shared';
import { productController } from '../controller';

export const productRouter = Router();

productRouter.get('/',    authenticate, authorize('products.read'),   validate({ query: paginationSchema }), productController.getAll);
productRouter.get('/:id', authenticate, authorize('products.read'),   productController.getById);
productRouter.delete('/:id', authenticate, authorize('products.delete'), productController.delete);
```

**Register in app.ts:**
```typescript
import { productRouter } from './modules/products/routes';
app.use('/api/v1/products', productRouter);
```

---

## Step 3 — Add Permissions

In `shared/src/enums/index.ts`:
```typescript
PRODUCTS_READ   = 'products.read',
PRODUCTS_CREATE = 'products.create',
PRODUCTS_UPDATE = 'products.update',
PRODUCTS_DELETE = 'products.delete',
```

Add a migration or seed to insert these into the `permissions` table and assign to roles.

---

## Step 4 — Frontend Feature

```
frontend/src/features/products/
├── api/        products.api.ts
├── hooks/      useProducts.ts
├── pages/      ProductsPage.tsx
└── types/      index.ts
```

**api/products.api.ts:**
```typescript
import { apiClient } from '../../../core/api/client';
import type { PaginationQuery, ApiResponse } from '@boilerplate/shared';

export const productsApi = {
  getAll: (params: PaginationQuery) =>
    apiClient.get<ApiResponse>('/products', { params }),

  getById: (id: number) =>
    apiClient.get<ApiResponse>(`/products/${id}`),
};
```

**hooks/useProducts.ts:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';

export function useProducts(params = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getAll(params).then(r => r.data),
  });
}
```

---

## Step 5 — Register in Navigation

In `frontend/src/navigation.config.ts`, add one entry:

```typescript
{
  label: 'Products',
  path: '/products',
  icon: ShoppingBagIcon,
  permission: Permission.PRODUCTS_READ,  // hidden if user lacks this
}
```

In the router (`frontend/src/app/router/index.tsx`):
```typescript
const ProductsPage = React.lazy(() => import('../features/products/pages/ProductsPage'));

<Route path="/products" element={
  <ProtectedRoute permission={Permission.PRODUCTS_READ}>
    <ProductsPage />
  </ProtectedRoute>
} />
```

**Done!** Your new module is fully integrated.

---

## Checklist

- [ ] Migration created and run
- [ ] Sequelize model defined
- [ ] Repository extends BaseRepository
- [ ] Service extends BaseService
- [ ] Controller uses asyncHandler
- [ ] Routes have authenticate + authorize + validate
- [ ] Router registered in app.ts
- [ ] Permissions added to enum + DB
- [ ] Frontend api + hook + page created
- [ ] Navigation entry added
- [ ] At least one test written
- [ ] `npm run typecheck` passes
