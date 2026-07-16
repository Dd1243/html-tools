/**
 * Generate category hub pages: tools/<category>/index.html
 * Style inspired by essays4u.net category hubs.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const toolsJson = JSON.parse(fs.readFileSync(path.join(root, 'tools.json'), 'utf8'));
const categories = toolsJson.categories || {};
const tools = Object.values(toolsJson.tools || {});

const ADSENSE = `    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9979971494108572" crossorigin="anonymous"></script>`;

const FALLBACK_DESC = {
  dev: '面向开发者的在线工具集合，覆盖格式化、调试、生成与常用代码片段处理。',
  text: '文本处理工具合集：字数统计、对比、转换、清洗与批量重塑。',
  time: '时间日期相关工具：倒计时、时区、时长计算与时间戳处理。',
  generator: '各类生成器：二维码、占位图、假数据、条码与创意素材。',
  media: '图片、音频、PDF 等媒体处理工具，浏览器本地运行。',
  privacy: '隐私与数据保护相关工具，帮助脱敏、加密与安全检查。',
  security: '安全检测与配置辅助工具，如哈希、头信息与策略生成。',
  network: '网络排查与查询工具：IP、DNS、端口、HTTP 与证书相关。',
  calculator: '通用与场景计算器，快速完成数值与比例运算。',
  converter: '单位、编码与数据格式转换工具合集。',
  extractor: '在线信息提取工具，从文本中抽取链接、邮箱、关键词等结构化数据。',
  ai: 'AI 相关指南与小工具，覆盖模型、提示与效率场景。',
  seo: 'SEO 辅助工具：元标签、标题结构、关键词与预览检查。',
  fun: '轻松有趣的小工具，随机决策与互动体验。',
  game: '浏览器小游戏合集，纯前端运行无需安装。',
  life: '日常生活效率工具：待办、计时、笔记与常用计算。',
  finance: '个人与经营财务计算：利率、贷款、预算与利润。',
  health: '健康相关估算与记录辅助工具，结果仅供参考。',
  education: '学习辅助工具：成绩、公式、闪卡与阅读相关。',
  food: '餐饮烹饪辅助：份量换算、计时、营养与成本估算。',
  chinese: '中文场景工具：拼音、证件校验、历法与本地化处理。',
  'ai-coding': 'AI 编程资源与工具导航，覆盖 IDE、协议与实践指南。',
  realestate: '房产相关计算：房贷、税费、租金回报与装修预算。',
  business: '商业决策辅助：ROI、盈亏平衡、现金流与定价。',
  crypto: '加密货币场景计算：收益、杠杆、定投与仓位管理。',
  legal: '法律合规辅助模板与清单类工具，非正式法律意见。',
  'social-media': '社交媒体运营辅助：文案、预览、互动与排程草稿。',
  'team-tools': '团队协作小工具：站会、议程、任务拆解与复盘。',
  data: '数据处理与可视化辅助：清洗、转换、图表与校验。',
  office: '办公效率工具：发票、工时、清单、甘特与文档模板。',
  travel: '出行相关工具：行李、汇率、行程与旅行计算。',
  design: '设计与 CSS 效果生成器：颜色、布局、阴影与动效。',
  math: '数学计算工具：方程、统计、进制与矩阵相关。',
  productivity: '效率提升工具：番茄钟、习惯与专注相关。',
  sports: '运动健身相关计算与记录辅助。',
  music: '音乐练习辅助：节拍器、和弦等小工具。',
  pets: '养宠相关在线工具，涵盖年龄换算、喂食与日常照护。',
  photography: '摄影参数与光线相关计算辅助。',
  shopping: '购物比价与单价计算等消费决策工具。',
  language: '语言学习辅助：词汇、拼音与练习类工具。',
  art: '艺术创作辅助：配色与色彩相关小工具。',
  social: '社交娱乐场景工具：分摊、礼物与活动倒计时。',
  parenting: '育儿日常记录与喂养相关辅助工具。',
  diy: '手工 DIY 材料与进度计算工具。',
  weather: '天气相关查询与穿衣建议类工具。',
  astronomy: '天文兴趣工具：月相等相关查询。',
  automotive: '用车成本与油耗相关计算。',
  gardening: '园艺浇水与植物护理提醒工具。',
  fitness: '健身训练计时与记录辅助。',
  lifestyle: '生活方式小工具：习惯、提醒与日常记录。',
};

/* hub-desc-v2 */
function buildHubDescription(catId, name, list) {
  const CORE = {
  "dev": "覆盖代码格式化、Base64、正则、JSON、哈希等开发常用能力",
  "text": "支持字数统计、去重对比、大小写与中英文文本批量处理",
  "time": "提供倒计时、时区转换、时间戳与工时日期计算",
  "generator": "可生成二维码、假数据、条码、占位图与创意素材",
  "media": "包含图片压缩、颜色、PDF 与常见媒体处理能力",
  "privacy": "侧重加密脱敏、哈希校验与隐私数据处理",
  "security": "提供安全头、哈希、策略生成与基础安全检查",
  "network": "支持 IP、DNS、HTTP、端口与网络排查相关查询",
  "calculator": "覆盖比例、百分比、场景数值等快速计算",
  "converter": "提供单位、编码、进制与常见格式转换",
  "extractor": "可从文本中提取链接、邮箱、正则匹配等结构化信息",
  "ai": "汇集 AI 指南与小工具，覆盖提示、模型与效率场景",
  "seo": "包含 Meta、标题结构、关键词与社交预览等 SEO 检查",
  "fun": "提供随机决策、趣味互动等轻松小工具",
  "game": "收录浏览器小游戏，打开即可玩",
  "life": "覆盖日常计时、待办、笔记与生活常用计算",
  "finance": "支持贷款、利率、预算、利润等财务测算",
  "health": "提供健康估算与记录辅助，结果仅供参考",
  "education": "包含成绩、公式、闪卡与学习辅助工具",
  "food": "支持份量换算、烹饪计时与餐饮成本估算",
  "chinese": "面向中文场景：拼音、证件校验、历法与本地化处理",
  "ai-coding": "聚焦 AI 编程资源、IDE 实践与开发效率工具",
  "realestate": "覆盖房贷、税费、租金回报与装修预算测算",
  "business": "提供 ROI、盈亏平衡、现金流与定价辅助",
  "crypto": "支持收益、杠杆、定投与仓位等加密货币计算",
  "legal": "提供清单与模板类合规辅助，非正式法律意见",
  "social-media": "覆盖文案、预览、标签与运营草稿辅助",
  "team-tools": "支持站会、议程、任务拆解与团队复盘",
  "data": "提供数据清洗、转换、图表与校验辅助",
  "office": "覆盖发票、工时、清单与办公文档模板",
  "travel": "支持行李、汇率、行程与出行相关计算",
  "design": "可生成配色、阴影、布局与 CSS 效果",
  "math": "覆盖方程、统计、进制与数学运算",
  "productivity": "提供番茄钟、习惯与专注效率工具",
  "sports": "支持运动记录与健身相关计算",
  "music": "包含节拍器、和弦等音乐练习辅助",
  "pets": "覆盖宠物年龄换算、喂食与日常照护",
  "photography": "提供曝光、焦距等摄影参数辅助",
  "shopping": "支持单价比价与购物决策计算",
  "language": "覆盖词汇、拼音与语言学习练习",
  "art": "提供配色混合与艺术创作辅助",
  "social": "支持分摊、礼物与活动倒计时等社交场景",
  "parenting": "覆盖育儿记录与喂养日常辅助",
  "diy": "提供手工材料与进度计算",
  "weather": "支持天气查询与穿衣出行参考",
  "astronomy": "提供月相等天文兴趣查询",
  "automotive": "覆盖油耗、用车成本等计算",
  "gardening": "支持浇水提醒与植物护理辅助",
  "fitness": "提供训练计时与健身记录",
  "lifestyle": "覆盖习惯、提醒与生活方式记录"
};
  const count = list.length;
  const blurb = CORE[catId] || (name + '常用在线工具合集');
  const names = list
    .map((t) => String(t.name || '').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .sort((a, b) => a.length - b.length)
    .filter((n, i, arr) => n.length <= 18 && arr.indexOf(n) === i)
    .slice(0, 4);
  const examples = names.length
    ? ('例如' + names.join('、') + (list.length > names.length ? '等' : ''))
    : '按场景分类整理';
  let d = name + '分类页收录 ' + count + ' 个免费在线工具，' + blurb + '。' + examples + '；全部在浏览器本地运行，打开即用、无需注册安装。';
  d = d.replace(/\s+/g, ' ').trim();
  const extras = [
    '适合需要快速完成相关任务的个人与团队。',
    '结果可直接复制或下载，便于日常使用。',
    '支持桌面与手机浏览器访问。',
  ];
  let i = 0;
  while (d.length < 120 && i < extras.length) {
    d += extras[(catId.length + i) % extras.length];
    i++;
  }
  if (d.length < 120) d += '当前共 ' + count + ' 款可直接使用。';
  if (d.length > 160) {
    let cut = d.slice(0, 160);
    const p = Math.max(cut.lastIndexOf('。'), cut.lastIndexOf('；'), cut.lastIndexOf('，'));
    if (p >= 120) cut = cut.slice(0, p + 1);
    d = cut;
  }
  return d;
}
function padDesc(s) {
  // backward-compatible name; no longer pads with repeated filler
  let d = String(s || '').replace(/\s+/g, ' ').trim();
  d = d.replace(/(免费在线使用[，,]浏览器本地处理[，,]无需注册[。.]?\s*)+/g, '');
  if (d.length > 160) d = d.slice(0, 160);
  return d;
}


function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toolUrl(t) {
  // path like tools/dev/base64.html -> /tools/dev/base64
  return '/' + String(t.path || '').replace(/\\/g, '/').replace(/\.html$/i, '');
}

function toolExists(t) {
  const p = path.join(root, String(t.path || '').replace(/\\/g, '/'));
  return fs.existsSync(p);
}

function byCategory() {
  const map = {};
  for (const t of tools) {
    if (!t || !t.category || !t.path) continue;
    // skip category index itself
    if (/\/index\.html$/i.test(t.path)) continue;
    if (!toolExists(t)) continue;
    if (!map[t.category]) map[t.category] = [];
    map[t.category].push(t);
  }
  for (const k of Object.keys(map)) {
    map[k].sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'zh-CN'));
  }
  return map;
}

