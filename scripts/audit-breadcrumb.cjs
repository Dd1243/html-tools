const fs = require('fs');
const path = require('path');

function walk(d, o = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, o);
    else if (e.name.endsWith('.html')) o.push(p);
  }
  return o;
}

const files = walk(path.join(__dirname, '..', 'tools'));
let withB = 0;
const without = [];
for (const f of files) {
  const h = fs.readFileSync(f, 'utf8');
  if (/class=["'][^"']*breadcrumb/.test(h) || /aria-label=["']breadcrumb["']/.test(h)) {
    withB++;
  } else {
    without.push(path.relative(path.join(__dirname, '..'), f).replace(/\\/g, '/'));
  }
}

// group by category
const byCat = {};
for (const f of without) {
  const cat = f.split('/')[1] || 'other';
  byCat[cat] = (byCat[cat] || 0) + 1;
}

console.log(
  JSON.stringify(
    {
      total: files.length,
      withBreadcrumb: withB,
      without: without.length,
      pctWithout: ((without.length / files.length) * 100).toFixed(1) + '%',
      byCategory: Object.fromEntries(
        Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 20)
      ),
      samples: without.slice(0, 30),
    },
    null,
    2
  )
);
