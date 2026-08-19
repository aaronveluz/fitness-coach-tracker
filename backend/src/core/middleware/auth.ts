// ─────────────────────────────────────────────────────────────────────────────
// backend/src/core/middleware/auth.ts
//
// JWT authentication middleware.
//
// Verifies the Bearer token in the Authorization header.
// If valid, attaches the decoded user payload to req.user.
// If invalid or missing, returns 401 Unauthorized.
//
// USAGE ON A ROUTE:
//   router.get('/profile', authenticate, userController.getProfile);
// ─────────────────────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AppError } from '../utils/response';

/** Shape of the JWT payload — extends Express Request */
export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  permissions: string[];
  companyId?: number;
  branchId?: number;
}

// Extend Express's Request type to include our user payload
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Verifies JWT access token from the Authorization header.
 * Attaches decoded payload to req.user.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication required. Please log in.', 401);
  }

  const token = authHeader.substring(7); // strip "Bearer "

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    // Don't expose whether the token was expired vs invalid
    throw new AppError('Invalid or expired session. Please log in again.', 401);
  }
}
