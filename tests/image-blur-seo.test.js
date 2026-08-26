import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(ROOT, 'tools', 'media', 'image-blur.html');
const html = fs.readFileSync(file, 'utf8');
const article = html.match(/<article class="seo-content">([\s\S]*?)<\/article>/i)?.[1] || '';
const articleText = article.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] || '';
const schemaDescriptions = [...html.matchAll(/"description":\s*"([^"]*)"/g)].map((match) => match[1]);

assert.ok(description.length >= 120 && description.length <= 160);
assert.ok(!/实时代码高亮|多种输入格式兼容|音视频媒体工具|持续更新的实用小工具合集/.test(description));
assert.ok([...articleText].filter((char) => /[\u3400-\u9fff]/.test(char)).length >= 1200);
assert.equal((html.match(/<h1\b/gi) || []).length, 1);
assert.match(html, /<canvas id="previewCanvas"[^>]*(?:aria-label|role="img")/i);
assert.match(html, /处理结果将在此显示|导出为 PNG|预览画布/);
assert.ok(schemaDescriptions.every((value) => !/适用于 media|覆盖关键词/.test(value)));

console.log('PASS image blur SEO and accessibility checks');
