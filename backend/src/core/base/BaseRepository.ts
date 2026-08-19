// ─────────────────────────────────────────────────────────────────────────────
// backend/src/core/base/BaseRepository.ts
//
// Generic CRUD repository that all module repositories extend.
//
// WHY A BASE REPOSITORY?
//   Every module (users, products, orders, etc.) needs the same 6 operations:
//   findAll, findById, create, update, softDelete, and count.
//   Defining this once and extending it eliminates repetition and bugs.
//
// HOW TO CREATE A NEW MODULE REPOSITORY:
//   1. Import BaseRepository
//   2. Pass your Sequelize model as the generic type
//   3. Override any method if you need custom behavior
//
//   Example:
//     export class ProductRepository extends BaseRepository<Product> {
//       constructor() { super(Product); }
//       // Optionally override findAll to add custom includes
//     }
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Model,
  ModelStatic,
  FindOptions,
  WhereOptions,
  CreationAttributes,
} from 'sequelize';
import { Op } from 'sequelize';
import { buildPagination, buildPaginationMeta } from '../utils/pagination';
import type { PaginationQuery } from '@boilerplate/shared';

export interface FindAllResult<T> {
  rows: T[];
  meta: ReturnType<typeof buildPaginationMeta>;
}

export class BaseRepository<TModel extends Model> {
  protected model: ModelStatic<TModel>;

  constructor(model: ModelStatic<TModel>) {
    this.model = model;
  }

  /**
   * Returns a paginated list of records.
   * Supports search (on searchable columns), sorting, and active filter.
   *
   * @param query  - Pagination, search, sort options
   * @param searchColumns - DB column names to apply the search term to
   * @param extraWhere    - Additional Sequelize where conditions
   */
  async findAll(
    query: PaginationQuery,
    searchColumns: string[] = [],
    extraWhere: WhereOptions = {},
  ): Promise<FindAllResult<TModel>> {
    const page     = query.page     ?? 1;
    const pageSize = query.pageSize ?? 20;
    const { limit, offset } = buildPagination({ page, pageSize });

    // Build where clause
    const where: WhereOptions = { ...extraWhere };

    // Filter by is_active if provided
    if (query.isActive !== undefined) {
      (where as Record<string, unknown>).is_active = query.isActive ? 1 : 0;
    }

    // Apply search term across provided columns using OR.
    // We use Object.assign to correctly apply the Op.or Symbol key —
    // Symbol keys cannot be used in record literals but work fine via assign.
    if (query.search && searchColumns.length > 0) {
      Object.assign(where, {
        [Op.or]: searchColumns.map(col => ({
          [col]: { [Op.like]: `%${query.search}%` },
        })),
      });
    }

    const { rows, count: totalItems } = await this.model.findAndCountAll({
      where,
      limit,
      offset,
      order: [[query.sortBy ?? 'created_at', query.sortOrder ?? 'asc']],
    } as FindOptions);

    return {
      rows,
      meta: buildPaginationMeta({ page, pageSize, totalItems }),
    };
  }

  /** Returns a single record by primary key, or null if not found */
  async findById(id: number): Promise<TModel | null> {
    return this.model.findByPk(id) as Promise<TModel | null>;
  }

  /** Creates a new record */
  async create(data: CreationAttributes<TModel>): Promise<TModel> {
    return this.model.create(data) as Promise<TModel>;
  }

  /** Updates a record by primary key. Returns the updated record. */
  async update(id: number, data: Partial<CreationAttributes<TModel>>): Promise<TModel | null> {
    const record = await this.model.findByPk(id);
    if (!record) return null;
    return record.update(data) as Promise<TModel>;
  }

  /**
   * Soft delete — sets is_active = 0.
   * Records are never physically deleted.
   */
  async softDelete(id: number): Promise<boolean> {
    const record = await this.model.findByPk(id);
    if (!record) return false;
    await record.update({ is_active: 0 });
    return true;
  }
}
