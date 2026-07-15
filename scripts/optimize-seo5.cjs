/**
 * Optimize 5 pages:
 * - tools/seo/image-alt-checker.html  (expand SEO article)
 * - tools/seo/og-preview.html         (expand SEO article)
 * - tools/seo/meta-tags-generator.html (layout/SEO)
 * - tools/seo/robots-generator.html    (layout/SEO)
 * - tools/extractor/favicon-extractor.html (layout/SEO)
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

function padDesc(parts) {
  let d = parts.join('');
  const pad = '免费在线使用，结果仅供参考。';
  while (d.length < 120) d += pad;
  if (d.length > 160) d = d.slice(0, 160);
  return d;
}

function setMeta(html, { title, desc, canonical, ogTitle }) {
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  if (/name="description"/i.test(html)) {
    html = html.replace(
      /(<meta\s+name="description"\s+content=")[^"]*(")/i,
      `$1${desc}$2`
    );
  } else {
    html = html.replace(
      /<meta name="viewport"[^>]*>/i,
      (m) => `${m}\n    <meta name="description" content="${desc}" />`
    );
  }
  for (const prop of [
    ['property="og:description"', desc],
    ['name="twitter:description"', desc],
    ['property="twitter:description"', desc],
  ]) {
    const re = new RegExp(`(<meta\\s+[^>]*${prop[0]}[^>]*content=")[^"]*(")`, 'i');
    if (re.test(html)) html = html.replace(re, `$1${prop[1]}$2`);
  }
  if (ogTitle) {
    html = html.replace(
      /(<meta\s+property="og:title"\s+content=")[^"]*(")/i,
      `$1${ogTitle}$2`
    );
    html = html.replace(
      /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/i,
      `$1${ogTitle}$2`
    );
  }
  if (canonical) {
    if (/rel="canonical"/i.test(html)) {
      html = html.replace(
        /(<link\s+rel="canonical"\s+href=")[^"]*(")/i,
        `$1${canonical}$2`
      );
    }
  }
  return html;
}

function upsertLd(html, ld) {
  const block =
    '<script type="application/ld+json">\n' +
    JSON.stringify(ld, null, 2) +
    '\n    </script>';
  if (/application\/ld\+json/i.test(html)) {
    let n = 0;
    html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, () => {
      n += 1;
      return n === 1 ? block : '';
    });
  } else {
    html = html.replace('</head>', block + '\n  </head>');
  }
  return html;
}

function injectCss(html, css) {
  if (html.includes('/* seo5 polish */')) {
    return html.replace(/\/\* seo5 polish \*\/[\s\S]*?(?=<\/style>)/i, css + '\n    ');
  }
  if (/<\/style>/i.test(html)) {
    return html.replace('</style>', css + '\n    </style>');
  }
  return html.replace('</head>', `<style>${css}</style>\n  </head>`);
}

const POLISH_CSS = `
/* seo5 polish */
.seo-content, .seo-article, .article-content, .tool-guide {
  margin-top: 28px;
  padding: 22px 22px 24px;
  border: 1px solid var(--border-default, var(--border-subtle, #e5e7eb));
  border-radius: 16px;
  background: var(--bg-card, var(--color-bg-card, #fff));
  box-shadow: 0 6px 24px rgba(15,23,42,.05);
  line-height: 1.85;
}
.seo-content h2, .seo-article h2, .article-content h2, .tool-guide h2 {
  font-size: 1.2rem;
  margin: 1.2rem 0 .55rem;
}
.seo-content h2:first-child, .seo-article h2:first-child, .article-content h2:first-child {
  margin-top: 0;
}
.seo-content h3, .seo-article h3, .article-content h3 {
  font-size: 1.05rem;
  margin: 1rem 0 .4rem;
}
.seo-content p, .seo-article p, .article-content p,
.seo-content li, .seo-article li, .article-content li {
  color: var(--color-text-secondary, var(--text-secondary, #475569));
}
.seo-content ul, .seo-article ul, .article-content ul,
.seo-content ol, .seo-article ol, .article-content ol {
  margin: 0 0 1rem 1.15rem;
}
.seo-side {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin: 20px 0;
}
@media (min-width: 900px) {
  .seo-side { grid-template-columns: 1fr 1fr 1fr; }
}
.seo-side .seo-card {
  border: 1px solid var(--border-default, var(--border-subtle, #e5e7eb));
  border-radius: 14px;
  padding: 14px;
  background: var(--bg-card, #fff);
}
.seo-side h2 { font-size: 1rem; margin: 0 0 8px; }
.seo-side ol, .seo-side ul { margin: 0 0 0 1.1rem; font-size: .9rem; }
.related-tools { display: flex; flex-wrap: wrap; gap: 8px; }
.related-tools a {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--border-default, #e5e7eb);
  text-decoration: none;
  color: var(--color-text-muted, #64748b);
  font-size: .85rem;
  background: var(--bg-input, #f8fafc);
}
.related-tools a:hover { color: var(--color-accent-cyan, #0ea5e9); border-color: currentColor; }
.breadcrumb a[href="/tools/seo/"],
.breadcrumb a[href="/tools/extractor/"] { font-weight: 500; }
`;

