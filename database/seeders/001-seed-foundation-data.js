'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// Seeder: 001-seed-foundation-data.js
//
// Seeds essential data required for the app to function:
//   - Default roles
//   - All permission keys
//   - Default super admin user
//
// WHY NO bcrypt HERE?
//   bcrypt is not available in the database/ package. The password below is
//   a pre-computed bcrypt hash of 'Admin@1234' (12 rounds).
//   To generate a new hash: node -e "require('bcrypt').hash('YourPass',12).then(console.log)"
//
// IDEMPOTENT: Safe to run multiple times — uses INSERT IGNORE raw SQL.
// RUN: npm run db:seed (from backend/)
// ─────────────────────────────────────────────────────────────────────────────

// Pre-computed bcrypt hashes (12 rounds)
// CHANGE THESE in production by running the command:
// node -e "require('bcrypt').hash('YourPass',12).then(console.log)"
const ADMIN_PASSWORD_HASH = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oknOG/C3K'; // Admin@1234
const STAFF_PASSWORD_HASH = '$2b$12$2nRqqLnqP2iIB.5s1J.zAuH2uFKf75GEYIbPRef5Pf3CFlggQof.u'; // Staff@1234

module.exports = {
  async up(qi) {
    const db = qi.sequelize;
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // ── Roles ─────────────────────────────────────────────────────────────────
    await db.query(`
      INSERT IGNORE INTO roles (name, description, is_active, created_at, updated_at) VALUES
      ('super_admin', 'Full system access',              1, '${now}', '${now}'),
      ('admin',       'Administrative access',           1, '${now}', '${now}'),
      ('manager',     'Manage users and view reports',   1, '${now}', '${now}'),
      ('staff',       'Day-to-day operations',           1, '${now}', '${now}'),
      ('viewer',      'Read-only access',                1, '${now}', '${now}')
    `);

    // ── Permissions ───────────────────────────────────────────────────────────
    await db.query(`
      INSERT IGNORE INTO permissions (\`key\`, module, description, is_active, created_at, updated_at) VALUES
      ('users.read',      'users',    'View user list and profiles',         1, '${now}', '${now}'),
      ('users.create',    'users',    'Create new users',                    1, '${now}', '${now}'),
      ('users.update',    'users',    'Edit existing users',                 1, '${now}', '${now}'),
      ('users.delete',    'users',    'Deactivate users',                    1, '${now}', '${now}'),
      ('users.export',    'users',    'Export user data',                    1, '${now}', '${now}'),
      ('roles.read',      'roles',    'View roles and permissions',          1, '${now}', '${now}'),
      ('roles.manage',    'roles',    'Create, edit, and assign roles',      1, '${now}', '${now}'),
      ('reports.read',    'reports',  'View reports',                        1, '${now}', '${now}'),
      ('reports.export',  'reports',  'Export reports',                      1, '${now}', '${now}'),
      ('settings.manage', 'settings', 'Manage system settings',             1, '${now}', '${now}')
    `);

    // ── Fetch Role & Permission IDs to associate them ─────────────────────────
    const [roles] = await db.query('SELECT id, name FROM roles');
    const roleIdMap = {};
    roles.forEach(r => { roleIdMap[r.name] = r.id; });

    const [dbPermissions] = await db.query('SELECT id, `key` FROM permissions');
    const permissionIdMap = {};
    dbPermissions.forEach(p => { permissionIdMap[p.key] = p.id; });

    // ── Role-Permission Mappings ───────────────────────────────────────────────
    const mappings = {
      admin:   ['users.read','users.create','users.update','users.delete','users.export','roles.read','reports.read','reports.export','settings.manage'],
      manager: ['users.read','reports.read','reports.export'],
      staff:   ['users.read','reports.read'],
      viewer:  ['users.read'],
    };

    for (const [roleName, permKeys] of Object.entries(mappings)) {
      const roleId = roleIdMap[roleName];
      if (!roleId) continue;
      for (const pKey of permKeys) {
        const permId = permissionIdMap[pKey];
        if (!permId) continue;
        await db.query(
          `INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (${roleId}, ${permId})`
        );
      }
    }

    // ── Default Users ─────────────────────────────────────────────────────────
    const superAdminRoleId = roleIdMap['super_admin'];
    const staffRoleId      = roleIdMap['staff'];

    if (!superAdminRoleId || !staffRoleId) {
      throw new Error('Required roles not found after seeding — check roles insert');
    }

    await db.query(`
      INSERT IGNORE INTO users (email, password_hash, first_name, last_name, role_id, is_active, created_at, updated_at) VALUES
      ('admin@example.com', '${ADMIN_PASSWORD_HASH}', 'System',  'Administrator', ${superAdminRoleId}, 1, '${now}', '${now}'),
      ('staff@example.com', '${STAFF_PASSWORD_HASH}', 'Seeded',  'Staff',         ${staffRoleId},      1, '${now}', '${now}')
    `);
  },

  async down(qi) {
    const db = qi.sequelize;
    await db.query(`DELETE FROM users WHERE email IN ('admin@example.com','staff@example.com')`);
    await db.query(`DELETE FROM role_permissions WHERE 1=1`);
    await db.query(`DELETE FROM permissions WHERE 1=1`);
    await db.query(`DELETE FROM roles WHERE 1=1`);
  },
};
