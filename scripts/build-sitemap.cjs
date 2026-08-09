#!/usr/bin/env node
/**
 * Build sitemap.xml from real site pages.
 *
 * lastmod rules (highest priority first):
 * 1) guides: guides.json dateModified / datePublished
 * 2) matching guides/src/{slug}.md mtime
 * 3) HTML file mtime
 *
 * Also ensures every built guide page is listed, so new articles
 * appear automatically after `npm run build:guides`.
 *
 * CommonJS (.cjs) because package.json has "type": "module".
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "sitemap.xml");
const SITE = "https://essays4u.net";
const GUIDES_JSON = path.join(ROOT, "guides", "guides.json");

const SKIP_DIR_NAMES = new Set([
  "node_modules",
  ".git",
  ".github",
  ".agents",
  ".codex",
  "scripts",
  "tests",
  "docs",
  "components",
  "layout",
  "src",
  "__pycache__",
  "coverage",
  "dist",
  "tmp",
  "temp",
]);

const SKIP_FILE_SUBSTR = [
  "baidu_verify",
  "ByteDanceVerify",
  "google",
  "sitemap-generator",
];

function pad(n) {
  return String(n).padStart(2, "0");
}

/** Format Date as YYYY-MM-DD (UTC date parts — stable across machines). */
function toDay(d) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return null;
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function parseDay(s) {
  if (!s) return null;
  const m = String(s).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function fileMtime(p) {
  try {
    return fs.statSync(p).mtime;
  } catch {
    return null;
  }
}

function shouldSkipFile(absPath) {
  const base = path.basename(absPath);
  const lower = base.toLowerCase();
  if (!lower.endsWith(".html")) return true;
  for (const s of SKIP_FILE_SUBSTR) {
    if (lower.includes(s.toLowerCase())) return true;
  }
  // skip nested guide layout/src if any leak
  const norm = absPath.replace(/\\/g, "/");
  if (norm.includes("/guides/layout/")) return true;
  if (norm.includes("/guides/src/")) return true;
  return false;
}

function walkHtml(dir, acc = []) {
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
      if (SKIP_DIR_NAMES.has(ent.name)) continue;
      // only skip top-level skip dirs; allow tools/*
      walkHtml(full, acc);
      continue;
    }
    if (shouldSkipFile(full)) continue;
    acc.push(full);
  }
  return acc;
}

/** Map absolute HTML path -> public loc (no .html). */
function normalizeLoc(loc) {
  // /tools/art/index -> /tools/art (clean category hub URL)
  if (loc.endsWith("/index")) loc = loc.slice(0, -"/index".length);
  // keep only site root and /guides/ with trailing slash
  if (loc !== `${SITE}/` && loc !== `${SITE}/guides/` && loc.endsWith("/")) {
    loc = loc.slice(0, -1);
  }
  return loc;
}

function toLoc(absPath) {
  const rel = path.relative(ROOT, absPath).replace(/\\/g, "/");
  if (rel === "index.html") return normalizeLoc(`${SITE}/`);
  let noExt = rel.replace(/\.html$/i, "");
  // guides/index -> /guides/
  if (noExt === "guides/index") return normalizeLoc(`${SITE}/guides/`);
  // tools/art/index.html -> /tools/art
  return normalizeLoc(`${SITE}/${noExt}`);
}

function loadGuideMeta() {
  const map = new Map(); // slug -> { dateModified, datePublished }
  if (!fs.existsSync(GUIDES_JSON)) return map;
  try {
    const data = JSON.parse(fs.readFileSync(GUIDES_JSON, "utf8"));
    const list = Array.isArray(data.guides) ? data.guides : [];
    for (const g of list) {
      const slug = g.slug || g.id;
      if (!slug) continue;
      map.set(slug, {
        dateModified: g.dateModified || "",
        datePublished: g.datePublished || "",
      });
    }
  } catch (err) {
    console.warn("warn: cannot parse guides.json:", err.message);
  }
  return map;
}

