/**
 * Move misplaced <header class="header"> out of multi-column layout grids.
 * Pattern (broken):
 *   <main class="main-layout|main-grid|tool-grid|...">
 *     <header class="header">...</header>
 *     ...columns...
 *   </main>
 *
 * Fixed:
 *   <header class="header">...</header>
 *   <main class="...">...columns...</main>
 *
 * Also handle grid containers that put header as first track without spanning full width.
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

function stripScriptsStyles(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, (m) => m.replace(/./g, ' '))
    .replace(/<style\b[\s\S]*?<\/style>/gi, (m) => m.replace(/./g, ' '));
}

function extractHeaderBlock(html, startIdx) {
  // startIdx points at <header
  if (!/^<header\b/i.test(html.slice(startIdx, startIdx + 20))) return null;
  const openEnd = html.indexOf('>', startIdx);
  if (openEnd < 0) return null;
  // find matching </header>
  const close = html.indexOf('</header>', openEnd);
  if (close < 0) return null;
  const end = close + '</header>'.length;
  return { start: startIdx, end, html: html.slice(startIdx, end) };
}

function processFile(fp) {
  let html = fs.readFileSync(fp, 'utf8');
  const before = html;
  let fixes = 0;

  // Target layout class names commonly used for multi-column tool UIs
  const layoutClassRe =
    /<(main|div|section)\b([^>]*class=["'][^"']*\b(main-layout|main-grid|tool-grid|tool-layout)\b[^"']*["'][^>]*)>/gi;

  let m;
  const matches = [];
  while ((m = layoutClassRe.exec(html)) !== null) {
    matches.push({
      index: m.index,
      full: m[0],
      tag: m[1],
      openLen: m[0].length,
    });
  }

  // process from end to keep offsets stable
  for (let i = matches.length - 1; i >= 0; i--) {
    const item = matches[i];
    const afterOpen = html.slice(item.index + item.openLen);
    // skip comments/whitespace
    const lead = afterOpen.match(/^(\s|<!--[\s\S]*?-->)*/);
    const leadLen = lead ? lead[0].length : 0;
    const headerStartRel = leadLen;
    const absHeaderStart = item.index + item.openLen + headerStartRel;
    if (!/^<header\b/i.test(html.slice(absHeaderStart, absHeaderStart + 20))) continue;

    const header = extractHeaderBlock(html, absHeaderStart);
    if (!header) continue;

    // Remove header from inside layout and insert before layout open tag
    const headerHtml = header.html;
    // preserve one newline spacing
    html =
      html.slice(0, item.index) +
      headerHtml +
      '\n\n      ' +
      html.slice(item.index, header.start) +
      html.slice(header.end);
    // cleanup possible double blank inside
    html = html.replace(
      new RegExp(
        `(<${item.tag}\\b[^>]*class=["'][^"']*\\b(?:main-layout|main-grid|tool-grid|tool-layout)\\b[^"']*["'][^>]*>)\\s*\\n\\s*\\n`,
        'i'
      ),
      '$1\n'
    );
    fixes++;
  }

  // Special-case: .container is itself a multi-column grid AND first child is header
  // Fix by making header span full width via CSS if missing, and/or move header outside if structure is simple.
  const css = (html.match(/<style\b[\s\S]*?<\/style>/gi) || []).join('\n');
  const containerIsMultiGrid =
    /\.container\s*\{[^}]*display\s*:\s*grid[^}]*grid-template-columns\s*:[^;}]+/i.test(css) &&
    (css.match(/\.container\s*\{[^}]*grid-template-columns\s*:([^;}]+)/i) || [,''])[1].split(/\s+/).filter(Boolean).length >= 2;

  if (containerIsMultiGrid) {
    // ensure header spans full width
    if (!/\.header\s*\{[^}]*grid-column\s*:\s*1\s*\/\s*-1/i.test(css) &&
        !/\.container\s*>\s*header\s*\{[^}]*grid-column/i.test(css)) {
      if (/<\/style>/i.test(html)) {
        html = html.replace(
          /<\/style>/i,
          `
      /* keep page header full-width above multi-column container grid */
      .container > .header,
      .container > header.header {
        grid-column: 1 / -1;
      }
    </style>`
        );
        fixes++;
      }
    }
  }

  if (html === before) return { fixed: false, fixes: 0 };
  if (html.length < before.length * 0.9) return { fixed: false, fixes: 0, aborted: 'shrink' };
  if (!/<body[\s\S]*<\/body>/i.test(html)) return { fixed: false, fixes: 0, aborted: 'no-body' };

  fs.writeFileSync(fp, html, 'utf8');
  return { fixed: true, fixes };
}

const root = path.join(__dirname, '..');
const files = walk(path.join(root, 'tools'));
let changed = 0;
const samples = [];
const aborted = [];

for (const fp of files) {
  const r = processFile(fp);
  if (r.aborted) aborted.push({ file: path.relative(root, fp).replace(/\\/g, '/'), reason: r.aborted });
  if (r.fixed) {
    changed++;
    if (samples.length < 40) {
      samples.push(path.relative(root, fp).replace(/\\/g, '/') + ` fixes=${r.fixes}`);
    }
  }
}

// re-scan residual using the same scanner logic inline
const residual = [];
for (const fp of files) {
  const raw = fs.readFileSync(fp, 'utf8');
  const rel = path.relative(root, fp).replace(/\\/g, '/');
  const body = stripScriptsStyles(raw);
  for (const cls of ['main-layout', 'main-grid', 'tool-grid', 'tool-layout']) {
    const re = new RegExp(
      `<(?:main|div|section)\\b[^>]*class=["'][^"']*\\b${cls}\\b[^"']*["'][^>]*>([\\s\\S]{0,300})`,
      'i'
    );
    const om = body.match(re);
    if (!om) continue;
    const head = om[1].replace(/<!--[\s\S]*?-->/g, '').trim();
    if (/^<(header|h1)\b/i.test(head)) residual.push({ rel, cls, first: head.slice(0, 60) });
  }
}

console.log(
  JSON.stringify(
    {
      changed,
      samples,
      aborted,
      residual,
      graphqlOk: !/main-layout">\s*<header/i.test(
        fs.readFileSync(path.join(root, 'tools/dev/graphql-builder.html'), 'utf8')
      ),
    },
    null,
    2
  )
);
