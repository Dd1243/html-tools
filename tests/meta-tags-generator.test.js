import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const html = fs.readFileSync(
  new URL('../tools/seo/meta-tags-generator.html', import.meta.url),
  'utf8'
);
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const source = scripts.find((script) => script.includes('const META_LIMITS'));
function core() {
  assert.ok(source, 'The page must contain a standalone metadata core');
  const context = vm.createContext({ URL });
  vm.runInContext(source.split('// Bind meta interface')[0], context);
  return (expression) => JSON.parse(vm.runInContext('JSON.stringify(' + expression + ')', context));
}
function build(data) {
  return core()('buildMetaTags(' + JSON.stringify(data) + ')');
}

test('escapes title and attribute contexts without letting text inject a tag', () => {
  const result = build({
    title: '</title><script>alert("x")</script>',
    description: 'A & "B" < C > D\'s'
  });
  assert.equal(result.valid, true);
  assert.match(
    result.code,
    /<title>&lt;\/title&gt;&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;<\/title>/
  );
  assert.match(result.code, /content="A &amp; &quot;B&quot; &lt; C &gt; D&#39;s"/);
  assert.doesNotMatch(result.code, /<script>/);
});

test('uses the supplied site name exactly once and never inserts the tool brand', () => {
  const result = build({ title: '测试', siteName: '山野笔记' });
  assert.equal((result.code.match(/property="og:site_name"/g) || []).length, 1);
  assert.match(result.code, /content="山野笔记"/);
  assert.doesNotMatch(result.code, /WebUtils/);
  assert.doesNotMatch(build({ title: '测试' }).code, /og:site_name/);
});

test('empty data produces no fabricated metadata and document scaffolding is opt in', () => {
  assert.equal(build({}).code, '');
  const result = build({ title: '标题', enableOg: false, enableX: false });
  assert.equal(result.code, '<title>标题</title>');
  const basic = build({ includeCharset: true, includeViewport: true });
  assert.match(basic.code, /<meta charset="UTF-8">/);
  assert.match(basic.code, /name="viewport"/);
  assert.doesNotMatch(basic.code, /<!doctype|<html|<head|<body/);
});

test('rejects relative, executable, credentialed, malformed and whitespace URLs atomically', () => {
  for (const value of [
    '/page',
    '//example.com',
    'javascript:alert(1)',
    'data:image/png,x',
    'ftp://example.com',
    'https://user:secret@example.com',
    'https://@example.com',
    'https://exa mple.com',
    'https:\\example.com',
    'https://example.com/\npath'
  ]) {
    for (const field of ['pageUrl', 'canonicalUrl', 'imageUrl']) {
      const result = build({ title: '原先有效的标题', [field]: value });
      assert.equal(result.valid, false, field + ': ' + value);
      assert.equal(result.code, '');
      assert.ok(result.issues.some((issue) => issue.field === field && issue.level === 'error'));
    }
  }
});

test('canonical is independent, retains query strings, removes fragments with an explanation', () => {
  const result = build({
    pageUrl: 'https://example.com/article?preview=1#part',
    canonicalUrl: 'https://example.com/original?lang=zh#main'
  });
  assert.match(result.code, /rel="canonical" href="https:\/\/example.com\/original\?lang=zh"/);
  assert.match(
    result.code,
    /property="og:url" content="https:\/\/example.com\/article\?preview=1#part"/
  );
  assert.ok(
    result.issues.some((issue) => issue.field === 'canonicalUrl' && issue.level === 'advice')
  );
  assert.match(
    build({ pageUrl: 'https://example.com/?a=1&b=2#top' }).code,
    /href="https:\/\/example.com\/\?a=1&amp;b=2"/
  );
});

test('switches suppress their own groups, and optional keywords are disabled by default', () => {
  const result = build({
    title: '标题',
    pageUrl: 'https://example.com',
    keywords: 'a, b',
    enableCanonical: false,
    enableOg: false,
    enableX: false
  });
  assert.equal(result.code, '<title>标题</title>');
  assert.match(
    build({ keywords: 'a, b', enableKeywords: true }).code,
    /name="keywords" content="a, b"/
  );
});

