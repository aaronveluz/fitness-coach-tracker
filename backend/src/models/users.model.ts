import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { updateById, findById } from './app.model';

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

  declare createdAt: Date;
  declare updatedAt: Date;
  declare createdBy: number | null;
  declare updatedBy: number | null;

  declare role?: any;
  declare permissionOverrides?: any[];

  static updateById: ReturnType<typeof updateById<User>>;
  static findById: ReturnType<typeof findById<User>>;
}

User.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    companyId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'company_id',
    },
    branchId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'branch_id',
    },
    roleId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'role_id',
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash',
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'first_name',
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'last_name',
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login_at',
    },
    isActive: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      field: 'is_active',
    },
  },
  {
    sequelize,
    tableName: 'users',
    underscored: true,
    timestamps: true,
  }
);

User.updateById = updateById(User);
User.findById = findById(User);

export class UserPermission extends Model {
  declare userId: number;
  declare permissionId: number;
  declare granted: number;
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
