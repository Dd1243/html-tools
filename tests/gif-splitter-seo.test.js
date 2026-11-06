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

const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/)?.[1];
assert.equal(canonical, 'https://essays4u.net/tools/media/gif-splitter');
const structuredData = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
  .flatMap((match) => {
    const data = JSON.parse(match[1]);
    return data['@graph'] || (Array.isArray(data) ? data : [data]);
  });
const application = structuredData.find((item) => item['@type'] === 'WebApplication');
assert.ok(application, 'The actual GIF application must have WebApplication structured data');
assert.equal(application['@context'], 'https://schema.org');
assert.equal(application.name, '在线GIF分割工具');
assert.equal(application.url, canonical);
assert.equal(application.dateModified, '2026-11-06');
assert.ok(Array.isArray(application.featureList));
const features = application.featureList.join(' ');
for (const feature of [/逐帧预览/, /延迟/, /范围/, /PNG/, /ZIP/, /本地处理/]) {
  assert.match(features, feature);
  assert.match(visibleText, feature, 'Structured features must also be explained in the visible page');
}
assert.doesNotMatch(features, /重新编码|GIF\s*压缩|GIF\s*合成/);
assert.ok(!structuredData.some((item) => item['@type'] === 'FAQPage'),
  'The tool must not advertise unsupported FAQ rich results');

const breadcrumbs = structuredData.find((item) => item['@type'] === 'BreadcrumbList');
assert.ok(breadcrumbs, 'The media tool hierarchy must have breadcrumbs');
assert.equal(breadcrumbs.itemListElement.length, 3);
assert.deepEqual(breadcrumbs.itemListElement.map((item) => item.position), [1, 2, 3]);
assert.equal(breadcrumbs.itemListElement[2].item, canonical);
assert.match(breadcrumbs.itemListElement[1].item, /\/tools\/media\/?$/);
assert.match(visibleText, /透明/);
assert.match(visibleText, /选择.*帧|已选.*帧/);
assert.match(visibleText, /无需上传|不上传|不会上传/);
const externalScripts = [...html.matchAll(/<script\b[^>]*\bsrc=["'](https?:\/\/[^"']+)["']/gi)].map((match) => match[1]);
assert.deepEqual(externalScripts, ['https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9979971494108572'],
  'Decoding and ZIP must be self-contained; only the existing optional site ads script is external');
assert.match(html, /\/\/ GIF core start[\s\S]+\/\/ GIF core end/);

console.log('PASS GIF splitter SEO and regression checks');
