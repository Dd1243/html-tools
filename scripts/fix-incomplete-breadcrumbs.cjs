/**
 * Fix incomplete breadcrumbs that lack category hub middle link.
 * Detect: breadcrumb has home but no /tools/<cat>/ link.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const toolsJson = JSON.parse(fs.readFileSync(path.join(root, 'tools.json'), 'utf8'));
const categories = toolsJson.categories || {};
const catIds = new Set(Object.keys(categories));

const PATH_ALIAS = { pet: 'pets', 'real-estate': 'realestate' };

const BREADCRUMB_CSS = `
/* auto breadcrumb */
.breadcrumb {
  display: flex !important;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  margin: 0 0 16px !important;
  padding: 10px 14px !important;
  border-radius: 12px;
  border: 1px solid var(--border-color, var(--border-subtle, rgba(127,127,127,0.25)));
  background: var(--bg-card, var(--bg-surface, var(--surface, transparent)));
  font-size: 0.85rem;
  line-height: 1.4;
  color: var(--text-secondary, #888);
  list-style: none;
}
.breadcrumb ol {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: center;
  padding: 0;
  margin: 0;
  width: 100%;
}
.breadcrumb li {
  display: flex;
  align-items: center;
  color: var(--text-secondary, #888);
}
.breadcrumb li:not(:last-child)::after {
  content: "›";
  margin-left: 0.45rem;
  color: var(--text-muted, #999);
}
.breadcrumb a {
  color: var(--accent, var(--accent-cyan, var(--accent-primary, #0ea5e9))) !important;
  text-decoration: none;
  font-weight: 500;
}
.breadcrumb a:hover { text-decoration: underline; }
.breadcrumb li:last-child span,
.breadcrumb .current,
.breadcrumb > span:last-child {
  color: var(--text-primary, inherit);
  font-weight: 600;
}
.breadcrumb > span:not(:last-child) {
  color: var(--text-muted, #999);
  margin: 0 2px;
}
`;

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === '.git') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.isFile() && ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function catFromPath(fp) {
  const rel = path.relative(path.join(root, 'tools'), fp).replace(/\\/g, '/');
  const seg = rel.split('/')[0];
  const mapped = PATH_ALIAS[seg] || seg;
  return catIds.has(mapped) ? mapped : null;
}

function catName(id) {
  return (categories[id] && categories[id].name) || id;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function extractTitle(html, fallback) {
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) {
    let t = h1[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    t = t.replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\s]+/u, '').trim() || t;
    if (t) return t.slice(0, 60);
  }
  return fallback;
}

function hasCategoryHubInCrumb(crumbHtml, catId) {
  if (!catId) return false;
  // hub link patterns
  if (crumbHtml.includes(`/tools/${catId}/`)) return true;
  if (crumbHtml.includes(`/tools/${catId}"`)) return true;
  if (crumbHtml.includes(`/tools/${catId}'`)) return true;
  return false;
}

function isIndexHub(fp) {
  return /index\.html$/i.test(fp);
}

function buildToolCrumb(catId, pageTitle) {
  const name = catName(catId);
  return `<nav class="breadcrumb" aria-label="breadcrumb">
        <ol itemscope itemtype="https://schema.org/BreadcrumbList">
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a itemprop="item" href="/"><span itemprop="name">首页</span></a>
            <meta itemprop="position" content="1" />
          </li>
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a itemprop="item" href="/tools/${catId}/"><span itemprop="name">${escapeHtml(name)}</span></a>
            <meta itemprop="position" content="2" />
          </li>
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <span itemprop="name" class="current">${escapeHtml(pageTitle)}</span>
            <meta itemprop="position" content="3" />
          </li>
        </ol>
      </nav>`;
}

function buildHubCrumb(catId) {
  const name = catName(catId);
  return `<nav class="breadcrumb" aria-label="breadcrumb">
        <ol itemscope itemtype="https://schema.org/BreadcrumbList">
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a itemprop="item" href="/"><span itemprop="name">首页</span></a>
            <meta itemprop="position" content="1" />
          </li>
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a itemprop="item" href="/tools-directory"><span itemprop="name">全部工具</span></a>
            <meta itemprop="position" content="2" />
          </li>
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <span itemprop="name" class="current">${escapeHtml(name)}</span>
            <meta itemprop="position" content="3" />
          </li>
        </ol>
      </nav>`;
}

function injectCss(html) {
  if (/\/\* auto breadcrumb \*\//.test(html)) {
    return html.replace(
      /\/\* auto breadcrumb \*\/[\s\S]*?(?=<\/style>)/i,
      BREADCRUMB_CSS + '\n    '
    );
  }
  // strengthen existing weak breadcrumb styles by appending
  if (/<\/style>/i.test(html)) {
    return html.replace('</style>', BREADCRUMB_CSS + '\n    </style>');
  }
  return html.replace('</head>', `<style>${BREADCRUMB_CSS}</style>\n  </head>`);
}

function replaceBreadcrumb(html, crumb) {
  // replace first breadcrumb nav
  if (/<nav[^>]*class=["'][^"']*\bbreadcrumb\b[^"']*["'][^>]*>[\s\S]*?<\/nav>/i.test(html)) {
    return html.replace(
      /<nav[^>]*class=["'][^"']*\bbreadcrumb\b[^"']*["'][^>]*>[\s\S]*?<\/nav>/i,
      crumb
    );
  }
  // aria-label only
  if (/<nav[^>]*aria-label=["']breadcrumb["'][^>]*>[\s\S]*?<\/nav>/i.test(html)) {
    return html.replace(
      /<nav[^>]*aria-label=["']breadcrumb["'][^>]*>[\s\S]*?<\/nav>/i,
      crumb
    );
  }
  return null;
}

const files = walk(path.join(root, 'tools'));
let fixed = 0;
let ok = 0;
let skipped = 0;
const samples = [];
const stillBad = [];

for (const fp of files) {
  let html = fs.readFileSync(fp, 'utf8');
  const rel = path.relative(root, fp).replace(/\\/g, '/');
  const cat = catFromPath(fp);
  if (!cat) {
    skipped++;
    continue;
  }

  const crumbMatch = html.match(
    /<nav[^>]*(?:class=["'][^"']*\bbreadcrumb\b[^"']*["']|aria-label=["']breadcrumb["'])[^>]*>[\s\S]*?<\/nav>/i
  );
  if (!crumbMatch) {
    stillBad.push({ rel, reason: 'no-nav' });
    continue;
  }

  const crumbHtml = crumbMatch[0];
  const isHub = isIndexHub(fp);

  // Hub pages: need tools-directory middle crumb
  if (isHub) {
    if (crumbHtml.includes('tools-directory')) {
      ok++;
      continue;
    }
    let next = replaceBreadcrumb(html, buildHubCrumb(cat));
    if (!next) {
      stillBad.push({ rel, reason: 'replace-fail-hub' });
      continue;
    }
    next = injectCss(next);
    fs.writeFileSync(fp, next, 'utf8');
    fixed++;
    if (samples.length < 20) samples.push(`${rel} hub`);
    continue;
  }

  // Tool pages: must have /tools/<cat>/
  if (hasCategoryHubInCrumb(crumbHtml, cat)) {
    ok++;
    continue;
  }

  // Incomplete: fix structure + ensure visible styles
  const title = extractTitle(html, path.basename(fp, '.html'));
  let next = replaceBreadcrumb(html, buildToolCrumb(cat, title));
  if (!next) {
    stillBad.push({ rel, reason: 'replace-fail' });
    continue;
  }
  next = injectCss(next);
  fs.writeFileSync(fp, next, 'utf8');
  fixed++;
  if (samples.length < 25) samples.push(`${rel} => /tools/${cat}/`);
}

// verify business-card and residual incomplete
const residual = [];
for (const fp of files) {
  const html = fs.readFileSync(fp, 'utf8');
  const cat = catFromPath(fp);
  if (!cat || isIndexHub(fp)) continue;
  const m = html.match(
    /<nav[^>]*(?:class=["'][^"']*\bbreadcrumb\b[^"']*["']|aria-label=["']breadcrumb["'])[^>]*>[\s\S]*?<\/nav>/i
  );
  if (!m) {
    residual.push(path.relative(root, fp).replace(/\\/g, '/') + ' (missing)');
    continue;
  }
  if (!hasCategoryHubInCrumb(m[0], cat)) {
    residual.push(path.relative(root, fp).replace(/\\/g, '/'));
  }
}

// show business-card snippet
const bc = fs.readFileSync(path.join(root, 'tools/generator/business-card.html'), 'utf8');
const bcm = bc.match(/<nav class="breadcrumb"[\s\S]*?<\/nav>/i);

console.log(
  JSON.stringify(
    {
      fixed,
      alreadyOk: ok,
      skipped,
      stillBad,
      residualIncomplete: residual.length,
      residualSamples: residual.slice(0, 20),
      samples,
      businessCard: bcm ? bcm[0].replace(/\s+/g, ' ').slice(0, 350) : 'NO',
    },
    null,
    2
  )
);

if (residual.length > 0 || stillBad.length > 0) process.exitCode = 1;
