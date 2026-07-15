const fs = require('fs');
const path = require('path');

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', 'docs', 'screenshots'].includes(entry.name)) {
        walk(full, acc);
      }
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      acc.push(full);
    }
  }
  return acc;
}

const root = path.join(__dirname, '..');
const toolFiles = walk(path.join(root, 'tools'));
const allHtml = walk(root).filter((f) => !f.includes(`${path.sep}node_modules${path.sep}`));

let noindex = 0;
let adPages = 0;
const thin = [];
const multiH1 = [];
const multiCanonical = [];
const missingDesc = [];

for (const file of toolFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file).replace(/\\/g, '/');

  if (/noindex/i.test(html)) noindex += 1;
  if (/class\s*=\s*["'][^"']*\b(ad-container|ad-slot|ad-banner)\b/i.test(html)) adPages += 1;

  const head = (html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i) || ['', ''])[1];
  const h1s = (html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi) || []).length;
  if (h1s !== 1) multiH1.push({ file: rel, h1s });

  const cans = (head.match(/rel\s*=\s*["']canonical["']/gi) || []).length;
  if (cans !== 1) multiCanonical.push({ file: rel, cans });

  const desc = head.match(/<meta\s+[^>]*name=["']description["'][^>]*>/i);
  if (!desc) missingDesc.push(rel);

  const body = (html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i) || ['', ''])[1];
  const text = body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const cn = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const total = text.length;
  if (cn < 200 || total < 400) {
    thin.push({ file: rel, cn, total });
  }
}

thin.sort((a, b) => a.cn - b.cn || a.total - b.total);

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const sitemapUrls = (sitemap.match(/<url>/g) || []).length;

console.log('=== Site Health Audit ===');
console.log('tool pages:', toolFiles.length);
console.log('all html pages:', allHtml.length);
console.log('noindex tool pages:', noindex);
console.log('tool pages with ad container:', adPages);
console.log('thin tool pages (cn<200 or text<400):', thin.length);
console.log('tool pages h1 != 1:', multiH1.length);
console.log('tool pages canonical != 1:', multiCanonical.length);
console.log('tool pages missing description:', missingDesc.length);
console.log('sitemap urls:', sitemapUrls);
console.log('\nTop 25 thinnest pages:');
for (const item of thin.slice(0, 25)) {
  console.log(`${item.cn}\t${item.total}\t${item.file}`);
}
if (multiH1.length) {
  console.log('\nH1 issues:');
  multiH1.slice(0, 20).forEach((x) => console.log(x.h1s, x.file));
}
if (multiCanonical.length) {
  console.log('\nCanonical issues:');
  multiCanonical.slice(0, 20).forEach((x) => console.log(x.cans, x.file));
}
