// ─────────────────────────────────────────────────────────────────────────────
// backend/src/core/middleware/validate.ts
//
// Reusable Zod validation middleware for Express routes.
//
// HOW TO USE ON A ROUTE:
//   import { validate } from '@/core/middleware/validate';
//   import { createUserSchema } from '@boilerplate/shared';
//
//   router.post('/', validate({ body: createUserSchema }), userController.create);
//
// You can validate body, query params, and URL params simultaneously.
// Invalid requests are rejected with a 422 before the controller is called.
// ─────────────────────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from 'express';
import { type ZodSchema } from 'zod';

interface ValidationSchemas {
  body?:   ZodSchema;
  query?:  ZodSchema;
  params?: ZodSchema;
}

/**
 * Returns an Express middleware that validates request body, query, and params
 * against the provided Zod schemas. Throws on the first failure.
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    // Parse and replace with the coerced/defaulted Zod output
    if (schemas.body)   req.body  = schemas.body.parse(req.body);
    if (schemas.query)  req.query = schemas.query.parse(req.query) as typeof req.query;
    if (schemas.params) req.params = schemas.params.parse(req.params);
    // If parsing succeeds, continue to the controller
    next();
  };
}
