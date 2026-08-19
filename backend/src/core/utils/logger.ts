// ─────────────────────────────────────────────────────────────────────────────
// backend/src/core/utils/logger.ts
//
// Structured application logger using Pino.
//
// WHY PINO OVER console.log?
//   - Pino outputs structured JSON, which is parseable by log aggregators
//     (e.g. Datadog, CloudWatch, Loki) in production.
//   - In development, pino-pretty formats it as readable colored text.
//   - It's 5–10x faster than Winston.
//
// HOW TO USE:
//   import { logger } from '@/core/utils/logger';
//   logger.info('Server started on port 4000');
//   logger.error({ err }, 'Database connection failed');
// ─────────────────────────────────────────────────────────────────────────────

import pino from 'pino';
import { env } from '../../config/env';

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',

  // In development, use pino-pretty for human-readable output.
  // In production, output raw JSON for log aggregators.
  transport:
    env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});
