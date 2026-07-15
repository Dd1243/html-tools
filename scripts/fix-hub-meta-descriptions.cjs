/**
 * Rewrite category hub meta descriptions:
 * - remove repeated filler ("免费在线使用…")
 * - unique per category
 * - target 120–160 Chinese chars
 * Updates: meta description, og/twitter description, CollectionPage JSON-LD description
 * Does NOT rewrite whole hub pages.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const toolsJson = JSON.parse(fs.readFileSync(path.join(root, 'tools.json'), 'utf8'));
const categories = toolsJson.categories || {};
const tools = Object.values(toolsJson.tools || {});

const CORE_BLURB = {
  dev: '覆盖代码格式化、Base64、正则、JSON、哈希等开发常用能力',
  text: '支持字数统计、去重对比、大小写与中英文文本批量处理',
  time: '提供倒计时、时区转换、时间戳与工时日期计算',
  generator: '可生成二维码、假数据、条码、占位图与创意素材',
  media: '包含图片压缩、颜色、PDF 与常见媒体处理能力',
  privacy: '侧重加密脱敏、哈希校验与隐私数据处理',
  security: '提供安全头、哈希、策略生成与基础安全检查',
  network: '支持 IP、DNS、HTTP、端口与网络排查相关查询',
  calculator: '覆盖比例、百分比、场景数值等快速计算',
  converter: '提供单位、编码、进制与常见格式转换',
  extractor: '可从文本中提取链接、邮箱、正则匹配等结构化信息',
  ai: '汇集 AI 指南与小工具，覆盖提示、模型与效率场景',
  seo: '包含 Meta、标题结构、关键词与社交预览等 SEO 检查',
  fun: '提供随机决策、趣味互动等轻松小工具',
  game: '收录浏览器小游戏，打开即可玩',
  life: '覆盖日常计时、待办、笔记与生活常用计算',
  finance: '支持贷款、利率、预算、利润等财务测算',
  health: '提供健康估算与记录辅助，结果仅供参考',
  education: '包含成绩、公式、闪卡与学习辅助工具',
  food: '支持份量换算、烹饪计时与餐饮成本估算',
  chinese: '面向中文场景：拼音、证件校验、历法与本地化处理',
  'ai-coding': '聚焦 AI 编程资源、IDE 实践与开发效率工具',
  realestate: '覆盖房贷、税费、租金回报与装修预算测算',
  business: '提供 ROI、盈亏平衡、现金流与定价辅助',
  crypto: '支持收益、杠杆、定投与仓位等加密货币计算',
  legal: '提供清单与模板类合规辅助，非正式法律意见',
  'social-media': '覆盖文案、预览、标签与运营草稿辅助',
  'team-tools': '支持站会、议程、任务拆解与团队复盘',
  data: '提供数据清洗、转换、图表与校验辅助',
  office: '覆盖发票、工时、清单与办公文档模板',
  travel: '支持行李、汇率、行程与出行相关计算',
  design: '可生成配色、阴影、布局与 CSS 效果',
  math: '覆盖方程、统计、进制与数学运算',
  productivity: '提供番茄钟、习惯与专注效率工具',
  sports: '支持运动记录与健身相关计算',
  music: '包含节拍器、和弦等音乐练习辅助',
  pets: '覆盖宠物年龄换算、喂食与日常照护',
  photography: '提供曝光、焦距等摄影参数辅助',
  shopping: '支持单价比价与购物决策计算',
  language: '覆盖词汇、拼音与语言学习练习',
  art: '提供配色混合与艺术创作辅助',
  social: '支持分摊、礼物与活动倒计时等社交场景',
  parenting: '覆盖育儿记录与喂养日常辅助',
  diy: '提供手工材料与进度计算',
  weather: '支持天气查询与穿衣出行参考',
  astronomy: '提供月相等天文兴趣查询',
  automotive: '覆盖油耗、用车成本等计算',
  gardening: '支持浇水提醒与植物护理辅助',
  fitness: '提供训练计时与健身记录',
  lifestyle: '覆盖习惯、提醒与生活方式记录',
};

function toolsInCategory(catId) {
  return tools.filter(
    (t) =>
      t &&
      t.category === catId &&
      t.path &&
      !/\/index\.html$/i.test(t.path) &&
      fs.existsSync(path.join(root, String(t.path).replace(/\\/g, '/')))
  );
}

function pickToolNames(list, n = 4) {
  // Prefer representative tools: medium-length names, Chinese alpha order, de-duped
  const names = list
    .map((t) => String(t.name || '').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .filter((name, i, arr) => arr.indexOf(name) === i)
    .sort((a, b) => a.localeCompare(b, 'zh-CN'));

  const medium = names.filter((name) => name.length >= 4 && name.length <= 16);
  const pool = medium.length >= n ? medium : names;
  // spread picks across the list instead of always taking the first few
  const picked = [];
  if (!pool.length) return picked;
  const step = Math.max(1, Math.floor(pool.length / n));
  for (let i = 0; i < pool.length && picked.length < n; i += step) {
    picked.push(pool[i].length > 16 ? pool[i].slice(0, 16) : pool[i]);
  }
  // fill remaining
  for (const name of pool) {
    if (picked.length >= n) break;
    if (!picked.includes(name)) picked.push(name.length > 16 ? name.slice(0, 16) : name);
  }
  return picked;
}

function cleanText(s) {
  return String(s || '')
    .replace(/\s+/g, ' ')
    .replace(/(免费在线使用[，,]浏览器本地处理[，,]无需注册[。.]?\s*)+/g, '')
    .replace(/(纯前端运行[，,]无需安装注册[。.]?\s*)+/g, '')
    .replace(/(无需安装注册[。.]?\s*)+/g, '')
    .replace(/(浏览器本地处理[。.]?\s*)+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Build a natural 120-160 char description without repeated filler.
 */
