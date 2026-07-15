/**
 * Restore missing side panels + responsive layout for:
 * - tools/extractor/link-extractor.html
 * - tools/extractor/regex-extractor.html
 * - tools/extractor/text-extractor.html
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const HIST = '793d35a5';

const SHARED_CSS = `
/* layout polish: extractor3 */
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

.extractor-page .header {
  display: flex !important;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px !important;
}
.extractor-page .title-group h1 {
  font-size: clamp(1.15rem, 2.4vw, 1.45rem) !important;
  line-height: 1.3;
}
.extractor-page .title-group p {
  max-width: 48rem;
}

.breadcrumb {
  display: flex !important;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  margin: 0 0 16px !important;
  padding: 10px 14px !important;
  border-radius: 12px !important;
  border: 1px solid var(--border-color, #e5e5e5) !important;
  background: var(--bg-card, #fff) !important;
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
  color: var(--accent, #0ea5e9) !important;
  text-decoration: none !important;
  font-weight: 500 !important;
}
.breadcrumb a:hover { text-decoration: underline !important; }
.breadcrumb li:last-child span {
  color: var(--text-primary, #111) !important;
  font-weight: 600 !important;
}

.main-grid {
  display: grid !important;
  grid-template-columns: 1fr !important;
  gap: 16px !important;
  align-items: start;
}
@media (min-width: 960px) {
  .main-grid {
    grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr) !important;
    gap: 20px !important;
  }
  .main-grid > .sidebar,
  .main-grid > aside {
    position: sticky;
    top: 16px;
  }
}

.main-content,
.sidebar,
aside {
  min-width: 0;
  width: 100%;
}

.card {
  margin-bottom: 16px !important;
  padding: 16px !important;
  border-radius: 14px !important;
}
@media (min-width: 768px) {
  .card { padding: 20px 22px !important; }
}

textarea,
input[type="text"] {
  font-size: 16px !important;
  max-width: 100%;
}

.btn,
.btn-primary,
.btn-secondary {
  min-height: 44px;
}

.btn-group {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 8px !important;
}
.btn-group .btn {
  flex: 1 1 auto;
}
@media (max-width: 560px) {
  .btn-group .btn {
    flex: 1 1 100%;
  }
}

.regex-input-wrapper {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 10px !important;
  align-items: stretch;
}
.regex-field {
  flex: 1 1 220px;
  min-width: 0;
}
.flags-group {
  display: flex !important;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.flag-label {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
}

.presets-grid {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 8px !important;
  margin: 12px 0 16px !important;
}
.preset-tag {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  padding: 6px 12px !important;
  cursor: pointer;
}

.highlight-box,
.source-text-wrapper textarea,
#sourceText,
#inputText,
#inputArea {
  max-height: min(48vh, 420px);
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  word-break: break-word;
}

.stats-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  gap: 8px !important;
}
.actions-group .btn { width: 100%; }

.results-list,
#resultsList {
  max-height: min(50vh, 480px) !important;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

.results-grid {
  grid-template-columns: 1fr !important;
}
@media (min-width: 640px) {
  .results-grid {
    grid-template-columns: 1fr 1fr !important;
  }
}

.item,
.link-item,
.match-item {
  word-break: break-all;
}

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
.seo-side .seo-card {
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 14px;
  padding: 14px 16px;
  background: var(--bg-card, #fff);
  min-width: 0;
}
.seo-side h2 {
  font-size: 1rem !important;
  margin: 0 0 8px !important;
  color: var(--text-primary, #1a1a1a) !important;
  text-transform: none !important;
  letter-spacing: 0 !important;
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
  min-height: 36px;
  border-radius: 999px;
  border: 1px solid var(--border-color, #e5e7eb);
  text-decoration: none;
  color: var(--text-secondary, #64748b) !important;
  font-size: 0.85rem;
  background: var(--bg-input, #f8fafc);
}
.related-tools a:hover {
  color: var(--accent, #0ea5e9) !important;
  border-color: currentColor;
}

.article-content {
  margin-top: 16px !important;
  padding: 18px 16px 20px !important;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 16px;
  background: var(--bg-card, #fff);
  box-shadow: 0 6px 24px rgba(15, 23, 42, 0.05);
  line-height: 1.8;
  min-width: 0;
}
@media (min-width: 768px) {
  .article-content { padding: 22px !important; }
}
.article-content h2 {
  font-size: 1.15rem !important;
  margin: 1.1rem 0 0.5rem !important;
  color: var(--text-primary, #1a1a1a) !important;
}
.article-content h2:first-child { margin-top: 0 !important; }
.article-content p,
.article-content li {
  color: var(--text-secondary, #475569) !important;
}

.site-footer {
  margin-top: 28px !important;
  padding-top: 16px !important;
  border-top: 1px solid var(--border-color, #e5e7eb);
  text-align: center;
  color: var(--text-muted, #64748b);
  font-size: 0.875rem;
}
.site-footer nav {
  display: flex !important;
  flex-wrap: wrap !important;
  justify-content: center !important;
  gap: 10px 16px !important;
  font-size: 13px !important;
  margin-top: 12px !important;
}
.site-footer a {
  color: var(--text-secondary, #64748b);
  text-decoration: none;
}
.site-footer a:hover { color: var(--accent, #0ea5e9); }

.toast {
  left: 16px !important;
  right: 16px !important;
  bottom: 16px !important;
  text-align: center;
}
@media (min-width: 640px) {
  .toast {
    left: auto !important;
    right: 24px !important;
    bottom: 24px !important;
    text-align: left;
  }
}

/* keep article outside narrow left column on mobile/desktop flow */
.main-content > .article-content {
  /* will be moved out by script */
}
`;

function gitShow(file) {
  return execSync(`git show ${HIST}:${file}`, {
    cwd: root,
    maxBuffer: 20 * 1024 * 1024,
    encoding: 'buffer',
  }).toString('utf8');
}

function extractRightPanel(histHtml) {
  // From "<!-- 右侧" up to but not including </main>
  const idx = histHtml.indexOf('<!-- 右侧');
  if (idx < 0) return null;
  const end = histHtml.indexOf('</main>', idx);
  if (end < 0) return null;
  return histHtml.slice(idx, end).trim();
}

function injectCss(html, css) {
  if (html.includes('/* layout polish: extractor3 */')) {
    return html.replace(
      /\/\* layout polish: extractor3 \*\/[\s\S]*?(?=<\/style>)/i,
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

function policyFooter(copy) {
  return `<footer class="site-footer">
  <p>${copy}</p>
  <nav data-site-policy-links aria-label="网站政策">
    <a href="/about">关于本站</a>
    <a href="/contact">联系我们</a>
    <a href="/terms">使用条款</a>
    <a href="/privacy-policy">隐私政策</a>
  </nav>
</footer>`;
}

function cleanArticle(articleHtml) {
  return articleHtml
    .replace(/class="article-content"/, 'class="article-content"')
    .trim();
}

function restructureExtractor(opts) {
  const { rel, title, how, faq, related, footerCopy, neededIds } = opts;
  const fp = path.join(root, rel);
  let html = fs.readFileSync(fp, 'utf8');
  const hist = gitShow(rel);

  // Capture article
  const articleM = html.match(/<article class="article-content"[\s\S]*?<\/article>/i);
  const article = articleM ? cleanArticle(articleM[0]) : '';

  // Capture toast + scripts after container
  const toastM = html.match(/<div id="toast"[\s\S]*?<\/div>/i);
  const toast = toastM ? toastM[0] : '<div id="toast" class="toast">已复制到剪贴板</div>';

  // All body scripts (non-adsense)
  const bodyM = html.match(/<body[\s\S]*<\/body>/i);
  if (!bodyM) throw new Error(`${rel}: no body`);
  const bodyHtml = bodyM[0];
  const scripts = [];
  const scriptRe = /<script(?![^>]*src=)[\s\S]*?<\/script>/gi;
  let sm;
  while ((sm = scriptRe.exec(bodyHtml)) !== null) {
    if (!sm[0].includes('adsbygoogle')) scripts.push(sm[0]);
  }

  // Header
  const headerM = html.match(/<header class="header">[\s\S]*?<\/header>/i);
  if (!headerM) throw new Error(`${rel}: no header`);

  // Breadcrumb
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
            <span itemprop="name">${title}</span>
            <meta itemprop="position" content="3" />
          </li>
        </ol>
      </nav>`;

  // Tool cards from current main-content without article
  const mainContentM = html.match(
    /<div class="main-content">([\s\S]*?)<\/div>\s*(?:<!-- 右侧|<\/main>)/i
  );
  let toolCards = '';
  if (mainContentM) {
    toolCards = mainContentM[1]
      .replace(/<article class="article-content"[\s\S]*?<\/article>/i, '')
      .trim();
  } else {
    // fallback: first card blocks
    const cardBlocks = html.match(/<div class="card"[\s\S]*?<\/div>\s*(?=<div class="card"|<!-- 文章|<article)/gi);
    toolCards = (cardBlocks || []).join('\n');
  }

  // Right panel from history
  let right = extractRightPanel(hist);
  if (!right) {
    // build minimal based on needed ids
    right = buildFallbackPanel(neededIds);
  } else {
    // strip ad placeholders
    right = right
      .replace(/<div class="ad-placeholder"[\s\S]*?<\/div>/gi, '')
      .replace(/<!-- 右侧[^\n]*-->\s*/i, '')
      .trim();
    // ensure wrapped as sidebar
    if (!/class="sidebar"|class="aside"|<aside/i.test(right)) {
      // historical may use <div class="sidebar"> or just cards
      if (!/^<(div|aside)\b/i.test(right)) {
        right = `<aside class="sidebar">\n${right}\n</aside>`;
      } else {
        right = right.replace(/^<div\b/i, '<aside').replace(/<\/div>\s*$/i, '</aside>');
      }
    }
    // normalize class
    right = right
      .replace(/class="sidebar"/i, 'class="sidebar"')
      .replace(/<aside(?![^>]*class=)/i, '<aside class="sidebar"');
  }

  // Ensure needed IDs exist
  for (const id of neededIds) {
    if (!right.includes(`id="${id}"`) && !toolCards.includes(`id="${id}"`)) {
      console.warn(`WARN ${rel}: missing #${id}, will inject fallback panel`);
      right = buildFallbackPanel(neededIds);
      break;
    }
  }

  // Soften scripts that assume side nodes always exist (guard null)
  let joinedScripts = scripts.join('\n\n');
  joinedScripts = guardScript(joinedScripts, neededIds);

  const seoSide = sideBlock(how, faq, related);

  const newBody = `
  <body class="extractor-page">
    <div class="page-shell container">
      ${breadcrumb}
      ${headerM[0]}
      <main class="main-grid">
        <div class="main-content">
          ${toolCards}
        </div>
        ${right}
      </main>
      ${seoSide}
      ${article}
      ${policyFooter(footerCopy)}
    </div>
    ${toast}
    ${joinedScripts}
  </body>`;

  html = html.replace(/<body[\s\S]*<\/body>/i, newBody);
  html = injectCss(html, SHARED_CSS);
  html = html.replace(/<!-- FAQ（GEO 优化）-->/g, '');
  html = html.replace(/href="\/#extractor"/g, 'href="/tools/extractor/"');

  // Fix regex escapeHtml bug if present ( > not escaped)
  html = html.replace(
    /\.replace\(>\s*,\s*">"\)/,
    '.replace(/>/g, "&gt;")'
  );
  // common bug: .replace(/>/g, ">") 
  html = html.replace(
    /\.replace\(\/>\/g,\s*">"\)/,
    '.replace(/>/g, "&gt;")'
  );

  fs.writeFileSync(fp, html, 'utf8');
  console.log('fixed', rel);
  return html;
}

function buildFallbackPanel(neededIds) {
  if (neededIds.includes('statMatches')) {
    return `<aside class="sidebar">
        <div class="card">
          <div class="card-title">匹配统计</div>
          <div class="stats-grid">
            <div class="stat-card"><span class="stat-val" id="statMatches">0</span><div class="stat-label">匹配数</div></div>
            <div class="stat-card"><span class="stat-val" id="statUnique">0</span><div class="stat-label">去重后</div></div>
            <div class="stat-card"><span class="stat-val" id="statGroups">0</span><div class="stat-label">捕获组</div></div>
          </div>
          <div class="actions-group">
            <button class="btn btn-secondary" onclick="copyAllMatches()">复制全部</button>
            <button class="btn btn-secondary" onclick="copyUniqueMatches()">复制去重</button>
            <button class="btn btn-secondary" onclick="exportCSV()">导出 CSV</button>
          </div>
          <div class="card-title">匹配结果</div>
          <div class="results-list" id="resultsList">
            <div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.875rem;">等待输入正则表达式...</div>
          </div>
        </div>
      </aside>`;
  }
  if (neededIds.includes('statsBox')) {
    return `<aside class="sidebar">
        <div class="card">
          <div class="card-title">提取统计</div>
          <div id="statsBox">
            <p style="color: var(--text-muted); font-size: 0.875rem; margin: 0;">粘贴文本并点击提取后，这里会显示各类型数量。</p>
          </div>
        </div>
        <div class="card">
          <div class="card-title">使用提示</div>
          <ul style="margin:0 0 0 1rem;font-size:0.9rem;color:var(--text-secondary);line-height:1.7">
            <li>支持邮箱、手机号、URL、IP、MAC、UUID 等</li>
            <li>点击结果标签即可复制</li>
            <li>数据仅在浏览器本地处理</li>
          </ul>
        </div>
      </aside>`;
  }
  // link extractor - results already in main, provide tips sidebar
  return `<aside class="sidebar">
        <div class="card">
          <div class="card-title">使用提示</div>
          <ul style="margin:0 0 0 1rem;font-size:0.9rem;color:var(--text-secondary);line-height:1.7">
            <li>支持 HTML 与纯文本</li>
            <li>自动识别 href 与完整 URL</li>
            <li>结果去重后可一键复制</li>
            <li>全部在本地浏览器处理</li>
          </ul>
        </div>
        <div class="card">
          <div class="card-title">相关工具</div>
          <div class="related-tools">
            <a href="/tools/extractor/text-extractor">文本提取</a>
            <a href="/tools/extractor/regex-extractor">正则提取</a>
            <a href="/tools/extractor/favicon-extractor">图标提取</a>
            <a href="/tools/extractor/">提取器分类</a>
          </div>
        </div>
      </aside>`;
}

function guardScript(script, neededIds) {
  // Soft null-guards for critical nodes to avoid hard crashes
  if (neededIds.includes('resultsList')) {
    script = script.replace(
      /const resultsList = document\.getElementById\("resultsList"\);/,
      'const resultsList = document.getElementById("resultsList");\n      if (!resultsList) console.warn("resultsList missing");'
    );
  }
  if (neededIds.includes('statsBox')) {
    script = script.replace(
      /statsBox\.innerHTML = statsHtml;/,
      'if (statsBox) statsBox.innerHTML = statsHtml;'
    );
    script = script.replace(
      /const statsBox = document\.getElementById\("statsBox"\);/,
      'const statsBox = document.getElementById("statsBox");'
    );
  }
  // guard updateStats
  if (script.includes('function updateStats')) {
    script = script.replace(
      /function updateStats\(total, unique, groups\) \{\s*document\.getElementById\("statMatches"\)\.textContent = total;\s*document\.getElementById\("statUnique"\)\.textContent = unique;\s*document\.getElementById\("statGroups"\)\.textContent = groups;\s*\}/,
      `function updateStats(total, unique, groups) {
        const a = document.getElementById("statMatches");
        const b = document.getElementById("statUnique");
        const c = document.getElementById("statGroups");
        if (a) a.textContent = total;
        if (b) b.textContent = unique;
        if (c) c.textContent = groups;
      }`
    );
  }
  // guard resultsList.innerHTML assignments
  script = script.replace(
    /resultsList\.innerHTML =/g,
    'if (resultsList) resultsList.innerHTML ='
  );
  return script;
}

function countDivDiff(html) {
  const open = (html.match(/<div\b/gi) || []).length;
  const close = (html.match(/<\/div>/gi) || []).length;
  return open - close;
}

function verify(files) {
  const out = [];
  let bad = false;
  for (const f of files) {
    const html = fs.readFileSync(path.join(root, f.rel), 'utf8');
    const r = {
      file: f.rel,
      h1: (html.match(/<h1[\s>]/gi) || []).length,
      divDiff: countDivDiff(html),
      pageShell: /class="[^"]*page-shell/.test(html),
      hub: html.includes('href="/tools/extractor/"'),
      layoutCss: html.includes('/* layout polish: extractor3 */'),
      hasSidebar: /class="sidebar"/.test(html) || /<aside/i.test(html),
      article: html.includes('article-content'),
      seoSide: html.includes('seo-side'),
      ids: Object.fromEntries(f.neededIds.map((id) => [id, html.includes(`id="${id}"`)])),
      noGeo: !html.includes('FAQ（GEO 优化）'),
    };
    out.push(r);
    if (
      r.h1 !== 1 ||
      r.divDiff !== 0 ||
      !r.pageShell ||
      !r.hub ||
      !r.layoutCss ||
      !r.hasSidebar ||
      !r.article ||
      !r.seoSide ||
      Object.values(r.ids).some((v) => !v) ||
      !r.noGeo
    ) {
      bad = true;
    }
  }
  console.log(JSON.stringify(out, null, 2));
  if (bad) process.exitCode = 1;
}

const pages = [
  {
    rel: 'tools/extractor/link-extractor.html',
    title: '链接提取器',
    neededIds: ['inputText', 'resultsCard', 'statsBar', 'resultsList'],
    how: [
      '粘贴 HTML 或含链接的文本',
      '点击「提取链接」',
      '查看去重结果并复制单条或全部',
      '可清空后继续处理下一段内容',
    ],
    faq: [
      ['支持相对路径吗？', '支持提取 href 中的相对路径与完整 http(s) 链接。'],
      ['会去重吗？', '会，相同链接只保留一次。'],
      ['数据会上传吗？', '不会，全部在浏览器本地完成。'],
      ['适合 SEO 吗？', '适合快速整理内外链清单，再配合其他 SEO 工具分析。'],
    ],
    related: [
      { href: '/tools/extractor/text-extractor', name: '文本提取' },
      { href: '/tools/extractor/regex-extractor', name: '正则提取' },
      { href: '/tools/extractor/favicon-extractor', name: '图标提取' },
      { href: '/tools/extractor/', name: '提取器分类' },
    ],
    footerCopy: '© 2026 WebUtils. 简单、高效的链接提取工具。',
  },
  {
    rel: 'tools/extractor/regex-extractor.html',
    title: '正则提取器',
    neededIds: ['regexInput', 'sourceText', 'highlightPreview', 'resultsList', 'statMatches', 'statUnique', 'statGroups'],
    how: [
      '输入正则或点选预设（邮箱/手机号等）',
      '粘贴待匹配文本',
      '实时查看高亮与匹配列表',
      '复制全部、去重结果或导出 CSV',
    ],
    faq: [
      ['支持捕获组吗？', '支持，匹配项会展示 $1、$2 等分组内容。'],
      ['标志位有哪些？', '支持 g / i / m / s 常见 JavaScript 正则标志。'],
      ['正则写错会怎样？', '会提示无效表达式，不会中断页面。'],
      ['数据会上传吗？', '不会，匹配完全在本地执行。'],
    ],
    related: [
      { href: '/tools/extractor/text-extractor', name: '文本提取' },
      { href: '/tools/extractor/link-extractor', name: '链接提取' },
      { href: '/tools/seo/keyword-density', name: '关键词密度' },
      { href: '/tools/extractor/', name: '提取器分类' },
    ],
    footerCopy: '© 2026 WebUtils. 简单、精准的正则处理工具。',
  },
  {
    rel: 'tools/extractor/text-extractor.html',
    title: '文本信息提取器',
    neededIds: ['inputArea', 'resultsGrid', 'statsBox'],
    how: [
      '粘贴日志、网页片段或混杂文本',
      '点击「一键提取信息」',
      '按类型查看 IP / 邮箱 / 手机号等',
      '点击标签即可复制单条结果',
    ],
    faq: [
      ['能提取哪些类型？', 'IPv4、邮箱、URL、手机号、MAC、UUID、域名等。'],
      ['结果会去重吗？', '同类型内会去重后展示。'],
      ['适合处理日志吗？', '适合从日志/HTML/笔记中快速捞关键字段。'],
      ['数据会上传吗？', '不会，正则匹配在浏览器本地完成。'],
    ],
    related: [
      { href: '/tools/extractor/regex-extractor', name: '正则提取' },
      { href: '/tools/extractor/link-extractor', name: '链接提取' },
      { href: '/tools/extractor/favicon-extractor', name: '图标提取' },
      { href: '/tools/extractor/', name: '提取器分类' },
    ],
    footerCopy: '© 2026 WebUtils. 简单、专业的文本信息提取工具。',
  },
];

for (const p of pages) restructureExtractor(p);
verify(pages);
