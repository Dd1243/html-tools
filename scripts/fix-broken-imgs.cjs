/**
 * Repair malformed img tags introduced by previous partial fixes:
 *   <img ... / alt="">  -> <img ... alt="" />
 *   <img ... / >        -> <img ... />
 * Also ensure empty src and missing alt are fixed without breaking slash position.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const TRANSPARENT =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!['node_modules', '.git', 'docs', 'screenshots'].includes(e.name)) walk(p, acc);
    } else if (e.isFile() && e.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

function fixImgTag(full) {
  // extract inside
  const m = full.match(/^<img\b([\s\S]*?)>$/i);
  if (!m) return full;
  let body = m[1];

  // remove stray slash tokens anywhere except final self-close intention
  body = body.replace(/\s*\/\s*(?=alt\s*=)/gi, ' ');
  body = body.replace(/\s+\/\s*$/g, ''); // trailing slash temporarily removed
  body = body.replace(/\s*\/\s+/g, ' '); // slash in middle

  // empty src
  body = body.replace(/\bsrc\s*=\s*(["'])\s*\1/gi, `src=$1${TRANSPARENT}$1`);
  if (!/\bsrc\s*=/i.test(body)) {
    body += ` src="${TRANSPARENT}"`;
  }
  if (!/\balt\s*=/i.test(body)) {
    body += ' alt=""';
  }

  body = body.replace(/\s+/g, ' ').trim();
  return `<img ${body} />`;
}

let changed = 0;
const files = walk(root).filter((f) => {
  const rel = path.relative(root, f).replace(/\\/g, '/');
  return !rel.includes('node_modules/') &&
    !/ByteDanceVerify|baidu_verify|js-playground|code-screenshot|wave-bg/.test(rel);
});

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  let html = original;

  // fix clearly broken patterns first
  html = html.replace(/<img\b[^>]*>/gi, (tag) => {
    if (/\s\/\s*alt\s*=/i.test(tag) || /\/\s*>$/.test(tag) || /\ssrc\s*=\s*["']\s*["']/i.test(tag) || !/\balt\s*=/i.test(tag)) {
      return fixImgTag(tag);
    }
    return tag;
  });

  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    changed += 1;
  }
}

console.log('changed files:', changed);
