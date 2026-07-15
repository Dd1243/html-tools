/**
 * After batch light conversion, many pages still force dark via JS like:
 *   localStorage.getItem("xxx") || "dark"
 *   setAttribute("data-theme", "dark")
 * Fix common defaults to light.
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

const root = path.join(__dirname, '..');
const files = walk(path.join(root, 'tools'));
let changed = 0;
const samples = [];

for (const fp of files) {
  let html = fs.readFileSync(fp, 'utf8');
  // Only pages we converted (have batch-light-center or light root)
  if (!/batch-light-center|--bg-deep:\s*#f7f8fb/i.test(html)) continue;

  const before = html;

  // localStorage.getItem("...") || "dark"
  html = html.replace(
    /localStorage\.getItem\(\s*(['"][^'"]+['"])\s*\)\s*\|\|\s*['"]dark['"]/g,
    'localStorage.getItem($1) || "light"'
  );

  // const saved = ... "dark"
  html = html.replace(
    /(const\s+\w+\s*=\s*localStorage\.getItem\([^)]+\)\s*\|\|\s*)["']dark["']/g,
    '$1"light"'
  );

  // setAttribute("data-theme", "dark") as initial default (careful: only when assigning savedTheme default)
  // document.documentElement.setAttribute("data-theme", "dark") alone at init - too risky globally
  // Fix body/documentElement set from savedTheme with dark default already handled above

  // If script sets theme to dark when missing:
  html = html.replace(
    /if\s*\(\s*!?\s*localStorage\.getItem\((['"][^'"]+['"])\)\s*\)\s*\{\s*[^}]*setAttribute\(\s*['"]data-theme['"]\s*,\s*['"]dark['"]\s*\)/g,
    (m) => m.replace(/['"]dark['"]/, '"light"')
  );

  // Prefer removeAttribute for light default patterns like setAttribute(..., savedTheme) where saved is light
  // Fix qr-theme style: document.body.setAttribute("data-theme", savedTheme);
  // When light, better use removeAttribute for our CSS which uses :root as light and [data-theme=dark] for dark
  // Patch common saved theme application blocks:
  html = html.replace(
    /const\s+(savedTheme|theme|currentTheme)\s*=\s*localStorage\.getItem\((['"][^'"]+['"])\)\s*\|\|\s*["']light["']\s*;\s*document\.(body|documentElement)\.setAttribute\(\s*["']data-theme["']\s*,\s*\1\s*\)\s*;/g,
    (full, varName, key, target) => {
      return `const ${varName} = localStorage.getItem(${key}) || "light";
      if (${varName} === "dark") {
        document.${target}.setAttribute("data-theme", "dark");
      } else {
        document.${target}.removeAttribute("data-theme");
      }`;
    }
  );

  // Also handle document.documentElement / body separately with slightly different spacing
  html = html.replace(
    /const\s+(savedTheme|theme)\s*=\s*localStorage\.getItem\((['"][^'"]+['"])\)\s*\|\|\s*["']light["']\s*;\s*\n\s*document\.body\.setAttribute\(\s*["']data-theme["']\s*,\s*\1\s*\)\s*;/g,
    `const $1 = localStorage.getItem($2) || "light";
      if ($1 === "dark") {
        document.body.setAttribute("data-theme", "dark");
      } else {
        document.body.removeAttribute("data-theme");
      }`
  );

  // Toggle buttons that compare body data-theme === "light" as dark default logic - keep working

  if (html !== before) {
    fs.writeFileSync(fp, html, 'utf8');
    changed++;
    if (samples.length < 20) samples.push(path.relative(root, fp).replace(/\\/g, '/'));
  }
}

// specific verify qrcode-batch
const qb = fs.readFileSync(path.join(root, 'tools/generator/qrcode-batch.html'), 'utf8');
console.log(
  JSON.stringify(
    {
      changed,
      samples,
      qrcodeBatch: {
        defaultLight: /localStorage\.getItem\(["']qr-theme["']\)\s*\|\|\s*["']light["']/.test(qb),
        stillDarkDefault: /\|\|\s*["']dark["']/.test(qb),
        hasCenter: /batch-light-center/.test(qb),
        lightRoot: /--bg-deep:\s*#f7f8fb/.test(qb),
      },
    },
    null,
    2
  )
);
