/**
 * H1 validation tests.
 * Run: node tests/h1.test.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

const EXCLUDED_PATTERNS = [
  /^404\.html$/,
  /^ByteDanceVerify\.html$/,
  /^baidu_verify_/,
  /^BingSiteAuth\.xml$/,
  /^offline\.html$/,
  /^design-reference[\\/]/,
  /^design-templates[\\/]/,
  /^templates[\\/]/,
];

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
  const skipDirs = new Set(['.git', 'node_modules', 'screenshots', 'docs']);

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
  const relative = path.relative(ROOT, filePath);
  return EXCLUDED_PATTERNS.some((pattern) => pattern.test(relative));
}

function stripNonRenderedContainers(html) {
  return html.replace(
    /<(script|style|textarea|template)\b[^>]*>[\s\S]*?<\/\1>/gi,
    ''
  );
}

function getH1Texts(html) {
  const renderedHtml = stripNonRenderedContainers(html);
  return [...renderedHtml.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((match) =>
    match[1]
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function isIndexable(html) {
  const robots = html.match(/<meta\s+[^>]*name=["']robots["'][^>]*>/i);
  if (!robots) return true;
  const content = robots[0].match(/content=["']([^"']*)["']/i)?.[1] || '';
  return !/\bnoindex\b/i.test(content);
}

console.log('\n=== H1 Tests ===\n');

test('indexable HTML pages have exactly one non-empty rendered h1', () => {
  const invalid = getHtmlFiles(ROOT)
    .filter((filePath) => !isExcluded(filePath))
    .map((filePath) => {
      const html = fs.readFileSync(filePath, 'utf8');
      return {
        file: path.relative(ROOT, filePath),
        h1Texts: getH1Texts(html),
        indexable: isIndexable(html),
      };
    })
    .filter((row) => row.indexable)
    .filter(
      (row) =>
        row.h1Texts.length !== 1 ||
        row.h1Texts.some((text) => text.length === 0 || /\$\{[^}]+\}/.test(text))
    );

  assert(
    invalid.length === 0,
    `Invalid H1 pages:\n  ${invalid
      .slice(0, 120)
      .map((row) => `${row.file} (${row.h1Texts.length}: ${row.h1Texts.join(' | ') || 'missing'})`)
      .join('\n  ')}${invalid.length > 120 ? `\n  ... ${invalid.length - 120} more` : ''}`
  );
});

console.log('\n=== Summary ===');
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);
console.log(`Total:  ${passCount + failCount}`);

process.exit(failCount > 0 ? 1 : 0);
