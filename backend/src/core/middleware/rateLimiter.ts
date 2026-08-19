// ─────────────────────────────────────────────────────────────────────────────
// backend/src/core/middleware/rateLimiter.ts
//
// Rate limiting middleware using express-rate-limit.
// Protects endpoints from brute-force attacks and abuse.
//
// Two limiters are provided:
//   - `authLimiter`    — strict, for login/register (10 req/min)
//   - `apiLimiter`     — general, for all other API routes (100 req/min)
// ─────────────────────────────────────────────────────────────────────────────

import rateLimit from 'express-rate-limit';
import { env } from '../../config/env';

/** Strict limiter for authentication endpoints */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 10,               // 10 attempts per minute
  standardHeaders: true, // includes RateLimit-* headers in response
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please wait a minute and try again.',
  },
});

/** General limiter for all API routes */
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
});
