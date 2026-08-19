# Database Guidelines

> **Last Updated:** (auto-updated on every commit)

---

## Schema Conventions

### Every table MUST have these standard columns

```sql
id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
created_by    BIGINT UNSIGNED NULL  -- FK to users.id (who created this row)
updated_by    BIGINT UNSIGNED NULL  -- FK to users.id (who last modified this row)
is_active     TINYINT(1) NOT NULL DEFAULT 1  -- 0 = soft deleted
```

### Multi-tenant columns (business tables)

Tables that hold business data must include:
```sql
company_id    BIGINT UNSIGNED NULL  -- FK to companies.id
branch_id     BIGINT UNSIGNED NULL  -- FK to branches.id (optional)
```

Both columns must be indexed.

### Naming
- Tables: `snake_case`, plural (`products`, `sales_orders`, `user_permissions`)
- Columns: `snake_case` (`first_name`, `created_at`, `company_id`)
- Foreign keys: `referenced_table_singular_id` (`company_id`, `role_id`, `product_id`)
- Indexes: `idx_tablename_columnname` (`idx_products_company_id`)
- Unique constraints: `uq_tablename_columnname` (`uq_products_sku`)

---

## Indexing Rules

### Always index:
1. All foreign key columns (`company_id`, `role_id`, `user_id`)
2. Columns used in `WHERE` clauses frequently (`email`, `sku`, `status`)
3. Columns used in `ORDER BY` on large tables (`created_at` if sorting by date)
4. Columns used in `JOIN` conditions

### Don't over-index:
- Don't index boolean columns (`is_active`) alone — low cardinality = useless index
- Combine with another column: `INDEX(company_id, is_active)` — useful

### Checking slow queries
```sql
-- Enable slow query log (run in MariaDB):
SET GLOBAL slow_query_log = 1;
SET GLOBAL long_query_time = 1;  -- log queries slower than 1 second

-- Check index usage:
EXPLAIN SELECT * FROM products WHERE company_id = 1 AND is_active = 1;
-- Look for 'type: ALL' in the output — means full table scan (add an index!)
```

---

## Migrations

### Creating a new migration

Migration filenames must be ordered:
```
001-create-foundation-tables.js
002-create-products.js
003-add-category-to-products.js
```

### Rules for migrations
- Always implement both `up` (apply) and `down` (rollback)
- Never modify an existing migration — create a new one
- Test `down` before pushing to production
- Never drop a column without confirming the app no longer uses it

### Common migration patterns

```js
// Add a column
await qi.addColumn('products', 'weight_kg', {
  type: Sequelize.DataTypes.DECIMAL(8, 3),
  allowNull: true,
  after: 'stock',
});

// Remove a column (careful!)
await qi.removeColumn('products', 'old_field');

// Add an index
await qi.addIndex('products', ['company_id', 'is_active'], {
  name: 'idx_products_company_active',
});

// Rename a column
await qi.renameColumn('products', 'old_name', 'new_name');
```

### Running migrations
```bash
npm run db:migrate          # apply all pending migrations
npm run db:migrate:undo     # rollback last migration
npm run db:migrate:status   # see which migrations have run (from backend/)
```

---

## Soft Deletes

**Never physically delete rows.** Always set `is_active = 0`.

**Why?**
- Audit trail — you can see what existed before
- Recovery — easy to un-delete
- Referential integrity — foreign keys in other tables still work

```typescript
// In BaseRepository — already implemented:
async softDelete(id: number): Promise<boolean> {
  const record = await this.model.findByPk(id);
  if (!record) return false;
  await record.update({ is_active: 0, updated_by: currentUserId });
  return true;
}

// In all findAll queries — filter out inactive records:
const where = { is_active: 1 };
```

---

## Transactions

Use transactions when multiple related inserts/updates must all succeed or all fail:

```typescript
// In a service:
const t = await sequelize.transaction();
try {
  const order = await orderRepository.create({ ...orderData }, { transaction: t });
  await orderItemRepository.bulkCreate(items.map(i => ({ ...i, orderId: order.id })), { transaction: t });
  await inventoryRepository.decrementStock(items, { transaction: t });
  await t.commit();
  return order;
} catch (error) {
  await t.rollback();
  throw error;
}
```

---

## Database Backup

Automated backups run via `node scripts/backup-database.js`.

```bash
# Manual backup
node scripts/backup-database.js

# Schedule automatic backups (Windows Task Scheduler or cron)
# Backups are saved to: backups/db/YYYY-MM-DD_HH-MM-SS.sql.gz
# Backups older than 30 days are automatically deleted
```

See `scripts/backup-database.js` for configuration options.

---

## Seeding Data

### When to use seeders vs migrations
- **Migration** — structural changes (create table, add column)
- **Seeder** — insert data (roles, permissions, sample data)

### Seeders must be idempotent
```js
// Use ignoreDuplicates — safe to run multiple times
await qi.bulkInsert('roles', [...], { ignoreDuplicates: true });
```

### Generating a new admin password hash
```bash
node -e "require('bcrypt').hash('YourPassword', 12).then(h => console.log(h))"
# Use the output in the seeder's ADMIN_PASSWORD_HASH constant
```
