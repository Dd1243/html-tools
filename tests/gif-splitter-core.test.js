import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const DEFAULT_PALETTE = [[0, 0, 0], [255, 0, 0], [0, 255, 0], [0, 0, 255]];

// The fixture writer packs explicitly chosen GIF LZW codes. It does not share
// parsing or compositing logic with the production implementation.
export function packGifCodes(codes, minimum = 2) {
  const clear = 1 << minimum;
  let size = minimum + 1;
  let next = clear + 2;
  let previous = false;
  let accumulator = 0;
  let bits = 0;
  const bytes = [];
  for (const code of codes) {
    accumulator |= code << bits;
    bits += size;
    while (bits >= 8) {
      bytes.push(accumulator & 255);
      accumulator >>>= 8;
      bits -= 8;
    }
    if (code === clear) {
      size = minimum + 1;
      next = clear + 2;
      previous = false;
    } else if (code !== clear + 1) {
      if (previous && next < 4096) {
        next++;
        if (next === 1 << size && size < 12) size++;
      }
      previous = true;
    }
  }
  if (bits) bytes.push(accumulator & 255);
  return Uint8Array.from(bytes);
}

export function makeGifFixture(options = {}) {
  const { width = 2, height = 1, palette = DEFAULT_PALETTE, backgroundIndex = 0,
    version = 'GIF89a', loopCount, frames = [{ pixels: [1, 2] }], extension = [] } = options;
  const bytes = [...Buffer.from(version)];
  const word = (value) => bytes.push(value & 255, (value >>> 8) & 255);
  const tableBits = (colors) => Math.max(1, Math.ceil(Math.log2(colors.length)));
  const table = (colors) => {
    for (let i = 0; i < 1 << tableBits(colors); i++) bytes.push(...(colors[i] || [0, 0, 0]));
  };
  const blocks = (data) => {
    for (let i = 0; i < data.length; i += 255) {
      const chunk = data.subarray(i, i + 255);
      bytes.push(chunk.length, ...chunk);
    }
    bytes.push(0);
  };
  word(width);
  word(height);
  bytes.push(palette ? 0x80 | (tableBits(palette) - 1) : 0, backgroundIndex, 0);
  if (palette) table(palette);
  if (loopCount !== undefined) {
    bytes.push(0x21, 0xff, 11, ...Buffer.from('NETSCAPE2.0'), 3, 1);
    word(loopCount);
    bytes.push(0);
  }
  bytes.push(...extension);
  for (const frame of frames) {
    const fw = frame.width ?? width;
    const fh = frame.height ?? height;
    if (frame.gce !== false) {
      bytes.push(0x21, 0xf9, 4,
        ((frame.disposal || 0) << 2) | (frame.transparentIndex >= 0 ? 1 : 0));
      word((frame.delay || 0) / 10);
      bytes.push(frame.transparentIndex >= 0 ? frame.transparentIndex : 0, 0);
    }
    bytes.push(0x2c);
    word(frame.left || 0);
    word(frame.top || 0);
    word(fw);
    word(fh);
    bytes.push((frame.palette ? 0x80 | (tableBits(frame.palette) - 1) : 0) |
      (frame.interlace ? 0x40 : 0));
    if (frame.palette) table(frame.palette);
    const minimum = frame.minimum ?? 2;
    bytes.push(minimum);
    const clear = 1 << minimum;
    const data = frame.compressed || packGifCodes(frame.codes ||
      [clear, ...(frame.pixels || []).flatMap((pixel) => [pixel, clear]), clear + 1], minimum);
    blocks(data);
  }
  bytes.push(0x3b);
  return Uint8Array.from(bytes);
}

export function makeGoldenGifFixture() {
  return makeGifFixture({ width: 3, height: 2, loopCount: 2, frames: [
    { pixels: [1, 1, 1, 1, 1, 1], delay: 0, transparentIndex: 0, disposal: 1 },
    { left: 1, width: 1, height: 1, pixels: [2], delay: 30, disposal: 3 },
    { top: 1, width: 1, height: 1, pixels: [3], delay: 70, transparentIndex: 0, disposal: 2 },
    { left: 2, top: 1, width: 1, height: 1, pixels: [2], delay: 20 }
  ] });
}

function core() {
  const html = fs.readFileSync(new URL('../tools/media/gif-splitter.html', import.meta.url), 'utf8');
  const source = html.match(/\/\/ GIF core start([\s\S]*?)\/\/ GIF core end/)?.[1];
  assert.ok(source, 'The shipped HTML must contain its standalone GIF core markers');
  const context = vm.createContext({ Uint8Array, Uint8ClampedArray, ArrayBuffer, DataView,
    TextEncoder, Blob, setTimeout });
  vm.runInContext(source, context);
  return vm.runInContext('({ decodeGif: typeof decodeGif === "function" ? decodeGif : undefined, '
    + 'compositeGifFrames: typeof compositeGifFrames === "function" ? compositeGifFrames : undefined, '
    + 'createFramesZip: typeof createFramesZip === "function" ? createFramesZip : undefined, '
    + 'limits: typeof GIF_LIMITS === "object" ? GIF_LIMITS : undefined })', context);
}

