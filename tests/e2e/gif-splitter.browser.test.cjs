const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const ROOT = path.resolve(__dirname, '../..');
const SCREENSHOTS = path.join(ROOT, 'output/playwright');
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function browserExecutable() {
  const candidates = [process.env.PUPPETEER_EXECUTABLE_PATH, puppeteer.executablePath(),
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'];
  return candidates.find((candidate) => candidate && fs.existsSync(candidate));
}

function startServer() {
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css',
    '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml' };
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/__gif_qa_blank__') {
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end('<!doctype html><title>GIF native decoder verification</title>');
      return;
    }
    const file = path.resolve(ROOT, `.${pathname}`);
    if (!file.startsWith(`${ROOT}${path.sep}`) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404);
      response.end();
      return;
    }
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(response);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

function readStoredZip(bytes) {
  const entries = [];
  let offset = 0;
  while (offset + 30 <= bytes.length && bytes.readUInt32LE(offset) === 0x04034b50) {
    assert.equal(bytes.readUInt16LE(offset + 8), 0, 'ZIP uses the offline store method');
    const size = bytes.readUInt32LE(offset + 18);
    const nameLength = bytes.readUInt16LE(offset + 26);
    const extraLength = bytes.readUInt16LE(offset + 28);
    const start = offset + 30 + nameLength + extraLength;
    entries.push({ name: bytes.toString('utf8', offset + 30, offset + 30 + nameLength),
      bytes: bytes.subarray(start, start + size) });
    offset = start + size;
  }
  assert.equal(bytes.readUInt32LE(offset), 0x02014b50, 'ZIP has a central directory');
  assert.equal(bytes.readUInt32LE(bytes.length - 22), 0x06054b50, 'ZIP has an end record');
  assert.equal(bytes.readUInt16LE(bytes.length - 12), entries.length);
  return entries;
}

async function visible(page, selector) {
  return page.evaluate((target) => Boolean(document.querySelector(target)?.getClientRects().length), selector);
}

async function waitForResult(page, expectedFrames) {
  await page.waitForFunction((expected) => {
    const result = document.querySelector('#resultSection');
    const preview = document.querySelector('#framePreview');
    return result?.getClientRects().length && preview?.complete && preview.naturalWidth > 0 &&
      (expected === undefined || Number(document.querySelector('#frameCount').textContent) === expected);
  }, { timeout: 20000 }, expectedFrames);
}

