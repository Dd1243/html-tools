const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const ROOT = path.resolve(__dirname, '../..');
const TARGET = 'tools/generator/business-card.html';
const SCREENSHOTS = path.join(ROOT, 'output/playwright');
const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const SIZES = { cn: [90, 54], iso: [85, 55], us: [89, 51] };
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function browserExecutable() {
  return [process.env.PUPPETEER_EXECUTABLE_PATH, puppeteer.executablePath(),
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']
    .find((candidate) => candidate && fs.existsSync(candidate));
}

function startServer() {
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css',
    '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json' };
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = path.resolve(ROOT, '.' + pathname);
    if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404); response.end(); return;
    }
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(response);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function setInputs(page, values) {
  await page.evaluate((inputs) => {
    for (const [id, value] of Object.entries(inputs)) {
      const input = document.getElementById(id);
      if (input.type === 'checkbox') input.checked = Boolean(value);
      else input.value = String(value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, values);
}

async function waitForPreview(page) {
  await page.evaluate(() => new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.waitForFunction(() => ['previewFront', 'previewBack'].every((id) => {
    const image = document.getElementById(id);
    return image && image.complete && image.naturalWidth > 0;
  }), { timeout: 15000 });
}

async function previewSvg(page, side = 'front') {
  await waitForPreview(page);
  return page.evaluate(async (id) => (await fetch(document.getElementById(id).src)).text(),
    side === 'front' ? 'previewFront' : 'previewBack');
}

async function assertSvg(page, source, expectedText) {
  const parsed = await page.evaluate((xml) => {
    const document = new DOMParser().parseFromString(xml, 'image/svg+xml');
    const root = document.documentElement;
    return { tag: root.localName, errors: document.querySelectorAll('parsererror').length,
      scripts: document.querySelectorAll('script,foreignObject').length, text: root.textContent,
      width: root.getAttribute('width'), height: root.getAttribute('height'),
      images: [...document.querySelectorAll('image')].map((image) => image.getAttribute('href') ||
        image.getAttributeNS('http://www.w3.org/1999/xlink', 'href')) };
  }, source);
  assert.equal(parsed.tag, 'svg');
  assert.equal(parsed.errors, 0, 'SVG parses independently without XML errors');
  assert.equal(parsed.scripts, 0);
  if (expectedText) assert.ok(parsed.text.includes(expectedText), 'SVG retains escaped user text');
  assert.ok(parsed.images.every((href) => /^data:image\/(?:png|jpeg|webp);base64,/i.test(href)),
    'logos embedded in SVG are local raster data');
  return parsed;
}

async function download(page, selector, directory) {
  // CDP may overwrite an existing name instead of appending a suffix.
  const current = fs.mkdtempSync(path.join(directory, 'download-'));
  const session = await page.createCDPSession();
  await session.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: current });
  await page.click(selector);
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const name = fs.readdirSync(current).find((item) => !item.endsWith('.crdownload'));
    if (name) return { name, bytes: fs.readFileSync(path.join(current, name)) };
    await pause(50);
  }
  throw new Error('No completed download from ' + selector + ': ' +
    await page.evaluate(() => document.querySelector('#status').textContent));
}

function checkPng(bytes, size, bleed) {
  assert.deepEqual(bytes.subarray(0, 8), PNG_SIGNATURE);
  const expected = SIZES[size].map((mm) => Math.round((mm + (bleed ? 6 : 0)) / 25.4 * 300));
  assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], expected);
  let physical = null;
  for (let offset = 8; offset + 12 <= bytes.length;) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    if (type === 'pHYs') physical = bytes.subarray(offset + 8, offset + 8 + length);
    offset += length + 12;
  }
  assert.ok(physical, 'PNG contains pHYs print-resolution metadata');
  assert.equal(physical.length, 9);
  assert.deepEqual([physical.readUInt32BE(0), physical.readUInt32BE(4), physical[8]], [11811, 11811, 1]);
}

