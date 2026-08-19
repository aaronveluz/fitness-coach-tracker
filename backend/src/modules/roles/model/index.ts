import { Model, DataTypes, type Association } from 'sequelize';
import { sequelize } from '../../../config/database';

// ── Role Model ───────────────────────────────────────────────────────────────
export class Role extends Model {
  declare id: number;
  declare name: string;
  declare description: string | null;
  declare isActive: number;

  // Timestamps / Audit
  declare createdAt: Date;
  declare updatedAt: Date;
  declare createdBy: number | null;
  declare updatedBy: number | null;

  // Associations
  declare permissions?: Permission[];
  
  public static associations: {
    permissions: Association<Role, Permission>;
  };
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
    is_active: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'roles',
    underscored: true,
    timestamps: true,
  }
);

// ── Permission Model ─────────────────────────────────────────────────────────
export class Permission extends Model {
  declare id: number;
  declare key: string;
  declare description: string | null;
  declare module: string;
  declare isActive: number;

  // Timestamps / Audit
  declare createdAt: Date;
  declare updatedAt: Date;
  declare createdBy: number | null;
  declare updatedBy: number | null;
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
    is_active: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'permissions',
    underscored: true,
    timestamps: true,
  }
);

// ── RolePermission (Join Table) ──────────────────────────────────────────────
export class RolePermission extends Model {
  declare roleId: number;
  declare permissionId: number;
}

RolePermission.init(
  {
    role_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      references: { model: 'roles', key: 'id' },
    },
    permission_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      references: { model: 'permissions', key: 'id' },
    },
  },
  {
    sequelize,
    tableName: 'role_permissions',
    underscored: true,
    timestamps: false,
  }
);
