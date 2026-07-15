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
function textLen(s) {
  return strip(s).replace(/\s+/g, ' ').trim().length;
}
function guideCn(html) {
  const idx = html.indexOf('class="tool-guide"');
  if (idx < 0) return 0;
  const start = html.lastIndexOf('<section', idx);
  const end = html.indexOf('</section>', idx);
  if (start < 0 || end < 0) return 0;
  return cn(html.slice(start, end));
}

const files = walk('tools');
const thin = [];
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const body = (html.match(/<body[\s\S]*<\/body>/i) || [html])[0];
  const c = cn(body);
  const t = textLen(body);
  const gcn = guideCn(html);
  const has = html.includes('class="tool-guide"');
  // remaining thin: no enhanced guide
  if (!has || gcn < 800) {
    thin.push({
      rel: f.replace(/\\/g, '/'),
      cn: c,
      text: t,
      gcn,
      has,
    });
  }
}
thin.sort((a, b) => a.cn - b.cn || a.gcn - b.gcn);
console.log('remaining_without_enhanced_guide', thin.length);
thin.slice(0, 50).forEach((x) => {
  console.log(`${x.cn}\t${x.gcn}\t${x.has}\t${x.rel}`);
});
