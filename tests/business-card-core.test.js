import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const PNG = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'));
function core() {
  const html = fs.readFileSync(new URL('../tools/generator/business-card.html', import.meta.url), 'utf8');
  const source = html.match(/\/\/ Business card core start([\s\S]*?)\/\/ Business card core end/)?.[1];
  assert.ok(source, 'The shipped HTML must contain the standalone business card core');
  const context = vm.createContext({ window: {}, TextEncoder, Uint8Array, Uint32Array, DataView });
  vm.runInContext(source, context);
  return context.window.BusinessCardCore;
}
function state(api, changes = {}) { return { ...api.defaults, ...changes }; }
function chunks(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const result = [];
  let at = 8;
  while (at < bytes.length) {
    const length = view.getUint32(at);
    const type = Buffer.from(bytes.subarray(at + 4, at + 8)).toString('ascii');
    result.push({ at, type, data: bytes.subarray(at + 8, at + 8 + length), crc: view.getUint32(at + 8 + length) });
    at += length + 12;
  }
  assert.equal(at, bytes.length);
  return result;
}
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

test('the single-file core exposes only the agreed global API with complete Chinese defaults', () => {
  const api = core();
  assert.ok(api, 'BusinessCardCore must be implemented');
  assert.deepEqual(Object.keys(api).sort(), ['buildSvg', 'buildVCard', 'defaults', 'getDimensions', 'sizes', 'validateLogo', 'withPngDpi'].sort());
  for (const name of ['name','title','company','phone','email','website','address','tagline','logo','template','ink','paper','accent','size','font','nameSize']) assert.ok(name in api.defaults);
  assert.equal(api.defaults.name, '林远');
  assert.equal(api.defaults.title, '品牌设计师');
  assert.equal(api.defaults.company, '山间设计工作室');
});

test('all trim dimensions and 300 dpi pixel sizes are correct', () => {
  const api = core();
  for (const [size, [widthMm, heightMm]] of Object.entries({cn:[90,54],iso:[85,55],us:[89,51]})) {
    const dimensions = api.getDimensions(state(api, { size }));
    assert.deepEqual(JSON.parse(JSON.stringify(dimensions)), { widthMm, heightMm,
      pixelWidth: Math.round(widthMm / 25.4 * 300), pixelHeight: Math.round(heightMm / 25.4 * 300) });
    assert.equal(api.sizes[size].widthMm, widthMm);
    assert.equal(api.sizes[size].heightMm, heightMm);
  }
});

test('3 mm bleed extends each physical edge without changing the trim design scale', () => {
  const api = core();
  const dimensions = api.getDimensions(state(api), true);
  assert.equal(dimensions.widthMm, 96);
  assert.equal(dimensions.heightMm, 60);
  assert.equal(dimensions.pixelWidth, 1134);
  const svg = api.buildSvg(state(api), 'front', { bleed: true });
  assert.match(svg, /width="96mm"/);
  assert.match(svg, /height="60mm"/);
  assert.match(svg, /viewBox="-30 -30 960 600"/);
  assert.match(svg, /<rect[^>]*x="-30"[^>]*y="-30"[^>]*width="960"[^>]*height="600"/);
});

test('all templates generate distinct usable SVG fronts and brand-focused backs', () => {
  const api = core();
  const fronts = [];
  for (const template of ['classic', 'sidebar', 'centered']) {
    const front = api.buildSvg(state(api, { template }), 'front');
    const back = api.buildSvg(state(api, { template }), 'back');
    assert.match(front, /^<svg\b/);
    assert.match(front, /xmlns="http:\/\/www.w3.org\/2000\/svg"/);
    assert.match(front, /width="90mm" height="54mm"/);
    for (const text of ['林远', '品牌设计师', '138', 'example.com', '静安']) assert.ok(front.includes(text), text);
    assert.ok(back.includes(api.defaults.company));
    assert.ok(back.includes(api.defaults.tagline));
    assert.ok(!back.includes(api.defaults.phone));
    assert.doesNotMatch(front + back, /<circle\b|<linearGradient\b|<radialGradient\b/);
    fronts.push(front);
  }
  assert.equal(new Set(fronts).size, 3);
});

test('SVG text and color inputs cannot inject elements, attributes or external resources', () => {
  const api = core();
  const svg = api.buildSvg(state(api, { name:'<script>alert(1)</script>', company:'A&B "设计"',
    title:'" onload="alert(1)', ink:'red" onload="alert(1)', paper:'url(https://evil.test/a)', accent:'#ff0000' }), 'front');
  assert.doesNotMatch(svg, /<script\b|<[^>]+\sonload=|https:\/\/evil/);
  assert.match(svg, /&lt;script&gt;/);
  assert.match(svg, /A&amp;B/);
  assert.match(svg, /fill="#183c38"/);
  assert.match(svg, /fill="#ffffff"/);
});

