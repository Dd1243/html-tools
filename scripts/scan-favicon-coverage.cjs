const fs = require('fs');
const path = require('path');

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === '.git' || ent.name === 'scripts') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const root = path.join(__dirname, '..');
const files = walk(root);
const re = /rel=["'](?:shortcut )?icon["']|apple-touch-icon|href=["'][^"']*favicon/i;

let withFavicon = 0;
const without = [];
const withRelative = [];
const withAbsolute = [];

for (const f of files) {
  const h = fs.readFileSync(f, 'utf8');
  const rel = path.relative(root, f).replace(/\\/g, '/');
  if (!re.test(h)) {
    without.push(rel);
    continue;
  }
  withFavicon++;
  if (/href=["']https?:\/\//i.test(h.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]*>/i)?.[0] || '')) {
    withAbsolute.push(rel);
  } else {
    withRelative.push(rel);
  }
}

// Check root assets
const assets = ['favicon.svg', 'favicon-16x16.png', 'favicon-32x32.png', 'favicon.ico', 'apple-touch-icon.png']
  .map((n) => ({ name: n, exists: fs.existsSync(path.join(root, n)) }));

// Sample index head
const indexHead = fs.readFileSync(path.join(root, 'index.html'), 'utf8').match(/<head[\s\S]*?<\/head>/i)?.[0] || '';
const indexIcons = [...indexHead.matchAll(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*>/gi)].map((m) => m[0]);

console.log(
  JSON.stringify(
    {
      totalHtml: files.length,
      withFavicon,
      withoutFavicon: without.length,
      withoutSamples: without.slice(0, 50),
      assets,
      indexIcons,
    },
    null,
    2
  )
);
