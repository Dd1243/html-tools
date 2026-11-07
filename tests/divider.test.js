import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const html = fs.readFileSync(new URL('../tools/text/divider.html', import.meta.url), 'utf8');
const coreSource = html.match(/\/\/ Divider core start([\s\S]*?)\/\/ Divider core end/)?.[1];
const defaults = {
  pattern: '-',
  width: 40,
  mode: 'characters',
  title: '',
  align: 'center',
  space: true,
  brackets: false,
  style: 'line',
  repeat: 1,
  comment: 'plain',
  indent: 0
};
function core(withSegmenter = true) {
  if (coreSource) {
    const context = vm.createContext({ Intl: withSegmenter ? Intl : {}, console });
    vm.runInContext(coreSource, context);
    return vm.runInContext('DividerCore', context);
  }
  // The legacy adapter exercises the real original generator before the rewrite.
  const legacy = html.slice(
    html.indexOf('function generateSingleLine() {'),
    html.indexOf('function updatePreview() {')
  );
  assert.ok(legacy, 'The original generator must be available for the regression red run');
  return {
    generate(input) {
      const options = { ...defaults, ...input };
      const values = {
        charInput: { value: options.pattern },
        lengthInput: { value: String(options.width) },
        textInput: { value: options.title },
        textPosition: { value: options.align },
        addSpace: { checked: options.space },
        addBrackets: { checked: options.brackets }
      };
      const context = vm.createContext({ document: { getElementById: (id) => values[id] } });
      vm.runInContext(legacy, context);
      const text = vm.runInContext('generateSingleLine()', context);
      return { valid: true, text, lines: [text], stats: { characters: Array.from(text).length } };
    }
  };
}
const generate = (options = {}) =>
  JSON.parse(JSON.stringify(core().generate({ ...defaults, ...options })));

