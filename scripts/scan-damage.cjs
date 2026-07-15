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
const files = walk(root);
const issues = {
  brokenTextareaClose: [],
  brokenTagEntity: [],
  brokenAttrGt: [],
  brokenSlashAlt: [],
};

for (const file of files) {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  const t = fs.readFileSync(file, 'utf8');
  if (/<\/textarea\s*\r?\n\s*&gt;/i.test(t) || /<\/textarea\s*$/m.test(t) && /<\/textarea[\s\S]{0,20}&gt;/i.test(t)) {
    issues.brokenTextareaClose.push(rel);
  }
  if (/<[a-zA-Z][\w:-]*&gt;|<\/[a-zA-Z][\w:-]*&gt;/.test(t)) {
    issues.brokenTagEntity.push(rel);
  }
  if (/("[^"]*"|'[^']*')&gt;/.test(t)) {
    // may be intentional in text; still list
    const m = t.match(/.{0,40}("[^"]*"|'[^']*')&gt;.{0,20}/g) || [];
    if (m.some((x) => /class=|id=|style=|placeholder=|src=|href=/.test(x))) {
      issues.brokenAttrGt.push(rel);
    }
  }
  if (/\/\s*alt\s*=/.test(t)) issues.brokenSlashAlt.push(rel);
}

for (const [k, v] of Object.entries(issues)) {
  console.log(k, v.length);
  if (v.length) console.log(v.slice(0, 30).join('\n'));
  console.log('---');
}
