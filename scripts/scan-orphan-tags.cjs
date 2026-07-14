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

const files = walk(path.join(__dirname, '..', 'tools'));
const styleDivFiles = [];
const orphanMainFiles = [];

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  if (/<\/style>\s*<\/div>\s*<\/body>/i.test(text)) {
    styleDivFiles.push(path.relative(path.join(__dirname, '..'), file));
  }
  const opens = (text.match(/<main\b/gi) || []).length;
  const closes = (text.match(/<\/main>/gi) || []).length;
  if (closes > opens) {
    orphanMainFiles.push({
      file: path.relative(path.join(__dirname, '..'), file),
      opens,
      closes,
    });
  }
}

console.log('style-div-body count:', styleDivFiles.length);
console.log(styleDivFiles.join('\n'));
console.log('---');
console.log('orphan-main count:', orphanMainFiles.length);
for (const item of orphanMainFiles) {
  console.log(`${item.file} opens=${item.opens} closes=${item.closes}`);
}
