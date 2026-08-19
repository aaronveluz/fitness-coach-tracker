import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { updateById, findById } from './app.model';

export class RefreshToken extends Model {
  declare id: number;
  declare userId: number;
  declare tokenHash: string;
  declare expiresAt: Date;
  declare revoked: number;
  declare createdAt: Date;

  static updateById: ReturnType<typeof updateById<RefreshToken>>;
  static findById: ReturnType<typeof findById<RefreshToken>>;
}

RefreshToken.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'user_id',
    },
    tokenHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'token_hash',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
    },
    revoked: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'refresh_tokens',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  }
);

RefreshToken.updateById = updateById(RefreshToken);
RefreshToken.findById = findById(RefreshToken);
