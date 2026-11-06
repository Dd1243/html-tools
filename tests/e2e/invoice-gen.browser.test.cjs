const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const ROOT = path.resolve(__dirname, '../..');
const TARGET = 'tools/generator/invoice-gen.html';
const ARTIFACTS = path.join(ROOT, 'output/playwright');
const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

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

async function flush(page) {
  await page.evaluate(() => new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function setInputs(page, values) {
  await page.evaluate((inputs) => {
    for (const [id, value] of Object.entries(inputs)) {
      const input = document.getElementById(id);
      assertInput(input, id);
      input.value = String(value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    function assertInput(input, id) { if (!input) throw new Error('Missing control #' + id); }
  }, values);
  await flush(page);
}

async function setItem(page, index, values) {
  await page.evaluate(({ index, values }) => {
    const row = document.querySelector('.item-editor[data-index="' + index + '"]');
    if (!row) throw new Error('Missing item row ' + index);
    for (const [field, value] of Object.entries(values)) {
      const input = row.querySelector('[data-field="' + field + '"]');
      input.value = String(value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, { index, values });
  await flush(page);
}

async function amount(page, id = 'totalAmount') {
  return page.evaluate((key) => document.getElementById(key).textContent.replace(/[^\d.-]/g, ''), id);
}

async function reset(page) {
  await page.click('#resetInvoice');
  await flush(page);
  await page.waitForFunction(() => document.querySelectorAll('.item-editor').length === 2);
}

async function download(page, selector, directory) {
  const current = fs.mkdtempSync(path.join(directory, 'download-'));
  const session = await page.createCDPSession();
  await session.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: current });
  await page.click(selector);
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const name = fs.readdirSync(current).find((item) => !item.endsWith('.crdownload'));
    if (name) return { name, bytes: fs.readFileSync(path.join(current, name)) };
    await pause(40);
  }
  throw new Error('No completed download from ' + selector + ': ' +
    await page.evaluate(() => document.querySelector('#status').textContent));
}

function parseCsv(source) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  source = source.replace(/^\uFEFF/, '');
  for (let index = 0; index < source.length; index++) {
    const character = source[index];
    if (character === '"') {
      if (quoted && source[index + 1] === '"') { cell += '"'; index++; }
      else quoted = !quoted;
    } else if (character === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((character === '\r' || character === '\n') && !quoted) {
      if (character === '\r' && source[index + 1] === '\n') index++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += character;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

async function assertNoOverflow(page) {
  const dimensions = await page.evaluate(() => ({ viewport: innerWidth,
    document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  assert.ok(dimensions.document <= dimensions.viewport + 1 && dimensions.body <= dimensions.viewport + 1,
    JSON.stringify(dimensions));
}

function inspectPdf(file) {
  const bundled = path.join(os.homedir(),
    '.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe');
  const source = 'import json,sys\nfrom pypdf import PdfReader\nr=PdfReader(sys.argv[1])\n'
    + 'print(json.dumps({"pages":len(r.pages),"sizes":[[float(p.mediabox.width),float(p.mediabox.height)] for p in r.pages],'
    + '"text":"\\n".join(p.extract_text() or "" for p in r.pages)},ensure_ascii=False))';
  const candidates = [...new Set([process.env.INVOICE_QA_PYTHON, 'python',
    fs.existsSync(bundled) && bundled].filter(Boolean))];
  for (const python of candidates) {
    try {
      return JSON.parse(execFileSync(python, ['-c', source, file], { encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, PYTHONIOENCODING: 'utf-8' } }));
    } catch { /* Try the next installed Python before using structural PDF checks. */ }
  }
  const sourcePdf = fs.readFileSync(file).toString('latin1');
  console.warn('SKIP PDF text extraction: no Python with pypdf; set INVOICE_QA_PYTHON to enable it.');
  return { pages: (sourcePdf.match(/\/Type\s*\/Page\b/g) || []).length,
    sizes: [...sourcePdf.matchAll(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)/g)]
      .map((match) => [Number(match[1]), Number(match[2])]), text: null };
}

function renderPdfEdges(file, pages) {
  const bundled = path.join(os.homedir(),
    '.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe');
  const executable = process.env.INVOICE_QA_PDFTOPPM || (fs.existsSync(bundled) ? bundled : 'pdftoppm');
  for (const [number, name] of [[1, 'invoice-print-first'], [pages, 'invoice-print-last']]) {
    try {
      execFileSync(executable, ['-f', String(number), '-l', String(number), '-singlefile',
        '-scale-to', '1400', '-png', file, path.join(ARTIFACTS, name)], { stdio: 'pipe' });
    } catch {
      console.warn('SKIP PDF raster review: Poppler unavailable; set INVOICE_QA_PDFTOPPM to enable it.');
      break;
    }
  }
}

async function main() {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'webutils-invoice-browser-'));
  const downloads = path.join(temporary, 'downloads');
  fs.mkdirSync(downloads); fs.mkdirSync(ARTIFACTS, { recursive: true });
  const logoPath = path.join(temporary, 'logo.png');
  fs.writeFileSync(logoPath, Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+afoQAAAAASUVORK5CYII=', 'base64'));
  const invalidLogo = path.join(temporary, 'not-image.txt');
  fs.writeFileSync(invalidLogo, 'not a raster image');
  const server = await startServer();
  const origin = 'http://127.0.0.1:' + server.address().port;
  let browser, baseline;
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
  async function importDocument(page, data, name, expectedNumber) {
    const file = path.join(temporary, name + '.json');
    fs.writeFileSync(file, typeof data === 'string' ? data : JSON.stringify(data));
    const input = await page.$('#importJson');
    await input.uploadFile(file);
    if (expectedNumber) await page.waitForFunction((number) =>
      document.querySelector('#number').value === number, {}, expectedNumber);
    await flush(page);
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
    await flush(page);

    await check('initial totals equal 1200 + 2 × 350 and the JSON export preserves exact decimal strings', async () => {
      assert.equal(await page.evaluate(() => typeof InvoiceCore.calculate), 'function');
      assert.equal(await amount(page), '1900.00');
      const exported = await download(page, '#exportJson', downloads);
      assert.match(exported.name, /\.json$/i);
      baseline = JSON.parse(exported.bytes.toString('utf8'));
      assert.equal(baseline.version, 1);
      assert.equal(baseline.state.items.length, 2);
      assert.equal(baseline.state.items[0].price, '1200.00');
    });

    await check('item add, duplicate and remove update the live totals', async () => {
      await page.click('.item-editor[data-index="0"] [data-action="duplicate"]'); await flush(page);
      assert.equal(await page.evaluate(() => document.querySelectorAll('.item-editor').length), 3);
      assert.equal(await amount(page), '3100.00');
      await page.click('.item-editor[data-index="2"] [data-action="remove"]'); await flush(page);
      assert.equal(await page.evaluate(() => document.querySelectorAll('.item-editor').length), 2);
      await page.click('#addItem'); await flush(page);
      assert.equal(await page.evaluate(() => document.querySelectorAll('.item-editor').length), 3);
      await reset(page);
    });

    await check('decimal amounts and 3-place quantities calculate exactly across all six currencies', async () => {
      await setInputs(page, { currency: 'JPY' });
      assert.equal(await amount(page), '1900', 'switching default whole amounts to JPY remains valid');
      await setInputs(page, { currency: 'CNY' });
      await setItem(page, 0, { quantity: '1', price: '0.10' });
      await setItem(page, 1, { quantity: '1', price: '0.20' });
      assert.equal(await amount(page), '0.30');
      await setItem(page, 0, { quantity: '0.125', price: '0.24' });
      assert.equal(await amount(page), '0.23');
      for (const currency of ['CNY', 'USD', 'EUR', 'GBP', 'HKD']) {
        await setInputs(page, { currency });
        assert.equal(await amount(page), '0.23');
      }
      await setInputs(page, { currency: 'JPY' });
      await setItem(page, 0, { quantity: '1', price: '1200' });
      await setItem(page, 1, { quantity: '2', price: '350' });
      assert.equal(await amount(page), '1900');
      await reset(page);
    });

    await check('tax-exclusive, tax-inclusive, discounts, paid balance and overpayment follow exact totals', async () => {
      await setItem(page, 0, { quantity: '1', price: '100.00' });
      await setItem(page, 1, { quantity: '1', price: '0.00' });
      await setInputs(page, { taxMode: 'exclusive', taxRate: '10', discountMode: 'percent',
        discountValue: '10', paidAmount: '110.00' });
      assert.equal(await amount(page, 'discountAmount'), '10.00');
      assert.equal(await amount(page, 'taxAmount'), '9.00');
      assert.equal(await amount(page), '99.00');
      assert.equal(await amount(page, 'dueAmount'), '0.00');
      assert.equal(await amount(page, 'overpaidAmount'), '11.00');
      await setItem(page, 0, { price: '110.00' });
      await setInputs(page, { taxMode: 'inclusive', discountMode: 'amount', discountValue: '10.00' });
      assert.equal(await amount(page), '100.00');
      assert.equal(await amount(page, 'taxAmount'), '9.09');
      assert.equal(await amount(page, 'overpaidAmount'), '10.00');
      await reset(page);
    });

    await check('invalid amounts block printing and exports and cannot keep a stale total', async () => {
      for (const invalid of [{ item: { price: '0.001' } }, { item: { quantity: '1.0001' } },
        { input: { taxRate: '101' } }, { input: { paidAmount: '-1' } }]) {
        if (invalid.item) await setItem(page, 0, invalid.item);
        if (invalid.input) await setInputs(page, invalid.input);
        assert.ok(await page.evaluate(() => document.querySelector('#validationMessage').textContent.trim().length > 0));
        for (const id of ['printInvoice', 'downloadHtml', 'downloadCsv', 'exportJson']) {
          assert.equal(await page.evaluate((key) => document.getElementById(key).disabled, id), true, id);
        }
        assert.notEqual(await amount(page), '1900.00', 'invalid state must not display an old valid total');
        await reset(page);
      }
    });

    await check('JSON import is atomic, valid documents restore, and CSV protects formula-looking descriptions', async () => {
      await setInputs(page, { sellerName: 'IMPORT-KEEP-ME' });
      const bad = JSON.parse(JSON.stringify(baseline));
      bad.version = 99; bad.state.sellerName = 'MUST-NOT-REPLACE';
      await importDocument(page, bad, 'invalid-version');
      assert.equal(await page.evaluate(() => document.querySelector('#sellerName').value), 'IMPORT-KEEP-ME');
      assert.equal(await amount(page), '1900.00');
      await importDocument(page, '{"broken":', 'invalid-json');
      assert.equal(await page.evaluate(() => document.querySelector('#sellerName').value), 'IMPORT-KEEP-ME');
      const badPixels = JSON.parse(JSON.stringify(baseline));
      badPixels.state.sellerName = 'BROKEN-LOGO-MUST-NOT-REPLACE';
      badPixels.state.logo = 'data:image/png;base64,iVBORw0KGgo=';
      await importDocument(page, badPixels, 'invalid-png-pixels');
      await page.waitForFunction(() => /导入失败.*Logo/.test(document.querySelector('#status').textContent));
      assert.equal(await page.evaluate(() => document.querySelector('#sellerName').value), 'IMPORT-KEEP-ME');
      assert.equal(await amount(page), '1900.00');
      const restored = JSON.parse(JSON.stringify(baseline));
      restored.state.number = 'QA-JSON-RESTORE';
      await importDocument(page, restored, 'valid-roundtrip', restored.state.number);
      assert.equal(await amount(page), '1900.00');
      await setItem(page, 0, { description: '=HYPERLINK("https://example.invalid","x")' });
      await setItem(page, 1, { description: '@SUM(1,2)' });
      const csv = await download(page, '#downloadCsv', downloads);
      assert.deepEqual(csv.bytes.subarray(0, 3), Buffer.from([239, 187, 191]));
      assert.notDeepEqual(csv.bytes.subarray(3, 6), Buffer.from([239, 187, 191]), 'CSV contains exactly one BOM');
      const cells = parseCsv(csv.bytes.toString('utf8')).flat();
      assert.ok(cells.includes('\'=HYPERLINK("https://example.invalid","x")'));
      assert.ok(cells.includes("'@SUM(1,2)"));
      await reset(page);
    });

    await check('user HTML stays inert in preview and standalone HTML opens offline with matching totals', async () => {
      const attack = '<img src=x onerror="window.__invoiceXss=1"><script>window.__invoiceXss=2</script>';
      await setInputs(page, { sellerName: '<b>QA seller</b>', notes: attack });
      assert.equal(await page.evaluate(() => window.__invoiceXss), undefined);
      assert.equal(await page.evaluate(() => document.querySelector('#invoicePreview script')), null);
      assert.ok(await page.evaluate((text) => document.querySelector('#invoicePreview').textContent.includes(text), attack));
      const expected = await amount(page);
      const html = await download(page, '#downloadHtml', downloads);
      assert.match(html.name, /\.html$/i);
      const standaloneFile = path.join(ARTIFACTS, 'invoice-standalone.html');
      fs.writeFileSync(standaloneFile, html.bytes);
      const offline = await browser.newPage(); watch(offline);
      const requests = [];
      offline.on('request', (request) => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
      await offline.setOfflineMode(true);
      await offline.goto(pathToFileURL(standaloneFile).href, { waitUntil: 'load' });
      assert.equal(await offline.evaluate(() => window.__invoiceXss), undefined);
      assert.equal(await amount(offline), expected);
      assert.deepEqual(requests, [], 'standalone HTML has no external rendering dependencies');
      await offline.screenshot({ path: path.join(ARTIFACTS, 'invoice-standalone.png'), fullPage: true });
      await offline.close();
      await reset(page);
    });

    await check('logo uploads, removal and invalid image recovery use only local raster data', async () => {
      if (!await page.evaluate(() => document.querySelector('#logoUpload').closest('details').open)) {
        await page.click('details:has(#logoUpload) > summary');
      }
      const input = await page.$('#logoUpload');
      await input.uploadFile(logoPath);
      await page.waitForFunction(() => [...document.querySelectorAll('#invoicePreview img')]
        .some((image) => /^data:image\/png;base64,/.test(image.src) && image.complete && image.naturalWidth > 0));
      await page.click('#removeLogo'); await flush(page);
      assert.equal(await page.evaluate(() => document.querySelectorAll('#invoicePreview img').length), 0);
      await input.uploadFile(invalidLogo);
      await pause(100);
      assert.equal(await page.evaluate(() => document.querySelectorAll('#invoicePreview img').length), 0);
      assert.match(await page.evaluate(() => document.querySelector('#status').textContent), /图片|PNG|JPEG|WebP|格式|支持/i);
      await input.uploadFile(logoPath);
      await page.waitForFunction(() => document.querySelector('#invoicePreview img')?.naturalWidth > 0);
      await page.click('#removeLogo');
      const imported = JSON.parse(JSON.stringify(baseline));
      async function deferReads() {
        await page.evaluate(() => {
          delete window.__releaseLogo; delete window.__releaseJson;
          const decode = HTMLImageElement.prototype.decode, text = File.prototype.text;
          window.__restoreReads = () => { HTMLImageElement.prototype.decode = decode; File.prototype.text = text; };
          HTMLImageElement.prototype.decode = function () {
            if (!this.src.startsWith('blob:')) return decode.call(this);
            return new Promise((resolve, reject) => { window.__releaseLogo = () => decode.call(this).then(resolve, reject); });
          };
          File.prototype.text = function () {
            if (!this.name.startsWith('deferred-import-')) return text.call(this);
            return new Promise((resolve, reject) => { window.__releaseJson = () => text.call(this).then(resolve, reject); });
          };
        });
      }
      for (const logoFirst of [true, false]) {
        await reset(page); await deferReads();
        const deferred = path.join(temporary, 'deferred-import-same.json');
        imported.state.number = logoFirst ? 'LATEST-IMPORT' : 'STALE-IMPORT';
        fs.writeFileSync(deferred, JSON.stringify(imported));
        const oldNumber = await page.evaluate(() => document.querySelector('#number').value);
        const upload = async () => {
          await (await page.$('#logoUpload')).uploadFile(logoPath);
          await page.waitForFunction(() => typeof window.__releaseLogo === 'function');
        };
        const importFile = async () => {
          await (await page.$('#importJson')).uploadFile(deferred);
          await page.waitForFunction(() => typeof window.__releaseJson === 'function');
        };
        try {
          if (logoFirst) { await upload(); await importFile(); }
          else { await importFile(); await upload(); }
          await page.evaluate((first) => first ? window.__releaseLogo() : window.__releaseJson(), logoFirst);
          await flush(page);
          await page.evaluate((first) => first ? window.__releaseJson() : window.__releaseLogo(), logoFirst);
          if (logoFirst) {
            await page.waitForFunction(() => document.querySelector('#number').value === 'LATEST-IMPORT');
            assert.equal(await page.evaluate(() => document.querySelectorAll('#invoicePreview img').length), 0);
          } else {
            await page.waitForFunction(() => document.querySelector('#invoicePreview img')?.naturalWidth > 0);
            assert.equal(await page.evaluate(() => document.querySelector('#number').value), oldNumber);
          }
        } finally { await page.evaluate(() => window.__restoreReads()); }
      }
      await page.click('#removeLogo'); await flush(page);
    });

    await check('manual local drafts restore and clear without changing the visible document', async () => {
      await setInputs(page, { sellerName: '发票草稿核验', number: 'DRAFT-QA-001' });
      await page.click('#saveDraft');
      assert.ok(await page.evaluate(() => localStorage.getItem('webutils-invoice-draft-v1')?.includes('发票草稿核验')));
      await page.reload({ waitUntil: 'networkidle0' }); await flush(page);
      assert.equal(await page.evaluate(() => document.querySelector('#number').value), 'DRAFT-QA-001');
      await page.click('#clearDraft');
      assert.equal(await page.evaluate(() => localStorage.getItem('webutils-invoice-draft-v1')), null);
      assert.equal(await page.evaluate(() => document.querySelector('#number').value), 'DRAFT-QA-001');
      await reset(page);
    });

    await check('native print and A4 pagination keep all 100 item rows while hiding the editor', async () => {
      const many = JSON.parse(JSON.stringify(baseline));
      many.state.number = 'QA-PRINT-100';
      many.state.sellerName = 'PDF-SELLER-QA';
      many.state.notes = 'PDF-END-MARKER\n<script>window.__invoicePrintXss=1</script>';
      many.state.items = Array.from({ length: 100 }, (_, index) => ({ ...baseline.state.items[0],
        description: 'PRINT-ITEM-' + String(index + 1).padStart(3, '0'), quantity: '1', price: '1.00' }));
      many.state.items[49].description += ' ' + 'LONGENGLISHDESCRIPTIONWITHOUTSPACES'.repeat(4);
      await importDocument(page, many, 'print-100-lines', many.state.number);
      await page.waitForFunction(() => document.querySelectorAll('.item-editor').length === 100);
      assert.equal(await amount(page), '100.00');
      assert.equal(await page.evaluate(() => document.querySelector('#addItem').disabled), true);
      await page.evaluate(() => {
        const marker = document.createElement('span'); marker.textContent = 'INVOICE-EDITOR-ONLY-SENTINEL';
        document.querySelector('#itemsEditor').append(marker);
        window.print = () => { window.__invoicePrintCalled = true; };
      });
      await page.click('#printInvoice');
      assert.equal(await page.evaluate(() => window.__invoicePrintCalled), true);
      await page.emulateMediaType('print');
      assert.equal(await page.evaluate(() => document.querySelector('#itemsEditor').getClientRects().length), 0);
      assert.ok(await page.evaluate(() => document.querySelector('#invoicePreview').getClientRects().length > 0));
      const printLayout = await page.evaluate(() => {
        const preview = document.querySelector('#invoicePreview');
        const clipping = [];
        for (let element = preview; element && element !== document.documentElement; element = element.parentElement) {
          const style = getComputedStyle(element);
          if (/(hidden|clip|auto|scroll)/.test(style.overflowX + ' ' + style.overflowY) ||
            /^(fixed|sticky)$/.test(style.position)) clipping.push(element.id || element.className || element.tagName);
        }
        return { width: preview.clientWidth, content: preview.scrollWidth, clipping };
      });
      assert.deepEqual(printLayout.clipping, [], 'print ancestors do not clip or stay fixed');
      assert.ok(printLayout.content <= printLayout.width + 1, 'long English descriptions fit the printable paper');
      const pdfPath = path.join(ARTIFACTS, 'invoice-100-lines.pdf');
      await page.pdf({ path: pdfPath, format: 'A4', printBackground: true, preferCSSPageSize: true });
      const pdf = inspectPdf(pdfPath);
      assert.ok(pdf.pages > 1, '100 lines create multiple physical A4 pages');
      assert.ok(pdf.sizes.length > 0, 'PDF contains page dimensions');
      for (const [width, height] of pdf.sizes) {
        assert.ok(Math.abs(width - 595.28) < 1 && Math.abs(height - 841.89) < 1, 'printed pages are A4');
      }
      if (pdf.text !== null) {
        for (let index = 1; index <= 100; index++) {
          assert.ok(pdf.text.includes('PRINT-ITEM-' + String(index).padStart(3, '0')), 'PDF retains line ' + index);
        }
        assert.ok(pdf.text.includes('PDF-END-MARKER'));
        assert.ok(pdf.text.includes('window.__invoicePrintXss=1'), 'PDF retains literal user markup as inert text');
        assert.ok(!pdf.text.includes('INVOICE-EDITOR-ONLY-SENTINEL'));
        console.log('PRINT PDF text: 100/100 item markers and final note retained');
      }
      assert.equal(await page.evaluate(() => window.__invoicePrintXss), undefined);
      renderPdfEdges(pdfPath, pdf.pages);
      console.log('PRINT A4 pages: ' + pdf.pages);
      await page.emulateMediaType('screen'); await reset(page);
    });

    await check('all document types and mobile themes remain readable without horizontal overflow', async () => {
      for (const type of ['invoice', 'receipt', 'quote']) {
        await setInputs(page, { type });
        assert.match(await page.evaluate(() => document.querySelector('#invoicePreview').textContent),
          new RegExp({ invoice: '发票', receipt: '收据', quote: '报价单' }[type]));
      }
      await reset(page); await assertNoOverflow(page);
      await page.screenshot({ path: path.join(ARTIFACTS, 'invoice-desktop-light.png'), fullPage: true });
      await page.screenshot({ path: path.join(ARTIFACTS, 'invoice-desktop-viewport.png') });
      await page.click('#themeToggle'); await assertNoOverflow(page);
      await page.screenshot({ path: path.join(ARTIFACTS, 'invoice-desktop-dark.png'), fullPage: true });
      await page.setViewport({ width: 375, height: 812 }); await assertNoOverflow(page);
      await page.screenshot({ path: path.join(ARTIFACTS, 'invoice-mobile-dark.png'), fullPage: true });
      await page.click('#themeToggle'); await assertNoOverflow(page);
      await page.screenshot({ path: path.join(ARTIFACTS, 'invoice-mobile-light.png'), fullPage: true });
      await page.screenshot({ path: path.join(ARTIFACTS, 'invoice-mobile-viewport.png') });
      await page.evaluate(() => document.querySelector('#invoicePreview').scrollIntoView({ block: 'start' }));
      await page.screenshot({ path: path.join(ARTIFACTS, 'invoice-mobile-preview.png') });
    });

    await check('the original file URL supports offline editing and JSON and HTML exports', async () => {
      const offline = await browser.newPage(); watch(offline);
      await offline.setOfflineMode(true);
      await offline.goto(pathToFileURL(path.join(ROOT, TARGET)).href, { waitUntil: 'load' });
      await flush(offline);
      assert.equal(await amount(offline), '1900.00');
      await setItem(offline, 0, { price: '100.00' });
      assert.equal(await amount(offline), '800.00');
      const json = JSON.parse((await download(offline, '#exportJson', downloads)).bytes.toString('utf8'));
      assert.equal(json.state.items[0].price, '100.00');
      const html = await download(offline, '#downloadHtml', downloads);
      assert.match(html.bytes.toString('utf8'), /800[.,]00/);
      await offline.close();
    });
    await check('all invoice workflows finish without runtime or page errors', async () => assert.deepEqual(errors, []));
    console.log('Invoice browser QA: ' + checks + ' checks passed');
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
