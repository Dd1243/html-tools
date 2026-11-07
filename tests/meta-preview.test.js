import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const html = fs.readFileSync(new URL('../tools/seo/meta-preview.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(
  (match) => match[1]
);
const source = scripts.find((script) => script.includes('const MP_LIMITS'));
function core() {
  assert.ok(source, 'A standalone Meta preview core must exist');
  const context = vm.createContext({ URL });
  vm.runInContext(source.split('// Bind meta preview interface')[0], context);
  return { context, run: (expression) => vm.runInContext(expression, context) };
}
function analyze(inputs, options = {}) {
  const { context, run } = core();
  context.inputs = inputs;
  context.options = options;
  return JSON.parse(run('JSON.stringify(analyzePreviewData(inputs,options))'));
}
function records(items, options = {}) {
  const { context, run } = core();
  context.items = items;
  context.options = options;
  return JSON.parse(run('JSON.stringify(analyzePreviewRecords(items,options))'));
}
const tag = (key, value) => ({ key, value });

test('exports safely escaped complete title description and canonical, never fixed-character truncation', () => {
  const title = '😀<script>&"'.repeat(30),
    description = '中文" & <内容>'.repeat(50),
    url = 'https://example.com/a?x=1&y=%22';
  const result = analyze({ title, description, url });
  assert.equal(result.values.title, title);
  assert.equal(result.values.description, description);
  assert.ok(result.code.includes('&lt;script&gt;&amp;&quot;'));
  assert.ok(result.code.includes('<meta name="description" content="'));
  assert.ok(result.code.includes('x=1&amp;y=%22'));
  assert.ok(!result.code.includes('<script>'));
  assert.ok(!result.code.includes('…'));
});
test('blank fields stay blank and never fabricate sample tags or a canonical address', () => {
  const blank = analyze({});
  assert.equal(blank.valid, false);
  assert.equal(blank.code, '');
  assert.equal(blank.values.siteName, '');
  const titleOnly = analyze({ title: '页面主题' });
  assert.equal(titleOnly.code, '<title>页面主题</title>');
  assert.ok(!titleOnly.code.includes('canonical'));
  assert.ok(titleOnly.issues.some((issue) => issue.code === 'description-missing'));
  assert.ok(
    analyze({ description: '摘要' }).issues.some((issue) => issue.code === 'title-missing')
  );
});
test('Unicode counting and transparent whitespace normalization preserve raw input', () => {
  const { run } = core();
  assert.equal(run('countPreviewCharacters("😀中文𠮷")'), 4);
  const result = analyze({ title: ' \t主题\n  😀 ', description: '  A\r\nB ' });
  assert.equal(result.inputs.title, ' \t主题\n  😀 ');
  assert.equal(result.values.title, '主题 😀');
  assert.equal(result.values.description, 'A B');
  assert.ok(result.issues.some((issue) => issue.code === 'whitespace-normalized'));
});
test('strict HTTP(S) validation rejects relative malformed executable and credential URLs without rewriting valid canonical', () => {
  for (const url of [
    '/relative',
    'example.com',
    'javascript:alert(1)',
    'data:text/html,x',
    'https://@example.com',
    'https://user:pass@example.com',
    'https:///example.com',
    'https:\\example.com',
    'https://exa mple.com',
    ' https://example.com'
  ]) {
    const result = analyze({ title: '主题', url });
    assert.equal(result.valid, false, url);
    assert.equal(result.code, '');
    assert.ok(result.issues.some((issue) => issue.code === 'url-invalid'));
  }
  const url = 'HTTPS://Example.COM:443/a?x=1#part';
  assert.ok(analyze({ title: '主题', url }).code.includes(url));
});
test('measurement uses supplied real-font text measurement on the full normalized text', () => {
  const { context, run } = core();
  context.calls = [];
  context.measure = (text) => {
    context.calls.push(text);
    return { width: 123.75 };
  };
  const result = JSON.parse(
    run('JSON.stringify(measurePreviewText("😀 中文",measure,"20px Arial"))')
  );
  assert.equal(result.width, 123.75);
  assert.equal(result.characters, 4);
  assert.equal(result.font, '20px Arial');
  assert.deepEqual(context.calls, ['😀 中文']);
  assert.equal(
    JSON.parse(run('JSON.stringify(measurePreviewText("主题",null,"20px Arial"))')).width,
    null
  );
});
test('HTML extraction model preserves source order duplicate values and empty first fields without OG-title fallback', () => {
  const result = records([
    tag('title', ''),
    tag('title', 'later'),
    tag('description', 'first'),
    tag('description', 'second'),
    tag('og:site_name', '本站'),
    tag('og:title', 'must not use')
  ]);
  assert.equal(result.fields.title, '');
  assert.equal(result.fields.description, 'first');
  assert.equal(result.fields.siteName, '本站');
  assert.equal(result.fields.publishDate, '');
  assert.equal(result.tags[0].value, '');
  assert.ok(result.issues.some((issue) => issue.code === 'duplicate' && issue.key === 'title'));
  assert.ok(result.issues.some((issue) => issue.code === 'empty' && issue.key === 'title'));
  assert.equal(records([tag('og:title', 'OG only')]).fields.title, '');
});
test('imported line breaks remain in editable raw values and normalize to word-separating spaces', () => {
  const imported = records([
    tag('title', 'A\nB'),
    tag('description', 'C\nD'),
    tag('og:site_name', 'E\nF')
  ]);
  const result = analyze(imported.fields);
  assert.equal(result.inputs.title, 'A\nB');
  assert.equal(result.inputs.siteName, 'E\nF');
  assert.equal(result.values.title, 'A B');
  assert.equal(result.values.description, 'C D');
  assert.equal(result.values.siteName, 'E F');
  assert.ok(result.code.includes('<title>A B</title>'));
});
test('canonical resolution honors first base and page base without inventing absent canonical', () => {
  const first = records([
    tag('base', 'https://cdn.example.com/docs/'),
    tag('base', 'https://wrong.example/'),
    tag('canonical', '../post')
  ]);
  assert.equal(first.fields.url, 'https://cdn.example.com/post');
  assert.equal(first.tags[2].value, '../post');
  assert.equal(first.documentBase.raw, 'https://cdn.example.com/docs/');
  assert.ok(first.issues.some((issue) => issue.code === 'relative-url'));
  const relative = records([tag('base', '../docs/'), tag('canonical', 'post')], {
    baseUrl: 'https://example.com/a/b'
  });
  assert.equal(relative.fields.url, 'https://example.com/docs/post');
  assert.equal(
    records([tag('title', '标题')], { baseUrl: 'https://example.com/a' }).fields.url,
    ''
  );
  assert.equal(records([tag('canonical', '/post')]).valid, false);
  assert.equal(records([tag('title', '标题')], { baseUrl: '/invalid' }).valid, false);
});
test('noindex and nosnippet source directives are reported without becoming fabricated editable metadata', () => {
  const result = records([
    tag('title', '标题'),
    tag('robots', 'NOINDEX, max-snippet:0'),
    tag('googlebot', 'nosnippet')
  ]);
  assert.ok(result.issues.some((issue) => issue.code === 'noindex'));
  assert.ok(result.issues.some((issue) => issue.code === 'nosnippet'));
  assert.ok(!('robots' in result.fields));
});
test('robots none does not fabricate a nosnippet restriction', () => {
  const result = records([tag('title', '标题'), tag('robots', 'none')]);
  assert.ok(result.issues.some((issue) => issue.code === 'noindex'));
  assert.ok(!result.issues.some((issue) => issue.code === 'nosnippet'));
});
test('limits reject and preserve source rather than truncate it', () => {
  const { run } = core();
  const limit = run('MP_LIMITS.field');
  const title = '字'.repeat(limit + 1);
  const result = analyze({ title });
  assert.equal(result.valid, false);
  assert.equal(result.inputs.title, title);
  assert.equal(result.code, '');
});
test('inert preparation respects quoted tags raw text comments and double-escaped script boundaries', () => {
  const { context, run } = core();
  context.input =
    '<!-- <html> --><script>let x="<noscript>literal</noscript>";</script><meta name="description" content="a>b <noscript>literal</noscript>"><noscript><title>inactive</title></noscript><title>real</title>';
  const prepared = JSON.parse(run('JSON.stringify(preparePreviewSource(input))'));
  assert.equal(prepared.fullDocument, false);
  assert.ok(prepared.html.includes('let x="<noscript>literal</noscript>"'));
  assert.ok(!prepared.html.includes('<title>inactive</title>'));
  context.input =
    '<script><!--<script></script><noscript></script><title>active</title></noscript><title>later</title>';
  assert.equal(JSON.parse(run('JSON.stringify(preparePreviewSource(input))')).html, context.input);
});
test('JSON report keeps input model source diagnostics and full text but excludes imported page HTML', () => {
  const { context, run } = core();
  context.result = analyze(
    { title: '主题', description: '全文', url: 'https://example.com/' },
    {
      importInfo: {
        status: 'imported',
        tags: [tag('title', '主题')],
        sources: { title: 'title' },
        issues: []
      }
    }
  );
  const output = JSON.parse(run('serializePreviewReport(result)'));
  assert.equal(output.inputs.title, '主题');
  assert.ok(output.model);
  assert.equal(output.importInfo.status, 'imported');
  assert.ok(!('html' in output));
  assert.throws(() => run('serializePreviewReport({valid:false})'));
});
test('SEO metadata stays consistent with one app breadcrumb H1 and current modification date', () => {
  for (const script of scripts)
    if (!script.trim().startsWith('{')) assert.doesNotThrow(() => new vm.Script(script));
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)[1],
    tags = [...head.matchAll(/<meta\b[^>]*>/gi)].map((item) => item[0]);
  const content = (key, attr = 'name') =>
    tags
      .find((item) => new RegExp('\\b' + attr + '\\s*=\\s*"' + key + '"', 'i').test(item))
      .match(/\bcontent\s*=\s*"([^"]*)"/i)[1];
  const description = content('description');
  assert.equal(description, content('og:description', 'property'));
  assert.equal(description, content('twitter:description'));
  assert.ok(Array.from(description).length >= 120 && Array.from(description).length <= 160);
  const title = head.match(/<title>(.*?)<\/title>/)[1];
  assert.equal(title, content('og:title', 'property'));
  assert.equal(title, content('twitter:title'));
  const graph = [
    ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)
  ].flatMap((match) => {
    const data = JSON.parse(match[1]);
    return data['@graph'] || [data];
  });
  assert.equal(graph.filter((item) => item['@type'] === 'WebApplication').length, 1);
  assert.equal(graph.filter((item) => item['@type'] === 'BreadcrumbList').length, 1);
  const app = graph.find((item) => item['@type'] === 'WebApplication');
  assert.equal(app.description, description);
  assert.equal(app.dateModified, '2026-11-07');
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.doesNotMatch(head, /fonts\.googleapis|FAQPage|HowTo/);
});
