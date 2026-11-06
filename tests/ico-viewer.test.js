import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const html = fs.readFileSync(new URL('../tools/media/ico-viewer.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(
  (match) => match[1]
);
const source = scripts.find((script) => script.includes('const ICO_LIMITS'));
function core() {
  assert.ok(source, 'The page must expose its standalone ICO parsing core');
  const context = vm.createContext({
    Uint8Array,
    Uint8ClampedArray,
    ArrayBuffer,
    DataView,
    TextEncoder
  });
  vm.runInContext(source.split('// Bind ico interface')[0], context);
  return { context, run: (expression) => vm.runInContext(expression, context) };
}
function ico(payloads, type = 1) {
  const size =
    6 + payloads.length * 16 + payloads.reduce((sum, item) => sum + item.bytes.length, 0);
  const bytes = new Uint8Array(size);
  const view = new DataView(bytes.buffer);
  view.setUint16(2, type, true);
  view.setUint16(4, payloads.length, true);
  let offset = 6 + payloads.length * 16;
  payloads.forEach((item, i) => {
    const at = 6 + i * 16;
    bytes[at] = item.width === 256 ? 0 : item.width;
    bytes[at + 1] = item.height === 256 ? 0 : item.height;
    view.setUint16(at + 4, type === 2 ? item.hotspotX || 0 : 1, true);
    view.setUint16(at + 6, type === 2 ? item.hotspotY || 0 : item.bitDepth || 32, true);
    view.setUint32(at + 8, item.bytes.length, true);
    view.setUint32(at + 12, offset, true);
    bytes.set(item.bytes, offset);
    offset += item.bytes.length;
  });
  return bytes;
}
function dib(width, height, bitDepth, pixels, mask = [], palette = [], headerSize = 40) {
  const stride = Math.ceil((width * bitDepth) / 32) * 4;
  const maskStride = Math.ceil(width / 32) * 4;
  const paletteSize = palette.length * 4;
  const bytes = new Uint8Array(headerSize + paletteSize + stride * height + maskStride * height);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, headerSize, true);
  view.setInt32(4, width, true);
  view.setInt32(8, height * 2, true);
  view.setUint16(12, 1, true);
  view.setUint16(14, bitDepth, true);
  view.setUint32(32, palette.length, true);
  palette.forEach((rgb, i) => bytes.set([rgb[2], rgb[1], rgb[0], 99], headerSize + i * 4));
  for (let y = 0; y < height; y++) {
    const row = headerSize + paletteSize + (height - y - 1) * stride;
    for (let x = 0; x < width; x++) {
      const pixel = pixels[y * width + x];
      if (bitDepth === 32) bytes.set([pixel[2], pixel[1], pixel[0], pixel[3]], row + x * 4);
      else if (bitDepth === 24) bytes.set([pixel[2], pixel[1], pixel[0]], row + x * 3);
      else if (bitDepth === 16) view.setUint16(row + x * 2, pixel, true);
      else if (bitDepth === 8) bytes[row + x] = pixel;
      else if (bitDepth === 4) bytes[row + (x >> 1)] |= pixel << (x % 2 ? 0 : 4);
      else if (bitDepth === 1) bytes[row + (x >> 3)] |= pixel << (7 - (x % 8));
      if (mask[y * width + x])
        bytes[
          headerSize + paletteSize + stride * height + (height - y - 1) * maskStride + (x >> 3)
        ] |= 1 << (7 - (x % 8));
    }
  }
  return { bytes, width, height, bitDepth };
}
function decode(item) {
  const { context, run } = core();
  context.fixture = ico([item]);
  return JSON.parse(
    run('JSON.stringify(Array.from(decodeDib(parseIco(fixture).entries[0]).rgba))')
  );
}
function pngHeader(width, height) {
  const bytes = new Uint8Array(58);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10]);
  const view = new DataView(bytes.buffer);
  view.setUint32(8, 13);
  bytes.set([73, 72, 68, 82], 12);
  view.setUint32(16, width);
  view.setUint32(20, height);
  bytes[24] = 8;
  bytes[25] = 6;
  view.setUint32(33, 1);
  bytes.set([73, 68, 65, 84], 37);
  bytes.set([73, 69, 78, 68], 50);
  return bytes;
}

