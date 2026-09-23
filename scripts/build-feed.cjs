#!/usr/bin/env node
/**
 * Build feed.xml (RSS 2.0) focusing on latest updated / high-value tools.
 * 
 * Features:
 * - Scans tools/*.html (excluding category index.html and non-tool pages)
 * - Extracts title, description, and real dateModified (from JSON-LD or file mtime)
 * - Sorts by dateModified descending (newest first)
 * - Outputs top 50~60 freshest & most popular tools in W3C RSS 2.0 format
 * - Generates clean URL (without .html)
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "feed.xml");
const SITE = "https://essays4u.net";

function escapeXml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function parseDate(dStr) {
  if (!dStr) return null;
  const d = new Date(dStr);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toRfc822(date) {
  return date.toUTCString();
}

function scanTools(dir, acc = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const ent of entries) {
    if (ent.name.startsWith(".")) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      // 过滤掉 ai 和 ai-coding 目录
      if (ent.name.toLowerCase() === "ai" || ent.name.toLowerCase() === "ai-coding") {
        continue;
      }
      scanTools(full, acc);
      continue;
    }
    if (!ent.name.toLowerCase().endsWith(".html")) continue;
    if (ent.name.toLowerCase() === "index.html") continue; // skip category hubs
    acc.push(full);
  }
  return acc;
}

function extractToolMeta(filePath) {
  const html = fs.readFileSync(filePath, "utf8");

  // Title
  let title = "";
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) {
    title = titleMatch[1].replace(/\s*[-|_|｜].*$/, "").trim();
  } else {
    title = path.basename(filePath, ".html");
  }

  // Description
  let description = "";
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  if (descMatch) {
    description = descMatch[1].trim();
  }

  // Date
  let dateModified = null;
  const jsonLdMatches = html.match(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatches) {
    for (const block of jsonLdMatches) {
      const jsonContent = block.replace(/<script[^>]*>|<\/script>/gi, "").trim();
      try {
        const obj = JSON.parse(jsonContent);
        const target = obj["@type"] === "WebApplication" ? obj : (Array.isArray(obj) ? obj.find(o => o["@type"] === "WebApplication") : null);
        if (target && target.dateModified) {
          dateModified = parseDate(target.dateModified);
          break;
        }
      } catch {}
    }
  }

  if (!dateModified) {
    try {
      dateModified = fs.statSync(filePath).mtime;
    } catch {
      dateModified = new Date();
    }
  }

  const rel = path.relative(ROOT, filePath).replace(/\\/g, "/");
  const cleanUrl = `${SITE}/${rel.replace(/\.html$/i, "")}`;

  // Category
  const parts = rel.split("/");
  const category = parts.length > 2 ? parts[1] : "utilities";

  return {
    title,
    description,
    link: cleanUrl,
    date: dateModified,
    category
  };
}

function build() {
  const toolsDir = path.join(ROOT, "tools");
  const files = scanTools(toolsDir);
  console.log(`Found ${files.length} total tool pages.`);

  const tools = files.map(extractToolMeta);

  // Sort descending by date, then alphabetically
  tools.sort((a, b) => {
    const diff = b.date.getTime() - a.date.getTime();
    if (diff !== 0) return diff;
    return a.title.localeCompare(b.title, "zh-CN");
  });

  // Strict deduplication by normalized tool title
  const seenTitles = new Set();
  const uniqueTools = [];

  for (const t of tools) {
    // 归一化标题（去除空格、转小写）进行判重
    const normTitle = t.title.replace(/\s+/g, "").toLowerCase();
    if (seenTitles.has(normTitle)) {
      continue;
    }
    seenTitles.add(normTitle);
    uniqueTools.push(t);
  }

  // Take top 60 unique tools
  const topTools = uniqueTools.slice(0, 60);

  const now = new Date();
  const feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>WebUtils 在线工具精选与最新发布</title>
    <link>${SITE}/tools-directory</link>
    <description>WebUtils 精选纯前端免安装在线工具：涵盖多媒体图片处理、文本分析排版、现代前端开发、网络排障与实用计算工具，即开即用、零隐私上传。</description>
    <language>zh-CN</language>
    <lastBuildDate>${toRfc822(now)}</lastBuildDate>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
${topTools.map(t => `    <item>
      <title>${escapeXml(t.title)}</title>
      <link>${escapeXml(t.link)}</link>
      <guid isPermaLink="true">${escapeXml(t.link)}</guid>
      <description>${escapeXml(t.description)}</description>
      <category>${escapeXml(t.category)}</category>
      <pubDate>${toRfc822(t.date)}</pubDate>
    </item>`).join("\n")}
  </channel>
</rss>
`;

  fs.writeFileSync(OUT, feedXml.trim() + "\n", "utf8");
  console.log(`Successfully generated feed.xml with top ${topTools.length} tools!`);

  // 生成符合标准 IETF RFC 4287 的纯正 Atom 1.0 XML (命名为 atom-0.xml 破解 GSC 缓存)
  const ATOM_0_OUT = path.join(ROOT, "atom-0.xml");
  const atomXml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>WebUtils 在线工具精选与最新发布</title>
  <subtitle>WebUtils 精选纯前端免安装在线工具：涵盖多媒体图片处理、文本分析排版、现代前端开发、网络排障与实用计算工具，即开即用、零隐私上传。</subtitle>
  <link href="${SITE}/atom-0.xml" rel="self" type="application/atom+xml"/>
  <link href="${SITE}/tools-directory" rel="alternate"/>
  <id>${SITE}/</id>
  <updated>${now.toISOString()}</updated>
${topTools.map(t => `  <entry>
    <title>${escapeXml(t.title)}</title>
    <link href="${escapeXml(t.link)}" rel="alternate"/>
    <id>${escapeXml(t.link)}</id>
    <updated>${t.date.toISOString()}</updated>
    <summary>${escapeXml(t.description)}</summary>
    <category term="${escapeXml(t.category)}"/>
  </entry>`).join("\n")}
</feed>
`;
  fs.writeFileSync(ATOM_0_OUT, atomXml.trim() + "\n", "utf8");
  console.log(`Successfully generated true Atom 1.0: atom-0.xml!`);

  // 同时保留 atom.xml 保持同步
  const ATOM_OUT = path.join(ROOT, "atom.xml");
  fs.writeFileSync(ATOM_OUT, atomXml.trim() + "\n", "utf8");

  // 同时生成符合 Google 标准的 sitemap-tools.xml 专属分卷
  const SITEMAP_TOOLS_OUT = path.join(ROOT, "sitemap-tools.xml");
  const sitemapToolsXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Generated by scripts/build-feed.cjs — Top 60 high-value updated tools -->
${topTools.map(t => `  <url>
    <loc>${escapeXml(t.link)}</loc>
    <lastmod>${t.date.toISOString().split("T")[0]}</lastmod>
  </url>`).join("\n")}
</urlset>
`;
  fs.writeFileSync(SITEMAP_TOOLS_OUT, sitemapToolsXml.trim() + "\n", "utf8");
  console.log(`Successfully generated sitemap-tools.xml for Google Search Console!`);
}

build();
