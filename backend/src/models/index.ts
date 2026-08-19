import { User, UserPermission } from './users.model';
import { Role, Permission, RolePermission } from './roles.model';
import { RefreshToken } from './auth.model';

// ── Define Associations ──────────────────────────────────────────────────────

// 1. Role <-> Permission (Many-to-Many via RolePermission)
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions',
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles',
});

// 2. User <-> Role (Many-to-One)
User.belongsTo(Role, {
  foreignKey: 'role_id',
  as: 'role',
});
Role.hasMany(User, {
  foreignKey: 'role_id',
  as: 'users',
});

// 3. User <-> Permission Overrides (Many-to-Many via UserPermission)
User.belongsToMany(Permission, {
  through: UserPermission,
  foreignKey: 'user_id',
  otherKey: 'permission_id',
  as: 'permissionOverrides',
});
Permission.belongsToMany(User, {
  through: UserPermission,
  foreignKey: 'permission_id',
  otherKey: 'user_id',
  as: 'usersWithOverride',
});

// 4. User <-> RefreshToken (One-to-Many)
User.hasMany(RefreshToken, {
  foreignKey: 'user_id',
  as: 'refreshTokens',
});
RefreshToken.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

export {
  User,
  UserPermission,
  Role,
  Permission,
  RolePermission,
  RefreshToken,
};
