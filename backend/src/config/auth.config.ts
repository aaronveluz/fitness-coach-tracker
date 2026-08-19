import { env } from './env';

export const DL_CONFIG = {
  host: env.CORS_ORIGIN,
  redirectURI: `${env.CORS_ORIGIN}/dashboard`,
  jwtSecret: env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: env.JWT_REFRESH_SECRET,
  accessTokenExpiry: '15m',
  refreshTokenExpiryDays: 7,
};
