import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const html = fs.readFileSync(new URL('../tools/seo/robots-generator.html', import.meta.url), 'utf8');
const script = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .find((source) => source.includes('const commonBots'));

function makeElement() {
  const element = {
    children: [],
    value: '',
    checked: false,
    textContent: '',
    className: '',
    classList: { toggle() {} },
    appendChild(child) { this.children.push(child); return child; },
    click() {},
  };
  return element;
}

function load() {
  const ids = ['botList', 'ruleList', 'customBot', 'sitemapUrl', 'crawlDelay', 'hostDirective', 'addSitemapIndex', 'output', 'validationMessage'];
  const elements = Object.fromEntries(ids.map((id) => [id, makeElement()]));
  const themeToggle = makeElement();
  const attributes = {};
  const context = vm.createContext({
    document: {
      getElementById: (id) => elements[id] ?? makeElement(),
      createElement: () => makeElement(),
      createTextNode: (text) => ({ textContent: text }),
      querySelector: () => themeToggle,
      documentElement: {
        getAttribute: (name) => attributes[name],
        setAttribute: (name, value) => { attributes[name] = value; },
      },
    },
    localStorage: { getItem: () => null, setItem() {} },
    Date,
    URL,
  });
  context.window = context;
  vm.runInContext(script, context);
  return { context, elements, run: (expression) => vm.runInContext(expression, context) };
}

test('custom crawler selection is respected after unchecking it', () => {
  const { elements, run } = load();
  elements.customBot.value = 'ExampleBot';
  run('window.handleCustomBot({key: "Enter", preventDefault() { this.prevented = true; }})');
  const customCheckbox = elements.botList.children.at(-1).children[0];
  customCheckbox.checked = false;
  customCheckbox.onchange();
  assert.doesNotMatch(elements.output.textContent, /User-agent: ExampleBot/);
});

test('custom crawler Enter handling prevents form submission', () => {
  const { elements, run } = load();
  elements.customBot.value = 'ExampleBot';
  assert.equal(run('(() => { const event = {key: "Enter", prevented: false, preventDefault() { this.prevented = true; }}; window.handleCustomBot(event); return event.prevented; })()'), true);
});

test('rule paths reject line breaks and require a path prefix', () => {
  const { elements, run } = load();
  run('rules = [{type: "Disallow", path: "/private/\\nDisallow: /admin/"}]; generateRobots()');
  assert.doesNotMatch(elements.output.textContent, /Disallow: \/admin\//);
  assert.match(elements.validationMessage.textContent, /路径|换行/);
});

test('sitemap URL validation rejects non-HTTP URLs and injected directives', () => {
  const { elements, run } = load();
  elements.sitemapUrl.value = 'javascript:alert(1)';
  run('generateRobots()');
  assert.doesNotMatch(elements.output.textContent, /Sitemap: javascript:/);
  assert.match(elements.validationMessage.textContent, /Sitemap|URL/);

  elements.sitemapUrl.value = 'https://example.org/sitemap.xml\nDisallow: /';
  run('generateRobots()');
  assert.doesNotMatch(elements.output.textContent, /Disallow: \/\n/);

  elements.sitemapUrl.value = 'https://example.org/sitemap.xml';
  elements.addSitemapIndex.checked = true;
  run('generateRobots()');
  assert.match(elements.output.textContent, /Sitemap: https:\/\/example\.org\/sitemap_index\.xml/);
  assert.equal(elements.validationMessage.textContent, '');
});

test('presets leave the site-specific sitemap blank', () => {
  const { elements, run } = load();
  run('window.applyPreset("standard")');
  assert.equal(elements.sitemapUrl.value, '');
  assert.doesNotMatch(elements.output.textContent, /example\.com/);
});

test('crawl delay must be within the supported UI range', () => {
  const { elements, run } = load();
  elements.crawlDelay.value = '999';
  run('generateRobots()');
  assert.doesNotMatch(elements.output.textContent, /Crawl-delay: 999/);
  assert.match(elements.validationMessage.textContent, /Crawl-delay|0 到 60/);
});

test('rule explanation documents specificity instead of claiming Allow always wins', () => {
  assert.doesNotMatch(html, /允许爬取的路径\s*\(优先级更高\)/);
  assert.match(html, /路径更长的规则优先；长度相同时 Allow 优先/);
});
