/**
 * Center "相关工具与导航" (related-links-section) on all tool pages.
 * Problem: block often sits outside main container, left-aligned / full-bleed ugly.
 * Fix: shared centered layout styles + optional wrapper class.
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

const CENTER_CSS = `.related-links-section {
          width: min(960px, 92%);
          margin: 40px auto 0;
          padding: 24px 0 8px;
          border-top: 1px solid var(--border-subtle, var(--border-color, #e5e7eb));
          text-align: center;
        }
        .related-links-section h2 {
          margin: 0 0 14px;
          font-size: 1.15rem;
          color: var(--text-primary, inherit);
          text-align: center;
        }
        .related-links-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          align-items: center;
        }
        .related-links-list a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 36px;
          padding: 8px 14px;
          border: 1px solid var(--border-subtle, var(--border-color, #e5e7eb));
          border-radius: var(--radius-md, 8px);
          color: var(--accent-cyan, var(--accent-blue, var(--accent, #2563eb)));
          background: var(--bg-card, rgba(255, 255, 255, 0.04));
          text-decoration: none;
          font-size: 0.92rem;
          line-height: 1.3;
        }
        .related-links-list a:hover {
          border-color: var(--border-strong, currentColor);
          text-decoration: underline;
        }`;

const STYLE_BLOCK_RE =
  /<style>\s*\.related-links-section\s*\{[\s\S]*?\.related-links-list a:hover\s*\{[\s\S]*?\}\s*<\/style>/i;

const files = walk(path.join(root, 'tools')).filter((fp) => {
  const h = fs.readFileSync(fp, 'utf8');
  return h.includes('related-links-section');
});

let updated = 0;
let missingStyle = 0;
const samples = [];

for (const fp of files) {
  let html = fs.readFileSync(fp, 'utf8');
  const before = html;

  if (STYLE_BLOCK_RE.test(html)) {
    html = html.replace(STYLE_BLOCK_RE, `<style>\n        ${CENTER_CSS}\n      </style>`);
  } else if (html.includes('class="related-links-section"') || html.includes("class='related-links-section'")) {
    // inject style after the nav if no style block
    if (!html.includes('.related-links-section')) {
      html = html.replace(
        /(<\/nav>\s*)(?=[\s\S]*related-links|[\s\S]*footer|<footer)/i,
        (m) => {
          // only first related nav close - safer: after related-links-list close
          return m;
        }
      );
      html = html.replace(
        /(<nav class="related-links-section"[\s\S]*?<\/nav>)/i,
        `$1\n      <style>\n        ${CENTER_CSS}\n      </style>`
      );
      missingStyle++;
    } else {
      // has partial styles - replace any related-links-section rule block loosely
      html = html.replace(
        /\.related-links-section\s*\{[\s\S]*?\.related-links-list a:hover\s*\{[^}]*\}/,
        CENTER_CSS
      );
    }
  }

  // Also ensure section isn't stuck left if parent is full width without centering
  // Add a class marker for already-fixed
  if (!html.includes('/* related-links centered */')) {
    html = html.replace(
      /(<style>\s*)(\.related-links-section)/,
      '$1/* related-links centered */\n        $2'
    );
  }

  if (html !== before) {
    fs.writeFileSync(fp, html, 'utf8');
    updated++;
    if (samples.length < 8) samples.push(path.relative(root, fp).replace(/\\/g, '/'));
  }
}

// verify ico-calculator
const ico = fs.readFileSync(path.join(root, 'tools/crypto/ico-calculator.html'), 'utf8');
const ok =
  ico.includes('justify-content: center') &&
  ico.includes('margin: 40px auto 0') &&
  ico.includes('text-align: center') &&
  ico.includes('width: min(960px, 92%)');

console.log(
  JSON.stringify(
    {
      totalWithSection: files.length,
      updated,
      missingStyleInjected: missingStyle,
      samples,
      icoOk: ok,
    },
    null,
    2
  )
);
process.exit(ok && updated > 0 ? 0 : updated === 0 && ok ? 0 : 1);
