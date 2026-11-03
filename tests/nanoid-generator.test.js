import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const html = fs.readFileSync(new URL('../tools/generator/nanoid-generator.html', import.meta.url), 'utf8');
const script = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .find((source) => source.includes('const ALPHABETS'))
  .split('// Init')[0];

function load({ custom = 'ABC', bytes = null } = {}) {
  const elements = {
    alphabet: { value: 'custom' },
    customAlphabet: { value: custom },
    length: { value: '21' },
    count: { value: '10' },
  };
  let cursor = 0;
  const context = vm.createContext({
    document: { getElementById: (id) => elements[id] },
    crypto: {
      getRandomValues(buffer) {
        for (let i = 0; i < buffer.length; i++) {
          buffer[i] = bytes ? bytes[cursor++ % bytes.length] : cursor++ % 256;
        }
        return buffer;
      },
    },
    Uint8Array,
  });
  vm.runInContext(script, context);
  return { context, elements, run: (expression) => vm.runInContext(expression, context) };
}

test('rejects excess random bytes instead of introducing modulo bias', () => {
  const { run } = load({ bytes: [255, 0, 1, 2] });
  assert.equal(run('nanoid(3, "ABC")'), 'ABC');
});

test('removes duplicate alphabet symbols before generation and entropy calculations', () => {
  const { run } = load({ custom: 'AABBC' });
  assert.equal(run('getAlphabet()'), 'ABC');
});

test('rejects empty, single-character, whitespace and unsupported alphabets', () => {
  for (const custom of ['', 'AAAA', 'A B', '中文', 'A😀']) {
    const { run } = load({ custom });
    assert.throws(() => run('getAlphabet()'), /字符集/);
  }
});

test('rejects invalid lengths at the generation boundary', () => {
  for (const size of [0, -1, 129, 1.5, NaN]) {
    const { run } = load();
    assert.throws(() => run(`nanoid(${size}, "ABC")`), /长度/);
  }
});

test('validates generation count without silently replacing or truncating input', () => {
  const { run, elements } = load();
  for (const count of ['', '0', '-1', '501', '1.5']) {
    elements.count.value = count;
    assert.throws(() => run('readSettings()'), /数量/);
  }
  elements.count.value = '500';
  assert.equal(run('readSettings().count'), 500);
});

test('collision estimate includes the total number of IDs and preserves tiny probabilities', () => {
  const { run } = load();
  assert.equal(run('collisionProbability(6, 1)'), 0);
  assert.ok(Math.abs(run('collisionProbability(6, 2)') - (1 - Math.exp(-1 / 64))) < 1e-12);
  const probability = run('collisionProbability(126, 1000000000)');
  assert.ok(probability > 5e-21 && probability < 6e-21);
  assert.ok(run('collisionProbability(20, 10000)') > 0.99);
});

test('generation never falls back to weak randomness when Web Crypto is unavailable', () => {
  const { context, run } = load();
  context.crypto = undefined;
  assert.throws(() => run('nanoid(21, "ABC")'), /随机/);
});

test('search and social metadata consistently describe the current tool', () => {
  const description = html.match(/<meta name="description" content="([^"]*)"/)[1];
  assert.ok(description.length >= 120 && description.length <= 160);
  assert.equal(html.match(/<meta property="og:description" content="([^"]*)"/)[1], description);
  assert.equal(html.match(/<meta name="twitter:description" content="([^"]*)"/)[1], description);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
  const app = schemas.find((schema) => schema['@type'] === 'WebApplication');
  assert.equal(app.description, description);
  assert.equal(app.dateModified, '2026-11-04');
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.equal((html.match(/<main\b/g) || []).length, 1);
  for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    assert.doesNotThrow(() => new vm.Script(match[1]));
  }
});
