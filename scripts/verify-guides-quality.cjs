#!/usr/bin/env node
/**
 * Verify guides/*.html body quality:
 * - Chinese character count in <article> >= MIN_CN (default 2500)
 * - Basic anti-template / hollow checks
 * - guides.json readingMinutes vs rough expectation
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const GUIDES_DIR = path.join(ROOT, "guides");
const GUIDES_JSON = path.join(GUIDES_DIR, "guides.json");
const MIN_CN = Number(process.env.GUIDE_MIN_CN || 2500);

/** Phrases that often signal hollow / templated filler when overused */
const FILLER_PHRASES = [
  "广泛应用于各种场景",
  "一站式解决",
  "大幅提升效率",
  "本文将详细介绍",
  "相信通过本文",
  "希望本文对你有所帮助",
  "随着互联网的发展",
  "在当今数字化时代",
  "无需多言",
  "众所周知",
];

function stripToPlain(articleHtml) {
  let t = articleHtml;
  t = t.replace(/<script[\s\S]*?<\/script>/gi, " ");
  t = t.replace(/<style[\s\S]*?<\/style>/gi, " ");
  t = t.replace(/<[^>]+>/g, " ");
  t = t.replace(/&[a-zA-Z]+;/g, " ");
  t = t.replace(/&#\d+;/g, " ");
  t = t.replace(/\s+/g, "");
  return t;
}

function countChinese(s) {
  const m = s.match(/[\u4e00-\u9fff]/g);
  return m ? m.length : 0;
}

function extractArticle(html) {
  const m = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i);
  return m ? m[1] : null;
}

function listGuideHtmlFiles() {
  if (!fs.existsSync(GUIDES_DIR)) return [];
  return fs
    .readdirSync(GUIDES_DIR)
    .filter((f) => f.endsWith(".html") && f !== "index.html")
    .map((f) => path.join(GUIDES_DIR, f));
}

function checkFile(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, "/");
  const html = fs.readFileSync(filePath, "utf8");
  const issues = [];
  const warnings = [];

  const article = extractArticle(html);
  if (!article) {
    issues.push("missing <article>");
    return { rel, cn: 0, issues, warnings };
  }

  const plain = stripToPlain(article);
  const cn = countChinese(plain);

  if (cn < MIN_CN) {
    issues.push(`Chinese chars in article = ${cn} (need >= ${MIN_CN})`);
  }

  // Hollow: very few h2 relative to length expectation, or almost no paragraphs
  const h2 = (article.match(/<h2\b/gi) || []).length;
  const pCount = (article.match(/<p\b/gi) || []).length;
  if (cn >= MIN_CN && pCount < 8) {
    warnings.push(`only ${pCount} <p> tags — may be list-only hollow content`);
  }
  if (h2 < 3) {
    warnings.push(`only ${h2} <h2> sections — structure may be too thin`);
  }

  // TOC hrefs vs ids
  const hrefs = [...article.matchAll(/href="#([^"]+)"/g)].map((x) => x[1]);
  // also check aside outside article? TOC is often outside article-main but inside article
  const allHtmlHrefs = [...html.matchAll(/class="toc-list"[\s\S]*?<\/ol>/g)];
  let tocIds = hrefs;
  if (allHtmlHrefs[0]) {
    tocIds = [...allHtmlHrefs[0][0].matchAll(/href="#([^"]+)"/g)].map((x) => x[1]);
  }
  for (const id of tocIds) {
    if (!new RegExp(`id="${id}"`).test(html)) {
      issues.push(`TOC anchor #${id} has no matching id`);
    }
  }

  // Filler phrase hits
  let fillerHits = 0;
  for (const phrase of FILLER_PHRASES) {
    if (plain.includes(phrase.replace(/\s+/g, "")) || html.includes(phrase)) {
      fillerHits += 1;
      warnings.push(`possible filler phrase: 「${phrase}」`);
    }
  }
  if (fillerHits >= 3) {
    issues.push(`too many filler phrases (${fillerHits}) — rewrite, do not template`);
  }

  // Placeholder leakage
  if (/\{\{[A-Z0-9_]+\}\}/.test(html)) {
    issues.push("template placeholder {{...}} left in page");
  }

  return { rel, cn, issues, warnings, h2, pCount };
}

function checkGuidesJson(resultsByFile) {
  const issues = [];
  const warnings = [];
  if (!fs.existsSync(GUIDES_JSON)) {
    warnings.push("guides/guides.json missing");
    return { issues, warnings };
  }
  let data;
  try {
    data = JSON.parse(fs.readFileSync(GUIDES_JSON, "utf8"));
  } catch (e) {
    issues.push(`guides.json parse error: ${e.message}`);
    return { issues, warnings };
  }
  const guides = data.guides || [];
  for (const g of guides) {
    const file = path.join(ROOT, g.path || "");
    const rel = (g.path || "").replace(/\\/g, "/");
    if (!g.path || !fs.existsSync(file)) {
      issues.push(`guides.json entry missing file: ${rel || g.id}`);
      continue;
    }
    const r = resultsByFile.get(path.resolve(file));
    if (!r) continue;
    const mins = Number(g.readingMinutes || 0);
    // rough: 2500 hanzi ~ 10+ min; flag obvious mismatch
    if (r.cn >= MIN_CN && mins > 0 && mins < 8) {
      warnings.push(
        `${rel}: readingMinutes=${mins} too low for ~${r.cn} Chinese chars (prefer 10–14)`,
      );
    }
    if (r.cn < MIN_CN) {
      issues.push(`${rel}: registered in guides.json but under ${MIN_CN} Chinese chars`);
    }
  }
  return { issues, warnings };
}

function main() {
  const files = listGuideHtmlFiles();
  if (files.length === 0) {
    console.log("No guide HTML files found under guides/ (excluding index.html).");
    process.exit(0);
  }

  let failed = false;
  const resultsByFile = new Map();

  console.log(`verify-guides-quality: MIN_CN=${MIN_CN}, files=${files.length}\n`);

  for (const file of files) {
    const r = checkFile(file);
    resultsByFile.set(path.resolve(file), r);
    const status = r.issues.length ? "FAIL" : "OK";
    if (r.issues.length) failed = true;
    console.log(`[${status}] ${r.rel}  chinese=${r.cn}`);
    for (const i of r.issues) console.log(`  error: ${i}`);
    for (const w of r.warnings) console.log(`  warn:  ${w}`);
  }

  const meta = checkGuidesJson(resultsByFile);
  for (const i of meta.issues) {
    failed = true;
    console.log(`error: ${i}`);
  }
  for (const w of meta.warnings) console.log(`warn:  ${w}`);

  console.log(failed ? "\nverify-guides-quality: FAILED" : "\nverify-guides-quality: PASSED");
  process.exit(failed ? 1 : 0);
}

main();
