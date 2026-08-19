// ─────────────────────────────────────────────────────────────────────────────
// database/config/config.js
//
// Sequelize CLI database configuration.
// Reads from environment variables — values set in root .env file.
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host:     process.env.DB_HOST     || '127.0.0.1',
    port:     process.env.DB_PORT     || 3306,
    dialect:  'mariadb',
    dialectOptions: { timezone: 'Etc/GMT+0' },
    logging:  false,
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: (process.env.DB_NAME || 'enterprise_db') + '_test',
    host:     process.env.DB_HOST || '127.0.0.1',
    port:     process.env.DB_PORT || 3306,
    dialect:  'mariadb',
    logging:  false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT || 3306,
    dialect:  'mariadb',
    dialectOptions: { timezone: 'Etc/GMT+0' },
    logging:  false,
  },
};
