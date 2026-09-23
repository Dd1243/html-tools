#!/usr/bin/env node
/**
 * scripts/complete-tool-schemas.cjs
 * 自动为缺失 WebApplication 结构化数据的工具页面补齐 Schema，并注入发布与修改日期。
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DEFAULT_LAUNCH_DATE = '2026-04-02';

// 1. 获取 Git 日期索引
function getGitFileDates() {
  const result = spawnSync('git', ['log', '--format=COMMIT:%cs', '--name-only'], {
    cwd: ROOT,
    maxBuffer: 100 * 1024 * 1024,
    encoding: 'utf8'
  });

  const lines = result.stdout.split(/\r?\n/);
  const fileDates = new Map();
  let currentDate = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('COMMIT:')) {
      currentDate = trimmed.substring(7);
      continue;
    }
    if (!currentDate) continue;
    const normalizedPath = trimmed.replace(/\\/g, '/');
    if (!normalizedPath.endsWith('.html')) continue;

    if (!fileDates.has(normalizedPath)) {
      fileDates.set(normalizedPath, { latest: currentDate, first: currentDate });
    } else {
      fileDates.get(normalizedPath).first = currentDate;
    }
  }
  return fileDates;
}

// 2. 遍历 tools
function getHtmlFiles(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git'].includes(entry.name)) continue;
      getHtmlFiles(fullPath, acc);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      acc.push(fullPath);
    }
  }
  return acc;
}

const gitDates = getGitFileDates();
const toolFiles = getHtmlFiles(path.join(ROOT, 'tools'));

let injectedCount = 0;

for (const filePath of toolFiles) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  if (rel.endsWith('/index.html')) continue; // 跳过分类列表导航页

  let content = fs.readFileSync(filePath, 'utf8');

  // 如果已经有了 datePublished/dateModified，说明已经在上一轮注入了
  if (content.includes('dateModified') && content.includes('datePublished')) {
    continue;
  }

  // 提取页面的基本元信息
  const titleMatch = content.match(/<title\b[^>]*>(.*?)<\/title>/is);
  const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/is)
    || content.match(/<meta\s+content=["'](.*?)["']\s+name=["']description["']/is);
  const canonMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["'](.*?)["']/is)
    || content.match(/<link\s+href=["'](.*?)["']\s+rel=["']canonical["']/is);
  const h1Match = content.match(/<h1\b[^>]*>(.*?)<\/h1>/is);

  const cleanTitle = (h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : '') 
    || (titleMatch ? titleMatch[1].split(/[-_|]/)[0].trim() : '在线工具');
  const description = descMatch ? descMatch[1].trim() : '';
  const canonical = canonMatch ? canonMatch[1].trim() : `https://essays4u.net/${rel.replace(/\.html$/, '')}`;

  // 计算日期
  const gitInfo = gitDates.get(rel);
  let datePublished = gitInfo ? gitInfo.first : DEFAULT_LAUNCH_DATE;
  if (datePublished < DEFAULT_LAUNCH_DATE) {
    datePublished = DEFAULT_LAUNCH_DATE;
  }
  const dateModified = gitInfo ? gitInfo.latest : new Date().toISOString().split('T')[0];

  // 构造 WebApplication JSON-LD 结构体
  const schemaObj = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": cleanTitle,
    "url": canonical,
    "description": description,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "browserRequirements": "Requires modern web browser with JavaScript enabled.",
    "inLanguage": "zh-CN",
    "isAccessibleForFree": true,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "CNY"
    },
    "datePublished": datePublished,
    "dateModified": dateModified
  };

  const schemaTag = `\n    <script type="application/ld+json">\n${JSON.stringify(schemaObj, null, 2)}\n    </script>\n`;

  // 注入到 </head> 之前
  if (content.includes('</head>')) {
    content = content.replace('</head>', `${schemaTag}  </head>`);
    fs.writeFileSync(filePath, content, 'utf8');
    injectedCount++;
  }
}

console.log(`\n========================================`);
console.log(` 补全完成!`);
console.log(` - 成功为 ${injectedCount} 个页面注入了完整 WebApplication Schema 与日期`);
console.log(`========================================\n`);
