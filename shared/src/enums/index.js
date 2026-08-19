// ─────────────────────────────────────────────────────────────────────────────
// shared/src/enums/index.ts
//
// Central enum definitions used across frontend and backend.
// Defining enums here ensures the frontend and backend always use the same values.
// ─────────────────────────────────────────────────────────────────────────────
/** User roles in the system. Maps to the `roles` table. */
export var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["MANAGER"] = "manager";
    UserRole["STAFF"] = "staff";
    UserRole["VIEWER"] = "viewer";
})(UserRole || (UserRole = {}));
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
export var Permission;
(function (Permission) {
    // ── User Management ─────────────────────────────────────────────────────
    Permission["USERS_READ"] = "users.read";
    Permission["USERS_CREATE"] = "users.create";
    Permission["USERS_UPDATE"] = "users.update";
    Permission["USERS_DELETE"] = "users.delete";
    Permission["USERS_EXPORT"] = "users.export";
    // ── Role Management ──────────────────────────────────────────────────────
    Permission["ROLES_READ"] = "roles.read";
    Permission["ROLES_MANAGE"] = "roles.manage";
    // ── Reports ──────────────────────────────────────────────────────────────
    Permission["REPORTS_READ"] = "reports.read";
    Permission["REPORTS_EXPORT"] = "reports.export";
    // ── System Settings ──────────────────────────────────────────────────────
    Permission["SETTINGS_MANAGE"] = "settings.manage";
})(Permission || (Permission = {}));
/** HTTP status codes used in API responses */
export var HttpStatus;
(function (HttpStatus) {
    HttpStatus[HttpStatus["OK"] = 200] = "OK";
    HttpStatus[HttpStatus["CREATED"] = 201] = "CREATED";
    HttpStatus[HttpStatus["NO_CONTENT"] = 204] = "NO_CONTENT";
    HttpStatus[HttpStatus["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpStatus[HttpStatus["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpStatus[HttpStatus["FORBIDDEN"] = 403] = "FORBIDDEN";
    HttpStatus[HttpStatus["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpStatus[HttpStatus["CONFLICT"] = 409] = "CONFLICT";
    HttpStatus[HttpStatus["UNPROCESSABLE"] = 422] = "UNPROCESSABLE";
    HttpStatus[HttpStatus["INTERNAL_ERROR"] = 500] = "INTERNAL_ERROR";
})(HttpStatus || (HttpStatus = {}));
