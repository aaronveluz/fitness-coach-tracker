import type { Request, Response } from 'express';
import { asyncHandler } from '../../../core/middleware/errorHandler';
import { success } from '../../../core/utils/response';
import { AuthService } from '../service';
import { env } from '../../../config/env';

// ── Cookie Helper ────────────────────────────────────────────────────────────
// Pure JavaScript cookie parser to avoid introducing extra external packages
function getCookie(req: Request, name: string): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [key, val] = cookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(val);
    }
  }
  return null;
}

const authService = new AuthService();

export const authController = {
  /** Authenticates credentials and sets the HttpOnly refresh token cookie */
  login: asyncHandler(async (req: Request, res: Response) => {
    const { accessToken, refreshToken, expiresAt, user } = await authService.login(req.body);

    // Set HttpOnly cookie for refresh token rotation
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      expires: expiresAt,
      path: '/api/v1/auth', // only send to auth endpoints
    });

    res.json(success({ accessToken, user }, 'Login successful'));
  }),

  /** Rotates refresh token and returns new access token */
  refresh: asyncHandler(async (req: Request, res: Response) => {
    const oldRefreshToken = getCookie(req, 'refreshToken') || req.body.refreshToken;

    const { accessToken, refreshToken, expiresAt, user } = await authService.refresh(oldRefreshToken);

    // Rotate refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      expires: expiresAt,
      path: '/api/v1/auth',
    });

    res.json(success({ accessToken, user }, 'Token refreshed successfully'));
  }),

  /** Destroys active refresh session and clears cookie */
  logout: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = getCookie(req, 'refreshToken') || req.body.refreshToken;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    // Clear client cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/api/v1/auth',
    });

    res.json(success(null, 'Logged out successfully'));
  }),

  /** Registers a new user (default: viewer role) */
  register: asyncHandler(async (req: Request, res: Response) => {
    const newUser = await authService.register(req.body);
    res.status(201).json(success(newUser, 'User registered successfully'));
  }),
};
