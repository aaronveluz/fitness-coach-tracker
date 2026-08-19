import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { failure } from '../views/rest.view';
import { logger } from '../core/utils/logger';

/**
 * Custom Error class for operational errors (e.g. "User not found").
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Express error handling middleware.
 */
export function ErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    err.errors.forEach(e => {
      const key = e.path.join('.');
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(e.message);
    });
    res.status(422).json(failure('Validation failed', fieldErrors));
    return;
  }

  if (err instanceof AppError) {
    logger.warn({ statusCode: err.statusCode, message: err.message, path: req.path });
    res.status(err.statusCode).json(failure(err.message));
    return;
  }

  logger.error(
    { err, path: req.path, method: req.method },
    'Unhandled error — this is a bug that needs investigation',
  );

  res.status(500).json(failure('An unexpected error occurred. Please try again later.'));
}

/**
 * Wraps async route handlers to forward caught errors to ErrorHandler.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 Handler for undefined routes.
 */
export function NotFoundResource(_req: Request, res: Response): void {
  res.status(404).json(failure('Route not found.'));
}
