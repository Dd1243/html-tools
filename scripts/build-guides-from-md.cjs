#!/usr/bin/env node
/**
 * Build guides from Markdown sources into fixed-shell HTML.
 *
 * Input:  guides/src/{slug}.md  (YAML frontmatter + Markdown body)
 * Style:  guides/layout/guide-shell.css  (inlined into each page)
 * Output: guides/{slug}.html + guides/guides.json
 *
 * Zero npm deps — hand-rolled frontmatter + Markdown subset parser.
 * CommonJS (.cjs) because package.json has "type": "module".
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC_DIR = path.join(ROOT, "guides", "src");
const OUT_DIR = path.join(ROOT, "guides");
const CSS_PATH = path.join(ROOT, "guides", "layout", "guide-shell.css");
const GUIDES_JSON = path.join(OUT_DIR, "guides.json");
const SITE = "https://essays4u.net";

// ── helpers ──────────────────────────────────────────────────────────

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripBom(s) {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

/** Normalize tool path to site href: /tools/dev/json-formatter */
function toHref(p) {
  if (!p) return "/";
  let s = String(p).trim().replace(/\\/g, "/");
  if (s.startsWith("http")) return s;
  s = s.replace(/\.html$/i, "");
  if (!s.startsWith("/")) s = "/" + s;
  return s;
}

/** Normalize tool path for guides.json: tools/dev/json-formatter.html */
function toJsonPath(p) {
  if (!p) return "";
  let s = String(p).trim().replace(/\\/g, "/");
  if (s.startsWith("http")) return s;
  s = s.replace(/^\//, "");
  if (!s.endsWith(".html") && !s.endsWith("/")) s += ".html";
  return s;
}

function keywordsToString(kw) {
  if (!kw) return "";
  if (Array.isArray(kw)) return kw.join(",");
  return String(kw);
}

// ── frontmatter ──────────────────────────────────────────────────────

function parseFrontmatter(raw) {
  const text = stripBom(raw).replace(/\r\n/g, "\n");
  if (!text.startsWith("---\n") && !text.startsWith("---\r")) {
    return { meta: {}, body: text };
  }
  const end = text.indexOf("\n---", 4);
  if (end < 0) return { meta: {}, body: text };
  const yaml = text.slice(4, end).trim();
  let body = text.slice(end + 4);
  if (body.startsWith("\n")) body = body.slice(1);

  const meta = {};
  const lines = yaml.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) {
      i++;
      continue;
    }
    const key = m[1];
    let val = m[2];

    // folded/literal block scalar
    if (val === ">" || val === "|" || val === ">-" || val === "|-") {
      const parts = [];
      i++;
      while (i < lines.length && (lines[i].startsWith("  ") || lines[i].startsWith("\t") || lines[i] === "")) {
        parts.push(lines[i].replace(/^\s{2}/, "").replace(/^\t/, ""));
        i++;
      }
      meta[key] = parts.join(val.startsWith(">") ? " " : "\n").trim();
      continue;
    }

    // array
    if (val === "" || val === "[]") {
      const peek = lines[i + 1];
      if (peek && /^\s+-\s+/.test(peek)) {
        const arr = [];
        i++;
        while (i < lines.length && /^\s+-\s+/.test(lines[i])) {
          arr.push(unquote(lines[i].replace(/^\s+-\s+/, "").trim()));
          i++;
        }
        meta[key] = arr;
        continue;
      }
      meta[key] = val === "[]" ? [] : "";
      i++;
      continue;
    }

    if (val.startsWith("[") && val.endsWith("]")) {
      const inner = val.slice(1, -1).trim();
      meta[key] = inner
        ? inner.split(",").map((x) => unquote(x.trim())).filter(Boolean)
        : [];
      i++;
      continue;
    }

    meta[key] = unquote(val);
    i++;
  }
  return { meta, body };
}

function unquote(s) {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

// ── inline markdown ──────────────────────────────────────────────────

function renderInline(text) {
  let s = escapeHtml(text);
  // links [text](url) — after escape, brackets still plain
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, url) => {
    const href = escapeHtml(url.trim());
    return `<a href="${href}">${t}</a>`;
  });
  // bold ** **
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // italic * * (avoid bold leftovers)
  s = s.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
  // inline code
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  return s;
}