test('Open Graph and X overrides inherit in the documented order without truncation', () => {
  const result = build({
    title: '基础标题',
    description: '基础描述',
    ogTitle: '分享标题',
    ogDescription: '分享描述',
    xDescription: 'X 独立描述',
    enableOg: false
  });
  assert.doesNotMatch(result.code, /property="og:/);
  assert.match(result.code, /name="twitter:title" content="分享标题"/);
  assert.match(result.code, /name="twitter:description" content="X 独立描述"/);
  assert.equal(result.values.ogTitle, '分享标题');
  assert.equal(result.values.xTitle, '分享标题');
  assert.match(build({ title: '😀'.repeat(90) }).code, new RegExp('😀'.repeat(90)));
});

test('normalizes plain whitespace and counts Unicode code points instead of UTF-16 units', () => {
  assert.equal(core()('countMetaCharacters("😀中文𠮷")'), 4);
  const result = build({ title: '  一个\n\t标题  ', description: '第一行\r\n第二行' });
  assert.equal(result.values.title, '一个 标题');
  assert.equal(result.values.description, '第一行 第二行');
});

test('robots is opt in, accepts supported max directives and rejects explicit conflicts', () => {
  assert.doesNotMatch(build({ title: '标题' }).code, /name="robots"/);
  const result = build({
    robots: 'noindex, follow, max-snippet:-1, max-image-preview:large, max-video-preview:0'
  });
  assert.equal(result.valid, true);
  assert.match(
    result.code,
    /noindex, follow, max-snippet:-1, max-image-preview:large, max-video-preview:0/
  );
  for (const robots of [
    'index, noindex',
    'follow,nofollow',
    'all, noindex',
    'none, follow',
    'max-snippet:-2',
    'max-image-preview:huge',
    'max-video-preview:1.5'
  ]) {
    const invalid = build({ title: '标题', robots });
    assert.equal(invalid.valid, false, robots);
    assert.equal(invalid.code, '');
  }
});

test('limits reject long inputs instead of silently clipping or leaving partial output', () => {
  const limit = core()('META_LIMITS.title');
  assert.equal(build({ title: '字'.repeat(limit) }).valid, true);
  const result = build({ title: '字'.repeat(limit + 1) });
  assert.equal(result.valid, false);
  assert.equal(result.code, '');
  assert.ok(result.issues.some((issue) => issue.field === 'title' && issue.level === 'error'));
});

test('unsupported card/type values are errors rather than pretending to support extra formats', () => {
  assert.equal(build({ title: '标题', xCard: 'player' }).valid, false);
  assert.equal(build({ title: '标题', ogType: 'product' }).valid, false);
  assert.match(
    build({ title: '标题', ogType: 'article', xCard: 'summary', locale: 'zh_CN' }).code,
    /content="article"/
  );
});

test('inactive noscript source cannot promote fake metadata into an otherwise active head', () => {
  const run = core();
  const source =
    '<html><head><noscript><title>fake</title><meta name="author" content="fake"></noscript><title>real</title></head><body></body></html>';
  const result = run('prepareMetaSource(' + JSON.stringify(source) + ')');
  assert.equal(result.fullDocument, true);
  assert.equal(result.html, '<html><head><title>real</title></head><body></body></html>');
});

test('source preparation preserves comments, quoted delimiters and raw text without inventing document wrappers', () => {
  const run = core();
  const source =
    '<!-- <html><noscript>comment</noscript> --><script>const x="<body><noscript>text</noscript>";</script><title>Literal <noscript> in title</title><meta name="description" content="<noscript>literal attribute</noscript>"><noscript data-test="a>b">ignored</noscript><meta name="author" content="real">';
  const result = run('prepareMetaSource(' + JSON.stringify(source) + ')');
  assert.equal(result.fullDocument, false);
  assert.equal(result.html, source.replace('<noscript data-test="a>b">ignored</noscript>', ''));
  assert.equal(
    run('prepareMetaSource("<title>kept</title><noscript>unclosed").html'),
    '<title>kept</title>'
  );
});

test('every inline executable script is valid JavaScript', () => {
  for (const script of scripts) {
    if (script.trim().startsWith('{')) continue;
    assert.doesNotThrow(() => new vm.Script(script));
  }
});

test('page metadata is consistent, uses one app and breadcrumb, and has no external UI dependencies', () => {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)[1];
  const tags = [...head.matchAll(/<meta\b[^>]*>/gi)].map((match) => match[0]);
  const content = (name, attribute = 'name') => {
    const tag = tags.find((value) =>
      new RegExp('\\b' + attribute + '\\s*=\\s*"' + name + '"', 'i').test(value)
    );
    assert.ok(tag, name + ' metadata must exist');
    return tag.match(/\bcontent\s*=\s*"([^"]*)"/i)[1];
  };
  const description = content('description');
  const title = head.match(/<title>([\s\S]*?)<\/title>/i)[1];
  assert.equal(content('og:title', 'property'), title);
  assert.equal(content('twitter:title'), title);
  assert.equal(content('og:description', 'property'), description);
  assert.equal(content('twitter:description'), description);
  const structured = [
    ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)
  ].flatMap((match) => {
    const parsed = JSON.parse(match[1]);
    return parsed['@graph'] || [parsed];
  });
  assert.equal(structured.filter((item) => item['@type'] === 'WebApplication').length, 1);
  assert.equal(structured.filter((item) => item['@type'] === 'BreadcrumbList').length, 1);
  assert.equal(
    structured.find((item) => item['@type'] === 'WebApplication').description,
    description
  );
  assert.equal(
    structured.find((item) => item['@type'] === 'WebApplication').dateModified,
    '2026-11-06'
  );
  assert.equal(
    structured.find((item) => item['@type'] === 'WebApplication').datePublished,
    '2026-04-02'
  );
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.doesNotMatch(head, /fonts\.googleapis|fonts\.gstatic|picocss|FAQPage|HowTo/);
});
