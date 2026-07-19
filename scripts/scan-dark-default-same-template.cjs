/**
 * Find pages that share gitignore-generator's dark cyberpunk template:
 * - :root has --bg-deep: #0a0a0f (or similar dark default)
 * - has [data-theme="light"] override
 * Report only; do not modify.
 */
const fs = require('fs');
const path = require('path');

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === '.git') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function extractRoot(cssOrHtml) {
  const m = cssOrHtml.match(/:root\s*\{([\s\S]*?)\}/);
  return m ? m[1] : '';
}

function isDarkTemplate(html) {
  const root = extractRoot(html);
  if (!root) return false;
  const darkDeep =
    /--bg-deep\s*:\s*#0a0a0f/i.test(root) ||
    /--bg-deep\s*:\s*#0b0b12/i.test(root) ||
    /--bg-deep\s*:\s*#0f0f1[0-9a-f]/i.test(root);
  const darkCard =
    /--bg-card\s*:\s*#1a1a24/i.test(root) ||
    /--bg-surface\s*:\s*#12121a/i.test(root);
  // light is override, not default
  const hasLightOverride = /\[data-theme=["']light["']\]/.test(html);
  // already light default?
  const lightDefault =
    /color-scheme\s*:\s*light/i.test(root) || /--bg-deep\s*:\s*#f/i.test(root);
  if (lightDefault) return false;
  return darkDeep && darkCard && hasLightOverride;
}

function defaultThemeHint(html) {
  if (/data-theme=["']light["']/.test(html.match(/<html[^>]*>/i)?.[0] || '')) {
    return 'html-light';
  }
  if (/data-theme=["']light["']/.test(html.match(/<body[^>]*>/i)?.[0] || '')) {
    return 'body-light';
  }
  // JS defaults
  const darkDefault =
    /\|\|\s*["']dark["']/.test(html) ||
    /setAttribute\(\s*["']data-theme["']\s*,\s*["']dark["']\s*\)/.test(html) ||
    /savedTheme\s*\|\|\s*["']dark["']/.test(html);
  if (darkDefault) return 'js-dark-default';
  // no light attribute + dark root vars => effectively dark
  return 'css-dark-root';
}

const rootDir = path.join(__dirname, '..', 'tools');
const files = walk(rootDir);
const hits = [];

for (const fp of files) {
  const html = fs.readFileSync(fp, 'utf8');
  if (!isDarkTemplate(html)) continue;
  const rel = path.relative(path.join(__dirname, '..'), fp).replace(/\\/g, '/');
  hits.push({
    path: rel,
    url: 'https://essays4u.net/' + rel.replace(/\.html$/, '').replace(/^tools\//, 'tools/'),
    themeHint: defaultThemeHint(html),
  });
}

// group by category folder
const byCat = {};
for (const h of hits) {
  const cat = h.path.split('/')[1] || 'other';
  byCat[cat] = byCat[cat] || [];
  byCat[cat].push(h.path);
}

console.log(
  JSON.stringify(
    {
      total: hits.length,
      byCategoryCounts: Object.fromEntries(
        Object.entries(byCat)
          .map(([k, v]) => [k, v.length])
          .sort((a, b) => b[1] - a[1])
      ),
      samples: hits.slice(0, 30).map((h) => h.path),
      includesGitignore: hits.some((h) => h.path.includes('gitignore-generator')),
      all: hits.map((h) => h.path),
    },
    null,
    2
  )
);
