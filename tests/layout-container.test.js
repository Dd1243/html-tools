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
const GENERATOR_DIR = path.join(ROOT, 'tools', 'generator');

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

console.log('\n=== Layout Container Tests ===\n');

test('generator pages with .container styles render inside a container element', () => {
  const offenders = fs
    .readdirSync(GENERATOR_DIR)
    .filter((file) => file.endsWith('.html'))
    .map((file) => path.join(GENERATOR_DIR, file))
    .filter((filePath) => {
      const html = fs.readFileSync(filePath, 'utf8');
      const definesContainer = /\.container\s*\{/.test(html);
      const rendersContainer = /class=["'][^"']*\bcontainer\b/.test(html);
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