function sideBlock(how, faq, related) {
  return `
      <section class="seo-side" aria-label="使用提示">
        <div class="seo-card">
          <h2>怎么用</h2>
          <ol>
            ${how.map((x) => `<li>${x}</li>`).join('\n            ')}
          </ol>
        </div>
        <div class="seo-card">
          <h2>常见问题</h2>
          <ul>
            ${faq.map(([q, a]) => `<li><strong>${q}</strong> ${a}</li>`).join('\n            ')}
          </ul>
        </div>
        <div class="seo-card">
          <h2>相关工具</h2>
          <div class="related-tools">
            ${related.map((r) => `<a href="${r.href}">${r.name}</a>`).join('\n            ')}
          </div>
        </div>
      </section>`;
}

function fixSeoBreadcrumb(html) {
  // tools-directory labeled as SEO工具 -> /tools/seo/
  html = html.replace(
    /<a href="\/tools-directory">SEO工具<\/a>/gi,
    '<a href="/tools/seo/">SEO工具</a>'
  );
  html = html.replace(
    /href="\/#seo"/gi,
    'href="/tools/seo/"'
  );
  html = html.replace(
    /href="\/#extractor"/gi,
    'href="/tools/extractor/"'
  );
  html = html.replace(
    /href="\.\.\/\.\.\/"/g,
    'href="/"'
  );
  return html;
}

