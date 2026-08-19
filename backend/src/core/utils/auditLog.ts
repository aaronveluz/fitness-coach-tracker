// ─────────────────────────────────────────────────────────────────────────────
// backend/src/core/utils/auditLog.ts
//
// Writes an immutable audit trail entry whenever data is created, updated,
// or deleted. This is critical for compliance, debugging, and accountability.
//
// HOW TO USE IN A SERVICE:
//   await writeAuditLog({
//     userId: req.user.id,
//     action: 'users.update',
//     resource: 'users',
//     resourceId: user.id,
//     beforeData: oldUser.toJSON(),
//     afterData: updatedUser.toJSON(),
//     ipAddress: req.ip,
//   });
// ─────────────────────────────────────────────────────────────────────────────

import { sequelize } from '../../config/database';
import { logger } from './logger';

interface AuditLogEntry {
  userId: number;
  action: string;        // e.g. 'users.create', 'roles.update'
  resource: string;      // table name, e.g. 'users'
  resourceId?: number;
  beforeData?: Record<string, unknown>;
  afterData?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Writes a row to the `audit_logs` table.
 * Silently logs a warning if it fails — audit log errors must never
 * crash the main operation.
 */
export async function writeAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await sequelize.query(
      `INSERT INTO audit_logs
         (user_id, action, resource, resource_id, before_data, after_data, ip_address, created_at)
       VALUES (:userId, :action, :resource, :resourceId, :beforeData, :afterData, :ipAddress, NOW())`,
      {
        replacements: {
          userId:     entry.userId,
          action:     entry.action,
          resource:   entry.resource,
          resourceId: entry.resourceId ?? null,
          beforeData: entry.beforeData ? JSON.stringify(entry.beforeData) : null,
          afterData:  entry.afterData  ? JSON.stringify(entry.afterData)  : null,
          ipAddress:  entry.ipAddress  ?? null,
        },
      },
    );
  } catch (err) {
    // Never throw — a failed audit log must not break the main request
    logger.warn({ err, entry }, 'Failed to write audit log entry');
  }
}
