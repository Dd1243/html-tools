/**
 * Add standard breadcrumb nav to tool pages that lack one.
 * Pattern: 首页 › /tools/<cat>/ › Current tool
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const toolsJson = JSON.parse(fs.readFileSync(path.join(root, 'tools.json'), 'utf8'));
const categories = toolsJson.categories || {};
const catIds = new Set(Object.keys(categories));

const BREADCRUMB_CSS = `
/* auto breadcrumb */
.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  margin: 0 0 16px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid var(--border-color, var(--border-subtle, rgba(127,127,127,0.25)));
  background: var(--bg-card, var(--bg-surface, var(--surface, transparent)));
  font-size: 0.85rem;
  line-height: 1.4;
  color: var(--text-secondary, #888);
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
  color: var(--accent, var(--accent-cyan, var(--accent-primary, #0ea5e9)));
  text-decoration: none;
  font-weight: 500;
}
.breadcrumb a:hover { text-decoration: underline; }
.breadcrumb li:last-child span,
.breadcrumb .current {
  color: var(--text-primary, inherit);
  font-weight: 600;
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

function hasBreadcrumb(html) {
  return (
    /class=["'][^"']*\bbreadcrumb\b/.test(html) ||
    /aria-label=["']breadcrumb["']/i.test(html)
  );
}

const PATH_ALIAS = {
  pet: 'pets',
  'real-estate': 'realestate',
};

function catFromPath(fp) {
  const rel = path.relative(path.join(root, 'tools'), fp).replace(/\\/g, '/');
  const seg = rel.split('/')[0];
  const mapped = PATH_ALIAS[seg] || seg;
  return catIds.has(mapped) ? mapped : null;
}

function catName(id) {
  return (categories[id] && categories[id].name) || id;
}

function extractTitle(html, fallback) {
  // prefer first real h1 text
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) {
    let t = h1[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#\d+;/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    // strip leading emoji/symbols for cleaner crumb (keep chinese)
    t = t.replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\s]+/u, '').trim() || t;
    if (t && t.length <= 80) return t;
    if (t) return t.slice(0, 60);
  }
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) {
    let t = title[1]
      .replace(/<[^>]+>/g, '')
      .split(/[-|–—]/)[0]
      .replace(/\s+/g, ' ')
      .trim();
    if (t) return t.slice(0, 60);
  }
  return fallback;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildCrumb(catId, pageTitle) {
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

function injectCss(html) {
  if (/\/\* auto breadcrumb \*\//.test(html) || /\.breadcrumb\s*\{/.test(html)) {
    // still ensure basic styles exist; if only partial, append auto block once
    if (/\/\* auto breadcrumb \*\//.test(html)) return html;
    // page already has .breadcrumb rules - skip
    return html;
  }
  if (/<\/style>/i.test(html)) {
    return html.replace('</style>', BREADCRUMB_CSS + '\n    </style>');
  }
  return html.replace('</head>', `<style>${BREADCRUMB_CSS}</style>\n  </head>`);
}

function insertBreadcrumb(html, crumb) {
  // Prefer after opening of first major container inside body
  const patterns = [
    // page-shell / container right after open
    /(<body[^>]*>\s*(?:<!--[\s\S]*?-->\s*)*)(<div class="[^"]*(?:page-shell|container|container-wrapper)[^"]*"[^>]*>)/i,
    /(<body[^>]*>\s*(?:<!--[\s\S]*?-->\s*)*)(<main\b[^>]*>)/i,
    /(<body[^>]*>\s*(?:<!--[\s\S]*?-->\s*)*)(<div class="container"[^>]*>)/i,
  ];

  for (const re of patterns) {
    if (re.test(html)) {
      return html.replace(re, `$1$2\n      ${crumb}\n`);
    }
  }

  // after <body>
  if (/<body[^>]*>/i.test(html)) {
    return html.replace(/<body[^>]*>/i, (m) => `${m}\n    ${crumb}\n`);
  }
  return null;
}

function processFile(fp) {
  let html = fs.readFileSync(fp, 'utf8');
  if (hasBreadcrumb(html)) return { status: 'skip-has' };

  const rel = path.relative(root, fp).replace(/\\/g, '/');
  // skip category hub index pages that somehow lack crumb? still add if missing
  const cat = catFromPath(fp);
  if (!cat) return { status: 'skip-no-cat' };

  const isIndex = /index\.html$/i.test(fp);
  const pageTitle = isIndex
    ? catName(cat)
    : extractTitle(html, path.basename(fp, '.html'));

  // for index hub pages without breadcrumb, use 首页 › 全部工具 › 分类
  let crumb;
  if (isIndex) {
    crumb = `<nav class="breadcrumb" aria-label="breadcrumb">
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
            <span itemprop="name" class="current">${escapeHtml(pageTitle)}</span>
            <meta itemprop="position" content="3" />
          </li>
        </ol>
      </nav>`;
  } else {
    crumb = buildCrumb(cat, pageTitle);
  }

  html = injectCss(html);
  const next = insertBreadcrumb(html, crumb);
  if (!next) return { status: 'fail-insert', rel };

  // ensure we didn't create nested breadcrumb
  const count = (next.match(/class=["'][^"']*\bbreadcrumb\b/g) || []).length;
  if (count !== 1) return { status: 'fail-count', rel, count };

  fs.writeFileSync(fp, next, 'utf8');
  return { status: 'added', rel, cat, pageTitle };
}

const files = walk(path.join(root, 'tools'));
const stats = {
  scanned: files.length,
  added: 0,
  skippedHas: 0,
  skippedNoCat: 0,
  failed: [],
  samples: [],
};

for (const fp of files) {
  const r = processFile(fp);
  if (r.status === 'added') {
    stats.added++;
    if (stats.samples.length < 15) stats.samples.push(`${r.rel} => ${r.cat} / ${r.pageTitle}`);
  } else if (r.status === 'skip-has') stats.skippedHas++;
  else if (r.status === 'skip-no-cat') stats.skippedNoCat++;
  else stats.failed.push(r);
}

// re-audit
let stillWithout = 0;
const stillSamples = [];
for (const fp of files) {
  const h = fs.readFileSync(fp, 'utf8');
  if (!hasBreadcrumb(h)) {
    stillWithout++;
    if (stillSamples.length < 15) {
      stillSamples.push(path.relative(root, fp).replace(/\\/g, '/'));
    }
  }
}

console.log(
  JSON.stringify(
    {
      ...stats,
      stillWithout,
      stillSamples,
    },
    null,
    2
  )
);

if (stats.failed.length) process.exitCode = 1;
if (stillWithout > 20) process.exitCode = 1;