// ================= image-alt-checker =================
function fixImageAlt() {
  const fp = path.join(root, 'tools/seo/image-alt-checker.html');
  let html = fs.readFileSync(fp, 'utf8');
  const desc = padDesc([
    '免费图片 Alt 属性检查器：粘贴 HTML 批量检测缺失/空 Alt，输出 SEO 完整度评分与列表；',
    '浏览器本地分析不上传，适合图片 SEO 与无障碍优化。',
  ]);
  html = setMeta(html, {
    title: '图片 Alt 属性检查器 - 批量检测缺失 Alt 与 SEO 评分 | WebUtils',
    desc,
    canonical: 'https://essays4u.net/tools/seo/image-alt-checker',
    ogTitle: '图片 Alt 属性检查器 - 批量检测缺失 Alt',
  });
  html = fixSeoBreadcrumb(html);
  html = injectCss(html, POLISH_CSS);

  const faqs = [
    ['空 Alt 和缺失 Alt 有何区别？', '空 alt="" 常用于装饰图；完全没有 alt 属性通常是问题。'],
    ['评分怎么算？', '按有 Alt / 空 Alt / 缺失 Alt 的占比估算完整度。'],
    ['数据会上传吗？', '不会，HTML 在浏览器本地解析。'],
    ['支持整站扫描吗？', '当前粘贴 HTML 片段/页面源码分析，不是整站爬虫。'],
  ];
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: '图片 Alt 属性检查器',
        url: 'https://essays4u.net/tools/seo/image-alt-checker',
        description: desc,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        inLanguage: 'zh-CN',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        featureList: ['批量解析 img', '缺失/空 Alt 统计', 'SEO 评分', '列表筛选', '本地分析'],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页', item: 'https://essays4u.net/' },
          { '@type': 'ListItem', position: 2, name: 'SEO工具', item: 'https://essays4u.net/tools/seo/' },
          {
            '@type': 'ListItem',
            position: 3,
            name: '图片 Alt 属性检查器',
            item: 'https://essays4u.net/tools/seo/image-alt-checker',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  };
  html = upsertLd(html, ld);

  const article = `
      ${sideBlock(
        [
          '粘贴包含 &lt;img&gt; 的 HTML 源码',
          '点击「立即分析图片属性」',
          '查看评分与缺失/空 Alt 统计',
          '用筛选标签定位问题图片并回改源码',
        ],
        faqs,
        [
          { href: '/tools/seo/meta-tags-generator', name: 'Meta 标签生成' },
          { href: '/tools/seo/og-preview', name: 'OG 预览' },
          { href: '/tools/seo/heading-analyzer', name: '标题结构分析' },
          { href: '/tools/seo/', name: 'SEO 工具分类' },
        ]
      )}
      <section class="seo-content" aria-label="图片 Alt SEO 指南">
        <h2>什么是图片 Alt 属性？</h2>
        <p>Alt（Alternative text）是 <code>&lt;img&gt;</code> 的替代文本。图片加载失败、用户使用屏幕阅读器，或搜索引擎抓取图片时，都会依赖它理解图片含义。对 SEO 而言，Alt 是图片进入图片搜索结果的重要信号；对无障碍（a11y）而言，它是合规与体验的基础。</p>

        <h2>本工具做什么？</h2>
        <p>把页面 HTML 粘贴进来后，工具会解析所有 <code>img</code> 标签，统计：</p>
        <ul>
          <li><strong>正常 Alt：</strong>存在且非空，可读描述</li>
          <li><strong>空 Alt：</strong><code>alt=""</code>，常用于装饰性图片</li>
          <li><strong>缺失 Alt：</strong>完全没有 alt 属性（优先修复）</li>
        </ul>
        <p>同时给出 SEO 完整度评分，并支持按状态筛选图片列表，方便对照修复。</p>

        <h2>写作规范：好的 Alt 长什么样？</h2>
        <ul>
          <li><strong>描述内容，而不是文件名：</strong>写「红色跑鞋侧视图」，不要写「IMG_1234」。</li>
          <li><strong>简洁准确：</strong>一般 5–15 个中文词/短语足够，避免段落堆砌。</li>
          <li><strong>自然含关键词：</strong>可融入页面主题词，但禁止关键词堆砌。</li>
          <li><strong>装饰图用空 Alt：</strong>纯分割线、背景纹理等无信息图片用 <code>alt=""</code>。</li>
          <li><strong>功能图要说结果：</strong>按钮图标写「提交订单」，不要只写「图标」。</li>
        </ul>

        <h2>常见错误</h2>
        <ol>
          <li>大量图片缺失 alt，尤其是 CMS 上传后忘记填写</li>
          <li>所有图片都写同一句「产品图片」</li>
          <li>把整段广告文案塞进 alt</li>
          <li>把重要信息只放在图里、正文不重复（无障碍与 SEO 双输）</li>
          <li>把装饰图写成很长描述，屏幕阅读器噪音大</li>
        </ol>

        <h2>推荐工作流</h2>
        <ol>
          <li>浏览器打开目标页 → 查看源代码 / 导出 HTML 片段</li>
          <li>粘贴到本工具，先处理「缺失 Alt」</li>
          <li>再审查「空 Alt」是否真为装饰图</li>
          <li>对内容图补写准确描述，回填 CMS 或代码</li>
          <li>上线后用搜索控制台关注图片展现与可访问性抽检</li>
        </ol>

        <h2>与 Core Web / 无障碍的关系</h2>
        <p>Alt 本身不直接等于 LCP 分数，但图片优化常与尺寸、懒加载、格式（WebP/AVIF）一起做。无障碍审计（如 WCAG）会检查有意义的替代文本。本工具聚焦「有没有写好 Alt」，不替代完整可访问性审计。</p>

        <h2>能力边界</h2>
        <ul>
          <li>不爬取整站，需你提供 HTML</li>
          <li>不自动改写线上代码，只做检测与评分</li>
          <li>不判断 alt 文案是否“足够好”，只区分有/空/无</li>
          <li>分析在浏览器本地完成，默认不上传你的源码</li>
        </ul>

        <h3>FAQ</h3>
        ${faqs.map(([q, a]) => `<p><strong>${q}</strong> ${a}</p>`).join('\n        ')}
      </section>`;

  if (/<section class="seo-content"[\s\S]*?<\/section>/i.test(html)) {
    html = html.replace(/<section class="seo-content"[\s\S]*?<\/section>/i, article.trim());
  } else {
    html = html.replace(/<\/main>/i, `</main>\n${article}`);
  }

  fs.writeFileSync(fp, html, 'utf8');
  return desc;
}

