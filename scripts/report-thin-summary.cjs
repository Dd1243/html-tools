const fs = require('fs');
const path = require('path');

function walk(d, a = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, a);
    else if (e.name.endsWith('.html')) a.push(p);
  }
  return a;
}
function strip(s) {
  return String(s)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
}
function cn(s) {
  return (strip(s).match(/[\u4e00-\u9fff]/g) || []).length;
}
function guideCn(html) {
  const idx = html.indexOf('class="tool-guide"');
  if (idx < 0) return 0;
  const start = html.lastIndexOf('<section', idx);
  const end = html.indexOf('</section>', idx);
  if (start < 0 || end < 0) return 0;
  return cn(html.slice(start, end));
}

const thin = [];
for (const f of walk('tools')) {
  const html = fs.readFileSync(f, 'utf8');
  const body = (html.match(/<body[\s\S]*<\/body>/i) || [html])[0];
  const c = cn(body);
  const gcn = guideCn(html);
  const has = html.includes('class="tool-guide"');
  if (!has || gcn < 800) {
    thin.push({
      rel: f.replace(/\\/g, '/'),
      cn: c,
      gcn,
      cat: f.split(path.sep)[1],
    });
  }
}
thin.sort((a, b) => a.cn - b.cn || a.rel.localeCompare(b.rel));

const byCat = {};
for (const x of thin) byCat[x.cat] = (byCat[x.cat] || 0) + 1;

console.log('TOTAL', thin.length);
console.log('BY_CAT');
Object.entries(byCat)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(v + '\t' + k));

console.log('RANGES');
for (const [lo, hi] of [
  [0, 250],
  [251, 350],
  [351, 450],
  [451, 600],
  [601, 99999],
]) {
  console.log(lo + '-' + hi + ': ' + thin.filter((x) => x.cn >= lo && x.cn <= hi).length);
}

console.log('TOP40');
thin.slice(0, 40).forEach((x) => console.log(x.cn + '\t' + x.gcn + '\t' + x.rel));

// write full list for reference
const out = path.join(__dirname, '..', 'remaining-thin-pages.txt');
fs.writeFileSync(
  out,
  thin.map((x) => x.cn + '\t' + x.gcn + '\t' + x.rel).join('\n') + '\n',
  'utf8'
);
console.log('WROTE', out);
