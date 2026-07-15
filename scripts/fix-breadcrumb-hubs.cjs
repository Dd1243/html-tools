/**
 * Convert breadcrumb / category middle links from /#cat or tools-directory
 * to category hub pages: /tools/<category>/
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const toolsJson = JSON.parse(fs.readFileSync(path.join(root, 'tools.json'), 'utf8'));
const categories = toolsJson.categories || {};
const catIds = Object.keys(categories);
const catIdSet = new Set(catIds);

// name -> id (longest names first to avoid partial issues)
const nameToId = new Map();
for (const [id, meta] of Object.entries(categories)) {
  if (meta && meta.name) nameToId.set(meta.name, id);
}
// common aliases seen in breadcrumbs
const aliasToId = new Map([
  ['SEO工具', 'seo'],
  ['SEO 工具', 'seo'],
  ['AI工具', 'ai'],
  ['AI 工具', 'ai'],
  ['AI 编程', 'ai-coding'],
  ['AI编程', 'ai-coding'],
  ['开发工具', 'dev'],
  ['文本工具', 'text'],
  ['时间工具', 'time'],
  ['生成器', 'generator'],
  ['媒体工具', 'media'],
  ['隐私安全', 'privacy'],
  ['安全工具', 'security'],
  ['网络工具', 'network'],
  ['计算器', 'calculator'],
  ['转换器', 'converter'],
  ['提取器', 'extractor'],
  ['趣味工具', 'fun'],
  ['小游戏', 'game'],
  ['生活工具', 'life'],
  ['财务工具', 'finance'],
  ['健康工具', 'health'],
  ['健康医疗', 'health'],
  ['教育学习', 'education'],
  ['餐饮食品', 'food'],
  ['设计工具', 'design'],
  ['商业工具', 'business'],
  ['加密货币', 'crypto'],
  ['法律工具', 'legal'],
  ['办公工具', 'office'],
  ['数据工具', 'data'],
  ['团队工具', 'team-tools'],
  ['社交媒体', 'social-media'],
  ['房地产', 'realestate'],
  ['中文工具', 'chinese'],
  ['生产力', 'productivity'],
  ['数学工具', 'math'],
  ['旅行工具', 'travel'],
  ['音乐工具', 'music'],
  ['体育工具', 'sports'],
  ['宠物工具', 'pets'],
  ['摄影工具', 'photography'],
  ['购物工具', 'shopping'],
  ['语言学习', 'language'],
  ['艺术工具', 'art'],
  ['育儿工具', 'parenting'],
  ['社交工具', 'social'],
  ['DIY工具', 'diy'],
  ['天文工具', 'astronomy'],
  ['汽车工具', 'automotive'],
  ['天气工具', 'weather'],
  ['园艺工具', 'gardening'],
  ['健身运动', 'fitness'],
  ['生活方式', 'lifestyle'],
]);

for (const [name, id] of nameToId) {
  if (!aliasToId.has(name)) aliasToId.set(name, id);
}

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === '.git') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.isFile() && ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function escapeReg(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function processFile(fp) {
  let html = fs.readFileSync(fp, 'utf8');
  const before = html;
  let hashReplaced = 0;
  let dirReplaced = 0;

  // 1) href="/#cat" and href='/#cat' for known categories
  for (const id of catIds) {
    const re = new RegExp(`href=(["'])/#${escapeReg(id)}\\1`, 'g');
    html = html.replace(re, (m, q) => {
      hashReplaced++;
      return `href=${q}/tools/${id}/${q}`;
    });
  }

  // 2) itemprop item links same pattern already covered by 1

  // 3) Inside breadcrumb only: tools-directory links that look like category middle crumb
  // Match: <a ... href="/tools-directory"...>CategoryName</a>
  // when CategoryName maps to a hub
  html = html.replace(
    /(<nav[^>]*class=["'][^"']*breadcrumb[^"']*["'][^>]*>)([\s\S]*?)(<\/nav>)/gi,
    (full, open, inner, close) => {
      let next = inner;
      // replace tools-directory category anchors
      next = next.replace(
        /<a([^>]*?)href=(["'])\/tools-directory\2([^>]*)>([\s\S]*?)<\/a>/gi,
        (m, pre, q, post, labelHtml) => {
          const text = labelHtml.replace(/<[^>]+>/g, '').trim();
          const id = aliasToId.get(text);
          if (id && catIdSet.has(id)) {
            dirReplaced++;
            return `<a${pre}href=${q}/tools/${id}/${q}${post}>${labelHtml}</a>`;
          }
          return m;
        }
      );
      // also bare /tools-directory without quotes variants already handled
      return open + next + close;
    }
  );

  // 4) JSON-LD BreadcrumbList item URLs with /#cat
  for (const id of catIds) {
    const re = new RegExp(`"@id"\\s*:\\s*"https:\\/\\/essays4u\\.net\\/#${escapeReg(id)}"`, 'g');
    html = html.replace(re, `"@id": "https://essays4u.net/tools/${id}/"`);
    const re2 = new RegExp(`"item"\\s*:\\s*"https:\\/\\/essays4u\\.net\\/#${escapeReg(id)}"`, 'g');
    html = html.replace(re2, `"item": "https://essays4u.net/tools/${id}/"`);
  }

  if (html !== before) {
    fs.writeFileSync(fp, html, 'utf8');
    return { changed: true, hashReplaced, dirReplaced };
  }
  return { changed: false, hashReplaced: 0, dirReplaced: 0 };
}

const files = walk(path.join(root, 'tools'));
// also root pages that might breadcrumb? skip for now unless user asked tools only

let changedFiles = 0;
let totalHash = 0;
let totalDir = 0;
const samples = [];

for (const fp of files) {
  const r = processFile(fp);
  if (r.changed) {
    changedFiles++;
    totalHash += r.hashReplaced;
    totalDir += r.dirReplaced;
    if (samples.length < 12) {
      samples.push(path.relative(root, fp).replace(/\\/g, '/'));
    }
  }
}

// Verify residual /# known cats in tools/
let residual = 0;
const residualExamples = [];
for (const fp of files) {
  const html = fs.readFileSync(fp, 'utf8');
  for (const id of catIds) {
    if (html.includes(`href="/#${id}"`) || html.includes(`href='/#${id}'`)) {
      residual++;
      if (residualExamples.length < 10) residualExamples.push(`${path.relative(root, fp)} #${id}`);
    }
  }
}

// Count remaining any /# in tools
let anyHash = 0;
for (const fp of files) {
  const m = fs.readFileSync(fp, 'utf8').match(/href=["']\/#[a-z0-9-]+["']/gi);
  if (m) anyHash += m.length;
}

console.log(
  JSON.stringify(
    {
      scanned: files.length,
      changedFiles,
      hashReplaced: totalHash,
      breadcrumbDirReplaced: totalDir,
      residualKnownHashLinks: residual,
      residualExamples,
      remainingAnyHashLinks: anyHash,
      samples,
    },
    null,
    2
  )
);
