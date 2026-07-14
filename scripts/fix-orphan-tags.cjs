const fs = require('fs');
const path = require('path');

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', 'screenshots', 'docs'].includes(entry.name)) {
        walk(full, acc);
      }
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      acc.push(full);
    }
  }
  return acc;
}

const root = path.join(__dirname, '..');
const files = walk(path.join(root, 'tools'));
let styleDivFixed = 0;
let mainFixed = 0;
const changed = [];

for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const original = text;

  // High-confidence: trailing related-links style block ends with orphan </div>
  if (/<\/style>\s*<\/div>\s*<\/body>/i.test(text)) {
    text = text.replace(/<\/style>\s*<\/div>\s*<\/body>/gi, '</style>\n  </body>');
    styleDivFixed += 1;
  }

  // High-confidence: orphan </main> with no <main> open tag
  const opens = (text.match(/<main\b/gi) || []).length;
  const closes = (text.match(/<\/main>/gi) || []).length;
  if (closes > opens && opens === 0) {
    // Remove only standalone </main> lines
    text = text.replace(/^[ \t]*<\/main>\s*\r?\n/gim, '');
    mainFixed += 1;
  }

  if (text !== original) {
    fs.writeFileSync(file, text, 'utf8');
    changed.push(path.relative(root, file));
  }
}

console.log('style-div fixed:', styleDivFixed);
console.log('orphan-main fixed:', mainFixed);
console.log('changed files:', changed.length);
console.log(changed.join('\n'));