// ================= og-preview =================
function fixOgPreview() {
  const fp = path.join(root, 'tools/seo/og-preview.html');
  let html = fs.readFileSync(fp, 'utf8');
  const desc = padDesc([
    '免费 Open Graph 预览器：输入 URL 模拟 Facebook、X、LinkedIn、Slack 分享卡片，',
    '查看标题描述图片与优化建议，适合社交 SEO 与分享效果检查。',
  ]);
  html = setMeta(html, {
    title: 'Open Graph 预览器 - 社交分享卡片模拟与 OG 检查 | WebUtils',
    desc,
    canonical: 'https://essays4u.net/tools/seo/og-preview',
    ogTitle: 'Open Graph 预览器 - 社交分享卡片模拟',
  });
  html = fixSeoBreadcrumb(html);
  html = injectCss(html, POLISH_CSS);

  const faqs = [
    ['为什么有时是示例数据？', '跨域限制下无法直接抓取任意站点时，会用示例演示预览结构。'],
    ['OG 和 Twitter Card 一样吗？', '不完全一样；Twitter 可复用 OG，也可单独设置 twitter: 标签。'],
    ['图片尺寸建议？', '常用 1200×630，保证大图预览与裁切安全区。'],
    ['改完标签立刻生效吗？', '平台常有缓存，可用调试工具强制刷新。'],
  ];
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'Open Graph 预览器',
        url: 'https://essays4u.net/tools/seo/og-preview',
        description: desc,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        inLanguage: 'zh-CN',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        featureList: ['多平台预览', 'Meta 标签表', 'SEO 建议', '历史记录'],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页', item: 'https://essays4u.net/' },
          { '@type': 'ListItem', position: 2, name: 'SEO工具', item: 'https://essays4u.net/tools/seo/' },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Open Graph 预览器',
            item: 'https://essays4u.net/tools/seo/og-preview',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  };
  html = upsertLd(html, ld);

  const article = `
      ${sideBlock(
        [
          '输入完整 https URL',
          '点击获取预览',
          '对比 FB / X / LinkedIn / Slack 卡片',
          '根据建议优化 title、description、image',
        ],
        faqs,
        [
          { href: '/tools/seo/meta-tags-generator', name: 'Meta 标签生成' },
          { href: '/tools/seo/image-alt-checker', name: '图片 Alt 检查' },
          { href: '/tools/generator/placeholder-image', name: '占位图生成' },
          { href: '/tools/seo/', name: 'SEO 工具分类' },
        ]
      )}
      <section class="seo-content" aria-label="Open Graph 完整指南">
        <h2>什么是 Open Graph？</h2>
        <p>Open Graph（OG）是一套网页元数据协议，用于控制链接在社交媒体中的展示：标题、描述、图片、类型与站点名。写在 HTML <code>&lt;head&gt;</code> 的 <code>og:*</code> 标签里。没有 OG 时，平台可能随意截取正文，导致分享卡片难看、点击率低。</p>

        <h2>核心标签清单</h2>
        <ul>
          <li><code>og:title</code>：分享标题，建议突出价值，避免过长截断</li>
          <li><code>og:description</code>：补充说明，约 70–200 字符可视平台而定</li>
          <li><code>og:image</code>：预览大图，优先 HTTPS 绝对地址</li>
          <li><code>og:url</code>：规范链接，减少参数页重复</li>
          <li><code>og:type</code>：如 website、article</li>
          <li><code>og:site_name</code>：品牌/站点名</li>
          <li><code>twitter:card</code>：summary 或 summary_large_image</li>
        </ul>

        <h2>多平台差异</h2>
        <p><strong>Facebook / LinkedIn</strong> 更依赖 OG 图片比例；<strong>X（Twitter）</strong> 可用 Twitter Card；<strong>Slack</strong> 常展示站点色与摘要。同一组标签很难在所有平台都完美，但统一高质量图 + 清晰标题通常足够。</p>

        <h2>优化清单</h2>
        <ol>
          <li>标题前 40–60 字符包含核心信息</li>
          <li>描述写清「对谁有用 + 能得到什么」</li>
          <li>图片 1200×630，文字少、主体居中，避免贴边裁切</li>
          <li>og:url 与 canonical 一致</li>
          <li>改版后用平台调试工具清缓存再测</li>
        </ol>

        <h2>常见问题排查</h2>
        <ul>
          <li>图片不显示：相对路径、防盗链、体积过大、非 HTTPS</li>
          <li>标题旧：平台缓存未刷新</li>
          <li>多套冲突标签：CMS 插件重复输出</li>
          <li>SPA 站点：首屏 HTML 未渲染 meta，爬虫只看到壳</li>
        </ul>

        <h2>本工具如何使用</h2>
        <p>输入 URL 后查看多平台预览与标签表，根据建议回改站点模板。受浏览器跨域限制，部分网址可能无法实时抓取，此时会展示结构示例，便于你对照自有标签。</p>

        <h2>与 SEO 的关系</h2>
        <p>OG 主要影响社交分发与点击，不直接等于 Google 排名因素；但更高的分享点击会带来流量与品牌搜索。建议与 title/description、结构化数据一起维护。</p>

        <h3>FAQ</h3>
        ${faqs.map(([q, a]) => `<p><strong>${q}</strong> ${a}</p>`).join('\n        ')}
      </section>`;

  if (/<section class="seo-content"[\s\S]*?<\/section>/i.test(html)) {
    html = html.replace(/<section class="seo-content"[\s\S]*?<\/section>/i, article.trim());
  } else {
    html = html.replace(/<\/main>/i, `</main>\n${article}`);
  }

  fs.writeFileSync(fp, html, 'utf8');
  return desc;
}

