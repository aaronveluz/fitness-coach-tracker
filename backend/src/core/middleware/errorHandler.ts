// ─────────────────────────────────────────────────────────────────────────────
// backend/src/core/middleware/errorHandler.ts
//
// Global Express error handling middleware.
//
// HOW IT WORKS:
//   Any error thrown anywhere in the app (controllers, services, repositories)
//   will bubble up to here. This is the ONLY place that sends error responses.
//
// SECURITY RULE:
//   - Operational errors (AppError) → safe message sent to client
//   - Unexpected errors (bugs, DB crashes) → generic "Internal server error"
//     sent to client; full error logged internally only.
//
// HOW TO TRIGGER:
//   In any controller, service, or route: throw new AppError('Not found', 404)
//   OR: next(error)  from an async catch block
// ─────────────────────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, failure } from '../utils/response';
import { logger } from '../utils/logger';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // ── Zod Validation Error ────────────────────────────────────────────────
  // Thrown by the `validate` middleware when request body/query fails schema
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

  // ── Known Operational Error ──────────────────────────────────────────────
  // AppError is thrown intentionally (e.g., "User not found", "Unauthorized")
  if (err instanceof AppError) {
    logger.warn({ statusCode: err.statusCode, message: err.message, path: req.path });
    res.status(err.statusCode).json(failure(err.message));
    return;
  }

  // ── Unknown / Unexpected Error ───────────────────────────────────────────
  // This is a bug or infrastructure failure. Log the full error internally,
  // but NEVER send internal details to the client.
  logger.error(
    { err, path: req.path, method: req.method },
    'Unhandled error — this is a bug that needs investigation',
  );

  res.status(500).json(failure('An unexpected error occurred. Please try again later.'));
}

/**
 * Wraps async route handlers to automatically forward errors to errorHandler.
 * This eliminates repetitive try/catch blocks in every controller.
 *
 * USAGE:
 *   router.get('/users', asyncHandler(userController.getAll));
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