test('identifies ICO and CUR by bytes, preserves duplicate-size entries and maps zero dimensions to 256', () => {
  const { context, run } = core();
  context.fixture = ico([dib(1, 1, 24, [[255, 0, 0]]), dib(1, 1, 32, [[0, 255, 0, 255]])]);
  const parsed = run('parseIco(fixture)');
  assert.equal(parsed.type, 'ICO');
  assert.equal(parsed.entries.length, 2);
  assert.deepEqual(
    Array.from(parsed.entries, (entry) => entry.index),
    [1, 2]
  );
  context.fixture = ico([{ width: 256, height: 256, bytes: pngHeader(256, 256) }]);
  assert.equal(run('parseIco(fixture).entries[0].width'), 256);
  context.fixture = ico(
    [{ ...dib(2, 2, 24, Array(4).fill([255, 0, 0])), hotspotX: 1, hotspotY: 1 }],
    2
  );
  const cursor = run('parseIco(fixture)');
  assert.equal(cursor.type, 'CUR');
  assert.equal(cursor.entries[0].hotspotX, 1);
  assert.equal(cursor.entries[0].hotspotY, 1);
  assert.equal(cursor.entries[0].bitDepth, 24);
});

test('rejects invalid global headers and bounds before allocating images', () => {
  const { context, run } = core();
  for (const fixture of [
    new Uint8Array(5),
    new Uint8Array(6),
    new Uint8Array([1, 0, 1, 0, 1, 0]),
    new Uint8Array([0, 0, 3, 0, 1, 0]),
    new Uint8Array([0, 0, 1, 0, 1, 1]),
    new Uint8Array([0, 0, 1, 0, 1, 0])
  ]) {
    context.fixture = fixture;
    assert.throws(() => run('parseIco(fixture)'));
  }
  assert.throws(() => run('parseIco(new Uint8Array(ICO_LIMITS.file + 1))'));
  context.fixture = ico(
    Array.from({ length: 65 }, () => ({ width: 256, height: 256, bytes: pngHeader(256, 256) }))
  );
  assert.throws(() => run('parseIco(fixture)'), /像素|pixel/);
});

test('isolates invalid entry offsets and payloads while retaining usable layers', () => {
  const { context, run } = core();
  const bytes = ico([dib(1, 1, 24, [[255, 0, 0]]), dib(1, 1, 24, [[0, 0, 255]])]);
  new DataView(bytes.buffer).setUint32(18, 6, true);
  context.fixture = bytes;
  assert.ok(run('parseIco(fixture).entries[0].error'));
  assert.equal(run('parseIco(fixture).entries[1].error'), '');
  assert.equal(run('decodeDib(parseIco(fixture).entries[1]).rgba[2]'), 255);
});

test('decodes 24-bit bottom-up BGR rows, DWORD padding and AND masks to exact pixels', () => {
  const fixture = dib(
    3,
    2,
    24,
    [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255],
      [255, 255, 0],
      [0, 255, 255],
      [255, 0, 255]
    ],
    [0, 0, 1, 0, 1, 0]
  );
  assert.deepEqual(
    decode(fixture),
    [
      255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 0, 255, 255, 0, 255, 0, 255, 255, 0, 255, 0, 255,
      255
    ]
  );
});

test('palette formats use high bits first, ignore palette reserved alpha and honor odd-width padding', () => {
  const palette = [
    [0, 0, 0],
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255]
  ];
  for (const bits of [1, 4, 8]) {
    const used = bits === 1 ? palette.slice(0, 2) : palette;
    const indexes = bits === 1 ? [1, 0, 1, 0, 1, 0] : [1, 2, 3, 3, 2, 1];
    const expected = indexes.flatMap((index) => [...used[index], 255]);
    assert.deepEqual(decode(dib(3, 2, bits, indexes, [], used)), expected);
  }
});

test('16-bit BI_RGB uses RGB555 and extended 108/124-byte BI_RGB headers remain decodable', () => {
  assert.deepEqual(decode(dib(2, 1, 16, [0x7c00, 0x03e0])), [255, 0, 0, 255, 0, 255, 0, 255]);
  for (const header of [108, 124])
    assert.deepEqual(decode(dib(1, 1, 24, [[1, 2, 3]], [], [], header)), [1, 2, 3, 255]);
});

test('32-bit alpha follows ARGB if any alpha is nonzero, and legacy all-zero alpha uses AND', () => {
  assert.deepEqual(
    decode(
      dib(
        2,
        1,
        32,
        [
          [10, 20, 30, 128],
          [40, 50, 60, 0]
        ],
        [1, 0]
      )
    ),
    [10, 20, 30, 128, 40, 50, 60, 0]
  );
  assert.deepEqual(
    decode(
      dib(
        2,
        1,
        32,
        [
          [10, 20, 30, 0],
          [40, 50, 60, 0]
        ],
        [0, 1]
      )
    ),
    [10, 20, 30, 255, 40, 50, 60, 0]
  );
});