function relatedCategories(catId, limit = 6) {
  const ids = Object.keys(categories).filter((id) => id !== catId);
  // simple: neighbors by order + a few with tools
  const ordered = Object.keys(categories);
  const idx = ordered.indexOf(catId);
  const picks = new Set();
  for (let i = 1; i <= 3; i++) {
    if (ordered[idx - i]) picks.add(ordered[idx - i]);
    if (ordered[idx + i]) picks.add(ordered[idx + i]);
  }
  for (const id of ids) {
    if (picks.size >= limit) break;
    picks.add(id);
  }
  return [...picks].slice(0, limit).map((id) => ({
    id,
    name: categories[id].name || id,
    icon: categories[id].icon || '🔧',
  }));
}

function buildPage(catId, cat, list) {
  const name = cat.name || catId;
  const icon = cat.icon || '🔧';
  const blurb =
    cat.description ||
    FALLBACK_DESC[catId] ||
    `${name}在线工具合集，精选常用免费工具，浏览器本地运行。`;
  const count = list.length;
  const desc = buildHubDescription(catId, name, list);
  const title = `${name} - ${count} 个免费在线工具 | WebUtils`;
  const url = `https://essays4u.net/tools/${catId}/`;
  const canonical = `https://essays4u.net/tools/${catId}`;

  const itemList = list.slice(0, 50).map((t, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: t.name,
    url: 'https://essays4u.net' + toolUrl(t),
  }));

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: `${name}在线工具`,
        url: canonical,
        description: desc,
        inLanguage: 'zh-CN',
        isPartOf: { '@type': 'WebSite', name: 'WebUtils', url: 'https://essays4u.net/' },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: count,
          itemListElement: itemList,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页', item: 'https://essays4u.net/' },
          { '@type': 'ListItem', position: 2, name: '全部工具', item: 'https://essays4u.net/tools-directory' },
          { '@type': 'ListItem', position: 3, name, item: canonical },
        ],
      },
    ],
  };

  const cards = list
    .map((t) => {
      const href = toolUrl(t);
      const tIcon = t.icon || icon;
      const tDesc = escapeHtml(t.description || t.name || '');
      const tName = escapeHtml(t.name || path.basename(href));
      return `          <a class="tool-card" href="${href}">
            <div class="tool-icon">${escapeHtml(tIcon)}</div>
            <div class="tool-body">
              <h2 class="tool-name">${tName}</h2>
              <p class="tool-desc">${tDesc}</p>
            </div>
            <span class="tool-arrow" aria-hidden="true">→</span>
          </a>`;
    })
    .join('\n');

  const related = relatedCategories(catId)
    .map(
      (r) =>
        `          <a class="related-chip" href="/tools/${r.id}/">${escapeHtml(r.icon)} ${escapeHtml(r.name)}</a>`
    )
    .join('\n');

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(desc)}" />
    <meta name="keywords" content="${escapeHtml(name)},在线工具,免费工具,WebUtils,${escapeHtml(catId)}" />
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
        background: rgba(255,255,255,.9);
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
      .site-nav a {
        color: var(--muted); text-decoration: none; font-size: .92rem;
      }
      .site-nav a:hover { color: var(--primary); }
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
        padding: 28px 24px 24px;
        margin-bottom: 22px;
        text-align: center;
      }
      .hero-icon {
        width: 64px; height: 64px; margin: 0 auto 12px;
        border-radius: 18px;
        display: flex; align-items: center; justify-content: center;
        font-size: 2rem;
        background: var(--primary-soft);
      }
      .hero h1 {
        font-size: clamp(1.6rem, 3vw, 2.1rem);
        margin-bottom: 8px;
      }
      .hero .lead {
        color: var(--muted);
        max-width: 720px;
        margin: 0 auto 14px;
        font-size: 1rem;
      }
      .meta-row {
        display: flex; flex-wrap: wrap; gap: 8px;
        justify-content: center;
      }
      .pill {
        display: inline-flex; align-items: center;
        padding: 6px 12px; border-radius: 999px;
        background: var(--bg);
        border: 1px solid var(--border);
        color: var(--muted);
        font-size: .86rem;
      }
      .tool-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
      }
      @media (min-width: 720px) {
        .tool-grid { grid-template-columns: 1fr 1fr; }
      }
      @media (min-width: 1024px) {
        .tool-grid { grid-template-columns: 1fr 1fr 1fr; }
      }
      .tool-card {
        display: flex; align-items: flex-start; gap: 12px;
        text-decoration: none; color: inherit;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 16px;
        box-shadow: var(--shadow);
        transition: transform .15s ease, border-color .15s ease, box-shadow .15s ease;
      }
      .tool-card:hover {
        transform: translateY(-2px);
        border-color: color-mix(in srgb, var(--primary) 40%, var(--border));
        box-shadow: 0 12px 30px rgba(79,70,229,.12);
      }
      .tool-icon {
        width: 42px; height: 42px; flex-shrink: 0;
        border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
        background: var(--primary-soft);
        font-size: 1.2rem;
      }
      .tool-body { min-width: 0; flex: 1; }
      .tool-name {
        font-size: 1rem;
        font-weight: 700;
        margin-bottom: 4px;
        line-height: 1.35;
      }
      .tool-desc {
        font-size: .88rem;
        color: var(--muted);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .tool-arrow {
        color: var(--muted);
        font-size: 1.1rem;
        margin-top: 2px;
      }
      .section {
        margin-top: 28px;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 16px;
        box-shadow: var(--shadow);
        padding: 18px;
      }
      .section h2 {
        font-size: 1.05rem;
        margin-bottom: 12px;
      }
      .related-list {
        display: flex; flex-wrap: wrap; gap: 8px;
      }
      .related-chip {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: var(--bg);
        color: var(--text);
        text-decoration: none;
        font-size: .9rem;
      }
      .related-chip:hover {
        border-color: var(--primary);
        color: var(--primary);
      }
      .empty {
        text-align: center;
        color: var(--muted);
        padding: 40px 16px;
        border: 1px dashed var(--border);
        border-radius: 16px;
        background: var(--card);
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
          <a href="/tools-directory">全部工具</a>
          <a href="/#${escapeHtml(catId)}">${escapeHtml(name)}</a>
        </nav>
      </div>
    </header>

    <main class="page">
      <nav class="breadcrumb" aria-label="breadcrumb">
        <ol>
          <li><a href="/">首页</a></li>
          <li><a href="/tools-directory">全部工具</a></li>
          <li><span>${escapeHtml(name)}</span></li>
        </ol>
      </nav>

      <section class="hero">
        <div class="hero-icon" aria-hidden="true">${escapeHtml(icon)}</div>
        <h1>${escapeHtml(name)}</h1>
        <p class="lead">${escapeHtml(blurb)}</p>
        <div class="meta-row">
          <span class="pill">${count} 个工具</span>
          <span class="pill">纯本地运行</span>
          <span class="pill">免费使用</span>
        </div>
      </section>

      ${
        count
          ? `<section class="tool-grid" aria-label="${escapeHtml(name)}工具列表">\n${cards}\n      </section>`
          : `<div class="empty">该分类暂无已上线工具，请稍后再来。</div>`
      }

      <section class="section" aria-label="相关分类">
        <h2>相关分类</h2>
        <div class="related-list">
${related}
          <a class="related-chip" href="/tools-directory">📚 全部工具目录</a>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="footer-inner">
        <p>WebUtils · ${escapeHtml(name)} · 分类工具导航</p>
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
  </body>
</html>
`;
}

function updateSitemap(hubPaths) {
  const smPath = path.join(root, 'sitemap.xml');
  if (!fs.existsSync(smPath)) return { sitemap: false };
  let sm = fs.readFileSync(smPath, 'utf8');
  const today = new Date().toISOString().slice(0, 10);
  let added = 0;
  for (const loc of hubPaths) {
    if (sm.includes(`<loc>${loc}</loc>`) || sm.includes(`<loc>${loc.replace(/\/$/, '')}</loc>`)) {
      continue;
    }
    const entry = `  <url>\n    <loc>${loc.replace(/\/$/, '')}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    sm = sm.replace('</urlset>', entry + '</urlset>');
    added++;
  }
  fs.writeFileSync(smPath, sm, 'utf8');
  return { sitemap: true, added };
}

