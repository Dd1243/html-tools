/**
 * Fix layout + SEO for 4 office pages without rewriting app logic.
 * checklist-maker, invoice-maker, timesheet, task-tracker
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const PAGES = [
  {
    file: 'tools/office/checklist-maker.html',
    title: '在线清单制作工具 - 待办勾选、进度与拖拽排序 | WebUtils',
    shortName: '清单制作工具',
    crumbName: '在线清单制作工具',
    url: 'https://essays4u.net/tools/office/checklist-maker',
    descParts: [
      '免费在线清单制作工具：添加待办并勾选完成，实时进度条与拖拽排序；',
      '支持分享链接、打印清单与本地保存，数据不上传服务器，',
      '适合旅行打包、上线检查与活动筹备。',
    ],
    nav: [
      ['/', '首页'],
      ['/tools/office/checklist-maker', '清单制作'],
      ['/tools/office/task-tracker', '任务跟踪'],
    ],
    related: [
      ['/tools/office/task-tracker', '任务跟踪'],
      ['/tools/office/gantt-chart', '甘特图'],
      ['/tools/office/project-timeline', '项目时间线'],
      ['/tools/office/timesheet', '工时记录'],
    ],
    how: [
      '输入事项后点添加或回车',
      '勾选完成，进度条实时更新',
      '拖拽调整执行顺序',
      '可分享链接或打印清单',
      '清理已完成 / 清空全部',
    ],
    faq: [
      ['刷新后清单还在吗？', '在。数据保存在 localStorage 键 checklist_maker_data_v1；也可从 URL 分享快照加载。'],
      ['分享链接会同步改我的本机吗？', '不会。对方打开是快照，改动写在对方浏览器，不会反向覆盖你的本地数据。'],
      ['拖拽在手机上不好用？', '部分触控浏览器体验一般，可用删除后按新顺序重加。'],
      ['数据会上传吗？', '不会。清单在本地处理；分享链接仅把内容编码进 URL，请勿放入密码密钥。'],
    ],
    features: ['待办勾选', '进度条', '拖拽排序', '分享链接', '打印清单', '本地保存'],
    appCategory: 'BusinessApplication',
  },
  {
    file: 'tools/office/invoice-maker.html',
    title: '在线发票生成器 - 账单报价单制作与打印 | WebUtils',
    shortName: '发票生成器',
    crumbName: '在线发票生成器',
    url: 'https://essays4u.net/tools/office/invoice-maker',
    descParts: [
      '免费在线发票与账单生成器：填写买卖双方、明细行与税率，自动汇总金额；',
      '支持打印/导出PDF与本地草稿，浏览器处理不上传，',
      '适合自由职业报价、对账与简易账单。',
    ],
    nav: [
      ['/', '首页'],
      ['/tools/office/invoice-maker', '发票生成'],
      ['/tools/office/timesheet', '工时记录'],
    ],
    related: [
      ['/tools/office/timesheet', '工时记录'],
      ['/tools/office/quotation-maker', '报价单'],
      ['/tools/office/receipt-maker', '收据制作'],
      ['/tools/finance/profit-margin', '利润率计算'],
    ],
    how: [
      '填写开票方与客户信息',
      '添加明细行：名称/数量/单价',
      '设置税率，查看小计与合计',
      '打印或另存为 PDF',
      '本地草稿按页面实现保存',
    ],
    faq: [
      ['这是税务局电子发票吗？', '不是。本页生成的是可打印账单/报价版式，不能替代税控开票与数电发票。'],
      ['金额怎么算？', '按明细数量×单价汇总，再按税率计算税额与价税合计（以页面脚本为准）。'],
      ['数据会上传吗？', '不会。填写与打印在浏览器本地完成。'],
      ['能当正式发票报销吗？', '一般不能。正式报销请使用合规税控/数电发票；本工具用于商务单据草稿。'],
    ],
    features: ['买卖双方信息', '多行明细', '税率汇总', '打印PDF', '本地处理'],
    appCategory: 'FinanceApplication',
  },
  {
    file: 'tools/office/timesheet.html',
    title: '在线工时记录工具 - 周汇总与 CSV 导出 | WebUtils',
    shortName: '工时记录工具',
    crumbName: '在线工时记录工具',
    url: 'https://essays4u.net/tools/office/timesheet',
    descParts: [
      '免费在线工时记录工具：按项目、日期与起止时间记账，自动周汇总；',
      '支持导出 CSV 与本地保存，浏览器处理不上传，',
      '适合自由职业、远程办公与项目制周报底稿。',
    ],
    nav: [
      ['/', '首页'],
      ['/tools/office/timesheet', '工时记录'],
      ['/tools/office/invoice-maker', '发票生成'],
    ],
    related: [
      ['/tools/office/invoice-maker', '发票生成'],
      ['/tools/office/task-tracker', '任务跟踪'],
      ['/tools/office/checklist-maker', '清单制作'],
      ['/tools/office/gantt-chart', '甘特图'],
    ],
    how: [
      '填写项目名、日期、开始与结束时间',
      '添加后进入列表并可删除',
      '查看本周汇总卡片',
      '导出 CSV 做周报或计费',
      '月结后可清空（请先导出）',
    ],
    faq: [
      ['刷新后记录还在吗？', '在。数据键为 timesheet_data_v2，保存在本机浏览器。'],
      ['周汇总为什么是 0？', '当前自然周没有条目，或日期填到了其他周。'],
      ['CSV 中文乱码？', '用 Excel「数据→从文本/CSV」选择 UTF-8 导入。'],
      ['会上传服务器吗？', '不会。全部本地计算与存储。'],
    ],
    features: ['项目工时条目', '周汇总', 'CSV 导出', '本地保存'],
    appCategory: 'BusinessApplication',
  },
  {
    file: 'tools/office/task-tracker.html',
    title: '在线任务跟踪器 - 待办优先级与进度筛选 | WebUtils',
    shortName: '任务跟踪器',
    crumbName: '在线任务跟踪器',
    url: 'https://essays4u.net/tools/office/task-tracker',
    descParts: [
      '免费在线任务跟踪器：添加待办并设置高中低优先级，筛选进行中/已完成；',
      '统计全部与完成数，数据保存在浏览器本地不上传，',
      '适合个人执行清单与小团队进度对齐。',
    ],
    nav: [
      ['/', '首页'],
      ['/tools/office/task-tracker', '任务跟踪'],
      ['/tools/office/checklist-maker', '清单制作'],
    ],
    related: [
      ['/tools/office/checklist-maker', '清单制作'],
      ['/tools/office/gantt-chart', '甘特图'],
      ['/tools/office/project-timeline', '项目时间线'],
      ['/tools/office/timesheet', '工时记录'],
    ],
    how: [
      '输入任务并选择优先级后添加',
      '勾选完成，统计数字同步',
      '用筛选看全部/进行中/已完成',
      '清理已完成保持列表干净',
      '数据在本地键 task_tracker_v2_data',
    ],
    faq: [
      ['和清单制作有何不同？', '任务跟踪强调优先级与状态筛选；清单更适合一次性检查勾选与拖拽顺序。'],
      ['刷新后任务还在吗？', '在。使用 localStorage 键 task_tracker_v2_data。'],
      ['支持多人协作吗？', '不支持实时协同，仅本机；需要协作请导出或另用协同工具。'],
      ['数据会上传吗？', '不会。'],
    ],
    features: ['优先级', '状态筛选', '完成统计', '本地保存'],
    appCategory: 'BusinessApplication',
  },
];

function buildDesc(parts) {
  let d = parts.join('');
  const pad = '结果仅供参考，重要数据请及时导出备份。';
  while (d.length < 120) d += pad;
  if (d.length > 160) d = d.slice(0, 160);
  return d;
}

function sidebarHtml(p) {
  const how = p.how.map((x) => '<li>' + x + '</li>').join('');
  const faq = p.faq
    .map(
      ([q, a]) =>
        '<div class="faq-item"><div class="faq-q">Q: ' +
        q +
        '</div><div class="faq-a">A: ' +
        a +
        '</div></div>'
    )
    .join('');
  const rel = p.related
    .map(([href, name]) => '<a href="' + href + '">' + name + '</a>')
    .join('');
  return (
    '<aside class="sidebar-section" aria-label="使用说明">' +
    '<div class="article-card"><h2>怎么用</h2><ul class="how-list">' +
    how +
    '</ul></div>' +
    '<div class="article-card"><h2>常见问题</h2>' +
    faq +
    '</div>' +
    '<div class="article-card"><h2>相关工具</h2><div class="related-tools">' +
    rel +
    '</div></div>' +
    '</aside>'
  );
}

function ldJson(p, desc) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: p.shortName,
        url: p.url,
        description: desc,
        applicationCategory: p.appCategory,
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        inLanguage: 'zh-CN',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        featureList: p.features,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页', item: 'https://essays4u.net/' },
          { '@type': 'ListItem', position: 2, name: '办公工具', item: 'https://essays4u.net/#office' },
          { '@type': 'ListItem', position: 3, name: p.crumbName, item: p.url },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: p.faq.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  };
}

const EXTRA_CSS = `
/* layout fix injected */
.page-shell { width: 95%; max-width: 1200px; margin: 0 auto; padding: 20px 0 40px; }
.breadcrumb { margin: 0 0 1rem; }
.breadcrumb ol { list-style: none; display: flex; flex-wrap: wrap; gap: 0.45rem; align-items: center; font-size: 0.875rem; color: var(--text-muted, #666); padding: 0; margin: 0; }
.breadcrumb li { display: flex; align-items: center; }
.breadcrumb li:not(:last-child)::after { content: "›"; margin-left: 0.45rem; color: #999; }
.breadcrumb a { color: var(--text-muted, #666); text-decoration: none; }
.breadcrumb a:hover { color: var(--primary-color, #007acc); }
.breadcrumb li:last-child span { color: #111; font-weight: 500; }
main.content-layout { display: flex; flex-direction: column; gap: 24px; align-items: stretch; width: 100%; max-width: none; padding: 0; }
@media (min-width: 1024px) {
  main.content-layout { flex-direction: row; align-items: flex-start; }
}
.tool-section { flex: 1 1 0; min-width: 0; background: var(--card-bg, #fff); padding: 25px; border-radius: var(--radius, 8px); box-shadow: var(--shadow, 0 2px 10px rgba(0,0,0,.08)); }
.sidebar-section { flex: 0 0 300px; width: 100%; display: flex; flex-direction: column; gap: 20px; }
@media (min-width: 1024px) { .sidebar-section { width: 300px; } }
.sidebar-section .article-card { background: var(--card-bg, #fff); padding: 20px; border-radius: var(--radius, 8px); box-shadow: var(--shadow, 0 2px 10px rgba(0,0,0,.08)); }
.sidebar-section .article-card h2 { font-size: 1.05rem; margin: 0 0 12px; color: #111; }
.sidebar-section .how-list { list-style: none; padding: 0; margin: 0; }
.sidebar-section .how-list li { display: flex; gap: 8px; font-size: 0.9rem; margin-bottom: 8px; line-height: 1.6; color: var(--text-main, #333); }
.sidebar-section .how-list li::before { content: "➜"; color: var(--primary-color, #007acc); flex-shrink: 0; }
.faq-item { margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed var(--border-color, #ddd); }
.faq-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.faq-q { font-weight: 600; font-size: 0.9rem; margin-bottom: 4px; color: #111; }
.faq-a { font-size: 0.86rem; color: var(--text-muted, #666); line-height: 1.6; }
.related-tools { display: flex; flex-wrap: wrap; gap: 8px; }
.related-tools a { display: inline-block; padding: 6px 12px; border: 1px solid var(--border-color, #ddd); border-radius: 999px; font-size: 0.85rem; text-decoration: none; color: var(--text-muted, #666); background: #fafafa; }
.related-tools a:hover { border-color: var(--primary-color, #007acc); color: var(--primary-color, #007acc); }
.tool-guide { margin-top: 28px; }
@media print {
  .breadcrumb, .sidebar-section { display: none !important; }
  main.content-layout { display: block !important; }
  .page-shell { width: 100%; max-width: none; margin: 0; padding: 0; }
}
`;

function fixMeta(html, p, desc) {
  // title
  html = html.replace(/<title>[^<]*<\/title>/i, '<title>' + p.title + '</title>');
  // description
  if (/name="description"/i.test(html)) {
    html = html.replace(
      /(<meta\s+name="description"\s+content=")[^"]*(")/i,
      '$1' + desc + '$2'
    );
  } else {
    html = html.replace(
      /<title>[^<]*<\/title>/i,
      (m) => m + '\n    <meta name="description" content="' + desc + '" />'
    );
  }
  // robots
  if (!/name="robots"/i.test(html)) {
    html = html.replace(
      /name="description"[^>]*>/i,
      (m) => m + '\n    <meta name="robots" content="index, follow" />'
    );
  }
  // og:description
  if (/property="og:description"/i.test(html)) {
    html = html.replace(
      /(<meta\s+property="og:description"\s+content=")[^"]*(")/i,
      '$1' + desc + '$2'
    );
  }
  // twitter:description
  if (/name="twitter:description"/i.test(html)) {
    html = html.replace(
      /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/i,
      '$1' + desc + '$2'
    );
  }
  // og:title / twitter:title shorten
  const ogTitle = p.title.replace(/\s*\|\s*WebUtils\s*$/, '');
  if (/property="og:title"/i.test(html)) {
    html = html.replace(
      /(<meta\s+property="og:title"\s+content=")[^"]*(")/i,
      '$1' + ogTitle + '$2'
    );
  }
  if (/name="twitter:title"/i.test(html)) {
    html = html.replace(
      /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/i,
      '$1' + ogTitle + '$2'
    );
  }
  return html;
}

function replaceJsonLd(html, p, desc) {
  const block =
    '<script type="application/ld+json">\n' +
    JSON.stringify(ldJson(p, desc), null, 2) +
    '\n    </script>';
  if (/application\/ld\+json/i.test(html)) {
    // replace first ld+json block (and any subsequent breadcrumb-only ones later cleaned)
    html = html.replace(
      /<script type="application\/ld\+json">[\s\S]*?<\/script>/i,
      block
    );
    // remove extra ld+json that are only BreadcrumbList duplicates
    let count = 0;
    html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, (m) => {
      count++;
      return count === 1 ? m : '';
    });
  } else {
    html = html.replace('</head>', block + '\n  </head>');
  }
  return html;
}

function injectCss(html) {
  if (html.includes('/* layout fix injected */')) return html;
  return html.replace('</style>', EXTRA_CSS + '\n    </style>');
}

function fixNav(html, p) {
  // replace site-nav ul contents if present
  const navInner = p.nav
    .map(([href, name], i) => {
      const active =
        href.includes(p.file.replace('tools/office/', '').replace('.html', '')) && href !== '/'
          ? ' class="active"'
          : '';
      return '<li><a href="' + href + '"' + active + '>' + name + '</a></li>';
    })
    .join('\n            ');
  if (/<nav class="site-nav"[\s\S]*?<\/nav>/i.test(html)) {
    html = html.replace(
      /(<nav class="site-nav"[^>]*>\s*<ul>)[\s\S]*?(<\/ul>\s*<\/nav>)/i,
      '$1\n            ' + navInner + '\n          $2'
    );
  }
  // fix common relative links elsewhere
  html = html.replace(/href="invoice-maker\.html"/g, 'href="/tools/office/invoice-maker"');
  html = html.replace(/href="timesheet\.html"/g, 'href="/tools/office/timesheet"');
  html = html.replace(/href="checklist-maker\.html"/g, 'href="/tools/office/checklist-maker"');
  html = html.replace(/href="task-tracker\.html"/g, 'href="/tools/office/task-tracker"');
  html = html.replace(/href="work-log\.html"/g, 'href="/tools/office/work-log"');
  html = html.replace(/href="gantt-chart\.html"/g, 'href="/tools/office/gantt-chart"');
  return html;
}

function fixFooter(html) {
  // ensure footer closed properly if policy nav is outside
  if (/<\/footer>\s*<nav data-site-policy-links/i.test(html)) {
    // already odd; leave
  }
  // move orphan policy nav into footer if after footer close missing
  html = html.replace(
    /(<div class="footer-bottom">[\s\S]*?<\/div>\s*)<\/div>\s*<nav data-site-policy-links([\s\S]*?)<\/nav>\s*<\/footer>/i,
    '$1<nav data-site-policy-links$2</nav>\n      </div>\n    </footer>'
  );
  // common pattern: footer-bottom then </div> then nav then </footer missing open
  html = html.replace(
    /(<\/div>\s*)\n\s*<nav data-site-policy-links([^>]*)>([\s\S]*?)<\/nav>\s*<\/footer>/i,
    '$1\n  <nav data-site-policy-links$2>$3</nav>\n</footer>'
  );
  return html;
}

function restructureMain(html, p) {
  // Extract existing main inner
  const mainMatch = html.match(/<main class="container">([\s\S]*?)<\/main>/i);
  if (!mainMatch) {
    console.error('NO_MAIN_CONTAINER', p.file);
    return html;
  }
  let inner = mainMatch[1];

  // Extract tool-guide if present
  let guide = '';
  const guideMatch = inner.match(/<section class="tool-guide"[\s\S]*?<\/section>/i);
  if (guideMatch) {
    guide = guideMatch[0];
    // strip inline max-width that breaks full-width layout slightly - keep class, remove max-width style bits optional
    guide = guide.replace(
      /style="margin:2rem auto;max-width:760px;padding:1\.35rem 1\.4rem 1\.6rem;border:1px solid var\(--border-color,var\(--border,#333\)\);border-radius:12px;line-height:1\.8;background:var\(--bg-card,rgba\(255,255,255,0\.02\)\);color:var\(--text-primary,inherit\)"/i,
      'style="margin:2rem 0 0;padding:1.35rem 1.4rem 1.6rem;border:1px solid var(--border-color,#ddd);border-radius:12px;line-height:1.8;background:var(--card-bg,#fff);color:inherit;box-shadow:var(--shadow,0 2px 10px rgba(0,0,0,.06))"'
    );
    inner = inner.replace(guideMatch[0], '');
  }

  // remove SEO placeholder comments
  inner = inner.replace(/<!--\s*SEO 内容\s*-->/g, '');
  inner = inner.trim();

  // If already has tool-section, don't double wrap
  let toolInner = inner;
  if (!/class="tool-section"/.test(inner)) {
    toolInner = '<section class="tool-section" aria-label="工具主区">\n' + inner + '\n        </section>';
  }

  const crumb =
    '<nav class="breadcrumb" aria-label="breadcrumb">\n' +
    '        <ol>\n' +
    '          <li><a href="/">首页</a></li>\n' +
    '          <li><a href="/#office">办公工具</a></li>\n' +
    '          <li><span>' +
    p.crumbName +
    '</span></li>\n' +
    '        </ol>\n' +
    '      </nav>';

  // remove old microdata breadcrumb outside if any - handled by replacing whole main block region
  const shell =
    '<div class="page-shell">\n' +
    '      ' +
    crumb +
    '\n' +
    '      <main class="content-layout">\n' +
    '        ' +
    toolInner +
    '\n' +
    '        ' +
    sidebarHtml(p) +
    '\n' +
    '      </main>\n' +
    (guide ? '      ' + guide + '\n' : '') +
    '    </div>';

  html = html.replace(/<main class="container">[\s\S]*?<\/main>/i, shell);

  // remove duplicate breadcrumb microdata blocks before page-shell if present
  html = html.replace(
    /<!--\s*面包屑导航\s*-->\s*<nav class="breadcrumb"[\s\S]*?<\/nav>\s*/i,
    ''
  );

  return html;
}

let fail = 0;
for (const p of PAGES) {
  const fp = path.join(root, p.file);
  let html = fs.readFileSync(fp, 'utf8');
  const desc = buildDesc(p.descParts);
  console.log(p.file, 'descLen', desc.length);

  html = fixMeta(html, p, desc);
  html = replaceJsonLd(html, p, desc);
  html = injectCss(html);
  html = fixNav(html, p);
  html = restructureMain(html, p);
  html = fixFooter(html);

  fs.writeFileSync(fp, html, 'utf8');

  // verify
  const out = fs.readFileSync(fp, 'utf8');
  const d = (out.match(/name="description"\s+content="([^"]+)"/) || [])[1] || '';
  const body = out.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const h1 = (body.match(/<h1\b/gi) || []).length;
  const openDiv = (out.match(/<div\b/gi) || []).length;
  const closeDiv = (out.match(/<\/div>/gi) || []).length;
  const openMain = (out.match(/<main\b/gi) || []).length;
  const closeMain = (out.match(/<\/main>/gi) || []).length;
  let parseOk = false;
  const ld = out.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  if (ld) {
    try {
      JSON.parse(ld[1]);
      parseOk = true;
    } catch (e) {
      console.error('LD fail', p.file, e.message);
    }
  }
  const ok =
    d.length >= 120 &&
    d.length <= 160 &&
    h1 === 1 &&
    openDiv === closeDiv &&
    openMain === closeMain &&
    out.includes('class="tool-section"') &&
    out.includes('class="sidebar-section"') &&
    out.includes('class="content-layout"') &&
    parseOk;
  console.log({
    file: p.file,
    ok,
    descLen: d.length,
    h1,
    divDiff: openDiv - closeDiv,
    main: openMain + '/' + closeMain,
    parseOk,
    hasGuide: out.includes('tool-guide'),
  });
  if (!ok) fail++;
}

console.log(fail ? 'DONE_FAIL ' + fail : 'DONE_OK');
process.exit(fail ? 1 : 0);
