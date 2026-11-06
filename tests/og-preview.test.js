import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const html = fs.readFileSync(new URL('../tools/seo/og-preview.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(
  (match) => match[1]
);
const source = scripts.find((script) => script.includes('const OG_LIMITS'));
function core() {
  assert.ok(source, 'The standalone OG analysis core must exist');
  const context = vm.createContext({ URL });
  vm.runInContext(source.split('// Bind og interface')[0], context);
  return { context, run: (expression) => vm.runInContext(expression, context) };
}
function analyze(records, options = {}) {
  const { context, run } = core();
  context.records = records;
  context.options = options;
  return JSON.parse(run('JSON.stringify(analyzeOgRecords(records,options))'));
}
const tag = (key, value) => ({ key, value });

test('preserves source order and empty first values rather than letting later duplicates hide them', () => {
  const result = analyze([
    tag('title', 'HTML title'),
    tag('og:title', ''),
    tag('og:title', 'later'),
    tag('og:description', 'first'),
    tag('og:description', 'second')
  ]);
  assert.equal(result.og.title, '');
  assert.equal(result.og.description, 'first');
  assert.deepEqual(
    result.tags.map((item) => item.value),
    ['HTML title', '', 'later', 'first', 'second']
  );
  assert.ok(result.issues.some((issue) => issue.code === 'empty' && issue.key === 'og:title'));
  assert.ok(result.issues.some((issue) => issue.code === 'duplicate' && issue.key === 'og:title'));
});
test('fallback sources are explicit and X overrides do not change the Open Graph values', () => {
  const result = analyze([
    tag('title', 'HTML title'),
    tag('description', 'HTML description'),
    tag('twitter:title', 'X title')
  ]);
  assert.equal(result.og.title, 'HTML title');
  assert.equal(result.og.titleSource, 'title');
  assert.equal(result.x.title, 'X title');
  assert.equal(result.x.titleSource, 'twitter:title');
  assert.equal(result.x.description, '');
  assert.equal(result.x.descriptionSource, '');
  assert.equal(result.x.card, '');
  assert.ok(result.issues.some((issue) => issue.code === 'card-missing'));
  assert.equal(analyze([tag('og:title', 'OG'), tag('twitter:title', '')]).x.title, '');
});
test('image roots, aliases and structured properties remain bound to their source group', () => {
  const result = analyze([
    tag('og:image:alt', 'orphan'),
    tag('og:image', 'http://example.com/a.jpg'),
    tag('og:image:secure_url', 'https://example.com/a.jpg'),
    tag('og:image:alt', 'first alt'),
    tag('og:image:width', '1200'),
    tag('og:image:url', 'https://example.com/b.jpg'),
    tag('og:image:alt', 'second alt'),
    tag('og:image:height', '630')
  ]);
  assert.equal(result.images.length, 2);
  assert.equal(result.images[0].url, 'https://example.com/a.jpg');
  assert.equal(result.images[0].alt, 'first alt');
  assert.equal(result.images[0].width, 1200);
  assert.equal(result.images[0].height, null);
  assert.equal(result.images[1].alt, 'second alt');
  assert.equal(result.images[1].width, null);
  assert.equal(result.images[1].height, 630);
  assert.ok(result.issues.some((issue) => issue.code === 'orphan-image-property'));
});
test('separate image groups do not conflict while repeated properties within a group warn', () => {
  const grouped = analyze([
    tag('og:image', 'https://example.com/a.png'),
    tag('og:image:alt', 'A'),
    tag('og:image:width', '1200'),
    tag('og:image:height', '630'),
    tag('og:image:url', 'https://example.com/b.png'),
    tag('og:image:alt', 'B'),
    tag('og:image:width', '1200'),
    tag('og:image:height', '630')
  ]);
  assert.ok(!grouped.issues.some((issue) => issue.code === 'duplicate'));
  const repeated = analyze([
    tag('og:image', 'https://example.com/a.png'),
    tag('og:image:alt', 'A'),
    tag('og:image:alt', 'late')
  ]);
  assert.equal(repeated.images[0].alt, 'A');
  assert.ok(
    repeated.issues.some((issue) => issue.code === 'duplicate' && issue.key === 'og:image:alt')
  );
});
test('another OG root ends the preceding image structured-property group', () => {
  for (const key of ['og:video', 'og:audio', 'og:title']) {
    const ended = analyze([
      tag('og:image', 'https://example.com/a.png'),
      tag(key, 'https://example.com/media'),
      tag('og:image:alt', 'late')
    ]);
    assert.equal(ended.images[0].alt, '');
    assert.ok(ended.issues.some((issue) => issue.code === 'orphan-image-property'));
  }
});
test('relative URL resolution uses the supplied base while raw values remain in the report', () => {
  const result = analyze([tag('og:url', '../article?x=1#top'), tag('og:image', '../share.jpg')], {
    baseUrl: 'https://example.com/notes/current'
  });
  assert.equal(result.og.url, 'https://example.com/article?x=1#top');
  assert.equal(result.images[0].url, 'https://example.com/share.jpg');
  assert.equal(result.tags[0].value, '../article?x=1#top');
  assert.equal(result.tags[0].resolved, 'https://example.com/article?x=1#top');
  assert.ok(result.issues.some((issue) => issue.code === 'relative-url'));
});
test('first document base is explicit, works without a page URL only when absolute, and never fabricates og:url', () => {
  const absolute = analyze([
    tag('base', 'https://cdn.example.com/assets/'),
    tag('base', 'https://wrong.example/'),
    tag('og:image', 'cover.png')
  ]);
  assert.equal(absolute.images[0].url, 'https://cdn.example.com/assets/cover.png');
  assert.equal(absolute.documentBase.raw, 'https://cdn.example.com/assets/');
  assert.equal(absolute.og.url, '');
  assert.ok(
    absolute.issues.some((issue) => issue.code === 'og-required' && issue.key === 'og:url')
  );
  const relative = analyze([tag('base', '../assets/'), tag('og:image', 'cover.png')], {
    baseUrl: 'https://example.com/posts/note'
  });
  assert.equal(relative.images[0].url, 'https://example.com/assets/cover.png');
  assert.equal(
    analyze([tag('base', '../assets/'), tag('og:image', 'cover.png')]).images[0].url,
    ''
  );
  const invalid = analyze(
    [
      tag('base', 'javascript:alert(1)'),
      tag('base', 'https://wrong.example/'),
      tag('og:image', 'cover.png')
    ],
    { baseUrl: 'https://example.com/posts/note' }
  );
  assert.equal(invalid.images[0].url, 'https://example.com/posts/cover.png');
  assert.ok(invalid.issues.some((issue) => issue.code === 'url-invalid' && issue.key === 'base'));
  const empty = analyze(
    [tag('base', ''), tag('base', 'https://wrong.example/'), tag('og:image', 'cover.png')],
    { baseUrl: 'https://example.com/posts/note' }
  );
  assert.equal(empty.images[0].url, 'https://example.com/posts/cover.png');
  assert.equal(empty.documentBase.raw, '');
});
test('first empty image remains preferred and X image overrides remain independent of OG selection', () => {
  const result = analyze([
    tag('og:image', ''),
    tag('og:image', 'https://example.com/second.png'),
    tag('twitter:image', 'https://example.com/x.png'),
    tag('twitter:image', 'https://example.com/late-x.png')
  ]);
  assert.equal(result.images.length, 2);
  assert.equal(result.images[0].url, '');
  assert.equal(result.preferredImage, 0);
  assert.equal(result.og.image, '');
  assert.equal(result.x.image, 'https://example.com/x.png');
  assert.equal(result.x.imageSource, 'twitter:image');
});
test('an explicitly invalid page URL blocks exporting rather than leaving a usable current report', () => {
  const result = analyze([tag('og:title', 'Title')], { baseUrl: '/relative-page' });
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.code === 'url-invalid' && issue.level === 'error'));
});
test('X image alt only follows the image that actually supplied the preview', () => {
  const separate = analyze([
    tag('og:image', 'https://example.com/a.png'),
    tag('og:image:alt', 'A only'),
    tag('twitter:image', 'https://example.com/b.png')
  ]);
  assert.equal(separate.x.alt, '');
  assert.equal(separate.x.altSource, '');
  const fallback = analyze([
    tag('og:image', 'https://example.com/a.png'),
    tag('og:image:alt', 'A only')
  ]);
  assert.equal(fallback.x.alt, 'A only');
  assert.equal(fallback.x.altSource, 'og:image:alt');
});
test('unsafe URLs never become image loads or clickable output while the raw record remains inspectable', () => {
  for (const value of [
    'javascript:alert(1)',
    'data:image/png,x',
    'file:///a',
    'blob:https://example.com/a',
    'https://user:pass@example.com/x',
    'https://@example.com/x',
    'https:///example.com',
    'https://exa mple.com/a',
    'https:\\example.com'
  ]) {
    const result = analyze([tag('og:image', value)]);
    assert.equal(result.images[0].url, '', value);
    assert.equal(result.tags[0].value, value);
    assert.ok(result.issues.some((issue) => issue.code === 'url-invalid'));
  }
  assert.equal(analyze([tag('og:image', '/image.jpg')]).images[0].url, '');
});
test('missing four OG fields, unsupported card, dimensions and alt are diagnostics instead of a score', () => {
  const result = analyze([
    tag('og:title', 'Title'),
    tag('og:image', 'https://example.com/a.jpg'),
    tag('og:image:width', '1200px'),
    tag('twitter:card', 'player')
  ]);
  assert.ok(result.issues.some((issue) => issue.code === 'og-required' && issue.key === 'og:type'));
  assert.ok(result.issues.some((issue) => issue.code === 'og-required' && issue.key === 'og:url'));
  assert.ok(result.issues.some((issue) => issue.code === 'image-dimension'));
  assert.ok(result.issues.some((issue) => issue.code === 'image-alt'));
  assert.ok(result.issues.some((issue) => issue.code === 'card-unsupported'));
  assert.ok(!('score' in result));
  assert.equal(result.x.card, 'player');
});
test('limits reject rather than silently truncate and character counts use Unicode code points', () => {
  const { run } = core();
  assert.equal(run('countOgCharacters("😀中文𠮷")'), 4);
  const limit = run('OG_LIMITS.field');
  const result = analyze([tag('og:title', '字'.repeat(limit + 1))]);
  assert.equal(result.valid, false);
  assert.equal(result.tags[0].value.length, limit + 1);
  assert.equal(analyze([]).valid, false);
  assert.equal(analyze([tag('og:title', '😀'.repeat(200))]).og.title, '😀'.repeat(200));
});
test('source preparation strips inactive noscript without touching raw text, comments or quoted attributes', () => {
  const { context, run } = core();
  context.input =
    '<!-- <html> --><script>let x="<noscript>literal</noscript>";</script><meta content="a>b <noscript>literal</noscript>" name="description"><noscript><title>fake</title></noscript><title>real</title>';
  const result = JSON.parse(run('JSON.stringify(prepareOgSource(input))'));
  assert.equal(result.fullDocument, false);
  assert.ok(result.html.includes('let x="<noscript>literal</noscript>"'));
  assert.ok(result.html.includes('a>b <noscript>literal</noscript>'));
  assert.ok(!result.html.includes('<title>fake</title>'));
});
test('double-escaped script content does not hide active tags after the real script closing boundary', () => {
  const { context, run } = core();
  context.input =
    '<script><!--<script></script><noscript></script><meta property="og:title" content="fake"></noscript><meta property="og:title" content="real">';
  const prepared = JSON.parse(run('JSON.stringify(prepareOgSource(input))'));
  assert.equal(prepared.html, context.input);
  assert.equal(prepared.fullDocument, false);
});
test('JSON export preserves diagnostic data and fallback provenance, without local preview state', () => {
  const { context, run } = core();
  context.result = analyze([tag('title', '标题'), tag('og:image', 'https://example.com/a.jpg')]);
  const output = JSON.parse(run('serializeOgReport(result)'));
  assert.equal(output.og.titleSource, 'title');
  assert.equal(output.tags[0].key, 'title');
  assert.ok(output.issues.length);
  assert.ok(!('localImage' in output));
  assert.throws(() => run('serializeOgReport({valid:false})'));
});
test('page SEO stays consistent and executable scripts parse', () => {
  for (const script of scripts)
    if (!script.trim().startsWith('{')) assert.doesNotThrow(() => new vm.Script(script));
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)[1];
  const tags = [...head.matchAll(/<meta\b[^>]*>/gi)].map((match) => match[0]);
  const content = (key, attr = 'name') =>
    tags
      .find((value) => new RegExp('\\b' + attr + '\\s*=\\s*"' + key + '"', 'i').test(value))
      .match(/\bcontent\s*=\s*"([^"]*)"/i)[1];
  assert.equal(content('description'), content('og:description', 'property'));
  assert.equal(content('description'), content('twitter:description'));
  assert.ok(
    Array.from(content('description')).length >= 120 &&
      Array.from(content('description')).length <= 160
  );
  const graph = [
    ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)
  ].flatMap((match) => {
    const item = JSON.parse(match[1]);
    return item['@graph'] || [item];
  });
  assert.equal(graph.filter((item) => item['@type'] === 'WebApplication').length, 1);
  assert.equal(graph.filter((item) => item['@type'] === 'BreadcrumbList').length, 1);
  assert.equal(
    graph.find((item) => item['@type'] === 'WebApplication').description,
    content('description')
  );
  assert.equal(graph.find((item) => item['@type'] === 'WebApplication').dateModified, '2026-11-06');
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.doesNotMatch(head, /fonts\.googleapis|picocss|FAQPage|HowTo/);
});
