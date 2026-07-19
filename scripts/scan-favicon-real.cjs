const fs = require('fs');
const path = require('path');

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'scripts', 'docs', 'tests', 'design-reference', 'design-templates', 'templates'].includes(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function hasRealFaviconLink(html) {
  // Only count actual <link ... rel="icon|shortcut icon|apple-touch-icon" ...>
  const links = html.match(/<link\b[^>]*>/gi) || [];
  return links.some((tag) =>
    /rel\s*=\s*["'](?:shortcut\s+)?icon["']/i.test(tag) ||
    /rel\s*=\s*["']apple-touch-icon["']/i.test(tag)
  );
}

const root = path.join(__dirname, '..');
const files = walk(root);
const without = [];
for (const f of files) {
  const base = path.basename(f);
  if (base.startsWith('baidu_verify_') || base === 'ByteDanceVerify.html') continue;
  const html = fs.readFileSync(f, 'utf8');
  if (!hasRealFaviconLink(html)) without.push(path.relative(root, f).replace(/\\/g, '/'));
}

console.log(JSON.stringify({
  totalChecked: files.length,
  withoutRealFavicon: without.length,
  includesTarget: without.includes('tools/media/favicon-generator.html'),
  samples: without.slice(0, 40),
}, null, 2));
