import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { logger } from './core/utils/logger';
import { CorsConfig } from './guards/cors.guard';
import { apiLimiter } from './guards/rateLimiter.guard';
import { ErrorHandler, NotFoundResource } from './errors/app.errors';
import { StartServices } from './services/app.services';

// ── Router Imports ───────────────────────────────────────────────────────────
import AuthRoute from './routes/auth.route';
import UserRoute from './routes/user.route';
import SystemRoute from './routes/system.route';

export function createApp() {
  const app = express();

  // ── Security Headers ────────────────────────────────────────────────────────
  app.use(helmet());

  // ── CORS Guard ──────────────────────────────────────────────────────────────
  app.use(cors(CorsConfig));

  // ── Body Parsing ────────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ── Response Compression ────────────────────────────────────────────────────
  app.use(compression());

  // ── HTTP Request Logging ────────────────────────────────────────────────────
  app.use(pinoHttp({ logger }));

  // ── API Rate Limiting ───────────────────────────────────────────────────────
  app.use('/api', apiLimiter);

  // ── Swagger API Docs (dev only) ─────────────────────────────────────────────
  if (env.NODE_ENV !== 'production') {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    logger.info(`📖 API docs available at http://localhost:${env.APP_PORT}/api/docs`);
  }

  // ── Routes Mounting ─────────────────────────────────────────────────────────
  app.use('/system', SystemRoute);
  app.use('/api/v1/system', SystemRoute);
  app.use('/api/v1/auth', AuthRoute);
  app.use('/api/v1/users', UserRoute);

  // ── 404 & Error Handling ─────────────────────────────────────────────────────
  app.all('*', NotFoundResource);
  app.use(ErrorHandler);

  // ── Background Services ──────────────────────────────────────────────────────
  setTimeout(StartServices, 1000);

  return app;
}
