#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// scripts/update-docs.js
//
// AUTO-DOCUMENTATION UPDATER
// ──────────────────────────
// This script is called automatically by the git post-commit hook whenever
// changes are committed to the codebase. It keeps all documentation in sync.
//
// WHAT IT DOES:
//   1. Reads the current version from package.json
//   2. Scans changed files to detect which modules were modified
//   3. Appends a timestamped entry to CHANGELOG.md
//   4. Regenerates RELEASE_NOTES.md from all CHANGELOG entries
//   5. Updates the "Last Updated" header in ARCHITECTURE.md and TROUBLESHOOTING.md
//
// MANUAL RUN (for testing):
//   node scripts/update-docs.js --message "Fixed pagination bug" --type fix
//
// TYPES: feat | fix | docs | chore | security | breaking
// ─────────────────────────────────────────────────────────────────────────────

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

// ── Parse CLI args ────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] : null;
};

const manualMessage = getArg('--message');
const changeType    = getArg('--type') || 'chore';

// ── Helpers ───────────────────────────────────────────────────────────────────

function readJson(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return {}; }
}

function readFile(filePath) {
  try { return fs.readFileSync(filePath, 'utf8'); }
  catch { return ''; }
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function getGitInfo() {
  try {
    const hash    = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim();
    const author  = execSync('git log -1 --format=%an', { cwd: ROOT }).toString().trim();
    const message = execSync('git log -1 --format=%s',  { cwd: ROOT }).toString().trim();
    const files   = execSync('git diff-tree --no-commit-id -r --name-only HEAD', { cwd: ROOT })
                      .toString().trim().split('\n').filter(Boolean);
    return { hash, author, message, files };
  } catch {
    return { hash: 'manual', author: 'developer', message: manualMessage || 'Manual update', files: [] };
  }
}

function detectModules(files) {
  const modules = new Set();
  files.forEach(f => {
    const match = f.match(/(?:frontend|backend)\/src\/(?:modules|features)\/([^/]+)/);
    if (match) modules.add(match[1]);
    if (f.includes('database/migrations') || f.includes('database/seeders')) modules.add('database');
    if (f.includes('docs/')) modules.add('docs');
    if (f.includes('shared/')) modules.add('shared');
  });
  return [...modules].join(', ') || 'core';
}

function inferChangeType(message, files) {
  const msg = message.toLowerCase();
  if (changeType !== 'chore') return changeType;
  if (msg.startsWith('feat') || msg.startsWith('add')) return 'feat';
  if (msg.startsWith('fix') || msg.startsWith('bug')) return 'fix';
  if (msg.startsWith('security') || msg.startsWith('sec')) return 'security';
  if (msg.startsWith('break') || msg.includes('breaking')) return 'breaking';
  if (files.some(f => f.includes('docs/'))) return 'docs';
  return 'chore';
}

const TYPE_EMOJI = {
  feat:     '✨',
  fix:      '🐛',
  security: '🔒',
  breaking: '💥',
  docs:     '📝',
  chore:    '🔧',
};

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  const pkgPath = path.join(ROOT, 'package.json');
  const pkg     = readJson(pkgPath);
  const version = pkg.version || '1.0.0';

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toISOString();

  const git     = getGitInfo();
  const type    = inferChangeType(git.message, git.files);
  const modules = detectModules(git.files);
  const emoji   = TYPE_EMOJI[type] || '🔧';
  const message = manualMessage || git.message;

  console.log(`📝  Updating docs for: [${type}] ${message}`);

  // ── 1. Update CHANGELOG.md ────────────────────────────────────────────────

  const changelogPath = path.join(ROOT, 'docs', 'CHANGELOG.md');
  const changelog     = readFile(changelogPath);

  const entry = `
## [${version}] — ${dateStr}

### ${emoji} ${type.toUpperCase()}: ${message}

- **Modules affected:** \`${modules}\`
- **Commit:** \`${git.hash}\`
- **Author:** ${git.author}
- **Changed files:** ${git.files.length > 0 ? git.files.map(f => `\`${f}\``).join(', ') : 'N/A'}
- **Timestamp:** ${timeStr}

---
`;

  // Inject new entry after the header
  const CHANGELOG_HEADER = '<!-- ENTRIES_START -->';
  if (changelog.includes(CHANGELOG_HEADER)) {
    writeFile(changelogPath, changelog.replace(CHANGELOG_HEADER, CHANGELOG_HEADER + entry));
  } else {
    writeFile(changelogPath, changelog + entry);
  }

  // ── 2. Regenerate RELEASE_NOTES.md ───────────────────────────────────────

  const releaseNotesPath = path.join(ROOT, 'docs', 'RELEASE_NOTES.md');
  const updatedChangelog  = readFile(changelogPath);

  // Extract all ## [version] sections
  const sections = updatedChangelog.match(/## \[[\s\S]*?(?=## \[|$)/g) || [];
  const latest   = sections.slice(0, 10); // last 10 releases

  const releaseNotes = `# Release Notes

> Auto-generated from CHANGELOG.md — Last updated: ${timeStr}
> 
> Showing the **${latest.length} most recent changes**.
> For complete history, see [CHANGELOG.md](./CHANGELOG.md).

---

${latest.join('\n')}
`;

  writeFile(releaseNotesPath, releaseNotes);

  // ── 3. Update "Last Updated" stamp in key docs ───────────────────────────

  const docsToStamp = [
    'docs/ARCHITECTURE.md',
    'docs/TROUBLESHOOTING.md',
    'docs/AI_AGENT_RULES.md',
  ];

  const stampRegex = /^> \*\*Last Updated:\*\*.*/m;
  const newStamp   = `> **Last Updated:** ${timeStr} (commit \`${git.hash}\`)`;

  docsToStamp.forEach(docRelPath => {
    const docPath = path.join(ROOT, docRelPath);
    let content = readFile(docPath);
    if (!content) return;
    if (stampRegex.test(content)) {
      content = content.replace(stampRegex, newStamp);
    } else {
      // Add stamp after first heading
      content = content.replace(/^(# .+)$/m, `$1\n\n${newStamp}`);
    }
    writeFile(docPath, content);
  });

  console.log(`✅  Documentation updated successfully.`);
  console.log(`    → docs/CHANGELOG.md`);
  console.log(`    → docs/RELEASE_NOTES.md`);
  console.log(`    → docs/ARCHITECTURE.md (stamp updated)`);
}

main();
