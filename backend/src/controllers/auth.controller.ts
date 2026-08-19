import type { Request, Response } from 'express';
import { asyncHandler } from '../errors/app.errors';
import { success } from '../views/rest.view';
import { AuthService } from '../services/auth.service';
import { env } from '../config/env';

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

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { accessToken, refreshToken, expiresAt, user } = await authService.login(req.body);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: expiresAt,
    path: '/api/v1/auth',
  });

  res.json(success({ accessToken, user }, 'Login successful'));
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const oldRefreshToken = getCookie(req, 'refreshToken') || req.body.refreshToken;

  const { accessToken, refreshToken, expiresAt, user } = await authService.refresh(oldRefreshToken);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: expiresAt,
    path: '/api/v1/auth',
  });

  res.json(success({ accessToken, user }, 'Token refreshed successfully'));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = getCookie(req, 'refreshToken') || req.body.refreshToken;

  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/api/v1/auth',
  });

  res.json(success(null, 'Logged out successfully'));
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const newUser = await authService.register(req.body);
  res.status(201).json(success(newUser, 'User registered successfully'));
});
