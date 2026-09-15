import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(ROOT, 'tools', 'generator', 'placeholder-image.html');
const html = fs.readFileSync(file, 'utf8');
const article = html.match(/<article class="seo-article"[\s\S]*?>([\s\S]*?)<\/article>/i)?.[1] || '';
const articleText = article.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const description = html.match(/<meta name="description" content="([^"]*)"/i)?.[1] || '';
const schemaDescriptions = [...html.matchAll(/"description":\s*"([^"]*)"/g)].map((match) => match[1]);

assert.ok(description.length >= 120 && description.length <= 160);
assert.match(description, /占位图生成器/);
assert.doesNotMatch(description, /日期时区|转换工具要求上传文件|持续更新的实用小工具合集/);
assert.equal((html.match(/<h1\b/gi) || []).length, 1);
assert.equal((html.match(/<main\b/gi) || []).length, 1);
assert.match(html, /<main class="page-shell">/i);
assert.ok([...articleText].filter((char) => /[\u3400-\u9fff]/.test(char)).length >= 1000);
for (const href of ['/tools/media/image-crop', '/tools/media/image-resize', '/tools/media/image-compressor', '/tools/media/image-format-converter']) {
  assert.match(html, new RegExp(`href="${href}"`, 'i'));
}
assert.ok(schemaDescriptions.every((value) => !/结果仅供参考。结果仅供参考|适用于 media|覆盖.*关键词/.test(value)));

console.log('PASS placeholder image SEO and internal link checks');