const rgba = (pixels, palette = DEFAULT_PALETTE) => pixels.flatMap((index) =>
  index === -1 ? [0, 0, 0, 0] : [...palette[index], 255]);

function registerTests() {
  test('the standalone GIF core exposes local decoding, composition, ZIP and fixed limits', () => {
    const api = core();
    assert.equal(typeof api.decodeGif, 'function');
    assert.equal(typeof api.compositeGifFrames, 'function');
    assert.equal(typeof api.createFramesZip, 'function');
    assert.deepEqual(JSON.parse(JSON.stringify(api.limits)), { maxFileBytes: 52428800,
      maxPixels: 16777216, maxFrames: 1000, maxTotalPixels: 83886080 });
  });

  test('GIF87a/89a decode palette, local rectangles, loop count and raw zero delays', () => {
    for (const version of ['GIF87a', 'GIF89a']) {
      const gif = core().decodeGif(makeGifFixture({ version, loopCount: 0, backgroundIndex: 3,
        frames: [{ left: 1, width: 1, pixels: [2], delay: 0, disposal: 1 }] }));
      assert.equal(gif.width, 2);
      assert.equal(gif.height, 1);
      assert.equal(gif.backgroundIndex, 3);
      assert.deepEqual(Array.from(gif.palette), DEFAULT_PALETTE.flat());
      assert.equal(gif.loopCount, 0);
      assert.equal(gif.frames[0].left, 1);
      assert.equal(gif.frames[0].delay, 0);
      assert.equal(gif.frames[0].disposal, 1);
      assert.equal(gif.frames[0].transparentIndex, -1);
      assert.deepEqual(Array.from(gif.frames[0].pixels), [2]);
    }
  });

  test('local color tables work without a global table', () => {
    const palette = [[255, 255, 255], [17, 34, 51]];
    const gif = core().decodeGif(makeGifFixture({ palette: null, width: 1,
      frames: [{ pixels: [1], palette }] }));
    assert.deepEqual(Array.from(gif.frames[0].palette), palette.flat());
    assert.deepEqual(Array.from([...core().compositeGifFrames(gif)][0].rgba), rgba([1], palette));
  });

  test('interlaced rows are restored in all four passes', () => {
    const rows = [0, 4, 2, 6, 1, 3, 5, 7];
    const gif = core().decodeGif(makeGifFixture({ width: 1, height: 8,
      frames: [{ interlace: true, pixels: rows.map((row) => row % 4) }] }));
    assert.deepEqual(Array.from(gif.frames[0].pixels), [0, 1, 2, 3, 0, 1, 2, 3]);
  });

  test('LZW supports dictionary references, the next-code special case and clear reset', () => {
    const gif = core().decodeGif(makeGifFixture({ width: 7,
      frames: [{ codes: [4, 0, 6, 7, 4, 2, 5] }] }));
    assert.deepEqual(Array.from(gif.frames[0].pixels), [0, 0, 0, 0, 0, 0, 2]);
  });

  test('LZW code widths grow through 12 bits and a full dictionary remains usable', () => {
    const pixels = Array.from({ length: 12000 }, (_, i) => (i * 3 + Math.floor(i / 7)) % 4);
    const gif = core().decodeGif(makeGifFixture({ width: pixels.length,
      frames: [{ codes: [4, ...pixels, 5] }] }));
    assert.deepEqual(Array.from(gif.frames[0].pixels), pixels);
  });

  test('LZW minimum code size 8 and high palette indexes decode', () => {
    const palette = Array.from({ length: 256 }, (_, i) => [i, 255 - i, i]);
    const gif = core().decodeGif(makeGifFixture({ width: 2, palette,
      frames: [{ minimum: 8, codes: [256, 255, 128, 257] }] }));
    assert.deepEqual(Array.from(gif.frames[0].pixels), [255, 128]);
  });

  test('comments and unknown extension sub-blocks are safely skipped', () => {
    const gif = core().decodeGif(makeGifFixture({ extension: [0x21, 0xfe, 3, 9, 0, 8, 0,
      0x21, 0xce, 2, 1, 2, 0] }));
    assert.equal(gif.frames.length, 1);
    assert.equal(gif.loopCount, null);
  });

  test('GCE settings apply to one image and reset after a plain text rendering block', () => {
    const extension = [0x21, 0xf9, 4, 9, 12, 0, 0, 0,
      0x21, 1, 12, ...new Array(12).fill(0), 0];
    const gif = core().decodeGif(makeGifFixture({ extension,
      frames: [{ gce: false, pixels: [1, 2] }, { gce: false, pixels: [3, 1] }] }));
    for (const frame of gif.frames) {
      assert.equal(frame.delay, 0);
      assert.equal(frame.transparentIndex, -1);
      assert.equal(frame.disposal, 0);
    }
  });

  test('transparent initial canvas and patches preserve earlier pixels', () => {
    const api = core();
    const gif = api.decodeGif(makeGifFixture({ width: 3, frames: [
      { width: 2, pixels: [1, 0], transparentIndex: 0, disposal: 1 },
      { left: 1, width: 2, pixels: [0, 2], transparentIndex: 0 }
    ] }));
    const frames = [...api.compositeGifFrames(gif)];
    assert.deepEqual(Array.from(frames[0].rgba), rgba([1, -1, -1]));
    assert.deepEqual(Array.from(frames[1].rgba), rgba([1, -1, 2]));
    assert.notEqual(frames[0].rgba, frames[1].rgba, 'yielded frames must own their buffers');
    assert.equal(frames[1].index, 1);
    assert.equal(frames[1].width, 3);
  });

  test('logical background metadata is retained while browser exports start and restore transparent', () => {
    const api = core();
    const gif = api.decodeGif(makeGifFixture({ width: 3, backgroundIndex: 3, frames: [
      { width: 1, pixels: [1], disposal: 2 },
      { left: 1, width: 1, pixels: [2] }
    ] }));
    const frames = [...api.compositeGifFrames(gif)];
    assert.equal(gif.backgroundIndex, 3);
    assert.deepEqual(Array.from(gif.backgroundColor), [0, 0, 255]);
    assert.deepEqual(Array.from(frames[0].rgba), rgba([1, -1, -1]));
    assert.deepEqual(Array.from(frames[1].rgba), rgba([-1, 2, -1]));
  });

  test('disposal 2 clears only its previous transparent frame rectangle', () => {
    const api = core();
    const gif = api.decodeGif(makeGifFixture({ width: 3, frames: [
      { pixels: [1, 1, 1], transparentIndex: 0, disposal: 1 },
      { left: 1, width: 1, pixels: [2], transparentIndex: 0, disposal: 2 },
      { left: 2, width: 1, pixels: [3] }
    ] }));
    const frames = [...api.compositeGifFrames(gif)];
    assert.deepEqual(Array.from(frames[1].rgba), rgba([1, 2, 1]));
    assert.deepEqual(Array.from(frames[2].rgba), rgba([1, -1, 3]));
  });

  test('disposal 3 restores the complete canvas captured before the previous image', () => {
    const api = core();
    const frames = [...api.compositeGifFrames(api.decodeGif(makeGoldenGifFixture()))];
    assert.deepEqual(Array.from(frames[1].rgba), rgba([1, 2, 1, 1, 1, 1]));
    assert.deepEqual(Array.from(frames[2].rgba), rgba([1, 1, 1, 3, 1, 1]));
    assert.deepEqual(Array.from(frames[3].rgba), rgba([1, 1, 1, -1, 1, 2]));
    assert.deepEqual(frames.map((frame) => frame.delay), [0, 30, 70, 20]);
  });

  test('malformed headers, missing trailers, truncated blocks and empty GIFs have readable errors', () => {
    const api = core();
    const valid = makeGifFixture();
    const fixtures = [new Uint8Array(), Uint8Array.from([71, 73, 70]),
      Uint8Array.from([1, 2, 3, ...valid.subarray(3)]), valid.subarray(0, valid.length - 1),
      valid.subarray(0, 20), makeGifFixture({ frames: [] })];
    for (const fixture of fixtures) assert.throws(() => api.decodeGif(fixture), /GIF|文件|数据|帧/);
    assert.throws(() => api.decodeGif(new ArrayBuffer(20)), /数据|字节|Uint8Array/);
  });

  test('invalid dimensions, image bounds, missing tables and bad palette indexes are rejected', () => {
    const api = core();
    for (const fixture of [makeGifFixture({ width: 0 }),
      makeGifFixture({ width: 2, frames: [{ left: 1, width: 2, pixels: [1, 2] }] }),
      makeGifFixture({ frames: [{ width: 0, pixels: [] }] }),
      makeGifFixture({ palette: null }),
      makeGifFixture({ palette: [[0, 0, 0], [255, 255, 255]], frames: [{ pixels: [2, 1] }] }),
      makeGifFixture({ frames: [{ transparentIndex: 7, pixels: [1, 2] }] })]) {
      assert.throws(() => api.decodeGif(fixture), /尺寸|范围|色|帧|像素/);
    }
  });

  test('corrupt LZW detects missing clear/end, illegal codes, wrong output length and invalid size', () => {
    const api = core();
    for (const frame of [{ codes: [1, 2, 5] }, { codes: [4, 1, 7, 5] },
      { codes: [4, 1, 5] }, { codes: [4, 1, 2, 3, 5] },
      { codes: [4, 1, 2] }, { minimum: 1, compressed: Uint8Array.of(0) },
      { minimum: 9, compressed: Uint8Array.of(0) }]) {
      assert.throws(() => api.decodeGif(makeGifFixture({ frames: [frame] })), /LZW|数据|像素|压缩/);
    }
  });

  test('file, canvas, frame-count and full logical-frame budget limits are enforced before expansion', () => {
    const api = core();
    assert.throws(() => api.decodeGif(new Uint8Array(50 * 1024 * 1024 + 1)), /50|文件|大小/);
    assert.throws(() => api.decodeGif(makeGifFixture({ width: 65535, height: 65535 })), /尺寸|像素|画布/);
    assert.throws(() => api.decodeGif(makeGifFixture({ width: 1,
      frames: Array.from({ length: 1001 }, () => ({ pixels: [1] })) })), /帧|1000/);
    assert.throws(() => api.decodeGif(makeGifFixture({ width: 4096, height: 4096,
      frames: Array.from({ length: 6 }, () => ({ width: 1, height: 1, pixels: [1] })) })), /像素|内存|总|预算/);
  });

  test('ZIP store writes UTF-8 names, payload CRCs, central directory and EOCD offsets', async () => {
    const entries = [{ name: '帧_001.png', bytes: Uint8Array.from([1, 2, 3, 4]) },
      { name: 'frame_002.png', bytes: new TextEncoder().encode('123456789') }];
    const blob = await core().createFramesZip(entries);
    assert.equal(blob.type, 'application/zip');
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const view = new DataView(bytes.buffer);
    const decoder = new TextDecoder();
    const offsets = [];
    let offset = 0;
    for (let i = 0; i < entries.length; i++) {
      offsets.push(offset);
      assert.equal(view.getUint32(offset, true), 0x04034b50);
      assert.equal(view.getUint16(offset + 6, true), 0x0800);
      assert.equal(view.getUint16(offset + 8, true), 0);
      assert.equal(view.getUint32(offset + 14, true), [0xb63cfbcd, 0xcbf43926][i]);
      assert.equal(view.getUint32(offset + 18, true), entries[i].bytes.length);
      assert.equal(view.getUint32(offset + 22, true), entries[i].bytes.length);
      const length = view.getUint16(offset + 26, true);
      assert.equal(decoder.decode(bytes.subarray(offset + 30, offset + 30 + length)), entries[i].name);
      assert.deepEqual(bytes.subarray(offset + 30 + length, offset + 30 + length + entries[i].bytes.length),
        entries[i].bytes);
      offset += 30 + length + entries[i].bytes.length;
    }
    const centralOffset = offset;
    for (let i = 0; i < entries.length; i++) {
      assert.equal(view.getUint32(offset, true), 0x02014b50);
      assert.equal(view.getUint16(offset + 8, true), 0x0800);
      assert.equal(view.getUint32(offset + 42, true), offsets[i]);
      const length = view.getUint16(offset + 28, true);
      assert.equal(decoder.decode(bytes.subarray(offset + 46, offset + 46 + length)), entries[i].name);
      offset += 46 + length;
    }
    assert.equal(view.getUint32(offset, true), 0x06054b50);
    assert.equal(view.getUint16(offset + 8, true), 2);
    assert.equal(view.getUint16(offset + 10, true), 2);
    assert.equal(view.getUint32(offset + 12, true), offset - centralOffset);
    assert.equal(view.getUint32(offset + 16, true), centralOffset);
    assert.equal(bytes.length, offset + 22);
  });

  test('empty ZIP is valid and invalid ZIP entries fail with readable errors', async () => {
    const api = core();
    const bytes = new Uint8Array(await (await api.createFramesZip([])).arrayBuffer());
    assert.equal(bytes.length, 22);
    assert.equal(new DataView(bytes.buffer).getUint32(0, true), 0x06054b50);
    for (const entries of [[{ name: '', bytes: Uint8Array.of(1) }],
      [{ name: '../bad.png', bytes: Uint8Array.of(1) }],
      [{ name: 'x.png', bytes: [1] }],
      [{ name: 'x'.repeat(65536), bytes: Uint8Array.of(1) }]]) {
      await assert.rejects(api.createFramesZip(entries), /文件|名称|ZIP|字节/);
    }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) registerTests();
