const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const MIN_LENGTH = 120;
const MAX_LENGTH = 160;

const SKIP_DIRS = new Set(['.git', 'node_modules', 'screenshots', 'docs']);
const EXCLUDED_PATTERNS = [
  /^ByteDanceVerify\.html$/,
  /^baidu_verify_/,
  /^BingSiteAuth\.xml$/,
  /^offline\.html$/,
  /^design-reference[\\/]/,
  /^design-templates[\\/]/,
  /^templates[\\/]/,
];

const CATEGORY_LABELS = {
  ai: 'AI 资讯与应用',
  'ai-coding': 'AI 编程',
  art: '艺术创作',
  astronomy: '天文观测',
  automotive: '汽车出行',
  business: '商业经营',
  calculator: '计算器',
  chinese: '中文与传统文化',
  converter: '单位与格式转换',
  crypto: '加密货币',
  data: '数据处理',
  design: '设计与 CSS',
  dev: '开发者',
  diy: '家装 DIY',
  ecommerce: '电商购物',
  education: '学习教育',
  extractor: '提取分析',
  finance: '财务理财',
  fitness: '健身训练',
  food: '美食烹饪',
  fun: '趣味互动',
  game: '小游戏',
  gaming: '游戏',
  gardening: '园艺种植',
  generator: '生成器',
  health: '健康管理',
  language: '语言学习',
  legal: '法律文书',
  life: '生活效率',
  lifestyle: '生活方式',
  math: '数学计算',
  media: '媒体处理',
  music: '音乐工具',
  network: '网络运维',
  office: '办公协作',
  parenting: '育儿家庭',
  pet: '宠物照护',
  pets: '宠物照护',
  photography: '摄影',
  privacy: '隐私安全',
  productivity: '效率工具',
  'real-estate': '房产',
  realestate: '房产',
  security: '安全检测',
  seo: 'SEO',
  shopping: '购物比价',
  social: '社交生活',
  'social-media': '社交媒体',
  sports: '运动',
  team: '团队协作',
  'team-tools': '团队协作',
  text: '文本处理',
  time: '时间日期',
  travel: '旅行',
  weather: '天气',
};

const ACTIONS = [
  '支持快速输入、实时计算、结果复制与本地处理',
  '提供清晰的参数设置、即时预览、结果导出和常见场景说明',
  '适合日常办公、学习记录、数据核对和移动端快速使用',
  '帮助减少手动换算、重复整理和容易出错的计算步骤',
  '可在浏览器中直接完成操作，无需注册登录，注重效率与隐私',
  '结合实用选项、示例提示和结构化结果，让复杂任务更容易完成',
  '面向中文用户优化输入体验，适合桌面和手机端随时使用',
  '覆盖常见使用场景，并保留灵活配置，方便个人和团队复用',
];

const BENEFITS = [
  '适合临时查询、批量整理、结果核对和移动端快速使用。',
  '页面保留必要说明和示例提示，方便新用户理解输入方式。',
  '结果区域便于复制、保存或继续用于文档、报表和团队沟通。',
  '所有步骤都围绕实际任务展开，减少来回切换工具的时间。',
  '界面保持轻量清晰，适合个人、学生、运营、设计和开发场景。',
  '可作为日常工作流中的快捷入口，帮助把零散操作标准化。',
  '适用于一次性处理，也适合收藏后在相似任务中反复复用。',
  '在浏览器中即可完成主要操作，减少安装软件和上传资料的成本。',
];

function getHtmlFiles(dir) {
  const files = [];
  const pending = [dir];
  while (pending.length) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) pending.push(entryPath);
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        files.push(entryPath);
      }
    }
  }
  return files.sort();
}

function isExcluded(filePath) {
  const relative = path.relative(ROOT, filePath);
  return EXCLUDED_PATTERNS.some((pattern) => pattern.test(relative));
}

