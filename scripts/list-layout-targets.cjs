const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (name.endsWith('.html')) acc.push(p);
  }
  return acc;
}
const files = walk(path.join(root, 'tools'));
const targets = [];
for (const fp of files) {
  const html = fs.readFileSync(fp, 'utf8');
  if (/<main\s+class="container"/.test(html) && !/class="tool-section"/.test(html)) {
    targets.push(path.relative(root, fp).replace(/\\/g, '/'));
  }
}
console.log(targets.join('\n'));
console.log('TOTAL', targets.length);
