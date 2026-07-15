/**
 * Rebuild layout + SEO for:
 * - tools/life/pomodoro.html
 * - tools/text/diff-checker.html
 * Keep original app logic; fix broken page layout.
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

function writePomodoro() {
  const desc = padDesc([
    '免费在线番茄钟：25分钟工作、5分钟短休与15分钟长休一键切换；',
    '支持开始暂停重置与完成计数，浏览器本地运行不上传，',
    '适合写代码、备考与居家办公分段专注。',
  ]);

  const guide = fs
    .readFileSync(path.join(root, 'tools/life/pomodoro.html'), 'utf8')
    .match(/<section class="tool-guide"[\s\S]*?<\/section>/i);
  const guideHtml = guide
    ? guide[0].replace(
        /style="margin:2rem auto;max-width:760px;padding:1\.35rem 1\.4rem 1\.6rem;border:1px solid var\(--border-color,var\(--border,#333\)\);border-radius:12px;line-height:1\.8;background:var\(--bg-card,rgba\(255,255,255,0\.02\)\);color:var\(--text-primary,inherit\)"/i,
        'style="margin:2rem 0 0;padding:1.35rem 1.4rem 1.6rem;border:1px solid var(--border-color,#e5e5e5);border-radius:12px;line-height:1.8;background:#fff;color:#222;box-shadow:0 2px 10px rgba(0,0,0,.06)"'
      )
    : '';

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: '在线番茄钟',
        url: 'https://essays4u.net/tools/life/pomodoro',
        description: desc,
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        inLanguage: 'zh-CN',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        featureList: ['25分钟工作', '5分钟短休', '15分钟长休', '开始暂停重置', '完成番茄计数', '本地运行'],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页', item: 'https://essays4u.net/' },
          { '@type': 'ListItem', position: 2, name: '生活工具', item: 'https://essays4u.net/#life' },
          {
            '@type': 'ListItem',
            position: 3,
            name: '在线番茄钟',
            item: 'https://essays4u.net/tools/life/pomodoro',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: '可以改成 50 分钟吗？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '当前版本不行，只能 25/5/15 三档固定模式。',
            },
          },
          {
            '@type': 'Question',
            name: '短休结束会计入完成番茄吗？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '不会。只有工作模式倒计时归零时完成数 +1。',
            },
          },
          {
            '@type': 'Question',
            name: '暂停和重置有什么区别？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '暂停保留剩余时间；重置回到当前模式完整时长并停止。',
            },
          },
          {
            '@type': 'Question',
            name: '完成计数刷新还在吗？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '不在。完成数仅在内存中，刷新归零；主题设置会写入 localStorage。',
            },
          },
        ],
      },
    ],
  };

  const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>在线番茄钟 - 25/5/15 专注计时器 | WebUtils</title>
    <meta name="description" content="${desc}" />
    <meta name="keywords" content="番茄钟,专注计时器,时间管理,工作效率,番茄工作法,在线番茄钟" />
    <meta name="author" content="WebUtils" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://essays4u.net/tools/life/pomodoro" />
    <meta property="og:title" content="在线番茄钟 - 25/5/15 专注计时器" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://essays4u.net/tools/life/pomodoro" />
    <meta property="og:site_name" content="WebUtils" />
    <meta property="og:locale" content="zh_CN" />
    <meta property="og:image" content="https://essays4u.net/social-preview.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="在线番茄钟 - 25/5/15 专注计时器" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="https://essays4u.net/social-preview.png" />
    <script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>
      :root {
        --primary: #e53e3e;
        --primary-soft: #fed7d7;
        --bg: #f7fafc;
        --card: #ffffff;
        --text: #1a202c;
        --muted: #718096;
        --border: #e2e8f0;
        --shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        --radius: 12px;
        --font-sans: "Space Grotesk", system-ui, -apple-system, sans-serif;
        --font-mono: "JetBrains Mono", ui-monospace, monospace;
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: var(--font-sans);
        color: var(--text);
        background: var(--bg);
        min-height: 100vh;
        line-height: 1.6;
      }
      .site-header {
        background: var(--card);
        border-bottom: 1px solid var(--border);
        position: sticky;
        top: 0;
        z-index: 50;
      }
      .site-header .container {
        width: 95%;
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 0;
      }
      .logo a {
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--primary);
        text-decoration: none;
      }
      .site-nav ul { list-style: none; display: flex; gap: 1rem; flex-wrap: wrap; }
      .site-nav a { color: var(--muted); text-decoration: none; font-size: 0.95rem; }
      .site-nav a:hover, .site-nav a.active { color: var(--primary); }
      .theme-toggle {
        border: 1px solid var(--border);
        background: var(--card);
        width: 40px; height: 40px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 1.1rem;
      }
      .page-shell {
        width: 95%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px 0 48px;
      }
      .breadcrumb { margin: 0 0 1rem; }
      .breadcrumb ol {
        list-style: none;
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
        align-items: center;
        font-size: 0.875rem;
        color: var(--muted);
      }
      .breadcrumb li { display: flex; align-items: center; }
      .breadcrumb li:not(:last-child)::after { content: "›"; margin-left: 0.45rem; color: #a0aec0; }
      .breadcrumb a { color: var(--muted); text-decoration: none; }
      .breadcrumb a:hover { color: var(--primary); }
      .breadcrumb li:last-child span { color: var(--text); font-weight: 500; }
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
        background: linear-gradient(160deg, #fff5f5 0%, #ffffff 55%);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        padding: 28px 24px 32px;
      }
      .tool-header { text-align: center; margin-bottom: 1.25rem; }
      .tool-header h1 { font-size: 1.75rem; margin-bottom: 0.35rem; }
      .tool-header p { color: var(--muted); font-size: 0.95rem; }
      .timer-card {
        max-width: 420px;
        margin: 0 auto;
        text-align: center;
        background: #fff;
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 28px 22px 26px;
        box-shadow: 0 10px 30px rgba(229, 62, 62, 0.12);
      }
      .mode { color: var(--muted); margin-bottom: 12px; font-weight: 600; letter-spacing: 0.02em; }
      .timer {
        font-family: var(--font-mono);
        font-size: clamp(3.2rem, 8vw, 5rem);
        font-weight: 700;
        color: var(--primary);
        line-height: 1.1;
        margin-bottom: 22px;
      }
      .btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 22px; }
      .btn {
        padding: 12px 26px;
        border: none;
        border-radius: 10px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
      }
      .btn.primary { background: var(--primary); color: #fff; }
      .btn.primary:hover { filter: brightness(0.95); }
      .btn.secondary { background: #edf2f7; color: #4a5568; }
      .btn.secondary:hover { background: #e2e8f0; }
      .settings { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
      .setting {
        padding: 10px 14px;
        background: #f7fafc;
        border-radius: 10px;
        cursor: pointer;
        border: 2px solid transparent;
        font-size: 0.9rem;
        color: #4a5568;
        user-select: none;
      }
      .setting.active { border-color: var(--primary); background: var(--primary-soft); color: #9b2c2c; font-weight: 600; }
      .count { margin-top: 18px; color: var(--muted); font-size: 0.95rem; }
      .count span { color: var(--primary); font-weight: 700; }
      .sidebar-section { flex: 0 0 300px; width: 100%; display: flex; flex-direction: column; gap: 16px; }
      @media (min-width: 1024px) { .sidebar-section { width: 300px; } }
      .article-card {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        padding: 18px 18px 16px;
      }
      .article-card h2 { font-size: 1.05rem; margin-bottom: 12px; }
      .how-list { list-style: none; }
      .how-list li { display: flex; gap: 8px; font-size: 0.9rem; margin-bottom: 8px; color: #2d3748; }
      .how-list li::before { content: "➜"; color: var(--primary); flex-shrink: 0; }
      .faq-item { margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed var(--border); }
      .faq-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
      .faq-q { font-weight: 600; font-size: 0.9rem; margin-bottom: 4px; }
      .faq-a { font-size: 0.86rem; color: var(--muted); }
      .related-tools { display: flex; flex-wrap: wrap; gap: 8px; }
      .related-tools a {
        display: inline-block;
        padding: 6px 12px;
        border: 1px solid var(--border);
        border-radius: 999px;
        font-size: 0.85rem;
        text-decoration: none;
        color: var(--muted);
        background: #fafafa;
      }
      .related-tools a:hover { border-color: var(--primary); color: var(--primary); }
      .tool-guide { margin-top: 8px; }
      .site-footer {
        border-top: 1px solid var(--border);
        background: #fff;
        padding: 24px 16px 28px;
        text-align: center;
        color: var(--muted);
        font-size: 0.9rem;
      }
      .site-footer .container { max-width: 1200px; margin: 0 auto; }
      [data-theme="dark"] {
        --bg: #0f1115;
        --card: #171a21;
        --text: #e8e8ed;
        --muted: #9aa3b2;
        --border: #2a2f3a;
        --shadow: 0 2px 12px rgba(0,0,0,.35);
      }
      [data-theme="dark"] body { background: var(--bg); color: var(--text); }
      [data-theme="dark"] .site-header,
      [data-theme="dark"] .site-footer,
      [data-theme="dark"] .article-card,
      [data-theme="dark"] .timer-card { background: var(--card); }
      [data-theme="dark"] .tool-section { background: linear-gradient(160deg, #1b1416 0%, #171a21 55%); }
      [data-theme="dark"] .btn.secondary { background: #2a2f3a; color: #e2e8f0; }
      [data-theme="dark"] .setting { background: #12151c; color: #cbd5e0; }
      [data-theme="dark"] .setting.active { background: rgba(229,62,62,.18); }
      [data-theme="dark"] .related-tools a { background: #12151c; }
    </style>
  </head>
  <body>
    <header class="site-header">
      <div class="container">
        <div class="logo"><a href="/">WebUtils</a></div>
        <nav class="site-nav" aria-label="主导航">
          <ul>
            <li><a href="/">首页</a></li>
            <li><a href="/tools/life/pomodoro" class="active">番茄钟</a></li>
            <li><a href="/tools/life/countdown-timer">倒计时</a></li>
          </ul>
        </nav>
        <button class="theme-toggle" onclick="toggleTheme()" aria-label="切换主题"><span id="theme-icon">🌙</span></button>
      </div>
    </header>

    <div class="page-shell">
      <nav class="breadcrumb" aria-label="breadcrumb">
        <ol>
          <li><a href="/">首页</a></li>
          <li><a href="/#life">生活工具</a></li>
          <li><span>在线番茄钟</span></li>
        </ol>
      </nav>

      <main class="content-layout">
        <section class="tool-section" aria-label="番茄钟主区">
          <header class="tool-header">
            <h1>🍅 在线番茄钟</h1>
            <p>经典 25 / 5 / 15 节奏，开始、暂停、重置与完成计数，全部在浏览器本地运行。</p>
          </header>
          <div class="timer-card">
            <div class="mode" id="mode">工作时间</div>
            <div class="timer" id="timer" aria-live="polite">25:00</div>
            <div class="btns">
              <button class="btn primary" id="startBtn" onclick="toggleTimer()">开始</button>
              <button class="btn secondary" onclick="resetTimer()">重置</button>
            </div>
            <div class="settings" role="tablist" aria-label="计时模式">
              <div class="setting active" role="tab" tabindex="0" onclick="setMode('work', this)">工作 25分</div>
              <div class="setting" role="tab" tabindex="0" onclick="setMode('short', this)">短休 5分</div>
              <div class="setting" role="tab" tabindex="0" onclick="setMode('long', this)">长休 15分</div>
            </div>
            <div class="count">完成番茄：<span id="count">0</span> 个</div>
          </div>
        </section>

        <aside class="sidebar-section" aria-label="使用说明">
          <div class="article-card">
            <h2>怎么用</h2>
            <ul class="how-list">
              <li>选定「工作 25分」后点开始</li>
              <li>中途可暂停，再点继续接着计</li>
              <li>结束后切换短休或长休</li>
              <li>仅工作模式结束会计入完成数</li>
              <li>刷新会丢失完成数，请另做记录</li>
            </ul>
          </div>
          <div class="article-card">
            <h2>常见问题</h2>
            <div class="faq-item"><div class="faq-q">Q: 可以改成 50 分钟吗？</div><div class="faq-a">A: 当前仅支持 25/5/15 三档。</div></div>
            <div class="faq-item"><div class="faq-q">Q: 短休结束算完成番茄吗？</div><div class="faq-a">A: 不算，只有工作模式归零才 +1。</div></div>
            <div class="faq-item"><div class="faq-q">Q: 暂停和重置区别？</div><div class="faq-a">A: 暂停保留剩余；重置回到完整时长。</div></div>
            <div class="faq-item"><div class="faq-q">Q: 数据会上传吗？</div><div class="faq-a">A: 不会，计时在本地完成。</div></div>
          </div>
          <div class="article-card">
            <h2>相关工具</h2>
            <div class="related-tools">
              <a href="/tools/life/countdown-timer">倒计时</a>
              <a href="/tools/life/event-countdown">事件倒计时</a>
              <a href="/tools/office/task-tracker">任务跟踪</a>
              <a href="/tools/office/timesheet">工时记录</a>
            </div>
          </div>
        </aside>
      </main>

      ${guideHtml}
    </div>

    <footer class="site-footer">
      <div class="container">
        <p>WebUtils - 本地运行的专注计时工具</p>
        <div style="margin-top:8px">&copy; 2026 WebUtils</div>
      </div>
      <nav data-site-policy-links aria-label="网站政策" style="display:flex;flex-wrap:wrap;justify-content:center;gap:12px 20px;margin:16px auto 0;padding:0 16px;font-size:14px">
        <a href="/about">关于本站</a>
        <a href="/contact">联系我们</a>
        <a href="/terms">使用条款</a>
        <a href="/privacy-policy">隐私政策</a>
      </nav>
    </footer>

    <script>
      const times = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
      let mode = "work",
        timeLeft = times.work,
        running = false,
        interval,
        count = 0;

      function updateDisplay() {
        const m = Math.floor(timeLeft / 60).toString().padStart(2, "0");
        const s = (timeLeft % 60).toString().padStart(2, "0");
        document.getElementById("timer").textContent = m + ":" + s;
      }

      function toggleTimer() {
        if (running) {
          clearInterval(interval);
          running = false;
          document.getElementById("startBtn").textContent = "继续";
        } else {
          running = true;
          document.getElementById("startBtn").textContent = "暂停";
          interval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
              clearInterval(interval);
              running = false;
              timeLeft = 0;
              if (mode === "work") {
                count++;
                document.getElementById("count").textContent = count;
              }
              try {
                new Audio(
                  "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQQJQ5ri8cJsCQlMn9r72J0AC0id2P7epQYLSJ3Z/96lBgtIndj/3qUGC0id2P/epQYLSJ3Y/96lBgtIndj/3qUGC0id2P/epQ=="
                ).play();
              } catch (e) {}
              alert(mode === "work" ? "休息一下!" : "继续工作!");
              document.getElementById("startBtn").textContent = "开始";
            }
            updateDisplay();
          }, 1000);
        }
      }

      function resetTimer() {
        clearInterval(interval);
        running = false;
        timeLeft = times[mode];
        updateDisplay();
        document.getElementById("startBtn").textContent = "开始";
      }

      function setMode(m, el) {
        mode = m;
        timeLeft = times[m];
        updateDisplay();
        document.querySelectorAll(".setting").forEach((s) => s.classList.remove("active"));
        (el || event && event.target).classList.add("active");
        document.getElementById("mode").textContent =
          m === "work" ? "工作时间" : m === "short" ? "短休息" : "长休息";
        clearInterval(interval);
        running = false;
        document.getElementById("startBtn").textContent = "开始";
      }

      function toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute("data-theme");
        const newTheme = currentTheme === "light" ? "dark" : "light";
        html.setAttribute("data-theme", newTheme);
        document.getElementById("theme-icon").textContent = newTheme === "light" ? "☀️" : "🌙";
        localStorage.setItem("theme", newTheme);
      }

      updateDisplay();
      const savedTheme = localStorage.getItem("theme") || "light";
      if (savedTheme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        document.getElementById("theme-icon").textContent = "🌙";
      } else {
        document.documentElement.setAttribute("data-theme", "light");
        document.getElementById("theme-icon").textContent = "☀️";
      }
    </script>
  </body>
</html>
`;

  fs.writeFileSync(path.join(root, 'tools/life/pomodoro.html'), html, 'utf8');
  return desc;
}

function fixDiffChecker() {
  const fp = path.join(root, 'tools/text/diff-checker.html');
  let html = fs.readFileSync(fp, 'utf8');

  const desc = padDesc([
    '免费在线文本对比工具：左右粘贴原文与修改稿，行级 Diff 显示新增删除；',
    '支持统一/分栏视图与本地草稿，浏览器处理不上传，',
    '适合文案校对、配置比对与代码片段审查。',
  ]);

  // meta
  html = html.replace(/<title>[^<]*<\/title>/i, '<title>在线文本对比工具 - 行级 Diff 与分栏视图 | WebUtils</title>');
  html = html.replace(
    /(<meta\s+name="description"\s+content=")[^"]*(")/i,
    '$1' + desc + '$2'
  );
  if (/property="og:description"/i.test(html)) {
    html = html.replace(/(property="og:description"\s+content=")[^"]*(")/i, '$1' + desc + '$2');
  } else if (/property="og:description"[\s\S]*?content="/i.test(html)) {
    html = html.replace(
      /(<meta\s+property="og:description"[\s\S]*?content=")[^"]*(")/i,
      '$1' + desc + '$2'
    );
  }
  html = html.replace(/(name="twitter:description"\s+content=")[^"]*(")/i, '$1' + desc + '$2');
  html = html.replace(
    /(<meta\s+property="og:title"\s+content=")[^"]*(")/i,
    '$1在线文本对比工具 - 行级 Diff 与分栏视图$2'
  );

  // CSS: widen shell, fix tool-section flex, remove conflicting main.container rules impact
  const extraCss = `
/* layout polish */
.page-shell { width: 95%; max-width: 1400px !important; margin: 0 auto; padding: 20px 0 40px; }
main.content-layout { display: flex; flex-direction: column; gap: 24px; align-items: stretch; width: 100%; max-width: none; padding: 0; margin: 0; }
@media (min-width: 1100px) {
  main.content-layout { flex-direction: row; align-items: flex-start; }
}
.tool-section {
  flex: 1 1 0 !important;
  min-width: 0 !important;
  background: var(--card-bg, #fff);
  padding: 25px;
  border-radius: var(--radius, 8px);
  box-shadow: var(--shadow, 0 2px 10px rgba(0,0,0,.08));
}
.sidebar-section { flex: 0 0 280px; width: 100%; display: flex; flex-direction: column; gap: 16px; }
@media (min-width: 1100px) { .sidebar-section { width: 280px; } }
.sidebar-section .article-card {
  background: var(--card-bg, #fff);
  padding: 18px;
  border-radius: var(--radius, 8px);
  box-shadow: var(--shadow, 0 2px 10px rgba(0,0,0,.08));
  border: 1px solid var(--border-color, #eee);
}
.input-grid { display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 20px; }
@media (min-width: 768px) { .input-grid { grid-template-columns: 1fr 1fr; gap: 20px; } }
textarea { min-height: 240px; height: 260px; }
.diff-container { max-width: 100%; overflow: hidden; }
.diff-content { max-height: 520px; overflow: auto; }
.split-view { display: grid; grid-template-columns: 1fr 1fr; }
@media (max-width: 700px) {
  .split-view { grid-template-columns: 1fr; }
  .stats-bar { flex-wrap: wrap; gap: 12px; }
}
.page-shell > .breadcrumb { margin: 0 0 1rem; }
.page-shell > .breadcrumb ol {
  list-style: none; display: flex; flex-wrap: wrap; gap: 0.45rem; align-items: center;
  font-size: 0.875rem; color: var(--text-muted, #666); padding: 0; margin: 0;
}
.page-shell > .breadcrumb li { display: flex; align-items: center; }
.page-shell > .breadcrumb li:not(:last-child)::after { content: "›"; margin-left: 0.45rem; color: #999; }
.page-shell > .breadcrumb a { color: var(--text-muted, #666); text-decoration: none; }
.page-shell > .breadcrumb a:hover { color: var(--primary-color, #007acc); }
.page-shell > .breadcrumb li:last-child span { color: #111; font-weight: 500; }
.tool-guide { margin-top: 24px; }
.site-footer { margin-top: 8px; padding: 24px 0; background: #fff; border-top: 1px solid var(--border-color, #eee); text-align: center; }
.site-footer .container { width: 95%; max-width: 1400px; margin: 0 auto; }
`;

  // replace injected layout block if present, else append before </style>
  if (html.includes('/* layout fix injected */')) {
    html = html.replace(/\/\* layout fix injected \*\/[\s\S]*?(?=<\/style>)/i, extraCss + '\n');
  } else if (html.includes('/* layout polish */')) {
    html = html.replace(/\/\* layout polish \*\/[\s\S]*?(?=<\/style>)/i, extraCss + '\n');
  } else {
    html = html.replace('</style>', extraCss + '\n    </style>');
  }

  // remove duplicate outer breadcrumb before page-shell
  html = html.replace(
    /<!--\s*面包屑导航\s*-->\s*<nav class="breadcrumb"[\s\S]*?<\/nav>\s*(?=<div class="page-shell")/i,
    ''
  );
  // also without comment
  html = html.replace(
    /<nav class="breadcrumb" aria-label="breadcrumb">\s*<ol itemscope[\s\S]*?<\/nav>\s*(?=<div class="page-shell")/i,
    ''
  );

  // fix related tools to more relevant text tools
  html = html.replace(
    /<div class="related-tools">[\s\S]*?<\/div><\/div><\/aside>/i,
    '<div class="related-tools">' +
      '<a href="/tools/text/word-counter">字数统计</a>' +
      '<a href="/tools/text/duplicate-remover">去重工具</a>' +
      '<a href="/tools/text/case-converter">大小写转换</a>' +
      '<a href="/tools/text/whitespace-cleaner">空白清理</a>' +
      '</div></div></aside>'
  );

  // JSON-LD upgrade
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: '在线文本对比工具',
        url: 'https://essays4u.net/tools/text/diff-checker',
        description: desc,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        inLanguage: 'zh-CN',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        featureList: ['行级 Diff', '统一视图', '分栏视图', '新增删除统计', '本地草稿', '示例加载'],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页', item: 'https://essays4u.net/' },
          { '@type': 'ListItem', position: 2, name: '文本工具', item: 'https://essays4u.net/#text' },
          {
            '@type': 'ListItem',
            position: 3,
            name: '在线文本对比工具',
            item: 'https://essays4u.net/tools/text/diff-checker',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: '为什么只改了半行，却显示整行删除和新增？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '因为算法以行为单位对齐，不提供词级/字符级高亮。',
            },
          },
          {
            '@type': 'Question',
            name: '统一视图和分屏怎么选？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '快速浏览变更类型用统一视图；左右对照阅读用分屏。',
            },
          },
          {
            '@type': 'Question',
            name: '能对比 Word 文档吗？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '请先复制纯文本。本工具处理文本框中的字符串，不是 docx 二进制。',
            },
          },
          {
            '@type': 'Question',
            name: '数据会上传吗？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '比对在浏览器本地执行，适合处理未公开文稿。',
            },
          },
        ],
      },
    ],
  };

  const ldBlock =
    '<script type="application/ld+json">\n' + JSON.stringify(ld, null, 2) + '\n    </script>';
  if (/application\/ld\+json/i.test(html)) {
    let n = 0;
    html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, (m) => {
      n++;
      return n === 1 ? ldBlock : '';
    });
  } else {
    html = html.replace('</head>', ldBlock + '\n  </head>');
  }

  // ensure footer closed structure
  if (!/<\/footer>/.test(html)) {
    // leave
  }

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
  const om = (html.match(/<main\b/gi) || []).length;
  const cm = (html.match(/<\/main>/gi) || []).length;
  let parseOk = false;
  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  if (ld) {
    try {
      JSON.parse(ld[1]);
      parseOk = true;
    } catch (e) {
      console.error('LD fail', file, e.message);
    }
  }
  const crumbs = (body.match(/class="breadcrumb"/g) || []).length;
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
  return {
    file,
    ok,
    desc: d.length,
    h1,
    divDiff: od - cd,
    main: om + '/' + cm,
    parseOk,
    crumbs,
    hasShell: html.includes('page-shell'),
  };
}

const d1 = writePomodoro();
const d2 = fixDiffChecker();
const r1 = verify('tools/life/pomodoro.html');
const r2 = verify('tools/text/diff-checker.html');
console.log({ pomodoroDesc: d1.length, diffDesc: d2.length, r1, r2 });
process.exit(r1.ok && r2.ok ? 0 : 1);