// ── block markdown ───────────────────────────────────────────────────

function parseHeading(line) {
  const m = line.match(/^(#{1,3})\s+(.+?)(?:\s+\{\#([a-zA-Z0-9_-]+)\})?\s*$/);
  if (!m) return null;
  return { level: m[1].length, title: m[2].trim(), id: m[3] || null };
}

function isTableSep(line) {
  return /^\|?[\s:|-]+\|[\s:|-]*\|?$/.test(line.trim()) && line.includes("-");
}

function splitTableRow(line) {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map((c) => c.trim());
}

function sectionClassForId(id, title) {
  const classes = ["card"];
  if (id === "tldr") classes.push("key-takeaway");
  if (id === "checklist" || /检查清单|清单/.test(title)) classes.push("checklist");
  return classes.join(" ");
}

/**
 * Convert markdown body into:
 *  - sectionsHtml: array of <section>...</section>
 *  - toc: [{id, title}]
 *  - faq: [{q, a}] for JSON-LD
 */
function mdToSections(body) {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const toc = [];
  const faq = [];
  const sections = [];

  let cur = null; // { id, title, className, parts: string[], isFaq }
  let faqBuf = null; // { q, paras: string[] }

  function flushFaqItem() {
    if (!faqBuf) return;
    const aHtml = faqBuf.paras.join("\n");
    const aText = faqBuf.paras
      .map((p) => p.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .join(" ");
    faq.push({ q: faqBuf.q, a: aText });
    if (cur) {
      cur.parts.push(`<div class="faq-item"><h3>${escapeHtml(faqBuf.q)}</h3>\n${aHtml}</div>`);
    }
    faqBuf = null;
  }

  function flushSection() {
    flushFaqItem();
    if (!cur) return;
    const inner = cur.parts.join("\n");
    const idAttr = cur.id ? ` id="${escapeHtml(cur.id)}"` : "";
    sections.push(
      `<section class="${cur.className}"${idAttr}>\n<h2>${escapeHtml(cur.title)}</h2>\n${inner}\n</section>`,
    );
    cur = null;
  }

  function ensureSection() {
    if (!cur) {
      cur = { id: null, title: "", className: "card", parts: [], isFaq: false };
    }
  }

  function pushBlock(html) {
    ensureSection();
    if (cur.isFaq && faqBuf) {
      faqBuf.paras.push(html);
    } else {
      cur.parts.push(html);
    }
  }

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // blank
    if (!trimmed) {
      i++;
      continue;
    }

    // fenced code
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // closing ```
      const code = escapeHtml(codeLines.join("\n"));
      pushBlock(`<pre class="code-block"${lang ? ` data-lang="${escapeHtml(lang)}"` : ""}>${code}</pre>`);
      continue;
    }

    // ATX heading
    const h = parseHeading(trimmed);
    if (h) {
      if (h.level === 1 || h.level === 2) {
        flushSection();
        const id = h.id || slugify(h.title);
        const title = h.title.replace(/\s*\{#[a-zA-Z0-9_-]+\}\s*$/, "");
        cur = {
          id,
          title,
          className: sectionClassForId(id, title),
          parts: [],
          isFaq: id === "faq" || /常见问题/.test(title),
        };
        toc.push({ id, title: shortTocTitle(title) });
        i++;
        continue;
      }
      if (h.level === 3) {
        ensureSection();
        const title = h.title.replace(/\s*\{#[a-zA-Z0-9_-]+\}\s*$/, "");
        if (cur.isFaq) {
          flushFaqItem();
          faqBuf = { q: title, paras: [] };
        } else {
          cur.parts.push(`<h3>${renderInline(title)}</h3>`);
        }
        i++;
        continue;
      }
    }

    // blockquote / callout
    if (trimmed.startsWith(">")) {
      const qLines = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        qLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      const inner = qLines.map((l) => (l ? `<p>${renderInline(l)}</p>` : "")).join("\n");
      pushBlock(`<div class="callout">\n${inner}\n</div>`);
      continue;
    }

    // table
    if (trimmed.includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const header = splitTableRow(trimmed);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().includes("|") && !lines[i].trim().startsWith("#")) {
        if (isTableSep(lines[i])) {
          i++;
          continue;
        }
        rows.push(splitTableRow(lines[i].trim()));
        i++;
      }
      let html = '<table class="data-table">\n<thead>\n<tr>\n';
      html += header.map((c) => `<th>${renderInline(c)}</th>`).join("\n");
      html += "\n</tr>\n</thead>\n<tbody>\n";
      for (const row of rows) {
        html += "<tr>\n";
        html += row.map((c) => `<td>${renderInline(c)}</td>`).join("\n");
        html += "\n</tr>\n";
      }
      html += "</tbody>\n</table>";
      pushBlock(html);
      continue;
    }

    // unordered list
    if (/^[-*]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      // special: related section tool list → tool-grid
      if (cur && (cur.id === "related" || /相关工具/.test(cur.title))) {
        const cards = items
          .map((it) => {
            const lm = it.match(/^\[([^\]]+)\]\(([^)]+)\)\s*[—–\-]?\s*(.*)$/);
            if (lm) {
              const desc = (lm[3] || "").replace(/^\s*[—–\-]\s*/, "");
              return `<a class="tool-card" href="${escapeHtml(lm[2].trim())}"><strong>${escapeHtml(lm[1])}</strong><span>${renderInline(desc)}</span></a>`;
            }
            return null;
          })
          .filter(Boolean);
        if (cards.length) {
          pushBlock(`<div class="tool-grid">\n${cards.join("\n")}\n</div>`);
          continue;
        }
      }
      // next section → buttons
      if (cur && (cur.id === "next" || /继续浏览/.test(cur.title))) {
        const btns = items
          .map((it, idx) => {
            const lm = it.match(/^\[([^\]]+)\]\(([^)]+)\)/);
            if (!lm) return null;
            const cls = idx === 0 ? "btn btn-primary" : "btn btn-ghost";
            return `<a class="${cls}" href="${escapeHtml(lm[2].trim())}">${escapeHtml(lm[1])}</a>`;
          })
          .filter(Boolean);
        if (btns.length) {
          pushBlock(`<div class="next-actions">\n${btns.join("\n")}\n</div>`);
          continue;
        }
      }
      const lis = items.map((it) => `<li>${renderInline(it)}</li>`).join("\n");
      pushBlock(`<ul>\n${lis}\n</ul>`);
      continue;
    }

    // ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      const lis = items.map((it) => `<li>${renderInline(it)}</li>`).join("\n");
      pushBlock(`<ol>\n${lis}\n</ol>`);
      continue;
    }

    // paragraph: gather consecutive non-blank, non-special lines
    const pLines = [];
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t) break;
      if (t.startsWith("```")) break;
      if (t.startsWith("#")) break;
      if (t.startsWith(">")) break;
      if (/^[-*]\s+/.test(t)) break;
      if (/^\d+\.\s+/.test(t)) break;
      if (t.includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1])) break;
      pLines.push(t);
      i++;
    }
    if (pLines.length) {
      pushBlock(`<p>${renderInline(pLines.join(" "))}</p>`);
    }
  }

  flushSection();
  return { sectionsHtml: sections.join("\n\n"), toc, faq };
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "section";
}

