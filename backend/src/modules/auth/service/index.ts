import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../../config/env';
import { AppError } from '../../../core/utils/response';
import { User, Role, Permission, RefreshToken, UserPermission } from '../../../core/models';
import { AuthRepository } from '../repository';
import type { LoginFormData, RegisterFormData, UserDTO } from '@boilerplate/shared';
import { UserRole } from '@boilerplate/shared';

export interface TokenResponse {
  accessToken: string;
  user: UserDTO;
}

export class AuthService {
  private authRepository = new AuthRepository();

  /** Resolves all active permissions for a user (combining role permissions & overrides) */
  async resolveUserPermissions(user: User): Promise<string[]> {
    // Reload user with role, permissions, and overrides
    const fullUser = await User.findByPk(user.id, {
      include: [
        {
          model: Role,
          as: 'role',
          include: [
            {
              model: Permission,
              as: 'permissions',
              where: { is_active: 1 },
              required: false,
            },
          ],
        },
        {
          model: Permission,
          as: 'permissionOverrides',
          required: false,
        },
      ],
    });

    if (!fullUser) return [];

    const rolePermissions = fullUser.role?.permissions?.map((p: any) => p.key) || [];
    const overrides = fullUser.permissionOverrides || [];

    const grantedOverrides = overrides
      .filter((o: any) => o.UserPermission?.granted === 1)
      .map(o => o.key);

    const deniedOverrides = overrides
      .filter((o: any) => o.UserPermission?.granted === 0)
      .map(o => o.key);

    const permissionSet = new Set([
      ...rolePermissions.filter((p: any) => !deniedOverrides.includes(p)),
      ...grantedOverrides,
    ]);

    return Array.from(permissionSet);
  }

  /** Hashes a refresh token string for secure DB storage */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /** Helper to generate Access JWT (15 min) and Refresh string (uuid) */
  private async generateTokenPair(
    user: User,
    permissions: string[]
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
    const roleName = user.role?.name || 'viewer';

    // 1. Access Token (expires in 15 minutes)
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: roleName,
        permissions,
      },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    // 2. Refresh Token (long-lived cryptographically secure random UUID)
    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Save hashed version of refresh token to DB
    const tokenHash = this.hashToken(refreshToken);
    await this.authRepository.create({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
      revoked: 0,
    } as any);

    return { accessToken, refreshToken, expiresAt };
  }

  /** Authenticates user, creates session, returns tokens */
  async login(data: LoginFormData): Promise<TokenResponse & { refreshToken: string; expiresAt: Date }> {
    // Find user by email
    const user = await User.findOne({
      where: { email: data.email.toLowerCase(), is_active: 1 },
      include: [{ model: Role, as: 'role' }],
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login timestamp
    await user.update({ lastLoginAt: new Date() });

    // Load active permissions
    const permissions = await this.resolveUserPermissions(user);

    // Generate tokens
    const { accessToken, refreshToken, expiresAt } = await this.generateTokenPair(user, permissions);

    const userDto: UserDTO = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: (user.role?.name || 'viewer') as UserRole,
      permissions,
      companyId: user.companyId ?? undefined,
      branchId: user.branchId ?? undefined,
    };

    return { accessToken, refreshToken, expiresAt, user: userDto };
  }

  /** Rotates an active refresh token for a brand new pair */
  async refresh(
    refreshTokenValue: string
  ): Promise<TokenResponse & { refreshToken: string; expiresAt: Date }> {
    if (!refreshTokenValue) {
      throw new AppError('Refresh token is required', 401);
    }

    const tokenHash = this.hashToken(refreshTokenValue);
    const activeToken = await this.authRepository.findActiveToken(tokenHash);

    if (!activeToken) {
      throw new AppError('Invalid or expired session. Please log in again.', 401);
    }

    // Check if token has expired
    if (new Date() > activeToken.expiresAt) {
      await activeToken.update({ revoked: 1 });
      throw new AppError('Session expired. Please log in again.', 401);
    }

    // Fetch user details
    const user = await User.findOne({
      where: { id: activeToken.userId, is_active: 1 },
      include: [{ model: Role, as: 'role' }],
    });

    if (!user) {
      throw new AppError('User account is deactivated or deleted.', 401);
    }

    // ── Token Rotation (Security standard) ──────────────────────────────────
    // Revoke the old refresh token, then issue a new pair.
    await activeToken.update({ revoked: 1 });

    const permissions = await this.resolveUserPermissions(user);
    const { accessToken, refreshToken, expiresAt } = await this.generateTokenPair(user, permissions);

    const userDto: UserDTO = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: (user.role?.name || 'viewer') as UserRole,
      permissions,
      companyId: user.companyId ?? undefined,
      branchId: user.branchId ?? undefined,
    };

    return { accessToken, refreshToken, expiresAt, user: userDto };
  }

  /** Revokes the refresh token to destroy session */
  async logout(refreshTokenValue: string): Promise<void> {
    if (!refreshTokenValue) return;
    const tokenHash = this.hashToken(refreshTokenValue);
    await this.authRepository.revokeToken(tokenHash);
  }

  /** Optional helper to register users (if register endpoint is exposed) */
  async register(data: RegisterFormData): Promise<UserDTO> {
    // Check if email already exists
    const existing = await User.findOne({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      throw new AppError('Email address is already in use.', 409);
    }

    // Get default role for new users (viewer)
    const role = await Role.findOne({ where: { name: 'viewer' } });
    if (!role) {
      throw new AppError('Default role not found. System seeding issue.', 500);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await User.create({
      email: data.email.toLowerCase(),
      password_hash: passwordHash,
      first_name: data.firstName,
      last_name: data.lastName,
      role_id: role.id,
      is_active: 1,
    } as any);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: role.name as UserRole,
      permissions: [],
    };
  }
}
