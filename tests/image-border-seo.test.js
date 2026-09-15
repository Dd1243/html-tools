import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(ROOT, 'tools', 'media', 'image-border.html');
const html = fs.readFileSync(file, 'utf8');
const article = html.match(/<article class="seo-content"[\s\S]*?>([\s\S]*?)<\/article>/i)?.[1] || '';
const articleText = article.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const description = html.match(/<meta name="description" content="([^"]*)"/i)?.[1] || '';
const schemaDescriptions = [...html.matchAll(/"description":\s*"([^"]*)"/g)].map((match) => match[1]);

assert.ok(description.length >= 120 && description.length <= 160, `description length: ${description.length}`);
assert.match(description, /图片加边框|拍立得|胶片边框/);
assert.doesNotMatch(description, /音视频媒体工具|历史记录|持续更新的实用小工具合集|关键词/);
assert.equal((html.match(/<h1\b/gi) || []).length, 1);
assert.equal((html.match(/<main\b/gi) || []).length, 1);
assert.match(html, /<main[^>]*>[\s\S]*<article class="seo-content"/i);
assert.ok([...articleText].filter((char) => /[\u3400-\u9fff]/.test(char)).length >= 1000);
for (const href of ['/tools/media/image-crop', '/tools/media/image-collage', '/tools/media/image-compressor', '/tools/media/image-format-converter']) {
  assert.match(html, new RegExp(`href="${href}"`, 'i'));
}
assert.match(html, /<canvas[^>]*role="img"[^>]*aria-label=/i);
assert.ok(schemaDescriptions.every((value) => !/适用于 media|覆盖.*关键词|适合需要准确结果/.test(value)));

console.log('PASS image border SEO and internal link checks');