function shortTocTitle(title) {
  // keep reasonably short for TOC
  if (title.length <= 18) return title;
  return title.slice(0, 16) + "…";
}

// ── page shell ───────────────────────────────────────────────────────

function buildPage(meta, sectionsHtml, toc, faq, css) {
  const title = meta.title || meta.slug || "指南";
  const description = meta.description || "";
  const slug = meta.slug;
  const primaryTool = toHref(meta.primaryTool || "/");
  const relatedTools = (meta.relatedTools || []).map(toHref);
  const readingMinutes = Number(meta.readingMinutes) || 10;
  const datePublished = String(meta.datePublished || "").replace(/"/g, "");
  const dateModified = String(meta.dateModified || datePublished).replace(/"/g, "");
  const keywords = keywordsToString(meta.keywords);
  const tag = meta.tag || "使用指南";
  const typeLabel = meta.type === "howto" || !meta.type ? "How-to" : String(meta.type);
  const toolCta = meta.toolCta || "打开相关工具";
  const sideBtn = meta.sideBtn || "打开工具";
  const shortCrumb = meta.shortCrumb || title.slice(0, 20);
  const lead = meta.lead || description;
  const pageUrl = `${SITE}/guides/${slug}`;

  const tocItems = toc
    .filter((t) => t.id !== "next")
    .map((t) => `<li><a href="#${escapeHtml(t.id)}">${escapeHtml(t.title)}</a></li>`)
    .join("\n");

  const faqLd =
    faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  const techArticle = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description: description,
    datePublished,
    dateModified,
    author: { "@type": "Organization", name: "WebUtils" },
    publisher: {
      "@type": "Organization",
      name: "WebUtils",
      url: `${SITE}/`,
    },
    mainEntityOfPage: pageUrl,
  };

  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: title,
    description: description,
    totalTime: `PT${readingMinutes}M`,
    step: [
      {
        "@type": "HowToStep",
        name: "打开工具",
        text: `打开 WebUtils 相关工具页面。`,
        url: `${SITE}${primaryTool}`,
      },
      {
        "@type": "HowToStep",
        name: "按指南操作",
        text: "按照本指南中的步骤粘贴、处理并检查结果。",
      },
      {
        "@type": "HowToStep",
        name: "核对输出",
        text: "确认输出符合预期；如有报错，按错误表排查。",
      },
    ],
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首页", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "使用指南", item: `${SITE}/guides/` },
      { "@type": "ListItem", position: 3, name: shortCrumb, item: pageUrl },
    ],
  };

  function ldScript(obj) {
    return `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>`;
  }

  const leadHtml = renderInline(lead);

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)} - WebUtils</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index,follow" />
    <meta name="author" content="WebUtils" />
    <meta name="keywords" content="${escapeHtml(keywords)}" />
    <link rel="canonical" href="${pageUrl}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(title)} - WebUtils" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:site_name" content="WebUtils" />
    <meta property="og:locale" content="zh_CN" />
    <meta property="og:image" content="${SITE}/social-preview.png" />
    <meta property="article:published_time" content="${escapeHtml(datePublished)}" />
    <meta property="article:modified_time" content="${escapeHtml(dateModified)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)} - WebUtils" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${SITE}/social-preview.png" />
    ${ldScript(techArticle)}
    ${ldScript(howTo)}
    ${ldScript(breadcrumbLd)}
    ${faqLd ? ldScript(faqLd) : ""}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <style>
