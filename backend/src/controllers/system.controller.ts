import type { Request, Response } from 'express';
import { asyncHandler } from '../errors/app.errors';
import { success } from '../views/rest.view';
import { env } from '../config/env';

export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  res.json(
    success(
      {
        status: 'ok',
        appName: env.APP_NAME,
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString(),
      },
      'System health optimal',
    ),
  );
});

export const getSystemInfo = asyncHandler(async (_req: Request, res: Response) => {
  res.json(
    success(
      {
        appName: env.APP_NAME,
        version: '1.0.0',
        nodeVersion: process.version,
        platform: process.platform,
      },
      'System information',
    ),
  );
});
