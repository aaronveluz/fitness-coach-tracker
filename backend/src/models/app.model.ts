import type { Model, ModelStatic, FindOptions, WhereOptions, CreationAttributes } from 'sequelize';
import { Op } from 'sequelize';
import { buildPagination, buildPaginationMeta } from '../core/utils/pagination';
import type { PaginationQuery } from '@boilerplate/shared';

export interface FindAllResult<T> {
  rows: T[];
  meta: ReturnType<typeof buildPaginationMeta>;
}

export function updateById<TModel extends Model>(model: ModelStatic<TModel>) {
  return async (data: Partial<CreationAttributes<TModel>>, id: number): Promise<TModel | null> => {
    const record = await model.findByPk(id);
    if (!record) return null;
    return record.update(data) as Promise<TModel>;
  };
}

export function findById<TModel extends Model>(model: ModelStatic<TModel>) {
  return async (id: number): Promise<TModel | null> => {
    return model.findByPk(id) as Promise<TModel | null>;
  };
}

export class BaseRepository<TModel extends Model> {
  protected model: ModelStatic<TModel>;

  constructor(model: ModelStatic<TModel>) {
    this.model = model;
  }

  async findAll(
    query: PaginationQuery,
    searchColumns: string[] = [],
    extraWhere: WhereOptions = {},
  ): Promise<FindAllResult<TModel>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const { limit, offset } = buildPagination({ page, pageSize });

    const where: WhereOptions = { ...extraWhere };

    if (query.isActive !== undefined) {
      (where as Record<string, unknown>).is_active = query.isActive ? 1 : 0;
    }

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

  async findById(id: number): Promise<TModel | null> {
    return this.model.findByPk(id) as Promise<TModel | null>;
  }

  async create(data: CreationAttributes<TModel>): Promise<TModel> {
    return this.model.create(data) as Promise<TModel>;
  }

  async update(id: number, data: Partial<CreationAttributes<TModel>>): Promise<TModel | null> {
    const record = await this.model.findByPk(id);
    if (!record) return null;
    return record.update(data) as Promise<TModel>;
  }

  async softDelete(id: number): Promise<boolean> {
    const record = await this.model.findByPk(id);
    if (!record) return false;
    await record.update({ is_active: 0 });
    return true;
  }
}
