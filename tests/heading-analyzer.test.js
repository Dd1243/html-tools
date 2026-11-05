import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const html = fs.readFileSync(new URL('../tools/seo/heading-analyzer.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const source = scripts.find((s) => s.includes('const HEADING_LIMITS'));
function core() {
  assert.ok(source, 'The page must contain its standalone heading analysis core');
  const context = vm.createContext({});
  vm.runInContext(source.split('// Bind heading interface')[0], context);
  return (expression) => {
    const value = vm.runInContext('JSON.stringify(' + expression + ')', context);
    return value === undefined ? undefined : JSON.parse(value);
  };
}
const hs = (levels) =>
  levels.map((level, i) => ({
    level,
    nativeLevel: level,
    kind: 'native',
    tag: 'h' + level,
    text: '标题 ' + (i + 1),
  }));

test('outline parents follow document order and closing subsections restores the correct parent', () => {
  const run = core();
  const r = run(`analyzeHeadingData(${JSON.stringify(hs([1, 2, 4, 2, 3, 1]))},{context:'fragment'})`);
  assert.deepEqual(
    r.headings.map((h) => h.parentIndex),
    [null, 1, 2, 1, 4, null],
  );
  assert.deepEqual(
    r.headings.map((h) => h.depth),
    [0, 1, 2, 1, 2, 0],
  );
});

test('only moving down more than one heading level produces a skipped-level warning', () => {
  const run = core();
  const r = run(`analyzeHeadingData(${JSON.stringify(hs([3, 4, 2, 4, 1]))},{context:'fragment'})`);
  assert.deepEqual(
    r.issues.filter((i) => i.code === 'level-skip').map((i) => i.indexes),
    [[3, 4]],
  );
  assert.ok(!r.issues.some((i) => i.code === 'missing-h1' || i.code === 'first-level'));
});

test('full-document H1 guidance is advisory and fragments do not require a page H1', () => {
  const run = core();
  const missing = run(`analyzeHeadingData(${JSON.stringify(hs([2, 3]))},{context:'document'})`);
  assert.equal(missing.issues.find((i) => i.code === 'missing-h1').severity, 'advice');
  const multi = run(`analyzeHeadingData(${JSON.stringify(hs([1, 1]))},{context:'document'})`);
  assert.equal(multi.issues.find((i) => i.code === 'multiple-h1').severity, 'advice');
  assert.ok(!('score' in multi));
});

test('empty names require attention while duplicate and long names remain contextual advice', () => {
  const run = core();
  const input = [
    { level: 1, nativeLevel: 1, text: '主题' },
    { level: 2, nativeLevel: 2, text: '' },
    { level: 2, nativeLevel: 2, text: 'ＡＢＣ' },
    { level: 2, nativeLevel: 2, text: 'abc' },
    { level: 2, nativeLevel: 2, text: '😀'.repeat(81) },
  ];
  const r = run(`analyzeHeadingData(${JSON.stringify(input)},{context:'document'})`);
  assert.equal(r.issues.find((i) => i.code === 'empty-name').severity, 'error');
  assert.deepEqual(r.issues.find((i) => i.code === 'duplicate-name').indexes, [3, 4]);
  assert.equal(r.issues.find((i) => i.code === 'long-name').severity, 'advice');
  assert.equal(r.headings[4].length, 81);
});

test('ARIA level validation accepts positive integers above six and rejects missing or malformed levels', () => {
  const run = core();
  assert.equal(run('parseAriaLevel("7")'), 7);
  assert.equal(run('parseAriaLevel(" 2 ")'), 2);
  for (const value of [null, '', '0', '-1', '2.5', '2e1', 'oops', '9007199254740992'])
    assert.equal(run(`parseAriaLevel(${JSON.stringify(value)})`), null);
});

test('nearest explicit visibility can restore a heading while hidden, display and aria ancestors cannot', () => {
  const run = core();
  const fixture = `(visibility='',parentElement=null,attrs={})=>({nodeType:1,parentElement,style:{visibility,display:attrs.display||''},hasAttribute:k=>k in attrs,getAttribute:k=>attrs[k]??null})`;
  assert.equal(
    run(`(()=>{const el=${fixture};return explicitHidden(el('visible',el('hidden')));})()`),
    false,
  );
  assert.equal(run(`(()=>{const el=${fixture};return explicitHidden(el('',el('hidden')));})()`), true);
  for (const attrs of [{ hidden: '' }, { 'aria-hidden': 'true' }, { display: 'none' }])
    assert.equal(
      run(
        `(()=>{const el=${fixture};return explicitHidden(el('visible',el('hidden',null,${JSON.stringify(attrs)})));})()`,
      ),
      true,
    );
});

test('name extraction keeps descendants that explicitly restore visibility', () => {
  const run = core();
  const name = run(`(()=>{
    const txt=text=>({nodeType:3,textContent:text});
    const el=(tag,children,visibility='')=>({nodeType:1,tagName:tag.toUpperCase(),localName:tag,style:{visibility,display:''},childNodes:children,hasAttribute:()=>false,getAttribute:()=>null});
    const heading=el('h2',[txt('前'),el('span',[txt('秘密'),el('span',[txt('可见')],'visible')],'hidden'),txt('后')]);
    return textFromElement(heading,false,heading);
  })()`);
  assert.equal(name, '前可见后');
});

test('reports count native tags separately from ARIA headings and keep valid exported hierarchy', () => {
  const run = core();
  const r = run(
    'analyzeHeadingData([{level:1,nativeLevel:1,kind:"native",tag:"h1",text:"原生"},{level:7,nativeLevel:null,kind:"aria",tag:"div",text:"ARIA"}],{context:"fragment",scope:"main"})',
  );
  assert.equal(r.counts[1], 1);
  assert.equal(r.ariaCount, 1);
  assert.equal(r.headings[1].level, 7);
  assert.match(r.issues.find((i) => i.code === 'level-skip').message, /ARIA 7/);
  assert.doesNotMatch(r.issues.find((i) => i.code === 'level-skip').message, /H7/);
  const text = run(`reportToText(${JSON.stringify(r)})`);
  assert.match(text, /原生/);
  assert.match(text, /ARIA/);
  assert.match(text, /main/);
  assert.doesNotMatch(text, /页面评分|SEO 得分/);
});

test('input and upload limits fail explicitly instead of returning a truncated good report', () => {
  const run = core();
  assert.throws(() => run('validateSource("x".repeat(1000001))'), /100|限制|字符/);
  assert.throws(() => run('validateSource("\\u0000<html>test</html>")'), /二进制|空字符/);
  assert.throws(
    () => run('validateHtmlFile({name:"payload.exe",type:"application/octet-stream",size:20})'),
    /HTML|格式/,
  );
  assert.throws(() => run('validateHtmlFile({name:"huge.html",type:"text/html",size:2097153})'), /2 MB|大小/);
  assert.doesNotThrow(() => run('validateHtmlFile({name:"page.html",type:"",size:200})'));
});

test('metadata describes a local analyzer without rank promises or external runtime dependencies', () => {
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  assert.ok(desc && desc.length >= 120 && desc.length <= 160);
  assert.equal(html.match(/<meta property="og:description" content="([^"]*)"/)[1], desc);
  assert.equal(html.match(/<meta name="twitter:description" content="([^"]*)"/)[1], desc);
  const title = html.match(/<title>([^<]+)<\/title>/)[1];
  assert.equal(html.match(/<meta property="og:title" content="([^"]*)"/)[1], title);
  assert.equal(html.match(/<meta name="twitter:title" content="([^"]*)"/)[1], title);
  const app = scripts
    .filter((s) => s.trim().startsWith('{'))
    .map((s) => JSON.parse(s))
    .find((s) => s['@type'] === 'WebApplication');
  assert.equal(app.description, desc);
  assert.equal(app.dateModified, '2026-11-05');
  assert.equal(app.url, 'https://essays4u.net/tools/seo/heading-analyzer');
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.doesNotMatch(desc, /提升.*排名|保证.*排名/);
  assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)|cdn\.jsdelivr/);
  for (const s of scripts.filter((s) => !s.trim().startsWith('{')))
    assert.doesNotThrow(() => new vm.Script(s));
});
