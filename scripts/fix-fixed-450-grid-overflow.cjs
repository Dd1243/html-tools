/**
 * Fix tool pages with rigid `grid-template-columns: 450px 1fr`
 * that can overflow container on medium widths.
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

const root = path.join(__dirname, '..');
const files = walk(path.join(root, 'tools'));
const changed = [];

for (const fp of files) {
  let html = fs.readFileSync(fp, 'utf8');
  if (!/grid-template-columns:\s*450px\s+1fr/.test(html)) continue;
  const before = html;

  html = html.replace(
    /grid-template-columns:\s*450px\s+1fr/g,
    'grid-template-columns: minmax(280px, 420px) minmax(0, 1fr)'
  );

  // Ensure container doesn't force horizontal spill when present
  if (/\.container\s*\{/.test(html) && !/\.container\s*\{[^}]*overflow-x\s*:/.test(html)) {
    html = html.replace(
      /\.container\s*\{([^}]*)\}/,
      (full, body) => {
        let b = body;
        if (!/width\s*:/.test(b)) b += '\n        width: 100%;';
        if (!/overflow-x\s*:/.test(b)) b += '\n        overflow-x: clip;';
        return `.container {${b}\n      }`;
      }
    );
  }

  // min-width:0 for common panels
  const panelFix = `
      .config-panel,
      .output-panel,
      .code-card,
      .preview-pane,
      .main-grid > *,
      .tool-layout > * {
        min-width: 0;
        max-width: 100%;
      }
      pre {
        max-width: 100%;
        overflow-x: auto;
      }
`;
  if (!/minmax\(280px,\s*420px\)/.test(before) || !/config-panel,\s*\n\s*\.output-panel/.test(html)) {
    if (/<\/style>/i.test(html) && !/config-panel,\s*\n\s*\.output-panel,\s*\n\s*\.code-card/.test(html)) {
      html = html.replace(/<\/style>/i, `${panelFix}    </style>`);
    }
  }

  if (html !== before) {
    fs.writeFileSync(fp, html, 'utf8');
    changed.push(path.relative(root, fp).replace(/\\/g, '/'));
  }
}

console.log(JSON.stringify({ changedCount: changed.length, changed }, null, 2));
