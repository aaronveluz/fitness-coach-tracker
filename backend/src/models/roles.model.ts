import { Model, DataTypes, type Association } from 'sequelize';
import { sequelize } from '../config/database';
import { updateById, findById } from './app.model';

export class Role extends Model {
  declare id: number;
  declare name: string;
  declare description: string | null;
  declare isActive: number;

  declare createdAt: Date;
  declare updatedAt: Date;
  declare createdBy: number | null;
  declare updatedBy: number | null;

  declare permissions?: Permission[];
  
  public static associations: {
    permissions: Association<Role, Permission>;
  };

  static updateById: ReturnType<typeof updateById<Role>>;
  static findById: ReturnType<typeof findById<Role>>;
}

Role.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'roles',
    underscored: true,
    timestamps: true,
  }
);

Role.updateById = updateById(Role);
Role.findById = findById(Role);

export class Permission extends Model {
  declare id: number;
  declare key: string;
  declare description: string | null;
  declare module: string;
  declare isActive: number;

  declare createdAt: Date;
  declare updatedAt: Date;
  declare createdBy: number | null;
  declare updatedBy: number | null;

  static updateById: ReturnType<typeof updateById<Permission>>;
  static findById: ReturnType<typeof findById<Permission>>;
}

Permission.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
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
    tableName: 'permissions',
    underscored: true,
    timestamps: true,
  }
);

Permission.updateById = updateById(Permission);
Permission.findById = findById(Permission);

export class RolePermission extends Model {
  declare roleId: number;
  declare permissionId: number;
}

RolePermission.init(
  {
    roleId: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      field: 'role_id',
    },
    permissionId: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      field: 'permission_id',
    },
  },
  {
    sequelize,
    tableName: 'role_permissions',
    underscored: true,
    timestamps: false,
  }
);