test('long multilingual text is constrained inside the card safe area', () => {
  const api = core();
  for (const template of ['classic','sidebar','centered']) for (const side of ['front','back']) {
    const svg = api.buildSvg(state(api, { template, name:'林远'.repeat(80),
      company:'LongDesignStudio品牌'.repeat(80), title:'设计师'.repeat(80),
      phone:'1234567890'.repeat(50), email:'hello@example.com'.repeat(40),
      website:'www.design.example'.repeat(40), address:'上海静安南京西路'.repeat(60),
      tagline:'让好想法被看见'.repeat(80), nameSize:999 }), side);
    assert.ok(svg.length < 12000, 'Long inputs must be clipped rather than emitted without limits');
    assert.match(svg, /…/);
    for (const match of svg.matchAll(/<text\b([^>]*)>/g)) {
      const attributes = match[1];
      const x = Number(attributes.match(/\bx="([\d.]+)"/)?.[1]);
      const y = Number(attributes.match(/\by="([\d.]+)"/)?.[1]);
      assert.ok(x >= 40 && x <= 860, 'Text anchor stays within 4mm trim safe bounds');
      assert.ok(y >= 40 && y <= 500, 'Text baseline stays within vertical safe bounds');
    }
  }
});

test('logo validation accepts bounded raster images and rejects SVG and invalid sizes', () => {
  const api = core();
  for (const type of ['image/png','image/jpeg','image/webp']) assert.equal(api.validateLogo(type, 5 * 1024 * 1024), true);
  for (const [type,size] of [['image/svg+xml',100],['text/html',100],['image/png',0],['image/png',-1],['image/png',Infinity],['image/png',5*1024*1024+1]]) assert.throws(() => api.validateLogo(type,size), /图片|格式|大小|5|Logo|标志/);
  const dataUrl = 'data:image/png;base64,' + Buffer.from(PNG).toString('base64');
  assert.match(api.buildSvg(state(api,{logo:dataUrl}),'back'), /<image\b/);
  for (const logo of ['https://evil.test/logo.png','data:image/svg+xml;base64,PHN2Zy8+','data:image/png;base64,abc" onload="alert(1)']) assert.throws(() => api.buildSvg(state(api,{logo}),'back'), /图片|Logo|格式|数据|标志/);
});

test('font selection and name size are reflected safely without custom CSS injection', () => {
  const api = core();
  assert.match(api.buildSvg(state(api,{font:'serif',nameSize:44}),'front'), /font-family="[^"]*serif/);
  assert.match(api.buildSvg(state(api,{nameSize:44}),'front'), /font-size="44"/);
  assert.doesNotMatch(api.buildSvg(state(api,{font:'x" onload="alert(1)'}),'front'), /onload=/);
});

test('empty state fields remain empty rather than reverting to default personal information', () => {
  const api = core();
  const empty = Object.fromEntries(['name','title','company','phone','email','website','address','tagline'].map(key=>[key,'']));
  const svg = api.buildSvg(state(api,empty),'front');
  for (const value of ['林远','138','example.com']) assert.ok(!svg.includes(value));
  assert.throws(() => api.buildSvg(state(api),'unknown'), /正面|背面|面/);
});

test('vCard 3.0 includes contact fields, CRLF, TEXT escaping and no injected properties', () => {
  const api = core();
  const vcf = api.buildVCard(state(api,{name:'林;远,设计\\师',company:'山间;设计,品牌',
    address:'上海\n静安;一号',title:'设计师\r\nX-EVIL:injected'}));
  assert.ok(vcf.startsWith('BEGIN:VCARD\r\nVERSION:3.0\r\n'));
  assert.ok(vcf.endsWith('END:VCARD\r\n'));
  assert.match(vcf, /FN:林\\;远\\,设计\\\\师\r\n/);
  assert.match(vcf, /ORG:山间\\;设计\\,品牌\r\n/);
  assert.match(vcf, /TITLE:设计师\\nX-EVIL:injected/);
  assert.match(vcf, /ADR;TYPE=WORK:;;上海\\n静安\\;一号;;;;/);
  assert.match(vcf, /TEL;TYPE=WORK,VOICE:/);
  assert.match(vcf, /EMAIL;TYPE=INTERNET,WORK:/);
  assert.match(vcf, /URL:/);
  assert.doesNotMatch(vcf, /\r\nX-EVIL:/);
  assert.ok(!vcf.replace(/\r\n/g,'').includes('\n'));
});