function guideSlugFromPath(absPath) {
  const rel = path.relative(ROOT, absPath).replace(/\\/g, "/");
  const m = rel.match(/^guides\/([^/]+)\.html$/i);
  if (!m) return null;
  if (m[1] === "index") return null;
  return m[1];
}

function lastmodFor(absPath, guideMeta) {
  const slug = guideSlugFromPath(absPath);
  if (slug) {
    const meta = guideMeta.get(slug);
    if (meta) {
      const d = parseDay(meta.dateModified) || parseDay(meta.datePublished);
      if (d) return toDay(d);
    }
    const mdPath = path.join(ROOT, "guides", "src", `${slug}.md`);
    const mdM = fileMtime(mdPath);
    if (mdM) return toDay(mdM);
  }
  const m = fileMtime(absPath);
  return toDay(m) || toDay(new Date());
}

function priorityFor(loc) {
  if (loc === `${SITE}/`) return "1.0";
  if (loc === `${SITE}/tools-directory`) return "0.9";
  if (loc === `${SITE}/guides/`) return "0.85";
  if (loc.includes("/guides/")) return "0.7";
  if (/\/tools\/[^/]+\/?$/.test(loc) || loc.endsWith("/index")) return "0.8";
  if (loc.includes("/tools/")) return "0.75";
  return "0.6";
}

function changefreqFor(loc) {
  if (loc === `${SITE}/`) return "weekly";
  if (loc === `${SITE}/guides/` || loc === `${SITE}/tools-directory`) return "weekly";
  if (loc.includes("/guides/")) return "monthly";
  if (loc.includes("/tools/")) return "monthly";
  return "monthly";
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function build() {
  const guideMeta = loadGuideMeta();
  const files = walkHtml(ROOT);
  const byLoc = new Map();

  for (const file of files) {
    const loc = toLoc(file);
    if (!loc.startsWith(SITE)) continue;
    const lastmod = lastmodFor(file, guideMeta);
    const prev = byLoc.get(loc);
    // keep newer lastmod if duplicate paths
    if (!prev || (lastmod && prev.lastmod < lastmod)) {
      byLoc.set(loc, {
        loc,
        lastmod,
        file,
        priority: priorityFor(loc),
        changefreq: changefreqFor(loc),
      });
    }
  }

  // Ensure every guides.json entry is present even if HTML path odd
  for (const [slug, meta] of guideMeta.entries()) {
    const loc = `${SITE}/guides/${slug}`;
    if (byLoc.has(loc)) continue;
    const htmlPath = path.join(ROOT, "guides", `${slug}.html`);
    if (!fs.existsSync(htmlPath)) continue;
    const lastmod =
      toDay(parseDay(meta.dateModified) || parseDay(meta.datePublished)) ||
      toDay(fileMtime(htmlPath)) ||
      toDay(new Date());
    byLoc.set(loc, {
      loc,
      lastmod,
      file: htmlPath,
      priority: "0.7",
      changefreq: "monthly",
    });
  }

  const urls = [...byLoc.values()].sort((a, b) => a.loc.localeCompare(b.loc));

  // stable ordering: home first, then tools-directory, guides/, rest alpha already
  urls.sort((a, b) => {
    const rank = (loc) => {
      if (loc === `${SITE}/`) return 0;
      if (loc === `${SITE}/tools-directory`) return 1;
      if (loc === `${SITE}/guides/`) return 2;
      return 10;
    };
    const ra = rank(a.loc);
    const rb = rank(b.loc);
    if (ra !== rb) return ra - rb;
    return a.loc.localeCompare(b.loc);
  });

  const body = urls
    .map(
      (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Generated by scripts/build-sitemap.cjs — lastmod from dateModified / file mtime -->
${body}
</urlset>
`;

  fs.writeFileSync(OUT, xml, "utf8");

  const guideUrls = urls.filter((u) => u.loc.includes("/guides/"));
  const lastmodSet = new Set(urls.map((u) => u.lastmod));
  console.log(
    `sitemap.xml: ${urls.length} URLs (${guideUrls.length} guide-related), distinct lastmod days=${lastmodSet.size}`
  );
  console.log(`wrote ${path.relative(ROOT, OUT)}`);
}

build();
