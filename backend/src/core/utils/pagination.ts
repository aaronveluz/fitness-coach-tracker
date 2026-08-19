// ─────────────────────────────────────────────────────────────────────────────
// backend/src/core/utils/pagination.ts
//
// Helper to build Sequelize-compatible pagination options from query params,
// and to format a standardized PaginationMeta response object.
// ─────────────────────────────────────────────────────────────────────────────

import type { PaginationMeta } from '@boilerplate/shared';

export interface PaginationOptions {
  limit: number;
  offset: number;
}

/**
 * Converts page/pageSize query params into Sequelize limit/offset.
 *
 * Example:
 *   const { limit, offset } = buildPagination({ page: 2, pageSize: 20 });
 *   // limit = 20, offset = 20
 */
export function buildPagination(query: {
  page?: number;
  pageSize?: number;
}): PaginationOptions {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));
  return {
    limit: pageSize,
    offset: (page - 1) * pageSize,
  };
}

/**
 * Builds the meta object included in paginated API responses.
 *
 * Example:
 *   const meta = buildPaginationMeta({ page: 1, pageSize: 20, totalItems: 85 });
 */
export function buildPaginationMeta(params: {
  page: number;
  pageSize: number;
  totalItems: number;
}): PaginationMeta {
  const { page, pageSize, totalItems } = params;
  const totalPages = Math.ceil(totalItems / pageSize);
  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
