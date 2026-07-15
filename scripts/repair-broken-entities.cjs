/**
 * Repair accidental escapes of tag-closing ">" after attributes:
 *   <span class="x"&gt;$10</span>  -> <span class="x">$10</span>
 *   <td&gt;$10</td>                -> <td>$10</td>
 */
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
let changed = 0;

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  let html = original;

  // <tag&gt; / </tag&gt;
  html = html.replace(/<([a-zA-Z][\w:-]*)&gt;/g, '<$1>');
  html = html.replace(/<\/([a-zA-Z][\w:-]*)&gt;/g, '</$1>');

  // attribute-closed then escaped greater-than that should close the tag
  // class="spec-value"&gt;$10 -> class="spec-value">$10
  html = html.replace(/(")&gt;(?=\s*[^<\s=])/g, '$1>');
  html = html.replace(/(')&gt;(?=\s*[^<\s=])/g, '$1>');

  // boolean attr end: <input checked&gt; -> <input checked>
  html = html.replace(/(\s[a-zA-Z_:][\w:.-]*)&gt;/g, '$1>');

  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    changed += 1;
  }
}

console.log('changed files:', changed);
