import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { failure } from '../views/rest.view';

export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: failure('Too many requests from this IP. Please try again later.'),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: failure('Too many login attempts. Please try again in 15 minutes.'),
});
