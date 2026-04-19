const fs = require('fs');
const path = require('path');

const TOOLS_ROOT = path.resolve(__dirname, '../tools');
const SITE_URL = 'https://essays4u.net';
const DEFAULT_SITE_NAME = 'WebUtils';
const DEFAULT_IMAGE = `${SITE_URL}/social-preview.png`;
const APPLICATION_CATEGORY_MAP = {
  ai: 'UtilitiesApplication',
  'ai-coding': 'DeveloperApplication',
  astronomy: 'UtilitiesApplication',
  automotive: 'UtilitiesApplication',
  business: 'BusinessApplication',
  calculator: 'UtilitiesApplication',
  chinese: 'EducationalApplication',
  converter: 'UtilitiesApplication',
  crypto: 'FinanceApplication',
  data: 'DeveloperApplication',
  design: 'DesignApplication',
  dev: 'DeveloperApplication',
  diy: 'UtilitiesApplication',
  ecommerce: 'BusinessApplication',
  education: 'EducationalApplication',
  extractor: 'UtilitiesApplication',
  finance: 'FinanceApplication',
  fitness: 'HealthApplication',
  food: 'UtilitiesApplication',
  fun: 'UtilitiesApplication',
  game: 'GameApplication',
  gaming: 'GameApplication',
  gardening: 'UtilitiesApplication',
  generator: 'UtilitiesApplication',
  health: 'HealthApplication',
  language: 'EducationalApplication',
  legal: 'BusinessApplication',
  life: 'UtilitiesApplication',
  lifestyle: 'UtilitiesApplication',
  math: 'EducationalApplication',
  media: 'MultimediaApplication',
  music: 'MultimediaApplication',
  network: 'DeveloperApplication',
  office: 'BusinessApplication',
  parenting: 'UtilitiesApplication',
  pet: 'UtilitiesApplication',
  pets: 'UtilitiesApplication',
  photography: 'MultimediaApplication',
  privacy: 'DeveloperApplication',
  productivity: 'BusinessApplication',
  'real-estate': 'BusinessApplication',
  realestate: 'BusinessApplication',
  security: 'DeveloperApplication',
  seo: 'BusinessApplication',
  shopping: 'BusinessApplication',
  social: 'SocialNetworkingApplication',
  'social-media': 'SocialNetworkingApplication',
  sports: 'HealthApplication',
  'team-tools': 'BusinessApplication',
  text: 'UtilitiesApplication',
  time: 'UtilitiesApplication',
  travel: 'TravelApplication',
  weather: 'WeatherApplication'
};
const LABEL_MAP = {
  ai: 'AI 工具',
  'ai-coding': 'AI 编程工具',
  astronomy: '天文工具',
  automotive: '汽车工具',
  business: '商业工具',
  calculator: '计算工具',
  chinese: '中文工具',
  converter: '转换工具',
  crypto: '加密与数字资产工具',
  data: '数据工具',
  design: '设计工具',
  dev: '开发者工具',
  diy: 'DIY 工具',
  ecommerce: '电商工具',
  education: '教育工具',
  extractor: '提取工具',
  finance: '金融工具',
  fitness: '健身工具',
  food: '饮食工具',
  fun: '娱乐工具',
  game: '游戏工具',
  gaming: '游戏工具',
  gardening: '园艺工具',
  generator: '生成器工具',
  health: '健康工具',
  language: '语言工具',
  legal: '法律工具',
  life: '生活工具',
  lifestyle: '生活方式工具',
  math: '数学工具',
  media: '媒体工具',
  music: '音乐工具',
  network: '网络工具',
  office: '办公工具',
  parenting: '育儿工具',
  pet: '宠物工具',
  pets: '宠物工具',
  photography: '摄影工具',
  privacy: '隐私工具',
  productivity: '效率工具',
  'real-estate': '房产工具',
  realestate: '房产工具',
  security: '安全工具',
  seo: 'SEO 工具',
  shopping: '购物工具',
  social: '社交工具',
  'social-media': '社交媒体工具',
  sports: '运动工具',
  'team-tools': '团队工具',
  text: '文本工具',
  time: '时间工具',
  travel: '旅行工具',
  weather: '天气工具'
};

const args = process.argv.slice(2);
const CHECK_ONLY = args.includes('--check');
const ALL_CATEGORIES = args.includes('--all');
const targetCategories = args.filter((arg) => !arg.startsWith('--'));

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function listAvailableCategories() {
  return fs
    .readdirSync(TOOLS_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((category) => {
      const dir = path.join(TOOLS_ROOT, category);
      return fs.readdirSync(dir).some((file) => file.endsWith('.html'));
    })
    .sort();
}

function getCategoryConfig(category) {
  const dir = path.join(TOOLS_ROOT, category);

  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    throw new Error(`Unsupported category: ${category}`);
  }

  return {
    dir,
    applicationCategory: APPLICATION_CATEGORY_MAP[category] || 'UtilitiesApplication'
  };
}