test('vCard lines fold at 75 UTF-8 octets without breaking code points', () => {
  const api = core();
  const name = '林远设计🌲'.repeat(40);
  const vcf = api.buildVCard(state(api,{name}));
  for (const line of vcf.split('\r\n')) assert.ok(Buffer.byteLength(line,'utf8') <= 75);
  assert.ok(vcf.includes('\r\n '));
  const unfolded = vcf.replace(/\r\n /g,'');
  assert.ok(unfolded.includes('FN:'+name));
  assert.ok(!vcf.includes('\ufffd'));
});

test('PNG pHYs stores real 300 dpi in metres and a valid CRC without changing image data', () => {
  const api = core();
  const result = api.withPngDpi(PNG,300);
  assert.ok(result instanceof Uint8Array);
  assert.deepEqual(result.subarray(0,8),PNG.subarray(0,8));
  const parsed = chunks(result);
  assert.deepEqual(parsed.map(chunk=>chunk.type),['IHDR','pHYs','IDAT','IEND']);
  const physical = parsed.find(chunk=>chunk.type==='pHYs');
  assert.equal(physical.data.length,9);
  const view = new DataView(physical.data.buffer,physical.data.byteOffset,9);
  assert.equal(view.getUint32(0),11811);
  assert.equal(view.getUint32(4),11811);
  assert.equal(physical.data[8],1);
  assert.equal(physical.crc,crc32(result.subarray(physical.at+4,physical.at+17)));
  assert.deepEqual(parsed.find(chunk=>chunk.type==='IDAT').data,chunks(PNG).find(chunk=>chunk.type==='IDAT').data);
  assert.equal(PNG.length,68, 'Input bytes stay unchanged');
});

test('PNG density replacement avoids duplicate pHYs and supports other valid dpi values', () => {
  const api = core();
  const result = api.withPngDpi(api.withPngDpi(PNG,300),150);
  const physical = chunks(result).filter(chunk=>chunk.type==='pHYs');
  assert.equal(physical.length,1);
  assert.equal(new DataView(physical[0].data.buffer,physical[0].data.byteOffset,9).getUint32(0),5906);
  assert.equal(result.length,PNG.length+21);
});

test('malformed PNGs and invalid dpi values fail with readable errors', () => {
  const api = core();
  for (const bytes of [new Uint8Array(),PNG.subarray(0,40),Uint8Array.from([0,...PNG.subarray(1)]),new ArrayBuffer(4)]) assert.throws(()=>api.withPngDpi(bytes),/PNG|图片|数据/);
  for (const dpi of [0,-1,Infinity,NaN,1e10]) assert.throws(()=>api.withPngDpi(PNG,dpi),/分辨率|DPI|dpi/);
});

test('contact and supporting type stay at least 24 design units for print legibility', () => {
  const api = core();
  for (const template of ['classic','sidebar','centered']) {
    const svg = api.buildSvg(state(api,{template}),'front');
    for (const value of [api.defaults.phone, api.defaults.email, api.defaults.website,
      api.defaults.address, api.defaults.title, api.defaults.company]) {
      const text = [...svg.matchAll(/<text\b([^>]*)>([^<]*)<\/text>/g)].find(match => match[2] === value);
      assert.ok(text, value + ' must be displayed');
      assert.ok(Number(text[1].match(/font-size="([\d.]+)"/)[1]) >= 24,
        template + ': contact and supporting text must be readable in print');
    }
  }
});

test('vCard website URI preserves legal punctuation and normalizes bare domains', () => {
  const api = core();
  const explicit = api.buildVCard(state(api,{website:'https://example.com/a,b?ref=x;y'}));
  assert.ok(explicit.includes('URL:https://example.com/a,b?ref=x;y\r\n'));
  assert.ok(!explicit.includes('a\\,b'));
  const bare = api.buildVCard(state(api,{website:'www.shanjian.design'}));
  assert.ok(bare.includes('URL:https://www.shanjian.design\r\n'));
  const relative = api.buildVCard(state(api,{website:'//example.com/design'}));
  assert.ok(relative.includes('URL:https://example.com/design\r\n'));
});

test('vCard website whitespace and control characters cannot inject new properties', () => {
  const api = core();
  const vcf = api.buildVCard(state(api,{website:'https://example.com/a b\r\nX-EVIL:injected\t'}));
  const unfolded = vcf.replace(/\r\n /g,'');
  assert.ok(unfolded.includes('URL:https://example.com/a%20b%0D%0AX-EVIL:injected%09\r\n'));
  assert.doesNotMatch(vcf,/\r\nX-EVIL:/);
  assert.ok(!unfolded.includes('\\nX-EVIL'));
});