function stripTags(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeEntities(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function escapeAttr(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function isMojibake(value) {
  if (!value) return true;
  const badChars = (value.match(/[�锟]|鏂|鐢|鍣|宸|涓|绠|馃|鈿|鍦|浠|寮|瀹/g) || []).length;
  return badChars > 0 || /[?]{4,}/.test(value);
}

function normalizeName(value) {
  return decodeEntities(stripTags(value || ''))
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/\s*[-|]\s*(WebUtils|Web工具箱|Web宸.*)$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleCaseFromSlug(slug) {
  const acronyms = new Set([
    'ai',
    'api',
    'css',
    'csv',
    'dns',
    'gif',
    'html',
    'http',
    'ico',
    'ip',
    'json',
    'jwt',
    'pdf',
    'png',
    'qr',
    'rsa',
    'seo',
    'sql',
    'ssl',
    'svg',
    'url',
    'utm',
    'uuid',
    'xml',
    'yaml',
  ]);
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => {
      const lower = part.toLowerCase();
      if (acronyms.has(lower)) return lower.toUpperCase();
      if (/^\d/.test(part)) return part;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

function getMetaTag(html, name) {
  return html.match(new RegExp(`<meta\\s+[^>]*(?:name|property)=["']${name}["'][^>]*>`, 'i'));
}

function getMetaContent(html, name) {
  const tag = getMetaTag(html, name);
  if (!tag) return '';
  const content = tag[0].match(/content=["']([^"']*)["']/i);
  return content ? decodeEntities(content[1]).replace(/\s+/g, ' ').trim() : '';
}

function getFirstMatch(html, regex) {
  const match = html.match(regex);
  return match ? normalizeName(match[1]) : '';
}

function getPageInfo(filePath, html) {
  const relative = path.relative(ROOT, filePath);
  const parts = relative.split(path.sep);
  const fileName = path.basename(filePath, '.html');
  const category = parts[0] === 'tools' ? parts[1] : parts[0].replace(/\.html$/, '');
  const categoryLabel = CATEGORY_LABELS[category] || titleCaseFromSlug(category || 'WebUtils');
  const h1 = getFirstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = getFirstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const rawKeywords = getMetaContent(html, 'keywords')
    .split(/[,，、]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const slugParts = new Set(
    [fileName, category, ...fileName.split(/[-_]/), ...relative.split(/[\\/.-]/)]
      .map((item) => item.toLowerCase())
      .filter(Boolean)
  );
  const keywords = rawKeywords
    .filter((item) => {
      const lower = item.toLowerCase();
      if (['tools', 'webutils', 'online', 'tool', 'calculator', 'generator'].includes(lower)) return false;
      if (slugParts.has(lower) && /^[a-z0-9-]+$/.test(lower)) return false;
      return !isMojibake(item);
    })
    .slice(0, 5);

  let name = [h1, title].find((item) => item && !isMojibake(item) && item.length <= 80);
  if (!name) name = titleCaseFromSlug(fileName);
  if (!/工具|计算器|生成器|转换器|查看器|查询|检测|编辑器|Tool|Calculator|Generator|Converter|Viewer/i.test(name)) {
    const suffix = category === 'calculator' || /calc|calculator/.test(fileName) ? '计算器' : '工具';
    name = `${name} ${suffix}`;
  }

  const keywordText = keywords.length && !keywords.some(isMojibake) ? `覆盖 ${keywords.join('、')} 等关键词，` : '';
  return {
    relative,
    fileName,
    categoryLabel,
    name,
    keywordText,
  };
}

function charLength(value) {
  return [...value].length;
}

function trimToMax(value) {
  if (charLength(value) <= MAX_LENGTH) return value;
  const chars = [...value];
  let trimmed = chars.slice(0, MAX_LENGTH - 1).join('');
  const punctuationIndexes = ['。', '；', '，', '、', ',', ';'].map((mark) => trimmed.lastIndexOf(mark));
  const cutAt = Math.max(...punctuationIndexes);
  if (cutAt >= MIN_LENGTH) trimmed = trimmed.slice(0, cutAt + 1);
  trimmed = trimmed.replace(/[，、；：,;:\s]+$/, '');
  if (!trimmed || /^[。！？]/.test(trimmed)) {
    trimmed = chars.slice(0, MAX_LENGTH - 1).join('').replace(/[，、；：,;:\s]+$/, '');
  }
  if (!/[。！？]$/.test(trimmed)) trimmed += '。';
  return trimmed;
}

function buildDescription(info, index) {
  const action = ACTIONS[index % ACTIONS.length];
  const pageContext = info.relative
    .replace(/\\/g, '/')
    .replace(/\.html$/, '')
    .replace(/^tools\//, '')
    .replace(/\//g, ' / ');
  const base = `${info.name}是 WebUtils 的${info.categoryLabel}工具，适用于 ${pageContext} 页面场景，${info.keywordText}${action}。适合需要准确结果、快速处理和无需安装即可完成任务的用户。`;
  const extras = [
    BENEFITS[index % BENEFITS.length],
    BENEFITS[(index + 3) % BENEFITS.length],
    BENEFITS[(index + 5) % BENEFITS.length],
  ];

  let description = base;
  for (const extra of extras) {
    if (charLength(description) >= MIN_LENGTH) break;
    description += extra;
  }
  description = trimToMax(description);
  let benefitIndex = index;
  while (charLength(description) < MIN_LENGTH) {
    description += BENEFITS[benefitIndex % BENEFITS.length];
    benefitIndex += 1;
    description = trimToMax(description);
  }
  description = trimToMax(description);
  return description;
}

function ensureUnique(description, info, used) {
  if (!used.has(description)) return description;
  const variants = [
    `适合处理 ${info.relative.replace(/\\/g, '/')} 对应的专属场景。`,
    `页面路径 ${info.relative.replace(/\\/g, '/')} 对应独立工具内容。`,
    `可用于 ${titleCaseFromSlug(info.fileName)} 的专门任务。`,
  ];
  for (const variant of variants) {
    let candidate = `${description.replace(/[。！？]$/, '')}，${variant}`;
    if (charLength(candidate) > MAX_LENGTH) candidate = trimToMax(candidate);
    if (charLength(candidate) >= MIN_LENGTH && charLength(candidate) <= MAX_LENGTH && !used.has(candidate)) {
      return candidate;
    }
  }
  return description;
}

function replaceOrInsertDescription(html, description) {
  const escaped = escapeAttr(description);
  const descriptionRegex = /<meta\s+[^>]*name=["']description["'][^>]*>\s*/gi;
  if (descriptionRegex.test(html)) {
    let replaced = false;
    return html.replace(descriptionRegex, () => {
      if (replaced) return '';
      replaced = true;
      return `<meta name="description" content="${escaped}" />\n    `;
    });
  }
  return html.replace(/<title[\s\S]*?<\/title>/i, (title) => `${title}\n    <meta name="description" content="${escaped}" />`);
}

function replaceSocialDescription(html, property, description) {
  const escaped = escapeAttr(description);
  const regex = new RegExp(`<meta\\s+[^>]*(?:property|name)=["']${property}["'][^>]*>`, 'i');
  if (!regex.test(html)) return html;
  return html.replace(regex, (tag) => {
    if (/content=["'][^"']*["']/i.test(tag)) return tag.replace(/content=["'][^"']*["']/i, `content="${escaped}"`);
    return tag.replace(/\/?>$/, ` content="${escaped}" />`);
  });
}

const used = new Set();
let updated = 0;

for (const filePath of getHtmlFiles(ROOT)) {
  if (isExcluded(filePath)) continue;
  let html = fs.readFileSync(filePath, 'utf8');
  const info = getPageInfo(filePath, html);
  let description = buildDescription(info, updated);
  description = ensureUnique(description, info, used);
  used.add(description);

  html = replaceOrInsertDescription(html, description);
  html = replaceSocialDescription(html, 'og:description', description);
  html = replaceSocialDescription(html, 'twitter:description', description);
  fs.writeFileSync(filePath, html, 'utf8');
  updated += 1;
}

console.log(`Updated ${updated} meta descriptions.`);
