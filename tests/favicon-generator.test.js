import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const html = fs.readFileSync(
  new URL('../tools/media/favicon-generator.html', import.meta.url),
  'utf8',
);
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(
  (match) => match[1],
);
const source = scripts.find((text) => text.includes('const FAVICON_SIZES'));
function core() {
  assert.ok(source, 'The standalone page must expose its favicon generation core');
  const context = vm.createContext({ TextEncoder, Uint8Array, Uint8ClampedArray, DataView, Intl });
  vm.runInContext(source.split('// Bind favicon interface')[0], context);
  return { context, run: (expression) => vm.runInContext(expression, context) };
}
const settings = {
  mode: 'text',
  text: 'W',
  emoji: '🚀',
  fit: 'contain',
  padding: 10,
  background: '#2457d6',
  foreground: '#ffffff',
  transparent: false,
  radius: 12,
  font: 'sans-serif',
  appName: '我的网站',
};

test('settings reject empty or oversized text and invalid appearance values', () => {
  const { context, run } = core();
  context.input = settings;
  assert.equal(run('validateSettings(input).text'), 'W');
  for (const change of [
    { text: '' },
    { text: 'four' },
    { padding: 31 },
    { background: 'red' },
    { radius: -1 },
    { mode: 'unknown' },
    { appName: '' },
  ]) {
    context.input = { ...settings, ...change };
    assert.throws(() => run('validateSettings(input)'));
  }
  context.input = { ...settings, text: '图标' };
  assert.equal(run('validateSettings(input).text'), '图标');
  context.input = { ...settings, mode: 'emoji', emoji: '👩‍💻' };
  assert.equal(run('validateSettings(input).emoji'), '👩‍💻');
});

test('image placement preserves aspect ratio for contain and crops symmetrically for cover', () => {
  const { run } = core();
  const contain = JSON.parse(run('JSON.stringify(imagePlacement(800,400,512,10,"contain"))'));
  for (const [key, value] of Object.entries({
    sx: 0,
    sy: 0,
    sw: 800,
    sh: 400,
    dx: 51.2,
    dy: 153.6,
    dw: 409.6,
    dh: 204.8,
  }))
    assert.ok(Math.abs(contain[key] - value) < 1e-9);
  const crop = JSON.parse(run('JSON.stringify(imagePlacement(800,400,512,0,"cover"))'));
  assert.deepEqual(crop, { sx: 200, sy: 0, sw: 400, sh: 400, dx: 0, dy: 0, dw: 512, dh: 512 });
  assert.throws(() => run('imagePlacement(0,100,32,10,"contain")'));
});

test('upload validation rejects unsupported or oversized files and decoded images', () => {
  const { run } = core();
  assert.throws(
    () => run('validateUploadFile({name:"payload.html",type:"text/html",size:100})'),
    /PNG|格式/,
  );
  assert.throws(
    () => run('validateUploadFile({name:"large.png",type:"image/png",size:10485761})'),
    /10|大小/,
  );
  assert.doesNotThrow(() =>
    run('validateUploadFile({name:"logo.svg",type:"image/svg+xml",size:512})'),
  );
  assert.throws(() => run('validateImageDimensions(9000,9000)'), /4096|尺寸|像素/);
});

test('ICO contains independent 16, 32, and 48 pixel 32-bit bitmaps with valid directory offsets', () => {
  const { context, run } = core();
  context.frames = [16, 32, 48].map((size) => ({
    size,
    rgba: new Uint8Array(size * size * 4).fill(255),
  }));
  context.frames[0].rgba.set([10, 20, 30, 0], 0);
  const bytes = run('encodeIco(frames)');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  assert.equal(view.getUint16(0, true), 0);
  assert.equal(view.getUint16(2, true), 1);
  assert.equal(view.getUint16(4, true), 3);
  let expectedOffset = 54;
  for (let index = 0; index < 3; index++) {
    const size = [16, 32, 48][index],
      pos = 6 + index * 16;
    assert.equal(view.getUint8(pos), size);
    assert.equal(view.getUint8(pos + 1), size);
    assert.equal(view.getUint16(pos + 4, true), 1);
    assert.equal(view.getUint16(pos + 6, true), 32);
    assert.equal(view.getUint32(pos + 12, true), expectedOffset);
    assert.equal(view.getUint32(expectedOffset, true), 40);
    assert.equal(view.getInt32(expectedOffset + 4, true), size);
    assert.equal(view.getInt32(expectedOffset + 8, true), size * 2);
    const xorSize = size * size * 4,
      maskSize = Math.ceil(size / 32) * 4 * size;
    assert.equal(view.getUint32(pos + 8, true), 40 + xorSize + maskSize);
    if (index === 0) {
      assert.deepEqual(
        Array.from(
          bytes.slice(
            expectedOffset + 40 + (size - 1) * size * 4,
            expectedOffset + 40 + (size - 1) * size * 4 + 4,
          ),
        ),
        [0, 0, 0, 0],
      );
      assert.equal(
        bytes[expectedOffset + 40 + xorSize + (size - 1) * Math.ceil(size / 32) * 4] & 128,
        128,
      );
    }
    expectedOffset += 40 + xorSize + maskSize;
  }
  assert.equal(expectedOffset, bytes.length);
});

