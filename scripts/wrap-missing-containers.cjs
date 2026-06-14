const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TOOLS_DIR = path.join(ROOT, 'tools');

function getHtmlFiles(dir) {
  const files = [];
  const pending = [dir];

  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) pending.push(entryPath);
      else if (entry.isFile() && entry.name.endsWith('.html')) files.push(entryPath);
    }
  }

  return files;
}

function hasExactClass(html, className) {
  const classAttrs = html.matchAll(/\bclass=["']([^"']*)["']/g);
  for (const match of classAttrs) {
    if (match[1].split(/\s+/).includes(className)) return true;
  }
  return false;
}

let updated = 0;

for (const filePath of getHtmlFiles(TOOLS_DIR)) {
  const html = fs.readFileSync(filePath, 'utf8');
  if (!/\.container\s*\{/.test(html)) continue;
  if (hasExactClass(html, 'container')) continue;
  if (!/<body\b[^>]*>/i.test(html) || !/<\/body>/i.test(html)) continue;

  let next = html.replace(/(<body\b[^>]*>)/i, '$1\n    <div class="container">');
  next = next.replace(/<\/body>/i, '    </div>\n  </body>');

  if (next !== html) {
    fs.writeFileSync(filePath, next);
    updated++;
    console.log(path.relative(ROOT, filePath));
  }
}

console.log(`Updated ${updated} page containers.`);
