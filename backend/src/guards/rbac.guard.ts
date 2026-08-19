import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app.errors';

export function requirePermission(requiredPermission: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    if (req.user.role === 'admin') {
      next();
      return;
    }

    const userPermissions = req.user.permissions || [];

    if (!userPermissions.includes(requiredPermission)) {
      throw new AppError(
        `Access denied. Required permission: '${requiredPermission}'`,
        403,
      );
    }

    next();
  };
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`,
        403,
      );
    }

    next();
  };
}

export const HasRead = requirePermission('read');
