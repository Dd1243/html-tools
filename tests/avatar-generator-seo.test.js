import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(ROOT, 'tools', 'generator', 'avatar-generator.html');
const html = fs.readFileSync(file, 'utf8');
const article = html.match(/<section class="article-section"[\s\S]*?>([\s\S]*?)<\/section>/i)?.[1] || '';
const articleText = article.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const description = html.match(/<meta name="description" content="([^"]*)"/i)?.[1] || '';
const schemaDescriptions = [...html.matchAll(/"description":\s*"([^"]*)"/g)].map((match) => match[1]);

assert.ok(description.length >= 120 && description.length <= 160);
assert.match(description, /文字头像生成器|字母头像/);
assert.doesNotMatch(description, /数据对账|图片压缩、图片压缩|持续更新的实用小工具合集/);
assert.equal((html.match(/<h1\b/gi) || []).length, 1);
assert.equal((html.match(/<main\b/gi) || []).length, 1);
assert.ok([...articleText].filter((char) => /[\u3400-\u9fff]/.test(char)).length >= 1000);
for (const href of ['/tools/generator/placeholder-image', '/tools/media/image-crop', '/tools/media/image-resize', '/tools/media/image-compressor']) {
  assert.match(html, new RegExp(`href="${href}"`, 'i'));
}
assert.ok(schemaDescriptions.every((value) => !/适用于 generator|覆盖.*关键词|适合日常办公/.test(value)));

console.log('PASS avatar generator SEO and internal link checks');
