import type { Model } from 'sequelize';
import type { BaseRepository } from '../models/app.model';
import type { PaginationQuery } from '@boilerplate/shared';
import { AppError } from '../errors/app.errors';
import { logger } from '../core/utils/logger';

export class BaseService<TModel extends Model> {
  protected repository: BaseRepository<TModel>;

  constructor(repository: BaseRepository<TModel>) {
    this.repository = repository;
  }

  async getAll(query: PaginationQuery, searchColumns: string[] = []) {
    return this.repository.findAll(query, searchColumns);
  }

  async getById(id: number): Promise<TModel> {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new AppError('Record not found', 404);
    }
    return record;
  }

  async create(data: any): Promise<TModel> {
    return this.repository.create(data);
  }

  async update(id: number, data: any): Promise<TModel> {
    const updated = await this.repository.update(id, data);
    if (!updated) {
      throw new AppError('Record not found', 404);
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    const success = await this.repository.softDelete(id);
    if (!success) {
      throw new AppError('Record not found', 404);
    }
  }
}

export function StartServices(): void {
  logger.info('🚀 App background services started successfully.');
}
