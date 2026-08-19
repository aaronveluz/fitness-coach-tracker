// ─────────────────────────────────────────────────────────────────────────────
// backend/src/config/env.ts
//
// Environment variable loader with FAIL-FAST validation using Zod.
//
// WHY FAIL-FAST?
//   If the app starts with a missing DB password or a weak JWT secret,
//   it will fail in subtle and dangerous ways at runtime. Failing immediately
//   on startup with a clear error is much safer and easier to debug.
//
// HOW TO USE:
//   import { env } from '@/config/env';
//   const port = env.APP_PORT;
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from the monorepo root (two levels up from backend/src/config/)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const envSchema = z.object({
  // ── Application ────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_NAME: z.string().default('EnterpriseApp'),
  APP_PORT: z.coerce.number().default(4000),

  // ── Database ───────────────────────────────────────────────────────────────
  DB_HOST:         z.string().min(1, 'DB_HOST is required'),
  DB_PORT:         z.coerce.number().default(3306),
  DB_NAME:         z.string().min(1, 'DB_NAME is required'),
  DB_USER:         z.string().min(1, 'DB_USER is required'),
  DB_PASSWORD:     z.string().default(''),
  DB_POOL_MAX:     z.coerce.number().default(10),
  DB_POOL_MIN:     z.coerce.number().default(2),
  DB_POOL_ACQUIRE: z.coerce.number().default(30000),
  DB_POOL_IDLE:    z.coerce.number().default(10000),

  // ── JWT ────────────────────────────────────────────────────────────────────
  JWT_ACCESS_SECRET:     z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET:    z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  JWT_ACCESS_EXPIRES_IN:  z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // ── Security ───────────────────────────────────────────────────────────────
  CORS_ORIGIN:          z.string().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX:       z.coerce.number().default(100),

  // ── Redis ──────────────────────────────────────────────────────────────────
  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.coerce.number().default(6379),
});

// Parse and validate — throws a descriptive error if anything is missing/wrong
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌  Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  // Exit immediately — do not start with bad config
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
