import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const html = fs.readFileSync(new URL('../tools/generator/fake-data-generator.html', import.meta.url), 'utf8');
const script = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1]).find((source) => source.includes('const FIELD_DEFINITIONS'));

function load() {
  const downloads = [];
  const urls = new Map();
  const events = {};
  const elements = Object.fromEntries(['count', 'locale', 'seed', 'tableName', 'output', 'feedback', 'resultSummary', 'snapshotNote', 'copyButton', 'downloadButton', 'tableControl', 'themeButton', 'generateButton', 'generateForm']
    .map((id) => [id, { value: '', textContent: '', hidden: false, disabled: false, dataset: {}, setAttribute() {}, removeAttribute() {}, addEventListener(event, handler) { events[id + ':' + event] = handler; }, focus() {}, select() {} }]));
  Object.assign(elements.count, { value: '10' });
  Object.assign(elements.locale, { value: 'zh' });
  Object.assign(elements.seed, { value: 'test-seed' });
  Object.assign(elements.tableName, { value: 'mock_users' });
  const fields = ['name', 'email', 'phone'].map((field) => ({ checked: true, value: field, addEventListener() {} }));
  const context = vm.createContext({
    document: { getElementById: (id) => elements[id], querySelectorAll: (selector) => selector.includes('field') ? fields : [],
      documentElement: { dataset: {}, setAttribute() {} }, addEventListener() {}, execCommand: () => true,
      body: { appendChild() {} }, createElement: () => ({ click() { downloads.push({ name: this.download, blob: urls.get(this.href) }); }, remove() {} }) },
    navigator: {}, localStorage: { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } },
    crypto: { getRandomValues: (array) => (array.fill(123), array) },
    Blob, URL: { createObjectURL(blob) { const url = 'blob:' + urls.size; urls.set(url, blob); return url; }, revokeObjectURL(url) { urls.delete(url); } }, setTimeout() {}, console,
  });
  assert.ok(script, 'The page must expose its standalone generator script');
  vm.runInContext(script, context);
  return { elements, context, downloads, events, run: (expression) => vm.runInContext(expression, context) };
}

test('count validation accepts only complete integers from 1 through 1000', () => {
  const { run } = load();
  for (const value of ['', '0', '-1', '1001', '1.5', '2e2', '10x', ' 3 ']) {
    assert.throws(() => run(`validateCount(${JSON.stringify(value)})`), /数量/);
  }
  assert.equal(run('validateCount("1000")'), 1000);
});

test('identical seed and options reproduce the same dataset and field order', () => {
  const { run } = load();
  assert.equal(run('JSON.stringify(createDataset({ count: 20, locale: "zh", seed: "repeat", fields: ["email", "name", "birthday"] }))'),
    run('JSON.stringify(createDataset({ count: 20, locale: "zh", seed: "repeat", fields: ["email", "name", "birthday"] }))'));
  assert.notEqual(run('JSON.stringify(createDataset({ count: 2, locale: "en", seed: "one", fields: ["name", "email"] }))'),
    run('JSON.stringify(createDataset({ count: 2, locale: "en", seed: "two", fields: ["name", "email"] }))'));
  assert.equal(run('Object.keys(createDataset({ count: 1, locale: "en", seed: "repeat", fields: ["email", "name"] })[0]).join(",")'), 'email,name');
});

test('generated contacts and IP addresses use explicit sample conventions', () => {
  const { run } = load();
  const records = JSON.parse(run('JSON.stringify(createDataset({ count: 1000, locale: "zh", seed: "contacts", fields: ["email", "phone", "ip", "birthday", "id"] }))'));
  assert.ok(records.every((row) => /^[a-z0-9._-]+@example\.com$/.test(row.email)));
  assert.equal(new Set(records.map((row) => row.email)).size, records.length);
  assert.ok(records.every((row) => /^1\d{2}\*{4}\d{4}$/.test(row.phone)));
  assert.ok(records.every((row) => /^(192\.0\.2|198\.51\.100|203\.0\.113)\.\d+$/.test(row.ip)));
  assert.ok(records.every((row) => !Number.isNaN(Date.parse(row.birthday)) && row.id.startsWith('MOCK-')));
});

