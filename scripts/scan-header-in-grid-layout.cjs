/**
 * Find pages where a header/h1 is a direct child of a multi-column grid/flex layout,
 * which typically breaks column alignment (graphql-builder style bug).
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

function strip(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ');
}

const hits = [];
for (const fp of walk(path.join(__dirname, '..', 'tools'))) {
  const raw = fs.readFileSync(fp, 'utf8');
  const rel = path.relative(path.join(__dirname, '..'), fp).replace(/\\/g, '/');
  const css = (raw.match(/<style\b[\s\S]*?<\/style>/gi) || []).join('\n');
  const body = strip(raw);

  // layouts that define multi-column grids
  const gridClasses = [];
  const re = /\.([a-zA-Z0-9_-]+)\s*\{[^}]*grid-template-columns\s*:[^;}]+/gi;
  let m;
  while ((m = re.exec(css)) !== null) {
    const cls = m[1];
    const block = m[0];
    // multi column if has more than one track-ish
    if (/1fr|px|%|auto/.test(block) && (block.match(/1fr|minmax|px|%/g) || []).length >= 2) {
      gridClasses.push(cls);
    }
  }
  if (!gridClasses.length) continue;

  for (const cls of [...new Set(gridClasses)]) {
    // element with this class containing header/h1 as first meaningful child
    const openRe = new RegExp(
      `<(main|div|section)\\b[^>]*class=["'][^"']*\\b${cls}\\b[^"']*["'][^>]*>([\\s\\S]{0,400})`,
      'i'
    );
    const om = body.match(openRe);
    if (!om) continue;
    const head = om[2];
    // if first element is header or h1 (possibly after comments/whitespace)
    const cleaned = head.replace(/<!--[\s\S]*?-->/g, '').trim();
    if (/^<(header|h1)\b/i.test(cleaned)) {
      hits.push({
        rel,
        layoutClass: cls,
        firstChild: cleaned.slice(0, 80).replace(/\s+/g, ' '),
      });
    }
  }
}

console.log(JSON.stringify({ count: hits.length, hits }, null, 2));
