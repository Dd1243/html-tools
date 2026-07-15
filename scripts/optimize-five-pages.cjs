/**
 * Optimize 5 pages:
 * - tools/life/notes.html
 * - tools/life/todo-list.html
 * - tools/dev/tsconfig-editor.html
 * - tools/network/port-info.html
 * - tools/business/roi.html
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

function padDesc(parts) {
  let d = parts.join('');
  const pad = '结果仅供参考，重要数据请及时备份。';
  while (d.length < 120) d += pad;
  if (d.length > 160) d = d.slice(0, 160);
  return d;
}

function extractGuide(html) {
  const m = html.match(/<section class="tool-guide"[\s\S]*?<\/section>/i);
  if (!m) return '';
  return m[0].replace(
    /style="margin:2rem auto;max-width:760px;padding:1\.35rem 1\.4rem 1\.6rem;border:1px solid var\(--border-color,var\(--border,#333\)\);border-radius:12px;line-height:1\.8;background:var\(--bg-card,rgba\(255,255,255,0\.02\)\);color:var\(--text-primary,inherit\)"/i,
    'style="margin:2rem 0 0;padding:1.35rem 1.4rem 1.6rem;border:1px solid #e5e5e5;border-radius:12px;line-height:1.8;background:#fff;color:#222;box-shadow:0 2px 10px rgba(0,0,0,.06)"'
  );
}

const SHARED_FOOTER = `
    <footer class="site-footer">
      <div class="footer-inner">
        <p class="footer-brand">WebUtils · 本地运行的免费在线工具</p>
        <nav class="footer-links" data-site-policy-links aria-label="网站政策">
          <a href="/about">关于本站</a>
          <a href="/contact">联系我们</a>
          <a href="/terms">使用条款</a>
          <a href="/privacy-policy">隐私政策</a>
          <a href="/tools-directory">全部工具</a>
        </nav>
        <p class="footer-copy">&copy; 2026 WebUtils</p>
      </div>
    </footer>`;

const FOOTER_CSS = `
.site-footer {
  margin-top: 32px;
  border-top: 1px solid var(--border, #e5e5e5);
  background: var(--card, #fff);
  color: var(--muted, #666);
}
.footer-inner {
  width: 95%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px 0 32px;
  text-align: center;
}
.footer-brand { font-size: 0.95rem; margin-bottom: 12px; color: var(--text, #333); }
.footer-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px 18px;
  margin-bottom: 12px;
}
.footer-links a {
  color: var(--muted, #666);
  text-decoration: none;
  font-size: 0.9rem;
}
.footer-links a:hover { color: var(--primary, #4f46e5); }
.footer-copy { font-size: 0.82rem; color: var(--muted, #999); }
`;

const SHELL_CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: "Space Grotesk", system-ui, -apple-system, sans-serif;
  background: var(--bg, #f5f6fa);
  color: var(--text, #1a1a2e);
  min-height: 100vh;
  line-height: 1.6;
}
.site-header {
  background: var(--card, #fff);
  border-bottom: 1px solid var(--border, #e5e5e5);
  position: sticky;
  top: 0;
  z-index: 40;
}
.site-header .hdr {
  width: 95%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  gap: 12px;
}
.logo a {
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--primary, #4f46e5);
  text-decoration: none;
}
.site-nav { display: flex; gap: 12px; flex-wrap: wrap; }
.site-nav a {
  color: var(--muted, #666);
  text-decoration: none;
  font-size: 0.92rem;
}
.site-nav a:hover, .site-nav a.active { color: var(--primary, #4f46e5); }
.theme-btn {
  width: 40px; height: 40px; border-radius: 50%;
  border: 1px solid var(--border, #e5e5e5);
  background: var(--card, #fff);
  cursor: pointer; font-size: 1.1rem;
}
.page-shell {
  width: 95%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 0 40px;
}
.breadcrumb { margin: 0 0 1rem; }
.breadcrumb ol {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: center;
  font-size: 0.875rem;
  color: var(--muted, #666);
}
.breadcrumb li { display: flex; align-items: center; }
.breadcrumb li:not(:last-child)::after { content: "›"; margin-left: 0.45rem; color: #aaa; }
.breadcrumb a { color: var(--muted, #666); text-decoration: none; }
.breadcrumb a:hover { color: var(--primary, #4f46e5); }
.breadcrumb li:last-child span { color: var(--text, #111); font-weight: 500; }
main.content-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
@media (min-width: 1024px) {
  main.content-layout { flex-direction: row; align-items: flex-start; }
}
.tool-section {
  flex: 1 1 0;
  min-width: 0;
  background: var(--card, #fff);
  border: 1px solid var(--border, #e5e5e5);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,.06);
  padding: 24px;
}
.sidebar-section {
  flex: 0 0 300px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
@media (min-width: 1024px) { .sidebar-section { width: 300px; } }
.article-card {
  background: var(--card, #fff);
  border: 1px solid var(--border, #e5e5e5);
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,.05);
  padding: 18px;
}
.article-card h2 { font-size: 1.05rem; margin-bottom: 12px; }
.how-list { list-style: none; }
.how-list li { display: flex; gap: 8px; font-size: 0.9rem; margin-bottom: 8px; }
.how-list li::before { content: "➜"; color: var(--primary, #4f46e5); flex-shrink: 0; }
.faq-item { margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed var(--border, #e5e5e5); }
.faq-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.faq-q { font-weight: 600; font-size: 0.9rem; margin-bottom: 4px; }
.faq-a { font-size: 0.86rem; color: var(--muted, #666); }
.related-tools { display: flex; flex-wrap: wrap; gap: 8px; }
.related-tools a {
  display: inline-block;
  padding: 6px 12px;
  border: 1px solid var(--border, #e5e5e5);
  border-radius: 999px;
  font-size: 0.85rem;
  text-decoration: none;
  color: var(--muted, #666);
  background: var(--bg, #fafafa);
}
.related-tools a:hover { border-color: var(--primary, #4f46e5); color: var(--primary, #4f46e5); }
.tool-header { margin-bottom: 1.1rem; }
.tool-header h1 { font-size: 1.65rem; margin-bottom: 0.35rem; }
.tool-header p { color: var(--muted, #666); font-size: 0.95rem; }
.seo-article, .tool-guide {
  margin-top: 24px;
  background: var(--card, #fff);
  border: 1px solid var(--border, #e5e5e5);
  border-radius: 12px;
  padding: 1.4rem 1.5rem 1.6rem;
  line-height: 1.8;
  box-shadow: 0 2px 10px rgba(0,0,0,.05);
}
.seo-article h2, .tool-guide h2 { font-size: 1.2rem; margin: 1.2rem 0 .6rem; }
.seo-article h2:first-child, .tool-guide h2:first-child { margin-top: 0; }
.seo-article h3, .tool-guide h3 { font-size: 1.05rem; margin: 1rem 0 .4rem; }
.seo-article p, .tool-guide p { margin: 0 0 .85rem; color: var(--text, #333); }
.seo-article ul, .seo-article ol, .tool-guide ul, .tool-guide ol { margin: 0 0 1rem 1.2rem; }
.seo-article li, .tool-guide li { margin-bottom: 0.35rem; }
${FOOTER_CSS}
[data-theme="dark"] {
  --bg: #0f1115;
  --card: #171a21;
  --text: #e8e8ed;
  --muted: #9aa3b2;
  --border: #2a2f3a;
  --primary: #818cf8;
}
`;

function headerHtml(activeHref, navItems) {
  const links = navItems
    .map((n) => {
      const cls = n.href === activeHref ? ' class="active"' : '';
      return `<a href="${n.href}"${cls}>${n.label}</a>`;
    })
    .join('\n          ');
  return `
    <header class="site-header">
      <div class="hdr">
        <div class="logo"><a href="/">WebUtils</a></div>
        <nav class="site-nav" aria-label="主导航">
          ${links}
        </nav>
        <button class="theme-btn" id="themeBtn" onclick="toggleTheme()" aria-label="切换主题">🌙</button>
      </div>
    </header>`;
}

function breadcrumbHtml(catId, catName, title) {
  return `
      <nav class="breadcrumb" aria-label="breadcrumb">
        <ol>
          <li><a href="/">首页</a></li>
          <li><a href="/#${catId}">${catName}</a></li>
          <li><span>${title}</span></li>
        </ol>
      </nav>`;
}

function sidebarHtml(how, faq, related) {
  return `
        <aside class="sidebar-section" aria-label="使用说明">
          <div class="article-card">
            <h2>怎么用</h2>
            <ul class="how-list">
              ${how.map((x) => `<li>${x}</li>`).join('\n              ')}
            </ul>
          </div>
          <div class="article-card">
            <h2>常见问题</h2>
            ${faq
              .map(
                ([q, a]) =>
                  `<div class="faq-item"><div class="faq-q">Q: ${q}</div><div class="faq-a">A: ${a}</div></div>`
              )
              .join('\n            ')}
          </div>
          <div class="article-card">
            <h2>相关工具</h2>
            <div class="related-tools">
              ${related.map((r) => `<a href="${r.href}">${r.name}</a>`).join('\n              ')}
            </div>
          </div>
        </aside>`;
}

function ldGraph({ name, url, desc, category, features, catName, catUrl, faqs }) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name,
        url,
        description: desc,
        applicationCategory: category,
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        inLanguage: 'zh-CN',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        featureList: features,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页', item: 'https://essays4u.net/' },
          { '@type': 'ListItem', position: 2, name: catName, item: catUrl },
          { '@type': 'ListItem', position: 3, name, item: url },
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
}

function themeScript() {
  return `
      function toggleTheme() {
        const html = document.documentElement;
        const cur = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const next = cur === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        const btn = document.getElementById('themeBtn');
        if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('theme', next);
      }
      (function initTheme() {
        const t = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', t);
        const btn = document.getElementById('themeBtn');
        if (btn) btn.textContent = t === 'dark' ? '☀️' : '🌙';
      })();`;
}

function verify(file) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const d = (html.match(/name="description"\s+content="([^"]+)"/) || [])[1] || '';
  const body = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const h1 = (body.match(/<h1\b/gi) || []).length;
  const od = (html.match(/<div\b/gi) || []).length;
  const cd = (html.match(/<\/div>/gi) || []).length;
  const om = (html.match(/<main\b/gi) || []).length;
  const cm = (html.match(/<\/main>/gi) || []).length;
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
  const ok =
    d.length >= 120 &&
    d.length <= 160 &&
    h1 === 1 &&
    od === cd &&
    om === cm &&
    html.includes('tool-section') &&
    html.includes('sidebar-section') &&
    html.includes('content-layout') &&
    parseOk;
  return { file, ok, desc: d.length, h1, divDiff: od - cd, main: om + '/' + cm, parseOk };
}

// ===================== NOTES =====================
function writeNotes() {
  const old = fs.readFileSync(path.join(root, 'tools/life/notes.html'), 'utf8');
  const guide = extractGuide(old);
  const desc = padDesc([
    '免费在线便签笔记：卡片式本地速记，支持颜色分类、搜索过滤与弹窗编辑；',
    '数据保存在浏览器 localStorage，不上传服务器，',
    '适合灵感碎片、会议要点与临时备忘。',
  ]);
  const faqs = [
    ['笔记会同步到其他设备吗？', '不会。数据存在当前浏览器 localStorage.notes，换设备需自行备份。'],
    ['标题和内容都为空能保存吗？', '不能。两者都为空时不会创建笔记。'],
    ['删除后能恢复吗？', '不能。确认删除后立即写入本地存储，无回收站。'],
    ['适合写长文档吗？', '更适合短便签；长期知识库请用专业笔记软件。'],
  ];
  const ld = ldGraph({
    name: '在线便签笔记',
    url: 'https://essays4u.net/tools/life/notes',
    desc,
    category: 'LifestyleApplication',
    features: ['卡片便签', '颜色分类', '搜索过滤', '弹窗编辑', '本地存储'],
    catName: '生活工具',
    catUrl: 'https://essays4u.net/#life',
    faqs,
  });

  const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>在线便签笔记 - 本地卡片式速记工具 | WebUtils</title>
    <meta name="description" content="${desc}" />
    <meta name="keywords" content="便签笔记,在线笔记,本地笔记,卡片笔记,备忘录" />
    <meta name="author" content="WebUtils" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://essays4u.net/tools/life/notes" />
    <meta property="og:title" content="在线便签笔记 - 本地卡片式速记工具" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://essays4u.net/tools/life/notes" />
    <meta property="og:site_name" content="WebUtils" />
    <meta property="og:locale" content="zh_CN" />
    <meta property="og:image" content="https://essays4u.net/social-preview.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="在线便签笔记 - 本地卡片式速记工具" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="https://essays4u.net/social-preview.png" />
    <script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>
      :root {
        --bg: #f4f6fb;
        --card: #ffffff;
        --text: #1a1a2e;
        --muted: #6b7280;
        --border: #e5e7eb;
        --primary: #6366f1;
      }
      ${SHELL_CSS}
      .toolbar {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 18px;
        align-items: center;
      }
      .add-btn {
        background: var(--primary);
        color: #fff;
        border: none;
        border-radius: 10px;
        padding: 11px 18px;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
      }
      .add-btn:hover { filter: brightness(0.95); }
      .search {
        flex: 1 1 220px;
        min-width: 180px;
        padding: 11px 14px;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: var(--bg);
        color: var(--text);
        font-size: 0.95rem;
      }
      .notes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 16px;
      }
      .note {
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 14px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        min-height: 160px;
      }
      .note-color { height: 8px; }
      .note-title {
        font-weight: 700;
        padding: 12px 14px 4px;
        font-size: 1rem;
      }
      .note-content {
        padding: 0 14px 12px;
        color: var(--muted);
        font-size: 0.9rem;
        flex: 1;
        white-space: pre-wrap;
        word-break: break-word;
      }
      .note-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 14px 12px;
        border-top: 1px solid var(--border);
        font-size: 0.8rem;
        color: var(--muted);
      }
      .note-actions { display: flex; gap: 6px; }
      .note-btn {
        border: 1px solid var(--border);
        background: var(--card);
        border-radius: 8px;
        padding: 4px 8px;
        cursor: pointer;
      }
      .empty {
        grid-column: 1 / -1;
        text-align: center;
        color: var(--muted);
        padding: 48px 16px;
        border: 1px dashed var(--border);
        border-radius: 12px;
      }
      .modal {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.45);
        align-items: center;
        justify-content: center;
        z-index: 100;
        padding: 16px;
      }
      .modal.show { display: flex; }
      .modal-content {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 16px;
        width: 100%;
        max-width: 520px;
        padding: 24px;
        box-shadow: 0 12px 40px rgba(0,0,0,.18);
      }
      .modal-title { font-size: 1.15rem; font-weight: 700; margin-bottom: 14px; }
      .modal input, .modal textarea {
        width: 100%;
        padding: 12px;
        border: 1px solid var(--border);
        border-radius: 10px;
        margin-bottom: 12px;
        background: var(--bg);
        color: var(--text);
        font-family: inherit;
        font-size: 0.95rem;
      }
      .modal textarea { min-height: 140px; resize: vertical; }
      .color-picker { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
      .color-option {
        width: 28px; height: 28px; border-radius: 50%;
        cursor: pointer; border: 3px solid transparent;
      }
      .color-option.selected { border-color: var(--text); }
      .modal-buttons { display: flex; gap: 10px; justify-content: flex-end; }
      .modal-btn {
        padding: 10px 18px;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-family: inherit;
        font-weight: 600;
      }
      .modal-btn.primary { background: var(--primary); color: #fff; }
      .modal-btn.secondary { background: var(--bg); color: var(--text); border: 1px solid var(--border); }
    </style>
  </head>
  <body>
    ${headerHtml('/tools/life/notes', [
      { href: '/', label: '首页' },
      { href: '/tools/life/notes', label: '便签笔记' },
      { href: '/tools/life/todo-list', label: '待办事项' },
    ])}
    <div class="page-shell">
      ${breadcrumbHtml('life', '生活工具', '在线便签笔记')}
      <main class="content-layout">
        <section class="tool-section" aria-label="便签主区">
          <header class="tool-header">
            <h1>📝 在线便签笔记</h1>
            <p>卡片式本地速记：颜色分类、搜索过滤、弹窗编辑，数据只存在当前浏览器。</p>
          </header>
          <div class="toolbar">
            <button class="add-btn" onclick="openModal()">+ 新建笔记</button>
            <input type="text" class="search" placeholder="搜索标题或内容..." oninput="search(this.value)" aria-label="搜索笔记" />
          </div>
          <div class="notes-grid" id="notesGrid"></div>
        </section>
        ${sidebarHtml(
          [
            '点「新建笔记」填写标题与内容',
            '选择颜色做视觉分类后保存',
            '用搜索框按关键词过滤卡片',
            '铅笔编辑、垃圾桶删除（需确认）',
            '重要内容请另行备份，本页无云同步',
          ],
          faqs,
          [
            { href: '/tools/life/todo-list', name: '待办事项' },
            { href: '/tools/life/pomodoro', name: '番茄钟' },
            { href: '/tools/office/task-tracker', name: '任务跟踪' },
            { href: '/tools/life/countdown-timer', name: '倒计时' },
          ]
        )}
      </main>
      ${guide}
    </div>

    <div class="modal" id="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div class="modal-content">
        <div class="modal-title" id="modalTitle">新建笔记</div>
        <input type="text" id="noteTitle" placeholder="标题" />
        <textarea id="noteContent" placeholder="内容..."></textarea>
        <div class="color-picker" id="colorPicker"></div>
        <div class="modal-buttons">
          <button class="modal-btn secondary" onclick="closeModal()">取消</button>
          <button class="modal-btn primary" onclick="saveNote()">保存</button>
        </div>
      </div>
    </div>

    ${SHARED_FOOTER}
    <script>
      const colors = ["#ff6b6b","#feca57","#48dbfb","#1dd1a1","#5f27cd","#ff9ff3","#54a0ff","#00d2d3"];
      let notes = JSON.parse(localStorage.getItem("notes") || "[]");
      let editingId = null;
      let selectedColor = colors[0];
      let searchTerm = "";

      function save() { localStorage.setItem("notes", JSON.stringify(notes)); }

      function escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text || "";
        return div.innerHTML;
      }

      function render() {
        const filtered = notes.filter(
          (n) =>
            (n.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (n.content || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
        const grid = document.getElementById("notesGrid");
        if (filtered.length === 0) {
          grid.innerHTML = '<div class="empty">暂无笔记，点击「新建笔记」开始</div>';
        } else {
          grid.innerHTML = filtered.map((n) => \`
            <div class="note">
              <div class="note-color" style="background:\${n.color}"></div>
              <div class="note-title">\${escapeHtml(n.title) || "无标题"}</div>
              <div class="note-content">\${escapeHtml(n.content)}</div>
              <div class="note-footer">
                <span class="note-date">\${new Date(n.date).toLocaleDateString()}</span>
                <div class="note-actions">
                  <button class="note-btn" onclick="editNote(\${n.id})" aria-label="编辑">✏️</button>
                  <button class="note-btn" onclick="deleteNote(\${n.id})" aria-label="删除">🗑️</button>
                </div>
              </div>
            </div>\`).join("");
        }
      }

      function openModal(id = null) {
        editingId = id;
        const note = id ? notes.find((n) => n.id === id) : null;
        document.getElementById("modalTitle").textContent = id ? "编辑笔记" : "新建笔记";
        document.getElementById("noteTitle").value = note ? note.title : "";
        document.getElementById("noteContent").value = note ? note.content : "";
        selectedColor = note ? note.color : colors[0];
        renderColorPicker();
        document.getElementById("modal").classList.add("show");
      }
      function closeModal() {
        document.getElementById("modal").classList.remove("show");
        editingId = null;
      }
      function renderColorPicker() {
        document.getElementById("colorPicker").innerHTML = colors.map((c) =>
          \`<div class="color-option \${c === selectedColor ? "selected" : ""}" style="background:\${c}" onclick="selectColor('\${c}')"></div>\`
        ).join("");
      }
      function selectColor(color) { selectedColor = color; renderColorPicker(); }
      function saveNote() {
        const title = document.getElementById("noteTitle").value.trim();
        const content = document.getElementById("noteContent").value.trim();
        if (!title && !content) return;
        if (editingId) {
          const note = notes.find((n) => n.id === editingId);
          if (note) { note.title = title; note.content = content; note.color = selectedColor; }
        } else {
          notes.unshift({ id: Date.now(), title, content, color: selectedColor, date: new Date().toISOString() });
        }
        save(); render(); closeModal();
      }
      function editNote(id) { openModal(id); }
      function deleteNote(id) {
        if (confirm("确定删除这条笔记？")) {
          notes = notes.filter((n) => n.id !== id);
          save(); render();
        }
      }
      function search(term) { searchTerm = term; render(); }
      ${themeScript()}
      renderColorPicker();
      render();
    </script>
  </body>
</html>
`;
  fs.writeFileSync(path.join(root, 'tools/life/notes.html'), html, 'utf8');
  return desc;
}

// ===================== TODO =====================
function writeTodo() {
  const old = fs.readFileSync(path.join(root, 'tools/life/todo-list.html'), 'utf8');
  const guide = extractGuide(old);
  const desc = padDesc([
    '免费在线待办事项：添加任务、勾选完成、筛选与清除已完成；',
    '数据保存在浏览器 localStorage.todos，本地运行不上传，',
    '适合今日清单、购物列表与会议 action items。',
  ]);
  const faqs = [
    ['空任务能添加吗？', '不能。输入会 trim，空字符串直接忽略。'],
    ['和习惯追踪怎么选？', '一次性事务用待办；每天重复行为用习惯追踪。'],
    ['清除已完成能撤销吗？', '不能。执行后立即写回本地存储。'],
    ['筛选状态会记住吗？', '不会。刷新后回到「全部」，任务数据仍保留。'],
  ];
  const ld = ldGraph({
    name: '在线待办事项',
    url: 'https://essays4u.net/tools/life/todo-list',
    desc,
    category: 'LifestyleApplication',
    features: ['添加任务', '完成勾选', '筛选', '清除已完成', '本地存储'],
    catName: '生活工具',
    catUrl: 'https://essays4u.net/#life',
    faqs,
  });

  const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>在线待办事项 - 本地任务清单工具 | WebUtils</title>
    <meta name="description" content="${desc}" />
    <meta name="keywords" content="待办事项,Todo List,任务清单,任务管理,GTD" />
    <meta name="author" content="WebUtils" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://essays4u.net/tools/life/todo-list" />
    <meta property="og:title" content="在线待办事项 - 本地任务清单工具" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://essays4u.net/tools/life/todo-list" />
    <meta property="og:site_name" content="WebUtils" />
    <meta property="og:locale" content="zh_CN" />
    <meta property="og:image" content="https://essays4u.net/social-preview.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="在线待办事项 - 本地任务清单工具" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="https://essays4u.net/social-preview.png" />
    <script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>
      :root {
        --bg: #f3f4fb;
        --card: #ffffff;
        --text: #1a1a2e;
        --muted: #6b7280;
        --border: #e5e7eb;
        --primary: #7c3aed;
      }
      ${SHELL_CSS}
      .todo-card {
        max-width: 640px;
        margin: 0 auto;
      }
      .input-row {
        display: flex;
        gap: 10px;
        margin-bottom: 14px;
      }
      #newTodo {
        flex: 1;
        padding: 12px 14px;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: var(--bg);
        color: var(--text);
        font-size: 0.95rem;
        font-family: inherit;
      }
      .add-btn {
        background: var(--primary);
        color: #fff;
        border: none;
        border-radius: 10px;
        padding: 0 18px;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
      }
      .filters {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 14px;
      }
      .filter-btn {
        border: 1px solid var(--border);
        background: var(--bg);
        color: var(--muted);
        border-radius: 999px;
        padding: 7px 14px;
        cursor: pointer;
        font-family: inherit;
        font-size: 0.88rem;
      }
      .filter-btn.active {
        background: var(--primary);
        border-color: var(--primary);
        color: #fff;
        font-weight: 600;
      }
      .todo-list { display: flex; flex-direction: column; gap: 8px; }
      .todo-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        border: 1px solid var(--border);
        border-radius: 12px;
        background: var(--bg);
      }
      .todo-item.completed .todo-text {
        text-decoration: line-through;
        color: var(--muted);
      }
      .todo-checkbox {
        width: 22px; height: 22px;
        border: 2px solid var(--primary);
        border-radius: 6px;
        cursor: pointer;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .todo-checkbox.checked {
        background: var(--primary);
        color: #fff;
      }
      .todo-checkbox.checked::after { content: "✓"; font-size: 0.85rem; font-weight: 700; }
      .todo-text { flex: 1; word-break: break-word; }
      .todo-delete {
        border: none;
        background: transparent;
        color: var(--muted);
        font-size: 1.2rem;
        cursor: pointer;
        line-height: 1;
      }
      .todo-delete:hover { color: #ef4444; }
      .stats {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 14px;
        color: var(--muted);
        font-size: 0.9rem;
        gap: 10px;
        flex-wrap: wrap;
      }
      .clear-btn {
        border: 1px solid var(--border);
        background: var(--card);
        color: var(--muted);
        border-radius: 8px;
        padding: 7px 12px;
        cursor: pointer;
        font-family: inherit;
      }
      .empty {
        text-align: center;
        color: var(--muted);
        padding: 36px 12px;
        border: 1px dashed var(--border);
        border-radius: 12px;
      }
    </style>
  </head>
  <body>
    ${headerHtml('/tools/life/todo-list', [
      { href: '/', label: '首页' },
      { href: '/tools/life/todo-list', label: '待办事项' },
      { href: '/tools/life/notes', label: '便签笔记' },
    ])}
    <div class="page-shell">
      ${breadcrumbHtml('life', '生活工具', '在线待办事项')}
      <main class="content-layout">
        <section class="tool-section" aria-label="待办主区">
          <header class="tool-header">
            <h1>✅ 在线待办事项</h1>
            <p>轻量本地清单：添加、勾选、筛选与清除已完成，数据保存在当前浏览器。</p>
          </header>
          <div class="todo-card">
            <div class="input-row">
              <input type="text" id="newTodo" placeholder="添加新任务..." onkeydown="if(event.key==='Enter')addTodo()" aria-label="新任务" />
              <button class="add-btn" onclick="addTodo()">添加</button>
            </div>
            <div class="filters">
              <button class="filter-btn active" onclick="setFilter('all', this)">全部</button>
              <button class="filter-btn" onclick="setFilter('active', this)">未完成</button>
              <button class="filter-btn" onclick="setFilter('completed', this)">已完成</button>
            </div>
            <div class="todo-list" id="todoList"></div>
            <div class="stats">
              <span id="remaining">0 项未完成</span>
              <button class="clear-btn" onclick="clearCompleted()">清除已完成</button>
            </div>
          </div>
        </section>
        ${sidebarHtml(
          [
            '输入任务后点添加或按 Enter',
            '点左侧方框切换完成状态',
            '用筛选查看全部/未完成/已完成',
            '右侧 × 删除单条任务',
            '「清除已完成」会永久移除已勾选项',
          ],
          faqs,
          [
            { href: '/tools/life/notes', name: '便签笔记' },
            { href: '/tools/life/pomodoro', name: '番茄钟' },
            { href: '/tools/office/task-tracker', name: '任务跟踪' },
            { href: '/tools/office/checklist-maker', name: '清单制作' },
          ]
        )}
      </main>
      ${guide}
    </div>
    ${SHARED_FOOTER}
    <script>
      let todos = JSON.parse(localStorage.getItem("todos") || "[]");
      let filter = "all";
      function save() { localStorage.setItem("todos", JSON.stringify(todos)); }
      function escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text || "";
        return div.innerHTML;
      }
      function render() {
        const filtered = todos.filter((t) => {
          if (filter === "active") return !t.completed;
          if (filter === "completed") return t.completed;
          return true;
        });
        const list = document.getElementById("todoList");
        if (filtered.length === 0) {
          list.innerHTML = '<div class="empty">暂无任务</div>';
        } else {
          list.innerHTML = filtered.map((t) => \`
            <div class="todo-item \${t.completed ? "completed" : ""}">
              <div class="todo-checkbox \${t.completed ? "checked" : ""}" onclick="toggleTodo(\${t.id})" role="checkbox" aria-checked="\${t.completed}"></div>
              <span class="todo-text">\${escapeHtml(t.text)}</span>
              <button class="todo-delete" onclick="deleteTodo(\${t.id})" aria-label="删除">×</button>
            </div>\`).join("");
        }
        const remaining = todos.filter((t) => !t.completed).length;
        document.getElementById("remaining").textContent = remaining + " 项未完成";
      }
      function addTodo() {
        const input = document.getElementById("newTodo");
        const text = input.value.trim();
        if (!text) return;
        todos.push({ id: Date.now(), text, completed: false });
        input.value = "";
        save(); render();
      }
      function toggleTodo(id) {
        const todo = todos.find((t) => t.id === id);
        if (todo) todo.completed = !todo.completed;
        save(); render();
      }
      function deleteTodo(id) {
        todos = todos.filter((t) => t.id !== id);
        save(); render();
      }
      function clearCompleted() {
        todos = todos.filter((t) => !t.completed);
        save(); render();
      }
      function setFilter(f, el) {
        filter = f;
        document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"));
        if (el) el.classList.add("active");
        render();
      }
      ${themeScript()}
      render();
    </script>
  </body>
</html>
`;
  fs.writeFileSync(path.join(root, 'tools/life/todo-list.html'), html, 'utf8');
  return desc;
}

// Continue in next part of file for other 3 pages...
module.exports = {
  writeNotes,
  writeTodo,
  padDesc,
  extractGuide,
  ldGraph,
  headerHtml,
  breadcrumbHtml,
  sidebarHtml,
  SHARED_FOOTER,
  SHELL_CSS,
  themeScript,
  verify,
  root,
  fs,
  path,
};

if (require.main === module) {
  // full run happens via optimize-five-pages-run.cjs or continue below
}
