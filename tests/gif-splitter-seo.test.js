import fs from 'fs';
import assert from 'node:assert/strict';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(ROOT, 'tools', 'media', 'gif-splitter.html');
const html = fs.readFileSync(file, 'utf8');
const visibleText = html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] || '';
assert.ok(description.length >= 120 && description.length <= 160);
assert.match(html, /<h1>在线GIF分割工具<\/h1>/);
assert.equal((html.match(/<h1\b/gi) || []).length, 1);
assert.equal((html.match(/<h4\b/gi) || []).length, 0);
assert.match(html, /href="\/tools\/media\/"[^>]*>媒体工具分类<\/a>/);
assert.match(html, /document\.getElementById\("themeIcon"\)/);
assert.match(html, /if \(!icon \|\| !text\) return;/);
assert.ok([...visibleText].filter((char) => /[\u3400-\u9fff]/.test(char)).length >= 1200);

console.log('PASS GIF splitter SEO and regression checks');
