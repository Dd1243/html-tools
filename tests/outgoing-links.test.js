/**
 * Outgoing link regression tests.
 * Run: node tests/outgoing-links.test.js
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

function isExcluded(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  return (
    rel === 'ByteDanceVerify.html' ||
    rel === 'offline.html' ||
    rel.startsWith('baidu_verify_') ||
    rel.endsWith('/index.html')
  );
}

function extractHrefValues(html) {
  return [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi)].map((match) =>
    match[1].trim()
  );
}

function isOutgoingHref(href) {
  return Boolean(
    href &&
      !href.startsWith('#') &&
      !/^javascript:/i.test(href) &&
      !/^mailto:/i.test(href) &&
      !/^tel:/i.test(href)
  );
}

console.log('\n=== Outgoing Link Tests ===\n');

test('indexable HTML pages have at least one outgoing link', () => {
  const offenders = getHtmlFiles(ROOT)
    .filter((filePath) => !isExcluded(filePath))
    .filter((filePath) => {
      const html = fs.readFileSync(filePath, 'utf8');
      return !extractHrefValues(html).some(isOutgoingHref);
    })
    .map((filePath) => path.relative(ROOT, filePath));

  assert(
    offenders.length === 0,
    `Pages have no outgoing links:\n  ${offenders.slice(0, 100).join('\n  ')}${
      offenders.length > 100 ? `\n  ...and ${offenders.length - 100} more` : ''
    }`
  );
});

console.log('\n=== Summary ===');
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);
console.log(`Total:  ${passCount + failCount}`);

process.exit(failCount > 0 ? 1 : 0);
