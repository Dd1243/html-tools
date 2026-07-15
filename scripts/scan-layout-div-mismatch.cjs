/**
 * Scan tool pages for layout structure issues similar to steganography:
 * - unbalanced div tags
 * - page-wrapper / page-body / container opened but not closed
 * - comment-only closers without </div>
 */
const fs = require('fs');
const path = require('path');

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function count(html, re) {
  return (html.match(re) || []).length;
}

function hasUnclosedWrapper(html, className) {
  const openRe = new RegExp(
    `<div\\b[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>`,
    'gi'
  );
  const opens = count(html, openRe);
  if (!opens) return false;
  // Heuristic: if there's a comment closer without enough closing structure nearby
  const commentClose = new RegExp(`<!--\\s*/${className}\\s*-->`, 'i').test(html);
  // crude: if open count > 0 and after last open the remaining close divs are insufficient overall
  return { opens, commentClose };
}

const issues = [];
for (const fp of walk(path.join(__dirname, '..', 'tools'))) {
  const html = fs.readFileSync(fp, 'utf8');
  const rel = path.relative(path.join(__dirname, '..'), fp).replace(/\\/g, '/');
  const open = count(html, /<div\b/gi);
  const close = count(html, /<\/div>/gi);
  const diff = open - close;

  const wrappers = ['page-wrapper', 'page-body', 'main-content', 'container', 'page-shell'];
  const wrapperInfo = {};
  for (const w of wrappers) {
    const openW = count(
      html,
      new RegExp(`<div\\b[^>]*class=["'][^"']*\\b${w}\\b[^"']*["'][^>]*>`, 'gi')
    );
    const comment = new RegExp(`<!--\\s*/${w}\\s*-->`, 'i').test(html);
    if (openW || comment) wrapperInfo[w] = { openW, comment };
  }

  // detect comment closer without preceding close likely missing
  const commentOnlyClose =
    /<!--\s*\/page-wrapper\s*-->/i.test(html) &&
    !/<\/div>\s*<!--\s*\/page-wrapper\s*-->/i.test(html);

  const commentOnlyPageBody =
    /<!--\s*\/page-body\s*-->/i.test(html) &&
    !/<\/div>\s*<!--\s*\/page-body\s*-->/i.test(html);

  const bodyCloseMissing = /<body\b/i.test(html) && !/<\/body>/i.test(html);
  const htmlCloseMissing = /<html\b/i.test(html) && !/<\/html>/i.test(html);

  const bad =
    diff !== 0 ||
    commentOnlyClose ||
    commentOnlyPageBody ||
    bodyCloseMissing ||
    htmlCloseMissing;

  if (bad) {
    issues.push({
      rel,
      diff,
      open,
      close,
      commentOnlyClose,
      commentOnlyPageBody,
      bodyCloseMissing,
      htmlCloseMissing,
      wrapperInfo,
    });
  }
}

issues.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
console.log(
  JSON.stringify(
    {
      issueCount: issues.length,
      issues: issues.slice(0, 80),
    },
    null,
    2
  )
);
