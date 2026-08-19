// ─────────────────────────────────────────────────────────────────────────────
// backend/src/core/utils/response.ts
//
// Uniform API response wrapper.
//
// WHY USE A WRAPPER?
//   Every endpoint returns the same shape: { success, data, message, meta }
//   This makes the frontend completely predictable — you always know exactly
//   what to expect, and error handling becomes a single, reusable function.
//
// HOW TO USE IN A CONTROLLER:
//   res.json(success(data, 'User created'));
//   res.status(400).json(failure('Validation failed', errors));
// ─────────────────────────────────────────────────────────────────────────────

import { type ApiResponse, type PaginationMeta } from '@boilerplate/shared';

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

/** Returns a failure response payload — never include stack traces or raw DB errors here */
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

/**
 * Custom Error class for operational errors (e.g. "User not found").
 * Throw this anywhere in your service layer — the global error handler
 * will catch it and return the correct HTTP status automatically.
 *
 * Example:
 *   throw new AppError('User not found', 404);
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // operational = safe to expose to client
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
