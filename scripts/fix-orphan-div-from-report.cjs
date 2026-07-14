/**
 * Remove only verified orphan closing tags reported by HTMLHint.
 * Uses a div-only stack (script/style ignored). Never rewrites Chinese text.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const reportPath = path.join(root, 'htmlhint-parsed.json');
if (!fs.existsSync(reportPath)) {
  console.error('missing htmlhint-parsed.json, run collect+analyze first');
  process.exit(1);
}

const parsed = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const targets = parsed.filter(
  (e) =>
    e.message.includes('no start tag') &&
    (e.message.includes('</div>') ||
      e.message.includes('</article>') ||
      e.message.includes('</li>'))
);

// group by file
const byFile = new Map();
for (const e of targets) {
  if (!byFile.has(e.file)) byFile.set(e.file, []);
  byFile.get(e.file).push(e);
}

function ignoreRanges(html) {
  const ranges = [];
  const re = /<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    ranges.push([m.index, m.index + m[0].length]);
  }
  return ranges;
}

function inRange(ranges, i) {
  return ranges.some(([s, e]) => i >= s && i < e);
}

function findLineStart(html, lineNum) {
  if (lineNum <= 1) return 0;
  let line = 1;
  for (let i = 0; i < html.length; i++) {
    if (html[i] === '\n') {
      line += 1;
      if (line === lineNum) return i + 1;
    }
  }
  return -1;
}

function isOrphanCloseAt(html, closeIndex, tagName) {
  const ranges = ignoreRanges(html);
  const openRe = new RegExp(`<${tagName}\\b[^>]*>`, 'gi');
  const closeRe = new RegExp(`</${tagName}\\s*>`, 'gi');
  // walk all open/close of this tag before closeIndex
  const events = [];
  let m;
  while ((m = openRe.exec(html)) !== null) {
    if (m.index >= closeIndex) break;
    if (inRange(ranges, m.index)) continue;
    if (/\/>$/.test(m[0])) continue;
    events.push({ type: 'open', index: m.index });
  }
  while ((m = closeRe.exec(html)) !== null) {
    if (m.index >= closeIndex) break;
    if (inRange(ranges, m.index)) continue;
    events.push({ type: 'close', index: m.index });
  }
  events.sort((a, b) => a.index - b.index);
  let depth = 0;
  for (const ev of events) {
    if (ev.type === 'open') depth += 1;
    else if (depth > 0) depth -= 1;
  }
  return depth === 0;
}

let fixedFiles = 0;
let removed = 0;
const changed = [];

for (const [rel, errors] of byFile) {
  // skip design-reference/templates for now when they are encoding-damaged
  // but still fix pure orphan closes there if verified
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  const original = html;

  // process from bottom line to top so indices stay valid
  const sorted = [...errors].sort((a, b) => b.line - a.line);
  for (const err of sorted) {
    const tagMatch = err.message.match(/\[\s*<\/([a-zA-Z0-9-]+)/);
    if (!tagMatch) continue;
    const tag = tagMatch[1].toLowerCase();
    const lineStart = findLineStart(html, err.line);
    if (lineStart < 0) continue;
    const lineEnd = html.indexOf('\n', lineStart);
    const lineText = html.slice(lineStart, lineEnd === -1 ? html.length : lineEnd);
    const closeRe = new RegExp(`</${tag}\\s*>`, 'i');
    const local = lineText.search(closeRe);
    if (local < 0) continue;
    const closeIndex = lineStart + local;
    if (!isOrphanCloseAt(html, closeIndex, tag)) continue;

    // remove the close tag only
    const closeEnd = html.indexOf('>', closeIndex);
    if (closeEnd < 0) continue;
    html = html.slice(0, closeIndex) + html.slice(closeEnd + 1);
    removed += 1;
  }

  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    fixedFiles += 1;
    changed.push(rel);
  }
}

console.log('fixed files:', fixedFiles);
console.log('removed orphan closes:', removed);
console.log(changed.join('\n'));