async function assertNoOverflow(page) {
  const dimensions = await page.evaluate(() => ({ viewport: innerWidth,
    document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  assert.ok(dimensions.document <= dimensions.viewport + 1 && dimensions.body <= dimensions.viewport + 1,
    JSON.stringify(dimensions));
}

async function main() {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'webutils-card-browser-'));
  const downloads = path.join(temporary, 'downloads');
  fs.mkdirSync(downloads); fs.mkdirSync(SCREENSHOTS, { recursive: true });
  const logoPath = path.join(temporary, 'logo.png');
  // Valid 1x1 PNG; the browser validates and rasterizes it through the actual upload path.
  fs.writeFileSync(logoPath, Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+afoQAAAAASUVORK5CYII=', 'base64'));
  const invalidPath = path.join(temporary, 'unsupported.txt');
  fs.writeFileSync(invalidPath, 'This is not a logo image.');
  const server = await startServer();
  const origin = 'http://127.0.0.1:' + server.address().port;
  let browser;
  const errors = [];
  let checks = 0;
  function watch(page) {
    page.on('pageerror', (error) => errors.push(error.stack || String(error)));
    page.on('dialog', (dialog) => dialog.accept());
    page.on('console', (message) => {
      if (message.type() === 'error' && !/Failed to load resource|google|adsense|consent/i.test(message.text())) {
        errors.push(message.text());
      }
    });
  }
  async function check(name, operation) { await operation(); checks++; console.log('PASS ' + name); }
  async function enableDownloads(page) {
    const session = await page.createCDPSession();
    await session.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads });
  }
  try {
    browser = await puppeteer.launch({ headless: true, executablePath: browserExecutable(),
      args: ['--no-first-run', '--disable-background-networking'] });
    const page = await browser.newPage(); watch(page);
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const url = request.url();
      if (/^https?:/.test(url) && !url.startsWith(origin)) request.abort();
      else request.continue();
    });
    await page.setViewport({ width: 1440, height: 1000 });
    await page.goto(origin + '/' + TARGET, { waitUntil: 'networkidle0' });
    await enableDownloads(page);

    await check('initial card previews render without runtime errors', async () => {
      await waitForPreview(page);
      assert.equal(await page.evaluate(() => typeof window.BusinessCardCore.buildSvg), 'function');
      await assertSvg(page, await previewSvg(page));
      await assertSvg(page, await previewSvg(page, 'back'));
    });

    await check('a damaged saved logo is dropped while the saved name and export remain usable', async () => {
      for (const logo of ['data:image/png;base64,A', 'data:image/png;base64,AAAA']) {
      await page.evaluate((damagedLogo) => localStorage.setItem('webutils-business-card-draft-v1',
        JSON.stringify({ name: '损坏Logo草稿', logo: damagedLogo })), logo);
      await page.reload({ waitUntil: 'networkidle0' });
      let rendered = false;
      try {
        await page.waitForFunction(() => ['previewFront', 'previewBack'].every((id) => {
          const image = document.getElementById(id);
          return image?.complete && image.naturalWidth > 0;
        }), { timeout: 2500 });
        rendered = true;
      } catch { /* Capture the broken initialization as a precise assertion below. */ }
      const snapshot = await page.evaluate(() => ({ name: document.querySelector('#name').value,
        status: document.querySelector('#status').textContent,
        frontWidth: document.querySelector('#previewFront').naturalWidth,
        backWidth: document.querySelector('#previewBack').naturalWidth }));
      assert.ok(rendered, 'Damaged logo draft must preserve preview initialization: ' + JSON.stringify(snapshot));
      assert.equal(snapshot.name, '损坏Logo草稿');
      await page.waitForFunction(async () => !/<image\b/.test(
        await (await fetch(document.querySelector('#previewFront').src)).text()));
      const preview = await previewSvg(page);
      assert.doesNotMatch(preview, /<image\b/);
      await setInputs(page, { format: 'svg' });
      const exported = await download(page, '#downloadCard', downloads);
      await assertSvg(page, exported.bytes.toString('utf8'), '损坏Logo草稿');
      }
      await page.evaluate(() => localStorage.removeItem('webutils-business-card-draft-v1'));
      await page.reload({ waitUntil: 'networkidle0' });
      await waitForPreview(page);
    });
    if (process.env.BUSINESS_CARD_DRAFT_ONLY === '1') return;

    await check('real text edits, colors, type controls and templates update independent SVG previews', async () => {
      await page.click('#name', { clickCount: 3 });
      await page.keyboard.type('LIN DESIGN');
      await setInputs(page, { title: '创意 & <研究>', company: '示例 & <研发>', ink: '#183c38',
        paper: '#ffffff', accent: '#356e62', font: 'serif', nameSize: 36 });
      await assertSvg(page, await previewSvg(page), 'LIN DESIGN');
      const before = await previewSvg(page);
      await page.click('[data-template="sidebar"]');
      assert.notEqual(await previewSvg(page), before);
      await page.click('[data-template="centered"]');
      await assertSvg(page, await previewSvg(page), 'LIN DESIGN');
      await page.click('[data-template="classic"]');
    });

    await check('PNG downloads have each selected physical size, optional bleed and genuine 300dpi metadata', async () => {
      await setInputs(page, { format: 'png', side: 'front', bleed: false, guides: false });
      for (const size of ['cn', 'iso', 'us']) {
        await setInputs(page, { size });
        const image = await download(page, '#downloadCard', downloads);
        assert.match(image.name, /\.png$/i);
        checkPng(image.bytes, size, false);
      }
      await setInputs(page, { size: 'cn', bleed: true, side: 'back' });
      checkPng((await download(page, '#downloadCard', downloads)).bytes, 'cn', true);
    });

    await check('SVG exports are standalone XML and vCards escape contact punctuation', async () => {
      await setInputs(page, { format: 'svg', side: 'front', bleed: false, name: '林,南;设计\\工作',
        company: '示例,科技;研发\\组', email: 'qa@example.com', address: '上海,静安;一号\\二层' });
      const svg = await download(page, '#downloadCard', downloads);
      assert.match(svg.name, /\.svg$/i);
      await assertSvg(page, svg.bytes.toString('utf8'), '林,南;设计\\工作');
      const contact = await download(page, '#downloadVcard', downloads);
      assert.match(contact.name, /\.vcf$/i);
      const vcard = contact.bytes.toString('utf8').replace(/\r?\n[ \t]/g, '');
      assert.match(vcard, /^BEGIN:VCARD\r?\n/);
      assert.match(vcard, /VERSION:3\.0/);
      assert.ok(vcard.includes('FN:林\\,南\\;设计\\\\工作'));
      assert.ok(vcard.includes('ORG:示例\\,科技\\;研发\\\\组'));
      assert.ok(vcard.includes('EMAIL') && vcard.includes('qa@example.com'));
      assert.match(vcard, /END:VCARD\r?\n?$/);
    });

    await check('logo uploads embed raster pixels, remove cleanly and recover after invalid files', async () => {
      const input = await page.$('#logoUpload');
      await input.uploadFile(logoPath);
      await page.waitForFunction(async () => {
        const source = await (await fetch(document.querySelector('#previewFront').src)).text();
        return /<image\b/.test(source);
      });
      await assertSvg(page, await previewSvg(page));
      await page.click('#removeLogo');
      assert.doesNotMatch(await previewSvg(page), /<image\b/);
      await input.uploadFile(invalidPath);
      await pause(100);
      assert.doesNotMatch(await previewSvg(page), /<image\b/);
      assert.match(await page.evaluate(() => document.querySelector('#status').textContent), /PNG|JPEG|JPG|WebP|图片|格式|支持/i);
      await input.uploadFile(logoPath);
      await page.waitForFunction(async () => /<image\b/.test(
        await (await fetch(document.querySelector('#previewFront').src)).text()));
      await page.click('#removeLogo');
    });

    await check('explicit draft save restores edits after reload and clearing removes saved contact data', async () => {
      await setInputs(page, { name: '草稿核验', company: '本地保存示例', size: 'iso', accent: '#755a48' });
      await page.click('#saveDraft');
      const saved = await page.evaluate(() => Object.entries(localStorage));
      assert.ok(saved.some(([, value]) => value.includes('草稿核验')));
      await page.reload({ waitUntil: 'networkidle0' });
      await waitForPreview(page);
      assert.equal(await page.evaluate(() => document.querySelector('#name').value), '草稿核验');
      assert.equal(await page.evaluate(() => document.querySelector('#size').value), 'iso');
      await page.click('#clearDraft');
      assert.ok(!(await page.evaluate(() => Object.values(localStorage))).some((value) => value.includes('草稿核验')));
      await page.click('#resetCard');
      await waitForPreview(page);
      assert.equal(await page.evaluate(() => document.querySelector('#name').value),
        await page.evaluate(() => BusinessCardCore.defaults.name));
    });

    await check('long names obey the input limit and both themes fit a 375px viewport', async () => {
      const maximum = await page.evaluate(() => document.querySelector('#name').maxLength);
      assert.ok(maximum > 0 && maximum <= 100, 'name has a bounded input length');
      await page.click('#name', { clickCount: 3 });
      await page.keyboard.type('长'.repeat(maximum + 5));
      assert.equal(await page.evaluate(() => document.querySelector('#name').value.length), maximum);
      await assertSvg(page, await previewSvg(page));
      const titleMaximum = await page.evaluate(() => document.querySelector('#title').maxLength);
      assert.ok(titleMaximum > 0 && titleMaximum <= 200, 'English title has a bounded input length');
      await page.click('#title', { clickCount: 3 });
      await page.keyboard.type('CREATIVE DIRECTOR '.repeat(Math.ceil(titleMaximum / 17) + 1));
      assert.equal(await page.evaluate(() => document.querySelector('#title').value.length), titleMaximum);
      await assertSvg(page, await previewSvg(page));
      await page.click('#resetCard'); await waitForPreview(page);
      await assertNoOverflow(page);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'business-card-desktop-light.png'), fullPage: true });
      await page.screenshot({ path: path.join(SCREENSHOTS, 'business-card-desktop-viewport.png') });
      await page.click('#themeToggle');
      await assertNoOverflow(page);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'business-card-desktop-dark.png'), fullPage: true });
      await page.setViewport({ width: 375, height: 812 });
      await assertNoOverflow(page);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'business-card-mobile-dark.png'), fullPage: true });
      await page.click('#themeToggle'); await assertNoOverflow(page);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'business-card-mobile-light.png'), fullPage: true });
      await page.screenshot({ path: path.join(SCREENSHOTS, 'business-card-mobile-viewport.png') });
      await page.evaluate(() => document.querySelector('#previewFront').scrollIntoView({ block: 'start' }));
      await page.screenshot({ path: path.join(SCREENSHOTS, 'business-card-mobile-preview.png') });
    });

    await check('offline file URL renders and exports PNG and SVG without external resources', async () => {
      const offline = await browser.newPage(); watch(offline);
      await offline.setOfflineMode(true);
      await offline.goto(pathToFileURL(path.join(ROOT, TARGET)).href, { waitUntil: 'load' });
      await waitForPreview(offline); await enableDownloads(offline);
      await setInputs(offline, { format: 'png', side: 'front', size: 'cn', bleed: false });
      checkPng((await download(offline, '#downloadCard', downloads)).bytes, 'cn', false);
      await setInputs(offline, { format: 'svg' });
      await assertSvg(offline, (await download(offline, '#downloadCard', downloads)).bytes.toString('utf8'));
      await offline.close();
    });
    await check('all business-card flows finish without runtime errors', async () => assert.deepEqual(errors, []));
    console.log('Business card browser QA: ' + checks + ' checks passed');
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
