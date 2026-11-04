import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const html = fs.readFileSync(new URL('../tools/generator/uuid-generator.html', import.meta.url), 'utf8');
const script = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .find((source) => source.includes('const ULID_CHARS'))
  .split('// Init')[0];

function load({ now = 1_735_689_600_123, bytes = [0] } = {}) {
  const elements = {
    idType: { value: 'uuid7' },
    format: { value: 'lower' },
    count: { value: '1', setAttribute() {}, removeAttribute() {} },
    countError: { textContent: '' },
    singleResultContainer: { style: { display: 'block' } },
    batchResultContainer: { style: { display: 'none' } },
    singleIdDisplay: { textContent: '-' },
    batchOutput: { value: '' },
    countDisplay: { textContent: '0' },
    toast: { textContent: '', classList: { add() {}, remove() {}, toggle() {} } },
  };
  let cursor = 0;
  const clock = class extends Date {
    static now() {
      return now;
    }
  };
  const context = vm.createContext({
    document: { getElementById: (id) => elements[id] },
    crypto: {
      getRandomValues(buffer) {
        for (let i = 0; i < buffer.length; i++) buffer[i] = bytes[cursor++ % bytes.length];
        return buffer;
      },
    },
    Date: clock,
    Math: Object.assign(Object.create(Math), {
      random() {
        throw new Error('Math.random must not be used');
      },
    }),
    navigator: { clipboard: { writeText: async () => {} } },
    setTimeout() {},
  });
  vm.runInContext(script, context);
  return { context, elements, run: (expression) => vm.runInContext(expression, context) };
}

test('UUID v4 and v7 set their RFC version and variant bits', () => {
  const { run } = load();
  assert.match(run('generateUUIDv4()'), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.match(run('generateUUIDv7()'), /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test('UUID v7 encodes the current 48-bit timestamp and sorts within one millisecond', () => {
  const now = 1_735_689_600_123;
  const { run } = load({ now, bytes: [0] });
  const ids = run('Array.from({ length: 8 }, () => generateUUIDv7())');
  const compact = Array.from(ids, (id) => id.replaceAll('-', ''));
  const timestamp = now.toString(16).padStart(12, '0');
  assert.ok(compact.every((id) => id.slice(0, 12) === timestamp));
  assert.deepEqual([...compact].sort(), compact);
  assert.equal(new Set(compact).size, compact.length);
});

test('ULID uses cryptographic entropy, has 26 valid characters, and sorts within one millisecond', () => {
  const { run } = load({ bytes: [0] });
  const ids = run('Array.from({ length: 8 }, () => generateULID())');
  const nativeIds = Array.from(ids);
  assert.ok(nativeIds.every((id) => /^[0-9A-HJKMNP-TV-Z]{26}$/.test(id)));
  assert.deepEqual([...nativeIds].sort(), nativeIds);
  assert.equal(new Set(nativeIds).size, nativeIds.length);
  assert.equal(run(`decodeULIDTime('${nativeIds[0]}')`), 1_735_689_600_123);
});

test('generation count must be an integer from 1 through 1000', () => {
  const { run, elements } = load();
  for (const count of ['', '0', '-1', '1001', '1.5']) {
    elements.count.value = count;
    assert.throws(() => run('readSettings()'), /数量/);
  }
  elements.count.value = '1000';
  assert.equal(run('readSettings().count'), 1000);
});

test('generation reports invalid count without silently changing the user input', () => {
  const { run, elements } = load();
  elements.count.value = '1001';
  run('generate()');
  assert.equal(elements.count.value, '1001');
  assert.match(elements.countError.textContent, /数量/);
});

test('secure random bytes are required for all ID types', () => {
  const { context, run } = load();
  context.crypto = undefined;
  assert.throws(() => run('generateUUIDv4()'), /随机/);
  assert.throws(() => run('generateUUIDv7()'), /随机/);
  assert.throws(() => run('generateULID()'), /随机/);
});

test('search and structured metadata describe the current tool', () => {
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
  for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    assert.doesNotThrow(() => new vm.Script(match[1]));
  }
});
