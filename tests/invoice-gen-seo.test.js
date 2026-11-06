import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const read = (file) => fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const html = read('tools/generator/invoice-gen.html');
const canonical = 'https://essays4u.net/tools/generator/invoice-gen';
const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1] || '';
const text = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const jsonld = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].flatMap((match) => {
  const value = JSON.parse(match[1]); return Array.isArray(value) ? value : [value];
});

test('search and social metadata match actual invoice editing and print exports', () => {
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1] || '';
  assert.ok(title.includes('发票与收据生成器') && title.includes('PDF'));
  assert.ok(description.length >= 120 && description.length <= 160, 'description length ' + description.length);
  for (const feature of ['Invoice', '折扣', '税额', 'PDF', 'HTML', 'CSV', 'JSON', '本地']) assert.ok(description.includes(feature), feature);
  assert.ok(html.includes('<link rel="canonical" href="' + canonical + '"'));
  for (const tag of ['og:title', 'og:description', 'og:image', 'og:url', 'twitter:card', 'twitter:title', 'twitter:description']) assert.ok(html.includes('"' + tag + '"'), tag);
});

test('one clear H1 accompanies practical calculation and document guidance', () => {
  assert.equal((html.match(/<h1\b/gi) || []).length, 1);
  assert.ok(html.includes('<h1>在线发票与收据生成器</h1>'));
  for (const pattern of [/含税/, /未税/, /折扣/, /舍入|四舍五入/, /已付|已收款/, /余额|待付|未付/, /JSON/, /CSV/, /HTML/, /浏览器/, /本地/, /不.*(税务发票|增值税发票)/]) assert.ok(pattern.test(text), pattern.toString());
  assert.ok(!/支持[^。]*印章/.test(text), 'do not promise unimplemented stamp uploads');
});

test('application schema stays independent for indexing and lists delivered capabilities', () => {
  const app = jsonld.find((value) => value['@type'] === 'WebApplication');
  assert.ok(app, 'top-level WebApplication is required by the feed parser');
  assert.equal(app.url, canonical);
  assert.equal(app.dateModified, '2026-11-06');
  assert.equal(app.offers.price, '0');
  const features = app.featureList.join(' ');
  for (const token of ['PDF', 'JSON', 'CSV', 'HTML']) assert.ok(features.includes(token), token);
  assert.ok(!jsonld.some((value) => ['HowTo', 'FAQPage'].includes(value['@type'])));
});

test('breadcrumb navigation reflects the generator hierarchy', () => {
  const crumbs = jsonld.find((value) => value['@type'] === 'BreadcrumbList');
  assert.ok(crumbs);
  assert.deepEqual(crumbs.itemListElement.map((item) => item.position), [1, 2, 3]);
  assert.equal(crumbs.itemListElement[2].item, canonical);
  assert.ok(crumbs.itemListElement[1].item.endsWith('/tools/generator/'));
  assert.ok(html.includes('href="/tools/generator/"'));
});

test('related calculator and policy links are real local destinations', () => {
  for (const link of ['/tools/business/invoice', '/tools/office/invoice-calculator', '/about', '/contact', '/terms', '/privacy-policy']) assert.ok(html.includes('href="' + link + '"'), link);
  assert.ok(/href="https:\/\/(developer\.mozilla\.org|www\.w3\.org)\//.test(html), 'format and print documentation is linked');
});

test('editing, precise arithmetic and printing work without external UI or PDF libraries', () => {
  assert.ok(html.includes('id="invoice-core"'));
  assert.ok(html.includes('// Invoice core start') && html.includes('// Invoice core end'));
  assert.ok(!html.includes('/* INVOICE_CORE */'));
  assert.ok(!/<link[^>]+href="https:\/\/cdn\./.test(html));
  assert.ok(!/html2pdf|html2canvas|jspdf/i.test(html));
  const scripts = [...html.matchAll(/<script\b[^>]*src="(https?:\/\/[^" ]+)"/gi)].map((match) => match[1]);
  assert.deepEqual(scripts, ['https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9979971494108572']);
  assert.ok(html.includes('/assets/cmp-consent.css') && html.includes('/assets/cmp-consent.js'));
  assert.ok(/@media\s*print/.test(html));
  assert.ok(/@page/.test(html));
});

test('site search and both tool listings share the updated invoice description', () => {
  const registry = JSON.parse(read('tools.json')).tools;
  const entry = Object.values(registry).find((value) => value.path === 'tools/generator/invoice-gen.html');
  assert.ok(entry);
  for (const token of ['商业发票', 'PDF', '备份']) assert.ok(entry.description.includes(token));
  for (const file of ['index.html', 'tools/generator/index.html', 'tools-directory.html']) assert.ok(read(file).includes(entry.description), file);
});

test('sitemap modification date and description source agree with the page', () => {
  assert.ok(read('sitemap.xml').includes('<loc>' + canonical + '</loc>\n    <lastmod>2026-11-06</lastmod>'));
  assert.equal(read('scripts/optimize-meta-descriptions.js').match(/252: '([^']+)'/)[1], description);
});