test('valid 32-bit alpha permits absent AND with warning while legacy pixels require the mask', () => {
  const { context, run } = core();
  const modern = dib(1, 1, 32, [[10, 20, 30, 128]]);
  modern.bytes = modern.bytes.slice(0, -4);
  context.fixture = ico([modern]);
  assert.equal(run('decodeDib(parseIco(fixture).entries[0]).rgba[3]'), 128);
  assert.ok(run('decodeDib(parseIco(fixture).entries[0]).warnings.length') > 0);
  const legacy = dib(1, 1, 32, [[10, 20, 30, 0]]);
  legacy.bytes = legacy.bytes.slice(0, -4);
  context.fixture = ico([legacy]);
  assert.throws(() => run('decodeDib(parseIco(fixture).entries[0])'), /AND|mask/);
  context.fixture = ico([dib(1, 1, 24, [[255, 255, 255]], [1])]);
  assert.match(run('decodeDib(parseIco(fixture).entries[0]).warnings.join(" ")'), /反色/);
});

test('default palette size, missing palette entries and CUR hotspot bounds are validated', () => {
  const { context, run } = core();
  const item = dib(
    2,
    1,
    1,
    [0, 1],
    [],
    [
      [1, 2, 3],
      [4, 5, 6]
    ]
  );
  new DataView(item.bytes.buffer).setUint32(32, 0, true);
  assert.deepEqual(decode(item), [1, 2, 3, 255, 4, 5, 6, 255]);
  context.fixture = ico([
    dib(
      1,
      1,
      8,
      [3],
      [],
      [
        [1, 2, 3],
        [4, 5, 6]
      ]
    )
  ]);
  assert.throws(() => run('decodeDib(parseIco(fixture).entries[0])'), /调色板/);
  context.fixture = ico([{ ...dib(1, 1, 24, [[1, 2, 3]]), hotspotX: 1 }], 2);
  assert.match(run('parseIco(fixture).entries[0].error'), /热点/);
});

test('views with nonzero byteOffset parse and decode without using unrelated backing-buffer bytes', () => {
  const { context, run } = core();
  const original = ico([dib(1, 1, 24, [[12, 34, 56]])]),
    padded = new Uint8Array(original.length + 30);
  padded.set(original, 17);
  context.fixture = padded.subarray(17, 17 + original.length);
  assert.equal(run('decodeDib(parseIco(fixture).entries[0]).rgba[0]'), 12);
});

test('DIB rejects unsupported headers/compression, invalid dimensions and truncated data', () => {
  const { context, run } = core();
  for (const mutate of [
    (view) => view.setUint32(0, 12, true),
    (view) => view.setUint32(16, 3, true),
    (view) => view.setUint32(16, 1, true),
    (view) => view.setInt32(8, 1, true),
    (view) => view.setInt32(8, -2, true),
    (view) => view.setInt32(4, 2, true),
    (view) => view.setUint16(12, 2, true),
    (view) => view.setUint16(14, 2, true)
  ]) {
    const item = dib(1, 1, 24, [[255, 0, 0]]);
    mutate(new DataView(item.bytes.buffer));
    context.fixture = ico([item]);
    assert.throws(() => run('decodeDib(parseIco(fixture).entries[0])'));
  }
  const item = dib(
    1,
    1,
    8,
    [1],
    [],
    [
      [0, 0, 0],
      [255, 0, 0]
    ]
  );
  item.bytes = item.bytes.slice(0, -1);
  context.fixture = ico([item]);
  assert.throws(() => run('decodeDib(parseIco(fixture).entries[0])'), /截断|不足|mask|数据/);
});

test('PNG validation requires all eight signature bytes and checks IHDR against the directory', () => {
  const { context, run } = core();
  context.fixture = pngHeader(32, 32);
  assert.equal(run('validatePng(fixture,{width:32,height:32}).bitDepth'), 32);
  assert.throws(() => run('validatePng(fixture,{width:16,height:16})'), /尺寸/);
  context.fixture = pngHeader(512, 512);
  assert.throws(() => run('validatePng(fixture,{width:512,height:512})'));
  context.fixture = pngHeader(32, 32);
  context.fixture[7] = 0;
  assert.throws(() => run('validatePng(fixture,{width:32,height:32})'), /PNG|签名/);
});

