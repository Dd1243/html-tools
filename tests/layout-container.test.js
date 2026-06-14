/**
 * Layout structure regression tests.
 * Run: node tests/layout-container.test.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const TOOLS_DIR = path.join(ROOT, 'tools');

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

function hasExactClass(html, className) {
  const classAttrs = html.matchAll(/\bclass=["']([^"']*)["']/g);
  for (const match of classAttrs) {
    if (match[1].split(/\s+/).includes(className)) return true;
  }
  return false;
}

console.log('\n=== Layout Container Tests ===\n');

function getHtmlFiles(dir) {
  const files = [];
  const pending = [dir];

  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) pending.push(entryPath);
      else if (entry.isFile() && entry.name.endsWith('.html')) files.push(entryPath);
    }
  }

  return files;
}

test('tool pages with .container styles render inside a container element', () => {
  const offenders = getHtmlFiles(TOOLS_DIR)
    .filter((filePath) => {
      const html = fs.readFileSync(filePath, 'utf8');
      const definesContainer = /\.container\s*\{/.test(html);
      const rendersContainer = hasExactClass(html, 'container');
      return definesContainer && !rendersContainer;
    })
    .map((filePath) => path.relative(ROOT, filePath));

  assert(
    offenders.length === 0,
    `Pages define .container but do not render it:\n  ${offenders.join('\n  ')}`
  );
});

console.log('\n=== Summary ===');
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);
console.log(`Total:  ${passCount + failCount}`);

process.exit(failCount > 0 ? 1 : 0);
