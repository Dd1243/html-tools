/**
 * Conservatively add WebApplication JSON-LD to interactive tool pages.
 *
 * Rules (conservative):
 * - Only tools listed in tools.json
 * - Skip category hubs (index.html)
 * - Skip wiki / obvious article paths
 * - Skip if WebApplication or SoftwareApplication already exists
 * - INSERT a new standalone <script> only (never replace existing ld+json)
 * - Require interactive DOM signals (input/textarea/button/canvas/select)
 * - Hard safety: abort on shrink / body loss / h1 loss / graph loss
 * - Minimal fields only
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const SITE = 'https://essays4u.net';
const toolsJson = JSON.parse(fs.readFileSync(path.join(root, 'tools.json'), 'utf8'));
const categories = toolsJson.categories || {};
const tools = toolsJson.tools || {};

const ARTICLE_PATH_RE =
  /\/wiki\/|(^|\/)(guide|outlook|resources|ecosystem|pricing|models|shortcuts|templates|clients)(\.html)?$/i;

const CAT_APP_CATEGORY = {
  dev: 'DeveloperApplication',
  network: 'DeveloperApplication',
  security: 'SecurityApplication',
  privacy: 'SecurityApplication',
  seo: 'BusinessApplication',
  business: 'BusinessApplication',
  finance: 'FinanceApplication',
  office: 'BusinessApplication',
  calculator: 'UtilitiesApplication',
  converter: 'UtilitiesApplication',
  extractor: 'UtilitiesApplication',
  generator: 'UtilitiesApplication',
  text: 'UtilitiesApplication',
  data: 'UtilitiesApplication',
  media: 'MultimediaApplication',
  design: 'DesignApplication',
  art: 'DesignApplication',
  education: 'EducationalApplication',
  health: 'HealthApplication',
  fitness: 'HealthApplication',
  game: 'GameApplication',
  fun: 'EntertainmentApplication',
  life: 'LifestyleApplication',
  food: 'LifestyleApplication',
  travel: 'TravelApplication',
  shopping: 'ShoppingApplication',
  social: 'SocialNetworkingApplication',
  'social-media': 'SocialNetworkingApplication',
  ai: 'DeveloperApplication',
  'ai-coding': 'DeveloperApplication',
  time: 'UtilitiesApplication',
  math: 'UtilitiesApplication',
  chinese: 'UtilitiesApplication',
  legal: 'BusinessApplication',
  crypto: 'FinanceApplication',
  realestate: 'BusinessApplication',
  pets: 'LifestyleApplication',
  music: 'MultimediaApplication',
  photography: 'MultimediaApplication',
  sports: 'SportsApplication',
  weather: 'UtilitiesApplication',
  automotive: 'UtilitiesApplication',
  astronomy: 'EducationalApplication',
  gardening: 'LifestyleApplication',
  parenting: 'LifestyleApplication',
  language: 'EducationalApplication',
  diy: 'UtilitiesApplication',
  lifestyle: 'LifestyleApplication',
  productivity: 'BusinessApplication',
  'team-tools': 'BusinessApplication',
};

function pageUrlFromRel(relPosix) {
  // tools/seo/foo.html -> https://essays4u.net/tools/seo/foo
  const noExt = relPosix.replace(/\.html$/i, '');
  return `${SITE}/${noExt}`.replace(/\/index$/i, '/');
}

function extractMetaDescription(html) {
  const m =
    html.match(
      /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i
    ) ||
    html.match(
      /<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i
    );
  if (!m) return '';
  return m[1].replace(/\s+/g, ' ').trim();
}

function extractName(html, fallback) {
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) {
    let t = h1[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
    t = t.replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\s]+/u, '').trim() || t;
    if (t) return t.slice(0, 80);
  }
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) {
    let t = title[1]
      .replace(/<[^>]+>/g, '')
      .split(/[-|–—]/)[0]
      .replace(/\s+/g, ' ')
      .trim();
    if (t) return t.slice(0, 80);
  }
  return fallback;
}

function hasAppType(html) {
  return /"@type"\s*:\s*"(WebApplication|SoftwareApplication)"/i.test(html);
}

function hasInteractiveSignals(html) {
  // Conservative: need real controls, not just nav buttons
  const body = html.match(/<body[\s\S]*<\/body>/i);
  const b = body ? body[0] : html;
  const signals = [
    /<textarea\b/i.test(b),
    /<input\b/i.test(b),
    /<select\b/i.test(b),
    /<canvas\b/i.test(b),
    /contenteditable\s*=\s*["']?true/i.test(b),
    /type=["']file["']/i.test(b),
  ];
  const signalCount = signals.filter(Boolean).length;
  // also require at least one button-like control in body
  const hasAction =
    /<button\b/i.test(b) ||
    /type=["']submit["']/i.test(b) ||
    /onclick\s*=/i.test(b) ||
    /addEventListener\s*\(\s*['"]click['"]/i.test(b);
  return signalCount >= 1 && hasAction;
}

function isArticleLike(relPosix, html, toolMeta) {
  if (ARTICLE_PATH_RE.test(relPosix)) return true;
  if (/\/wiki\//i.test(relPosix)) return true;
  // if page is primarily TechArticle and weak interactivity, treat as article
  if (/"@type"\s*:\s*"TechArticle"/i.test(html) && !hasInteractiveSignals(html)) {
    return true;
  }
  // name/description from tools.json looking like guide
  const blob = `${toolMeta.name || ''} ${toolMeta.description || ''} ${toolMeta.keywords || ''}`;
  if (/(指南|盘点|对比|展望|资源导航|百科|教程)/.test(blob) && !hasInteractiveSignals(html)) {
    return true;
  }
  return false;
}

function buildScript({ name, url, description, applicationCategory }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    url,
    description,
    applicationCategory,
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    inLanguage: 'zh-CN',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY',
    },
  };
  return (
    '<script type="application/ld+json">\n' +
    JSON.stringify(data, null, 2) +
    '\n    </script>'
  );
}

function safeInsert(html, script) {
  if (!/<\/head>/i.test(html)) return null;
  // insert before </head> only
  return html.replace(/<\/head>/i, `    ${script}\n  </head>`);
}

function passSafety(before, after) {
  if (after.length < before.length * 0.95) return 'shrink';
  if (!/<body[\s\S]*<\/body>/i.test(after)) return 'no-body';
  const h1b = (before.match(/<h1\b/gi) || []).length;
  const h1a = (after.match(/<h1\b/gi) || []).length;
  if (h1b > 0 && h1a === 0) return 'h1-loss';
  const gb = (before.match(/"@graph"/g) || []).length;
  const ga = (after.match(/"@graph"/g) || []).length;
  if (ga < gb) return 'graph-loss';
  // must not remove existing scripts
  const sb = (before.match(/<script\b/gi) || []).length;
  const sa = (after.match(/<script\b/gi) || []).length;
  if (sa < sb) return 'script-loss';
  // body content should remain (rough)
  const bodyBefore = (before.match(/<body[\s\S]*<\/body>/i) || [''])[0].length;
  const bodyAfter = (after.match(/<body[\s\S]*<\/body>/i) || [''])[0].length;
  if (bodyBefore > 0 && bodyAfter < bodyBefore * 0.98) return 'body-shrink';
  return null;
}

const stats = {
  considered: 0,
  added: 0,
  skippedHasApp: 0,
  skippedHub: 0,
  skippedArticle: 0,
  skippedNoInteractive: 0,
  skippedMissingFile: 0,
  aborted: [],
  samples: [],
};

for (const tool of Object.values(tools)) {
  const rel = String(tool.path || '').replace(/\\/g, '/');
  if (!rel || !rel.startsWith('tools/')) continue;
  stats.considered++;

  if (/\/index\.html$/i.test(rel) || rel.endsWith('/index.html')) {
    stats.skippedHub++;
    continue;
  }

  const fp = path.join(root, rel);
  if (!fs.existsSync(fp)) {
    stats.skippedMissingFile++;
    continue;
  }

  const before = fs.readFileSync(fp, 'utf8');

  if (hasAppType(before)) {
    stats.skippedHasApp++;
    continue;
  }

  if (isArticleLike(rel, before, tool)) {
    stats.skippedArticle++;
    continue;
  }

  if (!hasInteractiveSignals(before)) {
    stats.skippedNoInteractive++;
    continue;
  }

  const cat = tool.category || rel.split('/')[1];
  const applicationCategory = CAT_APP_CATEGORY[cat] || 'UtilitiesApplication';
  const name = extractName(before, tool.name || path.basename(rel, '.html'));
  const url = pageUrlFromRel(rel);
  let description = extractMetaDescription(before) || tool.description || name;
  // clean repeated filler if any
  description = description
    .replace(/(免费在线使用，结果仅供参考。\s*)+/g, '免费在线使用，结果仅供参考。')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);

  const script = buildScript({ name, url, description, applicationCategory });
  const after = safeInsert(before, script);
  if (!after) {
    stats.aborted.push({ rel, reason: 'no-head' });
    continue;
  }

  const fail = passSafety(before, after);
  if (fail) {
    stats.aborted.push({ rel, reason: fail, before: before.length, after: after.length });
    continue;
  }

  // ensure exactly one more WebApplication than before (0 -> 1)
  if (!hasAppType(after)) {
    stats.aborted.push({ rel, reason: 'not-inserted' });
    continue;
  }

  fs.writeFileSync(fp, after, 'utf8');
  stats.added++;
  if (stats.samples.length < 20) {
    stats.samples.push(`${rel} [${applicationCategory}] ${name}`);
  }
}

// audit
let withApp = 0;
let withoutAppInteractive = 0;
const files = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) files.push(p);
  }
}
walk(path.join(root, 'tools'));
for (const f of files) {
  const h = fs.readFileSync(f, 'utf8');
  if (hasAppType(h)) withApp++;
}

// integrity samples
const integrity = {};
for (const rel of [
  'tools/generator/business-card.html',
  'tools/seo/robots-generator.html',
  'tools/ai/ai-coding-tools-2025.html',
  'tools/ai/index.html',
  'tools/business/breakeven.html',
]) {
  const fp = path.join(root, rel);
  if (!fs.existsSync(fp)) continue;
  const h = fs.readFileSync(fp, 'utf8');
  integrity[rel] = {
    len: h.length,
    hasWebApp: /"@type"\s*:\s*"WebApplication"/i.test(h),
    hasGraph: /"@graph"/i.test(h),
    hasTechArticle: /"@type"\s*:\s*"TechArticle"/i.test(h),
    h1: (h.match(/<h1\b/gi) || []).length,
  };
}

console.log(
  JSON.stringify(
    {
      ...stats,
      audit: { withApp, totalHtml: files.length },
      integrity,
    },
    null,
    2
  )
);

if (stats.aborted.length) process.exitCode = 1;
