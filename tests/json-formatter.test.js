import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const html = fs.readFileSync(new URL('../tools/dev/json-formatter.html', import.meta.url), 'utf8');
const pageScript = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .find((source) => source.includes('const inputEl'));

function loadPage() {
  const elements = new Map();
  const temporaryElements = [];
  const getElement = (id) => {
    if (!elements.has(id)) {
      elements.set(id, {
        value: '',
        checked: false,
        textContent: '',
        className: '',
        hidden: false,
        style: {},
        classList: { add() {}, remove() {} },
        setAttribute() {},
        removeAttribute() {},
      });
    }
    return elements.get(id);
  };
  const attributes = {};
  const context = vm.createContext({
    document: {
      body: {
        getAttribute: (name) => attributes[name],
        setAttribute: (name, value) => { attributes[name] = value; },
        appendChild() {},
      },
      getElementById: getElement,
      createElement() {
        const element = {
          style: {},
          setAttribute() {},
          select() {},
          remove() { this.removed = true; },
        };
        temporaryElements.push(element);
        return element;
      },
    },
    localStorage: { getItem: () => null, setItem() {} },
    navigator: {},
    setTimeout() {},
  });
  getElement('indent').value = '2';
  getElement('output-mode').value = 'pretty';
  context.window = context;
  vm.runInContext(pageScript, context);
  return { context, getElement, temporaryElements };
}

function extractFunction(name, nextName) {
  const start = html.indexOf(`function ${name}(`);
  const end = html.indexOf(`function ${nextName}(`, start);
  assert.notEqual(start, -1, `${name} must exist`);
  assert.notEqual(end, -1, `${nextName} must follow ${name}`);
  return html.slice(start, end);
}

test('serializes nested keys in lexical order without dropping an own __proto__ key', () => {
  const source = extractFunction('stringifySortedJson', 'getDepth');
  const context = vm.createContext({ JSON, Object, Array });
  const result = vm.runInContext(`${source}\nstringifySortedJson(JSON.parse(${JSON.stringify(
    '{"z":1,"__proto__":{"safe":true},"2":"two","10":"ten","a":{"y":2,"x":1}}'
  )}), "")`, context);

  assert.equal(
    result,
    '{"10":"ten","2":"two","__proto__":{"safe":true},"a":{"x":1,"y":2},"z":1}'
  );
  assert.equal(Object.prototype.safe, undefined);
});

test('maps native JSON parser errors to a source line and column', () => {
  const source = extractFunction('locateJsonError', 'process');
  const context = vm.createContext({ Math, String });
  const location = vm.runInContext(
    `${source}\n(() => { const source = '{\\n  "name": "Ada"\\n  "age": 36\\n}'; try { JSON.parse(source); } catch (error) { return locateJsonError(source, error); } })()`,
    vm.createContext({ Math, String, JSON })
  );

  assert.equal(location.line, 3);
  assert.equal(location.column, 3);
  assert.equal(location.sourceLine, '  "age": 36');
  assert.match(location.message, /Expected|Unexpected|JSON/);
});

test('marks parser errors without an offset as approximate', () => {
  const source = extractFunction('locateJsonError', 'process');
  const input = 'broken\njson';
  const location = vm.runInContext(
    `${source}\nlocateJsonError(${JSON.stringify(input)}, new Error('Parse error'))`,
    vm.createContext({ Math, String })
  );

  assert.equal(location.precise, false);
  assert.equal(location.line, 2);
  assert.equal(location.column, 5);
});

test('describes JSON rather than PPI and keeps SEO metadata consistent', () => {
  const description = html.match(/<meta name="description" content="([^"]*)"/i)?.[1];
  assert.ok(description && description.length >= 120 && description.length <= 160);
  assert.match(description, /JSON/);
  assert.doesNotMatch(description, /PPI|像素密度|分辨率/);
  assert.equal(html.match(/<meta property="og:description" content="([^"]*)"/i)?.[1], description);
  assert.equal(html.match(/<meta name="twitter:description" content="([^"]*)"/i)?.[1], description);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)]
    .map((match) => JSON.parse(match[1]));
  assert.equal(schemas.find((schema) => schema['@type'] === 'WebApplication')?.description, description);
});

test('provides accessible error feedback and download and file import controls', () => {
  assert.match(html, /id="error-message"[^>]*role="alert"/);
  assert.match(html, /id="downloadOutput"/);
  assert.match(html, /id="openFile"/);
  assert.match(html, /id="output-mode"/);
});

test('keeps sorting active in minified mode and separates invalid input from output', () => {
  const { context, getElement } = loadPage();
  getElement('input').value = '{"z":1,"a":2,"2":"two","10":"ten"}';
  getElement('sort-keys').checked = true;
  getElement('output-mode').value = 'minified';
  vm.runInContext('process()', context);
  assert.equal(getElement('output').value, '{"10":"ten","2":"two","a":2,"z":1}');

  getElement('input').value = '{"name": }';
  vm.runInContext('process()', context);
  assert.equal(getElement('output').value, '');
  assert.match(getElement('error-message').textContent, /第 1 行，第/);
  assert.equal(getElement('error-message').hidden, false);
});

test('reads a selected JSON file locally and formats its contents', async () => {
  const { context, getElement } = loadPage();
  context.selectedFile = {
    target: {
      files: [{ text: async () => '{"local":true}' }],
      value: 'selected.json',
    },
  };
  await vm.runInContext('readJsonFile(selectedFile)', context);

  assert.equal(getElement('input').value, '{"local":true}');
  assert.equal(getElement('output').value, '{\n  "local": true\n}');
  assert.equal(context.selectedFile.target.value, '');
});

test('reports clipboard fallback failure and always removes its temporary field', async () => {
  const { context, getElement, temporaryElements } = loadPage();
  getElement('output').value = '{"ok":true}';
  await vm.runInContext('copyOutput()', context);

  assert.equal(temporaryElements.length, 1);
  assert.equal(temporaryElements[0].removed, true);
  assert.equal(getElement('toast').textContent, '复制失败，请手动选择结果');
});
