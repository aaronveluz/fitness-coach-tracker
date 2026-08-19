'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// Migration: 001-create-foundation-tables.js
//
// Creates the core foundation tables that every business module builds on:
//   companies, branches, roles, permissions, users,
//   role_permissions, user_permissions, refresh_tokens,
//   audit_logs, system_settings, notifications
//
// STANDARD COLUMN CONVENTION (all tables follow this):
//   id, created_at, updated_at, created_by, updated_by, is_active
//
// RUN:  npm run db:migrate         (from backend/ or use npm -w backend run db:migrate)
// UNDO: npm run db:migrate:undo
// ─────────────────────────────────────────────────────────────────────────────

/** @param {import('sequelize').QueryInterface} qi */
module.exports = {
  async up(qi, Sequelize) {
    const DT = Sequelize.DataTypes;

    // ── Standard column set reused across all tables ──────────────────────────
    const STD = {
      created_at: { type: DT.DATE,    allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DT.DATE,    allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
      created_by: { type: DT.BIGINT.UNSIGNED, allowNull: true },
      updated_by: { type: DT.BIGINT.UNSIGNED, allowNull: true },
      is_active:  { type: DT.TINYINT(1), allowNull: false, defaultValue: 1 },
    };

    // ── companies ─────────────────────────────────────────────────────────────
    await qi.createTable('companies', {
      id:   { type: DT.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: DT.STRING(200), allowNull: false },
      code: { type: DT.STRING(50),  allowNull: false, unique: true },
      address:  DT.TEXT,
      phone:    DT.STRING(50),
      email:    DT.STRING(200),
      ...STD,
    });

    // ── branches ──────────────────────────────────────────────────────────────
    await qi.createTable('branches', {
      id:         { type: DT.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      company_id: { type: DT.BIGINT.UNSIGNED, allowNull: false, references: { model: 'companies', key: 'id' } },
      name:       { type: DT.STRING(200), allowNull: false },
      code:       { type: DT.STRING(50),  allowNull: false },
      address:    DT.TEXT,
      ...STD,
    });
    await qi.addIndex('branches', ['company_id']);

    // ── roles ─────────────────────────────────────────────────────────────────
    await qi.createTable('roles', {
      id:          { type: DT.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      name:        { type: DT.STRING(100), allowNull: false, unique: true },
      description: DT.TEXT,
      ...STD,
    });

    // ── permissions ───────────────────────────────────────────────────────────
    await qi.createTable('permissions', {
      id:          { type: DT.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      key:         { type: DT.STRING(100), allowNull: false, unique: true }, // e.g. 'users.create'
      description: DT.TEXT,
      module:      { type: DT.STRING(50),  allowNull: false },               // e.g. 'users'
      ...STD,
    });

    // ── users ─────────────────────────────────────────────────────────────────
    await qi.createTable('users', {
      id:             { type: DT.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      company_id:     { type: DT.BIGINT.UNSIGNED, allowNull: true, references: { model: 'companies', key: 'id' } },
      branch_id:      { type: DT.BIGINT.UNSIGNED, allowNull: true, references: { model: 'branches',  key: 'id' } },
      role_id:        { type: DT.BIGINT.UNSIGNED, allowNull: false, references: { model: 'roles', key: 'id' } },
      email:          { type: DT.STRING(255), allowNull: false, unique: true },
      password_hash:  { type: DT.STRING(255), allowNull: false },
      first_name:     { type: DT.STRING(100), allowNull: false },
      last_name:      { type: DT.STRING(100), allowNull: false },
      last_login_at:  DT.DATE,
      ...STD,
    });
    await qi.addIndex('users', ['email']);
    await qi.addIndex('users', ['company_id']);
    await qi.addIndex('users', ['role_id']);

    // ── role_permissions (join table) ─────────────────────────────────────────
    await qi.createTable('role_permissions', {
      role_id:       { type: DT.BIGINT.UNSIGNED, allowNull: false, references: { model: 'roles',       key: 'id' } },
      permission_id: { type: DT.BIGINT.UNSIGNED, allowNull: false, references: { model: 'permissions', key: 'id' } },
    });
    await qi.addConstraint('role_permissions', { fields: ['role_id', 'permission_id'], type: 'primary key', name: 'pk_role_permissions' });

    // ── user_permissions (per-user overrides) ─────────────────────────────────
    await qi.createTable('user_permissions', {
      user_id:       { type: DT.BIGINT.UNSIGNED, allowNull: false, references: { model: 'users',       key: 'id' } },
      permission_id: { type: DT.BIGINT.UNSIGNED, allowNull: false, references: { model: 'permissions', key: 'id' } },
      granted:       { type: DT.TINYINT(1), allowNull: false, defaultValue: 1 }, // 1=grant, 0=deny
    });
    await qi.addConstraint('user_permissions', { fields: ['user_id', 'permission_id'], type: 'primary key', name: 'pk_user_permissions' });

    // ── refresh_tokens ────────────────────────────────────────────────────────
    await qi.createTable('refresh_tokens', {
      id:         { type: DT.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      user_id:    { type: DT.BIGINT.UNSIGNED, allowNull: false, references: { model: 'users', key: 'id' } },
      token_hash: { type: DT.STRING(255), allowNull: false },  // stored hashed, not plaintext
      expires_at: { type: DT.DATE, allowNull: false },
      revoked:    { type: DT.TINYINT(1), allowNull: false, defaultValue: 0 },
      created_at: { type: DT.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await qi.addIndex('refresh_tokens', ['user_id']);
    await qi.addIndex('refresh_tokens', ['token_hash']);

    // ── audit_logs ────────────────────────────────────────────────────────────
    await qi.createTable('audit_logs', {
      id:          { type: DT.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      user_id:     { type: DT.BIGINT.UNSIGNED, allowNull: true, references: { model: 'users', key: 'id' } },
      action:      { type: DT.STRING(100), allowNull: false },  // e.g. 'users.update'
      resource:    { type: DT.STRING(100), allowNull: false },  // table name
      resource_id: DT.BIGINT.UNSIGNED,
      before_data: DT.TEXT('long'), // JSON string of before state
      after_data:  DT.TEXT('long'), // JSON string of after state
      ip_address:  DT.STRING(50),
      created_at:  { type: DT.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await qi.addIndex('audit_logs', ['user_id']);
    await qi.addIndex('audit_logs', ['resource', 'resource_id']);
    await qi.addIndex('audit_logs', ['created_at']);

    // ── system_settings ───────────────────────────────────────────────────────
    await qi.createTable('system_settings', {
      id:          { type: DT.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      company_id:  { type: DT.BIGINT.UNSIGNED, allowNull: true }, // null = global setting
      key:         { type: DT.STRING(100), allowNull: false },
      value:       DT.TEXT,
      description: DT.TEXT,
      ...STD,
    });
    await qi.addIndex('system_settings', ['key', 'company_id']);

    // ── notifications ─────────────────────────────────────────────────────────
    await qi.createTable('notifications', {
      id:         { type: DT.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      user_id:    { type: DT.BIGINT.UNSIGNED, allowNull: false, references: { model: 'users', key: 'id' } },
      title:      { type: DT.STRING(255), allowNull: false },
      message:    { type: DT.TEXT, allowNull: false },
      type:       { type: DT.STRING(50), defaultValue: 'info' }, // info, warning, error
      is_read:    { type: DT.TINYINT(1), defaultValue: 0 },
      created_at: { type: DT.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await qi.addIndex('notifications', ['user_id', 'is_read']);
  },

  async down(qi) {
    // Drop in reverse dependency order
    await qi.dropTable('notifications');
    await qi.dropTable('system_settings');
    await qi.dropTable('audit_logs');
    await qi.dropTable('refresh_tokens');
    await qi.dropTable('user_permissions');
    await qi.dropTable('role_permissions');
    await qi.dropTable('users');
    await qi.dropTable('permissions');
    await qi.dropTable('roles');
    await qi.dropTable('branches');
    await qi.dropTable('companies');
  },
};
