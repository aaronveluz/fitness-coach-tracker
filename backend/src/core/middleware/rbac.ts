// ─────────────────────────────────────────────────────────────────────────────
// backend/src/core/middleware/rbac.ts
//
// Role-Based Access Control (RBAC) middleware.
//
// CONCEPT:
//   After authentication (req.user is set), this middleware checks whether
//   the user has the required permission key.
//
// Permission keys follow the pattern: resource.action
//   e.g. 'users.create', 'reports.export', 'roles.manage'
//
// USAGE ON A ROUTE:
//   import { authenticate } from './auth';
//   import { authorize } from './rbac';
//   import { Permission } from '@boilerplate/shared';
//
//   router.post('/',
//     authenticate,
//     authorize(Permission.USERS_CREATE),
//     userController.create
//   );
// ─────────────────────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/response';

/**
 * Returns middleware that checks if the authenticated user has the required permission.
 * Must be used AFTER the `authenticate` middleware.
 */
export function authorize(...requiredPermissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    // super_admin bypasses all permission restrictions automatically
    if (req.user.role === 'super_admin') {
      return next();
    }

    const userPermissions = req.user.permissions ?? [];

    // Check that the user has ALL required permissions
    const hasAll = requiredPermissions.every(p => userPermissions.includes(p));

    if (!hasAll) {
      throw new AppError(
        'You do not have permission to perform this action.',
        403,
      );
    }

    next();
  };
}
