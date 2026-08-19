import type { CorsOptions } from 'cors';
import { env } from '../config/env';

export const CorsConfig: CorsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
};
