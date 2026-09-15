import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pages = [
  {
    name: 'image border',
    file: path.join(ROOT, 'tools', 'media', 'image-border.html'),
    keywords: /图片加边框|拍立得|胶片边框/,
    links: ['/tools/media/image-crop', '/tools/media/image-collage', '/tools/media/image-compressor', '/tools/generator/placeholder-image']
  },
  {
    name: 'image collage',
    file: path.join(ROOT, 'tools', 'media', 'image-collage.html'),
    keywords: /图片拼接|长图|多图合一/,
    links: ['/tools/media/image-crop', '/tools/media/image-border', '/tools/media/image-compressor', '/tools/media/image-resize']
  },
  {
    name: 'image compressor',
    file: path.join(ROOT, 'tools', 'media', 'image-compressor.html'),
    keywords: /图片压缩|JPG|PNG|WebP/,
    links: ['/tools/media/image-crop', '/tools/media/image-resize', '/tools/media/image-format-converter', '/tools/media/image-blur']
  }
];
const badTemplate = /音视频媒体工具|适用于 media|持续更新的实用小工具合集|数据对账|实时代码高亮|VSCode 插件/;

for (const page of pages) {
  const html = fs.readFileSync(page.file, 'utf8');
  const description = html.match(/<meta name="description" content="([^"]*)"/i)?.[1] || '';
  const article = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1] || '';
  const articleText = article.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const schemaDescriptions = [...html.matchAll(/"description":\s*"([^"]*)"/g)].map((match) => match[1]);

  assert.ok(description.length >= 120 && description.length <= 160, `${page.name}: description length`);
  assert.match(description, page.keywords, `${page.name}: keyword intent`);
  assert.doesNotMatch(description, badTemplate, `${page.name}: template description`);
  assert.equal((html.match(/<h1\b/gi) || []).length, 1, `${page.name}: one h1`);
  assert.equal((html.match(/<main\b/gi) || []).length, 1, `${page.name}: one main`);
  assert.ok([...articleText].filter((char) => /[\u3400-\u9fff]/.test(char)).length >= 1000, `${page.name}: content depth`);
  for (const href of page.links) assert.match(html, new RegExp(`href="${href}"`, 'i'), `${page.name}: ${href}`);
  assert.ok(schemaDescriptions.every((value) => !badTemplate.test(value)), `${page.name}: schema template`);
}

console.log('PASS image border, collage, and compressor SEO checks');
