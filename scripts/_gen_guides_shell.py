# -*- coding: utf-8 -*-
"""Generate 10 unique WebUtils guide HTML pages + update index/json/llms."""
from __future__ import annotations
import json
import re
from pathlib import Path

ROOT = Path(r"e:\html-tools")
GUIDES = ROOT / "guides"
STYLE = (GUIDES / "_shell_style.txt").read_text(encoding="utf-8")
DATE = "2026-08-07"
SITE = "https://essays4u.net"


def esc(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def count_cn(html: str) -> int:
    plain = re.sub(r"<script[\s\S]*?</script>", " ", html, flags=re.I)
    plain = re.sub(r"<style[\s\S]*?</style>", " ", plain, flags=re.I)
    plain = re.sub(r"<[^>]+>", " ", plain)
    plain = re.sub(r"&[a-zA-Z]+;", " ", plain)
    plain = re.sub(r"&#\d+;", " ", plain)
    return len(re.findall(r"[\u4e00-\u9fff]", plain))


def faq_ld(faqs):
    ents = []
    for q, a in faqs:
        ents.append(
            {
                "@type": "Question",
                "name": q,
                "acceptedAnswer": {"@type": "Answer", "text": a},
            }
        )
    return json.dumps(
        {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": ents},
        ensure_ascii=False,
        indent=2,
    )


def howto_ld(name, desc, steps, tool_url):
    step_objs = []
    for i, (n, t) in enumerate(steps):
        o = {"@type": "HowToStep", "name": n, "text": t}
        if i == 0:
            o["url"] = tool_url
        step_objs.append(o)
    return json.dumps(
        {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": name,
            "description": desc,
            "totalTime": "PT12M",
            "step": step_objs,
        },
        ensure_ascii=False,
        indent=2,
    )


def render_page(g: dict) -> str:
    slug = g["slug"]
    title = g["title"]
    desc = g["description"]
    keywords = g["keywords"]
    tag = g["tag"]
    tool_path = g["tool_path"]  # /tools/...
    tool_name = g["tool_name"]
    tool_cta = g["tool_cta"]
    lead = g["lead"]
    toc = g["toc"]  # list of (id, label)
    body = g["body"]  # HTML inside article-main
    faqs = g["faqs"]
    howto_steps = g["howto_steps"]
    side_btn = g.get("side_btn", f"打开{tool_name}")
    short_crumb = g.get("short_crumb", title.split("：")[0] if "：" in title else title[:20])

    toc_items = "\n".join(f'              <li><a href="#{i}">{esc(l)}</a></li>' for i, l in toc)
    faq_html_parts = []
    for q, a in faqs:
        faq_html_parts.append(
            f"""              <div class="faq-item">
                <h3>{esc(q)}</h3>
                <p>{a}</p>
              </div>"""
        )
    # body already includes faq section placeholder? We inject FAQ into body via {FAQ} or append
    if "{FAQ_BLOCK}" in body:
        body = body.replace("{FAQ_BLOCK}", "\n".join(faq_html_parts))
    else:
        body = body + f"""
            <section class="card" id="faq">
              <h2>常见问题</h2>
{chr(10).join(faq_html_parts)}
            </section>
"""

    tech = json.dumps(
        {
            "@context": "https://schema.org",
            "@type": "TechArticle",
            "headline": title,
            "description": desc,
            "datePublished": DATE,
            "dateModified": DATE,
            "author": {"@type": "Organization", "name": "WebUtils"},
            "publisher": {
                "@type": "Organization",
                "name": "WebUtils",
                "url": f"{SITE}/",
            },
            "mainEntityOfPage": f"{SITE}/guides/{slug}",
        },
        ensure_ascii=False,
        indent=2,
    )
    bread = json.dumps(
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "首页", "item": f"{SITE}/"},
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "使用指南",
                    "item": f"{SITE}/guides/",
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": short_crumb,
                    "item": f"{SITE}/guides/{slug}",
                },
            ],
        },
        ensure_ascii=False,
        indent=2,
    )
    howto = howto_ld(
        g.get("howto_name", f"如何使用{tool_name}"),
        g.get("howto_desc", desc),
        howto_steps,
        f"{SITE}{tool_path}",
    )
    faqj = faq_ld(faqs)

    return f"""<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{esc(title)} - WebUtils</title>
    <meta name="description" content="{esc(desc)}" />
    <meta name="robots" content="index,follow" />
    <meta name="author" content="WebUtils" />
    <meta name="keywords" content="{esc(keywords)}" />
    <link rel="canonical" href="{SITE}/guides/{slug}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="{esc(title)} - WebUtils" />
    <meta property="og:description" content="{esc(desc)}" />
    <meta property="og:url" content="{SITE}/guides/{slug}" />
    <meta property="og:site_name" content="WebUtils" />
    <meta property="og:locale" content="zh_CN" />
    <meta property="og:image" content="{SITE}/social-preview.png" />
    <meta property="article:published_time" content="{DATE}" />
    <meta property="article:modified_time" content="{DATE}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{esc(title)} - WebUtils" />
    <meta name="twitter:description" content="{esc(desc)}" />
    <meta name="twitter:image" content="{SITE}/social-preview.png" />
    <script type="application/ld+json">
{tech}
    </script>
    <script type="application/ld+json">
{howto}
    </script>
    <script type="application/ld+json">
{bread}
    </script>
    <script type="application/ld+json">
{faqj}
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
          <li><span>{esc(short_crumb)}</span></li>
        </ol>
      </nav>

      <article>
        <header class="article-hero">
          <h1>{esc(title)}</h1>
          <div class="meta-row">
            <span class="pill">更新 {DATE}</span>
            <span class="pill">约 12 分钟</span>
            <span class="pill">{esc(tag)}</span>
            <span class="pill">How-to</span>
          </div>
          <p class="lead">
            {lead}
          </p>
          <div class="cta">
            <div class="cta-copy">
              <strong>立即使用相关工具</strong>
              <span>{esc(tool_cta)}</span>
            </div>
            <a class="cta-btn" href="{tool_path}">打开工具 →</a>
          </div>
        </header>

        <div class="article-layout">
          <div class="article-main">
{body}
          </div>

          <aside class="toc-rail">
            <h2>目录</h2>
            <ol class="toc-list">
{toc_items}
              <li><a href="#faq">常见问题</a></li>
            </ol>
            <div class="side-cta">
              <h3>相关工具</h3>
              <a href="{tool_path}" class="btn btn-primary" style="width:100%;">{esc(side_btn)}</a>
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


# Content modules will be imported from generate_guides_bodies.py
print("shell ok")