test('PNG rejects truncated chunk extents, missing image data and missing or malformed IEND', () => {
  const { context, run } = core();
  const badLength = pngHeader(16, 16);
  new DataView(badLength.buffer).setUint32(33, 0xffffff01);
  const badEnd = pngHeader(16, 16);
  new DataView(badEnd.buffer).setUint32(46, 1);
  const noData = pngHeader(16, 16);
  noData.set([116, 69, 88, 116], 37);
  for (const fixture of [
    badLength,
    badEnd,
    noData,
    pngHeader(16, 16).slice(0, -1),
    pngHeader(16, 16).slice(0, 33)
  ]) {
    context.fixture = fixture;
    assert.throws(() => run('validatePng(fixture,{width:16,height:16})'), /PNG|IDAT|IEND|截断|块/);
  }
});

test('ZIP STORE has correct local/central headers, CRC32 and unique layer filenames', () => {
  const { context, run } = core();
  assert.equal(run('crc32(new TextEncoder().encode("123456789"))'), 0xcbf43926);
  assert.equal(
    run('frameFilename("../test.ico",{index:1,width:16,height:16,bitDepth:32})'),
    'test-layer-001-16x16-32bit.png'
  );
  assert.notEqual(
    run('frameFilename("test.ico",{index:1,width:16,height:16,bitDepth:32})'),
    run('frameFilename("test.ico",{index:2,width:16,height:16,bitDepth:32})')
  );
  const packed = new Uint8Array(
    run(
      'buildZip([{name:"a.png",bytes:new Uint8Array([1,2,3])},{name:"b.png",bytes:new Uint8Array([4,5])}])'
    )
  );
  const view = new DataView(packed.buffer);
  assert.equal(view.getUint32(0, true), 0x04034b50);
  assert.equal(view.getUint16(8, true), 0);
  assert.equal(view.getUint32(14, true), 0x55bc801d);
  assert.equal(view.getUint32(18, true), 3);
  assert.deepEqual(Array.from(packed.slice(35, 38)), [1, 2, 3]);
  assert.equal(view.getUint32(packed.length - 22, true), 0x06054b50);
  assert.equal(view.getUint16(packed.length - 12, true), 2);
  assert.equal(view.getUint32(view.getUint32(packed.length - 6, true), true), 0x02014b50);
});

test('ZIP accepts harmless internal repeated dots in source names while rejecting path entries', () => {
  const { run } = core();
  assert.doesNotThrow(() =>
    run(
      'buildZip([{name:frameFilename("logo..backup.ico",{index:1,width:16,height:16,bitDepth:32}),bytes:new Uint8Array([1])}])'
    )
  );
  for (const name of ['../a.png', 'folder/a.png', 'folder\\a.png', '.', '..']) {
    assert.throws(() =>
      run('buildZip([{name:' + JSON.stringify(name) + ',bytes:new Uint8Array([1])}])')
    );
  }
});

test('page metadata and executable scripts stay consistent and valid', () => {
  for (const script of scripts)
    if (!script.trim().startsWith('{')) assert.doesNotThrow(() => new vm.Script(script));
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)[1];
  const tags = [...head.matchAll(/<meta\b[^>]*>/gi)].map((match) => match[0]);
  const content = (name, attribute = 'name') =>
    tags
      .find((tag) => new RegExp('\\b' + attribute + '\\s*=\\s*"' + name + '"', 'i').test(tag))
      .match(/\bcontent\s*=\s*"([^"]*)"/i)[1];
  assert.equal(content('description'), content('og:description', 'property'));
  assert.equal(content('description'), content('twitter:description'));
  const graph = [
    ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)
  ].flatMap((match) => {
    const parsed = JSON.parse(match[1]);
    return parsed['@graph'] || [parsed];
  });
  assert.equal(graph.filter((item) => item['@type'] === 'WebApplication').length, 1);
  assert.equal(graph.filter((item) => item['@type'] === 'BreadcrumbList').length, 1);
  assert.equal(
    graph.find((item) => item['@type'] === 'WebApplication').description,
    content('description')
  );
  assert.equal(graph.find((item) => item['@type'] === 'WebApplication').dateModified, '2026-11-06');
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.doesNotMatch(head, /fonts\.googleapis|fonts\.gstatic|picocss|FAQPage/);
});