test('plain patterns fill the requested complete-character length', () => {
  const result = generate({ pattern: '-=', width: 9 });
  assert.equal(result.valid, true);
  assert.equal(result.text, '-=-=-=-=-');
});
test('family, flag, skin-tone and combining clusters are never cut apart', () => {
  for (const pattern of ['👨‍👩‍👧‍👦', '🇨🇳', '👍🏽', 'e\u0301']) {
    assert.equal(generate({ pattern, width: 3 }).text, pattern.repeat(3), pattern);
  }
});
test('zero negative fractional malformed and excessive width values are rejected', () => {
  for (const width of [0, -1, 1.5, '', '2x', '1e2', ' 2 ', 241, Infinity, NaN]) {
    const result = generate({ width });
    assert.equal(result.valid, false, String(width));
    assert.equal(result.text, '');
  }
});
test('invalid repeats and indentation never produce partial output', () => {
  for (const repeat of [0, -1, 1.2, 21, '3x']) assert.equal(generate({ repeat }).valid, false);
  for (const indent of [-1, 1.5, 17, '0x2']) assert.equal(generate({ indent }).valid, false);
});
test('blank patterns controls multiline and unpaired surrogates are rejected', () => {
  for (const pattern of ['', ' ', '\t', 'a\nb', 'a\u0000b', '\ud800']) {
    assert.equal(generate({ pattern }).valid, false, JSON.stringify(pattern));
  }
  for (const title of ['a\nb', 'a\tb', 'a\u202eb', 'a\u2028b', 'a\u2029b', '\ud800']) {
    assert.equal(generate({ title }).valid, false, JSON.stringify(title));
  }
});
test('invisible formatting cannot be used as printable filler or add phantom title width', () => {
  for (const value of ['\u00ad', 'a\u200bb', '\ufeff']) {
    assert.equal(generate({ pattern: value }).valid, false, JSON.stringify(value));
    assert.equal(generate({ title: value }).valid, false, JSON.stringify(value));
  }
});
test('pattern and title limits bound generation work', () => {
  assert.equal(generate({ pattern: 'x'.repeat(21) }).valid, false);
  assert.equal(generate({ title: 'x'.repeat(501) }).valid, false);
});
test('character and approximate-column modes use distinct explicit width models', () => {
  const api = core();
  assert.equal(typeof api.measure, 'function');
  assert.equal(api.measure('A中👨‍👩‍👧‍👦e\u0301', 'characters'), 4);
  assert.equal(api.measure('A中👨‍👩‍👧‍👦e\u0301', 'columns'), 6);
  assert.equal(api.measure('Ａ', 'columns'), 2);
});
test('a wide glyph that does not fit the final column stays intact with space padding', () => {
  const result = generate({ pattern: '中', mode: 'columns', width: 5 });
  assert.equal(result.text, '中中 ');
  assert.ok(result.warnings.length > 0);
});
test('title alignment retains complete text and measures brackets and gaps', () => {
  assert.equal(generate({ title: 'X', width: 9 }).text, '--- X ---');
  assert.equal(generate({ title: 'X', width: 9, align: 'left' }).text, ' X ------');
  assert.equal(generate({ title: 'X', width: 9, align: 'right' }).text, '------ X ');
  assert.equal(
    generate({ title: '中', width: 8, brackets: true, space: false }).text,
    '--【中】---'
  );
});
test('overlong titles fail without truncation and report the width needed for adaptation', () => {
  const result = generate({ title: '完整标题', width: 3, brackets: true });
  assert.equal(result.valid, false);
  assert.equal(result.text, '');
  assert.equal(result.minimumWidth, 8);
  assert.ok(result.issues.some((issue) => issue.code === 'title-too-long'));
});
test('three-line banners repeat complete blocks and expose accurate row statistics', () => {
  const result = generate({ title: 'X', width: 9, style: 'banner', repeat: 2 });
  assert.equal(result.text, '---------\n    X    \n---------\n---------\n    X    \n---------');
  assert.equal(result.lines.length, 6);
  assert.equal(result.stats.rows, 6);
});
test('comment templates count their boundaries and exclude indentation from target width', () => {
  const cases = {
    plain: ['------------'],
    slash: ['// ---------'],
    hash: ['# ----------'],
    block: ['/* ------ */'],
    html: ['<!-- --- -->']
  };
  for (const [comment, expected] of Object.entries(cases)) {
    const result = generate({
      width: 12,
      comment,
      indent: 2,
      pattern: comment === 'html' ? '=' : '-'
    });
    assert.equal(result.valid, true, comment);
    assert.equal(result.text, '  ' + (comment === 'html' ? '<!-- === -->' : expected[0]), comment);
    assert.equal(core().measure(result.text.slice(2), 'characters'), 12, comment);
  }
});
test('every comment banner row retains its valid wrappers and exact requested width', () => {
  for (const comment of ['slash', 'hash', 'block', 'html']) {
    const result = generate({
      title: '标题',
      pattern: '=',
      width: 24,
      mode: 'columns',
      style: 'banner',
      comment
    });
    assert.equal(result.valid, true, comment);
    for (const line of result.lines) assert.equal(core().measure(line, 'columns'), 24, line);
    if (comment === 'block')
      assert.ok(result.lines.every((line) => line.startsWith('/* ') && line.endsWith(' */')));
    if (comment === 'html')
      assert.ok(result.lines.every((line) => line.startsWith('<!-- ') && line.endsWith(' -->')));
  }
});
test('comment terminators and HTML comment hazards are rejected in title or filler', () => {
  for (const options of [
    { comment: 'block', title: 'end */ rest' },
    { comment: 'block', pattern: '*/' },
    { comment: 'html', title: 'end --> rest' },
    { comment: 'html', pattern: '->-' },
    { comment: 'html', title: 'a--!>b' },
    { comment: 'html', title: '<!--' },
    { comment: 'block', pattern: '/*' }
  ])
    assert.equal(generate(options).valid, false, JSON.stringify(options));
  assert.equal(generate({ comment: 'html', pattern: '-', title: 'a--b' }).valid, true);
});
test('raw input limits and recombining partial symbols cannot break output length', () => {
  assert.equal(generate({ pattern: 'e' + '\u0301'.repeat(513) }).valid, false);
  assert.equal(generate({ title: 'e' + '\u0301'.repeat(8193) }).valid, false);
  assert.equal(generate({ pattern: '🇨', width: 4 }).valid, false);
  assert.equal(generate({ pattern: '\u0301' }).valid, false);
  assert.equal(generate({ pattern: 'e\u200d', width: 4 }).valid, false);
});
test('unsupported environments and unknown enum values fail with useful issues', () => {
  const result = core(false).generate(defaults);
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.code === 'segmenter-unavailable'));
  for (const options of [
    { align: 'oops' },
    { mode: 'oops' },
    { style: 'oops' },
    { comment: 'oops' }
  ]) {
    assert.equal(generate(options).valid, false);
  }
});
test('maximum permitted output remains bounded and preserves all requested blocks', () => {
  const result = generate({ pattern: '👍🏽', width: 240, style: 'banner', repeat: 20, indent: 16 });
  assert.equal(result.valid, true);
  assert.equal(result.lines.length, 60);
  assert.ok(result.text.length < 100000);
});
test('page has one consistent title and useful metadata without external fonts or a runtime generator dependency', () => {
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.ok(html.includes('文本分隔线生成器'));
  assert.ok(!html.includes('fonts.googleapis.com'));
  assert.ok(!html.includes('linear-gradient'));
  assert.ok(html.includes('2026-11-07'));
  assert.ok(html.includes('https://essays4u.net/tools/text/divider'));
  assert.ok(html.includes('data-site-policy-links'));
});