// ================= meta-tags-generator =================
function fixMetaTags() {
  const fp = path.join(root, 'tools/seo/meta-tags-generator.html');
  let html = fs.readFileSync(fp, 'utf8');
  const desc = padDesc([
    '免费 Meta 标签生成器：填写标题描述与社交字段，实时生成 HTML head 代码，',
    '支持 Google/社交预览与一键复制，适合页面 SEO 与分享优化。',
  ]);
  html = setMeta(html, {
    title: 'Meta 标签生成器 - Title/Description/OG 一键生成 | WebUtils',
    desc,
    canonical: 'https://essays4u.net/tools/seo/meta-tags-generator',
    ogTitle: 'Meta 标签生成器 - Title/Description/OG 一键生成',
  });
  html = fixSeoBreadcrumb(html);
  html = injectCss(html, POLISH_CSS);

  // breadcrumb if missing category link
  if (!html.includes('/tools/seo/') && html.includes('breadcrumb')) {
    html = html.replace(
      /(<nav class="breadcrumb"[\s\S]*?)(<\/nav>)/i,
      `$1<a href="/tools/seo/">SEO工具</a> / $2`
    );
  }

  const faqs = [
    ['Title 多长合适？', '常见建议约 50–60 字符，保证前半段信息完整。'],
    ['Description 会被直接当排名因素吗？', '更影响点击率展示，仍需与内容一致。'],
    ['生成代码放哪？', '放在页面 HTML 的 head 中，避免重复输出。'],
    ['OG 图片必须填吗？', '社交分享强烈建议填写绝对 URL 图片。'],
  ];
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'Meta 标签生成器',
        url: 'https://essays4u.net/tools/seo/meta-tags-generator',
        description: desc,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        inLanguage: 'zh-CN',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        featureList: ['Title/Description', 'Open Graph', 'Twitter Card', '实时预览', '复制代码'],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页', item: 'https://essays4u.net/' },
          { '@type': 'ListItem', position: 2, name: 'SEO工具', item: 'https://essays4u.net/tools/seo/' },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Meta 标签生成器',
            item: 'https://essays4u.net/tools/seo/meta-tags-generator',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  };
  html = upsertLd(html, ld);

  const article = `
      ${sideBlock(
        [
          '填写页面标题与描述',
          '补充 URL、站点名与社交图片',
          '查看搜索/社交预览',
          '复制生成的 meta 代码到 head',
        ],
        faqs,
        [
          { href: '/tools/seo/og-preview', name: 'OG 预览' },
          { href: '/tools/seo/robots-generator', name: 'Robots 生成' },
          { href: '/tools/seo/image-alt-checker', name: '图片 Alt 检查' },
          { href: '/tools/seo/', name: 'SEO 工具分类' },
        ]
      )}
      <article class="seo-article" aria-label="Meta 标签指南">
        <h2>Meta 标签生成器能解决什么？</h2>
        <p>每个重要页面都需要清晰的 <code>title</code>、<code>description</code>，以及面向社交平台的 Open Graph / Twitter 标签。手动拼写容易漏字段、长度失控或重复输出。本工具把常用字段表单化，实时生成可复制的 HTML 片段，并提供搜索结果与社交卡片预览。</p>

        <h2>必填与建议字段</h2>
        <ul>
          <li><strong>title：</strong>页面主标题，品牌名可放后段</li>
          <li><strong>description：</strong>120–160 字中文更稳妥，写清受众与价值</li>
          <li><strong>canonical / og:url：</strong>指定规范地址</li>
          <li><strong>og:image / twitter:image：</strong>绝对路径大图</li>
          <li><strong>robots：</strong>按需 index/follow 或 noindex</li>
        </ul>

        <h2>最佳实践</h2>
        <ol>
          <li>一页一 title，避免整站同名</li>
          <li>description 与首屏内容一致，拒绝标题党</li>
          <li>模板站注意分页、筛选页的 noindex 策略</li>
          <li>生成后用实机分享测试，并清理平台缓存</li>
        </ol>

        <h2>常见坑</h2>
        <ul>
          <li>CMS 主题与插件各输出一套 meta，互相覆盖</li>
          <li>SPA 仅客户端注入，爬虫看不到</li>
          <li>图片用相对路径导致社交抓取失败</li>
          <li>中英文长度混算导致截断</li>
        </ul>

        <h3>FAQ</h3>
        ${faqs.map(([q, a]) => `<p><strong>${q}</strong> ${a}</p>`).join('\n        ')}
      </article>`;

  // insert before footer if no article, or replace thin article
  if (/<article[\s\S]*?<\/article>/i.test(html) && html.includes('article-content')) {
    html = html.replace(/<article[\s\S]*?<\/article>/i, article.trim());
  } else if (/class="seo-content"/i.test(html)) {
    html = html.replace(/<section class="seo-content"[\s\S]*?<\/section>/i, article.trim());
  } else if (/<footer/i.test(html)) {
    html = html.replace(/<footer/i, `${article}\n      <footer`);
  } else {
    html = html.replace(/<\/body>/i, `${article}\n  </body>`);
  }

  fs.writeFileSync(fp, html, 'utf8');
  return desc;
}

