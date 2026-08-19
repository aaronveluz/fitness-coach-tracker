#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// scripts/backup-database.js
//
// Automated MariaDB backup script.
//
// WHAT IT DOES:
//   1. Creates a timestamped mysqldump of the entire database
//   2. Gzips it to save disk space
//   3. Deletes backups older than RETENTION_DAYS
//   4. Logs what happened
//
// HOW TO RUN:
//   node scripts/backup-database.js
//
// HOW TO SCHEDULE (Windows Task Scheduler):
//   Action: node C:\path\to\your-app\scripts\backup-database.js
//   Trigger: Daily at 2:00 AM
//
// HOW TO SCHEDULE (Linux cron — add to crontab -e):
//   0 2 * * * cd /path/to/your-app && node scripts/backup-database.js >> logs/backup.log 2>&1
//
// BACKUPS ARE SAVED TO: ./backups/db/
// ─────────────────────────────────────────────────────────────────────────────

const { execSync, exec } = require('child_process');
const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// ── Configuration ─────────────────────────────────────────────────────────────
const CONFIG = {
  host:           process.env.DB_HOST     || '127.0.0.1',
  port:           process.env.DB_PORT     || '3306',
  database:       process.env.DB_NAME     || 'enterprise_db',
  user:           process.env.DB_USER     || 'root',
  password:       process.env.DB_PASSWORD || '',
  backupDir:      path.resolve(__dirname, '../backups/db'),
  retentionDays:  parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10),
  // Set to an email or webhook URL to receive alerts on backup failure
  alertWebhook:   process.env.BACKUP_ALERT_WEBHOOK || null,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log(`Created backup directory: ${dir}`);
  }
}

function getTimestamp() {
  return new Date().toISOString()
    .replace(/T/, '_')
    .replace(/:/g, '-')
    .split('.')[0]; // YYYY-MM-DD_HH-MM-SS
}

function sendAlert(message) {
  if (!CONFIG.alertWebhook) return;
  try {
    // Simple HTTP POST alert — replace with your preferred notification method
    const https = require('https');
    const body = JSON.stringify({ text: `🚨 Database Backup Alert: ${message}` });
    const url = new URL(CONFIG.alertWebhook);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': body.length },
    });
    req.write(body);
    req.end();
  } catch {
    // Alert failure must never crash the backup script
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function runBackup() {
  log('=== Database Backup Starting ===');
  log(`Database: ${CONFIG.database}@${CONFIG.host}:${CONFIG.port}`);

  ensureDir(CONFIG.backupDir);

  const timestamp = getTimestamp();
  const sqlFile   = path.join(CONFIG.backupDir, `${CONFIG.database}_${timestamp}.sql`);
  const gzFile    = `${sqlFile}.gz`;

  // ── Step 1: Run mysqldump ───────────────────────────────────────────────────
  log('Running mysqldump...');

  const dumpCmd = [
    'mysqldump',
    `--host=${CONFIG.host}`,
    `--port=${CONFIG.port}`,
    `--user=${CONFIG.user}`,
    `--password=${CONFIG.password}`,
    '--single-transaction',    // consistent snapshot without locking tables
    '--routines',              // include stored procedures
    '--triggers',              // include triggers
    '--events',                // include scheduled events
    '--set-gtid-purged=OFF',   // avoids GTID errors in MariaDB
    CONFIG.database,
  ].join(' ');

  try {
    execSync(`${dumpCmd} > "${sqlFile}"`, { stdio: ['pipe', 'pipe', 'pipe'] });
    log(`SQL dump created: ${path.basename(sqlFile)}`);
  } catch (err) {
    const msg = `mysqldump failed: ${err.message}`;
    log(`❌ ERROR: ${msg}`);
    sendAlert(msg);
    process.exit(1);
  }

  // ── Step 2: Gzip the dump ───────────────────────────────────────────────────
  log('Compressing backup...');
  try {
    const input  = fs.createReadStream(sqlFile);
    const output = fs.createWriteStream(gzFile);
    const gzip   = zlib.createGzip({ level: 9 });

    await new Promise((resolve, reject) => {
      input.pipe(gzip).pipe(output);
      output.on('finish', resolve);
      output.on('error', reject);
    });

    // Remove the uncompressed SQL file
    fs.unlinkSync(sqlFile);

    const sizeMB = (fs.statSync(gzFile).size / 1024 / 1024).toFixed(2);
    log(`✅ Backup created: ${path.basename(gzFile)} (${sizeMB} MB)`);
  } catch (err) {
    const msg = `Compression failed: ${err.message}`;
    log(`❌ ERROR: ${msg}`);
    sendAlert(msg);
    process.exit(1);
  }

  // ── Step 3: Delete old backups ──────────────────────────────────────────────
  log(`Cleaning backups older than ${CONFIG.retentionDays} days...`);
  const cutoff = Date.now() - CONFIG.retentionDays * 24 * 60 * 60 * 1000;
  let deletedCount = 0;

  const files = fs.readdirSync(CONFIG.backupDir);
  for (const file of files) {
    if (!file.endsWith('.sql.gz')) continue;
    const filePath = path.join(CONFIG.backupDir, file);
    const mtime    = fs.statSync(filePath).mtimeMs;
    if (mtime < cutoff) {
      fs.unlinkSync(filePath);
      log(`  Deleted old backup: ${file}`);
      deletedCount++;
    }
  }

  if (deletedCount === 0) log('  No old backups to delete.');

  // ── Step 4: Summary ─────────────────────────────────────────────────────────
  const remaining = fs.readdirSync(CONFIG.backupDir).filter(f => f.endsWith('.sql.gz'));
  log(`=== Backup Complete ===`);
  log(`  Backup file:       ${path.basename(gzFile)}`);
  log(`  Total backups:     ${remaining.length}`);
  log(`  Retention policy:  ${CONFIG.retentionDays} days`);
  log(`  Backup directory:  ${CONFIG.backupDir}`);
}

runBackup().catch(err => {
  console.error('Unexpected backup error:', err);
  process.exit(1);
});
