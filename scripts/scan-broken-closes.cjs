const fs = require('fs');
const path = require('path');

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!['node_modules', '.git', 'docs', 'screenshots'].includes(e.name)) walk(p, acc);
    } else if (e.isFile() && e.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

const root = path.join(__dirname, '..');
const files = walk(path.join(root, 'tools'));
const hits = [];

for (const f of files) {
  const t = fs.readFileSync(f, 'utf8');
  const patterns = [
    [/\n\s*&gt;\s*\n/g, 'newline-gt'],
    [/\)\s*\n\s*&gt;/g, 'paren-gt'],
    [/"\s*\n\s*&gt;/g, 'quote-gt'],
    [/'[^']*'\s*\n\s*&gt;/g, 'squote-gt'],
  ];
  const found = [];
  for (const [re, name] of patterns) {
    const m = t.match(re);
    if (m) found.push(`${name}:${m.length}`);
  }
  if (found.length) {
    hits.push(path.relative(root, f).replace(/\\/g, '/') + ' ' + found.join(','));
  }
}

console.log('files', hits.length);
console.log(hits.join('\n'));
