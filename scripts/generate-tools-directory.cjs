/**
 * Rebuild tools-directory.html from tools.json
 * - Chinese title + SEO
 * - Category headings link to /tools/<category>/
 * - Visual style aligned with category hub pages
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const toolsJson = JSON.parse(fs.readFileSync(path.join(root, 'tools.json'), 'utf8'));
const categories = toolsJson.categories || {};
const tools = Object.values(toolsJson.tools || {});

const ADSENSE = `    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9979971494108572" crossorigin="anonymous"></script>`;

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function padDesc(s) {
  let d = String(s || '').replace(/\s+/g, ' ').trim();
  const pad = '免费在线使用，浏览器本地处理，无需注册。';
  while (d.length < 120) d += pad;
  if (d.length > 160) d = d.slice(0, 160);
  return d;
}

function toolUrl(t) {
  return '/' + String(t.path || '').replace(/\\/g, '/').replace(/\.html$/i, '');
}

function toolExists(t) {
  const p = path.join(root, String(t.path || '').replace(/\\/g, '/'));
  return fs.existsSync(p);
}

// group tools by category in category definition order
const byCat = {};
for (const t of tools) {
  if (!t || !t.category || !t.path) continue;
  if (/\/index\.html$/i.test(t.path)) continue;
  if (!toolExists(t)) continue;
  if (!byCat[t.category]) byCat[t.category] = [];
  byCat[t.category].push(t);
}
for (const k of Object.keys(byCat)) {
  byCat[k].sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'zh-CN'));
}

const catIds = Object.keys(categories).filter((id) => (byCat[id] || []).length > 0);
const totalTools = catIds.reduce((s, id) => s + byCat[id].length, 0);
const totalCats = catIds.length;

const desc = padDesc(
  `WebUtils 全部工具目录：收录 ${totalTools} 个免费在线工具，覆盖 ${totalCats} 个分类。按分类浏览开发、文本、设计、财务等工具，本地运行无需安装。`
);
const title = `全部工具目录 - ${totalTools} 个免费在线工具 | WebUtils`;
const canonical = 'https://essays4u.net/tools-directory';

const itemList = [];
let pos = 0;
for (const id of catIds) {
  for (const t of byCat[id]) {
    pos += 1;
    if (pos > 100) break;
    itemList.push({
      '@type': 'ListItem',
      position: pos,
      name: t.name,
      url: 'https://essays4u.net' + toolUrl(t),
    });
  }
  if (pos > 100) break;
}

const ld = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      name: '全部工具目录',
      url: canonical,
      description: desc,
      inLanguage: 'zh-CN',
      isPartOf: { '@type': 'WebSite', name: 'WebUtils', url: 'https://essays4u.net/' },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: totalTools,
        itemListElement: itemList,
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首页', item: 'https://essays4u.net/' },
        { '@type': 'ListItem', position: 2, name: '全部工具目录', item: canonical },
      ],
    },
  ],
};

const toc = catIds
  .map((id) => {
    const c = categories[id];
    const n = (byCat[id] || []).length;
    return `          <a class="toc-chip" href="#cat-${escapeHtml(id)}">${escapeHtml(c.icon || '🔧')} ${escapeHtml(c.name || id)} <span>${n}</span></a>`;
  })
  .join('\n');

const sections = catIds
  .map((id) => {
    const c = categories[id];
    const list = byCat[id] || [];
    const name = c.name || id;
    const icon = c.icon || '🔧';
    const cards = list
      .map((t) => {
        const href = toolUrl(t);
        const tName = escapeHtml(t.name || path.basename(href));
        const tDesc = escapeHtml(t.description || t.name || '');
        const tIcon = escapeHtml(t.icon || icon);
        return `            <a class="tool-card" href="${href}">
              <div class="tool-icon">${tIcon}</div>
              <div class="tool-body">
                <div class="tool-name">${tName}</div>
                <div class="tool-desc">${tDesc}</div>
              </div>
            </a>`;
      })
      .join('\n');

    return `        <section class="cat-section" id="cat-${escapeHtml(id)}" aria-labelledby="h-${escapeHtml(id)}">
          <div class="cat-header">
            <a class="cat-title" id="h-${escapeHtml(id)}" href="/tools/${escapeHtml(id)}/">
              <span class="cat-icon">${escapeHtml(icon)}</span>
              <span class="cat-name">${escapeHtml(name)}</span>
              <span class="cat-count">${list.length} 个工具</span>
              <span class="cat-go">查看分类 →</span>
            </a>
          </div>
          <div class="tool-grid">
${cards}
          </div>
        </section>`;
  })
  .join('\n\n');

const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(desc)}" />
    <meta name="keywords" content="全部工具,在线工具目录,免费工具,WebUtils,工具导航" />
    <meta name="author" content="WebUtils" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(desc)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:site_name" content="WebUtils" />
    <meta property="og:locale" content="zh_CN" />
    <meta property="og:image" content="https://essays4u.net/social-preview.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(desc)}" />
    <meta name="twitter:image" content="https://essays4u.net/social-preview.png" />
    <script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
    </script>
${ADSENSE}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>
      :root {
        --bg: #f4f6fb;
        --card: #ffffff;
        --text: #0f172a;
        --muted: #64748b;
        --border: #e2e8f0;
        --primary: #4f46e5;
        --primary-soft: #eef2ff;
        --shadow: 0 8px 28px rgba(15, 23, 42, 0.06);
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: "Space Grotesk", system-ui, -apple-system, sans-serif;
        background:
          radial-gradient(circle at 8% 0%, rgba(79,70,229,.08), transparent 32%),
          radial-gradient(circle at 92% 8%, rgba(14,165,233,.08), transparent 28%),
          var(--bg);
        color: var(--text);
        min-height: 100vh;
        line-height: 1.6;
      }
      .site-header {
        position: sticky; top: 0; z-index: 20;
        background: rgba(255,255,255,.92);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid var(--border);
      }
      .hdr {
        width: min(1100px, 94%);
        margin: 0 auto;
        display: flex; align-items: center; justify-content: space-between;
        gap: 12px; padding: 12px 0;
      }
      .logo a {
        font-weight: 700; font-size: 1.2rem;
        color: var(--primary); text-decoration: none;
      }
      .site-nav { display: flex; gap: 12px; flex-wrap: wrap; }
      .site-nav a { color: var(--muted); text-decoration: none; font-size: .92rem; }
      .site-nav a:hover, .site-nav a.active { color: var(--primary); }
      .page {
        width: min(1100px, 94%);
        margin: 0 auto;
        padding: 20px 0 48px;
      }
      .breadcrumb { margin-bottom: 16px; }
      .breadcrumb ol {
        list-style: none; display: flex; flex-wrap: wrap; gap: .4rem;
        align-items: center; font-size: .875rem; color: var(--muted);
      }
      .breadcrumb li { display: flex; align-items: center; }
      .breadcrumb li:not(:last-child)::after { content: "›"; margin-left: .4rem; opacity: .7; }
      .breadcrumb a { color: var(--muted); text-decoration: none; }
      .breadcrumb a:hover { color: var(--primary); }
      .breadcrumb span { color: var(--text); font-weight: 500; }
      .hero {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 20px;
        box-shadow: var(--shadow);
        padding: 28px 24px 22px;
        margin-bottom: 18px;
        text-align: center;
      }
      .hero h1 {
        font-size: clamp(1.7rem, 3vw, 2.2rem);
        margin-bottom: 8px;
      }
      .hero .lead {
        color: var(--muted);
        max-width: 760px;
        margin: 0 auto 14px;
      }
      .meta-row {
        display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;
      }
      .pill {
        display: inline-flex; align-items: center;
        padding: 6px 12px; border-radius: 999px;
        background: var(--bg);
        border: 1px solid var(--border);
        color: var(--muted);
        font-size: .86rem;
      }
      .toc {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 16px;
        box-shadow: var(--shadow);
        padding: 16px;
        margin-bottom: 22px;
      }
      .toc h2 {
        font-size: 1rem;
        margin-bottom: 10px;
      }
      .toc-list {
        display: flex; flex-wrap: wrap; gap: 8px;
      }
      .toc-chip {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 7px 12px;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: var(--bg);
        color: var(--text);
        text-decoration: none;
        font-size: .88rem;
      }
      .toc-chip span {
        color: var(--muted);
        font-size: .8rem;
      }
      .toc-chip:hover {
        border-color: var(--primary);
        color: var(--primary);
      }
      .cat-section { margin-bottom: 22px; scroll-margin-top: 72px; }
      .cat-header { margin-bottom: 10px; }
      .cat-title {
        display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
        text-decoration: none; color: inherit;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 12px 14px;
        box-shadow: var(--shadow);
      }
      .cat-title:hover {
        border-color: color-mix(in srgb, var(--primary) 40%, var(--border));
      }
      .cat-icon {
        width: 40px; height: 40px;
        border-radius: 12px;
        display: inline-flex; align-items: center; justify-content: center;
        background: var(--primary-soft);
        font-size: 1.2rem;
      }
      .cat-name { font-size: 1.15rem; font-weight: 700; }
      .cat-count {
        color: var(--muted);
        font-size: .88rem;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 999px;
        padding: 3px 10px;
      }
      .cat-go {
        margin-left: auto;
        color: var(--primary);
        font-size: .9rem;
        font-weight: 600;
      }
      .tool-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 10px;
      }
      @media (min-width: 720px) {
        .tool-grid { grid-template-columns: 1fr 1fr; }
      }
      @media (min-width: 1024px) {
        .tool-grid { grid-template-columns: 1fr 1fr 1fr; }
      }
      .tool-card {
        display: flex; align-items: flex-start; gap: 10px;
        text-decoration: none; color: inherit;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 14px;
        box-shadow: var(--shadow);
        transition: transform .15s ease, border-color .15s ease;
      }
      .tool-card:hover {
        transform: translateY(-2px);
        border-color: color-mix(in srgb, var(--primary) 40%, var(--border));
      }
      .tool-icon {
        width: 38px; height: 38px; flex-shrink: 0;
        border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        background: var(--primary-soft);
        font-size: 1.05rem;
      }
      .tool-body { min-width: 0; }
      .tool-name {
        font-size: .98rem;
        font-weight: 700;
        margin-bottom: 3px;
        line-height: 1.35;
      }
      .tool-desc {
        font-size: .86rem;
        color: var(--muted);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .site-footer {
        border-top: 1px solid var(--border);
        background: #fff;
        margin-top: 8px;
      }
      .footer-inner {
        width: min(1100px, 94%);
        margin: 0 auto;
        padding: 26px 0 32px;
        text-align: center;
        color: var(--muted);
      }
      .footer-links {
        display: flex; flex-wrap: wrap; justify-content: center;
        gap: 10px 16px; margin: 12px 0;
      }
      .footer-links a {
        color: var(--muted); text-decoration: none; font-size: .9rem;
      }
      .footer-links a:hover { color: var(--primary); }
    </style>
  </head>
  <body>
    <header class="site-header">
      <div class="hdr">
        <div class="logo"><a href="/">WebUtils</a></div>
        <nav class="site-nav" aria-label="主导航">
          <a href="/">首页</a>
          <a href="/tools-directory" class="active">全部工具</a>
          <a href="/about">关于</a>
        </nav>
      </div>
    </header>

    <main class="page">
      <nav class="breadcrumb" aria-label="breadcrumb">
        <ol>
          <li><a href="/">首页</a></li>
          <li><span>全部工具目录</span></li>
        </ol>
      </nav>

      <section class="hero">
        <h1>全部工具目录</h1>
        <p class="lead">按分类浏览 WebUtils 全部免费在线工具。每个分类都可进入独立枢纽页，也可直接打开具体工具。</p>
        <div class="meta-row">
          <span class="pill">${totalTools} 个工具</span>
          <span class="pill">${totalCats} 个分类</span>
          <span class="pill">纯本地运行</span>
          <span class="pill">免费使用</span>
        </div>
      </section>

      <nav class="toc" aria-label="分类目录">
        <h2>快速跳转分类</h2>
        <div class="toc-list">
${toc}
        </div>
      </nav>

${sections}
    </main>

    <footer class="site-footer">
      <div class="footer-inner">
        <p>WebUtils · 全部工具目录</p>
        <nav class="footer-links" data-site-policy-links aria-label="网站政策">
          <a href="/about">关于本站</a>
          <a href="/contact">联系我们</a>
          <a href="/terms">使用条款</a>
          <a href="/privacy-policy">隐私政策</a>
          <a href="/">返回首页</a>
        </nav>
        <p>&copy; 2026 WebUtils</p>
      </div>
    </footer>
  </body>
</html>
`;

const out = path.join(root, 'tools-directory.html');
fs.writeFileSync(out, html, 'utf8');

const check = fs.readFileSync(out, 'utf8');
const d = (check.match(/name="description"\s+content="([^"]+)"/) || [])[1] || '';
const body = check.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
const h1 = (body.match(/<h1\b/gi) || []).length;
const hasQuestionMarks = /[?]{3,}/.test(body);
const catLinks = (check.match(/href="\/tools\/[a-z0-9-]+\/"/g) || []).length;

console.log({
  totalTools,
  totalCats,
  desc: d.length,
  h1,
  hasQuestionMarks,
  catLinks,
  titleOk: check.includes('全部工具目录'),
  ads: check.includes('adsbygoogle'),
  size: check.length,
});

if (d.length < 120 || d.length > 160 || h1 !== 1 || hasQuestionMarks || !check.includes('全部工具目录')) {
  process.exit(1);
}
