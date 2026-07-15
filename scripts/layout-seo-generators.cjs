/**
 * Layout polish for:
 * - tools/seo/robots-generator.html
 * - tools/seo/meta-tags-generator.html
 * Desktop + mobile friendly structure, remove messy GEO blocks, unify shell.
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const RESPONSIVE_CSS = `
/* layout polish: desktop + mobile */
*, *::before, *::after { box-sizing: border-box; }

html { -webkit-text-size-adjust: 100%; }

body {
  margin: 0;
  padding: 0 !important;
  min-height: 100vh;
  font-family: var(--font-sans, system-ui, -apple-system, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif);
  background: var(--bg-deep, #fafafa);
  color: var(--text-primary, #1a1a1a);
  line-height: 1.6;
}

.page-shell {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 16px 16px 40px;
}

@media (min-width: 768px) {
  .page-shell { padding: 24px 24px 48px; }
}

.breadcrumb {
  display: flex !important;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  margin: 0 0 16px !important;
  padding: 10px 14px !important;
  font-size: 0.85rem !important;
  line-height: 1.4;
  background: var(--bg-card, #fff) !important;
  border: 1px solid var(--border-subtle, #e5e5e5) !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  color: var(--text-secondary, #666);
}

.breadcrumb a {
  color: var(--accent-cyan, #00d4b8) !important;
  text-decoration: none;
}

.breadcrumb a:hover { text-decoration: underline; }

.breadcrumb span {
  color: var(--text-muted, #999) !important;
  margin: 0 !important;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.page-header h1 {
  margin: 0 !important;
  font-size: clamp(1.25rem, 2.5vw, 1.75rem) !important;
  line-height: 1.3;
  flex: 1 1 220px;
}

.page-header .subtitle {
  width: 100%;
  margin: 4px 0 0;
  color: var(--text-secondary, #666);
  font-size: 0.92rem;
}

.theme-toggle {
  position: static !important;
  top: auto !important;
  right: auto !important;
  flex: 0 0 auto;
  width: 42px !important;
  height: 42px !important;
  border-radius: 10px !important;
  border: 1px solid var(--border-subtle, #e5e5e5) !important;
  background: var(--bg-card, #fff) !important;
  cursor: pointer;
  font-size: 1.15rem !important;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.tool-workspace {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.layout {
  display: grid !important;
  grid-template-columns: 1fr !important;
  gap: 16px !important;
  align-items: start;
}

@media (min-width: 960px) {
  .layout {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
    gap: 20px !important;
  }
  .output-panel {
    position: sticky;
    top: 16px;
  }
}

.card {
  background: var(--bg-card, #fff) !important;
  border: 1px solid var(--border-subtle, #e5e5e5) !important;
  border-radius: 14px !important;
  padding: 16px !important;
  margin-bottom: 0 !important;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
}

@media (min-width: 768px) {
  .card { padding: 18px 20px !important; }
}

.config-panel,
.output-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.card-title {
  font-size: 1.05rem !important;
  font-weight: 600 !important;
  margin-bottom: 12px !important;
  color: var(--text-primary, #1a1a1a) !important;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.form-group label {
  color: var(--text-primary, #1a1a1a);
}

.form-group small {
  color: var(--text-muted, #999) !important;
}

input,
textarea,
select {
  max-width: 100%;
  background: var(--bg-input, #f5f5f5) !important;
  border: 1px solid var(--border-subtle, #e5e5e5) !important;
  color: var(--text-primary, #1a1a1a) !important;
  font-size: 16px !important; /* avoid iOS zoom */
}

.preset-buttons {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px !important;
}

@media (min-width: 520px) {
  .preset-buttons {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.preset-btn {
  width: 100%;
  text-align: center;
  color: var(--text-primary, #1a1a1a) !important;
  background: var(--bg-input, #f5f5f5) !important;
  border: 1px solid var(--border-subtle, #e5e5e5) !important;
  border-radius: 10px !important;
  padding: 0.65rem 0.75rem !important;
  min-height: 44px;
}

.preset-btn:hover {
  border-color: var(--accent-cyan, #00d4b8) !important;
  background: rgba(0, 212, 184, 0.08) !important;
}

.bot-list {
  gap: 8px !important;
}

.bot-tag {
  min-height: 40px;
  user-select: none;
}

.rule-item {
  flex-wrap: wrap !important;
  gap: 8px !important;
}

.rule-item select {
  width: 100% !important;
  max-width: 140px;
}

.rule-item input {
  flex: 1 1 160px !important;
  min-width: 0 !important;
}

.actions {
  display: flex !important;
  flex-wrap: wrap;
  gap: 8px !important;
}

.actions .btn,
.btn {
  min-height: 44px;
  justify-content: center;
}

@media (max-width: 520px) {
  .actions .btn {
    flex: 1 1 calc(50% - 8px);
  }
}

.code-block {
  background: #0f172a !important;
  border-radius: 10px !important;
  overflow: hidden;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 0.55rem 0.85rem !important;
  background: rgba(255, 255, 255, 0.06) !important;
}

.code-header span {
  color: #94a3b8 !important;
  font-size: 0.75rem !important;
}

.code-header button {
  min-height: 32px;
  white-space: nowrap;
}

.code-block pre {
  margin: 0 !important;
  padding: 0.9rem !important;
  overflow-x: auto;
  max-height: min(50vh, 420px);
  -webkit-overflow-scrolling: touch;
}

.code-block code {
  color: #e2e8f0 !important;
  font-size: 0.8rem !important;
  word-break: break-word;
  white-space: pre-wrap;
}

.info-box,
.warning-box {
  margin-top: 0 !important;
}

.tabs {
  display: grid !important;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0 !important;
  overflow: hidden;
}

@media (max-width: 420px) {
  .tabs {
    grid-template-columns: 1fr !important;
  }
  .tab {
    border-right: none !important;
    border-bottom: 1px solid var(--border-subtle, #e5e5e5);
  }
  .tab:last-child { border-bottom: none !important; }
}

.tab {
  min-height: 44px;
  padding: 0.7rem 0.5rem !important;
}

.twitter-preview,
.facebook-preview {
  max-width: 100% !important;
}

.twitter-preview .image,
.facebook-preview .image {
  height: clamp(140px, 40vw, 200px) !important;
}

.google-preview .title {
  white-space: normal !important;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* SEO blocks inside shell */
.seo-side {
  display: grid !important;
  grid-template-columns: 1fr !important;
  gap: 12px !important;
  margin: 8px 0 0 !important;
}

@media (min-width: 768px) {
  .seo-side { grid-template-columns: 1fr 1fr !important; }
}

@media (min-width: 1024px) {
  .seo-side { grid-template-columns: 1fr 1fr 1fr !important; }
}

.seo-side .seo-card {
  border: 1px solid var(--border-subtle, #e5e7eb);
  border-radius: 14px;
  padding: 14px 16px;
  background: var(--bg-card, #fff);
  min-width: 0;
}

.seo-side h2 {
  font-size: 1rem !important;
  margin: 0 0 8px !important;
  color: var(--text-primary, #1a1a1a) !important;
}

.seo-side ol,
.seo-side ul {
  margin: 0 0 0 1.1rem !important;
  font-size: 0.9rem;
  color: var(--text-secondary, #475569);
}

.related-tools {
  display: flex !important;
  flex-wrap: wrap;
  gap: 8px !important;
  justify-content: flex-start !important;
}

.related-tools a {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid var(--border-subtle, #e5e7eb);
  text-decoration: none;
  color: var(--text-secondary, #64748b) !important;
  font-size: 0.85rem;
  background: var(--bg-input, #f8fafc);
  min-height: 36px;
}

.related-tools a:hover {
  color: var(--accent-cyan, #0ea5e9) !important;
  border-color: currentColor;
}

.seo-article,
.seo-content {
  margin-top: 8px !important;
  padding: 18px 16px 20px !important;
  border: 1px solid var(--border-subtle, #e5e7eb);
  border-radius: 16px;
  background: var(--bg-card, #fff);
  box-shadow: 0 6px 24px rgba(15, 23, 42, 0.05);
  line-height: 1.8;
  min-width: 0;
}

@media (min-width: 768px) {
  .seo-article,
  .seo-content {
    padding: 22px 22px 24px !important;
  }
}

.seo-article h2,
.seo-content h2 {
  font-size: 1.15rem !important;
  margin: 1.1rem 0 0.5rem !important;
  color: var(--text-primary, #1a1a1a) !important;
}

.seo-article h2:first-child,
.seo-content h2:first-child {
  margin-top: 0 !important;
}

.seo-article h3,
.seo-content h3 {
  font-size: 1rem !important;
  margin: 0.9rem 0 0.35rem !important;
  color: var(--text-primary, #1a1a1a) !important;
}

.seo-article p,
.seo-article li,
.seo-content p,
.seo-content li {
  color: var(--text-secondary, #475569) !important;
}

.seo-article code,
.seo-content code {
  word-break: break-word;
}

.site-footer {
  margin-top: 28px;
  padding-top: 8px;
}

.site-footer nav {
  display: flex !important;
  flex-wrap: wrap !important;
  justify-content: center !important;
  gap: 10px 16px !important;
  font-size: 13px !important;
}

.site-footer a {
  color: var(--text-secondary, #64748b);
  text-decoration: none;
}

.site-footer a:hover {
  color: var(--accent-cyan, #0ea5e9);
}

/* kill leftover full-bleed GEO wrappers if any remain */
body > div[style*="max-width: 1200px"] {
  max-width: 1120px !important;
  margin-left: auto !important;
  margin-right: auto !important;
  padding-left: 16px !important;
  padding-right: 16px !important;
}
`;

function injectCss(html, css) {
  // Replace previous layout polish or append before </style>
  if (html.includes('/* layout polish: desktop + mobile */')) {
    return html.replace(
      /\/\* layout polish: desktop \+ mobile \*\/[\s\S]*?(?=<\/style>)/i,
      css + '\n    '
    );
  }
  if (html.includes('/* seo5 polish */')) {
    // keep seo5, append layout polish before </style>
    return html.replace('</style>', css + '\n    </style>');
  }
  if (/<\/style>/i.test(html)) {
    return html.replace('</style>', css + '\n    </style>');
  }
  return html.replace('</head>', `<style>${css}</style>\n  </head>`);
}

function extractBetween(html, startRe, endRe) {
  const sm = html.match(startRe);
  if (!sm) return null;
  const start = sm.index;
  const rest = html.slice(start);
  const em = rest.match(endRe);
  if (!em) return null;
  return {
    full: rest.slice(0, em.index + em[0].length),
    index: start,
    end: start + em.index + em[0].length,
  };
}

function restructurePage(html, opts) {
  const { title, subtitle, breadcrumbHtml } = opts;

  // Remove GEO FAQ mess (inline-styled blocks after tool script)
  html = html.replace(
    /<!-- FAQ（GEO 优化）-->[\s\S]*?(?=<section class="seo-side"|<article class="seo-article"|<footer class="site-footer"|<\/body>)/i,
    ''
  );

  // Also remove any leftover full-width GEO wrapper divs that use max-width:1200 and color:#000 blocks
  html = html.replace(
    /<div style="max-width:\s*1200px;[\s\S]*?<\/div>\s*(?=<section class="seo-side"|<article class="seo-article"|<footer class="site-footer"|<\/body>)/gi,
    ''
  );

  // Capture seo-side, seo-article, footer
  const seoSideM = html.match(/<section class="seo-side"[\s\S]*?<\/section>/i);
  const seoArticleM = html.match(/<article class="seo-article"[\s\S]*?<\/article>/i);
  const footerM = html.match(/<footer class="site-footer"[\s\S]*?<\/footer>/i);

  const seoSide = seoSideM ? seoSideM[0] : '';
  const seoArticle = seoArticleM ? seoArticleM[0] : '';
  const footer = footerM
    ? footerM[0]
    : `<footer class="site-footer">
  <nav data-site-policy-links aria-label="网站政策" style="display:flex;flex-wrap:wrap;justify-content:center;gap:12px 20px;margin:16px auto;padding:0 16px;font-size:14px">
    <a href="/about">关于本站</a>
    <a href="/contact">联系我们</a>
    <a href="/terms">使用条款</a>
    <a href="/privacy-policy">隐私政策</a>
  </nav>
</footer>`;

  // Remove them from current positions (will reinsert inside shell)
  if (seoSide) html = html.replace(seoSide, '');
  if (seoArticle) html = html.replace(seoArticle, '');
  if (footerM) html = html.replace(footerM[0], '');

  // Remove existing breadcrumb nav(s)
  html = html.replace(/<nav class="breadcrumb"[\s\S]*?<\/nav>/gi, '');

  // Extract main container tool HTML
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) throw new Error('no body');
  let bodyInner = bodyMatch[1];

  // Find container with tool
  const containerMatch = bodyInner.match(
    /<div class="container">([\s\S]*?)<\/div>\s*(?=<script[\s>])/i
  );
  if (!containerMatch) {
    // try looser: first container until script
    const m2 = bodyInner.match(/<div class="container">([\s\S]*?)<\/div>\s*<script/i);
    if (!m2) throw new Error('no container');
  }

  // Get scripts that belong to the tool (before SEO content was removed, still in body)
  // After removals, body should have: container + script(+maybe more)
  const scriptParts = [];
  const scriptRe = /<script(?![^>]*type=["']application\/ld\+json["'])[\s\S]*?<\/script>/gi;
  let sm;
  const scriptsFound = [];
  while ((sm = scriptRe.exec(bodyInner)) !== null) {
    // skip adsense in head only - body scripts are tool scripts
    if (!sm[0].includes('adsbygoogle')) {
      scriptsFound.push(sm[0]);
    }
  }

  // Extract container content more carefully
  const cStart = bodyInner.indexOf('<div class="container">');
  if (cStart < 0) throw new Error('container start not found');
  // Find matching close for this container - first </div> that closes after layout
  // Use depth counting
  let i = cStart + '<div class="container">'.length;
  let depth = 1;
  let cEnd = -1;
  while (i < bodyInner.length && depth > 0) {
    const nextOpen = bodyInner.indexOf('<div', i);
    const nextClose = bodyInner.indexOf('</div>', i);
    if (nextClose < 0) break;
    if (nextOpen >= 0 && nextOpen < nextClose) {
      // check it's a real open tag
      const ch = bodyInner[nextOpen + 4];
      if (ch === ' ' || ch === '>' || ch === '\n' || ch === '\r' || ch === '\t') {
        depth += 1;
        i = nextOpen + 4;
        continue;
      }
    }
    depth -= 1;
    if (depth === 0) {
      cEnd = nextClose;
      break;
    }
    i = nextClose + 6;
  }
  if (cEnd < 0) throw new Error('container end not found');

  let containerInner = bodyInner.slice(cStart + '<div class="container">'.length, cEnd);

  // Replace header block
  containerInner = containerInner.replace(
    /<header[\s\S]*?<\/header>/i,
    `<header class="page-header">
        <div>
          <h1>${title}</h1>
          <p class="subtitle">${subtitle}</p>
        </div>
        <button class="theme-toggle" onclick="toggleTheme()" title="切换主题" aria-label="切换主题">🌙</button>
      </header>`
  );

  // Wrap layout area as tool-workspace if not already
  if (!containerInner.includes('tool-workspace')) {
    // after header, wrap remaining cards/layout
    containerInner = containerInner.replace(
      /(<\/header>\s*)([\s\S]*)/i,
      `$1<div class="tool-workspace">
$2
      </div>`
    );
  }

  const toolScripts = scriptsFound.join('\n\n    ');

  const newBody = `
    <div class="page-shell container">
      ${breadcrumbHtml}
      ${containerInner}
      ${seoSide}
      ${seoArticle}
      ${footer}
    </div>

    ${toolScripts}
`;

  html = html.replace(/<body[^>]*>[\s\S]*<\/body>/i, `<body>${newBody}</body>`);
  html = injectCss(html, RESPONSIVE_CSS);

  // Fix breadcrumb links
  html = html.replace(/href="\/#seo"/gi, 'href="/tools/seo/"');
  html = html.replace(
    /<a href="\/tools-directory">SEO工具<\/a>/gi,
    '<a href="/tools/seo/">SEO工具</a>'
  );

  return html;
}

function fixMetaGenerateCode(html) {
  // Fix bug: OG/Twitter title/description/canonical hard-coded to site values
  // Replace the broken generateCode body for OG title/desc/url
  const brokenOgUrl =
    /code \+= '    <meta property="og:url" content="https:\/\/essays4u\.net\/tools\/seo\/meta-tags-generator" \/>\\n';/;
  if (brokenOgUrl.test(html)) {
    html = html.replace(
      brokenOgUrl,
      `code += '<meta property="og:url" content="' + escapeHtml(url) + '">\\n';`
    );
  }
  html = html.replace(
    /code \+= '<meta property="og:title" content="Meta 标签生成器 - Title\/Description\/OG 一键生成">\\n';/,
    `code += '<meta property="og:title" content="' + escapeHtml(title) + '">\\n';`
  );
  html = html.replace(
    /code \+= '<meta property="og:description" content="免费 Meta 标签生成器：[^"]*">\\n';/,
    `code += '<meta property="og:description" content="' + escapeHtml(description) + '">\\n';`
  );
  html = html.replace(
    /code \+= '<meta name="twitter:title" content="Meta 标签生成器 - Title\/Description\/OG 一键生成">\\n';/,
    `code += '<meta name="twitter:title" content="' + escapeHtml(title) + '">\\n';`
  );
  html = html.replace(
    /code \+= '<meta name="twitter:description" content="免费 Meta 标签生成器：[^"]*">\\n';/,
    `code += '<meta name="twitter:description" content="' + escapeHtml(description) + '">\\n';`
  );
  html = html.replace(
    /code \+= '    <link rel="canonical" href="https:\/\/essays4u\.net\/tools\/seo\/meta-tags-generator" \/>\\n';/,
    `code += '<link rel="canonical" href="' + escapeHtml(url) + '">\\n';`
  );
  // title line also wrongly appends site brand always - keep user title as-is for generated snippet
  html = html.replace(
    /code \+= "<title>" \+ escapeHtml\(title\) \+ " - WebUtils<\/title>\\n";/,
    `code += "<title>" + escapeHtml(title) + "</title>\\n";`
  );
  return html;
}

function fixRobots() {
  const fp = path.join(root, 'tools/seo/robots-generator.html');
  let html = fs.readFileSync(fp, 'utf8');
  html = restructurePage(html, {
    title: 'Robots.txt 生成器',
    subtitle: '可视化配置爬虫规则、Sitemap 与站点模板，一键复制或下载到网站根目录。',
    breadcrumbHtml: `<nav class="breadcrumb" aria-label="面包屑">
        <a href="/">首页</a>
        <span>›</span>
        <a href="/tools/seo/">SEO工具</a>
        <span>›</span>
        <span>Robots.txt 生成器</span>
      </nav>`,
  });
  fs.writeFileSync(fp, html, 'utf8');
  console.log('fixed robots-generator');
}

function fixMeta() {
  const fp = path.join(root, 'tools/seo/meta-tags-generator.html');
  let html = fs.readFileSync(fp, 'utf8');
  html = restructurePage(html, {
    title: 'Meta 标签生成器',
    subtitle: '填写标题、描述与社交字段，实时预览 Google / Twitter / Facebook 并生成 head 代码。',
    breadcrumbHtml: `<nav class="breadcrumb" aria-label="面包屑">
        <a href="/">首页</a>
        <span>›</span>
        <a href="/tools/seo/">SEO工具</a>
        <span>›</span>
        <span>Meta 标签生成器</span>
      </nav>`,
  });
  html = fixMetaGenerateCode(html);
  fs.writeFileSync(fp, html, 'utf8');
  console.log('fixed meta-tags-generator');
}

function verify() {
  const files = [
    'tools/seo/robots-generator.html',
    'tools/seo/meta-tags-generator.html',
  ];
  const out = [];
  for (const f of files) {
    const html = fs.readFileSync(path.join(root, f), 'utf8');
    const open = (html.match(/<div\b/gi) || []).length;
    const close = (html.match(/<\/div>/gi) || []).length;
    out.push({
      file: f,
      pageShell: /class="[^"]*page-shell/.test(html),
      breadcrumbHub: html.includes('href="/tools/seo/"'),
      seoInside: /page-shell[\s\S]*seo-side[\s\S]*seo-article/i.test(html),
      noGeoMess:
        !html.includes('FAQ（GEO 优化）') &&
        !html.includes('什么是Robots.txt') &&
        !/style="[^"]*color:\s*#000/.test(html),
      h1: (html.match(/<h1[\s>]/gi) || []).length,
      divDiff: open - close,
      hasLayoutCss: html.includes('/* layout polish: desktop + mobile */'),
      stickyOut: html.includes('position: sticky'),
    });
  }
  console.log(JSON.stringify(out, null, 2));
  const bad = out.some(
    (x) =>
      !x.pageShell ||
      !x.breadcrumbHub ||
      !x.seoInside ||
      !x.noGeoMess ||
      x.h1 !== 1 ||
      x.divDiff !== 0 ||
      !x.hasLayoutCss
  );
  if (bad) process.exitCode = 1;
}

fixRobots();
fixMeta();
verify();
