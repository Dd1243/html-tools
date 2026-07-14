/**
 * Remove high-confidence orphan </div> left after SEO content deletion.
 * Pattern:
 *   <!-- SEO 内容 --> / <!-- 长文 SEO 内容 -->
 *   </div>
 *   </main>
 *
 * Also removes a bare </div> immediately before </main> when a div-tag stack
 * shows that close has no matching open tag.
 */
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

function isOrphanCloseBeforeMain(html) {
  // Find </div> ... </main> candidates and verify with stack up to that </div>
  const candidates = [];
  const re = /<\/div>\s*<\/main>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    candidates.push(m.index);
  }
  if (candidates.length === 0) return [];

  // Build stack of div opens using original indices, ignore script/style ranges
  const ignoreRanges = [];
  const blockRe = /<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi;
  let b;
  while ((b = blockRe.exec(html)) !== null) {
    ignoreRanges.push([b.index, b.index + b[0].length]);
  }
  const inIgnore = (i) => ignoreRanges.some(([s, e]) => i >= s && i < e);

  const results = [];
  for (const closeIndex of candidates) {
    const stack = [];
    const tagRe = /<\/?div\b[^>]*>/gi;
    let t;
    while ((t = tagRe.exec(html)) !== null) {
      if (t.index >= closeIndex) break;
      if (inIgnore(t.index)) continue;
      const tag = t[0];
      if (/^<\//.test(tag)) {
        if (stack.length > 0) stack.pop();
      } else if (!/\/>$/.test(tag)) {
        stack.push(t.index);
      }
    }
    if (stack.length === 0) {
      results.push(closeIndex);
    }
  }
  return results;
}

const root = path.join(__dirname, '..');
const files = walk(path.join(root, 'tools'));
let fixedFiles = 0;
let removed = 0;
const changed = [];

for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');
  const original = html;

  // 1) SEO comment leftover pattern
  html = html.replace(
    /(<!--\s*(?:长文\s*)?SEO\s*内容\s*-->)\s*<\/div>(\s*<\/main>)/gi,
    '$1$2'
  );

  // 2) Orphan </div> immediately before </main>
  let guard = 0;
  while (guard < 10) {
    guard += 1;
    const orphans = isOrphanCloseBeforeMain(html);
    if (orphans.length === 0) break;
    // remove from the end to keep indices stable
    const pos = orphans[orphans.length - 1];
    const end = html.indexOf('>', pos);
    if (end === -1) break;
    html = html.slice(0, pos) + html.slice(end + 1);
    removed += 1;
  }

  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    fixedFiles += 1;
    changed.push(path.relative(root, file).replace(/\\/g, '/'));
  }
}

console.log('fixed files:', fixedFiles);
console.log('removed orphan closes:', removed);
console.log(changed.join('\n'));