// ================= robots-generator =================
function fixRobots() {
  const fp = path.join(root, 'tools/seo/robots-generator.html');
  let html = fs.readFileSync(fp, 'utf8');
  const desc = padDesc([
    '免费 robots.txt 生成器：可视化配置允许/禁止规则、Sitemap 与爬虫预设，',
    '支持 WordPress/电商/SPA 模板，一键复制下载，适合站点抓取控制。',
  ]);
  html = setMeta(html, {
    title: 'Robots.txt 生成器 - 可视化爬虫规则与 Sitemap | WebUtils',
    desc,
    canonical: 'https://essays4u.net/tools/seo/robots-generator',
    ogTitle: 'Robots.txt 生成器 - 可视化爬虫规则',
  });
  html = fixSeoBreadcrumb(html);
  html = injectCss(html, POLISH_CSS);

  // improve breadcrumb
  if (html.includes('<nav class="breadcrumb">') && !html.includes('/tools/seo/')) {
    html = html.replace(
      /<nav class="breadcrumb">[\s\S]*?<\/nav>/i,
      `<nav class="breadcrumb" aria-label="breadcrumb">
      <a href="/">首页</a>
      <span>›</span>
      <a href="/tools/seo/">SEO工具</a>
      <span>›</span>
      <span>Robots.txt 生成器</span>
    </nav>`
    );
  }

  const faqs = [
    ['robots.txt 能保证不被抓吗？', '不能强制；它是礼貌协议，敏感内容还需登录与权限。'],
    ['Sitemap 要写进 robots 吗？', '建议写，方便发现站点地图。'],
    ['Disallow 全站会怎样？', '搜索引擎可能不再抓取公开内容，谨慎用于生产前台。'],
    ['Crawl-delay 都支持吗？', '并非所有爬虫支持，Google 通常忽略。'],
  ];
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'Robots.txt 生成器',
        url: 'https://essays4u.net/tools/seo/robots-generator',
        description: desc,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        inLanguage: 'zh-CN',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        featureList: ['规则可视化', '爬虫预设', 'Sitemap', '复制下载', 'WordPress/电商模板'],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页', item: 'https://essays4u.net/' },
          { '@type': 'ListItem', position: 2, name: 'SEO工具', item: 'https://essays4u.net/tools/seo/' },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Robots.txt 生成器',
            item: 'https://essays4u.net/tools/seo/robots-generator',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  };
  html = upsertLd(html, ld);

  const article = `
      ${sideBlock(
        [
          '选择预设或自定义 User-agent',
          '添加 Allow / Disallow 规则',
          '填写 Sitemap 与高级选项',
          '复制或下载 robots.txt 到网站根目录',
        ],
        faqs,
        [
          { href: '/tools/seo/meta-tags-generator', name: 'Meta 标签生成' },
          { href: '/tools/seo/og-preview', name: 'OG 预览' },
          { href: '/tools/dev/htaccess-generator', name: 'htaccess 生成' },
          { href: '/tools/seo/', name: 'SEO 工具分类' },
        ]
      )}
      <article class="seo-article" aria-label="Robots.txt 指南">
        <h2>robots.txt 是什么？</h2>
        <p><code>robots.txt</code> 放在网站根目录，用于提示爬虫哪些路径可以抓取。它是公开文件，不能当作安全机制。真正的私密内容应使用鉴权、权限与 noindex 等组合策略。</p>

        <h2>本生成器支持什么？</h2>
        <ul>
          <li>允许全部 / 禁止全部 / 标准配置等快速预设</li>
          <li>WordPress、电商、SPA 常见规则模板</li>
          <li>多 User-agent、Allow/Disallow、Sitemap、Crawl-delay、Host</li>
          <li>一键复制与下载生成结果</li>
        </ul>

        <h2>推荐写法</h2>
        <ol>
          <li>先保证前台重要频道可抓取</li>
          <li>屏蔽后台、购物车、内搜死循环参数页等</li>
          <li>在文件中声明 Sitemap 地址</li>
          <li>改完后用 Search Console robots 测试工具验证</li>
        </ol>

        <h2>易错点</h2>
        <ul>
          <li><code>Disallow: /</code> 误伤全站</li>
          <li>把敏感 API 只写进 robots 却不设权限</li>
          <li>规则顺序与前缀匹配理解错误</li>
          <li>多环境域名各用不同 robots 未同步</li>
        </ul>

        <h3>FAQ</h3>
        ${faqs.map(([q, a]) => `<p><strong>${q}</strong> ${a}</p>`).join('\n        ')}
      </article>`;

  if (/<footer/i.test(html)) {
    html = html.replace(/<footer/i, `${article}\n      <footer`);
  } else if (/<\/div>\s*<script>/i.test(html)) {
    html = html.replace(/<\/div>\s*<script>/i, `${article}\n    </div>\n\n    <script>`);
  } else {
    html = html.replace(/<\/body>/i, `${article}\n  </body>`);
  }

  fs.writeFileSync(fp, html, 'utf8');
  return desc;
}

