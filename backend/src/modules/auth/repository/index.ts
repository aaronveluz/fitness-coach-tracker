import { BaseRepository } from '../../../core/base/BaseRepository';
import { RefreshToken } from '../../../core/models';
import type { CreationAttributes } from 'sequelize';

export class AuthRepository extends BaseRepository<RefreshToken> {
  constructor() {
    super(RefreshToken);
  }

  /** Finds a non-revoked refresh token by its SHA256 hash */
  async findActiveToken(tokenHash: string): Promise<RefreshToken | null> {
    return this.model.findOne({
      where: {
        token_hash: tokenHash,
        revoked: 0,
      },
    });
  }

  /** Revokes a specific refresh token */
  async revokeToken(tokenHash: string): Promise<boolean> {
    const token = await this.model.findOne({ where: { token_hash: tokenHash } });
    if (!token) return false;
    await token.update({ revoked: 1 });
    return true;
  }

  /** Revokes all refresh tokens for a user (force logout everywhere) */
  async revokeAllUserTokens(userId: number): Promise<void> {
    await this.model.update(
      { revoked: 1 },
      {
        where: {
          user_id: userId,
          revoked: 0,
        },
      }
    );
  }
}