function getTitle(html) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : '';
}

function getMetaContent(html, key, attribute = 'name') {
  const pattern = new RegExp(
    `<meta\\s+[^>]*${attribute}=["']${escapeRegExp(key)}["'][^>]*content=["']([\\s\\S]*?)["'][^>]*>`,
    'i'
  );
  const match = html.match(pattern);
  return match ? match[1].trim() : '';
}

function getCanonical(html) {
  const match = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  return match ? match[1].trim() : '';
}

function insertBeforeHeadEnd(html, snippet) {
  if (html.includes(snippet)) {
    return html;
  }
  return html.replace(/\s*<\/head>/i, `\n${snippet}\n  </head>`);
}

function hasMeta(html, attribute, key) {
  const pattern = new RegExp(`<meta\\s+[^>]*${attribute}=["']${escapeRegExp(key)}["'][^>]*>`, 'i');
  return pattern.test(html);
}

function ensureMeta(html, attribute, key, content, replaceIfDifferent = false) {
  const tag = `    <meta ${attribute}="${key}" content="${escapeHtml(content)}" />`;
  const pattern = new RegExp(`<meta\\s+[^>]*${attribute}=["']${escapeRegExp(key)}["'][^>]*>`, 'i');

  if (!pattern.test(html)) {
    return insertBeforeHeadEnd(html, tag);
  }

  if (!replaceIfDifferent) {
    return html;
  }

  const existing = getMetaContent(html, key, attribute);
  return existing === content ? html : html.replace(pattern, tag);
}

function ensureCanonical(html, href) {
  const tag = `    <link rel="canonical" href="${href}" />`;
  const pattern = /<link\s+[^>]*rel=["']canonical["'][^>]*>/i;
  const existing = getCanonical(html);

  if (!pattern.test(html)) {
    return insertBeforeHeadEnd(html, tag);
  }

  return existing === href ? html : html.replace(pattern, tag);
}

function buildJsonLd(name, description, url, applicationCategory) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url,
    applicationCategory,
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  };

  const lines = JSON.stringify(data, null, 2)
    .split('\n')
    .map((line) => `      ${line}`);

  return ['    <script type="application/ld+json">', ...lines, '    </script>'].join('\n');
}

