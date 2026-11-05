import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const html = fs.readFileSync(new URL('../tools/generator/wifi-qr.html', import.meta.url), 'utf8');
const sources = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
const source = sources.find((text) => text.includes('const WIFI_TYPES'));
function load() {
  const context = vm.createContext({ TextEncoder });
  for (const text of sources.filter((text) => text.includes('var qrcodegen;'))) vm.runInContext(text, context);
  if (source) vm.runInContext(source.split('// Bind Wi-Fi interface')[0], context);
  return (expression) => vm.runInContext(expression, context);
}

test('Wi-Fi payload escapes every reserved separator and preserves SSID spaces', () => {
  const run = load();
  const settings = {ssid: ' home;room,:\\" ', password: 'p;ass,:\\"word', encryption: 'WPA', hidden: true};
  assert.equal(run('buildWifiPayload(' + JSON.stringify(settings) + ')'),
    'WIFI:T:WPA;S: home\\;room\\,\\:\\\\\\" ;P:p\\;ass\\,\\:\\\\\\"word;H:true;;');
});

test('open Wi-Fi payload omits the password even when the field still has a value', () => {
  const run = load();
  assert.equal(run("buildWifiPayload({ssid:'Guest',password:'secret123',encryption:'nopass',hidden:false})"), 'WIFI:T:nopass;S:Guest;H:false;;');
});

test('SSID length is validated in UTF-8 bytes without trimming its real value', () => {
  const run = load();
  assert.equal(run("validateWifiSettings({ssid:'  home  ',password:'password',encryption:'WPA',size:512}).ssid"), '  home  ');
  assert.doesNotThrow(() => run("validateWifiSettings({ssid:'中'.repeat(10)+'ab',password:'password',encryption:'WPA',size:512})"));
  assert.throws(() => run("validateWifiSettings({ssid:'中'.repeat(11),password:'password',encryption:'WPA',size:512})"), /32|字节/);
  assert.throws(() => run("validateWifiSettings({ssid:'',password:'password',encryption:'WPA',size:512})"), /名称|SSID/);
});

test('protected networks require a password and unsupported types or sizes are rejected', () => {
  const run = load();
  assert.throws(() => run("validateWifiSettings({ssid:'Home',password:'',encryption:'WPA',size:512})"), /密码/);
  assert.throws(() => run("validateWifiSettings({ssid:'Home',password:'password',encryption:'WPA3',size:512})"), /加密/);
  assert.throws(() => run("validateWifiSettings({ssid:'Home',password:'password',encryption:'WPA',size:1})"), /尺寸/);
  assert.doesNotThrow(() => run("validateWifiSettings({ssid:'Home',password:'',encryption:'nopass',size:512})"));
});

test('colors require readable dark modules on a light background', () => {
  const run = load();
  for (const colors of [
    {foreground:'#ffffff',background:'#000000'},
    {foreground:'#aaaaaa',background:'#ffffff'},
    {foreground:'red',background:'#ffffff'},
  ]) {
    const input = {ssid:'Home',password:'password',encryption:'WPA',size:512,...colors};
    assert.throws(() => run('validateWifiSettings(' + JSON.stringify(input) + ')'), /颜色|对比度/);
  }
  assert.doesNotThrow(() => run("validateWifiSettings({ssid:'Home',password:'password',encryption:'WPA',size:512,foreground:'#000000',background:'#ffffff'})"));
});

test('network credentials reject control characters without changing legitimate spaces', () => {
  const run = load();
  assert.throws(() => run("validateWifiSettings({ssid:'Home\\nWiFi',password:'password',encryption:'WPA',size:512})"), /控制字符/);
  assert.throws(() => run("validateWifiSettings({ssid:'Home',password:'pass\\nword',encryption:'WPA',size:512})"), /控制字符/);
  assert.equal(run("validateWifiSettings({ssid:'Home',password:' password ',encryption:'WPA',size:512}).password"), ' password ');
});

test('QR geometry reserves at least four modules on every edge at integer scale', () => {
  const run = load();
  const geometry = run('getQrGeometry(37, 512)');
  assert.equal(Number.isInteger(geometry.scale), true);
  assert.ok(geometry.offset >= geometry.scale * 4);
  assert.ok(512 - geometry.offset - 37 * geometry.scale >= geometry.scale * 4);
});

test('inline MIT QR encoder handles UTF-8 payloads without remote dependencies', () => {
  const run = load();
  const result = run("makeWifiQr('WIFI:T:WPA;S:中文☕;P:password;;')");
  assert.ok(result.size >= 21 && result.size <= 177);
  assert.equal(result.getModule(0, 0), true);
  assert.match(html, /Copyright \(c\) Project Nayuki/);
  assert.doesNotMatch(html, /<script[^>]+src="[^"]*(?:qrcode|qrcodejs)/);
});

test('metadata and accessible controls match the supported offline Wi-Fi tool', () => {
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  assert.ok(description && description.length >= 120 && description.length <= 160);
  assert.equal(html.match(/<meta property="og:description" content="([^"]*)"/)[1], description);
  assert.equal(html.match(/<meta name="twitter:description" content="([^"]*)"/)[1], description);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
  assert.equal(schemas.find((schema) => schema['@type'] === 'WebApplication').description, description);
  assert.equal(schemas.find((schema) => schema['@type'] === 'WebApplication').dateModified, '2026-11-05');
  assert.match(html, /for="ssid"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /@media\s*\(max-width:\s*640px\)/);
  assert.doesNotMatch(html, /document\.write\(/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  for (const text of sources.filter((text) => !text.trim().startsWith('{'))) assert.doesNotThrow(() => new vm.Script(text));
});
