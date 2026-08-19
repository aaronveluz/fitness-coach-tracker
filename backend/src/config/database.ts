// ─────────────────────────────────────────────────────────────────────────────
// backend/src/config/database.ts
//
// MariaDB connection using Sequelize ORM.
//
// WHY SEQUELIZE + MARIADB DIALECT?
//   Sequelize has native, battle-tested MariaDB support. Unlike Prisma,
//   it does not require a shadow database for migrations and plays well
//   with both ORM-managed queries and raw parameterized SQL when needed.
//
// CONNECTION POOLING:
//   The pool keeps a set of reusable connections open, avoiding the overhead
//   of opening a new connection for every HTTP request. Configuration is
//   loaded from environment variables so you can tune for your server.
// ─────────────────────────────────────────────────────────────────────────────

import { Sequelize } from 'sequelize';
import { env } from './env';
import { logger } from '../core/utils/logger';

export const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: 'mariadb',
  dialectOptions: {
    // Required by newer MariaDB versions for timezone handling
    timezone: 'Etc/GMT+0',
  },

  // ── Connection Pool ─────────────────────────────────────────────────────
  // Tune these based on your server's MariaDB max_connections setting.
  pool: {
    max: env.DB_POOL_MAX,        // max open connections
    min: env.DB_POOL_MIN,        // keep at least this many open
    acquire: env.DB_POOL_ACQUIRE, // ms to wait before throwing "connection timeout"
    idle: env.DB_POOL_IDLE,      // ms a connection can be idle before being released
  },

  // Disable Sequelize's own logging — we use Pino for all logging
  logging: false,

  // Automatically set createdAt / updatedAt fields — matches our schema standard
  define: {
    timestamps: true,
    underscored: true, // converts camelCase fields to snake_case DB columns
    paranoid: false,   // we use is_active (soft delete) instead of deletedAt
  },
});

/**
 * Attempts to authenticate (ping) the database connection.
 * Called once at server startup. If it fails, the server exits.
 */
export async function connectDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    logger.info('✅  Database connection established successfully.');
  } catch (error) {
    logger.error({ error }, '❌  Unable to connect to the database. Check your DB_* env vars.');
    process.exit(1);
  }
}
