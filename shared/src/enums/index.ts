// ─────────────────────────────────────────────────────────────────────────────
// shared/src/enums/index.ts
//
// Central enum definitions used across frontend and backend.
// Defining enums here ensures the frontend and backend always use the same values.
// ─────────────────────────────────────────────────────────────────────────────

/** User roles in the system. Maps to the `roles` table. */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
  VIEWER = 'viewer',
}

/**
 * Permission action keys follow the pattern: resource.action
 * These are checked by the RBAC middleware on the backend
 * and by <PermissionGate> on the frontend.
 *
 * HOW TO ADD A NEW PERMISSION:
 * 1. Add an entry here
 * 2. Add a row to the database `permissions` table via a seeder
 * 3. Assign it to a role in `role_permissions`
 */
export enum Permission {
  // ── User Management ─────────────────────────────────────────────────────
  USERS_READ   = 'users.read',
  USERS_CREATE = 'users.create',
  USERS_UPDATE = 'users.update',
  USERS_DELETE = 'users.delete',
  USERS_EXPORT = 'users.export',

  // ── Role Management ──────────────────────────────────────────────────────
  ROLES_READ   = 'roles.read',
  ROLES_MANAGE = 'roles.manage',

  // ── Reports ──────────────────────────────────────────────────────────────
  REPORTS_READ   = 'reports.read',
  REPORTS_EXPORT = 'reports.export',

  // ── System Settings ──────────────────────────────────────────────────────
  SETTINGS_MANAGE = 'settings.manage',
}

/** HTTP status codes used in API responses */
export enum HttpStatus {
  OK                = 200,
  CREATED           = 201,
  NO_CONTENT        = 204,
  BAD_REQUEST       = 400,
  UNAUTHORIZED      = 401,
  FORBIDDEN         = 403,
  NOT_FOUND         = 404,
  CONFLICT          = 409,
  UNPROCESSABLE     = 422,
  INTERNAL_ERROR    = 500,
}
