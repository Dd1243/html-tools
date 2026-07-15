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
let withLd = 0;
let withoutLd = 0;
let withVis = 0;
const noLd = [];
const withLdSamples = [];

for (const f of files) {
  const h = fs.readFileSync(f, 'utf8');
  const hasLd = /BreadcrumbList/.test(h);
  const hasVis =
    /class=["'][^"']*\bbreadcrumb\b/.test(h) ||
    /aria-label=["']breadcrumb["']/.test(h);
  if (hasLd) {
    withLd++;
    if (withLdSamples.length < 5) withLdSamples.push(path.relative(path.join(__dirname, '..'), f).replace(/\\/g, '/'));
  } else {
    withoutLd++;
    if (noLd.length < 15) noLd.push(path.relative(path.join(__dirname, '..'), f).replace(/\\/g, '/'));
  }
  if (hasVis) withVis++;
}

console.log(
  JSON.stringify(
    {
      total: files.length,
      withBreadcrumbList: withLd,
      withoutBreadcrumbList: withoutLd,
      withVisibleCrumb: withVis,
      samplesNoLd: noLd,
      samplesWithLd: withLdSamples,
    },
    null,
    2
  )
);