function buildDesc(catId, catName, list) {
  const count = list.length;
  const blurb = CORE_BLURB[catId] || `${catName}常用在线工具合集`;
  const names = pickToolNames(list, 4);
  const examples = names.length
    ? `例如${names.join('、')}${list.length > names.length ? '等' : ''}`
    : '按场景分类整理';

  // Compose without repeating same clause
  let d = `${catName}分类页收录 ${count} 个免费在线工具，${blurb}。${examples}；全部在浏览器本地运行，打开即用、无需注册安装。`;

  d = cleanText(d);

  // If short, enrich with unique value props (not same sentence loop)
  const enrichers = [
    `适合需要快速完成${catName.replace(/工具$/, '')}相关任务的个人与团队。`,
    `结果可直接复制或下载，便于日常办公与学习使用。`,
    `页面持续更新工具列表，便于从分类入口发现相关能力。`,
    `支持桌面与手机浏览器访问，操作路径清晰。`,
  ];
  let i = 0;
  while (d.length < 120 && i < enrichers.length) {
    // pick enricher based on cat hash for variety
    const idx = (catId.charCodeAt(0) + catId.length + i) % enrichers.length;
    const piece = enrichers[idx];
    if (!d.includes(piece.slice(0, 8))) d += piece;
    i++;
    d = cleanText(d);
  }

  // still short? add count reminder once
  if (d.length < 120) {
    d += `当前共 ${count} 款可直接使用。`;
  }

  d = cleanText(d);

  // trim to 160 without cutting mid-sentence if possible
  if (d.length > 160) {
    let cut = d.slice(0, 160);
    const punct = Math.max(cut.lastIndexOf('。'), cut.lastIndexOf('；'), cut.lastIndexOf('，'));
    if (punct >= 120) cut = cut.slice(0, punct + 1);
    d = cut;
  }

  // ensure min 120 with a single non-repetitive closer if still short
  if (d.length < 120) {
    const need = 120 - d.length;
    const closer = '免费使用，数据默认留在本地。';
    d = (d + closer).slice(0, Math.max(120, Math.min(160, d.length + closer.length)));
  }

  // final sanitize: collapse any accidental repeated phrases
  d = d
    .replace(/(免费在线使用[，,]?浏览器本地处理[，,]?无需注册[。.]?)+/g, '浏览器本地运行，无需注册。')
    .replace(/(无需注册安装[。.]?)+/g, '无需注册安装。')
    .replace(/(打开即用[，,]?无需注册安装[。.]?)+/g, '打开即用、无需注册安装。');

  if (d.length > 160) d = d.slice(0, 160);
  return d;
}

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function updateFile(fp, desc) {
  let html = fs.readFileSync(fp, 'utf8');
  const before = html;
  const esc = escapeAttr(desc);

  // meta description
  html = html.replace(
    /(<meta\s+name=["']description["']\s+content=["'])([^"']*)(["']\s*\/?>)/i,
    `$1${esc}$3`
  );
  // reverse order content/name
  html = html.replace(
    /(<meta\s+content=["'])([^"']*)(["']\s+name=["']description["']\s*\/?>)/i,
    `$1${esc}$3`
  );

  // og:description
  html = html.replace(
    /(<meta\s+property=["']og:description["']\s+content=["'])([^"']*)(["']\s*\/?>)/i,
    `$1${esc}$3`
  );
  html = html.replace(
    /(<meta\s+content=["'])([^"']*)(["']\s+property=["']og:description["']\s*\/?>)/i,
    `$1${esc}$3`
  );

  // twitter:description
  html = html.replace(
    /(<meta\s+name=["']twitter:description["']\s+content=["'])([^"']*)(["']\s*\/?>)/i,
    `$1${esc}$3`
  );
  html = html.replace(
    /(<meta\s+content=["'])([^"']*)(["']\s+name=["']twitter:description["']\s*\/?>)/i,
    `$1${esc}$3`
  );

  // CollectionPage description inside first ld+json graph (safe: only replace description value near CollectionPage)
  // Replace "description": "..." only within scripts that contain CollectionPage, using script-bounded scan
  const openRe = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>/gi;
  let m;
  const replacements = [];
  while ((m = openRe.exec(html)) !== null) {
    const openEnd = m.index + m[0].length;
    const closeIdx = html.indexOf('</script>', openEnd);
    if (closeIdx < 0) continue;
    const body = html.slice(openEnd, closeIdx);
    if (!/"@type"\s*:\s*"CollectionPage"/i.test(body)) continue;
    // replace first description field of CollectionPage block carefully
    let newBody = body;
    // Prefer description that looks like hub meta (long / contains 导航 or 免费工具)
    if (/"description"\s*:\s*"/.test(newBody)) {
      // Replace the description that appears soon after CollectionPage
      newBody = newBody.replace(
        /("description"\s*:\s*")((?:\\.|[^"\\])*)(")/,
        (all, a, _old, c) => a + desc.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + c
      );
    }
    if (newBody !== body) {
      replacements.push({ openEnd, closeIdx, newBody });
    }
  }
  // apply from end
  for (let i = replacements.length - 1; i >= 0; i--) {
    const r = replacements[i];
    html = html.slice(0, r.openEnd) + r.newBody + html.slice(r.closeIdx);
  }

  // safety
  if (html.length < before.length * 0.85) return { ok: false, reason: 'shrink' };
  if (!/<body[\s\S]*<\/body>/i.test(html)) return { ok: false, reason: 'no-body' };
  if (html === before) return { ok: false, reason: 'unchanged' };

  fs.writeFileSync(fp, html, 'utf8');
  return { ok: true };
}

// Also fix generator padDesc for future runs
function patchGenerator() {
  const fp = path.join(root, 'scripts/generate-category-hubs.cjs');
  if (!fs.existsSync(fp)) return false;
  let src = fs.readFileSync(fp, 'utf8');
  if (src.includes('/* hub-desc-v2 */')) return false;

  const newHelpers = `
/* hub-desc-v2 */
function buildHubDescription(catId, name, list) {
  const CORE = ${JSON.stringify(CORE_BLURB, null, 2)};
  const count = list.length;
  const blurb = CORE[catId] || (name + '常用在线工具合集');
  const names = list
    .map((t) => String(t.name || '').replace(/\\s+/g, ' ').trim())
    .filter(Boolean)
    .sort((a, b) => a.length - b.length)
    .filter((n, i, arr) => n.length <= 18 && arr.indexOf(n) === i)
    .slice(0, 4);
  const examples = names.length
    ? ('例如' + names.join('、') + (list.length > names.length ? '等' : ''))
    : '按场景分类整理';
  let d = name + '分类页收录 ' + count + ' 个免费在线工具，' + blurb + '。' + examples + '；全部在浏览器本地运行，打开即用、无需注册安装。';
  d = d.replace(/\\s+/g, ' ').trim();
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
  let d = String(s || '').replace(/\\s+/g, ' ').trim();
  d = d.replace(/(免费在线使用[，,]浏览器本地处理[，,]无需注册[。.]?\\s*)+/g, '');
  if (d.length > 160) d = d.slice(0, 160);
  return d;
}
`;

  // Replace old padDesc function
  src = src.replace(
    /function padDesc\(s\) \{[\s\S]*?\n\}/,
    newHelpers.trim() + '\n'
  );

  // Replace desc assignment in buildPage
  src = src.replace(
    /const desc = padDesc\(\s*`\$\{name\}在线工具导航：收录 \$\{count\} 个免费工具。\$\{blurb\}纯前端运行，无需安装注册。`\s*\);/,
    'const desc = buildHubDescription(catId, name, list);'
  );

  fs.writeFileSync(fp, src, 'utf8');
  return true;
}

const results = [];
let ok = 0;
let bad = 0;
const descs = [];

for (const catId of Object.keys(categories)) {
  const fp = path.join(root, 'tools', catId, 'index.html');
  if (!fs.existsSync(fp)) continue;
  const cat = categories[catId];
  const list = toolsInCategory(catId);
  const desc = buildDesc(catId, cat.name || catId, list);
  const len = desc.length;
  const hasRepeat = /(免费在线使用[，,]浏览器本地处理[，,]无需注册[。.]?){2,}/.test(desc);
  const r = updateFile(fp, desc);
  descs.push({ catId, len, hasRepeat, ok: r.ok, reason: r.reason, desc });
  if (r.ok && len >= 120 && len <= 160 && !hasRepeat) ok++;
  else bad++;
  results.push({ catId, len, status: r.ok ? 'updated' : r.reason, sample: desc.slice(0, 80) });
}

const genPatched = patchGenerator();

// uniqueness check
const map = new Map();
for (const d of descs) {
  map.set(d.desc, (map.get(d.desc) || 0) + 1);
}
const dupes = [...map.entries()].filter(([, c]) => c > 1);

console.log(
  JSON.stringify(
    {
      updated: results.filter((x) => x.status === 'updated').length,
      failed: results.filter((x) => x.status !== 'updated').length,
      okRangeUnique: ok,
      bad,
      generatorPatched: genPatched,
      duplicateDescriptions: dupes.length,
      samples: results.slice(0, 8),
      seo: descs.find((d) => d.catId === 'seo'),
      generator: descs.find((d) => d.catId === 'generator'),
      calculator: descs.find((d) => d.catId === 'calculator'),
    },
    null,
    2
  )
);

if (bad > 0 || dupes.length > 0) process.exitCode = 1;
