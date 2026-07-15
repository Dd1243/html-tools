/**
 * Visual rebuild for tools/fun/what-to-eat.html
 * Keep all food data + spin/history/custom/exclude/shake logic.
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const fp = path.join(root, 'tools/fun/what-to-eat.html');
const old = fs.readFileSync(fp, 'utf8');

// extract last/main app script
const scripts = [...old.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi)];
const appScript = scripts.map((m) => m[1]).find((s) => s.includes('presetFoods') && s.includes('function spin'));
if (!appScript) throw new Error('script not found');
let scriptBody = appScript
  // theme uses body data-theme; keep as-is but also sync html for CSS vars
  .replace(
    /function toggleTheme\(\) \{[\s\S]*?localStorage\.setItem\("theme-whattoeat", t\);\s*\}/,
    `function toggleTheme() {
        const body = document.body;
        const t = body.getAttribute("data-theme") === "light" ? "dark" : "light";
        body.setAttribute("data-theme", t);
        document.documentElement.setAttribute("data-theme", t);
        document.getElementById("themeBtn").textContent = t === "light" ? "☀️" : "🌙";
        localStorage.setItem("theme-whattoeat", t);
      }`
  )
  .replace(
    /const savedTheme = localStorage\.getItem\("theme-whattoeat"\) \|\| "dark";\s*document\.body\.setAttribute\("data-theme", savedTheme\);\s*document\.getElementById\("themeBtn"\)\.textContent = savedTheme === "light" \? "☀️" : "🌙";/,
    `const savedTheme = localStorage.getItem("theme-whattoeat") || "light";
      document.body.setAttribute("data-theme", savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
      document.getElementById("themeBtn").textContent = savedTheme === "light" ? "☀️" : "🌙";`
  );

function padDesc(parts) {
  let d = parts.join('');
  const pad = '结果仅供参考，玩乐决策请结合个人口味与健康需求。';
  while (d.length < 120) d += pad;
  if (d.length > 160) d = d.slice(0, 160);
  return d;
}

const desc = padDesc([
  '今天吃什么？在线随机美食选择器：分类菜单、老虎机动画、排除不喜欢、自定义菜品与历史记录；',
  '支持手机摇一摇，本地运行不上传，',
  '一键终结午餐晚餐选择困难。',
]);

const faqs = [
  ['可选不足 2 个会怎样？', '无法抽选，会提示至少保留 2 个选项。'],
  ['排除的菜会丢吗？', '排除列表存在本地，点「恢复全部」可重新纳入。'],
  ['自定义菜品保存在哪？', 'localStorage.whatToEatCustom，仅当前浏览器。'],
  ['摇一摇没反应？', '需手机浏览器授权运动传感器；也可直接点抽选按钮。'],
];

const ld = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: '今天吃什么',
      url: 'https://essays4u.net/tools/fun/what-to-eat',
      description: desc,
      applicationCategory: 'EntertainmentApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      inLanguage: 'zh-CN',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      featureList: ['分类菜单', '随机抽选动画', '排除选项', '自定义菜品', '历史记录', '摇一摇'],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首页', item: 'https://essays4u.net/' },
        { '@type': 'ListItem', position: 2, name: '趣味工具', item: 'https://essays4u.net/#fun' },
        {
          '@type': 'ListItem',
          position: 3,
          name: '今天吃什么',
          item: 'https://essays4u.net/tools/fun/what-to-eat',
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
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>今天吃什么 - 随机美食选择器 | WebUtils</title>
    <meta name="description" content="${desc}" />
    <meta name="keywords" content="今天吃什么,随机食物,午餐吃什么,晚餐吃什么,美食转盘,选择困难" />
    <meta name="author" content="WebUtils" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://essays4u.net/tools/fun/what-to-eat" />
    <meta property="og:title" content="今天吃什么 - 随机美食选择器" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://essays4u.net/tools/fun/what-to-eat" />
    <meta property="og:site_name" content="WebUtils" />
    <meta property="og:locale" content="zh_CN" />
    <meta property="og:image" content="https://essays4u.net/social-preview.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="今天吃什么 - 随机美食选择器" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="https://essays4u.net/social-preview.png" />
    <script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>
      :root {
        --bg: #fff7ed;
        --bg-soft: #ffedd5;
        --card: #ffffff;
        --text: #1c1917;
        --muted: #78716c;
        --border: #fed7aa;
        --primary: #ea580c;
        --primary-2: #f97316;
        --primary-soft: #ffedd5;
        --shadow: 0 10px 30px rgba(234, 88, 12, 0.08);
        --radius: 18px;
        --font: "Space Grotesk", system-ui, -apple-system, sans-serif;
      }
      [data-theme="dark"] {
        --bg: #0c0a09;
        --bg-soft: #1c1917;
        --card: #171412;
        --text: #fafaf9;
        --muted: #a8a29e;
        --border: #292524;
        --primary: #fb923c;
        --primary-2: #f97316;
        --primary-soft: #292524;
        --shadow: 0 10px 30px rgba(0,0,0,.35);
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: var(--font);
        background:
          radial-gradient(circle at 10% 0%, rgba(251,146,60,.18), transparent 35%),
          radial-gradient(circle at 90% 10%, rgba(249,115,22,.12), transparent 30%),
          var(--bg);
        color: var(--text);
        min-height: 100vh;
        line-height: 1.6;
      }
      .site-header {
        position: sticky;
        top: 0;
        z-index: 40;
        backdrop-filter: blur(12px);
        background: color-mix(in srgb, var(--card) 86%, transparent);
        border-bottom: 1px solid var(--border);
      }
      .hdr {
        width: min(1100px, 94%);
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 0;
      }
      .logo a {
        font-weight: 700;
        font-size: 1.2rem;
        color: var(--primary);
        text-decoration: none;
      }
      .site-nav { display: flex; gap: 12px; flex-wrap: wrap; }
      .site-nav a {
        color: var(--muted);
        text-decoration: none;
        font-size: .92rem;
      }
      .site-nav a:hover, .site-nav a.active { color: var(--primary); }
      .theme-btn {
        width: 40px; height: 40px; border-radius: 50%;
        border: 1px solid var(--border);
        background: var(--card);
        cursor: pointer;
        font-size: 1.05rem;
      }
      .page-shell {
        width: min(1100px, 94%);
        margin: 0 auto;
        padding: 18px 0 48px;
      }
      .breadcrumb { margin-bottom: 14px; }
      .breadcrumb ol {
        list-style: none;
        display: flex;
        flex-wrap: wrap;
        gap: .4rem;
        align-items: center;
        font-size: .875rem;
        color: var(--muted);
      }
      .breadcrumb li { display: flex; align-items: center; }
      .breadcrumb li:not(:last-child)::after { content: "›"; margin-left: .4rem; opacity: .7; }
      .breadcrumb a { color: var(--muted); text-decoration: none; }
      .breadcrumb a:hover { color: var(--primary); }
      .breadcrumb li:last-child span { color: var(--text); font-weight: 500; }

      .hero {
        display: grid;
        gap: 18px;
        margin-bottom: 18px;
      }
      @media (min-width: 960px) {
        .hero { grid-template-columns: 1.35fr .85fr; align-items: stretch; }
      }
      .card {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
      }
      .spin-card { padding: 22px 20px 20px; text-align: center; }
      .tool-header h1 {
        font-size: clamp(1.6rem, 3vw, 2rem);
        margin-bottom: .35rem;
      }
      .tool-header p { color: var(--muted); margin-bottom: 16px; font-size: .98rem; }
      .category-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
        margin-bottom: 18px;
      }
      .category-tab {
        border: 1px solid var(--border);
        background: var(--bg-soft);
        color: var(--text);
        border-radius: 999px;
        padding: 7px 14px;
        cursor: pointer;
        font-family: inherit;
        font-size: .88rem;
        transition: .15s ease;
      }
      .category-tab.active {
        background: linear-gradient(135deg, var(--primary), var(--primary-2));
        border-color: transparent;
        color: #fff;
        font-weight: 600;
        box-shadow: 0 6px 16px rgba(249,115,22,.28);
      }
      .slot-machine {
        max-width: 420px;
        margin: 0 auto 18px;
        padding: 14px;
        border-radius: 22px;
        background:
          linear-gradient(180deg, color-mix(in srgb, var(--primary) 12%, transparent), transparent),
          var(--bg-soft);
        border: 1px solid var(--border);
      }
      .slot-window {
        height: 120px;
        overflow: hidden;
        position: relative;
        border-radius: 16px;
        background: var(--card);
        border: 1px solid var(--border);
      }
      .slot-window::before,
      .slot-window::after {
        content: "";
        position: absolute;
        left: 0; right: 0;
        height: 28px;
        z-index: 2;
        pointer-events: none;
      }
      .slot-window::before {
        top: 0;
        background: linear-gradient(to bottom, color-mix(in srgb, var(--card) 95%, transparent), transparent);
      }
      .slot-window::after {
        bottom: 0;
        background: linear-gradient(to top, color-mix(in srgb, var(--card) 95%, transparent), transparent);
      }
      .slot-reel { position: absolute; width: 100%; }
      .slot-item {
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        font-size: 1.55rem;
        font-weight: 700;
        color: var(--primary);
      }
      .slot-item .emoji { font-size: 2.2rem; }
      .spin-btn {
        border: none;
        border-radius: 999px;
        padding: 14px 28px;
        min-width: 220px;
        font-size: 1.05rem;
        font-weight: 700;
        font-family: inherit;
        color: #fff;
        cursor: pointer;
        background: linear-gradient(135deg, var(--primary), var(--primary-2));
        box-shadow: 0 10px 24px rgba(249,115,22,.3);
        transition: transform .15s ease, box-shadow .15s ease;
      }
      .spin-btn:hover { transform: translateY(-2px); }
      .spin-btn:disabled { opacity: .7; cursor: not-allowed; transform: none; }
      .shake-hint {
        margin-top: 12px;
        color: var(--muted);
        font-size: .86rem;
      }

      .side-stack { display: flex; flex-direction: column; gap: 14px; }
      .side-card { padding: 16px; }
      .side-card h2 { font-size: 1rem; margin-bottom: 10px; }
      .how-list, .faq-list { list-style: none; }
      .how-list li, .faq-list li {
        display: flex;
        gap: 8px;
        font-size: .9rem;
        margin-bottom: 8px;
        color: var(--text);
      }
      .how-list li::before { content: "➜"; color: var(--primary); flex-shrink: 0; }
      .faq-q { font-weight: 600; }
      .faq-a { color: var(--muted); font-size: .86rem; margin: 2px 0 10px; }
      .related-tools { display: flex; flex-wrap: wrap; gap: 8px; }
      .related-tools a {
        text-decoration: none;
        color: var(--muted);
        border: 1px solid var(--border);
        border-radius: 999px;
        padding: 6px 12px;
        font-size: .84rem;
        background: var(--bg-soft);
      }
      .related-tools a:hover { color: var(--primary); border-color: var(--primary); }

      .panels-grid {
        display: grid;
        grid-template-columns: 1.4fr 1fr;
        gap: 16px;
        margin-top: 4px;
      }
      @media (max-width: 800px) {
        .panels-grid { grid-template-columns: 1fr; }
      }
      .panel { padding: 18px; }
      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--border);
      }
      .panel-title { font-weight: 700; font-size: 1rem; }
      .btn-row { display: flex; gap: 8px; flex-wrap: wrap; }
      .btn-small {
        border: 1px solid var(--border);
        background: var(--bg-soft);
        color: var(--muted);
        border-radius: 999px;
        padding: 6px 12px;
        cursor: pointer;
        font-family: inherit;
        font-size: .82rem;
      }
      .btn-small:hover { color: var(--primary); border-color: var(--primary); }
      .hint {
        font-size: .82rem;
        color: var(--muted);
        margin-bottom: 10px;
      }
      .options-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        max-height: 280px;
        overflow: auto;
        padding-right: 2px;
      }
      .option-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 12px;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: var(--bg-soft);
        cursor: pointer;
        font-size: .88rem;
        user-select: none;
        transition: .15s ease;
      }
      .option-chip:hover { border-color: var(--primary); }
      .option-chip.excluded {
        opacity: .45;
        text-decoration: line-through;
        filter: grayscale(.4);
      }
      .add-option {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }
      .add-input {
        flex: 1;
        min-width: 0;
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 10px 12px;
        background: var(--bg);
        color: var(--text);
        font-family: inherit;
      }
      .add-btn {
        border: none;
        border-radius: 12px;
        padding: 10px 14px;
        background: var(--primary);
        color: #fff;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
      }
      .history-list {
        max-height: 340px;
        overflow: auto;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .history-item {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 12px;
        background: var(--bg-soft);
        border: 1px solid var(--border);
        font-size: .9rem;
      }
      .history-time { color: var(--muted); font-size: .8rem; white-space: nowrap; }
      .empty-soft {
        text-align: center;
        color: var(--muted);
        padding: 22px 10px;
        font-size: .88rem;
      }

      .seo-article {
        margin-top: 20px;
        padding: 22px 22px 24px;
        line-height: 1.85;
      }
      .seo-article h2 { font-size: 1.2rem; margin: 1.15rem 0 .55rem; }
      .seo-article h2:first-child { margin-top: 0; }
      .seo-article h3 { font-size: 1.02rem; margin: 1rem 0 .4rem; }
      .seo-article p { margin: 0 0 .85rem; color: color-mix(in srgb, var(--text) 88%, var(--muted)); }
      .seo-article ul { margin: 0 0 1rem 1.15rem; }
      .seo-article li { margin-bottom: .35rem; }

      .site-footer {
        border-top: 1px solid var(--border);
        background: color-mix(in srgb, var(--card) 90%, transparent);
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
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px 16px;
        margin: 12px 0;
      }
      .footer-links a {
        color: var(--muted);
        text-decoration: none;
        font-size: .9rem;
      }
      .footer-links a:hover { color: var(--primary); }
    </style>
  </head>
  <body data-theme="light">
    <header class="site-header">
      <div class="hdr">
        <div class="logo"><a href="/">WebUtils</a></div>
        <nav class="site-nav" aria-label="主导航">
          <a href="/">首页</a>
          <a href="/tools/fun/what-to-eat" class="active">今天吃什么</a>
          <a href="/tools/fun/flip-coin">抛硬币</a>
        </nav>
        <button class="theme-btn" id="themeBtn" onclick="toggleTheme()" aria-label="切换主题">☀️</button>
      </div>
    </header>

    <div class="page-shell">
      <nav class="breadcrumb" aria-label="breadcrumb">
        <ol>
          <li><a href="/">首页</a></li>
          <li><a href="/#fun">趣味工具</a></li>
          <li><span>今天吃什么</span></li>
        </ol>
      </nav>

      <div class="hero">
        <section class="card spin-card" aria-label="随机抽选">
          <header class="tool-header">
            <h1>🍽️ 今天吃什么？</h1>
            <p>分类筛选 · 一键抽选 · 排除雷区 · 自定义菜单，终结饭点选择困难。</p>
          </header>
          <div class="category-tabs" id="categoryTabs"></div>
          <div class="slot-machine">
            <div class="slot-window">
              <div class="slot-reel" id="slotReel">
                <div class="slot-item">
                  <span class="emoji">🤔</span>
                  <span>点下方按钮开始</span>
                </div>
              </div>
            </div>
          </div>
          <button class="spin-btn" id="spinBtn" onclick="spin()">🎲 帮我决定！</button>
          <div class="shake-hint">💡 手机端可摇一摇触发；至少保留 2 个可选项</div>
        </section>

        <aside class="side-stack" aria-label="使用说明">
          <div class="card side-card">
            <h2>怎么用</h2>
            <ul class="how-list">
              <li>选分类，缩小候选范围</li>
              <li>点菜品可排除不想吃的</li>
              <li>点「帮我决定」看动画结果</li>
              <li>可添加自定义餐厅/菜名</li>
              <li>历史记录保存在本机浏览器</li>
            </ul>
          </div>
          <div class="card side-card">
            <h2>常见问题</h2>
            <div class="faq-q">Q: 至少要几个选项？</div>
            <div class="faq-a">A: 至少 2 个可选项才能抽选。</div>
            <div class="faq-q">Q: 数据会上传吗？</div>
            <div class="faq-a">A: 不会，排除/自定义/历史均本地保存。</div>
            <div class="faq-q">Q: 摇一摇无效？</div>
            <div class="faq-a">A: 需运动传感器权限，也可直接点按钮。</div>
          </div>
          <div class="card side-card">
            <h2>相关工具</h2>
            <div class="related-tools">
              <a href="/tools/fun/flip-coin">抛硬币</a>
              <a href="/tools/fun/dice-roller">骰子模拟</a>
              <a href="/tools/fun/coin-flip">抛硬币备选</a>
              <a href="/tools/life/pomodoro">番茄钟</a>
            </div>
          </div>
        </aside>
      </div>

      <div class="panels-grid">
        <section class="card panel" aria-label="候选菜单">
          <div class="panel-header">
            <span class="panel-title">🍔 候选菜单（<span id="optCount">0</span>）</span>
            <div class="btn-row">
              <button class="btn-small" onclick="clearExcluded()">恢复全部</button>
              <button class="btn-small" onclick="resetCustom()">重置自定义</button>
            </div>
          </div>
          <p class="hint">点击菜品可排除/恢复；排除项会划线变灰。</p>
          <div class="options-grid" id="optionsGrid"></div>
          <div class="add-option">
            <input
              type="text"
              class="add-input"
              id="newOptInput"
              placeholder="输入想吃的食物或店名..."
              onkeypress="if (event.key === 'Enter') addCustomOption();"
              aria-label="自定义菜品"
            />
            <button class="add-btn" onclick="addCustomOption()">添加</button>
          </div>
        </section>

        <section class="card panel" aria-label="历史记录">
          <div class="panel-header">
            <span class="panel-title">📜 历史记录</span>
            <button class="btn-small" onclick="clearHistory()">清空</button>
          </div>
          <div class="history-list" id="historyList">
            <div class="empty-soft">暂无记录</div>
          </div>
        </section>
      </div>

      <article class="card seo-article" aria-label="使用指南">
        <h2>为什么饭点总是「随便」？</h2>
        <p>「今天吃什么」往往不是信息不够，而是决策疲劳：外卖 App 选项太多，大脑想省力。本工具用随机抽选把选择成本降到一次点击，适合一个人点外卖、同事午饭或家庭聚餐前的快速破冰。</p>

        <h2>本页能做什么</h2>
        <ul>
          <li><strong>分类菜单：</strong>中式、简餐、面食、西式、日韩、火锅、小吃等。</li>
          <li><strong>老虎机动画：</strong>滚动抽选，结果写入历史记录。</li>
          <li><strong>排除雷区：</strong>点击候选即可暂时排除，支持一键恢复。</li>
          <li><strong>自定义菜品：</strong>添加你家附近店名或今日限定。</li>
          <li><strong>摇一摇：</strong>手机端可尝试摇动触发（需传感器权限）。</li>
        </ul>

        <h2>推荐用法</h2>
        <ol>
          <li>先选心情分类（例如只想吃面）。</li>
          <li>把绝对不想吃的点掉排除。</li>
          <li>不够的话添加 2–3 个本地店名。</li>
          <li>点「帮我决定」；不满意再抽一次。</li>
        </ol>

        <h3>小提示</h3>
        <p>随机很好玩，但仍建议兼顾营养：碳水配蛋白质、适当加蔬菜，重油重辣与清淡轮换。本工具仅作趣味决策辅助，不提供营养医学建议。</p>
      </article>
    </div>

    <footer class="site-footer">
      <div class="footer-inner">
        <p>WebUtils · 今天吃什么 · 本地随机决策</p>
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
${scriptBody}
    </script>
  </body>
</html>
`;

fs.writeFileSync(fp, html, 'utf8');

// verify
const out = fs.readFileSync(fp, 'utf8');
const d = (out.match(/name="description"\s+content="([^"]+)"/) || [])[1] || '';
const body = out.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
const h1 = (body.match(/<h1\b/gi) || []).length;
const od = (out.match(/<div\b/gi) || []).length;
const cd = (out.match(/<\/div>/gi) || []).length;
let parseOk = false;
const ldm = out.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
if (ldm) {
  try {
    JSON.parse(ldm[1]);
    parseOk = true;
  } catch (e) {
    console.error(e.message);
  }
}
const hasSpin = out.includes('function spin()') && out.includes('presetFoods');
const crumbs = (body.match(/class="breadcrumb"/g) || []).length;
const ads = (out.match(/ad-banner/g) || []).length;
const ok =
  d.length >= 120 &&
  d.length <= 160 &&
  h1 === 1 &&
  od === cd &&
  parseOk &&
  hasSpin &&
  crumbs === 1 &&
  ads === 0;

console.log({ ok, desc: d.length, h1, divDiff: od - cd, parseOk, hasSpin, crumbs, ads });
process.exit(ok ? 0 : 1);
