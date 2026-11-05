import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const html = fs.readFileSync(new URL('../tools/seo/link-analyzer.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const source = scripts.find((s) => s.includes('const LINK_LIMITS'));
function core() {
  assert.ok(source, 'The page must expose its standalone static link analysis core');
  const context = vm.createContext({ URL });
  vm.runInContext(source.split('// Bind link interface')[0], context);
  return (expression) => JSON.parse(vm.runInContext('JSON.stringify(' + expression + ')', context));
}
const classify = (href, pageUrl = 'https://example.com/docs/page?lang=zh', sourceBase = null, extra = {}) =>
  `classifyLink(${JSON.stringify(href)},${JSON.stringify({ hasHref: true, classification: 'origin', ...extra })},resolveAnalysisBase(${JSON.stringify(pageUrl)},${JSON.stringify(sourceBase)}))`;

test('relative URLs resolve from the document URL and preserve query strings and fragments', () => {
  const run = core();
  const link = run(classify('../guide?q=a#intro'));
  assert.equal(link.resolved, 'https://example.com/guide?q=a#intro');
  assert.equal(link.type, 'internal');
  assert.equal(run(classify('//elsewhere.test/path')).type, 'external');
});

test('the HTML base controls resolution while the page URL remains the classification reference', () => {
  const run = core();
  const link = run(classify('#intro', 'https://example.com/page', 'https://cdn.example.net/other'));
  assert.equal(link.resolved, 'https://cdn.example.net/other#intro');
  assert.equal(link.type, 'external');
  assert.equal(
    run(classify('item', 'https://example.com/docs/page', '../assets/')).resolved,
    'https://example.com/assets/item',
  );
});

test('missing page context never invents a website or classifies relative URLs as internal', () => {
  const run = core();
  assert.equal(run(classify('/article', '')).type, 'unresolved');
  assert.equal(run(classify('https://example.com/a', '')).type, 'web-unknown');
  assert.equal(run(classify('/a', '', 'https://example.com/')).type, 'web-unknown');
  assert.throws(() => run('resolveAnalysisBase("javascript:alert(1)",null)'), /HTTP|页面网址/);
  assert.throws(() => run('resolveAnalysisBase("not a url",null)'), /HTTP|页面网址/);
});

test('same-origin and same-host modes distinguish ports, schemes and actual subdomains', () => {
  const run = core();
  assert.equal(run(classify('http://example.com/a')).type, 'external');
  assert.equal(
    run(classify('http://example.com/a', undefined, null, { classification: 'host' })).type,
    'internal',
  );
  assert.equal(
    run(classify('https://sub.example.com/a', undefined, null, { classification: 'host' })).type,
    'external',
  );
  assert.equal(run(classify('https://example.com.evil.test/a')).type, 'external');
});

test('contact, executable, missing, empty and malformed destinations stay separate', () => {
  const run = core();
  for (const [href, type] of [
    ['mailto:a@example.com', 'email'],
    ['tel:+123', 'tel'],
    ['javascript:alert(1)', 'javascript'],
    ['data:text/html,x', 'data'],
    ['ftp://example.com/a', 'other'],
    ['', 'empty'],
    ['http://[bad', 'invalid'],
  ])
    assert.equal(run(classify(href)).type, type);
  assert.equal(run(classify('', undefined, null, { hasHref: false })).type, 'missing');
});

test('SEO rel values accept comma separators without changing HTML token semantics', () => {
  const run = core();
  const rel = run('parseLinkRel(" NOFOLLOW,ugc sponsored notnofollow noopener,noreferrer ")');
  assert.deepEqual(rel.seoRel, ['nofollow', 'ugc', 'sponsored']);
  assert.ok(rel.htmlRel.includes('noopener,noreferrer'));
  assert.ok(!rel.htmlRel.includes('noopener'));
  assert.deepEqual(run('parseLinkRel("notnofollow ugcish sponsoredish")').seoRel, []);
});

test('fragment checking preserves plus signs, tolerates bad encoding and recognizes top and text directives', () => {
  const run = core();
  assert.equal(run('fragmentTarget("#hello+world")').id, 'hello+world');
  assert.equal(run('fragmentTarget("#%E4%B8%AD%E6%96%87")').id, '中文');
  assert.equal(run('fragmentTarget("#%oops")').id, '%oops');
  for (const hash of ['#', '#top', '#TOP', '#%74op', '#%54OP', '#:~:text=example'])
    assert.equal(run(`fragmentTarget(${JSON.stringify(hash)})`).check, false);
  assert.equal(run('fragmentTarget("#intro:~:text=example")').id, 'intro');
  assert.equal(run(classify('#intro')).type, 'fragment');
  assert.equal(run(classify('?lang=en#intro')).type, 'internal');
});

test('pure fragments without a page URL stay local only when no nonempty base changes their meaning', () => {
  const run = core();
  const fragment = run(classify('#intro', ''));
  assert.equal(fragment.type, 'fragment');
  assert.equal(fragment.resolved, '');
  assert.equal(fragment.fragment, '#intro');
  assert.equal(run(classify('#intro', '', '../elsewhere/')).type, 'unresolved');
  assert.equal(run(classify('#intro', '', 'https://elsewhere.test/')).type, 'web-unknown');
  assert.equal(run(classify('#intro', '', '')).type, 'fragment');
});

test('foreign-namespace script text cannot become a link name or source text', () => {
  const run = core();
  const el =
    '{localName:"script",tagName:"script",style:{display:"",visibility:""},hasAttribute:()=>false,getAttribute:()=>null,childNodes:[{nodeType:3,textContent:"not a name"}]}';
  assert.equal(run('linkElementName(' + el + ')'), '');
  assert.equal(run('sourceLinkText(' + el + ')'), '');
});

test('statistics retain occurrences while duplicate URLs remain contextual advice', () => {
  const run = core();
  const rows = [
    { href: '/a?x=1#one', hasHref: true, name: '第一处', text: '第一处', rel: '' },
    { href: '/a?x=1#one', hasHref: true, name: '第二处', text: '第二处', rel: 'nofollow' },
    { href: '/a?x=1#two', hasHref: true, name: '第三处', text: '第三处', rel: '' },
  ];
  const report = run(
    `analyzeLinkData(${JSON.stringify(rows)},{pageUrl:"https://example.com/page",context:"fragment"})`,
  );
  assert.equal(report.links.length, 3);
  assert.equal(report.uniqueUrls.length, 2);
  const issue = report.issues.find((i) => i.code === 'duplicate-target');
  assert.equal(issue.severity, 'advice');
  assert.deepEqual(issue.indexes, [1, 2]);
  assert.equal(report.links[1].seoRel[0], 'nofollow');
});

test('CSV protects formula-like values, quotes delimiters and retains complete Unicode text', () => {
  const run = core();
  const value = run('csvCell("  =SUM(1,2)\\n中文\\\"a\\\"")');
  assert.match(value, /^"'/);
  assert.match(value, /中文""a""/);
  const report = run(
    'analyzeLinkData([{href:"https://example.com/",hasHref:true,name:"名称",text:"原文",rel:""}],{})',
  );
  const csv = run(`reportToCsv(${JSON.stringify(report)})`);
  assert.equal(csv.charCodeAt(0), 0xfeff);
  assert.match(csv, /名称/);
  assert.match(csv, /原文/);
  assert.ok(csv.includes('\r\n'));
});

test('oversized input and files fail explicitly without silently truncating the report', () => {
  const run = core();
  assert.throws(() => run('validateLinkSource("x".repeat(1000001))'), /100|限制/);
  assert.throws(() => run('validateLinkSource("\\u0000")'), /空字符|二进制/);
  assert.throws(() => run('validateLinkFile({name:"x.html",size:2097153})'), /2 MB/);
  assert.throws(() => run('validateLinkFile({name:"x.exe",size:20})'), /HTML|格式/);
  assert.throws(
    () => run('analyzeLinkData(Array.from({length:5001},()=>({href:"/a",hasHref:true,name:"a",rel:""})),{})'),
    /5000/,
  );
});

test('metadata describes actual local checks and agrees across search and social cards', () => {
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  assert.ok(desc && desc.length >= 120 && desc.length <= 160);
  assert.equal(html.match(/<meta property="og:description" content="([^"]*)"/)[1], desc);
  assert.equal(html.match(/<meta name="twitter:description" content="([^"]*)"/)[1], desc);
  const app = scripts
    .filter((s) => s.trim().startsWith('{'))
    .map((s) => JSON.parse(s))
    .find((s) => s['@type'] === 'WebApplication');
  assert.equal(app.description, desc);
  assert.equal(app.dateModified, '2026-11-05');
  assert.doesNotMatch(desc, /检查死链|检测404|提升.*排名|权重传递/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)|cdn\.jsdelivr/);
  for (const s of scripts.filter((s) => !s.trim().startsWith('{')))
    assert.doesNotThrow(() => new vm.Script(s));
});
