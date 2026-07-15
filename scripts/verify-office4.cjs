const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const files = [
  'tools/office/checklist-maker.html',
  'tools/office/invoice-maker.html',
  'tools/office/timesheet.html',
  'tools/office/task-tracker.html',
];
let fail = 0;
for (const f of files) {
  const h = fs.readFileSync(path.join(root, f), 'utf8');
  const d = (h.match(/name="description"\s+content="([^"]+)"/) || [])[1] || '';
  const body = h.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const h1 = (body.match(/<h1\b/gi) || []).length;
  const od = (h.match(/<div\b/gi) || []).length;
  const cd = (h.match(/<\/div>/gi) || []).length;
  let parseOk = false;
  const ld = h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  if (ld) {
    try {
      JSON.parse(ld[1]);
      parseOk = true;
    } catch (e) {
      console.error('LD', f, e.message);
    }
  }
  const links = [...h.matchAll(/href="(\/tools\/[^"]+)"/g)].map((m) => m[1]);
  const miss = links.filter((u) => !fs.existsSync(path.join(root, u.replace(/^\//, '') + '.html')));
  const ok =
    d.length >= 120 &&
    d.length <= 160 &&
    h1 === 1 &&
    od === cd &&
    parseOk &&
    h.includes('tool-section') &&
    h.includes('sidebar-section') &&
    h.includes('content-layout') &&
    miss.length === 0;
  console.log({ f, ok, desc: d.length, h1, div: od - cd, parseOk, miss });
  if (!ok) fail++;
}
process.exit(fail ? 1 : 0);
