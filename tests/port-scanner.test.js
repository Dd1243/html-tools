import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const html = fs.readFileSync(new URL('../tools/network/port-scanner.html', import.meta.url), 'utf8');
const script = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .find((source) => source.includes('const SERVICE_CATALOG'));
const coreScript = script?.split('// Bind interface')[0];

function loadCore() {
  const context = vm.createContext({
    Math: Object.assign(Object.create(Math), {
      random() {
        throw new Error('Math.random must not be used for demo results');
      },
    }),
  });
  vm.runInContext(coreScript, context);
  return (expression) => vm.runInContext(expression, context);
}

function loadPage() {
  const elements = new Map();
  function element() {
    return {
      value: '', textContent: '', hidden: false, children: [], dataset: {},
      classList: { add() {}, remove() {} },
      append(...items) { this.children.push(...items); },
      replaceChildren() { this.children = []; },
      addEventListener() {}, setAttribute() {}, removeAttribute() {}, focus() {}, select() {},
      options: [
        { value: 'web', textContent: 'Web 服务器：80 / 443 开放' },
        { value: 'database', textContent: '数据库服务器：3306 / 5432 / 6379 开放' },
        { value: 'firewall', textContent: '防火墙：443 开放，其余被过滤' },
      ],
      get selectedOptions() { return this.options.filter((option) => option.value === this.value); },
    };
  }
  const get = (id) => {
    if (!elements.has(id)) elements.set(id, element());
    return elements.get(id);
  };
  get('categoryFilter').value = 'all';
  get('statusFilter').value = 'all';
  get('sampleProfile').value = 'web';
  const rootAttributes = {};
  const context = vm.createContext({
    document: {
      getElementById: get,
      createElement: element,
      querySelectorAll: () => [],
      documentElement: { setAttribute: (key, value) => { rootAttributes[key] = value; }, getAttribute: (key) => rootAttributes[key] },
    },
    localStorage: { getItem: () => null, setItem() {} },
  });
  vm.runInContext(script, context);
  return { get, run: (expression) => vm.runInContext(expression, context) };
}

test('changing the next sample selection keeps existing result captions tied to the completed demo', () => {
  const { get, run } = loadPage();
  get('portExpression').value = '80,443,3306';
  run('runDemo({preventDefault() {}})');
  assert.equal(get('openCount').textContent, 2);
  get('sampleProfile').value = 'database';
  get('portSearch').value = '80';
  run('renderResults()');
  assert.match(get('resultCaption').textContent, /Web 服务器/);
  assert.match(run('reportText()'), /80\/TCP\tHTTP\tWeb\t开放/);
  assert.equal(get('openCount').textContent, 2);
});

test('port input accepts comma-separated numbers and bounded ranges', () => {
  const run = loadCore();
  assert.deepEqual(Array.from(run('parsePortExpression("443,80,8000-8002,443")')), [80, 443, 8000, 8001, 8002]);
});

test('port input rejects invalid values, reversed ranges, and oversized requests', () => {
  const run = loadCore();
  for (const expression of ['0', '65536', '80-', '90-80', '22,,80', '1-257']) {
    assert.throws(() => run(`parsePortExpression(${JSON.stringify(expression)})`), /端口|范围|最多/);
  }
});

test('demo results are fixed by the selected sample profile', () => {
  const run = loadCore();
  const web = Array.from(run('createDemoResults([22, 80, 443, 3306], "web")'), (row) => `${row.port}:${row.status}`);
  const database = Array.from(run('createDemoResults([22, 80, 3306], "database")'), (row) => `${row.port}:${row.status}`);
  assert.deepEqual(web, ['22:closed', '80:open', '443:open', '3306:closed']);
  assert.deepEqual(database, ['22:closed', '80:closed', '3306:open']);
  assert.doesNotThrow(() => run('createDemoResults([80, 443], "web")'));
});

test('unknown ports stay visible as unregistered services in result rows', () => {
  const run = loadCore();
  const row = run('createDemoResults([65000], "web")[0]');
  assert.equal(row.service, '未收录');
  assert.equal(row.category, 'custom');
  assert.equal(row.status, 'closed');
});

test('CSV export quotes fields containing commas or quotes', () => {
  const run = loadCore();
  assert.equal(run('toCsv([{port: 80, service: "Web, \\"HTTP\\"", category: "web", status: "open"}])'),
    '端口,协议,服务,分类,示例状态\r\n80,TCP,"Web, ""HTTP""",Web,开放');
});

test('SEO metadata describes an offline demo instead of real remote scanning', () => {
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  assert.ok(description && description.length >= 120 && description.length <= 160);
  assert.match(description, /离线|固定样例/);
  assert.match(description, /不会连接目标主机|不执行真实/);
  assert.doesNotMatch(description, /扫描检测目标主机 IP 地址开放|识别端口对应的服务类型版本信息/);
  assert.equal(html.match(/<meta property="og:description" content="([^"]*)"/)[1], description);
  assert.equal(html.match(/<meta name="twitter:description" content="([^"]*)"/)[1], description);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
  assert.equal(schemas.find((schema) => schema['@type'] === 'WebApplication').description, description);
  assert.match(html, /"dateModified": "2026-11-05"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    assert.doesNotThrow(() => new vm.Script(match[1]));
  }
});

test('interactive controls expose labels, live feedback, and mobile layout rules', () => {
  assert.match(html, /for="portExpression"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /@media\s*\(max-width:\s*640px\)/);
  assert.match(html, /prefers-reduced-motion/);
});
