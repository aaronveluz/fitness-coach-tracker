import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../../config/database';

export class User extends Model {
  declare id: number;
  declare companyId: number | null;
  declare branchId: number | null;
  declare roleId: number;
  declare email: string;
  declare passwordHash: string;
  declare firstName: string;
  declare lastName: string;
  declare lastLoginAt: Date | null;
  declare isActive: number;

  // Timestamps / Audit
  declare createdAt: Date;
  declare updatedAt: Date;
  declare createdBy: number | null;
  declare updatedBy: number | null;

  // Associations (declared for TypeScript typings, loaded at runtime)
  declare role?: any;
  declare permissionOverrides?: any[];
}

User.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    company_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: { model: 'companies', key: 'id' },
    },
    branch_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: { model: 'branches', key: 'id' },
    },
    role_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'roles', key: 'id' },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'users',
    underscored: true,
    timestamps: true,
  }
);

// ── UserPermission (Join Table for overrides) ────────────────────────────────
export class UserPermission extends Model {
  declare userId: number;
  declare permissionId: number;
  declare granted: number; // 1 = grant override, 0 = deny override
}

UserPermission.init(
  {
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      references: { model: 'users', key: 'id' },
    },
    permission_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      references: { model: 'permissions', key: 'id' },
    },
    granted: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'user_permissions',
    underscored: true,
    timestamps: false,
  }
);
