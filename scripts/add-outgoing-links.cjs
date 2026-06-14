const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TOOLS_JSON = path.join(ROOT, 'tools.json');
const MARKER = '<!-- Internal links: outgoing link audit fix -->';

const toolsData = JSON.parse(fs.readFileSync(TOOLS_JSON, 'utf8'));
const tools = Object.values(toolsData.tools);
const byPath = new Map(tools.map((tool) => [tool.path.replace(/\\/g, '/'), tool]));
const byCategory = new Map();

for (const tool of tools) {
  if (!byCategory.has(tool.category)) byCategory.set(tool.category, []);
  byCategory.get(tool.category).push(tool);
}

function getHtmlFiles(dir) {
  const files = [];
  const pending = [dir];
  const skipDirs = new Set(['.git', 'node_modules', 'design-reference', 'design-templates', 'templates']);

  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!skipDirs.has(entry.name)) pending.push(entryPath);
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        files.push(entryPath);
      }
    }
  }

  return files;
}

function extractHrefValues(html) {
  return [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi)].map((match) =>
    match[1].trim()
  );
}

function isOutgoingHref(href) {
  return Boolean(
    href &&
      !href.startsWith('#') &&
      !/^javascript:/i.test(href) &&
      !/^mailto:/i.test(href) &&
      !/^tel:/i.test(href)
  );
}

function isExcluded(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  return (
    rel === 'ByteDanceVerify.html' ||
    rel === 'offline.html' ||
    rel.startsWith('baidu_verify_') ||
    rel.endsWith('/index.html')
  );
}

function pagePath(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/');
}

function urlForTool(tool) {
  return `/${tool.path.replace(/\.html$/, '')}`;
}

function stripBrand(name) {
  return String(name || '')
    .replace(/\s*[-|]\s*WebUtils\s*$/i, '')
    .replace(/\s*[-|]\s*Web工具箱\s*$/i, '')
    .trim();
}

function buildLinks(filePath) {
  const rel = pagePath(filePath);
  const current = byPath.get(rel);
  const category = current?.category || rel.split('/')[1] || 'tools';
  const related = (byCategory.get(category) || [])
    .filter((tool) => tool.path !== rel)
    .slice(0, 4);

  const links = [
    { href: '/', label: 'WebUtils 首页' },
    { href: '/tools-directory', label: '全部工具目录' },
    { href: `/tools/${category}`, label: `${category} 工具分类` },
    ...related.map((tool) => ({ href: urlForTool(tool), label: stripBrand(tool.name) || tool.path }))
  ];

  return links.slice(0, 7);
}

function buildBlock(filePath) {
  const links = buildLinks(filePath)
    .map((link) => `          <a href="${link.href}">${link.label}</a>`)
    .join('\n');

  return `
${MARKER}
      <nav class="related-links-section" aria-label="相关站内链接">
        <h2>相关工具与导航</h2>
        <div class="related-links-list">
${links}
        </div>
      </nav>
      <style>
        .related-links-section {
          margin: 40px 0 0;
          padding-top: 24px;
          border-top: 1px solid var(--border-subtle, #e5e7eb);
        }
        .related-links-section h2 {
          margin: 0 0 12px;
          font-size: 1.15rem;
          color: var(--text-primary, inherit);
        }
        .related-links-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .related-links-list a {
          display: inline-flex;
          align-items: center;
          min-height: 36px;
          padding: 8px 12px;
          border: 1px solid var(--border-subtle, #e5e7eb);
          border-radius: var(--radius-md, 8px);
          color: var(--accent-cyan, var(--accent-blue, var(--accent-green, #2563eb)));
          background: var(--bg-card, rgba(255, 255, 255, 0.04));
          text-decoration: none;
          font-size: 0.92rem;
        }
        .related-links-list a:hover {
          border-color: var(--border-strong, currentColor);
          text-decoration: underline;
        }
      </style>`;
}

function insertBlock(html, block) {
  if (html.includes(MARKER)) return html;
  const scriptIndex = html.lastIndexOf('<script');
  const closingDivIndex = html.lastIndexOf('</div>');
  if (scriptIndex !== -1 && closingDivIndex !== -1 && closingDivIndex > scriptIndex) {
    return `${html.slice(0, closingDivIndex)}${block}\n${html.slice(closingDivIndex)}`;
  }
  const bodyIndex = html.lastIndexOf('</body>');
  if (bodyIndex !== -1) return `${html.slice(0, bodyIndex)}${block}\n${html.slice(bodyIndex)}`;
  return html;
}

let updated = 0;

for (const filePath of getHtmlFiles(ROOT)) {
  if (isExcluded(filePath)) continue;
  const html = fs.readFileSync(filePath, 'utf8');
  if (extractHrefValues(html).some(isOutgoingHref)) continue;
  const next = insertBlock(html, buildBlock(filePath));
  if (next !== html) {
    fs.writeFileSync(filePath, next);
    updated++;
    console.log(pagePath(filePath));
  }
}

console.log(`Updated ${updated} pages with outgoing links.`);