const map = byCategory();
const catIds = Object.keys(categories);
let written = 0;
const stats = [];
const hubUrls = [];

for (const catId of catIds) {
  const cat = categories[catId];
  const list = map[catId] || [];
  // also include filesystem-only tools not in tools.json? stick to tools.json for consistency
  const dir = path.join(root, 'tools', catId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Preserve special ai-coding curated page? User asked for all categories like extractor/pets.
  // We'll overwrite index.html for all, including ai-coding, with generated hub.
  const out = path.join(dir, 'index.html');
  fs.writeFileSync(out, buildPage(catId, cat, list), 'utf8');
  written++;
  stats.push({ catId, count: list.length });
  hubUrls.push(`https://essays4u.net/tools/${catId}/`);
}

const sm = updateSitemap(hubUrls);

// verify a few
function verify(file) {
  const html = fs.readFileSync(file, 'utf8');
  const d = (html.match(/name="description"\s+content="([^"]+)"/) || [])[1] || '';
  const body = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const h1 = (body.match(/<h1\b/gi) || []).length;
  return { file: path.relative(root, file).replace(/\\/g, '/'), desc: d.length, h1, ads: html.includes('adsbygoogle') };
}

const checks = [
  verify(path.join(root, 'tools/extractor/index.html')),
  verify(path.join(root, 'tools/pets/index.html')),
  verify(path.join(root, 'tools/crypto/index.html')),
  verify(path.join(root, 'tools/dev/index.html')),
];

console.log(
  JSON.stringify(
    {
      categories: catIds.length,
      written,
      totalToolsLinked: stats.reduce((s, x) => s + x.count, 0),
      empty: stats.filter((s) => s.count === 0).map((s) => s.catId),
      top: stats.sort((a, b) => b.count - a.count).slice(0, 8),
      sitemap: sm,
      checks,
    },
    null,
    2
  )
);
