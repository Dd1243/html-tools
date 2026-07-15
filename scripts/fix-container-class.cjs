/**
 * Pages that define .container CSS must also render class="container".
 * After layout fix, main.container was replaced by page-shell — add container to page-shell.
 */
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

function hasExactClass(html, className) {
  const classAttrs = html.matchAll(/\bclass=["']([^"']*)["']/g);
  for (const match of classAttrs) {
    if (match[1].split(/\s+/).includes(className)) return true;
  }
  return false;
}

let fixed = 0;
const list = [];
for (const fp of walk(path.join(root, 'tools'))) {
  let html = fs.readFileSync(fp, 'utf8');
  const definesContainer = /\.container\s*\{/.test(html);
  const rendersContainer = hasExactClass(html, 'container');
  if (!definesContainer || rendersContainer) continue;

  const rel = path.relative(root, fp).replace(/\\/g, '/');
  if (html.includes('class="page-shell"')) {
    html = html.replace('class="page-shell"', 'class="page-shell container"');
    fs.writeFileSync(fp, html, 'utf8');
    fixed++;
    list.push(rel);
  } else if (html.includes("class='page-shell'")) {
    html = html.replace("class='page-shell'", "class='page-shell container'");
    fs.writeFileSync(fp, html, 'utf8');
    fixed++;
    list.push(rel);
  } else {
    console.log('SKIP_NO_SHELL', rel);
  }
}

// re-check
let left = 0;
for (const fp of walk(path.join(root, 'tools'))) {
  const html = fs.readFileSync(fp, 'utf8');
  if (/\.container\s*\{/.test(html) && !hasExactClass(html, 'container')) left++;
}

console.log(JSON.stringify({ fixed, left, list }, null, 2));
process.exit(left ? 1 : 0);