// ================= favicon-extractor =================
function fixFavicon() {
  const fp = path.join(root, 'tools/extractor/favicon-extractor.html');
  let html = fs.readFileSync(fp, 'utf8');
  const desc = padDesc([
    '免费网站图标提取器：输入域名获取 Favicon 与 Apple Touch Icon，',
    '支持多尺寸预览、复制链接与下载，适合设计采集与站点配置。',
  ]);
  html = setMeta(html, {
    title: '网站图标提取器 - Favicon/Apple Touch Icon 获取下载 | WebUtils',
    desc,
    canonical: 'https://essays4u.net/tools/extractor/favicon-extractor',
    ogTitle: '网站图标提取器 - Favicon 获取下载',
  });
  html = fixSeoBreadcrumb(html);
  html = injectCss(html, POLISH_CSS);

  // breadcrumb middle link
  html = html.replace(/href="\/#extractor"/g, 'href="/tools/extractor/"');

  const faqs = [
    ['为什么有的站提取失败？', '目标站无图标、防盗链或第三方图标服务暂不可用。'],
    ['下载的是原图吗？', '多数为图标服务返回的可访问地址，分辨率因来源而异。'],
    ['会爬取网站源码吗？', '受 CORS 限制，主要通过公开图标服务与标准路径尝试。'],
    ['能批量整站吗？', '当前按单域名提取，适合逐个站点处理。'],
  ];
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: '网站图标提取器',
        url: 'https://essays4u.net/tools/extractor/favicon-extractor',
        description: desc,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        inLanguage: 'zh-CN',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        featureList: ['Favicon 提取', '多尺寸', 'Apple Touch Icon', '复制链接', '下载'],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页', item: 'https://essays4u.net/' },
          {
            '@type': 'ListItem',
            position: 2,
            name: '提取器',
            item: 'https://essays4u.net/tools/extractor/',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: '网站图标提取器',
            item: 'https://essays4u.net/tools/extractor/favicon-extractor',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  };
  html = upsertLd(html, ld);

  const article = `
          ${sideBlock(
            [
              '输入域名或完整 URL',
              '点击提取图标',
              '在结果中预览多来源尺寸',
              '复制链接或下载所需图标',
            ],
            faqs,
            [
              { href: '/tools/extractor/link-extractor', name: '链接提取' },
              { href: '/tools/extractor/', name: '提取器分类' },
              { href: '/tools/generator/placeholder-image', name: '占位图' },
              { href: '/tools/design/card-generator', name: '卡片生成' },
            ]
          )}
          <article class="article-content" aria-label="Favicon 指南">
            <h2>什么是 Favicon？</h2>
            <p>Favicon（Favorite Icon）是显示在浏览器标签、收藏夹、历史记录和部分移动端快捷方式上的小图标。它强化品牌识别，也让用户在多标签场景中更快找到你的站点。</p>

            <h2>本工具如何工作？</h2>
            <p>由于浏览器跨域限制，前端无法任意读取他站 HTML。本工具组合多种公开图标解析路径与服务：</p>
            <ul>
              <li><strong>Google Favicon API：</strong>多尺寸图标获取</li>
              <li><strong>DuckDuckGo Icons：</strong>快速默认图标</li>
              <li><strong>Apple Touch Icon：</strong>尝试更高分辨率触控图标</li>
              <li><strong>标准路径：</strong>如 <code>/favicon.ico</code></li>
            </ul>

            <h2>使用场景</h2>
            <ul>
              <li>为导航站、书签工具采集站点图标</li>
              <li>检查上线站是否正确配置 favicon</li>
              <li>设计竞品调研时快速取样</li>
              <li>替换损坏图标前先确认可用来源</li>
            </ul>

            <h2>配置建议</h2>
            <ol>
              <li>至少提供 32×32 / 48×48 ICO 或 PNG</li>
              <li>移动端补充 apple-touch-icon（180×180 常见）</li>
              <li>在 head 中声明明确的 icon link</li>
              <li>部署后强刷缓存验证标签页图标</li>
            </ol>

            <h2>能力边界</h2>
            <p>图标可用性取决于目标站与第三方服务；部分站点可能返回通用地球图标或失败。下载时若浏览器拦截跨域保存，可新开图片地址后右键另存为。</p>

            <h3>FAQ</h3>
            ${faqs.map(([q, a]) => `<p><strong>${q}</strong> ${a}</p>`).join('\n            ')}
          </article>`;

  if (/<article class="article-content"[\s\S]*?<\/article>/i.test(html)) {
    html = html.replace(/<article class="article-content"[\s\S]*?<\/article>/i, article.trim());
  } else {
    html = html.replace(/<\/main>/i, `${article}\n      </main>`);
  }

  // light default if pure dark ugly? leave theme as is but ensure footer ok
  fs.writeFileSync(fp, html, 'utf8');
  return desc;
}

