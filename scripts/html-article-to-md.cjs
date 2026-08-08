/**
 * One-shot: extract guides/json-formatter-guide.html article-main → guides/src/json-formatter-guide.md
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const htmlPath = path.join(ROOT, "guides", "json-formatter-guide.html");
const outPath = path.join(ROOT, "guides", "src", "json-formatter-guide.md");

const html = fs.readFileSync(htmlPath, "utf8");
const mainMatch = html.match(
  /<div class="article-main">([\s\S]*?)<\/div>\s*(?:<!--[\s\S]*?-->\s*)*<aside class="toc-rail">/,
);
if (!mainMatch) {
  console.error("article-main not found");
  process.exit(1);
}
let body = mainMatch[1];

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function inlineToMd(s) {
  s = s.replace(/\s+/g, " ").trim();
  s = s.replace(/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, t) => {
    const text = inlineToMd(t).replace(/\n/g, " ").trim();
    return `[${text}](${href})`;
  });
  s = s.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**");
  s = s.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**");
  s = s.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*");
  s = s.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<[^>]+>/g, "");
  return decodeEntities(s).trim();
}

function tableToMd(tableHtml) {
  const rows = [];
  const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let m;
  while ((m = trRe.exec(tableHtml))) {
    const cells = [];
    const cellRe = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi;
    let c;
    while ((c = cellRe.exec(m[1]))) {
      cells.push(inlineToMd(c[1]).replace(/\|/g, "\\|"));
    }
    if (cells.length) rows.push(cells);
  }
  if (!rows.length) return "";
  const width = Math.max(...rows.map((r) => r.length));
  const norm = rows.map((r) => {
    while (r.length < width) r.push("");
    return r;
  });
  const header = norm[0];
  const sep = header.map(() => "---");
  const lines = [
    `| ${header.join(" | ")} |`,
    `| ${sep.join(" | ")} |`,
    ...norm.slice(1).map((r) => `| ${r.join(" | ")} |`),
  ];
  return lines.join("\n");
}

function listToMd(listHtml, ordered) {
  const items = [];
  const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let m;
  let i = 1;
  while ((m = liRe.exec(listHtml))) {
    const text = inlineToMd(m[1]);
    items.push(ordered ? `${i}. ${text}` : `- ${text}`);
    i++;
  }
  return items.join("\n");
}

function blockChildrenToMd(inner) {
  const parts = [];
  let rest = inner.trim();
  // iterative consume
  while (rest.length) {
    rest = rest.replace(/^\s+/, "");
    if (!rest) break;

    if (/^<h3[\s>]/i.test(rest)) {
      const m = rest.match(/^<h3[^>]*>([\s\S]*?)<\/h3>/i);
      if (!m) break;
      parts.push(`### ${inlineToMd(m[1])}`);
      rest = rest.slice(m[0].length);
      continue;
    }
    if (/^<p[\s>]/i.test(rest)) {
      const m = rest.match(/^<p[^>]*>([\s\S]*?)<\/p>/i);
      if (!m) break;
      parts.push(inlineToMd(m[1]));
      rest = rest.slice(m[0].length);
      continue;
    }
    if (/^<pre[\s>]/i.test(rest)) {
      const m = rest.match(/^<pre[^>]*>([\s\S]*?)<\/pre>/i);
      if (!m) break;
      let code = decodeEntities(m[1].replace(/<[^>]+>/g, ""));
      parts.push("```\n" + code.replace(/^\n/, "") + "\n```");
      rest = rest.slice(m[0].length);
      continue;
    }
    if (/^<table[\s>]/i.test(rest)) {
      const m = rest.match(/^<table[\s\S]*?<\/table>/i);
      if (!m) break;
      parts.push(tableToMd(m[0]));
      rest = rest.slice(m[0].length);
      continue;
    }
    if (/^<ul[\s>]/i.test(rest)) {
      const m = rest.match(/^<ul[\s\S]*?<\/ul>/i);
      if (!m) break;
      parts.push(listToMd(m[0], false));
      rest = rest.slice(m[0].length);
      continue;
    }
    if (/^<ol[\s>]/i.test(rest)) {
      const m = rest.match(/^<ol[\s\S]*?<\/ol>/i);
      if (!m) break;
      parts.push(listToMd(m[0], true));
      rest = rest.slice(m[0].length);
      continue;
    }
    if (/^<div class="callout"/i.test(rest)) {
      const m = rest.match(/^<div class="callout"[^>]*>([\s\S]*?)<\/div>/i);
      if (!m) break;
      const t = inlineToMd(m[1]);
      parts.push(`> ${t}`);
      rest = rest.slice(m[0].length);
      continue;
    }
    if (/^<div class="compare-grid"/i.test(rest)) {
      const m = rest.match(/^<div class="compare-grid"[^>]*>([\s\S]*?)<\/div>\s*(?=<h3|<p|<table|<ul|<ol|<pre|<div class="|$)/i)
        || rest.match(/^<div class="compare-grid"[^>]*>([\s\S]*)/i);
      // better: find matching by panels
      const start = rest.indexOf('<div class="compare-grid"');
      // crude: take until next sibling tag at depth — use full rest parse of two panels
      const gridMatch = rest.match(
        /^<div class="compare-grid"[^>]*>\s*<div class="compare-panel"[^>]*>([\s\S]*?)<\/div>\s*<div class="compare-panel"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i,
      );
      if (gridMatch) {
        parts.push(blockChildrenToMd(gridMatch[1]));
        parts.push(blockChildrenToMd(gridMatch[2]));
        rest = rest.slice(gridMatch[0].length);
        continue;
      }
      // fallback skip opening
      rest = rest.replace(/^<div class="compare-grid"[^>]*>/, "");
      continue;
    }
    if (/^<div class="compare-panel"/i.test(rest)) {
      const m = rest.match(/^<div class="compare-panel"[^>]*>([\s\S]*?)<\/div>/i);
      if (!m) break;
      parts.push(blockChildrenToMd(m[1]));
      rest = rest.slice(m[0].length);
      continue;
    }
    if (/^<div class="tool-grid"/i.test(rest)) {
      const m = rest.match(/^<div class="tool-grid"[^>]*>([\s\S]*?)<\/div>/i);
      if (!m) break;
      const cards = [];
      const cardRe = /<a class="tool-card" href="([^"]+)"[^>]*>\s*<strong>([\s\S]*?)<\/strong>\s*<span>([\s\S]*?)<\/span>\s*<\/a>/gi;
      let c;
      while ((c = cardRe.exec(m[1]))) {
        cards.push(`- [${inlineToMd(c[2])}](${c[1]}) — ${inlineToMd(c[3])}`);
      }
      parts.push(cards.join("\n"));
      rest = rest.slice(m[0].length);
      continue;
    }
    if (/^<div class="faq-item"/i.test(rest)) {
      const m = rest.match(/^<div class="faq-item"[^>]*>([\s\S]*?)<\/div>/i);
      if (!m) break;
      const hm = m[1].match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
      const pm = m[1].match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      if (hm) parts.push(`### ${inlineToMd(hm[1])}`);
      if (pm) parts.push(inlineToMd(pm[1]));
      rest = rest.slice(m[0].length);
      continue;
    }
    if (/^<div class="next-actions"/i.test(rest)) {
      const m = rest.match(/^<div class="next-actions"[^>]*>([\s\S]*?)<\/div>/i);
      if (!m) break;
      const links = [];
      const aRe = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
      let a;
      while ((a = aRe.exec(m[1]))) {
        links.push(`- [${inlineToMd(a[2])}](${a[1]})`);
      }
      parts.push(links.join("\n"));
      rest = rest.slice(m[0].length);
      continue;
    }
    if (/^<div[\s>]/i.test(rest)) {
      // generic div: unwrap
      const m = rest.match(/^<div[^>]*>([\s\S]*?)<\/div>/i);
      if (m && m[0].length < rest.length + 1) {
        // might be too greedy for nested — try non-greedy already
        parts.push(blockChildrenToMd(m[1]));
        rest = rest.slice(m[0].length);
        continue;
      }
      rest = rest.replace(/^<div[^>]*>/, "");
      continue;
    }
    // strip unknown single tag
    const tag = rest.match(/^<\/?[a-zA-Z][^>]*>/);
    if (tag) {
      rest = rest.slice(tag[0].length);
      continue;
    }
    // plain text
    const plain = rest.match(/^[^<]+/);
    if (plain) {
      const t = decodeEntities(plain[0]).trim();
      if (t) parts.push(t);
      rest = rest.slice(plain[0].length);
      continue;
    }
    break;
  }
  return parts.filter(Boolean).join("\n\n");
}

const sections = [];
const secRe = /<section\b([^>]*)>([\s\S]*?)<\/section>/gi;
let sm;
while ((sm = secRe.exec(body))) {
  const attrs = sm[1];
  const inner = sm[2];
  const idM = attrs.match(/\bid="([^"]+)"/);
  const id = idM ? idM[1] : "";
  const h2m = inner.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  const title = h2m ? inlineToMd(h2m[1]) : "节";
  const afterH2 = h2m ? inner.slice(inner.indexOf(h2m[0]) + h2m[0].length) : inner;
  const mdBody = blockChildrenToMd(afterH2);
  const heading = id ? `## ${title} {#${id}}` : `## ${title}`;
  sections.push(`${heading}\n\n${mdBody}`);
}

const leadM = html.match(/<p class="lead">([\s\S]*?)<\/p>/);
const lead = leadM ? inlineToMd(leadM[1]) : "";

const fm = `---
title: JSON 格式化完全指南：美化、校验与常见错误
description: 系统讲解 JSON 美化、校验与压缩的区别，给出操作步骤、常见错误、真实场景与工具选型，配套 WebUtils 本地处理工具。
keywords: JSON格式化,JSON美化,JSON校验,JSON错误,在线JSON工具
tag: 开发工具
type: howto
slug: json-formatter-guide
datePublished: "2026-08-06"
dateModified: "2026-08-07"
readingMinutes: 12
primaryTool: /tools/dev/json-formatter
relatedTools:
  - /tools/dev/json-minifier
  - /tools/dev/json-diff
  - /tools/converter/json-yaml
toolCta: JSON 格式化 — 浏览器内美化、校验与压缩，无需安装
sideBtn: 立即打开格式化工具
shortCrumb: JSON 格式化完全指南
lead: >
  ${lead.replace(/\n/g, " ")}
---

`;

const md = fm + sections.join("\n\n") + "\n";
fs.writeFileSync(outPath, md, "utf8");
const cn = (md.match(/[\u4e00-\u9fff]/g) || []).length;
console.log("wrote", outPath, "chinese≈", cn, "chars", md.length);
