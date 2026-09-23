#!/usr/bin/env node
/**
 * scripts/audit-seo-health.cjs
 * 全站 SEO 核心指标健康度扫描
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', '.git', '.github', 'dist', 'coverage', 'docs', 'tmp', 'temp']);

function getHtmlFiles(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      getHtmlFiles(fullPath, acc);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      // 忽略部分系统校验页
      if (/ByteDanceVerify|baidu_verify|google[a-z0-9]+\.html/i.test(entry.name)) continue;
      acc.push(fullPath);
    }
  }
  return acc;
}

const allFiles = getHtmlFiles(ROOT);

const stats = {
  total: allFiles.length,
  missingTitle: [],
  shortTitle: [],
  duplicateTitle: new Map(), // title -> [paths]
  missingDescription: [],
  shortDescription: [],
  longDescription: [],
  duplicateDescription: new Map(), // desc -> [paths]
  missingCanonical: [],
  canonicalWithHtmlExt: [],
  missingH1: [],
  multipleH1: [],
  missingJsonLd: [],
  missingBreadcrumbJsonLd: [],
  missingOgTags: [],
};

for (const file of allFiles) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf8');

  // 1. Title
  const titleMatch = content.match(/<title\b[^>]*>(.*?)<\/title>/is);
  if (!titleMatch || !titleMatch[1].trim()) {
    stats.missingTitle.push(rel);
  } else {
    const title = titleMatch[1].trim();
    if (title.length < 10) stats.shortTitle.push({ rel, title, len: title.length });
    if (!stats.duplicateTitle.has(title)) stats.duplicateTitle.set(title, []);
    stats.duplicateTitle.get(title).push(rel);
  }

  // 2. Meta Description
  const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/is)
    || content.match(/<meta\s+content=["'](.*?)["']\s+name=["']description["']/is);
  if (!descMatch || !descMatch[1].trim()) {
    stats.missingDescription.push(rel);
  } else {
    const desc = descMatch[1].trim();
    if (desc.length < 60) stats.shortDescription.push({ rel, len: desc.length });
    if (desc.length > 200) stats.longDescription.push({ rel, len: desc.length });
    if (!stats.duplicateDescription.has(desc)) stats.duplicateDescription.set(desc, []);
    stats.duplicateDescription.get(desc).push(rel);
  }

  // 3. Canonical
  const canonMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["'](.*?)["']/is)
    || content.match(/<link\s+href=["'](.*?)["']\s+rel=["']canonical["']/is);
  if (!canonMatch) {
    stats.missingCanonical.push(rel);
  } else {
    const href = canonMatch[1].trim();
    if (href.endsWith('.html')) {
      stats.canonicalWithHtmlExt.push({ rel, href });
    }
  }

  // 4. H1
  const h1Matches = content.match(/<h1\b[^>]*>/gi);
  if (!h1Matches || h1Matches.length === 0) {
    stats.missingH1.push(rel);
  } else if (h1Matches.length > 1) {
    stats.multipleH1.push({ rel, count: h1Matches.length });
  }

  // 5. JSON-LD 结构化数据
  const jsonLdBlocks = content.match(/<script\s+type=["']application\/ld\+json["']>[\s\S]*?<\/script>/gi);
  if (!jsonLdBlocks) {
    stats.missingJsonLd.push(rel);
  } else {
    const hasBreadcrumb = jsonLdBlocks.some(b => b.includes('BreadcrumbList'));
    if (!hasBreadcrumb && rel.startsWith('tools/')) {
      stats.missingBreadcrumbJsonLd.push(rel);
    }
  }

  // 6. Open Graph
  const hasOgTitle = /<meta\s+property=["']og:title["']/i.test(content);
  if (!hasOgTitle) {
    stats.missingOgTags.push(rel);
  }
}

// 汇总重复
const trueDuplicateTitles = [];
for (const [title, paths] of stats.duplicateTitle.entries()) {
  if (paths.length > 1) trueDuplicateTitles.push({ title, count: paths.length, paths: paths.slice(0, 3) });
}

const trueDuplicateDescs = [];
for (const [desc, paths] of stats.duplicateDescription.entries()) {
  if (paths.length > 1) trueDuplicateDescs.push({ desc: desc.substring(0, 30) + '...', count: paths.length, paths: paths.slice(0, 3) });
}

console.log(JSON.stringify({
  totalScanned: stats.total,
  missingTitleCount: stats.missingTitle.length,
  missingTitleList: stats.missingTitle.slice(0, 10),
  shortTitleCount: stats.shortTitle.length,
  duplicateTitleCount: trueDuplicateTitles.length,
  topDuplicateTitles: trueDuplicateTitles.slice(0, 5),

  missingDescCount: stats.missingDescription.length,
  missingDescList: stats.missingDescription.slice(0, 10),
  shortDescCount: stats.shortDescription.length,
  longDescCount: stats.longDescription.length,
  duplicateDescCount: trueDuplicateDescs.length,
  topDuplicateDescs: trueDuplicateDescs.slice(0, 5),

  missingCanonicalCount: stats.missingCanonical.length,
  missingCanonicalList: stats.missingCanonical.slice(0, 10),
  canonicalWithHtmlExtCount: stats.canonicalWithHtmlExt.length,
  canonicalWithHtmlExtList: stats.canonicalWithHtmlExt.slice(0, 5),

  missingH1Count: stats.missingH1.length,
  missingH1List: stats.missingH1.slice(0, 10),
  multipleH1Count: stats.multipleH1.length,
  multipleH1List: stats.multipleH1.slice(0, 5),

  missingJsonLdCount: stats.missingJsonLd.length,
  missingJsonLdList: stats.missingJsonLd.slice(0, 10),
  missingBreadcrumbCount: stats.missingBreadcrumbJsonLd.length,
  missingBreadcrumbList: stats.missingBreadcrumbJsonLd.slice(0, 5),

  missingOgCount: stats.missingOgTags.length,
  missingOgList: stats.missingOgTags.slice(0, 10)
}, null, 2));