function verify(file) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const d = (html.match(/name="description"\s+content="([^"]+)"/) || [])[1] || '';
  const body = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const h1 = (body.match(/<h1\b/gi) || []).length;
  const od = (html.match(/<div\b/gi) || []).length;
  const cd = (html.match(/<\/div>/gi) || []).length;
  let parseOk = false;
  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  if (ld) {
    try {
      JSON.parse(ld[1]);
      parseOk = true;
    } catch (e) {
      console.error('LD', file, e.message);
    }
  }
  const templatey = /适用于 .* 页面场景/.test(d);
  return {
    file,
    desc: d.length,
    h1,
    divDiff: od - cd,
    parseOk,
    templatey,
    hasLongArticle: (html.match(/<h2\b/gi) || []).length >= 4,
    hubLink: html.includes('/tools/seo/') || html.includes('/tools/extractor/'),
  };
}

const r = {
  imageAlt: fixImageAlt(),
  og: fixOgPreview(),
  meta: fixMetaTags(),
  robots: fixRobots(),
  favicon: fixFavicon(),
};

const checks = [
  verify('tools/seo/image-alt-checker.html'),
  verify('tools/seo/og-preview.html'),
  verify('tools/seo/meta-tags-generator.html'),
  verify('tools/seo/robots-generator.html'),
  verify('tools/extractor/favicon-extractor.html'),
];

console.log(JSON.stringify({ descLens: Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.length])), checks }, null, 2));
const bad = checks.some(
  (c) => c.desc < 120 || c.desc > 160 || c.h1 !== 1 || c.divDiff !== 0 || !c.parseOk || c.templatey || !c.hasLongArticle
);
process.exit(bad ? 1 : 0);
