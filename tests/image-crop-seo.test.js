import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(ROOT, 'tools', 'media', 'image-crop.html');
const html = fs.readFileSync(file, 'utf8');
const article = html.match(/<section class="card seo-content"[\s\S]*?>([\s\S]*?)<\/section>/i)?.[1] || '';
const articleText = article.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const description = html.match(/<meta name="description" content="([^"]*)"/i)?.[1] || '';
const schemaDescriptions = [...html.matchAll(/"description":\s*"([^"]*)"/g)].map((match) => match[1]);

assert.ok(description.length >= 120 && description.length <= 160);
assert.match(description, /在线图片裁剪|图片裁剪/);
assert.doesNotMatch(description, /音视频媒体工具|常用模板预设|一键复制结果|多种输入格式兼容/);
assert.equal((html.match(/<h1\b/gi) || []).length, 1);
assert.match(html, /<main class="container">\s*<article class="tool-page-content">/i);
assert.ok([...articleText].filter((char) => /[\u3400-\u9fff]/.test(char)).length >= 1200);
assert.match(html, /<canvas id="previewCanvas"[^>]*(?:aria-label|role="img")/i);
assert.match(articleText, /PNG|JPEG|WebP/);
assert.match(articleText, /本地|浏览器/);
assert.ok(schemaDescriptions.every((value) => !/适用于 media|覆盖.*关键词/.test(value)));

console.log('PASS image crop SEO and accessibility checks');
