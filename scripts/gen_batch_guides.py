# -*- coding: utf-8 -*-
"""Generate 10 unique WebUtils guide pages + update guides.json / index / llms."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(r"e:\html-tools")
GUIDES = ROOT / "guides"
STYLE = (GUIDES / "_shell_style.txt").read_text(encoding="utf-8")
DATE = "2026-08-07"
SITE = "https://essays4u.net"


def count_cn_in_article(html: str) -> int:
    m = re.search(r"<article\b[^>]*>([\s\S]*?)</article>", html, re.I)
    if not m:
        return 0
    t = m.group(1)
    t = re.sub(r"<script[\s\S]*?</script>", " ", t, flags=re.I)
    t = re.sub(r"<style[\s\S]*?</style>", " ", t, flags=re.I)
    t = re.sub(r"<[^>]+>", " ", t)
    t = re.sub(r"&[a-zA-Z]+;", " ", t)
    t = re.sub(r"&#\d+;", " ", t)
    return len(re.findall(r"[\u4e00-\u9fff]", t))


def faq_json(faqs):
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": q,
                "acceptedAnswer": {"@type": "Answer", "text": a},
            }
            for q, a in faqs
        ],
    }


def dumps(obj) -> str:
    return json.dumps(obj, ensure_ascii=False, indent=2)


def render(g: dict) -> str:
    slug = g["slug"]
    title = g["title"]
    desc = g["description"]
    keywords = g["keywords"]
    tag = g["tag"]
    tool_path = g["tool_path"]
    tool_name = g["tool_name"]
    tool_cta = g["tool_cta"]
    lead = g["lead"]
    toc = g["toc"]
    body = g["body"]
    faqs = g["faqs"]
    howto_steps = g["howto_steps"]
    side_btn = g.get("side_btn", f"打开{tool_name}")
    short_crumb = g.get("short_crumb", title.split("：")[0])

    faq_html = "\n".join(
        f"""              <div class="faq-item">
                <h3>{q}</h3>
                <p>{a}</p>
              </div>"""
        for q, a in faqs
    )
    body = body.replace("{FAQ_BLOCK}", faq_html)

    toc_items = "\n".join(f'              <li><a href="#{i}">{lab}</a></li>' for i, lab in toc)

    tech = {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": title,
        "description": desc,
        "datePublished": DATE,
        "dateModified": DATE,
        "author": {"@type": "Organization", "name": "WebUtils"},
        "publisher": {"@type": "Organization", "name": "WebUtils", "url": f"{SITE}/"},
        "mainEntityOfPage": f"{SITE}/guides/{slug}",
    }
    howto = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": g.get("howto_name", f"如何使用{tool_name}"),
        "description": g.get("howto_desc", desc),
        "totalTime": "PT12M",
        "step": [
            {
                "@type": "HowToStep",
                "name": n,
                "text": t,
                **({"url": f"{SITE}{tool_path}"} if i == 0 else {}),
            }
            for i, (n, t) in enumerate(howto_steps)
        ],
    }
    bread = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "首页", "item": f"{SITE}/"},
            {"@type": "ListItem", "position": 2, "name": "使用指南", "item": f"{SITE}/guides/"},
            {"@type": "ListItem", "position": 3, "name": short_crumb, "item": f"{SITE}/guides/{slug}"},
        ],
    }

    return f"""<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} - WebUtils</title>
    <meta name="description" content="{desc}" />
    <meta name="robots" content="index,follow" />
    <meta name="author" content="WebUtils" />
    <meta name="keywords" content="{keywords}" />
    <link rel="canonical" href="{SITE}/guides/{slug}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="{title} - WebUtils" />
    <meta property="og:description" content="{desc}" />
    <meta property="og:url" content="{SITE}/guides/{slug}" />
    <meta property="og:site_name" content="WebUtils" />
    <meta property="og:locale" content="zh_CN" />
    <meta property="og:image" content="{SITE}/social-preview.png" />
    <meta property="article:published_time" content="{DATE}" />
    <meta property="article:modified_time" content="{DATE}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{title} - WebUtils" />
    <meta name="twitter:description" content="{desc}" />
    <meta name="twitter:image" content="{SITE}/social-preview.png" />
    <script type="application/ld+json">
{dumps(tech)}
    </script>
    <script type="application/ld+json">
{dumps(howto)}
    </script>
    <script type="application/ld+json">
{dumps(bread)}
    </script>
    <script type="application/ld+json">
{dumps(faq_json(faqs))}
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    {STYLE}
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
          <li><span>{short_crumb}</span></li>
        </ol>
      </nav>

      <article>
        <header class="article-hero">
          <h1>{title}</h1>
          <div class="meta-row">
            <span class="pill">更新 {DATE}</span>
            <span class="pill">约 12 分钟</span>
            <span class="pill">{tag}</span>
            <span class="pill">How-to</span>
          </div>
          <p class="lead">
            {lead}
          </p>
          <div class="cta">
            <div class="cta-copy">
              <strong>立即使用相关工具</strong>
              <span>{tool_cta}</span>
            </div>
            <a class="cta-btn" href="{tool_path}">打开工具 →</a>
          </div>
        </header>

        <div class="article-layout">
          <div class="article-main">
{body}
            <section class="card" id="faq">
              <h2>常见问题</h2>
{faq_html}
            </section>
          </div>

          <aside class="toc-rail">
            <h2>目录</h2>
            <ol class="toc-list">
{toc_items}
              <li><a href="#faq">常见问题</a></li>
            </ol>
            <div class="side-cta">
              <h3>相关工具</h3>
              <a href="{tool_path}" class="btn btn-primary" style="width:100%;">{side_btn}</a>
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
"""


# Import bodies
from gen_guide_bodies import GUIDES_DATA  # noqa: E402


def update_guides_json(meta_list):
    existing = {
        "id": "json-formatter-guide",
        "slug": "json-formatter-guide",
        "tag": "开发工具",
        "type": "howto",
        "title": "JSON 格式化完全指南：美化、校验与常见错误",
        "description": "系统讲解 JSON 美化、校验与压缩的区别，给出操作步骤、常见错误、真实场景与工具选型，配套 WebUtils 本地处理工具。",
        "path": "guides/json-formatter-guide.html",
        "primaryTool": "tools/dev/json-formatter.html",
        "relatedTools": [
            "tools/dev/json-minifier.html",
            "tools/dev/json-diff.html",
            "tools/converter/json-yaml.html",
        ],
        "relatedGuides": [],
        "datePublished": "2026-08-06",
        "dateModified": DATE,
        "readingMinutes": 12,
        "keywords": "JSON格式化,JSON美化,JSON校验,JSON错误,在线JSON工具",
    }
    data = {"guides": [existing] + meta_list}
    (GUIDES / "guides.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def update_index(cards_html, n_items, item_list_ld):
    path = GUIDES / "index.html"
    html = path.read_text(encoding="utf-8")
    # numberOfItems
    html = re.sub(
        r'"numberOfItems":\s*\d+',
        f'"numberOfItems": {n_items}',
        html,
        count=1,
    )
    # replace itemListElement array roughly
    html = re.sub(
        r'"itemListElement":\s*\[[\s\S]*?\]\s*\}\s*,\s*\{\s*"@type":\s*"BreadcrumbList"',
        f'"itemListElement": {item_list_ld}\n            }}\n          }},\n          {{\n            "@type": "BreadcrumbList"',
        html,
        count=1,
    )
    html = re.sub(
        r'<span class="pill">\d+ 篇已发布</span>',
        f'<span class="pill">{n_items} 篇已发布</span>',
        html,
        count=1,
    )
    html = re.sub(
        r'(<div class="guide-grid">)[\s\S]*?(</div>\s*</section>\s*<section class="section" aria-labelledby="howto-heading">)',
        r"\1\n" + cards_html + r"\n        \2",
        html,
        count=1,
    )
    # description refresh
    html = html.replace(
        "帮助你更快完成 JSON 格式化、编码转换、图片处理等常见任务。",
        "覆盖 JSON、Base64、正则、JWT、时间戳、URL、哈希、Cron、图片压缩、二维码与密码等热门工具教程。",
    )
    path.write_text(html, encoding="utf-8")


def update_llms(lines):
    path = ROOT / "llms.txt"
    text = path.read_text(encoding="utf-8")
    marker = "- [JSON 格式化完全指南](https://essays4u.net/guides/json-formatter-guide): 美化、校验与常见错误，关联 JSON 格式化工具\n"
    if marker in text:
        insert = marker + "".join(lines)
        if "base64-guide" not in text:
            text = text.replace(marker, insert)
            path.write_text(text, encoding="utf-8")


def card(icon, href, title, desc, tag, mins, tool_href, tool_label):
    return f"""          <article class="guide-card">
            <div class="guide-icon" aria-hidden="true">{icon}</div>
            <div class="guide-body">
              <h3 class="guide-title">
                <a href="{href}">{title}</a>
              </h3>
              <p class="guide-desc">{desc}</p>
              <div class="guide-meta">
                <span>{tag}</span>
                <span>·</span>
                <span>约 {mins} 分钟</span>
                <span>·</span>
                <a href="{tool_href}">{tool_label}</a>
              </div>
            </div>
          </article>"""


def main():
    results = []
    meta_list = []
    cards = []
    ld_items = []
    icons = {
        "base64-guide": "🔤",
        "regex-tester-guide": "🔍",
        "jwt-decoder-guide": "🔑",
        "timestamp-guide": "⏱️",
        "url-codec-guide": "🔗",
        "hash-generator-guide": "#️⃣",
        "cron-generator-guide": "⏰",
        "image-compressor-guide": "🖼️",
        "qrcode-generator-guide": "▦",
        "password-generator-guide": "🔐",
        "json-formatter-guide": "⚡",
    }

    # keep json card first
    cards.append(
        card(
            "⚡",
            "/guides/json-formatter-guide",
            "JSON 格式化完全指南：美化、校验与常见错误",
            "说明 JSON 格式化适用场景、在线操作步骤，以及缺少引号、尾逗号等常见语法错误处理方式。",
            "开发工具",
            12,
            "/tools/dev/json-formatter",
            "打开 JSON 格式化",
        )
    )
    ld_items.append(
        {
            "@type": "ListItem",
            "position": 1,
            "name": "JSON 格式化完全指南：美化、校验与常见错误",
            "url": f"{SITE}/guides/json-formatter-guide",
        }
    )

    llms_lines = []
    pos = 2
    for g in GUIDES_DATA:
        html = render(g)
        out = GUIDES / f"{g['slug']}.html"
        out.write_text(html, encoding="utf-8")
        cn = count_cn_in_article(html)
        results.append((g["slug"], cn, out))
        print(f"wrote {out.name} chinese={cn}")
        if cn < 2500:
            print(f"  WARNING under 2500")

        meta_list.append(
            {
                "id": g["slug"],
                "slug": g["slug"],
                "tag": g["tag"],
                "type": "howto",
                "title": g["title"],
                "description": g["description"],
                "path": f"guides/{g['slug']}.html",
                "primaryTool": g["primary_tool_file"],
                "relatedTools": g["related_tools"],
                "relatedGuides": [],
                "datePublished": DATE,
                "dateModified": DATE,
                "readingMinutes": 12,
                "keywords": g["keywords"],
            }
        )
        cards.append(
            card(
                icons.get(g["slug"], "📘"),
                f"/guides/{g['slug']}",
                g["title"],
                g["card_desc"],
                g["tag"],
                12,
                g["tool_path"],
                g.get("card_tool_label", f"打开{g['tool_name']}"),
            )
        )
        ld_items.append(
            {
                "@type": "ListItem",
                "position": pos,
                "name": g["title"],
                "url": f"{SITE}/guides/{g['slug']}",
            }
        )
        pos += 1
        llms_lines.append(
            f"- [{g['llms_title']}]({SITE}/guides/{g['slug']}): {g['llms_blurb']}\n"
        )

    update_guides_json(meta_list)
    n = 1 + len(GUIDES_DATA)
    update_index("\n".join(cards), n, dumps(ld_items))
    update_llms(llms_lines)

    # cleanup temp style extract optional
    print("guides.json entries:", n)
    print("done")


if __name__ == "__main__":
    main()
