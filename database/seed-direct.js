/**
 * Standalone seeder using native mariadb client.
 * Usage: node database/seed-direct.js (from C:\BOILERPLATE)
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host:     process.env.DB_HOST     || '127.0.0.1',
  port:     parseInt(process.env.DB_PORT || '3306'),
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'enterprise_db',
  connectionLimit: 3,
});

const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

// Pre-computed bcrypt hashes (12 rounds)
const ADMIN_HASH = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oknOG/C3K'; // Admin@1234
const STAFF_HASH = '$2b$12$2nRqqLnqP2iIB.5s1J.zAuH2uFKf75GEYIbPRef5Pf3CFlggQof.u'; // Staff@1234

async function seed() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('✅ DB connected');

    // Roles
    await conn.query(`
      INSERT IGNORE INTO roles (name, description, is_active, created_at, updated_at) VALUES
      ('super_admin', 'Full system access',              1, '${now}', '${now}'),
      ('admin',       'Administrative access',           1, '${now}', '${now}'),
      ('manager',     'Manage users and view reports',   1, '${now}', '${now}'),
      ('staff',       'Day-to-day operations',           1, '${now}', '${now}'),
      ('viewer',      'Read-only access',                1, '${now}', '${now}')
    `);
    console.log('✅ Roles seeded');

    // Permissions
    await conn.query(`
      INSERT IGNORE INTO permissions (\`key\`, module, description, is_active, created_at, updated_at) VALUES
      ('users.read',      'users',    'View user list and profiles',      1, '${now}', '${now}'),
      ('users.create',    'users',    'Create new users',                 1, '${now}', '${now}'),
      ('users.update',    'users',    'Edit existing users',              1, '${now}', '${now}'),
      ('users.delete',    'users',    'Deactivate users',                 1, '${now}', '${now}'),
      ('users.export',    'users',    'Export user data',                 1, '${now}', '${now}'),
      ('roles.read',      'roles',    'View roles and permissions',       1, '${now}', '${now}'),
      ('roles.manage',    'roles',    'Create, edit, and assign roles',   1, '${now}', '${now}'),
      ('reports.read',    'reports',  'View reports',                     1, '${now}', '${now}'),
      ('reports.export',  'reports',  'Export reports',                   1, '${now}', '${now}'),
      ('settings.manage', 'settings', 'Manage system settings',          1, '${now}', '${now}')
    `);
    console.log('✅ Permissions seeded');

    // Fetch IDs
    const roles = await conn.query('SELECT id, name FROM roles');
    const roleMap = {};
    for (const r of roles) { if (r.name) roleMap[r.name] = Number(r.id); }

    const perms = await conn.query('SELECT id, `key` FROM permissions');
    const permMap = {};
    for (const p of perms) { if (p.key) permMap[p.key] = Number(p.id); }

    // Role-Permission mappings
    const mappings = {
      admin:   ['users.read','users.create','users.update','users.delete','users.export','roles.read','reports.read','reports.export','settings.manage'],
      manager: ['users.read','reports.read','reports.export'],
      staff:   ['users.read','reports.read'],
      viewer:  ['users.read'],
    };

    for (const [roleName, permKeys] of Object.entries(mappings)) {
      const roleId = roleMap[roleName];
      if (!roleId) continue;
      for (const pKey of permKeys) {
        const permId = permMap[pKey];
        if (!permId) continue;
        await conn.query(`INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`, [roleId, permId]);
      }
    }
    console.log('✅ Role-permissions mapped');

    // Users
    const superAdminId = roleMap['super_admin'];
    const staffId      = roleMap['staff'];

    await conn.query(
      `INSERT IGNORE INTO users (email, password_hash, first_name, last_name, role_id, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['admin@example.com', ADMIN_HASH, 'System', 'Administrator', superAdminId, 1, now, now]
    );
    await conn.query(
      `INSERT IGNORE INTO users (email, password_hash, first_name, last_name, role_id, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['staff@example.com', STAFF_HASH, 'Seeded', 'Staff', staffId, 1, now, now]
    );
    console.log('✅ Users seeded:');
    console.log('   admin@example.com / Admin@1234');
    console.log('   staff@example.com / Staff@1234');

    console.log('\n🎉 Seeding complete!');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

seed();