function hasJsonLd(html) {
  return /<script[^>]+type=["']application\/ld\+json["']/i.test(html);
}

function normalizedNameFromTitle(title, fallback) {
  const cleaned = title.replace(/\s*[|｜-]\s*(WebUtils|Web工具箱)\s*$/i, '').trim();
  return cleaned || fallback;
}

function getSiteName(html, title) {
  return (
    getMetaContent(html, 'og:site_name', 'property') ||
    getMetaContent(html, 'author') ||
    (/Web工具箱/i.test(title) ? 'Web工具箱' : DEFAULT_SITE_NAME)
  );
}

function getDefaultDescription(title, category) {
  return `${title}，免费在线${LABEL_MAP[category] || '实用工具'}。`;
}

function analyze(html, fileName, category) {
  const slug = fileName.replace(/\.html$/i, '');
  const expectedUrl = `${SITE_URL}/tools/${category}/${slug}`;
  const title = getTitle(html) || slug;
  const description = getMetaContent(html, 'description') || getDefaultDescription(title, category);
  const appName = normalizedNameFromTitle(title, slug);
  const canonical = getCanonical(html);
  const siteName = getSiteName(html, title);

  const hasOgTitle = hasMeta(html, 'property', 'og:title');
  const hasOgDescription = hasMeta(html, 'property', 'og:description');
  const hasOgType = hasMeta(html, 'property', 'og:type');
  const hasOgUrl = hasMeta(html, 'property', 'og:url');
  const hasTwitterCard = hasMeta(html, 'name', 'twitter:card');
  const hasTwitterTitle = hasMeta(html, 'name', 'twitter:title');
  const hasTwitterDescription = hasMeta(html, 'name', 'twitter:description');
  const canonicalBad =
    !canonical ||
    canonical !== expectedUrl ||
    !canonical.startsWith(`${SITE_URL}/`) ||
    /\.html(?:$|[?#])/i.test(canonical) ||
    /[A-Z]/.test(canonical) ||
    /\/\//.test(canonical.replace('https://', ''));

  return {
    expectedUrl,
    title,
    description,
    appName,
    siteName,
    hasJsonLd: hasJsonLd(html),
    hasOg: hasOgTitle && hasOgDescription && hasOgType && hasOgUrl,
    hasTwitter: hasTwitterCard && hasTwitterTitle && hasTwitterDescription,
    hasCanonical: Boolean(canonical),
    canonicalBad
  };
}

function fixHtml(html, fileName, category) {
  const config = getCategoryConfig(category);
  const info = analyze(html, fileName, category);
  let next = html;

  next = ensureCanonical(next, info.expectedUrl);
  next = ensureMeta(next, 'property', 'og:title', info.title);
  next = ensureMeta(next, 'property', 'og:description', info.description);
  next = ensureMeta(next, 'property', 'og:type', 'website');
  next = ensureMeta(next, 'property', 'og:url', info.expectedUrl, true);
  next = ensureMeta(next, 'property', 'og:site_name', info.siteName);
  next = ensureMeta(next, 'property', 'og:locale', 'zh_CN');
  next = ensureMeta(next, 'property', 'og:image', DEFAULT_IMAGE);
  next = ensureMeta(next, 'name', 'twitter:card', 'summary_large_image');
  next = ensureMeta(next, 'name', 'twitter:title', info.title);
  next = ensureMeta(next, 'name', 'twitter:description', info.description);
  next = ensureMeta(next, 'name', 'twitter:image', DEFAULT_IMAGE);

  if (!info.hasJsonLd) {
    next = insertBeforeHeadEnd(
      next,
      buildJsonLd(info.appName, info.description, info.expectedUrl, config.applicationCategory)
    );
  }

  return next;
}

function createEmptyStats(total = 0) {
  return {
    total,
    missingJsonLd: 0,
    missingOg: 0,
    missingTwitter: 0,
    missingCanonical: 0,
    badCanonical: 0
  };
}

function collectCategoryStats(category) {
  const config = getCategoryConfig(category);
  const files = fs.readdirSync(config.dir).filter((file) => file.endsWith('.html')).sort();
  const stats = createEmptyStats(files.length);

  for (const fileName of files) {
    const fullPath = path.join(config.dir, fileName);
    const html = fs.readFileSync(fullPath, 'utf8');
    const info = analyze(html, fileName, category);

    if (!info.hasJsonLd) {
      stats.missingJsonLd += 1;
    }
    if (!info.hasOg) {
      stats.missingOg += 1;
    }
    if (!info.hasTwitter) {
      stats.missingTwitter += 1;
    }
    if (!info.hasCanonical) {
      stats.missingCanonical += 1;
    }
    if (info.canonicalBad) {
      stats.badCanonical += 1;
    }
  }

  return { files, stats };
}

function aggregateTotals(summary) {
  const totals = createEmptyStats();

  for (const stats of Object.values(summary)) {
    totals.total += stats.total;
    totals.missingJsonLd += stats.missingJsonLd;
    totals.missingOg += stats.missingOg;
    totals.missingTwitter += stats.missingTwitter;
    totals.missingCanonical += stats.missingCanonical;
    totals.badCanonical += stats.badCanonical;
  }

  return totals;
}

function resolveCategories() {
  const available = listAvailableCategories();

  if (ALL_CATEGORIES) {
    return available;
  }

  if (targetCategories.length) {
    return targetCategories;
  }

  return ['dev'];
}

function main() {
  const categories = resolveCategories();

  for (const category of categories) {
    getCategoryConfig(category);
  }

  const before = {};
  const fileIndex = {};

  for (const category of categories) {
    const { files, stats } = collectCategoryStats(category);
    before[category] = stats;
    fileIndex[category] = files;
  }

  if (CHECK_ONLY) {
    console.log(JSON.stringify({ categories, summary: before, totals: aggregateTotals(before) }, null, 2));
    return;
  }

  const changedByCategory = {};

  for (const category of categories) {
    const config = getCategoryConfig(category);
    const changedFiles = [];

    for (const fileName of fileIndex[category]) {
      const fullPath = path.join(config.dir, fileName);
      const html = fs.readFileSync(fullPath, 'utf8');
      const next = fixHtml(html, fileName, category);

      if (next !== html) {
        fs.writeFileSync(fullPath, next, 'utf8');
        changedFiles.push(fileName);
      }
    }

    changedByCategory[category] = changedFiles.length;
  }

  const after = {};

  for (const category of categories) {
    after[category] = collectCategoryStats(category).stats;
  }

  console.log(
    JSON.stringify(
      {
        categories,
        changedByCategory,
        before,
        after,
        totalsBefore: aggregateTotals(before),
        totalsAfter: aggregateTotals(after)
      },
      null,
      2
    )
  );
}

main();
