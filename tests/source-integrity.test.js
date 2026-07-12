/**
 * Source integrity regression tests.
 * Run: node tests/source-integrity.test.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.join(path.dirname(__filename), '..');
const SCAN_ROOTS = ['offline.html', 'templates', 'tools'];
const offenders = [];

function scan(entryPath) {
  const absolutePath = path.join(ROOT, entryPath);
  const stat = fs.statSync(absolutePath);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(absolutePath)) scan(path.join(entryPath, entry));
    return;
  }
  if (!entryPath.endsWith('.html')) return;
  const source = fs.readFileSync(absolutePath, 'utf8');
  const count = [...source].filter((character) => character === '\uFFFD').length;
  if (count > 0) offenders.push(`${entryPath}: ${count}`);
}

for (const entryPath of SCAN_ROOTS) scan(entryPath);

if (offenders.length > 0) {
  console.error('FAIL HTML sources contain Unicode replacement characters');
  console.error(`  ${offenders.join('\n  ')}`);
  process.exit(1);
}

console.log('PASS HTML sources contain no Unicode replacement characters');