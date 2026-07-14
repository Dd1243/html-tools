/**
 * Meta description quality tests.
 * Run: node tests/meta-description.test.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const MIN_LENGTH = 120;
const MAX_LENGTH = 160;

const EXCLUDED_PATTERNS = [
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

function getHeadHtml(html) {
  const match = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
  return match ? match[1] : '';
}

function getMetaDescription(html) {
  const head = getHeadHtml(html);
  const tag = head.match(/<meta\s+[^>]*name=["']description["'][^>]*>/i);
  if (!tag) return null;
  const content = tag[0].match(/content=["']([^"']*)["']/i);
  return content
    ? content[1]
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim()
    : '';
}

function isExcluded(filePath) {
  const relative = path.relative(ROOT, filePath);
  return EXCLUDED_PATTERNS.some((pattern) => pattern.test(relative));
}

console.log('\n=== Meta Description Tests ===\n');

test('indexable HTML pages have unique 120-160 character meta descriptions', () => {
  const rows = getHtmlFiles(ROOT)
    .filter((filePath) => !isExcluded(filePath))
    .map((filePath) => {
      const html = fs.readFileSync(filePath, 'utf8');
      const head = getHeadHtml(html);
      const descriptionTagCount = (
        head.match(/<meta\s+[^>]*name=["']description["'][^>]*>/gi) || []
      ).length;
      const description = getMetaDescription(html);
      return {
        file: path.relative(ROOT, filePath),
        description,
        descriptionTagCount,
        length: description == null ? null : [...description].length,
      };
    });

  const invalid = rows.filter(
    (row) =>
      row.descriptionTagCount !== 1 ||
      row.description == null ||
      row.description === '' ||
      row.length < MIN_LENGTH ||
      row.length > MAX_LENGTH ||
      /它聚焦[。；，,\s]/.test(row.description) ||
      /是 的/.test(row.description) ||
      /无需安装完成任务/.test(row.description) ||
      /tools、webutils/i.test(row.description) ||
      /支持[^。]{1,20}常见场景。支持[^。]{1,20}常见场景。/.test(row.description)
  );

  const seen = new Map();
  const duplicates = [];
  for (const row of rows) {
    if (!row.description) continue;
    if (seen.has(row.description)) {
      duplicates.push(`${seen.get(row.description)} == ${row.file}`);
    } else {
      seen.set(row.description, row.file);
    }
  }

  assert(
    invalid.length === 0 && duplicates.length === 0,
    [
      invalid.length
        ? `Invalid descriptions:\n  ${invalid
            .slice(0, 80)
            .map((row) => `${row.file} (${row.length ?? 'missing'}, tags:${row.descriptionTagCount})`)
            .join('\n  ')}${invalid.length > 80 ? `\n  ... ${invalid.length - 80} more` : ''}`
        : '',
      duplicates.length
        ? `Duplicate descriptions:\n  ${duplicates.slice(0, 40).join('\n  ')}${
            duplicates.length > 40 ? `\n  ... ${duplicates.length - 40} more` : ''
          }`
        : '',
    ]
      .filter(Boolean)
      .join('\n')
  );
});

console.log('\n=== Summary ===');
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);
console.log(`Total:  ${passCount + failCount}`);

process.exit(failCount > 0 ? 1 : 0);
