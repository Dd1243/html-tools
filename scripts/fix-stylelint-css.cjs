/**
 * Fix known Stylelint CSS errors in tool HTML pages.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const fixes = [];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}
function write(rel, content) {
  fs.writeFileSync(path.join(root, rel), content, 'utf8');
  fixes.push(rel);
}

// 1) id-card-validator: remove orphan + duplicate info-label/value fragments
{
  const rel = 'tools/life/id-card-validator.html';
  let html = read(rel);
  html = html.replace(
    /\.info-value \{\s*font-size: 1\.25rem;\s*font-weight: 600;\s*color: var\(--accent-cyan\);\s*font-family: var\(--font-mono\);\s*\}\s*font-size: 0\.85rem;\s*color: var\(--color-text-secondary\);\s*margin-bottom: 0\.5rem;\s*\}\s*\.info-value \{\s*font-size: 1\.1rem;\s*font-weight: 600;\s*color: var\(--color-text-primary\);\s*\}/,
    `.info-value {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--accent-cyan);
        font-family: var(--font-mono);
      }`
  );
  write(rel, html);
}

// 2) age-diff-calc: keep gradient background only
{
  const rel = 'tools/calculator/age-diff-calc.html';
  let html = read(rel);
  html = html.replace(
    /\.result-summary-card \{\s*background: var\(--bg-card\);\s*border: 1px solid var\(--border-color\);\s*border-radius: var\(--radius-lg\);\s*padding: 32px;\s*text-align: center;\s*margin-bottom: 24px;\s*background: linear-gradient\(180deg, var\(--bg-card\) 0%, var\(--bg-input\) 100%\);\s*\}/,
    `.result-summary-card {
        background: linear-gradient(180deg, var(--bg-card) 0%, var(--bg-input) 100%);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 32px;
        text-align: center;
        margin-bottom: 24px;
      }`
  );
  write(rel, html);
}

// 3) aspect-ratio-calculator: keep final border:none intent, drop first border
{
  const rel = 'tools/calculator/aspect-ratio-calculator.html';
  let html = read(rel);
  html = html.replace(
    /\.preset-item \{\s*display: flex;\s*flex-direction: column;\s*padding: 10px;\s*background: var\(--bg-input\);\s*border: 1px solid var\(--border-color\);\s*border-radius: var\(--radius-md\);\s*cursor: pointer;\s*transition: all 0\.2s;\s*text-align: left;\s*border: none;\s*\}/,
    `.preset-item {
        display: flex;
        flex-direction: column;
        padding: 10px;
        background: var(--bg-input);
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all 0.2s;
        text-align: left;
      }`
  );
  write(rel, html);
}

// 4) design tools: display:block then display:flex -> keep flex only
const designFiles = [
  'tools/design/blob-generator.html',
  'tools/design/button-generator.html',
  'tools/design/card-generator.html',
  'tools/design/css-button-generator.html',
  'tools/design/css-clip-path-generator.html',
  'tools/design/css-transform-generator.html',
  'tools/design/font-preview.html',
  'tools/design/loader-generator.html',
  'tools/design/palette-generator.html',
  'tools/design/pattern-generator.html',
  'tools/design/scrollbar-generator.html',
  'tools/design/svg-path-editor.html',
  'tools/design/text-gradient-generator.html',
  'tools/design/triangle-generator.html',
  'tools/design/wave-generator.html',
];
for (const rel of designFiles) {
  if (!fs.existsSync(path.join(root, rel))) continue;
  let html = read(rel);
  const next = html.replace(
    /\.control-label \{\s*display: block;\s*font-family: var\(--font-mono\);\s*font-size: 0\.9rem;\s*color: var\(--text-secondary\);\s*margin-bottom: 8px;\s*display: flex;\s*justify-content: space-between;\s*\}/g,
    `.control-label {
        display: flex;
        font-family: var(--font-mono);
        font-size: 0.9rem;
        color: var(--text-secondary);
        margin-bottom: 8px;
        justify-content: space-between;
      }`
  );
  // broader fallback
  const next2 = next.replace(
    /(display:\s*block;\s*(?:font-family:[^;]+;\s*)?(?:font-size:[^;]+;\s*)?(?:color:[^;]+;\s*)?(?:margin-bottom:[^;]+;\s*)?)display:\s*flex;/g,
    (m) => m.replace(/display:\s*block;\s*/, '')
  );
  if (next2 !== html) write(rel, next2);
}

// 5) empty dynamic style tags: add harmless placeholder rule
const emptyStyles = [
  ['tools/design/button-generator.html', 'dynamic-btn-css'],
  ['tools/design/loader-generator.html', 'dynamic-loader-css'],
  ['tools/design/scrollbar-generator.html', 'dynamic-scrollbar'],
];
for (const [rel, id] of emptyStyles) {
  if (!fs.existsSync(path.join(root, rel))) continue;
  let html = read(rel);
  const re = new RegExp(`<style id="${id}"></style>`, 'g');
  const next = html.replace(
    re,
    `<style id="${id}">/* runtime-injected styles */\n      #_${id}_mount { display: none; }\n    </style>`
  );
  if (next !== html) write(rel, next);
}

// 6) education padding shorthand overrides
{
  const rel = 'tools/education/binary-tree.html';
  let html = read(rel);
  html = html.replace(
    /\.article-section \{\s*margin-top: 40px;\s*border-top: 1px solid var\(--border-color\);\s*padding-top: 30px;\s*background: #fff;\s*padding: 40px;\s*border-radius: var\(--radius\);\s*box-shadow: var\(--shadow\);\s*\}/,
    `.article-section {
        margin-top: 40px;
        border-top: 1px solid var(--border-color);
        background: #fff;
        padding: 40px;
        border-radius: var(--radius);
        box-shadow: var(--shadow);
      }`
  );
  write(rel, html);
}
{
  const rel = 'tools/education/grade-calculator.html';
  let html = read(rel);
  html = html.replace(
    /\.target-section \{\s*margin-top: 30px;\s*padding-top: 25px;\s*border-top: 1px solid var\(--border-color\);\s*background: #fdfdfd;\s*padding: 20px;\s*border-radius: 8px;\s*\}/,
    `.target-section {
        margin-top: 30px;
        border-top: 1px solid var(--border-color);
        background: #fdfdfd;
        padding: 20px;
        border-radius: 8px;
      }`
  );
  write(rel, html);
}

// 7) unit-circle duplicate background
{
  const rel = 'tools/education/unit-circle.html';
  let html = read(rel);
  html = html.replace(
    /\.theme-toggle \{\s*background: none;\s*border: 1px solid var\(--border-subtle\);\s*color: var\(--text-primary\);\s*width: 40px;\s*height: 40px;\s*border-radius: 50%;\s*cursor: pointer;\s*display: flex;\s*align-items: center;\s*justify-content: center;\s*font-size: 1\.2rem;\s*transition: all 0\.2s;\s*background: var\(--bg-card\);\s*\}/,
    `.theme-toggle {
        background: var(--bg-card);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        transition: all 0.2s;
      }`
  );
  write(rel, html);
}

// 8) rent-vs-buy duplicate font-size
{
  const rel = 'tools/real-estate/rent-vs-buy.html';
  let html = read(rel);
  html = html.replace(
    /h1 \{\s*font-size: 3rem;\s*font-size: 3rem;/g,
    'h1 {\n            font-size: 3rem;'
  );
  write(rel, html);
}

console.log('fixed files:', [...new Set(fixes)].length);
console.log([...new Set(fixes)].join('\n'));