function independentCrc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
test('ZIP store entries have correct CRC, sizes, UTF-8 filenames and central-directory references', () => {
  const { context, run } = core();
  context.entries = [
    { name: 'favicon.ico', data: new Uint8Array([0, 0, 1, 0]) },
    { name: '安装.txt', data: new TextEncoder().encode('中文代码') },
  ];
  const zip = run('encodeZip(entries)');
  const bytes = new Uint8Array(zip);
  const view = new DataView(bytes.buffer);
  let position = 0;
  for (const entry of context.entries) {
    assert.equal(view.getUint32(position, true), 0x04034b50);
    assert.equal(view.getUint16(position + 6, true) & 0x800, 0x800);
    assert.equal(view.getUint16(position + 8, true), 0);
    assert.equal(view.getUint32(position + 14, true), independentCrc32(entry.data));
    assert.equal(view.getUint32(position + 18, true), entry.data.length);
    const length = view.getUint16(position + 26, true);
    const dataStart = position + 30 + length;
    assert.equal(new TextDecoder().decode(bytes.slice(position + 30, dataStart)), entry.name);
    assert.deepEqual(
      Array.from(bytes.slice(dataStart, dataStart + entry.data.length)),
      Array.from(entry.data),
    );
    position = dataStart + entry.data.length;
  }
  const centralStart = position;
  let local = 0;
  for (const entry of context.entries) {
    assert.equal(view.getUint32(position, true), 0x02014b50);
    assert.equal(view.getUint32(position + 42, true), local);
    const length = view.getUint16(position + 28, true);
    position += 46 + length;
    local += 30 + length + entry.data.length;
  }
  assert.equal(view.getUint32(position, true), 0x06054b50);
  assert.equal(view.getUint16(position + 10, true), 2);
  assert.equal(view.getUint32(position + 16, true), centralStart);
  assert.equal(position + 22, bytes.length);
});

test('manifest and installation code refer to actual package filenames without maskable claims', () => {
  const { run } = core();
  const manifest = JSON.parse(run('manifestFor("My <site>","#2457d6")'));
  assert.equal(manifest.name, 'My <site>');
  assert.equal(manifest.icons.length, 2);
  assert.deepEqual(
    manifest.icons.map((icon) => icon.src),
    ['/icon-192.png', '/icon-512.png'],
  );
  assert.ok(manifest.icons.every((icon) => icon.purpose === 'any'));
  const code = run('installationCode()');
  for (const file of [
    'favicon.ico',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'apple-touch-icon.png',
    'site.webmanifest',
  ])
    assert.ok(code.includes('/' + file));
  assert.doesNotMatch(code, /\.svg|shortcut/);
});

test('site names remain JSON text and reject control characters', () => {
  const { context, run } = core();
  const name = '<img src=x onerror="alert(1)">';
  context.input = { ...settings, appName: name };
  assert.equal(run('validateSettings(input).appName'), name);
  context.siteName = name;
  const manifest = JSON.parse(run('manifestFor(siteName,"#2457d6")'));
  assert.equal(manifest.name, name);
  assert.equal(manifest.theme_color, '#2457d6');
  assert.equal(manifest.background_color, '#2457d6');
  assert.equal(manifest.display, 'standalone');
  context.input = { ...settings, appName: 'name\nwith newline' };
  assert.throws(() => run('validateSettings(input)'), /控制字符/);
});

test('SEO metadata is consistent and describes implemented ICO and ZIP exports', () => {
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  assert.ok(description && description.length >= 120 && description.length <= 160);
  assert.match(description, /ICO/);
  assert.match(description, /ZIP/);
  assert.equal(html.match(/<meta property="og:description" content="([^"]*)"/)[1], description);
  assert.equal(html.match(/<meta name="twitter:description" content="([^"]*)"/)[1], description);
  const schemas = scripts.filter((s) => s.trim().startsWith('{')).map((s) => JSON.parse(s));
  const app = schemas.find((s) => s['@type'] === 'WebApplication');
  assert.equal(app.description, description);
  assert.equal(app.dateModified, '2026-11-05');
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /data-site-policy-links/);
  assert.doesNotMatch(
    html,
    /fonts\.googleapis|<script[^>]+src="[^"]*(?:jszip|cdn[^"/]*\/[^"<]*favicon)/i,
  );
  for (const script of scripts.filter((s) => !s.trim().startsWith('{')))
    assert.doesNotThrow(() => new vm.Script(script));
});