test('generation rejects missing fields or unknown locale before replacing a dataset', () => {
  const { run } = load();
  assert.throws(() => run('createDataset({ count: 1, locale: "zh", seed: "x", fields: [] })'), /字段/);
  assert.throws(() => run('createDataset({ count: 1, locale: "xx", seed: "x", fields: ["name"] })'), /语言/);
  assert.throws(() => run('createDataset({ count: 1, locale: "zh", seed: "x", fields: ["unknown"] })'), /字段/);
});

test('CSV escapes quotes, commas, newlines and spreadsheet formulas', () => {
  const { context, run } = load();
  context.rows = [{ name: 'O\'Brien, "Alice"\nNext', email: '=SUM(A1)' }];
  assert.equal(run('serializeDataset(rows, ["name", "email"], "csv", "users")'), 'name,email\r\n"O\'Brien, ""Alice""\nNext","\'=SUM(A1)"');
});

test('SQL quotes identifiers and literals for SQLite and rejects unsafe table names', () => {
  const { context, run } = load();
  context.rows = [{ name: "O'Brien\\demo", email: 'alice@example.com' }];
  assert.equal(run('serializeDataset(rows, ["name", "email"], "sql", "mock_users")'), 'INSERT INTO "mock_users" ("name", "email") VALUES (\'O\'\'Brien\\demo\', \'alice@example.com\');');
  for (const table of ['users; DROP TABLE users', 'a.b', '1users', '']) assert.throws(() => run(`serializeDataset(rows, ["name"], "sql", ${JSON.stringify(table)})`), /表名/);
});

test('format changes preserve the generated snapshot and invalid settings preserve output', () => {
  const { elements, run } = load();
  run('generate()');
  const json = elements.output.value;
  elements.locale.value = 'en'; elements.count.value = '20';
  run('setFormat("csv")');
  assert.equal(elements.output.value.split('\r\n').length, 11);
  run('setFormat("json")');
  assert.equal(elements.output.value, json);
  elements.count.value = '1001';
  run('generate()');
  assert.equal(elements.output.value, json);
  assert.match(elements.feedback.textContent, /数量/);
});

test('clipboard fallback handles browsers without the clipboard API', async () => {
  const { elements, run } = load();
  run('generate()');
  await run('copyOutput()');
  assert.match(elements.feedback.textContent, /已复制/);
});

test('an invalid SQL table disables stale exports and recovering a valid table clears feedback', () => {
  const { elements, events, run } = load();
  run('setFormat("sql")');
  elements.tableName.value = 'bad; table';
  events['tableName:input']();
  assert.equal(elements.copyButton.disabled, true);
  assert.equal(elements.downloadButton.disabled, true);
  assert.equal(elements.output.value, '');
  assert.equal(elements.feedback.dataset.error, 'true');
  elements.tableName.value = 'valid_table';
  events['tableName:input']();
  assert.equal(elements.downloadButton.disabled, false);
  assert.equal(elements.feedback.dataset.error, 'false');
  assert.match(elements.output.value, /^INSERT INTO "valid_table"/);
});

test('download uses the displayed snapshot and the matching extension and encoding', async () => {
  const { elements, downloads, run } = load();
  elements.count.value = '99';
  run('setFormat("csv"); downloadOutput()');
  assert.equal(downloads.length, 1);
  assert.match(downloads[0].name, /^mock-data-10-1\.csv$/);
  assert.equal(downloads[0].blob.type, 'text/csv;charset=utf-8');
  assert.deepEqual(Array.from(new Uint8Array(await downloads[0].blob.arrayBuffer()).slice(0, 3)), [239, 187, 191]);
  assert.equal(await downloads[0].blob.text(), elements.output.value);
});

test('metadata, accessible controls and offline implementation agree with current capabilities', () => {
  const description = html.match(/<meta name="description" content="([^"]*)"/)[1];
  assert.ok(description.length >= 120 && description.length <= 160);
  for (const name of ['og:description', 'twitter:description']) assert.equal(html.match(new RegExp(`<meta (?:property|name)="${name}" content="([^"]*)"`))[1], description);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
  const app = schemas.find((schema) => schema['@type'] === 'WebApplication');
  assert.equal(app.description, description); assert.equal(app.dateModified, '2026-11-05');
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /role="status"[^>]*aria-live="polite"/);
  assert.match(html, /<label for="seed"/);
  assert.match(html, /data-site-policy-links/);
  assert.doesNotMatch(html, /fonts\.googleapis|cdn.*faker|无法拨打|完全合法/);
  for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) assert.doesNotThrow(() => new vm.Script(match[1]));
});
