/**
 * Pass 2: tools-directory?category=*, breadcrumb category aliases,
 * ai-coding wiki crumbs, and path-based fallbacks.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const toolsJson = JSON.parse(fs.readFileSync(path.join(root, 'tools.json'), 'utf8'));
const catIds = new Set(Object.keys(toolsJson.categories || {}));

const textToCat = new Map([
  ['金融工具', 'finance'],
  ['财务工具', 'finance'],
  ['财务理财', 'finance'],
  ['趣味工具', 'fun'],
  ['小游戏', 'game'],
  ['AI Coding', 'ai-coding'],
  ['AI 编程', 'ai-coding'],
  ['AI编程', 'ai-coding'],
  ['WebUtils', null], // special: often home or directory
]);

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === '.git') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.isFile() && ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function catFromPath(fp) {
  const rel = path.relative(path.join(root, 'tools'), fp).replace(/\\/g, '/');
  const seg = rel.split('/')[0];
  return catIds.has(seg) ? seg : null;
}

let changedFiles = 0;
let queryReplaced = 0;
let crumbReplaced = 0;
let wikiReplaced = 0;

for (const fp of walk(path.join(root, 'tools'))) {
  let html = fs.readFileSync(fp, 'utf8');
  const before = html;
  const cat = catFromPath(fp);

  // tools-directory?category=id → /tools/id/
  html = html.replace(
    /href=(["'])\/tools-directory\?category=([a-z0-9-]+)\1/gi,
    (m, q, id) => {
      if (!catIds.has(id)) return m;
      queryReplaced++;
      return `href=${q}/tools/${id}/${q}`;
    }
  );

  // breadcrumb blocks only
  html = html.replace(
    /(<nav[^>]*class=["'][^"']*breadcrumb[^"']*["'][^>]*>)([\s\S]*?)(<\/nav>)/gi,
    (full, open, inner, close) => {
      let next = inner;

      // label-based tools-directory → hub
      next = next.replace(
        /<a([^>]*?)href=(["'])\/tools-directory(?:\?[^"']*)?\2([^>]*)>([\s\S]*?)<\/a>/gi,
        (m, pre, q, post, labelHtml) => {
          const text = labelHtml.replace(/<[^>]+>/g, '').trim();
          // Keep "全部工具" as tools-directory (hub page parent)
          if (text === '全部工具' || text === '工具目录' || text === '所有工具') return m;

          if (textToCat.has(text)) {
            const id = textToCat.get(text);
            if (id && catIds.has(id)) {
              crumbReplaced++;
              return `<a${pre}href=${q}/tools/${id}/${q}${post}>${labelHtml}</a>`;
            }
          }

          // AI Coding wiki: WebUtils → home, AI Coding → hub
          if (text === 'WebUtils' || text === 'Web Utils') {
            wikiReplaced++;
            return `<a${pre}href=${q}/${q}${post}>${labelHtml}</a>`;
          }

          // If link text looks like current category name and we know path cat
          if (cat && text && text !== '首页') {
            // only rewrite if it's clearly a middle crumb (not current page span)
            // path-based: when tools-directory is used as category middle on tool pages
            const isIndex = /index\.html$/i.test(fp);
            if (!isIndex) {
              // if tools-directory alone on tool page middle crumb with non-directory label
              // already handled by alias map; for remaining "AI Coding" etc done above
            }
          }
          return m;
        }
      );

      // bare category path fix for wiki style: second tools-directory with AI Coding
      if (fp.includes(`${path.sep}ai-coding${path.sep}`)) {
        next = next.replace(
          /href=(["'])\/tools-directory\1(?=[^>]*>\s*AI\s*Coding)/gi,
          (m, q) => {
            wikiReplaced++;
            return `href=${q}/tools/ai-coding/${q}`;
          }
        );
      }

      return open + next + close;
    }
  );

  if (html !== before) {
    fs.writeFileSync(fp, html, 'utf8');
    changedFiles++;
  }
}

// residual checks
let residualQuery = 0;
let residualHashCat = 0;
const toolsRoot = path.join(root, 'tools');
function walk2(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk2(p, out);
    else if (ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}
for (const fp of walk2(toolsRoot)) {
  const h = fs.readFileSync(fp, 'utf8');
  if (/tools-directory\?category=/i.test(h)) residualQuery++;
  for (const id of catIds) {
    if (h.includes(`href="/#${id}"`) || h.includes(`href='/#${id}'`)) residualHashCat++;
  }
}

console.log(
  JSON.stringify(
    {
      changedFiles,
      queryReplaced,
      crumbReplaced,
      wikiReplaced,
      residualQueryFiles: residualQuery,
      residualHashCat,
    },
    null,
    2
  )
);
