/**
 * Responsive layout polish for:
 * - tools/extractor/favicon-extractor.html
 * - tools/seo/heading-analyzer.html
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const SHARED_CSS = `
/* layout polish: favicon + heading */
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }

.page-shell {
  width: 100% !important;
  max-width: 1120px !important;
  margin: 0 auto !important;
  padding: 16px 16px 40px !important;
}
@media (min-width: 768px) {
  .page-shell { padding: 24px 24px 48px !important; }
}

.page-shell > .breadcrumb,
.breadcrumb {
  display: flex !important;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  margin: 0 0 16px !important;
  padding: 10px 14px !important;
  border-radius: 12px !important;
  border: 1px solid var(--border-color, var(--border-subtle, #e5e5e5)) !important;
  background: var(--bg-card, var(--surface, #fff)) !important;
  box-shadow: none !important;
  font-size: 0.85rem !important;
}
.breadcrumb ol {
  list-style: none !important;
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 0.45rem !important;
  align-items: center !important;
  padding: 0 !important;
  margin: 0 !important;
  width: 100%;
}
.breadcrumb li {
  display: flex !important;
  align-items: center !important;
  color: var(--text-secondary, #666) !important;
}
.breadcrumb li:not(:last-child)::after {
  content: "›" !important;
  margin-left: 0.45rem !important;
  color: var(--text-muted, #999) !important;
}
.breadcrumb a {
  color: var(--accent, var(--accent-primary, #0ea5e9)) !important;
  text-decoration: none !important;
  font-weight: 500 !important;
}
.breadcrumb a:hover { text-decoration: underline !important; }
.breadcrumb li:last-child span {
  color: var(--text-primary, #111) !important;
  font-weight: 600 !important;
}

.tool-workspace { display: flex; flex-direction: column; gap: 16px; min-width: 0; }

.seo-side {
  display: grid !important;
  grid-template-columns: 1fr !important;
  gap: 12px !important;
  margin: 20px 0 0 !important;
}
@media (min-width: 768px) {
  .seo-side { grid-template-columns: 1fr 1fr !important; }
}
@media (min-width: 1024px) {
  .seo-side { grid-template-columns: 1fr 1fr 1fr !important; }
}
.seo-side .seo-card,
.seo-side .article-card {
  border: 1px solid var(--border-color, var(--border-subtle, #e5e7eb));
  border-radius: 14px;
  padding: 14px 16px;
  background: var(--bg-card, var(--surface-strong, #fff));
  min-width: 0;
}
.seo-side h2 {
  font-size: 1rem !important;
  margin: 0 0 8px !important;
  color: var(--text-primary, #1a1a1a) !important;
  text-transform: none !important;
  letter-spacing: 0 !important;
}
.seo-side ol, .seo-side ul { margin: 0 0 0 1.1rem !important; font-size: 0.9rem; color: var(--text-secondary, #475569); }
.related-tools { display: flex !important; flex-wrap: wrap; gap: 8px !important; justify-content: flex-start !important; }
.related-tools a {
  display: inline-flex; align-items: center;
  padding: 8px 12px; min-height: 36px;
  border-radius: 999px;
  border: 1px solid var(--border-color, #e5e7eb);
  text-decoration: none;
  color: var(--text-secondary, #64748b) !important;
  font-size: 0.85rem;
  background: var(--bg-input, #f8fafc);
}
.related-tools a:hover {
  color: var(--accent, var(--accent-primary, #0ea5e9)) !important;
  border-color: currentColor;
}

.seo-article,
.article-content,
.seo-content {
  margin-top: 16px !important;
  padding: 18px 16px 20px !important;
  border: 1px solid var(--border-color, var(--border-subtle, #e5e7eb));
  border-radius: 16px;
  background: var(--bg-card, var(--surface-strong, #fff));
  box-shadow: 0 6px 24px rgba(15, 23, 42, 0.05);
  line-height: 1.8;
  min-width: 0;
}
@media (min-width: 768px) {
  .seo-article, .article-content, .seo-content {
    padding: 22px 22px 24px !important;
  }
}
.seo-article h2, .article-content h2, .seo-content h2, .seo-section h2 {
  font-size: 1.15rem !important;
  margin: 1.1rem 0 0.5rem !important;
  color: var(--text-primary, #1a1a1a) !important;
}
.seo-article h2:first-child,
.article-content h2:first-child,
.seo-content > .seo-section:first-child h2 {
  margin-top: 0 !important;
}
.seo-article p, .seo-article li,
.article-content p, .article-content li,
.seo-content p, .seo-content li {
  color: var(--text-secondary, #475569) !important;
}

.site-footer,
footer.site-footer,
.page-shell > footer,
.page-shell footer {
  margin-top: 28px !important;
  padding-top: 8px !important;
  text-align: center;
  color: var(--text-muted, #64748b);
  font-size: 0.875rem;
  border-top: 1px solid var(--border-color, var(--border-subtle, #e5e7eb));
}
.site-footer nav,
footer nav[data-site-policy-links] {
  display: flex !important;
  flex-wrap: wrap !important;
  justify-content: center !important;
  gap: 10px 16px !important;
  font-size: 13px !important;
}
.site-footer a,
footer nav[data-site-policy-links] a {
  color: var(--text-secondary, #64748b);
  text-decoration: none;
}
.site-footer a:hover,
footer nav[data-site-policy-links] a:hover {
  color: var(--accent, var(--accent-primary, #0ea5e9));
}

/* ---- favicon specific ---- */
.favicon-page .header {
  display: flex !important;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px !important;
}
.favicon-page .title-group h1 {
  font-size: clamp(1.2rem, 2.4vw, 1.5rem) !important;
}
.favicon-page .main-grid {
  display: block !important;
}
.favicon-page .main-content {
  width: 100% !important;
  max-width: none !important;
  min-width: 0;
}
.favicon-page .card {
  margin-bottom: 16px !important;
  padding: 16px !important;
}
@media (min-width: 768px) {
  .favicon-page .card { padding: 20px 22px !important; }
}
.favicon-page .input-group {
  display: flex !important;
  flex-wrap: wrap;
  gap: 10px !important;
}
.favicon-page .input-group .form-control {
  flex: 1 1 220px !important;
  min-width: 0 !important;
  font-size: 16px !important;
}
.favicon-page .input-group .btn {
  flex: 0 0 auto;
  min-height: 44px;
}
@media (max-width: 560px) {
  .favicon-page .input-group .btn {
    width: 100%;
  }
}
.favicon-page .quick-tags {
  gap: 8px !important;
}
.favicon-page .tag {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  padding: 6px 12px !important;
}
.favicon-page .site-header {
  flex-wrap: wrap;
  gap: 14px !important;
  padding: 16px !important;
}
.favicon-page .site-meta {
  min-width: 0;
  flex: 1 1 180px;
}
.favicon-page .site-meta h2 {
  word-break: break-word;
}
.favicon-page .site-meta p {
  word-break: break-all;
}
.favicon-page .icons-grid {
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
  gap: 12px !important;
}
@media (max-width: 420px) {
  .favicon-page .icons-grid {
    grid-template-columns: 1fr 1fr !important;
  }
}
.favicon-page .icon-actions .btn-sm {
  min-height: 36px;
}
.favicon-page .toast {
  left: 16px !important;
  right: 16px !important;
  bottom: 16px !important;
  text-align: center;
}
@media (min-width: 640px) {
  .favicon-page .toast {
    left: auto !important;
    right: 24px !important;
    bottom: 24px !important;
    text-align: left;
  }
}
.favicon-page .seo-side,
.favicon-page .article-content {
  width: 100%;
}

/* ---- heading analyzer specific ---- */
.heading-page main.content-layout {
  display: flex !important;
  flex-direction: column !important;
  gap: 16px !important;
  width: 100% !important;
  max-width: none !important;
  padding: 0 !important;
  margin: 0 !important;
}
.heading-page .tool-section {
  flex: none !important;
  width: 100% !important;
  max-width: none !important;
  padding: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}
.heading-page .sidebar-section {
  display: none !important; /* replaced by seo-side */
}
.heading-page .workspace {
  display: grid !important;
  grid-template-columns: 1fr !important;
  gap: 16px !important;
  margin-top: 0 !important;
}
@media (min-width: 960px) {
  .heading-page .workspace {
    grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr) !important;
    align-items: start;
  }
  .heading-page .workspace > aside.panel {
    position: sticky;
    top: 16px;
  }
}
.heading-page .page-header {
  margin-top: 0 !important;
}
.heading-page .page-title {
  font-size: clamp(1.35rem, 2.6vw, 1.9rem) !important;
  line-height: 1.25;
}
.heading-page .panel-inner {
  padding: 1.1rem !important;
}
@media (min-width: 768px) {
  .heading-page .panel-inner { padding: 1.4rem !important; }
}
.heading-page textarea#htmlInput,
.heading-page #htmlInput {
  width: 100% !important;
  min-height: 220px !important;
  max-height: 50vh;
  font-size: 16px !important;
  font-family: var(--font-mono, ui-monospace, monospace) !important;
  resize: vertical;
}
.heading-page .editor-header,
.heading-page .section-header,
.heading-page .helper-row,
.heading-page .action-row {
  gap: 10px;
}
.heading-page .toolbar-actions,
.heading-page .action-row .toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.heading-page .toolbar-actions > button,
.heading-page .toolbar-actions > a,
.heading-page .action-row button {
  min-height: 42px;
}
@media (max-width: 720px) {
  .heading-page .toolbar-actions > button,
  .heading-page .toolbar-actions > a,
  .heading-page .action-row button {
    flex: 1 1 calc(50% - 8px);
  }
}
.heading-page .hero-badges,
.heading-page .helper-chips,
.heading-page .summary-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.heading-page .metrics-grid,
.heading-page .distribution-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
}
@media (min-width: 640px) {
  .heading-page .metrics-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  }
  .heading-page .distribution-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }
}
@media (min-width: 960px) {
  .heading-page .distribution-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
  }
}
.heading-page .results-layout {
  display: grid !important;
  grid-template-columns: 1fr !important;
  gap: 16px !important;
}
@media (min-width: 960px) {
  .heading-page .results-layout {
    grid-template-columns: 1fr 1fr !important;
  }
  .heading-page .results-layout > .panel:last-child {
    grid-column: 1 / -1;
  }
}
.heading-page .seo-content {
  display: grid !important;
  grid-template-columns: 1fr !important;
  gap: 14px !important;
}
@media (min-width: 900px) {
  .heading-page .seo-content {
    grid-template-columns: 1fr 1fr !important;
  }
  .heading-page .seo-content .seo-section.is-wide {
    grid-column: 1 / -1;
  }
}
.heading-page .faq-grid {
  display: grid !important;
  grid-template-columns: 1fr !important;
  gap: 12px !important;
}
@media (min-width: 720px) {
  .heading-page .faq-grid {
    grid-template-columns: 1fr 1fr !important;
  }
}
.heading-page .heading-item {
  grid-template-columns: auto 1fr !important;
  gap: 0.65rem !important;
  margin-left: 0 !important;
}
.heading-page .heading-meta {
  grid-column: 2 !important;
  text-align: left !important;
}
@media (min-width: 720px) {
  .heading-page .heading-item {
    grid-template-columns: auto auto 1fr auto !important;
  }
  .heading-page .heading-meta {
    grid-column: auto !important;
  }
}
`;

function injectCss(html, css) {
  if (html.includes('/* layout polish: favicon + heading */')) {
    return html.replace(
      /\/\* layout polish: favicon \+ heading \*\/[\s\S]*?(?=<\/style>)/i,
      css + '\n    '
    );
  }
  if (/<\/style>/i.test(html)) {
    return html.replace('</style>', css + '\n    </style>');
  }
  return html.replace('</head>', `<style>${css}</style>\n  </head>`);
}

function sideBlock(how, faq, related) {
  return `
      <section class="seo-side" aria-label="使用提示">
        <div class="seo-card">
          <h2>怎么用</h2>
          <ol>
            ${how.map((x) => `<li>${x}</li>`).join('\n            ')}
          </ol>
        </div>
        <div class="seo-card">
          <h2>常见问题</h2>
          <ul>
            ${faq.map(([q, a]) => `<li><strong>${q}</strong> ${a}</li>`).join('\n            ')}
          </ul>
        </div>
        <div class="seo-card">
          <h2>相关工具</h2>
          <div class="related-tools">
            ${related.map((r) => `<a href="${r.href}">${r.name}</a>`).join('\n            ')}
          </div>
        </div>
      </section>`;
}

function policyFooter() {
  return `<footer class="site-footer">
  <nav data-site-policy-links aria-label="网站政策">
    <a href="/about">关于本站</a>
    <a href="/contact">联系我们</a>
    <a href="/terms">使用条款</a>
    <a href="/privacy-policy">隐私政策</a>
  </nav>
</footer>`;
}

function fixFavicon() {
  const fp = path.join(root, 'tools/extractor/favicon-extractor.html');
  let html = fs.readFileSync(fp, 'utf8');

  // Capture pieces
  const seoSideM = html.match(/<section class="seo-side"[\s\S]*?<\/section>/i);
  const articleM = html.match(/<article class="article-content"[\s\S]*?<\/article>/i);
  const toastM = html.match(/<div id="toast"[\s\S]*?<\/div>/i);
  const scriptM = html.match(/<script>\s*const urlInput[\s\S]*?<\/script>/i);

  const seoSide =
    seoSideM && seoSideM[0]
      ? seoSideM[0]
      : sideBlock(
          ['输入域名或完整 URL', '点击提取图标', '预览多来源尺寸', '复制链接或下载'],
          [
            ['为什么有的站提取失败？', '目标站无图标、防盗链或第三方图标服务暂不可用。'],
            ['下载的是原图吗？', '多数为图标服务返回的可访问地址，分辨率因来源而异。'],
            ['会爬取网站源码吗？', '受 CORS 限制，主要通过公开图标服务与标准路径尝试。'],
            ['能批量整站吗？', '当前按单域名提取，适合逐个站点处理。'],
          ],
          [
            { href: '/tools/extractor/link-extractor', name: '链接提取' },
            { href: '/tools/extractor/', name: '提取器分类' },
            { href: '/tools/generator/placeholder-image', name: '占位图' },
            { href: '/tools/design/card-generator', name: '卡片生成' },
          ]
        );

  const article = articleM
    ? articleM[0]
    : `<article class="article-content" aria-label="Favicon 指南"><h2>什么是 Favicon？</h2><p>Favicon 是浏览器标签与收藏夹中的站点图标。</p></article>`;
  const toast = toastM ? toastM[0] : '<div id="toast" class="toast">已复制到剪贴板</div>';
  const script = scriptM ? scriptM[0] : '';

  // Extract tool UI only (header + tool cards + results, without seo/article)
  // We'll rebuild body from known structure
  const headerM = html.match(/<header class="header">[\s\S]*?<\/header>/i);
  if (!headerM) throw new Error('favicon header missing');

  // Extract from main-grid start of card through result-section end
  const toolStart = html.indexOf('<div class="card">');
  const resultEndMarker = 'id="resultArea"';
  const resultIdx = html.indexOf(resultEndMarker);
  if (toolStart < 0 || resultIdx < 0) throw new Error('favicon tool blocks missing');

  // Find end of result-section: after resultArea div closes - look for <!-- 文章内容
  const articleComment = html.indexOf('<!-- 文章内容');
  const seoSideIdx = html.indexOf('<section class="seo-side"');
  const cutEnd = articleComment > 0 ? articleComment : seoSideIdx;
  // Better: extract between <main class="main-grid"> and seo-side
  const mainM = html.match(
    /<main class="main-grid">([\s\S]*?)(?:<!-- 文章内容|<section class="seo-side")/i
  );
  if (!mainM) throw new Error('favicon main missing');

  // Clean tool part: remove seo-side/article if nested
  let toolInner = mainM[1]
    .replace(/<section class="seo-side"[\s\S]*?<\/section>/i, '')
    .replace(/<article class="article-content"[\s\S]*?<\/article>/i, '')
    .replace(/<!-- 右侧：侧边栏 -->[\s\S]*/i, '')
    .replace(/<\/div>\s*$/i, '') // trailing main-content close may be incomplete
    .trim();

  // Ensure toolInner is just main-content inner
  // Remove opening <div class="main-content"> if present
  toolInner = toolInner.replace(/^<div class="main-content">\s*/i, '');
  // Remove dangling closes
  while (/<\/div>\s*$/i.test(toolInner) && !toolInner.includes('result-section')) {
    break;
  }
  // Strip trailing incomplete closes carefully - keep structure balanced later via verify

  // Simpler approach: rebuild tool from explicit slices
  const extractCard = html.match(
    /<div class="card">\s*<div class="card-title">提取设置<\/div>[\s\S]*?<\/div>\s*<div class="loading"/i
  );
  // Use full known blocks via regex
  const extractBlock = html.match(
    /<div class="card">\s*<div class="card-title">提取设置<\/div>[\s\S]*?<div class="loading" id="loading">[\s\S]*?<\/div>\s*<div class="result-section" id="resultArea">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/i
  );

  let toolBlocks;
  if (extractBlock) {
    toolBlocks = extractBlock[0]
      .replace(/<\/div>\s*<\/div>\s*$/i, '</div>') // drop extra wrappers if matched too far
      ;
  }

  // Fallback precise construction from markers
  const cardStart = html.indexOf('<div class="card-title">提取设置</div>');
  const cardDivStart = html.lastIndexOf('<div class="card">', cardStart);
  const loadingStart = html.indexOf('<div class="loading" id="loading">');
  const resultStart = html.indexOf('<div class="result-section" id="resultArea">');
  // result section ends before seo-side
  const seoIdx = html.indexOf('<section class="seo-side"');
  // Find matching end for result-section: depth from resultStart
  function findDivEnd(src, startIdx) {
    let i = startIdx;
    // move to after opening tag
    const gt = src.indexOf('>', startIdx);
    i = gt + 1;
    let depth = 1;
    while (i < src.length && depth > 0) {
      const no = src.indexOf('<div', i);
      const nc = src.indexOf('</div>', i);
      if (nc < 0) return -1;
      if (no >= 0 && no < nc) {
        const ch = src[no + 4];
        if (ch === ' ' || ch === '>' || ch === '\n' || ch === '\r' || ch === '\t') {
          depth++;
          i = no + 4;
          continue;
        }
      }
      depth--;
      if (depth === 0) return nc + 6;
      i = nc + 6;
    }
    return -1;
  }
  const extractCardEnd = findDivEnd(html, cardDivStart);
  const loadingEnd = findDivEnd(html, loadingStart);
  const resultEnd = findDivEnd(html, resultStart);
  if (cardDivStart < 0 || extractCardEnd < 0 || loadingStart < 0 || loadingEnd < 0 || resultStart < 0 || resultEnd < 0) {
    throw new Error('favicon block parse failed');
  }
  toolBlocks =
    html.slice(cardDivStart, extractCardEnd) +
    '\n\n          ' +
    html.slice(loadingStart, loadingEnd) +
    '\n\n          ' +
    html.slice(resultStart, resultEnd);

  const breadcrumb = `<nav class="breadcrumb" aria-label="breadcrumb">
        <ol itemscope itemtype="https://schema.org/BreadcrumbList">
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a itemprop="item" href="/"><span itemprop="name">首页</span></a>
            <meta itemprop="position" content="1" />
          </li>
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a itemprop="item" href="/tools/extractor/"><span itemprop="name">提取器</span></a>
            <meta itemprop="position" content="2" />
          </li>
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <span itemprop="name">网站图标提取器</span>
            <meta itemprop="position" content="3" />
          </li>
        </ol>
      </nav>`;

  const newBody = `
  <body class="favicon-page">
    <div class="page-shell container">
      ${breadcrumb}
      ${headerM[0]}
      <div class="tool-workspace">
        ${toolBlocks}
      </div>
      ${seoSide}
      ${article}
      ${policyFooter()}
    </div>
    ${toast}
    ${script}
  </body>`;

  html = html.replace(/<body[\s\S]*<\/body>/i, newBody);
  html = injectCss(html, SHARED_CSS);
  // default light is better for reading? keep dark default as original - user didn't ask to change theme

  // remove GEO comment leftovers
  html = html.replace(/<!-- FAQ（GEO 优化）-->/g, '');

  fs.writeFileSync(fp, html, 'utf8');
  console.log('fixed favicon-extractor');
}

function fixHeading() {
  const fp = path.join(root, 'tools/seo/heading-analyzer.html');
  let html = fs.readFileSync(fp, 'utf8');

  // Fix breadcrumb hub
  html = html.replace(/href="\/#seo"/g, 'href="/tools/seo/"');
  html = html.replace(/>SEO 工具</g, '>SEO工具<');

  // Capture seo-content and tool pieces
  const seoContentM = html.match(/<section class="seo-content"[\s\S]*?<\/section>/i);
  if (!seoContentM) throw new Error('heading seo-content missing');
  const seoContent = seoContentM[0];

  // Remove generic sidebar
  html = html.replace(/<aside class="sidebar-section"[\s\S]*?<\/aside>/i, '');

  // Remove seo-content from inside tool-section (will reinsert after)
  html = html.replace(seoContent, '<!--SEO_CONTENT_PLACEHOLDER-->');

  // Remove footer inside tool-section and trailing mess
  html = html.replace(/<footer>[\s\S]*?<\/footer>/i, '<!--FOOTER_PLACEHOLDER-->');

  // Remove GEO comment
  html = html.replace(/<!-- FAQ（GEO 优化）-->/g, '');

  // Build useful side block
  const side = sideBlock(
    [
      '粘贴完整 HTML 或正文标题片段',
      '自动分析或点击「分析标题结构」',
      '查看评分、分布与问题列表',
      '按层级树定位跳级/重复/空标题并复制报告',
    ],
    [
      ['一个页面可以有多个 H1 吗？', '多数内容页更建议保留一个主题 H1，便于聚焦与维护。'],
      ['标题跳级会惩罚吗？', '通常不是致命项，但会降低结构清晰度，建议逐级展开。'],
      ['标题一定要塞关键词吗？', 'H1 与核心 H2 自然体现主题即可，避免机械堆砌。'],
      ['数据会上传吗？', '不会，分析在浏览器本地完成。'],
    ],
    [
      { href: '/tools/seo/image-alt-checker', name: '图片 Alt 检查' },
      { href: '/tools/seo/meta-tags-generator', name: 'Meta 标签生成' },
      { href: '/tools/seo/keyword-density', name: '关键词密度' },
      { href: '/tools/seo/', name: 'SEO 工具分类' },
    ]
  );

  // Restructure body: ensure page-shell, content-layout as column, tool only then side then seo then footer
  // Replace placeholders and clean nested structure
  // Current after removals:
  // page-shell > breadcrumb > main.content-layout > tool-section > ... <!--SEO--> <!--FOOTER--> </section> </main>

  // Fix tool-section closing: remove empty placeholders and close cleanly
  html = html.replace(
    /<!--SEO_CONTENT_PLACEHOLDER-->\s*<!--FOOTER_PLACEHOLDER-->\s*<\/section>\s*<\/main>/i,
    `</section>
        ${side}
        ${seoContent}
        ${policyFooter()}
      </main>`
  );

  // If placeholders not adjacent, try separate
  if (html.includes('<!--SEO_CONTENT_PLACEHOLDER-->')) {
    html = html.replace('<!--SEO_CONTENT_PLACEHOLDER-->', '');
  }
  if (html.includes('<!--FOOTER_PLACEHOLDER-->')) {
    html = html.replace('<!--FOOTER_PLACEHOLDER-->', '');
  }

  // Ensure body class
  html = html.replace(/<body([^>]*)>/i, (m, attrs) => {
    if (/class=/.test(attrs)) {
      return `<body${attrs.replace(/class="([^"]*)"/, 'class="$1 heading-page"')}>`;
    }
    return `<body class="heading-page"${attrs}>`;
  });

  // Ensure page-shell container
  if (!/class="[^"]*page-shell/.test(html)) {
    html = html.replace(/<div class="container">/i, '<div class="page-shell container">');
  }

  // If side/seo/footer not inserted (structure mismatch), inject before </main> or before </div> page-shell
  if (!html.includes('aria-label="使用提示"')) {
    if (/<\/main>/i.test(html)) {
      html = html.replace(
        /<\/main>/i,
        `${side}\n        ${seoContent}\n        ${policyFooter()}\n      </main>`
      );
    } else {
      html = html.replace(
        /<\/div>\s*<\/body>/i,
        `${side}\n      ${seoContent}\n      ${policyFooter()}\n    </div>\n</body>`
      );
    }
  } else if (!html.includes('class="seo-content"')) {
    html = html.replace(
      /(<section class="seo-side"[\s\S]*?<\/section>)/i,
      `$1\n        ${seoContent}`
    );
  }

  // Ensure only one seo-content
  const seoMatches = html.match(/<section class="seo-content"[\s\S]*?<\/section>/gi) || [];
  if (seoMatches.length > 1) {
    let n = 0;
    html = html.replace(/<section class="seo-content"[\s\S]*?<\/section>/gi, (m) => {
      n++;
      return n === 1 ? m : '';
    });
  }

  // Ensure footer once
  const footMatches = html.match(/<footer class="site-footer"[\s\S]*?<\/footer>/gi) || [];
  if (footMatches.length > 1) {
    let n = 0;
    html = html.replace(/<footer class="site-footer"[\s\S]*?<\/footer>/gi, (m) => {
      n++;
      return n === 1 ? m : '';
    });
  }

  // Fix breadcrumb HTML to hub if still wrong
  if (!html.includes('href="/tools/seo/"')) {
    html = html.replace(
      /<nav class="breadcrumb"[\s\S]*?<\/nav>/i,
      `<nav class="breadcrumb" aria-label="breadcrumb">
        <ol>
          <li><a href="/">首页</a></li>
          <li><a href="/tools/seo/">SEO工具</a></li>
          <li><span>标题结构分析器</span></li>
        </ol>
      </nav>`
    );
  }

  html = injectCss(html, SHARED_CSS);
  fs.writeFileSync(fp, html, 'utf8');
  console.log('fixed heading-analyzer');
}

function verify() {
  const checks = [
    {
      file: 'tools/extractor/favicon-extractor.html',
      hub: '/tools/extractor/',
      need: ['page-shell', 'seo-side', 'article-content', 'tool-workspace', 'favicon-page'],
    },
    {
      file: 'tools/seo/heading-analyzer.html',
      hub: '/tools/seo/',
      need: ['page-shell', 'seo-side', 'seo-content', 'heading-page', 'workspace'],
    },
  ];
  const out = [];
  let bad = false;
  for (const c of checks) {
    const html = fs.readFileSync(path.join(root, c.file), 'utf8');
    const open = (html.match(/<div\b/gi) || []).length;
    const close = (html.match(/<\/div>/gi) || []).length;
    const r = {
      file: c.file,
      h1: (html.match(/<h1[\s>]/gi) || []).length,
      divDiff: open - close,
      hub: html.includes(`href="${c.hub}"`),
      hasLayout: html.includes('/* layout polish: favicon + heading */'),
      noGenericSidebar: !html.includes('在主区域填写或调整参数'),
      noGeo: !html.includes('FAQ（GEO 优化）'),
      needs: Object.fromEntries(c.need.map((k) => [k, html.includes(k)])),
    };
    out.push(r);
    if (
      r.h1 !== 1 ||
      r.divDiff !== 0 ||
      !r.hub ||
      !r.hasLayout ||
      !r.noGenericSidebar ||
      !r.noGeo ||
      Object.values(r.needs).some((v) => !v)
    ) {
      bad = true;
    }
  }
  console.log(JSON.stringify(out, null, 2));
  if (bad) process.exitCode = 1;
}

fixFavicon();
fixHeading();
verify();
