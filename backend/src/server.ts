// ─────────────────────────────────────────────────────────────────────────────
// backend/src/server.ts
//
// Entry point — connects to the database, then starts the HTTP server.
//
// START THE SERVER:
//   npm run dev    (development — hot reload via ts-node-dev)
//   npm start      (production — compiled JS)
// ─────────────────────────────────────────────────────────────────────────────

import { env } from './config/env';
import { connectDatabase } from './config/database';
import { createApp } from './app';
import { logger } from './core/utils/logger';

async function bootstrap() {
  // 1. Validate environment (already done in env.ts, this confirms it ran)
  logger.info(`🚀  Starting ${env.APP_NAME} in ${env.NODE_ENV} mode...`);

  // 2. Connect to MariaDB — exits if connection fails
  await connectDatabase();

  // 3. Create and configure the Express app
  const app = createApp();

  // 4. Start listening
  const server = app.listen(env.APP_PORT, () => {
    logger.info(`✅  Server running at http://localhost:${env.APP_PORT}`);
    logger.info(`📖  API docs:        http://localhost:${env.APP_PORT}/api/docs`);
    logger.info(`❤️   Health check:    http://localhost:${env.APP_PORT}/health`);
  });

  // ── Graceful Shutdown ───────────────────────────────────────────────────────
  // When the process receives a shutdown signal (e.g. Ctrl+C, Docker stop),
  // finish in-flight requests before closing the database pool.
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully...`);
    server.close(async () => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
    // Force exit after 10 seconds if something hangs
    setTimeout(() => process.exit(1), 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  // Log any unhandled promise rejections (bugs that weren't caught)
  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled promise rejection — check for missing await or try/catch');
  });
}

bootstrap();
