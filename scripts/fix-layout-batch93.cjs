/**
 * Batch fix: pages with <main class="container"> but no tool-section.
 * Adds page-shell + breadcrumb + content-layout + tool-section + sidebar.
 * Preserves app logic, tool-guide, and existing scripts.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const toolsJson = JSON.parse(fs.readFileSync(path.join(root, 'tools.json'), 'utf8'));
const categories = toolsJson.categories || {};
const toolsMap = toolsJson.tools || {};

// path without .html -> tool meta
const byPath = {};
for (const t of Object.values(toolsMap)) {
  if (!t || !t.path) continue;
  const key = t.path.replace(/\\/g, '/').replace(/\.html$/, '');
  byPath[key] = t;
}

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

function findTargets() {
  return walk(path.join(root, 'tools')).filter((fp) => {
    const html = fs.readFileSync(fp, 'utf8');
    return /<main\s+class="container"/.test(html) && !/class="tool-section"/.test(html);
  });
}

const EXTRA_CSS = `
/* layout fix injected */
.page-shell { width: 95%; max-width: 1200px; margin: 0 auto; padding: 20px 0 40px; }
.page-shell > .breadcrumb { margin: 0 0 1rem; }
.page-shell > .breadcrumb ol { list-style: none; display: flex; flex-wrap: wrap; gap: 0.45rem; align-items: center; font-size: 0.875rem; color: var(--text-muted, #666); padding: 0; margin: 0; }
.page-shell > .breadcrumb li { display: flex; align-items: center; }
.page-shell > .breadcrumb li:not(:last-child)::after { content: "›"; margin-left: 0.45rem; color: #999; }
.page-shell > .breadcrumb a { color: var(--text-muted, #666); text-decoration: none; }
.page-shell > .breadcrumb a:hover { color: var(--primary-color, var(--accent-primary, #007acc)); }
.page-shell > .breadcrumb li:last-child span { color: var(--text-main, var(--text-primary, #111)); font-weight: 500; }
main.content-layout { display: flex; flex-direction: column; gap: 24px; align-items: stretch; width: 100%; max-width: none; padding: 0; margin: 0; }
@media (min-width: 1024px) {
  main.content-layout { flex-direction: row; align-items: flex-start; }
}
.tool-section { flex: 1 1 0; min-width: 0; background: var(--card-bg, var(--bg-card, #fff)); padding: 25px; border-radius: var(--radius, var(--radius-md, 8px)); box-shadow: var(--shadow, 0 2px 10px rgba(0,0,0,.08)); }
.sidebar-section { flex: 0 0 300px; width: 100%; display: flex; flex-direction: column; gap: 20px; }
@media (min-width: 1024px) { .sidebar-section { width: 300px; } }
.sidebar-section .article-card { background: var(--card-bg, var(--bg-card, #fff)); padding: 20px; border-radius: var(--radius, var(--radius-md, 8px)); box-shadow: var(--shadow, 0 2px 10px rgba(0,0,0,.08)); border: 1px solid var(--border-color, var(--border-subtle, transparent)); }
.sidebar-section .article-card h2 { font-size: 1.05rem; margin: 0 0 12px; color: var(--text-main, var(--text-primary, #111)); }
.sidebar-section .how-list { list-style: none; padding: 0; margin: 0; }
.sidebar-section .how-list li { display: flex; gap: 8px; font-size: 0.9rem; margin-bottom: 8px; line-height: 1.6; color: var(--text-main, var(--text-primary, #333)); }
.sidebar-section .how-list li::before { content: "➜"; color: var(--primary-color, var(--accent-primary, #007acc)); flex-shrink: 0; }
.sidebar-section .faq-item { margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed var(--border-color, var(--border-subtle, #ddd)); }
.sidebar-section .faq-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.sidebar-section .faq-q { font-weight: 600; font-size: 0.9rem; margin-bottom: 4px; color: var(--text-main, var(--text-primary, #111)); }
.sidebar-section .faq-a { font-size: 0.86rem; color: var(--text-muted, var(--text-secondary, #666)); line-height: 1.6; }
.related-tools { display: flex; flex-wrap: wrap; gap: 8px; }
.related-tools a { display: inline-block; padding: 6px 12px; border: 1px solid var(--border-color, var(--border-subtle, #ddd)); border-radius: 999px; font-size: 0.85rem; text-decoration: none; color: var(--text-muted, var(--text-secondary, #666)); background: var(--bg-color, var(--bg-input, #fafafa)); }
.related-tools a:hover { border-color: var(--primary-color, var(--accent-primary, #007acc)); color: var(--primary-color, var(--accent-primary, #007acc)); }
.tool-guide { margin-top: 28px; }
@media print {
  .page-shell > .breadcrumb, .sidebar-section { display: none !important; }
  main.content-layout { display: block !important; }
  .page-shell { width: 100%; max-width: none; margin: 0; padding: 0; }
}
`;

function stripTags(s) {
  return String(s || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractH1(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? stripTags(m[1]) : '';
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].replace(/\s*\|\s*WebUtils\s*$/i, '').trim() : '';
}

function getMeta(fp) {
  const rel = path.relative(root, fp).replace(/\\/g, '/');
  const key = rel.replace(/\.html$/, '');
  const parts = key.split('/'); // tools, cat, slug
  const catId = parts[1] || 'tools';
  const slug = parts[2] || path.basename(key);
  const cat = categories[catId] || { name: catId };
  const tool = byPath[key] || {};
  return {
    rel,
    key,
    catId,
    slug,
    catName: cat.name || catId,
    toolName: tool.name || '',
    url: 'https://essays4u.net/' + key,
  };
}

function relatedTools(catId, selfKey, limit = 4) {
  const list = [];
  for (const t of Object.values(toolsMap)) {
    if (!t || !t.path || t.category !== catId) continue;
    const k = t.path.replace(/\\/g, '/').replace(/\.html$/, '');
    if (k === selfKey) continue;
    const abs = path.join(root, t.path.replace(/\\/g, '/'));
    if (!fs.existsSync(abs)) continue;
    list.push({
      href: '/' + k,
      name: stripTags(t.name || path.basename(k)),
    });
    if (list.length >= limit * 3) break;
  }
  // prefer shorter names / first N
  return list.slice(0, limit);
}

function extractHowFromGuide(guideHtml) {
  if (!guideHtml) return null;
  // ordered list steps
  const ol = guideHtml.match(/<ol[^>]*>([\s\S]*?)<\/ol>/i);
  if (ol) {
    const steps = [...ol[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      .map((m) => stripTags(m[1]).replace(/`[^`]+`/g, '').trim())
      .filter((s) => s.length > 2 && s.length < 80)
      .slice(0, 5);
    if (steps.length >= 3) return steps;
  }
  return null;
}

function extractFaqFromGuide(guideHtml) {
  if (!guideHtml) return null;
  const faqs = [];
  // h3 question + following p
  const re = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = re.exec(guideHtml)) && faqs.length < 4) {
    const q = stripTags(m[1]).replace(/[？?]+$/, '') + '？';
    const a = stripTags(m[2]);
    if (q.length > 4 && a.length > 4) faqs.push([q, a.slice(0, 120)]);
  }
  return faqs.length >= 2 ? faqs : null;
}

function defaultHow(crumbName) {
  return [
    '在主区域填写或调整参数',
    '查看页面即时计算结果或预览',
    '按需导出、打印或复制结果',
    '重要数据请及时备份（本地浏览器存储）',
    '公共电脑使用后清理敏感信息',
  ];
}

function defaultFaq(crumbName) {
  return [
    ['数据会上传服务器吗？', '不会。本工具在浏览器本地处理，结果与草稿默认不上传。'],
    ['刷新后数据还在吗？', '若页面使用了 localStorage，一般会保留；清除站点数据或换设备可能丢失，请先导出备份。'],
    ['适合正式业务场景吗？', '适合日常草稿与快速处理；正式合同、税务、合规流程请以官方渠道与制度为准。'],
    ['移动端能用吗？', '支持常见手机浏览器；复杂表格类页面建议横屏或桌面端操作更顺畅。'],
  ];
}

function sidebarHtml(meta, how, faq, related) {
  const howLis = how.map((x) => '<li>' + escapeHtml(x) + '</li>').join('');
  const faqBlocks = faq
    .map(
      ([q, a]) =>
        '<div class="faq-item"><div class="faq-q">Q: ' +
        escapeHtml(q) +
        '</div><div class="faq-a">A: ' +
        escapeHtml(a) +
        '</div></div>'
    )
    .join('');
  const rel = related
    .map((r) => '<a href="' + r.href + '">' + escapeHtml(r.name) + '</a>')
    .join('');
  return (
    '<aside class="sidebar-section" aria-label="使用说明">' +
    '<div class="article-card"><h2>怎么用</h2><ul class="how-list">' +
    howLis +
    '</ul></div>' +
    '<div class="article-card"><h2>常见问题</h2>' +
    faqBlocks +
    '</div>' +
    (rel
      ? '<div class="article-card"><h2>相关工具</h2><div class="related-tools">' + rel + '</div></div>'
      : '') +
    '</aside>'
  );
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function injectCss(html) {
  if (html.includes('/* layout fix injected */')) return html;
  // inject before last </style> in head if possible
  const idx = html.lastIndexOf('</style>');
  if (idx === -1) {
    return html.replace('</head>', '<style>' + EXTRA_CSS + '</style>\n</head>');
  }
  return html.slice(0, idx) + EXTRA_CSS + '\n    ' + html.slice(idx);
}

function fixRelativeLinks(html, catId) {
  // href="foo.html" -> /tools/cat/foo when same-dir sibling exists
  return html.replace(/href="([a-zA-Z0-9_-]+)\.html"/g, (full, slug) => {
    const candidate = path.join(root, 'tools', catId, slug + '.html');
    if (fs.existsSync(candidate)) {
      return 'href="/tools/' + catId + '/' + slug + '"';
    }
    // try search under tools
    const found = walk(path.join(root, 'tools')).find((p) => path.basename(p) === slug + '.html');
    if (found) {
      const rel = path.relative(root, found).replace(/\\/g, '/').replace(/\.html$/, '');
      return 'href="/' + rel + '"';
    }
    return full;
  });
}

function removeOuterBreadcrumbs(html) {
  // Remove breadcrumb that sits immediately before <main class="container">
  return html.replace(
    /(?:<!--\s*面包屑导航\s*-->\s*)?<nav class="breadcrumb"[\s\S]*?<\/nav>\s*(?=<main\s+class="container")/i,
    ''
  );
}

function restructure(html, meta) {
  const mainMatch = html.match(/<main\s+class="container"[^>]*>([\s\S]*?)<\/main>/i);
  if (!mainMatch) return { html, ok: false, reason: 'NO_MAIN' };

  let inner = mainMatch[1];

  // pull out tool-guide
  let guide = '';
  const guideMatch = inner.match(/<section\s+class="tool-guide"[\s\S]*?<\/section>/i);
  if (guideMatch) {
    guide = guideMatch[0];
    guide = guide.replace(
      /style="margin:2rem auto;max-width:760px;padding:1\.35rem 1\.4rem 1\.6rem;border:1px solid var\(--border-color,var\(--border,#333\)\);border-radius:12px;line-height:1\.8;background:var\(--bg-card,rgba\(255,255,255,0\.02\)\);color:var\(--text-primary,inherit\)"/i,
      'style="margin:2rem 0 0;padding:1.35rem 1.4rem 1.6rem;border:1px solid var(--border-color,#ddd);border-radius:12px;line-height:1.8;background:var(--card-bg,var(--bg-card,#fff));color:inherit;box-shadow:var(--shadow,0 2px 10px rgba(0,0,0,.06))"'
    );
    inner = inner.replace(guideMatch[0], '');
  }

  // remove breadcrumb inside main (we'll put a clean one in page-shell)
  inner = inner.replace(/<!--\s*面包屑导航\s*-->\s*/g, '');
  inner = inner.replace(/<nav class="breadcrumb"[\s\S]*?<\/nav>/i, '');
  // SEO placeholders
  inner = inner.replace(/<!--\s*SEO[^>]*-->/g, '');
  inner = inner.replace(/<!--\s*Sidebar\s*-->/g, '');
  inner = inner.trim();

  const h1 = extractH1(html) || extractTitle(html) || meta.toolName || meta.slug;
  const crumbName = h1 || meta.toolName || meta.slug;

  const how = extractHowFromGuide(guide) || defaultHow(crumbName);
  const faq = extractFaqFromGuide(guide) || defaultFaq(crumbName);
  const related = relatedTools(meta.catId, meta.key, 4);

  let toolInner = inner;
  if (!/class="tool-section"/.test(inner)) {
    toolInner =
      '<section class="tool-section" aria-label="工具主区">\n' + inner + '\n        </section>';
  }

  const crumb =
    '<nav class="breadcrumb" aria-label="breadcrumb">\n' +
    '        <ol>\n' +
    '          <li><a href="/">首页</a></li>\n' +
    '          <li><a href="/#' +
    meta.catId +
    '">' +
    escapeHtml(meta.catName) +
    '</a></li>\n' +
    '          <li><span>' +
    escapeHtml(crumbName) +
    '</span></li>\n' +
    '        </ol>\n' +
    '      </nav>';

  const shell =
    '<div class="page-shell container">\n' +
    '      ' +
    crumb +
    '\n' +
    '      <main class="content-layout">\n' +
    '        ' +
    toolInner +
    '\n' +
    '        ' +
    sidebarHtml(meta, how, faq, related) +
    '\n' +
    '      </main>\n' +
    (guide ? '      ' + guide + '\n' : '') +
    '    </div>';

  html = html.replace(/<main\s+class="container"[^>]*>[\s\S]*?<\/main>/i, shell);
  html = removeOuterBreadcrumbs(html);
  return { html, ok: true, crumbName };
}

function verify(html) {
  const body = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const h1 = (body.match(/<h1\b/gi) || []).length;
  const od = (html.match(/<div\b/gi) || []).length;
  const cd = (html.match(/<\/div>/gi) || []).length;
  const om = (html.match(/<main\b/gi) || []).length;
  const cm = (html.match(/<\/main>/gi) || []).length;
  return {
    h1,
    divDiff: od - cd,
    main: om + '/' + cm,
    hasTool: html.includes('class="tool-section"'),
    hasSide: html.includes('class="sidebar-section"'),
    hasLayout: html.includes('class="content-layout"'),
    hasShell: html.includes('class="page-shell"'),
    noOldMain: !/<main\s+class="container"/.test(html),
  };
}

const targets = findTargets();
console.log('TARGETS', targets.length);

let fail = 0;
const failed = [];
for (const fp of targets) {
  const meta = getMeta(fp);
  let html = fs.readFileSync(fp, 'utf8');
  html = injectCss(html);
  const res = restructure(html, meta);
  if (!res.ok) {
    fail++;
    failed.push({ file: meta.rel, reason: res.reason });
    continue;
  }
  html = res.html;
  html = fixRelativeLinks(html, meta.catId);
  fs.writeFileSync(fp, html, 'utf8');

  const v = verify(html);
  const ok =
    v.h1 === 1 &&
    v.divDiff === 0 &&
    v.main === '1/1' &&
    v.hasTool &&
    v.hasSide &&
    v.hasLayout &&
    v.hasShell &&
    v.noOldMain;
  if (!ok) {
    fail++;
    failed.push({ file: meta.rel, v });
    console.log('FAIL', meta.rel, v);
  } else {
    console.log('OK', meta.rel);
  }
}

// re-check remaining targets
const left = findTargets().length;
console.log(JSON.stringify({ done: targets.length, fail, left, failed: failed.slice(0, 20) }, null, 2));
process.exit(fail || left ? 1 : 0);
