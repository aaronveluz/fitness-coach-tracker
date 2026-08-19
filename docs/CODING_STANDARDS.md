# Coding Standards

> **Last Updated:** (auto-updated on every commit)
>
> Consistency makes code readable and maintainable. These standards apply to all code in this boilerplate and every app built on it.

---

## TypeScript Rules

### Use strict types everywhere
```typescript
// ✅ Good
function getUserById(id: number): Promise<UserDTO | null> { ... }

// ❌ Bad — 'any' hides bugs
function getUserById(id: any): Promise<any> { ... }
```

### Prefer interfaces for object shapes, types for unions/aliases
```typescript
// ✅ Good — interface for object shape
interface CreateProductDto {
  name: string;
  price: number;
}

// ✅ Good — type for union
type SortOrder = 'asc' | 'desc';
```

### Never use non-null assertion (`!`) without a comment explaining why it's safe
```typescript
// ✅ Acceptable — root element always exists in index.html
ReactDOM.createRoot(document.getElementById('root')!);

// ❌ Bad — what if user is null?
const name = req.user!.name;
```

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Files | `kebab-case` | `user-service.ts`, `data-table.tsx` |
| Classes | `PascalCase` | `UserService`, `ProductRepository` |
| Interfaces/Types | `PascalCase` | `UserDTO`, `CreateProductDto` |
| Functions/methods | `camelCase` | `getUserById()`, `formatCurrency()` |
| Variables/constants | `camelCase` | `const userId`, `let isLoading` |
| React components | `PascalCase` | `<DataTable />`, `<UserCard />` |
| React hooks | `camelCase`, prefix `use` | `useUsers()`, `usePermission()` |
| Database tables | `snake_case`, plural | `products`, `user_permissions` |
| Database columns | `snake_case` | `first_name`, `created_at` |
| API endpoints | `kebab-case`, plural nouns | `/api/v1/products`, `/api/v1/user-roles` |
| Environment vars | `UPPER_SNAKE_CASE` | `JWT_ACCESS_SECRET`, `DB_PASSWORD` |
| Permission keys | `resource.action` | `products.create`, `reports.export` |
| CSS classes | `kebab-case` | `card-header`, `nav-item` |
| Enum values | `UPPER_SNAKE_CASE` | `UserRole.SUPER_ADMIN` |

---

## File Organization

### One exported thing per file (for modules)
```
✅ users/controller/index.ts   → exports UserController
✅ users/service/index.ts      → exports UserService
❌ users/userStuffAllInOne.ts  → exports everything mixed together
```

### Keep files short
- Controllers: < 80 lines (if longer, split into multiple controller methods)
- Services: < 200 lines (if longer, split by concern)
- React components: < 150 lines (if longer, extract sub-components)

### Barrel exports via index.ts
Each module should expose a clean public API via `index.ts`:
```typescript
// modules/products/index.ts
export { productRouter } from './routes';
// Internal files (model, repository, service) are NOT exported from barrel
```

---

## Backend Patterns

### Controller: thin, always uses asyncHandler
```typescript
// ✅ Good
export const productController = {
  getAll: asyncHandler(async (req, res) => {
    const result = await productService.getAll(req.query as PaginationQuery);
    res.json(success(result.rows, undefined, result.meta));
  }),
};

// ❌ Bad — business logic in controller
export const productController = {
  getAll: asyncHandler(async (req, res) => {
    const products = await Product.findAll();
    const filtered = products.filter(p => p.price > 100); // ← belongs in service
    res.json({ data: filtered });                          // ← use success() wrapper
  }),
};
```

### Service: all business logic, throws AppError for failures
```typescript
// ✅ Good
async createProduct(data: CreateProductDto): Promise<Product> {
  const existing = await this.repository.findBySku(data.sku);
  if (existing) {
    throw new AppError(`Product with SKU "${data.sku}" already exists.`, 409);
  }
  return this.repository.create(data);
}
```

### Repository: parameterized queries only
```typescript
// ✅ Good — Sequelize handles parameterization
await Product.findAll({ where: { sku: userInput } });

// ❌ NEVER — SQL injection vulnerability
await sequelize.query(`SELECT * FROM products WHERE sku = '${userInput}'`);
```

### Always handle errors by propagating, not swallowing
```typescript
// ✅ Good — let the global handler deal with it
const user = await userService.getById(id);  // throws AppError if not found

// ❌ Bad — swallowed error, silent failure
try {
  const user = await userService.getById(id);
} catch (e) {
  // doing nothing here is always wrong
}
```

---

## Frontend Patterns

### Pages compose, hooks fetch, services transform
```typescript
// ✅ Good — page just composes
export default function ProductsPage() {
  const { data, isLoading } = useProducts();  // data fetching in hook
  return <DataTable data={data} columns={columns} loading={isLoading} />;
}

// ❌ Bad — API call directly in component
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch('/api/v1/products').then(r => r.json()).then(setProducts); // wrong place
  }, []);
}
```

### Always handle loading and error states
```typescript
const { data, isLoading, isError, error } = useProducts();

if (isLoading) return <div className="spinner" />;
if (isError)   return <div className="alert alert-danger">{error.message}</div>;
```

### Use TanStack Query mutation for data changes
```typescript
// ✅ Good
const createProduct = useMutation({
  mutationFn: productsApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['products'] }); // auto-refresh list
    toast.success('Product created!');
  },
  onError: (err) => toast.error(err.message),
});
```

---

## Comments and Documentation

### Write comments that explain WHY, not WHAT
```typescript
// ✅ Good — explains why
// We check isActive=1 here because soft-deleted users should still be
// able to complete in-flight requests with their existing JWT
const user = await User.findByPk(id, { where: { is_active: [0, 1] } });

// ❌ Bad — explains what (the code already says that)
// Find user by primary key
const user = await User.findByPk(id);
```

### Every exported function needs a JSDoc comment
```typescript
/**
 * Returns a paginated list of products.
 * Filters by company_id automatically from the authenticated user.
 *
 * @throws AppError 404 if company not found
 */
async getAll(query: PaginationQuery, companyId: number): Promise<FindAllResult<Product>> {
  ...
}
```

---

## Git Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add product barcode scanning
fix: correct VAT calculation in invoice total
security: rotate JWT secret validation logic
docs: update MODULE_CREATION_GUIDE with new steps
chore: upgrade sequelize to 6.38.0
breaking: rename user.name to user.firstName and user.lastName
```

This format is used by `scripts/update-docs.js` to categorize changelog entries automatically.