${css}
    </style>
  </head>
  <body>
    <header class="site-header">
      <div class="hdr">
        <div class="logo"><a href="/">WebUtils</a></div>
        <nav class="site-nav" aria-label="主导航">
          <a href="/">首页</a>
          <a href="/tools-directory">全部工具</a>
          <a href="/guides/" class="active">使用指南</a>
          <a href="/about">关于</a>
        </nav>
      </div>
    </header>

    <main class="page">
      <nav class="breadcrumb" aria-label="breadcrumb">
        <ol>
          <li><a href="/">首页</a></li>
          <li><a href="/guides/">使用指南</a></li>
          <li><span>${escapeHtml(shortCrumb)}</span></li>
        </ol>
      </nav>

      <article>
        <header class="article-hero">
          <h1>${escapeHtml(title)}</h1>
          <div class="meta-row">
            <span class="pill">更新 ${escapeHtml(dateModified)}</span>
            <span class="pill">约 ${readingMinutes} 分钟</span>
            <span class="pill">${escapeHtml(tag)}</span>
            <span class="pill">${escapeHtml(typeLabel)}</span>
          </div>
          <p class="lead">${leadHtml}</p>
          <div class="cta">
            <div class="cta-copy">
              <strong>立即使用相关工具</strong>
              <span>${escapeHtml(toolCta)}</span>
            </div>
            <a class="cta-btn" href="${escapeHtml(primaryTool)}">打开工具 →</a>
          </div>
        </header>

        <div class="article-layout">
          <div class="article-main">
${sectionsHtml}
          </div>

          <aside class="toc-rail">
            <h2>目录</h2>
            <ol class="toc-list">
