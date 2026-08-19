import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse, PaginationMeta } from '@boilerplate/shared';

/** Returns a successful response payload */
export function success<T>(
  data: T,
  message?: string,
  meta?: PaginationMeta,
): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
    ...(meta && { meta }),
  };
}

/** Returns a failure response payload */
export function failure(
  message: string,
  errors?: Record<string, string[]>,
): ApiResponse<never> {
  return {
    success: false,
    message,
    ...(errors && { errors }),
  };
}

/** RestTemplate middleware to attach data/meta from res.locals */
export const RestTemplate = (_req: Request, res: Response, next: NextFunction) => {
  const { data = null, meta = undefined, message = undefined } = res.locals;
  res.json(success(data, message, meta));
  next();
};
