/**
 * Footer link regression tests.
 * Run: node tests/footer-links.test.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const TOOLS_DIR = path.join(ROOT, 'tools');
const REQUIRED_LINKS = ['/about', '/contact', '/terms', '/privacy-policy'];

function getHtmlFiles(dir) {
  const files = [];
  const pending = [dir];
  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) pending.push(entryPath);
      if (entry.isFile() && entry.name.endsWith('.html')) files.push(entryPath);
    }
  }
  return files;
}

const offenders = [];
for (const filePath of getHtmlFiles(TOOLS_DIR)) {
  const html = fs.readFileSync(filePath, 'utf8');
  const footer = html.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0];
  const relativePath = path.relative(ROOT, filePath);
  if (!footer) {
    offenders.push(`${relativePath}: missing footer`);
    continue;
  }
  if (/href=["'](?:#|javascript:void\(0\))["']/i.test(footer)) offenders.push(`${relativePath}: placeholder footer link`);
  for (const href of REQUIRED_LINKS) {
    const pattern = new RegExp(`href=["']${href}["']`, 'i');
    if (!pattern.test(footer)) offenders.push(`${relativePath}: missing ${href}`);
  }
}

if (offenders.length > 0) {
  console.error('FAIL tool footers contain real policy links');
  console.error(`  ${offenders.slice(0, 100).join('\n  ')}`);
  if (offenders.length > 100) console.error(`  ...and ${offenders.length - 100} more`);
  process.exit(1);
}
console.log('PASS tool footers contain real policy links');