${tocItems}
            </ol>
            <div class="side-cta">
              <h3>相关工具</h3>
              <a href="${escapeHtml(primaryTool)}" class="btn btn-primary" style="width:100%;">${escapeHtml(sideBtn)}</a>
            </div>
          </aside>
        </div>
      </article>
    </main>

    <footer>
      <div class="footer-inner">
        <p>WebUtils · 使用指南</p>
        <nav class="footer-links" aria-label="网站政策">
          <a href="/about">关于本站</a>
          <a href="/guides/">使用指南</a>
          <a href="/contact">联系我们</a>
          <a href="/terms">使用条款</a>
          <a href="/privacy-policy">隐私政策</a>
          <a href="/">返回首页</a>
        </nav>
        <p>&copy; 2026 WebUtils</p>
      </div>
    </footer>
  </body>
</html>
`;
}

// ── guides.json entry ────────────────────────────────────────────────

function toGuidesJsonEntry(meta) {
  const slug = meta.slug;
  return {
    id: slug,
    slug,
    tag: meta.tag || "使用指南",
    type: meta.type || "howto",
    title: meta.title,
    description: meta.description || "",
    path: `guides/${slug}.html`,
    primaryTool: toJsonPath(meta.primaryTool),
    relatedTools: (meta.relatedTools || []).map(toJsonPath),
    relatedGuides: meta.relatedGuides || [],
    datePublished: String(meta.datePublished || "").replace(/"/g, ""),
    dateModified: String(meta.dateModified || meta.datePublished || "").replace(/"/g, ""),
    readingMinutes: Number(meta.readingMinutes) || 10,
    keywords: keywordsToString(meta.keywords),
  };
}

// ── guides/index.html list sync ──────────────────────────────────────

const INDEX_HTML = path.join(OUT_DIR, "index.html");

const GUIDE_ICONS = {
  "json-formatter-guide": "⚡",
  "jwt-decoder-guide": "🔐",
};

function guideIcon(slug) {
  if (GUIDE_ICONS[slug]) return GUIDE_ICONS[slug];
  if (/jwt|token|auth|hash|rsa|otp/i.test(slug)) return "🔐";
  if (/json|yaml|xml/i.test(slug)) return "⚡";
  if (/image|color|css/i.test(slug)) return "🎨";
  return "📘";
}

function toolLabelFromPath(primaryTool) {
  const href = toHref(primaryTool);
  const base = href.split("/").filter(Boolean).pop() || "工具";
  const map = {
    "json-formatter": "JSON 格式化",
    "jwt-decoder": "JWT 解码器",
    "json-minifier": "JSON 压缩",
    "json-diff": "JSON Diff",
    base64: "Base64",
    "hash-generator": "Hash 生成",
  };
  return map[base] || base.replace(/-/g, " ");
}

function sortGuidesForIndex(guides) {
  return [...guides].sort((a, b) => {
    const da = String(a.dateModified || a.datePublished || "");
    const db = String(b.dateModified || b.datePublished || "");
    if (da !== db) return db.localeCompare(da);
    return String(a.slug).localeCompare(String(b.slug));
  });
}

function renderGuideCards(guides) {
  return guides
    .map((g) => {
      const slug = g.slug;
      const href = `/guides/${slug}`;
      const toolHref = toHref(g.primaryTool);
      const minutes = Number(g.readingMinutes) || 10;
      const tag = g.tag || "使用指南";
      const desc = g.description || "";
      const icon = guideIcon(slug);
      const toolName = toolLabelFromPath(g.primaryTool);
      return `          <article class="guide-card">
            <div class="guide-icon" aria-hidden="true">${icon}</div>
            <div class="guide-body">
              <h3 class="guide-title">
                <a href="${escapeHtml(href)}">${escapeHtml(g.title)}</a>
              </h3>
              <p class="guide-desc">
                ${escapeHtml(desc)}
              </p>
              <div class="guide-meta">
                <span>${escapeHtml(tag)}</span>
                <span>·</span>
                <span>约 ${minutes} 分钟</span>
                <span>·</span>
                <a href="${escapeHtml(toolHref)}">打开 ${escapeHtml(toolName)}</a>
              </div>
            </div>
          </article>`;
    })
    .join("\n");
}

function renderIndexItemListLd(guides) {
  return guides.map((g, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: g.title,
    url: `${SITE}/guides/${g.slug}`,
  }));
}

/** Patch guides/index.html card grid, count pill, and CollectionPage ItemList. */
function updateGuidesIndex(guides) {
  if (!fs.existsSync(INDEX_HTML)) {
    console.warn("guides/index.html missing — skip list sync");
    return;
  }
  let html = fs.readFileSync(INDEX_HTML, "utf8");
  const list = sortGuidesForIndex(guides);
  const n = list.length;
  const cards = renderGuideCards(list);

  // hero count pill
  html = html.replace(
    /<span class="pill">\d+\s*篇已发布<\/span>/,
    `<span class="pill">${n} 篇已发布</span>`,
  );

  // card grid
  if (!/<div class="guide-grid">[\s\S]*?<\/div>\s*<\/section>/.test(html)) {
    console.warn("guides/index.html: guide-grid not found — skip cards");
  } else {
    html = html.replace(
      /<div class="guide-grid">[\s\S]*?<\/div>(\s*<\/section>)/,
      `<div class="guide-grid">\n${cards}\n        </div>$1`,
    );
  }

  // JSON-LD ItemList inside CollectionPage
  const itemsJson = JSON.stringify(renderIndexItemListLd(list), null, 2)
    .split("\n")
    .map((line, idx) => (idx === 0 ? line : "                " + line))
    .join("\n");
  if (/("mainEntity"\s*:\s*\{\s*"@type"\s*:\s*"ItemList"[\s\S]*?"itemListElement"\s*:\s*)\[[\s\S]*?\]/.test(html)) {
    html = html.replace(
      /("mainEntity"\s*:\s*\{\s*"@type"\s*:\s*"ItemList"[\s\S]*?"numberOfItems"\s*:\s*)\d+/,
      `$1${n}`,
    );
    html = html.replace(
      /("itemListElement"\s*:\s*)\[[\s\S]*?\](\s*\}\s*,\s*\{\s*"@type"\s*:\s*"BreadcrumbList")/,
      `$1${itemsJson}$2`,
    );
  }

  fs.writeFileSync(INDEX_HTML, html, "utf8");
  console.log(`updated guides/index.html (${n} cards)`);
}

// ── main ─────────────────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error("Missing guides/src — nothing to build");
    process.exit(1);
  }
  if (!fs.existsSync(CSS_PATH)) {
    console.error("Missing guides/layout/guide-shell.css");
    process.exit(1);
  }

  const css = stripBom(fs.readFileSync(CSS_PATH, "utf8"))
    .split(/\r?\n/)
    .map((l) => (l.trim() ? "      " + l.replace(/^\uFEFF/, "") : l))
    .join("\n");

  const files = fs
    .readdirSync(SRC_DIR)
    .filter((f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md")
    .sort();

  if (!files.length) {
    console.warn("No markdown sources in guides/src");
    process.exit(0);
  }

  const entries = [];
  let built = 0;

  for (const file of files) {
    const full = path.join(SRC_DIR, file);
    const raw = fs.readFileSync(full, "utf8");
    const { meta, body } = parseFrontmatter(raw);
    const slug = meta.slug || file.replace(/\.md$/i, "");
    meta.slug = slug;

    if (!meta.title) {
      console.warn(`[skip] ${file}: missing title`);
      continue;
    }

    const { sectionsHtml, toc, faq } = mdToSections(body);
    const html = buildPage(meta, sectionsHtml, toc, faq, css);
    const outPath = path.join(OUT_DIR, `${slug}.html`);
    fs.writeFileSync(outPath, html, "utf8");
    entries.push(toGuidesJsonEntry(meta));
    built++;
    console.log(`built guides/${slug}.html  (toc=${toc.length}, faq=${faq.length})`);
  }

  // merge guides.json: keep entries without src, overwrite those with src
  let existing = { guides: [] };
  if (fs.existsSync(GUIDES_JSON)) {
    try {
      existing = JSON.parse(fs.readFileSync(GUIDES_JSON, "utf8"));
    } catch {
      existing = { guides: [] };
    }
  }
  const bySlug = new Map();
  for (const g of existing.guides || []) {
    if (g && g.slug) bySlug.set(g.slug, g);
  }
  for (const e of entries) {
    bySlug.set(e.slug, e);
  }
  const merged = { guides: [...bySlug.values()].sort((a, b) => a.slug.localeCompare(b.slug)) };
  fs.writeFileSync(GUIDES_JSON, JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log(`updated guides/guides.json (${merged.guides.length} entries)`);

  updateGuidesIndex(merged.guides);
  console.log(`done: ${built} guide(s) from MD`);
}

main();
