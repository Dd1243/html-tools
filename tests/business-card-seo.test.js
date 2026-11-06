import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const html = fs.readFileSync(new URL('../tools/generator/business-card.html', import.meta.url), 'utf8');
const canonical = 'https://essays4u.net/tools/generator/business-card';
const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1] || '';
const read = (name) => fs.readFileSync(new URL('../' + name, import.meta.url), 'utf8');
const text = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const jsonld = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].flatMap((match) => {
  const value = JSON.parse(match[1]);
  return Array.isArray(value) ? value : [value];
});

test('search metadata describes delivered design and export features', () => {
  assert.match(html, /<title>[^<]*名片生成器[^<]*PNG[^<]*SVG[^<]*<\/title>/);
  assert.ok(description.length >= 120 && description.length <= 160, 'description length ' + description.length);
  for (const token of ['双面', 'PNG', 'SVG', 'vCard', '300']) assert.ok(description.includes(token) || (token === '双面' && description.includes('正反面')));
  assert.ok(html.includes('<link rel="canonical" href="' + canonical + '"'));
  for (const property of ['og:title', 'og:description', 'og:url', 'og:image', 'twitter:card', 'twitter:title', 'twitter:description']) assert.ok(html.includes('"' + property + '"'), property);
});

test('visible document has one descriptive H1 and actionable export guidance', () => {
  assert.equal((html.match(/<h1\b/gi) || []).length, 1);
  assert.match(html, /<h1>在线名片生成器<\/h1>/);
  for (const feature of [/300\s*DPI/i, /SVG/, /vCard/, /出血/, /安全/, /字体/, /本地/, /CMYK|RGB/, /90\s*[×x]\s*54/]) assert.match(text, feature);
  assert.doesNotMatch(text, /支持[^。]*二维码嵌入/);
});

test('structured data exposes an independent application with verified features', () => {
  const app = jsonld.find((value) => value['@type'] === 'WebApplication');
  assert.ok(app, 'feed parser requires a top-level WebApplication');
  assert.equal(app.url, canonical);
  assert.equal(app.dateModified, '2026-11-06');
  assert.equal(app.offers.price, '0');
  const features = app.featureList.join(' ');
  for (const feature of ['PNG', 'SVG', 'vCard']) assert.ok(features.includes(feature));
  assert.ok(!jsonld.some((value) => ['FAQPage', 'HowTo'].includes(value['@type'])));
});

test('breadcrumbs follow the generator hierarchy', () => {
  const crumbs = jsonld.find((value) => value['@type'] === 'BreadcrumbList');
  assert.ok(crumbs);
  assert.deepEqual(crumbs.itemListElement.map((item) => item.position), [1, 2, 3]);
  assert.equal(crumbs.itemListElement[2].item, canonical);
  assert.match(crumbs.itemListElement[1].item, /\/tools\/generator\/?$/);
  assert.match(html, /href="\/tools\/generator\/"/);
});

test('related tools and policy links remain navigable', () => {
  for (const link of ['/tools/generator/vcard-qr', '/tools/generator/qrcode-generator', '/about', '/contact', '/terms', '/privacy-policy']) assert.ok(html.includes('href="' + link + '"'), link);
  assert.match(html, /href="https:\/\/[^\s"]+"/);
});

test('rendering and exporting are self-contained while site consent is preserved', () => {
  assert.ok(html.includes('id="business-card-core"'));
  assert.ok(!html.includes('/* BUSINESS_CARD_CORE */'), 'core must be embedded');
  assert.doesNotMatch(html, /<link[^>]+href="https:\/\/cdn\./);
  const scripts = [...html.matchAll(/<script\b[^>]*src="(https?:\/\/[^" ]+)"/gi)].map((match) => match[1]);
  assert.deepEqual(scripts, ['https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9979971494108572']);
  assert.ok(html.includes('/assets/cmp-consent.js'));
  assert.ok(html.includes('/assets/cmp-consent.css'));
});

test('site search and tool listings describe the same actual exports', () => {
  const index = JSON.parse(read('tools.json'));
  const tools = index.tools || index;
  const entry = Object.values(tools).find((value) => value.path === 'tools/generator/business-card.html');
  assert.ok(entry);
  for (const token of ['PNG', 'SVG', 'vCard']) assert.ok(entry.description.includes(token));
  for (const file of ['index.html', 'tools/generator/index.html', 'tools-directory.html']) {
    const listing = read(file);
    const block = listing.slice(listing.indexOf("tools/generator/business-card"), listing.indexOf("tools/generator/business-card") + 700);
    assert.ok(block.includes('SVG') || listing.includes(entry.description), file);
    assert.ok(listing.includes(entry.description), file + ' must use the synchronized description');
  }
});

test('sitemap and meta-description source preserve the updated page', () => {
  const site = read('sitemap.xml');
  assert.ok(site.includes('<loc>' + canonical + '</loc>\n    <lastmod>2026-11-06</lastmod>'));
  const source = read('scripts/optimize-meta-descriptions.js').match(/245: '([^']+)'/)[1];
  assert.equal(source, description);
});
