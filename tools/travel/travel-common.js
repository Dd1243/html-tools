(function () {
  "use strict";

  const head = document.head;
  const docTitle = document.title || "旅行工具 - WebUtils";
  const metaDescription =
    (head.querySelector('meta[name="description"]')?.getAttribute("content") || "") ||
    `${docTitle}：为旅行者准备的实用在线工具，覆盖预算、换汇、时差、保险、行李、签证等常见出行场景。`;
  const canonicalLink =
    head.querySelector('link[rel="canonical"]')?.getAttribute("href") ||
    window.location.origin + window.location.pathname.replace(/\.html$/, "");

  function ensureMeta(selector, attrs) {
    let node = head.querySelector(selector);
    if (!node) {
      node = document.createElement("meta");
      Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
      head.appendChild(node);
    } else {
      Object.entries(attrs).forEach(([k, v]) => {
        if (!node.getAttribute(k)) node.setAttribute(k, v);
      });
    }
  }

  function ensureLink(rel, href) {
    let link = head.querySelector(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", rel);
      link.setAttribute("href", href);
      head.appendChild(link);
    }
  }

  function ensureOg(property, content) {
    if (!content) return;
    let node = head.querySelector(`meta[property="${property}"]`);
    if (!node) {
      node = document.createElement("meta");
      node.setAttribute("property", property);
      node.setAttribute("content", content);
      head.appendChild(node);
    } else if (!node.getAttribute("content")) {
      node.setAttribute("content", content);
    }
  }

  function ensureTwitter(name, content) {
    if (!content) return;
    let node = head.querySelector(`meta[name="${name}"]`);
    if (!node) {
      node = document.createElement("meta");
      node.setAttribute("name", name);
      node.setAttribute("content", content);
      head.appendChild(node);
    } else if (!node.getAttribute("content")) {
      node.setAttribute("content", content);
    }
  }

  function ensureJsonLd() {
    const hasLd = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).some((s) => {
      try {
        const data = JSON.parse(s.textContent || "{}");
        if (Array.isArray(data['@graph'])) return data['@graph'].some((n) => n['@type'] === 'WebApplication');
        return data['@type'] === 'WebApplication';
      } catch (e) {
        return false;
      }
    });
    if (hasLd) return;

    const ld = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "首页", "item": "https://essays4u.net/" },
            { "@type": "ListItem", "position": 2, "name": "旅行工具", "item": "https://essays4u.net/#travel" },
            { "@type": "ListItem", "position": 3, "name": docTitle.replace(/ - .*$/, ''), "item": canonicalLink.endsWith('.html') ? canonicalLink : `${canonicalLink}.html` }
          ]
        },
        {
          "@type": "WebApplication",
          "name": docTitle,
          "description": metaDescription,
          "url": canonicalLink,
          "applicationCategory": "TravelApplication",
          "operatingSystem": "Web",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CNY" }
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": `${docTitle}解决什么问题？`,
              "acceptedAnswer": { "@type": "Answer", "text": `${docTitle}用来解决旅行中的特定痛点，例如预算、换汇、行程计划或出入境政策查询，提供可直接操作的表单和计算。` }
            },
            {
              "@type": "Question",
              "name": "如何使用本工具？",
              "acceptedAnswer": { "@type": "Answer", "text": "在页面顶部填写所需字段，调整参数后实时看到计算或提示，支持桌面和移动端并可保存主题偏好。" }
            },
            {
              "@type": "Question",
              "name": "是否需要付费或登录？",
              "acceptedAnswer": { "@type": "Answer", "text": "本工具完全免费，无需注册登录，数据仅在浏览器本地处理，不会上传服务器。" }
            }
          ]
        }
      ]
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(ld);
    head.appendChild(script);
  }

  function insertStyles() {
    if (document.getElementById("travel-common-style")) return;
    const style = document.createElement("style");
    style.id = "travel-common-style";
    style.textContent = `
      .ad-slot {margin: 16px 0; padding: 16px; border: 1px dashed var(--border-subtle, #2a2a3a); border-radius: 12px; background: var(--bg-surface, #12121a); color: var(--text-muted, #6b7280); text-align: center; font-size: 0.9rem;}
      .ad-slot strong {color: var(--text-primary, #e8e8ed);}
      .seo-article {margin-top: 32px; padding: 24px; border: 1px solid var(--border-subtle, #2a2a3a); border-radius: 14px; background: var(--bg-surface, #12121a); box-shadow: var(--shadow, 0 2px 8px rgba(0,0,0,0.25));}
      .seo-article h2 {font-size: 1.25rem; margin-bottom: 12px; font-weight: 700;}
      .seo-article p {margin-bottom: 12px; color: var(--text-secondary, #9ca3af); line-height: 1.7;}
      .seo-article ul {margin: 12px 0 12px 20px; color: var(--text-secondary, #9ca3af);}
      .seo-article li {margin-bottom: 6px;}
      .seo-article .highlight {color: var(--accent-cyan, #00f5d4);}
      @media (max-width: 640px) { .seo-article {padding: 18px;} .ad-slot {padding: 14px;} }
    `;
    head.appendChild(style);
  }

  function insertAdSlots() {
    const container =
      document.querySelector(".main-content") ||
      document.querySelector(".container") ||
      document.body;

    const existing = container.querySelector(".ad-slot");
    if (!existing) {
      const topAd = document.createElement("div");
      topAd.className = "ad-slot ad-slot--top";
      topAd.setAttribute("role", "complementary");
      topAd.setAttribute("aria-label", "广告位（占位）");
      topAd.innerHTML = "<strong>AdSense 预留位</strong><div>在部署时替换为真实的 Google AdSense 代码，尺寸可自适应。</div>";
      container.insertBefore(topAd, container.firstChild);
    }

    const bottomAd = document.createElement("div");
    bottomAd.className = "ad-slot ad-slot--bottom";
    bottomAd.setAttribute("role", "complementary");
    bottomAd.setAttribute("aria-label", "广告位（占位）");
    bottomAd.innerHTML = "<strong>AdSense 预留位</strong><div>支持响应式广告或原生信息流广告。</div>";
    container.appendChild(bottomAd);
  }

  function buildArticle() {
    const container =
      document.querySelector(".main-content") ||
      document.querySelector(".container") ||
      document.body;
    if (container.querySelector(".seo-article")) return;

    const article = document.createElement("section");
    article.className = "seo-article";
    const topic = docTitle.replace(" - WebUtils", "");
    article.innerHTML = `
      <h2>${topic}：实用指南与常见问题</h2>
      <p>${metaDescription}</p>
      <p>${topic} 重点解决出行前后的实际问题。你可以在桌面端或手机端直接填写表单、点击按钮完成计算或查询，结果即时呈现，无需登录、无需安装应用，适合出国自由行、差旅报销、亲子旅行、留学访学等多种场景。</p>
      <p>在使用时，建议按照页面顺序逐项操作：先输入必填参数，再调整可选项；若页面提供分享或保存功能，可将状态复制给同行伙伴；如涉及金额、汇率、时差或单位换算，请确认出发地与目的地的时间、货币单位，以免出现计算误差。</p>
      <p class="highlight">专业建议：保持票据、行程单、保险单等资料电子备份；在机场、车站或跨境场景下，预留 10-20% 的时间与预算做缓冲；如工具涉及健康或证件信息，请核对官方最新要求。</p>
      <ul>
        <li>适用设备：完全响应式设计，兼容手机、平板与桌面。</li>
        <li>隐私友好：数据在浏览器本地处理，不做服务器存储。</li>
        <li>拓展能力：如需更多功能，可结合页面内的复制、分享、导出等按钮使用。</li>
      </ul>
      <p>如果你要在不同国家或城市间切换，建议结合本页面下方的常见问答，快速排查行李、签证、保险、交通、预算等潜在风险；如有团队旅行需求，可以把同一套输入参数保存并分享给同伴，以减少沟通成本。</p>
    `;

    container.appendChild(article);
  }

  function enhanceHead() {
    ensureMeta('meta[http-equiv="X-UA-Compatible"]', { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' });
    ensureMeta('meta[name="referrer"]', { name: 'referrer', content: 'strict-origin-when-cross-origin' });
    ensureMeta('meta[name="color-scheme"]', { name: 'color-scheme', content: 'dark light' });
    ensureMeta('meta[name="theme-color"]', { name: 'theme-color', content: '#0a0a0f' });
    ensureMeta('meta[name="format-detection"]', { name: 'format-detection', content: 'telephone=no,email=no' });
    ensureLink('canonical', canonicalLink);

    ensureOg('og:title', docTitle);
    ensureOg('og:description', metaDescription);
    ensureOg('og:type', 'website');
    ensureOg('og:url', canonicalLink);
    ensureOg('og:site_name', 'WebUtils');
    ensureOg('og:locale', 'zh_CN');
    ensureOg('og:image', 'https://essays4u.net/social-preview.png');
    ensureOg('og:image:width', '1280');
    ensureOg('og:image:height', '640');
    ensureOg('og:image:type', 'image/png');

    ensureTwitter('twitter:card', 'summary');
    ensureTwitter('twitter:title', docTitle);
    ensureTwitter('twitter:description', metaDescription);
    ensureTwitter('twitter:image', 'https://essays4u.net/social-preview.png');

    ensureJsonLd();
  }

  function run() {
    try {
      insertStyles();
      enhanceHead();
      insertAdSlots();
      buildArticle();
    } catch (error) {
      console.error("travel-common enhance error", error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
})();
