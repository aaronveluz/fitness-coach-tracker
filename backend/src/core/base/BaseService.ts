// ─────────────────────────────────────────────────────────────────────────────
// backend/src/core/base/BaseService.ts
//
// Generic service that wraps BaseRepository with standard business logic.
// Module services extend this and add their own domain-specific methods.
//
// RESPONSIBILITIES:
//   - Calls repository methods
//   - Applies business rules (e.g., uniqueness checks, permission checks)
//   - Throws AppError for expected failures
//   - Never touches HTTP (no req/res here)
//
// HOW TO CREATE A NEW MODULE SERVICE:
//   export class ProductService extends BaseService<Product> {
//     constructor() { super(new ProductRepository(), ['name', 'sku']); }
//
//     async createProduct(data: CreateProductDto): Promise<Product> {
//       // Add business rules here
//       return this.repository.create(data);
//     }
//   }
// ─────────────────────────────────────────────────────────────────────────────

import type { Model } from 'sequelize';
import type { BaseRepository, FindAllResult } from './BaseRepository';
import type { PaginationQuery } from '@boilerplate/shared';
import { AppError } from '../utils/response';

export class BaseService<TModel extends Model> {
  protected repository: BaseRepository<TModel>;
  protected searchColumns: string[];

  constructor(repository: BaseRepository<TModel>, searchColumns: string[] = []) {
    this.repository = repository;
    this.searchColumns = searchColumns;
  }

  async getAll(query: PaginationQuery): Promise<FindAllResult<TModel>> {
    return this.repository.findAll(query, this.searchColumns);
  }

  async getById(id: number): Promise<TModel> {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new AppError(`Record with ID ${id} not found.`, 404);
    }
    return record;
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.repository.softDelete(id);
    if (!deleted) {
      throw new AppError(`Record with ID ${id} not found.`, 404);
    }
  }
}
