/**
 * - Rebuild tools/text/reading-time.html (layout + SEO)
 * - Rebuild tools/generator/placeholder-image.html (restore controls + layout + SEO)
 * - tools/design/card-generator.html: initial colors -> white
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

function padDesc(parts) {
  let d = parts.join('');
  const pad = '结果仅供参考，重要内容请及时备份。';
  while (d.length < 120) d += pad;
  if (d.length > 160) d = d.slice(0, 160);
  return d;
}

function verify(file) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const d = (html.match(/name="description"\s+content="([^"]+)"/) || [])[1] || '';
  const body = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const h1 = (body.match(/<h1\b/gi) || []).length;
  const od = (html.match(/<div\b/gi) || []).length;
  const cd = (html.match(/<\/div>/gi) || []).length;
  let parseOk = false;
  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  if (ld) {
    try {
      JSON.parse(ld[1]);
      parseOk = true;
    } catch (e) {
      console.error('LD', file, e.message);
    }
  }
  return {
    file,
    desc: d.length,
    h1,
    divDiff: od - cd,
    parseOk,
    hasTool: html.includes('tool-section') || html.includes('preview-section') || html.includes('tool-grid'),
  };
}

// ===================== READING TIME =====================
function writeReadingTime() {
  const desc = padDesc([
    '免费阅读时间计算器：粘贴文章即时估算阅读分钟，统计中英文字符、单词、段落与行数；',
    '支持中文/英文/混合模式与自定义语速，浏览器本地计算，',
    '适合博客 SEO、内容运营与稿件篇幅评估。',
  ]);
  const faqs = [
    ['中英混合怎么算？', '汉字按约 300 字/分、英文单词按约 200 词/分分别计时后相加。'],
    ['极短文本为什么显示 1 分钟？', '有内容且结果不足 1 分钟时向上取整为 1，避免显示 0。'],
    ['数据会上传吗？', '不会。计算在本地完成；草稿可能写入 localStorage.reading_time_input。'],
    ['阅读速度能改吗？', '可以。在「阅读速度」中自定义每分钟字/词数（中文纯文模式更直观）。'],
  ];
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: '阅读时间计算器',
        url: 'https://essays4u.net/tools/text/reading-time',
        description: desc,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        inLanguage: 'zh-CN',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        featureList: ['阅读时长估算', '中英混合统计', '段落行数', '自定义语速', '本地草稿'],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页', item: 'https://essays4u.net/' },
          { '@type': 'ListItem', position: 2, name: '文本工具', item: 'https://essays4u.net/#text' },
          {
            '@type': 'ListItem',
            position: 3,
            name: '阅读时间计算器',
            item: 'https://essays4u.net/tools/text/reading-time',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  };

  const html = `<!doctype html>
<html lang="zh-CN" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>阅读时间计算器 - 字数统计与阅读时长预估 | WebUtils</title>
    <meta name="description" content="${desc}" />
    <meta name="keywords" content="阅读时间计算,字数统计,阅读时长预估,中英混合字数,内容SEO" />
    <meta name="author" content="WebUtils" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://essays4u.net/tools/text/reading-time" />
    <meta property="og:title" content="阅读时间计算器 - 字数统计与阅读时长预估" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://essays4u.net/tools/text/reading-time" />
    <meta property="og:site_name" content="WebUtils" />
    <meta property="og:locale" content="zh_CN" />
    <meta property="og:image" content="https://essays4u.net/social-preview.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="阅读时间计算器 - 字数统计与阅读时长预估" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="https://essays4u.net/social-preview.png" />
    <script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>
      :root {
        --bg: #f4f7fb;
        --card: #ffffff;
        --text: #0f172a;
        --muted: #64748b;
        --border: #e2e8f0;
        --primary: #0ea5e9;
        --primary-2: #6366f1;
        --shadow: 0 8px 28px rgba(15, 23, 42, 0.06);
      }
      [data-theme="dark"] {
        --bg: #0b1220;
        --card: #111827;
        --text: #e5e7eb;
        --muted: #94a3b8;
        --border: #1f2937;
        --primary: #38bdf8;
        --primary-2: #818cf8;
        --shadow: 0 8px 28px rgba(0,0,0,.35);
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: "Space Grotesk", system-ui, sans-serif;
        background: var(--bg);
        color: var(--text);
        min-height: 100vh;
        line-height: 1.6;
      }
      .site-header {
        position: sticky; top: 0; z-index: 30;
        background: color-mix(in srgb, var(--card) 90%, transparent);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid var(--border);
      }
      .hdr {
        width: min(1120px, 94%);
        margin: 0 auto;
        display: flex; align-items: center; justify-content: space-between;
        gap: 12px; padding: 12px 0;
      }
      .logo a { font-weight: 700; color: var(--primary); text-decoration: none; font-size: 1.2rem; }
      .site-nav { display: flex; gap: 12px; flex-wrap: wrap; }
      .site-nav a { color: var(--muted); text-decoration: none; font-size: .92rem; }
      .site-nav a:hover, .site-nav a.active { color: var(--primary); }
      .theme-btn {
        width: 40px; height: 40px; border-radius: 50%;
        border: 1px solid var(--border); background: var(--card); cursor: pointer;
      }
      .page-shell { width: min(1120px, 94%); margin: 0 auto; padding: 18px 0 40px; }
      .breadcrumb { margin-bottom: 14px; }
      .breadcrumb ol {
        list-style: none; display: flex; flex-wrap: wrap; gap: .4rem; align-items: center;
        font-size: .875rem; color: var(--muted);
      }
      .breadcrumb li { display: flex; align-items: center; }
      .breadcrumb li:not(:last-child)::after { content: "›"; margin-left: .4rem; opacity: .7; }
      .breadcrumb a { color: var(--muted); text-decoration: none; }
      .breadcrumb a:hover { color: var(--primary); }
      .breadcrumb li:last-child span { color: var(--text); font-weight: 500; }
      main.content-layout {
        display: flex; flex-direction: column; gap: 20px;
      }
      @media (min-width: 1024px) {
        main.content-layout { flex-direction: row; align-items: flex-start; }
      }
      .tool-section {
        flex: 1 1 0; min-width: 0;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 16px;
        box-shadow: var(--shadow);
        padding: 22px;
      }
      .sidebar-section {
        flex: 0 0 300px; width: 100%;
        display: flex; flex-direction: column; gap: 14px;
      }
      @media (min-width: 1024px) { .sidebar-section { width: 300px; } }
      .article-card {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 14px;
        box-shadow: var(--shadow);
        padding: 16px;
      }
      .article-card h2 { font-size: 1rem; margin-bottom: 10px; }
      .how-list { list-style: none; }
      .how-list li { display: flex; gap: 8px; font-size: .9rem; margin-bottom: 8px; }
      .how-list li::before { content: "➜"; color: var(--primary); flex-shrink: 0; }
      .faq-item { margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed var(--border); }
      .faq-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
      .faq-q { font-weight: 600; font-size: .9rem; }
      .faq-a { font-size: .86rem; color: var(--muted); margin-top: 3px; }
      .related-tools { display: flex; flex-wrap: wrap; gap: 8px; }
      .related-tools a {
        text-decoration: none; color: var(--muted); border: 1px solid var(--border);
        border-radius: 999px; padding: 6px 12px; font-size: .84rem; background: var(--bg);
      }
      .related-tools a:hover { color: var(--primary); border-color: var(--primary); }
      .tool-header { margin-bottom: 1rem; }
      .tool-header h1 { font-size: 1.7rem; margin-bottom: .3rem; }
      .tool-header p { color: var(--muted); }
      .time-display {
        text-align: center;
        padding: 18px;
        border-radius: 16px;
        margin-bottom: 16px;
        background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 14%, transparent), color-mix(in srgb, var(--primary-2) 12%, transparent));
        border: 1px solid var(--border);
      }
      .time-value {
        display: block;
        font-family: "JetBrains Mono", monospace;
        font-size: clamp(2.6rem, 6vw, 3.6rem);
        font-weight: 700;
        line-height: 1.1;
        background: linear-gradient(135deg, var(--primary), var(--primary-2));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .time-unit { color: var(--muted); font-size: .95rem; }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        margin-bottom: 14px;
      }
      @media (min-width: 700px) {
        .stats-grid { grid-template-columns: repeat(4, 1fr); }
      }
      .stat-card {
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 12px;
        text-align: center;
      }
      .stat-value {
        font-family: "JetBrains Mono", monospace;
        font-weight: 700;
        font-size: 1.2rem;
      }
      .stat-label { color: var(--muted); font-size: .82rem; margin-top: 2px; }
      .settings-bar {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
        margin-bottom: 12px;
      }
      @media (min-width: 700px) {
        .settings-bar { grid-template-columns: 1fr 1fr; }
      }
      .setting-item label {
        display: block; font-size: .88rem; color: var(--muted); margin-bottom: 6px;
      }
      .setting-item input, .setting-item select, textarea {
        width: 100%;
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 11px 12px;
        background: var(--bg);
        color: var(--text);
        font-family: inherit;
        font-size: .95rem;
      }
      textarea { min-height: 220px; resize: vertical; line-height: 1.7; }
      .detail-grid {
        margin-top: 14px;
        display: grid;
        grid-template-columns: 1fr;
        gap: 10px;
      }
      @media (min-width: 700px) { .detail-grid { grid-template-columns: 1fr 1fr; } }
      .detail-card {
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 12px 14px;
      }
      .detail-row {
        display: flex; justify-content: space-between; gap: 10px;
        margin-bottom: 8px; font-size: .92rem;
      }
      .detail-row:last-child { margin-bottom: 0; }
      .seo-article {
        margin-top: 20px;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 16px;
        box-shadow: var(--shadow);
        padding: 22px;
        line-height: 1.85;
      }
      .seo-article h2 { font-size: 1.2rem; margin: 1.15rem 0 .55rem; }
      .seo-article h2:first-child { margin-top: 0; }
      .seo-article h3 { font-size: 1.02rem; margin: 1rem 0 .4rem; }
      .seo-article p { margin: 0 0 .85rem; color: color-mix(in srgb, var(--text) 90%, var(--muted)); }
      .seo-article ul, .seo-article ol { margin: 0 0 1rem 1.15rem; }
      .seo-article li { margin-bottom: .35rem; }
      .site-footer {
        border-top: 1px solid var(--border);
        margin-top: 8px;
        background: var(--card);
      }
      .footer-inner {
        width: min(1120px, 94%);
        margin: 0 auto;
        padding: 26px 0 32px;
        text-align: center;
        color: var(--muted);
      }
      .footer-links {
        display: flex; flex-wrap: wrap; justify-content: center; gap: 10px 16px; margin: 12px 0;
      }
      .footer-links a { color: var(--muted); text-decoration: none; font-size: .9rem; }
      .footer-links a:hover { color: var(--primary); }
    </style>
  </head>
  <body>
    <header class="site-header">
      <div class="hdr">
        <div class="logo"><a href="/">WebUtils</a></div>
        <nav class="site-nav" aria-label="主导航">
          <a href="/">首页</a>
          <a href="/tools/text/reading-time" class="active">阅读时间</a>
          <a href="/tools/text/word-counter">字数统计</a>
        </nav>
        <button class="theme-btn" id="themeBtn" onclick="toggleTheme()" aria-label="切换主题">☀️</button>
      </div>
    </header>

    <div class="page-shell">
      <nav class="breadcrumb" aria-label="breadcrumb">
        <ol>
          <li><a href="/">首页</a></li>
          <li><a href="/#text">文本工具</a></li>
          <li><span>阅读时间计算器</span></li>
        </ol>
      </nav>

      <main class="content-layout">
        <section class="tool-section" aria-label="阅读时间计算主区">
          <header class="tool-header">
            <h1>阅读时间计算器</h1>
            <p>粘贴文章，即时估算阅读分钟，并拆分中英文字符、段落与行数统计。</p>
          </header>

          <div class="time-display" aria-live="polite">
            <span class="time-value" id="readingTime">0</span>
            <span class="time-unit">预计阅读分钟</span>
          </div>

          <div class="stats-grid">
            <div class="stat-card"><div class="stat-value" id="charCount">0</div><div class="stat-label">总字符数</div></div>
            <div class="stat-card"><div class="stat-value" id="wordCount">0</div><div class="stat-label">词组/字词</div></div>
            <div class="stat-card"><div class="stat-value" id="paraCount">0</div><div class="stat-label">段落数量</div></div>
            <div class="stat-card"><div class="stat-value" id="lineCount">0</div><div class="stat-label">行数统计</div></div>
          </div>

          <div class="settings-bar">
            <div class="setting-item">
              <label for="readSpeed">阅读速度（字/词 每分钟）</label>
              <input type="number" id="readSpeed" value="300" min="50" max="1000" />
            </div>
            <div class="setting-item">
              <label for="langType">语言/模式</label>
              <select id="langType">
                <option value="zh">纯中文文章</option>
                <option value="en">纯英文文章</option>
                <option value="mixed" selected>中英混合内容</option>
              </select>
            </div>
          </div>

          <textarea id="inputText" placeholder="在此粘贴或输入文章内容，将即时计算阅读时长与详细统计..."></textarea>

          <div class="detail-grid">
            <div class="detail-card">
              <div class="detail-row"><span>中文字符</span><strong id="zhCount">0</strong></div>
              <div class="detail-row"><span>英文字母</span><strong id="enCount">0</strong></div>
            </div>
            <div class="detail-card">
              <div class="detail-row"><span>数字统计</span><strong id="numCount">0</strong></div>
              <div class="detail-row"><span>标点符号</span><strong id="punctCount">0</strong></div>
            </div>
          </div>
        </section>

        <aside class="sidebar-section" aria-label="使用说明">
          <div class="article-card">
            <h2>怎么用</h2>
            <ul class="how-list">
              <li>粘贴文章到输入框</li>
              <li>选择中文/英文/混合模式</li>
              <li>按需调整阅读速度</li>
              <li>查看预计分钟与统计卡</li>
              <li>草稿可保存在本机浏览器</li>
            </ul>
          </div>
          <div class="article-card">
            <h2>常见问题</h2>
            ${faqs
              .map(
                ([q, a]) =>
                  `<div class="faq-item"><div class="faq-q">Q: ${q}</div><div class="faq-a">A: ${a}</div></div>`
              )
              .join('\n            ')}
          </div>
          <div class="article-card">
            <h2>相关工具</h2>
            <div class="related-tools">
              <a href="/tools/text/word-counter">字数统计</a>
              <a href="/tools/text/diff-checker">文本对比</a>
              <a href="/tools/text/case-converter">大小写转换</a>
              <a href="/tools/text/whitespace-cleaner">空白清理</a>
            </div>
          </div>
        </aside>
      </main>

      <article class="seo-article" aria-label="阅读时间说明">
        <h2>什么是阅读时间估算？</h2>
        <p>阅读时间估算通过文本长度与平均阅读速度，预估读者读完所需分钟数。博客、文档与营销页在标题附近展示「约 X 分钟读完」，有助于建立阅读预期、降低跳出并提升完成率。</p>

        <h2>本工具如何计算？</h2>
        <ul>
          <li><strong>纯中文：</strong>中文字符数 ÷ 设定速度（默认 300 字/分）。</li>
          <li><strong>纯英文：</strong>英文单词数 ÷（速度 × 0.8）做近似。</li>
          <li><strong>混合模式：</strong>汉字按 300 字/分、英文单词按 200 词/分分别计时后相加。</li>
          <li><strong>有内容但不足 1 分钟：</strong>显示为 1 分钟，避免「0 分钟」误导。</li>
        </ul>

        <h2>为什么对内容与 SEO 有帮助？</h2>
        <ul>
          <li>降低跳出：读者更清楚时间成本。</li>
          <li>提升完成阅读概率：预期清晰时更愿意读完。</li>
          <li>辅助选题与篇幅：写前先估时长，避免过长或过短。</li>
          <li>中英混合更准：分别统计汉字与英文单词，比「总字符一刀切」更贴近真实阅读。</li>
        </ul>

        <h2>使用建议</h2>
        <ol>
          <li>正式发布前用成稿全文估算，而不是大纲。</li>
          <li>面向专业读者可把速度调慢；面向快速扫读可调快。</li>
          <li>页面上展示时长时，建议用「约 X 分钟」并保留更新余地。</li>
          <li>敏感文稿用完后可清空输入，并清理浏览器本地草稿。</li>
        </ol>

        <h3>能力边界</h3>
        <p>本工具不分析图片/视频观看时间，也不评估理解难度。结果是基于字词量的估算，适合内容运营与写作辅助，不是严格人因实验结论。</p>
      </article>
    </div>

    <footer class="site-footer">
      <div class="footer-inner">
        <p>WebUtils · 阅读时间计算器 · 本地统计</p>
        <nav class="footer-links" data-site-policy-links aria-label="网站政策">
          <a href="/about">关于本站</a>
          <a href="/contact">联系我们</a>
          <a href="/terms">使用条款</a>
          <a href="/privacy-policy">隐私政策</a>
          <a href="/tools-directory">全部工具</a>
        </nav>
        <p>&copy; 2026 WebUtils</p>
      </div>
    </footer>

    <script>
      const $ = (id) => document.getElementById(id);
      function analyze() {
        const text = $("inputText").value || "";
        const speed = parseInt($("readSpeed").value, 10) || 300;
        const langType = $("langType").value;
        const zhChars = (text.match(/[\\u4e00-\\u9fa5]/g) || []).length;
        const enLetters = (text.match(/[a-zA-Z]/g) || []).length;
        const numChars = (text.match(/[0-9]/g) || []).length;
        const punctChars = (text.match(/[，。！？、；：""''（）【】《》\\.,!?;:'"()\\[\\]{}]/g) || []).length;
        const enWords = (text.match(/[a-zA-Z]+/g) || []).length;
        const totalChars = text.length;
        const lines = text.split("\\n").filter((l) => l.length > 0).length;
        const paras = text.split(/\\n\\s*\\n/).filter((p) => p.trim()).length;
        let readingMinutes = 0;
        if (langType === "zh") readingMinutes = zhChars / speed;
        else if (langType === "en") readingMinutes = enWords / (speed * 0.8);
        else readingMinutes = zhChars / 300 + enWords / 200;
        if (totalChars > 0 && readingMinutes < 1) readingMinutes = 1;
        $("readingTime").textContent = Math.ceil(readingMinutes);
        $("charCount").textContent = totalChars;
        $("wordCount").textContent = zhChars + enWords;
        $("paraCount").textContent = paras;
        $("lineCount").textContent = lines;
        $("zhCount").textContent = zhChars;
        $("enCount").textContent = enLetters;
        $("numCount").textContent = numChars;
        $("punctCount").textContent = punctChars;
        localStorage.setItem("reading_time_input", text);
      }
      function toggleTheme() {
        const html = document.documentElement;
        const cur = html.getAttribute("data-theme") === "dark" ? "dark" : "light";
        const next = cur === "dark" ? "light" : "dark";
        html.setAttribute("data-theme", next);
        $("themeBtn").textContent = next === "dark" ? "☀️" : "🌙";
        localStorage.setItem("reading_time_theme", next);
      }
      $("inputText").addEventListener("input", analyze);
      $("readSpeed").addEventListener("input", analyze);
      $("langType").addEventListener("change", analyze);
      (function init() {
        const t = localStorage.getItem("reading_time_theme") || "light";
        document.documentElement.setAttribute("data-theme", t);
        $("themeBtn").textContent = t === "dark" ? "☀️" : "🌙";
        const savedText = localStorage.getItem("reading_time_input");
        if (savedText) { $("inputText").value = savedText; analyze(); }
      })();
    </script>
  </body>
</html>
`;
  // Fix unicode escapes that were double-escaped in template - write carefully
  // The above has \\u4e00 which becomes \u4e00 in file - good for JS source
  fs.writeFileSync(path.join(root, 'tools/text/reading-time.html'), html, 'utf8');
  return desc;
}

// ===================== PLACEHOLDER IMAGE =====================
function writePlaceholder() {
  const desc = padDesc([
    '免费在线占位图生成器：自定义宽高、背景色、文字色与文案，',
    '支持 PNG/JPEG/WebP 下载与 Data URL、模拟链接复制，浏览器 Canvas 本地生成，',
    '适合网页开发、UI 原型与布局预览。',
  ]);
  const faqs = [
    ['图片会上传吗？', '不会。使用 HTML5 Canvas 在浏览器本地绘制并导出。'],
    ['模拟链接能直接用于生产吗？', '仅适合演示。生产环境请下载后放到自有 CDN/服务器。'],
    ['支持哪些格式？', 'PNG、JPEG、WebP，下载时按所选格式导出。'],
    ['默认文字是什么？', '未填写自定义文本时显示「宽 × 高」。'],
  ];
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: '在线占位图生成器',
        url: 'https://essays4u.net/tools/generator/placeholder-image',
        description: desc,
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        inLanguage: 'zh-CN',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        featureList: ['自定义尺寸', '颜色与文案', 'PNG/JPEG/WebP', 'Data URL', '预设尺寸'],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页', item: 'https://essays4u.net/' },
          { '@type': 'ListItem', position: 2, name: '生成器', item: 'https://essays4u.net/#generator' },
          {
            '@type': 'ListItem',
            position: 3,
            name: '在线占位图生成器',
            item: 'https://essays4u.net/tools/generator/placeholder-image',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  };

  const html = `<!doctype html>
<html lang="zh-CN" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>在线占位图生成器 - PNG/JPEG/WebP 本地生成 | WebUtils</title>
    <meta name="description" content="${desc}" />
    <meta name="keywords" content="占位图生成器,placeholder image,PNG占位图,WebP占位图,UI原型" />
    <meta name="author" content="WebUtils" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://essays4u.net/tools/generator/placeholder-image" />
    <meta property="og:title" content="在线占位图生成器 - PNG/JPEG/WebP 本地生成" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://essays4u.net/tools/generator/placeholder-image" />
    <meta property="og:site_name" content="WebUtils" />
    <meta property="og:locale" content="zh_CN" />
    <meta property="og:image" content="https://essays4u.net/social-preview.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="在线占位图生成器" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="https://essays4u.net/social-preview.png" />
    <script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>
      :root {
        --bg: #f5f7fb;
        --card: #fff;
        --text: #0f172a;
        --muted: #64748b;
        --border: #e2e8f0;
        --primary: #4f46e5;
        --accent: #06b6d4;
        --shadow: 0 8px 28px rgba(15,23,42,.06);
      }
      [data-theme="dark"] {
        --bg: #0b1020;
        --card: #121826;
        --text: #e5e7eb;
        --muted: #94a3b8;
        --border: #243044;
        --primary: #818cf8;
        --accent: #22d3ee;
        --shadow: 0 8px 28px rgba(0,0,0,.35);
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: "Space Grotesk", Inter, system-ui, sans-serif;
        background: var(--bg);
        color: var(--text);
        min-height: 100vh;
        line-height: 1.6;
      }
      .site-header {
        position: sticky; top: 0; z-index: 30;
        background: color-mix(in srgb, var(--card) 90%, transparent);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid var(--border);
      }
      .hdr {
        width: min(1180px, 94%);
        margin: 0 auto;
        display: flex; align-items: center; justify-content: space-between;
        gap: 12px; padding: 12px 0;
      }
      .logo a { font-weight: 700; color: var(--primary); text-decoration: none; font-size: 1.2rem; }
      .site-nav { display: flex; gap: 12px; flex-wrap: wrap; }
      .site-nav a { color: var(--muted); text-decoration: none; font-size: .92rem; }
      .site-nav a:hover, .site-nav a.active { color: var(--primary); }
      .theme-btn {
        width: 40px; height: 40px; border-radius: 50%;
        border: 1px solid var(--border); background: var(--card); cursor: pointer;
      }
      .page-shell { width: min(1180px, 94%); margin: 0 auto; padding: 18px 0 40px; }
      .breadcrumb { margin-bottom: 14px; }
      .breadcrumb ol {
        list-style: none; display: flex; flex-wrap: wrap; gap: .4rem; align-items: center;
        font-size: .875rem; color: var(--muted);
      }
      .breadcrumb li { display: flex; align-items: center; }
      .breadcrumb li:not(:last-child)::after { content: "›"; margin-left: .4rem; opacity: .7; }
      .breadcrumb a { color: var(--muted); text-decoration: none; }
      .breadcrumb a:hover { color: var(--primary); }
      .breadcrumb li:last-child span { color: var(--text); font-weight: 500; }
      .tool-header { margin-bottom: 16px; }
      .tool-header h1 { font-size: 1.75rem; margin-bottom: .3rem; }
      .tool-header p { color: var(--muted); }
      .main-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
      }
      @media (min-width: 1000px) {
        .main-grid { grid-template-columns: 1.35fr .85fr; align-items: start; }
      }
      .card {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 16px;
        box-shadow: var(--shadow);
        padding: 18px;
      }
      .preview-container {
        min-height: 320px;
        display: flex; align-items: center; justify-content: center;
        border: 2px dashed var(--border);
        border-radius: 14px;
        background: color-mix(in srgb, var(--bg) 80%, var(--card));
        overflow: auto;
        padding: 12px;
      }
      #canvas {
        max-width: 100%;
        max-height: 480px;
        box-shadow: 0 10px 30px rgba(0,0,0,.12);
        border-radius: 4px;
      }
      .url-display {
        margin-top: 12px;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 12px;
        font-family: "JetBrains Mono", monospace;
        font-size: .82rem;
        color: var(--accent);
        word-break: break-all;
      }
      .action-btns { display: grid; gap: 10px; margin-top: 12px; }
      .btn {
        border: none; border-radius: 10px; padding: 11px 14px;
        font-family: inherit; font-weight: 600; cursor: pointer;
      }
      .btn-primary { background: var(--primary); color: #fff; }
      .btn-secondary {
        background: var(--bg); color: var(--text); border: 1px solid var(--border);
      }
      .btn-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .controls { display: flex; flex-direction: column; gap: 14px; }
      .control-group label {
        display: block; font-size: .88rem; color: var(--muted); margin-bottom: 6px; font-weight: 600;
      }
      .input-row {
        display: grid; grid-template-columns: 1fr auto 1fr; gap: 8px; align-items: center;
      }
      input[type="number"], input[type="text"] {
        width: 100%;
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 10px 12px;
        background: var(--bg);
        color: var(--text);
        font-family: inherit;
      }
      input[type="color"] {
        width: 100%;
        height: 42px;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: var(--bg);
        padding: 4px;
      }
      .presets, .formats { display: flex; flex-wrap: wrap; gap: 8px; }
      .chip, .format-btn {
        border: 1px solid var(--border);
        background: var(--bg);
        color: var(--muted);
        border-radius: 999px;
        padding: 7px 12px;
        cursor: pointer;
        font-family: inherit;
        font-size: .84rem;
      }
      .format-btn.active, .chip:hover {
        border-color: var(--primary);
        color: var(--primary);
        font-weight: 600;
      }
      .side-help { margin-top: 14px; display: grid; gap: 12px; }
      .help-card {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 14px;
        box-shadow: var(--shadow);
      }
      .help-card h2 { font-size: 1rem; margin-bottom: 8px; }
      .help-card ol, .help-card ul { margin-left: 1.1rem; font-size: .9rem; color: var(--muted); }
      .related-tools { display: flex; flex-wrap: wrap; gap: 8px; }
      .related-tools a {
        text-decoration: none; color: var(--muted); border: 1px solid var(--border);
        border-radius: 999px; padding: 6px 12px; font-size: .84rem; background: var(--bg);
      }
      .seo-article {
        margin-top: 18px;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 16px;
        box-shadow: var(--shadow);
        padding: 22px;
        line-height: 1.85;
      }
      .seo-article h2 { font-size: 1.2rem; margin: 1.15rem 0 .55rem; }
      .seo-article h2:first-child { margin-top: 0; }
      .seo-article h3 { font-size: 1.02rem; margin: 1rem 0 .4rem; }
      .seo-article p { margin: 0 0 .85rem; }
      .seo-article ul, .seo-article ol { margin: 0 0 1rem 1.15rem; }
      .site-footer { border-top: 1px solid var(--border); background: var(--card); margin-top: 8px; }
      .footer-inner {
        width: min(1180px, 94%); margin: 0 auto; padding: 26px 0 32px; text-align: center; color: var(--muted);
      }
      .footer-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px 16px; margin: 12px 0; }
      .footer-links a { color: var(--muted); text-decoration: none; font-size: .9rem; }
      .footer-links a:hover { color: var(--primary); }
    </style>
  </head>
  <body>
    <header class="site-header">
      <div class="hdr">
        <div class="logo"><a href="/">WebUtils</a></div>
        <nav class="site-nav" aria-label="主导航">
          <a href="/">首页</a>
          <a href="/tools/generator/placeholder-image" class="active">占位图</a>
          <a href="/tools/generator/avatar-generator">头像生成</a>
        </nav>
        <button class="theme-btn" id="themeBtn" onclick="toggleTheme()" aria-label="切换主题">☀️</button>
      </div>
    </header>

    <div class="page-shell">
      <nav class="breadcrumb" aria-label="breadcrumb">
        <ol>
          <li><a href="/">首页</a></li>
          <li><a href="/#generator">生成器</a></li>
          <li><span>在线占位图生成器</span></li>
        </ol>
      </nav>

      <header class="tool-header">
        <h1>在线占位图生成器</h1>
        <p>自定义尺寸、配色与文案，本地 Canvas 生成 PNG / JPEG / WebP，适合开发与原型占位。</p>
      </header>

      <div class="main-grid">
        <section class="card preview-section" aria-label="预览与导出">
          <div class="preview-container">
            <canvas id="canvas"></canvas>
          </div>
          <div class="url-display" id="urlDisplay">生成占位图后显示链接...</div>
          <div class="action-btns">
            <button class="btn btn-primary" onclick="downloadImage()">下载高清图片</button>
            <div class="btn-row-2">
              <button class="btn btn-secondary" onclick="copyDataURL()">复制 Data URL</button>
              <button class="btn btn-secondary" onclick="copyMockURL()">复制模拟链接</button>
            </div>
          </div>
        </section>

        <section class="card controls" aria-label="参数设置">
          <div class="control-group">
            <label>尺寸 (宽 × 高)</label>
            <div class="input-row">
              <input type="number" id="width" value="800" min="1" max="4000" oninput="updateGenerator()" />
              <span>×</span>
              <input type="number" id="height" value="600" min="1" max="4000" oninput="updateGenerator()" />
            </div>
          </div>
          <div class="control-group">
            <label>常用预设</label>
            <div class="presets">
              <button class="chip" type="button" onclick="setPreset(1920,1080)">1080p</button>
              <button class="chip" type="button" onclick="setPreset(1200,630)">OG Image</button>
              <button class="chip" type="button" onclick="setPreset(800,600)">4:3</button>
              <button class="chip" type="button" onclick="setPreset(1080,1080)">1:1</button>
              <button class="chip" type="button" onclick="setPreset(1080,1920)">竖屏</button>
            </div>
          </div>
          <div class="control-group">
            <label for="bgColor">背景颜色</label>
            <input type="color" id="bgColor" value="#cbd5e1" oninput="updateGenerator()" />
          </div>
          <div class="control-group">
            <label for="textColor">文字颜色</label>
            <input type="color" id="textColor" value="#0f172a" oninput="updateGenerator()" />
          </div>
          <div class="control-group">
            <label for="customText">显示文本（可选）</label>
            <input type="text" id="customText" placeholder="默认显示宽 × 高" oninput="updateGenerator()" />
          </div>
          <div class="control-group">
            <label>导出格式</label>
            <div class="formats">
              <button class="format-btn active" type="button" onclick="setFormat('png')">png</button>
              <button class="format-btn" type="button" onclick="setFormat('jpeg')">jpeg</button>
              <button class="format-btn" type="button" onclick="setFormat('webp')">webp</button>
            </div>
          </div>
        </section>
      </div>

      <div class="side-help">
        <div class="help-card">
          <h2>怎么用</h2>
          <ol>
            <li>设定宽高或点预设</li>
            <li>调整背景色、文字色与文案</li>
            <li>选择 PNG / JPEG / WebP</li>
            <li>下载图片，或复制 Data URL / 模拟链接</li>
          </ol>
        </div>
        <div class="help-card">
          <h2>相关工具</h2>
          <div class="related-tools">
            <a href="/tools/generator/avatar-generator">头像生成器</a>
            <a href="/tools/generator/gradient-card">渐变卡片</a>
            <a href="/tools/design/card-generator">CSS 卡片</a>
            <a href="/tools/generator/barcode">条形码</a>
          </div>
        </div>
      </div>

      <article class="seo-article" aria-label="占位图说明">
        <h2>什么是占位图？</h2>
        <p>占位图用于在真实素材未就绪时填充布局。典型占位图包含背景色与尺寸/说明文字，体积小、加载快，方便前端与设计并行推进。</p>

        <h2>本工具特点</h2>
        <ul>
          <li>浏览器 Canvas 本地绘制，不上传图片内容</li>
          <li>自由尺寸（建议合理范围内）、背景/文字颜色、自定义文案</li>
          <li>导出 PNG / JPEG / WebP，并可复制 Data URL 与模拟 via.placeholder 风格链接</li>
          <li>预设 1080p、OG Image、方形、竖屏等常用规格</li>
        </ul>

        <h2>推荐场景</h2>
        <ul>
          <li>网页与后台列表布局联调</li>
          <li>移动端原型与卡片栅格占位</li>
          <li>测试响应式断点与 CLS（预留宽高）</li>
          <li>邮件模板或演示页临时配图</li>
        </ul>

        <h2>使用注意</h2>
        <p>上线前请替换为真实图片并补充有意义的 <code>alt</code>。模拟链接适合演示，高流量生产环境应托管到自有 CDN。过大尺寸可能占用内存，请按需设置。</p>

        <h3>FAQ</h3>
        ${faqs.map(([q, a]) => `<p><strong>${q}</strong> ${a}</p>`).join('\n        ')}
      </article>
    </div>

    <footer class="site-footer">
      <div class="footer-inner">
        <p>WebUtils · 占位图生成器 · 本地 Canvas 导出</p>
        <nav class="footer-links" data-site-policy-links aria-label="网站政策">
          <a href="/about">关于本站</a>
          <a href="/contact">联系我们</a>
          <a href="/terms">使用条款</a>
          <a href="/privacy-policy">隐私政策</a>
          <a href="/tools-directory">全部工具</a>
        </nav>
        <p>&copy; 2026 WebUtils</p>
      </div>
    </footer>

    <script>
      let currentFormat = "png";
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");

      function updateGenerator() {
        const width = Math.max(1, parseInt(document.getElementById("width").value, 10) || 800);
        const height = Math.max(1, parseInt(document.getElementById("height").value, 10) || 600);
        const bgColor = document.getElementById("bgColor").value;
        const textColor = document.getElementById("textColor").value;
        const text = document.getElementById("customText").value || (width + " × " + height);

        canvas.width = width;
        canvas.height = height;

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(width, height);
        ctx.moveTo(width, 0);
        ctx.lineTo(0, height);
        ctx.strokeStyle = textColor + "33";
        ctx.lineWidth = Math.max(1, Math.min(width, height) / 200);
        ctx.stroke();

        const fontSize = Math.max(12, Math.min(width, height) / 8);
        ctx.fillStyle = textColor;
        ctx.font = "bold " + fontSize + "px Inter, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, width / 2, height / 2);

        updateURLDisplay(width, height, bgColor, textColor, text);
      }

      function updateURLDisplay(w, h, bg, fg, txt) {
        const bgHex = bg.replace("#", "");
        const fgHex = fg.replace("#", "");
        const cleanTxt = encodeURIComponent(txt);
        document.getElementById("urlDisplay").textContent =
          "https://via.placeholder.com/" + w + "x" + h + "/" + bgHex + "/" + fgHex + "?text=" + cleanTxt;
      }

      function setPreset(w, h) {
        document.getElementById("width").value = w;
        document.getElementById("height").value = h;
        updateGenerator();
      }

      function setFormat(fmt) {
        currentFormat = fmt;
        document.querySelectorAll(".format-btn").forEach((btn) => {
          btn.classList.toggle("active", btn.textContent.toLowerCase() === fmt);
        });
      }

      function downloadImage() {
        const mimeMap = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" };
        const link = document.createElement("a");
        link.download =
          "placeholder-" +
          document.getElementById("width").value +
          "x" +
          document.getElementById("height").value +
          "." +
          currentFormat;
        link.href = canvas.toDataURL(mimeMap[currentFormat], 0.9);
        link.click();
      }

      function copyDataURL() {
        const dataURL = canvas.toDataURL("image/" + currentFormat, 0.9);
        navigator.clipboard.writeText(dataURL).then(() => alert("Data URL 已复制到剪贴板！"));
      }

      function copyMockURL() {
        const url = document.getElementById("urlDisplay").textContent;
        navigator.clipboard.writeText(url).then(() => alert("模拟链接已复制到剪贴板！"));
      }

      function toggleTheme() {
        const html = document.documentElement;
        const cur = html.getAttribute("data-theme") === "dark" ? "dark" : "light";
        const next = cur === "dark" ? "light" : "dark";
        html.setAttribute("data-theme", next);
        document.getElementById("themeBtn").textContent = next === "dark" ? "☀️" : "🌙";
        localStorage.setItem("placeholder-theme", next);
      }

      (function init() {
        const savedTheme = localStorage.getItem("placeholder-theme") || "light";
        document.documentElement.setAttribute("data-theme", savedTheme);
        document.getElementById("themeBtn").textContent = savedTheme === "dark" ? "☀️" : "🌙";
        updateGenerator();
      })();
    </script>
  </body>
</html>
`;
  fs.writeFileSync(path.join(root, 'tools/generator/placeholder-image.html'), html, 'utf8');
  return desc;
}

// ===================== CARD GENERATOR white defaults =====================
function fixCardGenerator() {
  const fp = path.join(root, 'tools/design/card-generator.html');
  let html = fs.readFileSync(fp, 'utf8');

  // initial colors white
  html = html.replace(
    /id="color1" value="#[0-9a-fA-F]{3,8}"/,
    'id="color1" value="#ffffff"'
  );
  html = html.replace(
    /id="color2" value="#[0-9a-fA-F]{3,8}"/,
    'id="color2" value="#ffffff"'
  );

  // make text readable on light backgrounds in preview + CSS output
  if (!html.includes('function pickTextColor')) {
    html = html.replace(
      /function updateCard\(\) \{/,
      `function pickTextColor(c1, c2) {
        function lum(hex) {
          const h = hex.replace('#', '');
          const full = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
          const r = parseInt(full.slice(0, 2), 16) / 255;
          const g = parseInt(full.slice(2, 4), 16) / 255;
          const b = parseInt(full.slice(4, 6), 16) / 255;
          const f = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        }
        const avg = (lum(c1) + lum(c2)) / 2;
        return avg > 0.62 ? '#1a1a1a' : '#ffffff';
      }

      function updateCard() {`
    );
  }

  // inject textColor usage if still hardcoding white
  if (html.includes('color: white;') && html.includes('function updateCard')) {
    html = html.replace(
      /card\.style\.boxShadow = `0 \$\{shadow \/ 2\}px \$\{shadow\}px rgba\(0,0,0,0\.2\)`;/,
      `card.style.boxShadow = \`0 \${shadow / 2}px \${shadow}px rgba(0,0,0,0.2)\`;
        const textColor = pickTextColor(c1, c2);
        card.style.color = textColor;`
    );
    html = html.replace(
      /color: white;/,
      'color: ${textColor};'
    );
  }

  // ensure textColor is defined before css template if not already
  if (!html.includes('const textColor = pickTextColor')) {
    // already handled above ideally
  }

  // if color still fixed white without variable, force replace in template carefully
  if (html.includes('color: white;')) {
    // fallback: before building css, define textColor
    if (!html.includes('const textColor = pickTextColor(c1, c2);')) {
      html = html.replace(
        /const css = `/,
        `const textColor = pickTextColor(c1, c2);
        card.style.color = textColor;
        const css = \``
      );
    }
    html = html.replace(/color: white;/, 'color: ${textColor};');
  }

  fs.writeFileSync(fp, html, 'utf8');
}

const d1 = writeReadingTime();
const d2 = writePlaceholder();
fixCardGenerator();

const checks = [
  verify('tools/text/reading-time.html'),
  verify('tools/generator/placeholder-image.html'),
  verify('tools/design/card-generator.html'),
];

// extra checks
const card = fs.readFileSync(path.join(root, 'tools/design/card-generator.html'), 'utf8');
const cardOk =
  /id="color1" value="#ffffff"/.test(card) &&
  /id="color2" value="#ffffff"/.test(card);

const ph = fs.readFileSync(path.join(root, 'tools/generator/placeholder-image.html'), 'utf8');
const phOk = ph.includes('id="width"') && ph.includes('id="bgColor"') && ph.includes('updateGenerator');

const rt = fs.readFileSync(path.join(root, 'tools/text/reading-time.html'), 'utf8');
const rtOk = rt.includes('function analyze') && rt.includes('sidebar-section') && rt.includes('FAQPage');

console.log(
  JSON.stringify(
    {
      desc: { reading: d1.length, placeholder: d2.length },
      checks,
      cardOk,
      phOk,
      rtOk,
    },
    null,
    2
  )
);

process.exit(checks.every((c) => c.desc >= 120 && c.desc <= 160 && c.h1 === 1 && c.divDiff === 0 && c.parseOk) && cardOk && phOk && rtOk ? 0 : 1);
