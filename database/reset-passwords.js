require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const bcrypt = require('bcrypt');
const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host:     process.env.DB_HOST     || '127.0.0.1',
  port:     parseInt(process.env.DB_PORT || '3306'),
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'enterprise_db',
  connectionLimit: 2,
});

async function run() {
  let conn;
  try {
    conn = await pool.getConnection();

    const adminHash = await bcrypt.hash('Admin@1234', 12);
    const staffHash = await bcrypt.hash('Staff@1234', 12);

    await conn.query('UPDATE users SET password_hash = ? WHERE email = ?', [adminHash, 'admin@example.com']);
    await conn.query('UPDATE users SET password_hash = ? WHERE email = ?', [staffHash, 'staff@example.com']);

    console.log('✅ Passwords updated successfully');
    console.log('   admin@example.com → Admin@1234');
    console.log('   staff@example.com → Staff@1234');

    // Verify by reading back
    const [rows] = await conn.query('SELECT email, password_hash FROM users');
    for (const row of rows) {
      const testPass = row.email === 'admin@example.com' ? 'Admin@1234' : 'Staff@1234';
      const ok = await bcrypt.compare(testPass, row.password_hash);
      console.log(`   Verify ${row.email}: ${ok ? '✅ MATCH' : '❌ MISMATCH'}`);
    }
  } catch (e) {
    console.error('❌', e.message);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

run();
