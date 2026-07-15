/**
 * Convert dark cyberpunk-style tool pages (qrcode-batch family) to:
 * 1) white/light by default
 * 2) centered tool content
 *
 * Detects pages whose :root defines --bg-deep: #0a0a0f (or very similar dark palette).
 * Swaps palette so light is default and dark becomes [data-theme="dark"].
 * Centers .container / main tool wrappers.
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

const LIGHT_ROOT = `      :root {
        color-scheme: light;
        --primary-color: #0891b2;
        --primary-hover: #0e7490;
        --secondary-color: #db2777;
        --bg-deep: #f7f8fb;
        --bg-surface: #ffffff;
        --bg-card: #ffffff;
        --bg-input: #f8fafc;
        --text-primary: #0f172a;
        --text-secondary: #475569;
        --text-muted: #94a3b8;
        --border-subtle: #e2e8f0;
        --border-strong: #cbd5e1;
        --accent-cyan: #0891b2;
        --accent-green: #059669;
        --accent-red: #dc2626;
        --accent-magenta: #db2777;
        --accent-yellow: #d97706;
        --accent-blue: #2563eb;
        --accent-purple: #7c3aed;
        --radius-sm: 6px;
        --radius-md: 10px;
        --radius-lg: 14px;
        --shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
      }

      [data-theme="dark"] {
        color-scheme: dark;
        --primary-color: #00d9ff;
        --primary-hover: #00b8d4;
        --secondary-color: #e94560;
        --bg-deep: #0a0a0f;
        --bg-surface: #12121a;
        --bg-card: #1a1a24;
        --bg-input: #0e0e14;
        --text-primary: #e8e8ed;
        --text-secondary: #8888a0;
        --text-muted: #55556a;
        --border-subtle: #2a2a3a;
        --border-strong: #3a3a4a;
        --accent-cyan: #00f5d4;
        --accent-green: #10b981;
        --accent-red: #f43f5e;
        --accent-magenta: #f72585;
        --accent-yellow: #fbbf24;
        --accent-blue: #4cc9f0;
        --accent-purple: #7b2cbf;
        --shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      }`;

const CENTER_CSS = `
      /* batch-light-center */
      body {
        background: linear-gradient(180deg, #ffffff 0%, var(--bg-deep) 220px) !important;
      }
      [data-theme="dark"] body {
        background: var(--bg-deep) !important;
      }
      .container,
      .main-container,
      .page-wrapper,
      .tool-container,
      .app-container {
        max-width: min(1080px, 100%) !important;
        margin-left: auto !important;
        margin-right: auto !important;
        width: 100% !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
      }
      .container > *,
      .main-container > *,
      .page-wrapper > *,
      .tool-container > *,
      .app-container > * {
        width: min(100%, 1000px);
        max-width: 100%;
      }
      .tool-layout,
      .main-grid,
      .tool-grid,
      .main-layout,
      .workspace,
      .editor-layout {
        width: min(100%, 1000px) !important;
        margin-left: auto !important;
        margin-right: auto !important;
        justify-content: center;
      }
      header,
      .header,
      .header-section {
        text-align: center;
        width: min(100%, 760px);
        margin-left: auto;
        margin-right: auto;
      }
`;

function isDarkDefaultPage(html) {
  // Dark cyberpunk palette in :root (not only in [data-theme=dark])
  // Match :root { ... --bg-deep: #0a0a0f ... }
  const rootMatch = html.match(/:root\s*\{([\s\S]*?)\}/);
  if (!rootMatch) return false;
  const root = rootMatch[1];
  const hasDeep =
    /--bg-deep\s*:\s*#0a0a0f/i.test(root) ||
    /--bg-deep\s*:\s*#0b0b12/i.test(root) ||
    /--bg-deep\s*:\s*#0f0f1[0-9a-f]/i.test(root) ||
    /--bg-deep\s*:\s*#0a0a12/i.test(root);
  const hasCard =
    /--bg-card\s*:\s*#1a1a24/i.test(root) ||
    /--bg-surface\s*:\s*#12121a/i.test(root) ||
    /--bg-card\s*:\s*#1[0-9a-f]{5}/i.test(root);
  // already light default?
  if (/color-scheme\s*:\s*light/i.test(root) && /--bg-deep\s*:\s*#f/i.test(root)) return false;
  return hasDeep && hasCard;
}

function stripOldThemeBlocks(css) {
  // Remove first :root { ... } and [data-theme="light"] { ... } near top of style
  let out = css;
  // remove :root block (first only, non-greedy with brace matching simplified)
  out = out.replace(/:root\s*\{[\s\S]*?\n\s*\}/, '/*__ROOT_PLACEHOLDER__*/');
  // remove [data-theme="light"] block if present
  out = out.replace(/\[data-theme=["']light["']\]\s*\{[\s\S]*?\n\s*\}/, '');
  // remove old [data-theme="dark"] if we're rewriting fully - keep only after inject
  // Actually keep existing dark? We'll inject new dark after root
  out = out.replace(/\[data-theme=["']dark["']\]\s*\{[\s\S]*?\n\s*\}/, '');
  return out;
}

function processFile(fp) {
  let html = fs.readFileSync(fp, 'utf8');
  if (!isDarkDefaultPage(html)) return { changed: false, reason: 'not-dark-default' };

  const before = html;
  // Only touch first <style> block for theme vars (usually the main one)
  let styleCount = 0;
  html = html.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/i, (full, attrs, css) => {
    styleCount++;
    if (styleCount > 1) return full;
    if (!/:root\s*\{/.test(css)) return full;

    let next = stripOldThemeBlocks(css);
    if (next.includes('/*__ROOT_PLACEHOLDER__*/')) {
      next = next.replace('/*__ROOT_PLACEHOLDER__*/', LIGHT_ROOT);
    } else {
      next = LIGHT_ROOT + '\n' + next;
    }

    // inject center CSS once
    if (!/batch-light-center/.test(next)) {
      next = next + '\n' + CENTER_CSS;
    }

    return `<style${attrs}>${next}</style>`;
  });

  // body background soft white gradient if inline not covered
  // Prefer not forcing data-theme attribute on html
  html = html.replace(/<html([^>]*)\sdata-theme=["']dark["']([^>]*)>/i, '<html$1$2>');
  html = html.replace(/<html([^>]*)\sdata-theme=["']light["']([^>]*)>/i, '<html$1$2>');

  // Theme toggle scripts that set default dark -> leave as-is but ensure light default if they set data-theme
  // Soft rewrite common pattern: if no theme saved, use light
  html = html.replace(
    /if\s*\(\s*localStorage\.getItem\(\s*["']theme["']\s*\)\s*\)\s*\{\s*document\.documentElement\.setAttribute\(\s*["']data-theme["']\s*,\s*localStorage\.getItem\(\s*["']theme["']\s*\)\s*\);\s*\}/g,
    `const __savedTheme = localStorage.getItem("theme");
      if (__savedTheme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }`
  );

  if (html === before) return { changed: false, reason: 'no-op' };
  if (html.length < before.length * 0.85) return { changed: false, reason: 'shrink-guard' };
  if (!/<body[\s\S]*<\/body>/i.test(html)) return { changed: false, reason: 'body-broken' };

  fs.writeFileSync(fp, html, 'utf8');
  return { changed: true };
}

const root = path.join(__dirname, '..');
const files = walk(path.join(root, 'tools'));
const changed = [];
const skipped = {};
for (const fp of files) {
  const r = processFile(fp);
  const rel = path.relative(root, fp).replace(/\\/g, '/');
  if (r.changed) changed.push(rel);
  else skipped[r.reason] = (skipped[r.reason] || 0) + 1;
}

// verify qrcode-batch
const sample = fs.readFileSync(path.join(root, 'tools/generator/qrcode-batch.html'), 'utf8');
const rootBlock = (sample.match(/:root\s*\{([\s\S]*?)\}/) || [,''])[1];
console.log(
  JSON.stringify(
    {
      changedCount: changed.length,
      samples: changed.slice(0, 40),
      skipped,
      qrcodeBatch: {
        lightRoot: /--bg-deep\s*:\s*#f7f8fb/i.test(rootBlock),
        hasCenter: /batch-light-center/.test(sample),
        darkOptional: /\[data-theme=["']dark["']\]/.test(sample),
      },
    },
    null,
    2
  )
);
