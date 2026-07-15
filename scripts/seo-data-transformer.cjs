/**
 * SEO article + structured data for tools/data/data-transformer.html
 * Preserves transform logic and UI modes.
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const fp = path.join(root, 'tools/data/data-transformer.html');
let html = fs.readFileSync(fp, 'utf8');

function padDesc(parts) {
  let d = parts.join('');
  const pad = '结果仅供参考，重要数据请及时备份。';
  while (d.length < 120) d += pad;
  if (d.length > 160) d = d.slice(0, 160);
  return d;
}

const desc = padDesc([
  '免费全能数据转换器：按行批量加前后缀、包裹合并、模板生成 SQL、',
  '数值格式化、大小写与正则替换，浏览器本地处理不上传，',
  '适合名单清洗、配置生成与报表字段重塑。',
]);

// title
html = html.replace(
  /<title>[\s\S]*?<\/title>/i,
  '<title>全能数据转换器 - 批量前后缀/模板/正则替换 | WebUtils</title>'
);

// description
html = html.replace(
  /(<meta\s+name="description"\s+content=")[^"]*(")/i,
  '$1' + desc + '$2'
);
html = html.replace(
  /(<meta\s+property="og:title"\s+content=")[^"]*(")/i,
  '$1全能数据转换器 - 批量前后缀/模板/正则替换$2'
);
html = html.replace(
  /(<meta\s+property="og:description"\s+content=")[^"]*(")/i,
  '$1' + desc + '$2'
);
html = html.replace(
  /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/i,
  '$1全能数据转换器 - 批量数据重塑$2'
);
html = html.replace(
  /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/i,
  '$1' + desc + '$2'
);

// robots if missing
if (!/name="robots"/i.test(html)) {
  html = html.replace(
    /<meta name="author"[^>]*>/i,
    '$&\n    <meta name="robots" content="index, follow" />'
  );
}

const faqs = [
  [
    '数据会上传服务器吗？',
    '不会。转换在浏览器本地完成，输入内容默认不上传。草稿可能写入 localStorage.transformer_state。',
  ],
  [
    '模板变量有哪些？',
    '支持 {value} 原值、{i} 从 1 起序号、{i0} 从 0 起序号，适合生成 SQL 或 HTML 片段。',
  ],
  [
    '包裹合并输出几行？',
    '包裹合并会把多行合成一行：左右包裹后用分隔符 join，常用于引号列表或 IN 子句草稿。',
  ],
  [
    '正则替换失败会怎样？',
    '若正则非法，该行保持原样；未勾选正则时按普通字符串全局替换。',
  ],
  [
    '空行会参与转换吗？',
    '不会。输入会按行分割并过滤空白行，再对剩余行执行当前模式。',
  ],
];

const ld = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: '全能数据转换器',
      url: 'https://essays4u.net/tools/data/data-transformer',
      description: desc,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      inLanguage: 'zh-CN',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      featureList: [
        '前缀后缀',
        '包裹合并',
        '自定义模板',
        '数值格式化',
        '大小写转换',
        '查找替换/正则',
        '本地处理',
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首页', item: 'https://essays4u.net/' },
        { '@type': 'ListItem', position: 2, name: '数据工具', item: 'https://essays4u.net/#data' },
        {
          '@type': 'ListItem',
          position: 3,
          name: '全能数据转换器',
          item: 'https://essays4u.net/tools/data/data-transformer',
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

const ldBlock =
  '<script type="application/ld+json">\n' + JSON.stringify(ld, null, 2) + '\n    </script>';

// replace existing ld+json (keep one)
if (/application\/ld\+json/i.test(html)) {
  let n = 0;
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, () => {
    n += 1;
    return n === 1 ? ldBlock : '';
  });
} else {
  html = html.replace('</head>', ldBlock + '\n  </head>');
}

// layout CSS for article + sidebar polish
const extraCss = `
/* seo layout polish */
.breadcrumb ol {
  list-style: none; display: flex; flex-wrap: wrap; gap: .45rem; align-items: center;
  font-size: .875rem; color: var(--text-dim); margin: 0 0 1.25rem; padding: 0;
}
.breadcrumb li { display: flex; align-items: center; }
.breadcrumb li:not(:last-child)::after { content: "›"; margin-left: .45rem; color: #999; }
.breadcrumb a { color: var(--text-dim); text-decoration: none; }
.breadcrumb a:hover { color: var(--primary); }
.seo-article {
  margin-top: 48px;
  padding: 1.5rem 1.55rem 1.75rem;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 4px 20px rgba(0,0,0,.03);
  color: #334155;
  line-height: 1.85;
}
.seo-article h2 { color: #0f172a; font-size: 1.35rem; margin: 1.35rem 0 .65rem; }
.seo-article h2:first-child { margin-top: 0; }
.seo-article h3 { color: #1e293b; font-size: 1.08rem; margin: 1.1rem 0 .45rem; }
.seo-article p { margin: 0 0 .9rem; color: #475569; }
.seo-article ul, .seo-article ol { margin: 0 0 1rem 1.2rem; color: #475569; }
.seo-article li { margin-bottom: .35rem; }
.seo-article code {
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: .88em;
  background: rgba(0,180,216,.08);
  padding: .1em .35em;
  border-radius: 4px;
}
.seo-side {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  margin-top: 24px;
}
@media (min-width: 900px) {
  .seo-side { grid-template-columns: 1fr 1fr 1fr; }
}
.seo-card {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px 16px 14px;
  background: var(--bg-card);
}
.seo-card h2 { font-size: 1rem; margin: 0 0 10px; color: #0f172a; }
.seo-card ol, .seo-card ul { margin: 0 0 0 1.1rem; color: #475569; font-size: .9rem; }
.seo-card li { margin-bottom: .35rem; }
.related-tools { display: flex; flex-wrap: wrap; gap: 8px; }
.related-tools a {
  display: inline-block; padding: 6px 12px; border-radius: 999px;
  border: 1px solid var(--border); text-decoration: none; color: var(--text-dim);
  font-size: .85rem; background: #fff;
}
.related-tools a:hover { border-color: var(--primary); color: var(--primary); }
footer.site-footer {
  text-align: center;
  padding: 28px 0 36px;
  color: var(--text-dim);
  border-top: 1px solid var(--border);
  margin-top: 40px;
}
footer.site-footer .footer-links {
  display: flex; flex-wrap: wrap; justify-content: center; gap: 12px 18px;
  margin: 14px auto 0; font-size: 14px;
}
footer.site-footer a { color: var(--text-dim); text-decoration: none; }
footer.site-footer a:hover { color: var(--primary); }
`;

if (!html.includes('/* seo layout polish */')) {
  html = html.replace('</style>', extraCss + '\n    </style>');
}

const seoArticle = `
        <section class="seo-side" aria-label="使用提示">
          <div class="seo-card">
            <h2>怎么用</h2>
            <ol>
              <li>在左侧（或上方）文本框按行粘贴原始数据</li>
              <li>选择转换模式并填写对应参数</li>
              <li>点击「开始批量转换」查看结果</li>
              <li>用「复制结果」带走输出，可继续改模式重跑</li>
            </ol>
          </div>
          <div class="seo-card">
            <h2>常见问题</h2>
            <ul>
              <li><strong>会上传吗？</strong>不会，本地处理。</li>
              <li><strong>模板变量？</strong>{value}/{i}/{i0}。</li>
              <li><strong>空行？</strong>自动忽略空白行。</li>
              <li><strong>正则失败？</strong>该行保持原样。</li>
            </ul>
          </div>
          <div class="seo-card">
            <h2>相关工具</h2>
            <div class="related-tools">
              <a href="/tools/text/case-converter">大小写转换</a>
              <a href="/tools/text/duplicate-remover">去重工具</a>
              <a href="/tools/text/whitespace-cleaner">空白清理</a>
              <a href="/tools/dev/json-formatter">JSON 格式化</a>
            </div>
          </div>
        </section>

        <article class="seo-article" aria-label="全能数据转换器使用指南">
          <h2>全能数据转换器是什么？</h2>
          <p>「全能数据转换器」是面向<strong>按行文本</strong>的批量重塑工作台。你把名单、字段、配置项或临时导出结果粘贴进输入区，选择一种模式后一键输出新格式。它不是 Excel、也不是完整 ETL 平台，而是浏览器里的“微型手术刀”：适合几行到上万行的快速整理，强调<strong>本地处理、即时预览、可复制带走</strong>。</p>
          <p>页面提供六种模式：<strong>前缀/后缀</strong>、<strong>包裹合并</strong>、<strong>自定义模板</strong>、<strong>数值格式化</strong>、<strong>文本大小写</strong>、<strong>查找替换</strong>（可选正则）。转换前会按换行拆分并过滤空行，统计区显示输入行数与输出行数。部分状态会写入 <code>localStorage.transformer_state</code>（输入内容与当前模式），刷新后可恢复草稿。</p>

          <h2>六种模式分别做什么？</h2>
          <h3>1. 前缀 / 后缀</h3>
          <p>对每一行分别拼接前缀与后缀。典型用途：给文件名加扩展名（如 <code>.png</code>）、给 SKU 加业务前缀（如 <code>ITEM_</code>）、给路径片段统一补目录。空前缀或空后缀等价于不加。</p>

          <h3>2. 包裹合并</h3>
          <p>先给每行加左右包裹字符，再用行间分隔符把所有行<strong>合并成一行</strong>。默认常用于生成 <code>'a', 'b', 'c'</code> 这类列表，可快速拼 SQL <code>IN (...)</code> 草稿、JSON 字符串数组片段或 CSV 单行字段。注意：此模式输出行数通常为 1，与输入行数不同。</p>

          <h3>3. 自定义模板</h3>
          <p>为每一行套用同一模板字符串，支持变量：</p>
          <ul>
            <li><code>{value}</code>：当前行原文</li>
            <li><code>{i}</code>：从 1 开始的序号</li>
            <li><code>{i0}</code>：从 0 开始的序号</li>
          </ul>
          <p>适合批量生成 <code>INSERT</code> 语句、HTML <code>&lt;li&gt;</code>、<code>option</code>、配置行或测试数据。模板在浏览器内做字符串替换，不会执行 SQL/JS，生成结果需你自行粘贴到目标环境校验。</p>

          <h3>4. 数值格式化</h3>
          <p>尝试从每行提取数字（允许清理部分非数字符号），再格式化为：千分位、保留 2 位小数、百分比、人民币（¥）或美元（$）。对无法解析的行，可选择「保持原样」「跳过该行」或「设为 0」。百分比模式会把数值按 <code>num * 100</code> 再加 <code>%</code>，请确认原始数据是小数比例还是已经是百分数，避免重复放大。</p>

          <h3>5. 文本大小写</h3>
          <p>支持全部大写、全部小写、单词首字母大写、小驼峰 <code>camelCase</code>、蛇形 <code>snake_case</code>、短横线 <code>kebab-case</code>。适合标识符风格统一、表头规范化或代码片段重命名草稿。中文内容在大小写规则上变化有限，英文与数字标识符收益更明显。</p>

          <h3>6. 查找替换</h3>
          <p>默认按普通字符串全局替换；勾选「正则表达式」后使用 <code>RegExp</code> 全局替换。正则非法时该行保持原样，避免整批失败。适合去掉域名、替换分隔符、批量改状态码文案等。复杂多步清洗建议拆成多次转换，或先用去重/空白清理工具预处理。</p>

          <h2>推荐工作流</h2>
          <ol>
            <li>从 Excel/日志/后台导出一列纯文本，粘贴到输入区（可用「从剪贴板粘贴」）。</li>
            <li>先选最接近目标的模式；不确定时用前缀后缀或查找替换做最小改动验证。</li>
            <li>点「开始批量转换」，核对输出行数与样例几行是否符合预期。</li>
            <li>复制结果；若还需第二步加工，把输出粘回输入区继续转换。</li>
            <li>敏感数据用完后清空输入输出，并视情况清理站点本地存储。</li>
          </ol>

          <h2>适用场景</h2>
          <ul>
            <li>运营/运营支持：活动名单加前缀、渠道码拼接、状态字段批量改写</li>
            <li>开发联调：快速生成 INSERT 草稿、枚举列表、测试账号行</li>
            <li>数据整理：金额千分位、货币符号、大小写风格统一</li>
            <li>内容生产：HTML 列表项、Markdown 条目的半自动生成</li>
          </ul>

          <h2>边界与注意</h2>
          <ul>
            <li>按<strong>行</strong>处理，不解析完整 CSV 多列表格结构；含逗号的复杂表格请先拆列。</li>
            <li>包裹合并会改变行数结构；需要“每行仍独立”时请用前缀后缀或模板。</li>
            <li>数值格式化依赖简单数字解析，科学计数法/会计括号等特殊写法可能不符合预期。</li>
            <li>正则能力受浏览器引擎限制，且无替换预览高亮；写复杂模式请先用小样本验证。</li>
            <li>本工具不做权限审计与服务端落库；生成 SQL/配置上线前请在目标环境人工复核。</li>
          </ul>

          <h2>隐私与本地草稿</h2>
          <p>转换逻辑在浏览器执行，页面不会为了转换而把全文上传到服务器。为了刷新后可继续，工具可能把输入与模式写入 <code>localStorage</code>。公共电脑或处理机密名单时，请转换后手动清空，并避免在共享配置文件中残留草稿。</p>

          <h2>与本站其他工具如何配合</h2>
          <p>需要先去掉重复行可用「去重工具」；只想改大小写可用「大小写转换」；空白与不可见字符可用「空白清理」。输出若是 JSON，可再交给「JSON 格式化」检查结构。数据转换器更擅长“同一规则套用到每一行”，复杂多字段映射仍建议表格软件或脚本流水线。</p>

          <h2>常见问题</h2>
          <h3>为什么我输入 10 行，输出只有 1 行？</h3>
          <p>多半使用了「包裹合并」：它会把多行 join 成一行。若需要逐行输出，请改用前缀后缀、模板或查找替换。</p>
          <h3>模板里的序号从几开始？</h3>
          <p><code>{i}</code> 从 1 开始，<code>{i0}</code> 从 0 开始，便于对接不同语言的循环习惯。</p>
          <h3>百分比为什么变得特别大？</h3>
          <p>百分比模式按“小数比例 ×100”理解。若原始已是 85 表示 85%，请先换算或不要用 percent 模式。</p>
          <h3>可以撤销一次转换吗？</h3>
          <p>没有专用撤销栈。输入区内容在未覆盖前仍可保留；建议先复制输入备份，再多次尝试不同模式。</p>
        </article>
`;

// replace thin article block
if (/<article[\s\S]*?<\/article>/i.test(html)) {
  html = html.replace(/<article[\s\S]*?<\/article>/i, seoArticle.trim());
} else {
  html = html.replace(
    /<button class="btn-main"[\s\S]*?<\/button>/i,
    (m) => m + '\n\n' + seoArticle
  );
}

// footer class polish
html = html.replace(
  /<footer>\s*<p>© 2026 WebUtils Transformer\. 纯本地处理，保障隐私。<\/p>\s*<nav data-site-policy-links[\s\S]*?<\/nav>\s*<\/footer>/i,
  `<footer class="site-footer">
            <p>© 2026 WebUtils · 全能数据转换器 · 纯本地处理</p>
            <nav class="footer-links" data-site-policy-links aria-label="网站政策">
              <a href="/about">关于本站</a>
              <a href="/contact">联系我们</a>
              <a href="/terms">使用条款</a>
              <a href="/privacy-policy">隐私政策</a>
              <a href="/tools-directory">全部工具</a>
            </nav>
          </footer>`
);

// ensure related tools files exist - fallback handled by tests
const related = [
  'tools/text/case-converter.html',
  'tools/text/duplicate-remover.html',
  'tools/text/whitespace-cleaner.html',
  'tools/dev/json-formatter.html',
];
for (const r of related) {
  if (!fs.existsSync(path.join(root, r))) {
    console.warn('missing related', r);
  }
}

fs.writeFileSync(fp, html, 'utf8');

// verify
const out = fs.readFileSync(fp, 'utf8');
const d = (out.match(/name="description"\s+content="([^"]+)"/) || [])[1] || '';
const body = out.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
const h1 = (body.match(/<h1\b/gi) || []).length;
const od = (out.match(/<div\b/gi) || []).length;
const cd = (out.match(/<\/div>/gi) || []).length;
let parseOk = false;
const ldm = out.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
if (ldm) {
  try {
    JSON.parse(ldm[1]);
    parseOk = true;
  } catch (e) {
    console.error(e.message);
  }
}
const hasArticle = out.includes('seo-article') && out.includes('六种模式');
const hasFaq = out.includes('"@type": "FAQPage"') || out.includes('"@type":"FAQPage"');
const hasWebApp = out.includes('WebApplication');
const ok =
  d.length >= 120 &&
  d.length <= 160 &&
  h1 === 1 &&
  od === cd &&
  parseOk &&
  hasArticle &&
  hasFaq &&
  hasWebApp;

console.log({
  ok,
  desc: d.length,
  h1,
  divDiff: od - cd,
  parseOk,
  hasArticle,
  hasFaq,
  hasWebApp,
});
process.exit(ok ? 0 : 1);
