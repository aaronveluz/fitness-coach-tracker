import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { AppError } from '../errors/app.errors';
import { User, Role, Permission, RefreshToken } from '../models';
import { BaseRepository } from '../models/app.model';
import type { LoginFormData, RegisterFormData, UserDTO } from '@boilerplate/shared';
import { UserRole } from '@boilerplate/shared';

export interface TokenResponse {
  accessToken: string;
  user: UserDTO;
}

export class AuthRepository extends BaseRepository<RefreshToken> {
  constructor() {
    super(RefreshToken);
  }

  async findActiveToken(tokenHash: string): Promise<RefreshToken | null> {
    return this.model.findOne({
      where: {
        tokenHash: tokenHash,
        revoked: 0,
      },
    });
  }

  async revokeToken(tokenHash: string): Promise<boolean> {
    const token = await this.model.findOne({ where: { tokenHash: tokenHash } });
    if (!token) return false;
    await token.update({ revoked: 1 });
    return true;
  }

  async revokeAllUserTokens(userId: number): Promise<void> {
    await this.model.update(
      { revoked: 1 },
      {
        where: {
          userId: userId,
          revoked: 0,
        },
      }
    );
  }
}

export class AuthService {
  private authRepository = new AuthRepository();

  async resolveUserPermissions(user: User): Promise<string[]> {
    const fullUser = await User.findByPk(user.id, {
      include: [
        {
          model: Role,
          as: 'role',
          include: [
            {
              model: Permission,
              as: 'permissions',
              where: { isActive: 1 },
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

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async generateTokenPair(
    user: User,
    permissions: string[]
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
    const roleName = user.role?.name || 'viewer';

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

    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const tokenHash = this.hashToken(refreshToken);
    await this.authRepository.create({
      userId: user.id,
      tokenHash: tokenHash,
      expiresAt: expiresAt,
      revoked: 0,
    } as any);

    return { accessToken, refreshToken, expiresAt };
  }

  async login(data: LoginFormData): Promise<TokenResponse & { refreshToken: string; expiresAt: Date }> {
    const user = await User.findOne({
      where: { email: data.email.toLowerCase(), isActive: 1 },
      include: [{ model: Role, as: 'role' }],
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    await user.update({ lastLoginAt: new Date() });

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

    if (new Date() > activeToken.expiresAt) {
      await activeToken.update({ revoked: 1 });
      throw new AppError('Session expired. Please log in again.', 401);
    }

    const user = await User.findOne({
      where: { id: activeToken.userId, isActive: 1 },
      include: [{ model: Role, as: 'role' }],
    });

    if (!user) {
      throw new AppError('User account is deactivated or deleted.', 401);
    }

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

  async logout(refreshTokenValue: string): Promise<void> {
    if (!refreshTokenValue) return;
    const tokenHash = this.hashToken(refreshTokenValue);
    await this.authRepository.revokeToken(tokenHash);
  }

  async register(data: RegisterFormData): Promise<UserDTO> {
    const existing = await User.findOne({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      throw new AppError('Email address is already in use.', 409);
    }

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
