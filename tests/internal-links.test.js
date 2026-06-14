/**
 * Internal link regression tests.
 * Run: node tests/internal-links.test.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
    passCount++;
  } catch (e) {
    console.log(`FAIL ${name}`);
    console.log(`  Error: ${e.message}`);
    failCount++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function getHtmlFiles(dir) {
  const files = [];
  const pending = [dir];
  const skipDirs = new Set(['.git', 'node_modules', 'design-reference', 'design-templates', 'templates']);

  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!skipDirs.has(entry.name)) pending.push(entryPath);
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        files.push(entryPath);
      }
    }
  }

  return files;
}

function extractHrefValues(html) {
  return [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi)].map((match) =>
    match[1].trim()
  );
}

function localTargetPath(href, sourceFile) {
  if (
    !href ||
    href.startsWith('#') ||
    /^javascript:/i.test(href) ||
    /^mailto:/i.test(href) ||
    /^tel:/i.test(href)
  ) {
    return null;
  }

  const withoutFragment = href.split('#')[0].split('?')[0];
  if (!withoutFragment) return null;
  if (withoutFragment.includes('$')) return null;

  let pathname;
  if (/^https?:\/\//i.test(withoutFragment)) {
    let parsed;
    try {
      parsed = new URL(withoutFragment);
    } catch {
      return null;
    }
    if (parsed.hostname !== 'essays4u.net' && parsed.hostname !== 'www.essays4u.net') return null;
    pathname = decodeURIComponent(parsed.pathname);
  } else if (withoutFragment.startsWith('/')) {
    pathname = withoutFragment;
  } else {
    const resolved = path.resolve(path.dirname(sourceFile), withoutFragment);
    if (!resolved.startsWith(ROOT)) return null;
    return resolved;
  }

  if (pathname === '/') return path.join(ROOT, 'index.html');
  return path.join(ROOT, pathname.replace(/^\/+/, ''));
}

function targetExists(targetPath) {
  if (!targetPath) return true;
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) return true;
  if (fs.existsSync(`${targetPath}.html`)) return true;
  if (fs.existsSync(path.join(targetPath, 'index.html'))) return true;
  return false;
}

console.log('\n=== Internal Link Tests ===\n');

test('internal links point to existing local pages', () => {
  const offenders = [];

  for (const filePath of getHtmlFiles(ROOT)) {
    const html = fs.readFileSync(filePath, 'utf8');
    for (const href of extractHrefValues(html)) {
      const targetPath = localTargetPath(href, filePath);
      if (!targetExists(targetPath)) {
        offenders.push(`${path.relative(ROOT, filePath)} -> ${href}`);
      }
    }
  }

  assert(
    offenders.length === 0,
    `Broken internal links:\n  ${offenders.slice(0, 100).join('\n  ')}${
      offenders.length > 100 ? `\n  ...and ${offenders.length - 100} more` : ''
    }`
  );
});

console.log('\n=== Summary ===');
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);
console.log(`Total:  ${passCount + failCount}`);

process.exit(failCount > 0 ? 1 : 0);
