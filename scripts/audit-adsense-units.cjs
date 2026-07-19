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
let withUnit = 0,
  scriptOnly = 0,
  noAd = 0;
const noUnit = [];
for (const f of files) {
  const h = fs.readFileSync(f, 'utf8');
  const hasScript = h.includes('pagead2.googlesyndication.com') || h.includes('ca-pub-');
  const hasIns = /ins\s+class=["']adsbygoogle["']/.test(h);
  if (hasScript && hasIns) withUnit++;
  else if (hasScript) {
    scriptOnly++;
    if (noUnit.length < 10) noUnit.push(path.relative(path.join(__dirname, '..'), f).replace(/\\/g, '/'));
  } else noAd++;
}
console.log(JSON.stringify({ toolPages: files.length, withAdUnit: withUnit, scriptOnly, noAd, scriptOnlySamples: noUnit }, null, 2));