async function setInputs(page, values) {
  await page.evaluate((inputs) => {
    for (const [id, value] of Object.entries(inputs)) {
      const input = document.getElementById(id);
      input.value = String(value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, values);
}

async function currentFrame(page) {
  return page.evaluate(() => Number(document.querySelector('#frameSlider').value));
}

async function selectedFrames(page) {
  return page.evaluate(() => [...document.querySelectorAll('.frame-select:checked')]
    .map((checkbox) => Number(checkbox.dataset.index)).sort((a, b) => a - b));
}

async function download(page, selector, directory) {
  const previous = new Set(fs.readdirSync(directory));
  await page.click(selector);
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const found = fs.readdirSync(directory).find((name) => !previous.has(name) && !name.endsWith('.crdownload'));
    if (found) return { name: found, bytes: fs.readFileSync(path.join(directory, found)) };
    await pause(50);
  }
  throw new Error(`No completed download after ${selector}`);
}

async function assertNoOverflow(page) {
  const dimensions = await page.evaluate(() => ({ viewport: innerWidth,
    document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  assert.ok(dimensions.document <= dimensions.viewport + 1 && dimensions.body <= dimensions.viewport + 1,
    `No horizontal overflow: ${JSON.stringify(dimensions)}`);
}

async function checkNativeDecoder(page, fixtures) {
  const results = await page.evaluate(async (sources) => {
    if (typeof ImageDecoder !== 'function') throw new Error('Installed browser does not provide ImageDecoder');
    const output = [];
    for (const source of sources) {
      const decoder = new ImageDecoder({ data: new Uint8Array(source), type: 'image/gif' });
      await decoder.tracks.ready;
      const frames = [];
      for (let frameIndex = 0; frameIndex < decoder.tracks.selectedTrack.frameCount; frameIndex++) {
        const { image } = await decoder.decode({ frameIndex });
        const canvas = new OffscreenCanvas(image.displayWidth, image.displayHeight);
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        frames.push([...context.getImageData(0, 0, canvas.width, canvas.height).data]);
        image.close();
      }
      decoder.close();
      output.push(frames);
    }
    return output;
  }, fixtures.map((fixture) => Array.from(fixture.bytes)));
  fixtures.forEach((fixture, index) => assert.deepEqual(results[index], fixture.expected, fixture.label));
}

async function main() {
  const { makeGifFixture, makeGoldenGifFixture } = await import(pathToFileURL(
    path.join(ROOT, 'tests/gif-splitter-core.test.js')).href);
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'webutils-gif-browser-'));
  const downloadDirectory = path.join(temporary, 'downloads');
  fs.mkdirSync(downloadDirectory);
  fs.mkdirSync(SCREENSHOTS, { recursive: true });
  const golden = makeGoldenGifFixture();
  const fixtureFile = path.join(temporary, 'golden.gif');
  fs.writeFileSync(fixtureFile, golden);
  const manyFrames = makeGifFixture({ width: 8, height: 8,
    frames: Array.from({ length: 73 }, (_, index) => ({ width: 1, height: 1,
      left: index % 8, top: Math.floor(index / 8) % 8, pixels: [1 + index % 3], delay: 40 })) });
  const cancellationFrames = makeGifFixture({ width: 120, height: 80,
    frames: Array.from({ length: 600 }, (_, index) => ({ width: 1, height: 1,
      left: index % 120, top: Math.floor(index / 120), pixels: [1 + index % 3], delay: 40 })) });
  const server = await startServer();
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser;
  const pageErrors = [];
  let checks = 0;
  async function check(name, operation) {
    await operation();
    checks++;
    console.log(`PASS ${name}`);
  }
  function watch(page) {
    page.on('pageerror', (error) => pageErrors.push(error.stack || String(error)));
    page.on('console', (message) => {
      if (message.type() === 'error' && !message.text().includes('Failed to load resource')) {
        pageErrors.push(message.text());
      }
    });
  }
  try {
    browser = await puppeteer.launch({ headless: true, executablePath: browserExecutable(),
      args: ['--no-first-run', '--disable-background-networking'] });
    const page = await browser.newPage();
    watch(page);
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (/^https?:/.test(request.url()) && !request.url().startsWith(origin + '/')) request.abort();
      else request.continue();
    });
    await page.evaluateOnNewDocument(() => {
      const active = new Set();
      const create = URL.createObjectURL.bind(URL);
      const revoke = URL.revokeObjectURL.bind(URL);
      URL.createObjectURL = (blob) => {
        const url = create(blob);
        active.add(url);
        return url;
      };
      URL.revokeObjectURL = (url) => { active.delete(url); revoke(url); };
      window.__gifActiveBlobUrls = active;
    });
    await page.setViewport({ width: 1440, height: 1000 });
    await page.goto(`${origin}/__gif_qa_blank__`);
    const palette = [[0, 0, 0, 255], [255, 0, 0, 255], [0, 255, 0, 255], [0, 0, 255, 255]];
    const colors = (indexes) => indexes.flatMap((index) => index < 0 ? [0, 0, 0, 0] : palette[index]);
    const growingPixels = Array.from({ length: 12000 }, (_, index) => (index * 3 + Math.floor(index / 7)) % 4);
    await check('fixtures independently match the browser GIF decoder, including disposal and LZW growth', () =>
      checkNativeDecoder(page, [
        { label: 'golden disposal', bytes: golden, expected: [[1, 1, 1, 1, 1, 1], [1, 2, 1, 1, 1, 1],
          [1, 1, 1, 3, 1, 1], [1, 1, 1, -1, 1, 2]].map(colors) },
        { label: 'opaque background', bytes: makeGifFixture({ width: 3, backgroundIndex: 3, frames: [
          { width: 1, pixels: [1], disposal: 2 }, { left: 1, width: 1, pixels: [2] }
        // Chromium renders uncovered logical-background pixels as transparent.
        ] }), expected: [[1, -1, -1], [-1, 2, -1]].map(colors) },
        { label: 'growing LZW dictionary', bytes: makeGifFixture({ width: growingPixels.length,
          frames: [{ codes: [4, ...growingPixels, 5] }] }), expected: [colors(growingPixels)] }
      ]));
    if (process.env.GIF_NATIVE_ONLY === '1') return;
    await page.goto(`${origin}/tools/media/gif-splitter.html`, { waitUntil: 'networkidle0' });
    const session = await page.createCDPSession();
    await session.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: downloadDirectory });

    await check('empty state and keyboard upload parse a real GIF', async () => {
      assert.equal(await visible(page, '#resultSection'), false);
      assert.equal(await visible(page, '#dropZone'), true);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'gif-splitter-empty.png'), fullPage: true });
      await page.focus('#dropZone');
      const chooserPromise = page.waitForFileChooser();
      await page.keyboard.press('Enter');
      const chooser = await chooserPromise;
      await chooser.accept([fixtureFile]);
      await waitForResult(page, 4);
      assert.match(await page.evaluate(() => document.querySelector('#gifSize').textContent), /3\s*[×x]\s*2/);
      assert.match(await page.evaluate(() => document.querySelector('#fileName').textContent), /golden\.gif/);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'gif-splitter-desktop-light.png'), fullPage: true });
    });

    await check('PNG previews preserve real frame pixels, raw zero delay and disposal', async () => {
      const expected = [[1, 1, 1, 1, 1, 1], [1, 2, 1, 1, 1, 1],
        [1, 1, 1, 3, 1, 1], [1, 1, 1, -1, 1, 2]].map(colors);
      for (let index = 0; index < 4; index++) {
        await setInputs(page, { frameSlider: index });
        await page.waitForFunction(() => document.querySelector('#framePreview').complete);
        const actual = await page.evaluate(() => {
          const image = document.querySelector('#framePreview');
          const canvas = document.createElement('canvas');
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          const context = canvas.getContext('2d');
          context.drawImage(image, 0, 0);
          return [...context.getImageData(0, 0, canvas.width, canvas.height).data];
        });
        assert.deepEqual(actual, expected[index]);
        assert.match(await page.evaluate(() => document.querySelector('#frameDelay').textContent),
          new RegExp(`\\b${[0, 30, 70, 20][index]}\\s*ms`));
      }
    });

    await check('opaque GIF patches export the same transparent background as Chromium', async () => {
      const bytes = makeGifFixture({ width: 3, backgroundIndex: 3, frames: [
        { width: 1, pixels: [1], disposal: 2 }, { left: 1, width: 1, pixels: [2] }
      ] });
      await page.evaluate((source) => handleFile(new File([new Uint8Array(source)], 'opaque.gif',
        { type: 'image/gif' })), Array.from(bytes));
      await waitForResult(page, 2);
      for (let index = 0; index < 2; index++) {
        await setInputs(page, { frameSlider: index });
        await page.waitForFunction(() => document.querySelector('#framePreview').complete);
        const actual = await page.evaluate(() => {
          const image = document.querySelector('#framePreview');
          const canvas = document.createElement('canvas');
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          const context = canvas.getContext('2d');
          context.drawImage(image, 0, 0);
          return [...context.getImageData(0, 0, canvas.width, canvas.height).data];
        });
        assert.deepEqual(actual, colors(index === 0 ? [1, -1, -1] : [-1, 2, -1]));
      }
      await page.evaluate((source) => handleFile(new File([new Uint8Array(source)], 'golden.gif',
        { type: 'image/gif' })), Array.from(golden));
      await waitForResult(page, 4);
    });

    await check('previous, next, timeline and playback control the same preview', async () => {
      await setInputs(page, { frameSlider: 1 });
      await page.click('#nextButton');
      assert.equal(await currentFrame(page), 2);
      await page.click('#prevButton');
      assert.equal(await currentFrame(page), 1);
      await page.focus('#frameSlider');
      await page.keyboard.press('Home');
      assert.equal(await currentFrame(page), 0);
      await page.click('#playButton');
      await page.waitForFunction(() => Number(document.querySelector('#frameSlider').value) !== 0);
      await page.click('#playButton');
      const paused = await currentFrame(page);
      await pause(200);
      assert.equal(await currentFrame(page), paused);
    });

    await check('range, step and individual checkboxes export exactly the selected PNGs', async () => {
      await setInputs(page, { rangeStart: 1, rangeEnd: 4, frameStep: 2 });
      await page.click('#applyRangeButton');
      assert.deepEqual(await selectedFrames(page), [0, 2]);
      await page.click('.frame-select[data-index="0"]');
      await page.click('.frame-select[data-index="3"]');
      assert.deepEqual(await selectedFrames(page), [2, 3]);
      assert.match(await page.evaluate(() => document.querySelector('#selectedCount').textContent), /2/);
      const zipped = await download(page, '#downloadZipButton', downloadDirectory);
      assert.match(zipped.name, /\.zip$/i);
      const entries = readStoredZip(zipped.bytes);
      assert.equal(entries.length, 2);
      assert.deepEqual(entries.map((entry) => Number(entry.name.match(/(\d+)\.png$/i)?.[1])), [3, 4]);
      for (const entry of entries) assert.deepEqual(entry.bytes.subarray(0, 8), PNG_SIGNATURE);
      await page.click('#clearSelectionButton');
      assert.deepEqual(await selectedFrames(page), []);
      assert.equal(await page.evaluate(() => document.querySelector('#downloadZipButton').disabled), true);
      await page.click('#selectAllButton');
      assert.equal((await selectedFrames(page)).length, 4);
      const png = await download(page, '#downloadFrameButton', downloadDirectory);
      assert.match(png.name, /\.png$/i);
      assert.deepEqual(png.bytes.subarray(0, 8), PNG_SIGNATURE);
      assert.equal(png.bytes.readUInt32BE(16), 3);
      assert.equal(png.bytes.readUInt32BE(20), 2);
    });

    await check('drag and drop accepts valid GIF bytes with an empty MIME type', async () => {
      await page.evaluate(() => resetTool());
      assert.equal(await visible(page, '#dropZone'), true);
      await page.evaluate((bytes) => {
        const transfer = new DataTransfer();
        transfer.items.add(new File([new Uint8Array(bytes)], 'empty-mime.gif', { type: '' }));
        document.querySelector('#dropZone').dispatchEvent(new DragEvent('drop',
          { bubbles: true, cancelable: true, dataTransfer: transfer }));
      }, Array.from(golden));
      await waitForResult(page, 4);
      assert.match(await page.evaluate(() => document.querySelector('#fileName').textContent), /empty-mime\.gif/);
    });

    await check('bad GIF errors recover when the next valid file is uploaded', async () => {
      await page.evaluate(() => handleFile(new File(['not a gif'], 'broken.gif', { type: 'image/gif' })));
      assert.equal(await visible(page, '#errorMessage'), true);
      assert.match(await page.evaluate(() => document.querySelector('#errorMessage').textContent), /GIF|文件|数据/);
      const input = await page.$('#fileInput');
      await input.uploadFile(fixtureFile);
      await waitForResult(page, 4);
      assert.equal(await visible(page, '#errorMessage'), false);
    });

    await check('cancel and replacing a slow file cannot publish stale results', async () => {
      await page.evaluate((bytes) => {
        const file = new File([new Uint8Array(bytes)], 'cancelled.gif', { type: 'image/gif' });
        const original = file.arrayBuffer.bind(file);
        file.arrayBuffer = () => new Promise((resolve) => { window.__releaseSlowGif = async () => resolve(await original()); });
        window.__slowGifTask = handleFile(file);
      }, Array.from(manyFrames));
      await page.waitForSelector('#cancelButton', { visible: true });
      await page.waitForFunction(() => typeof window.__releaseSlowGif === 'function');
      await page.click('#cancelButton');
      await page.evaluate(async () => { await window.__releaseSlowGif(); await window.__slowGifTask; });
      assert.equal(await visible(page, '#loadingSection'), false);
      assert.equal(await visible(page, '#resultSection'), false);
      await page.evaluate((bytes) => {
        const file = new File([new Uint8Array(bytes)], 'stale.gif', { type: 'image/gif' });
        const original = file.arrayBuffer.bind(file);
        file.arrayBuffer = () => new Promise((resolve) => { window.__releaseSlowGif = async () => resolve(await original()); });
        window.__slowGifTask = handleFile(file);
      }, Array.from(manyFrames));
      await page.evaluate(async (bytes) => {
        await handleFile(new File([new Uint8Array(bytes)], 'fresh.gif', { type: 'image/gif' }));
        await window.__releaseSlowGif();
        await window.__slowGifTask;
      }, Array.from(golden));
      await waitForResult(page, 4);
      assert.match(await page.evaluate(() => document.querySelector('#fileName').textContent), /fresh\.gif/);
      assert.equal(await visible(page, '#errorMessage'), false);
    });

    await check('cancelling during frame conversion leaves the upload state usable', async () => {
      await page.evaluate((bytes) => {
        window.__conversionTask = handleFile(new File([new Uint8Array(bytes)], 'conversion.gif',
          { type: 'image/gif' }));
      }, Array.from(cancellationFrames));
      await page.waitForSelector('#cancelButton', { visible: true });
      await page.click('#cancelButton');
      await page.evaluate(() => window.__conversionTask);
      assert.equal(await visible(page, '#resultSection'), false);
      assert.equal(await visible(page, '#loadingSection'), false);
      assert.equal(await visible(page, '#dropZone'), true);
      await page.evaluate((bytes) => handleFile(new File([new Uint8Array(bytes)], 'after-cancel.gif',
        { type: 'image/gif' })), Array.from(golden));
      await waitForResult(page, 4);
    });

    await check('thumbnail batches keep every frame selectable', async () => {
      await page.evaluate((bytes) => handleFile(new File([new Uint8Array(bytes)], 'many.gif',
        { type: 'image/gif' })), Array.from(manyFrames));
      await waitForResult(page, 73);
      assert.equal(await page.evaluate(() => document.querySelectorAll('.frame-card').length), 60);
      await page.click('#showMoreButton');
      assert.equal(await page.evaluate(() => document.querySelectorAll('.frame-card').length), 73);
      await page.click('.frame-preview[data-index="72"]');
      assert.equal(await currentFrame(page), 72);
    });

    await check('the change-file action opens a real file picker and replaces the result', async () => {
      const chooserPromise = page.waitForFileChooser();
      await page.click('#changeFileButton');
      const chooser = await chooserPromise;
      await chooser.accept([fixtureFile]);
      await waitForResult(page, 4);
      assert.match(await page.evaluate(() => document.querySelector('#fileName').textContent), /golden\.gif/);
      assert.equal(await currentFrame(page), 0);
    });

    await check('local demo, dark theme and 375px viewport remain usable', async () => {
      await page.evaluate(() => resetTool());
      assert.equal(await page.evaluate(() => window.__gifActiveBlobUrls.size), 0,
        'reset revokes every previously generated object URL');
      await page.click('#demoButton');
      await waitForResult(page);
      assert.ok(await page.evaluate(() => Number(document.querySelector('#frameCount').textContent) > 1));
      await assertNoOverflow(page);
      await page.click('#themeToggle');
      await page.screenshot({ path: path.join(SCREENSHOTS, 'gif-splitter-desktop-dark.png'), fullPage: true });
      await page.setViewport({ width: 375, height: 812 });
      await assertNoOverflow(page);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'gif-splitter-mobile-dark.png'), fullPage: true });
      await page.click('#themeToggle');
      await assertNoOverflow(page);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'gif-splitter-mobile-light.png'), fullPage: true });
      await page.screenshot({ path: path.join(SCREENSHOTS, 'gif-splitter-mobile-viewport.png') });
    });

    await check('file URL supports demo and local upload with network offline', async () => {
      const offline = await browser.newPage();
      watch(offline);
      await offline.setOfflineMode(true);
      await offline.goto(pathToFileURL(path.join(ROOT, 'tools/media/gif-splitter.html')).href,
        { waitUntil: 'load' });
      await offline.click('#demoButton');
      await waitForResult(offline);
      const input = await offline.$('#fileInput');
      await input.uploadFile(fixtureFile);
      await waitForResult(offline, 4);
      await offline.close();
    });
    await check('the local canvas fallback works when Worker is unavailable', async () => {
      const fallback = await browser.newPage();
      watch(fallback);
      await fallback.evaluateOnNewDocument(() => { window.Worker = undefined; });
      await fallback.setOfflineMode(true);
      await fallback.goto(pathToFileURL(path.join(ROOT, 'tools/media/gif-splitter.html')).href,
        { waitUntil: 'load' });
      const input = await fallback.$('#fileInput');
      await input.uploadFile(fixtureFile);
      await waitForResult(fallback, 4);
      await setInputs(fallback, { frameSlider: 3 });
      await fallback.waitForFunction(() => document.querySelector('#framePreview').complete);
      const actual = await fallback.evaluate(() => {
        const image = document.querySelector('#framePreview');
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        return [...context.getImageData(0, 0, canvas.width, canvas.height).data];
      });
      assert.deepEqual(actual, colors([1, 1, 1, -1, 1, 2]));
      await fallback.close();
    });
    await check('all flows finish without runtime or page errors', async () => assert.deepEqual(pageErrors, []));
    console.log(`GIF splitter browser QA: ${checks} checks passed`);
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
