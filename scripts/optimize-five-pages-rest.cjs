/**
 * Optimize remaining 3 pages + run all five.
 */
const base = require('./optimize-five-pages.cjs');
const {
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
  writeNotes,
  writeTodo,
} = base;

function writeTsconfig() {
  const old = fs.readFileSync(path.join(root, 'tools/dev/tsconfig-editor.html'), 'utf8');
  // extract article content
  const art = old.match(/<article class="article-content">([\s\S]*?)<\/article>/i);
  let articleBody = art
    ? art[1]
    : `
        <h2>什么是 tsconfig.json？</h2>
        <p>tsconfig.json 定义 TypeScript 编译选项与包含文件，是 tsc 与多数前端构建工具的核心配置。</p>
      `;
  // strip fas icons dependency by simplifying later UI

  const desc = padDesc([
    '免费 tsconfig.json 可视化编辑器：一键 Node/React/库预设，勾选严格模式与模块选项，',
    '实时预览 JSON 并支持复制下载，浏览器本地生成不上传，',
    '适合 TypeScript 项目快速起步与配置对照。',
  ]);
  const faqs = [
    ['生成的配置会上传吗？', '不会。全部在浏览器本地生成 JSON。'],
    ['Vue 预设和 React 有何不同？', 'Vue 预设将 jsx 设为 none；React 使用 react-jsx。'],
    ['strict 开启后还要单独勾吗？', 'strict 会覆盖一组严格检查；仍可单独理解各子项含义。'],
    ['下载文件名是什么？', '固定为 tsconfig.json，可直接放到项目根目录。'],
  ];
  const ld = ldGraph({
    name: 'tsconfig.json 编辑器',
    url: 'https://essays4u.net/tools/dev/tsconfig-editor',
    desc,
    category: 'DeveloperApplication',
    features: ['场景预设', '实时预览', '复制 JSON', '下载配置', '严格模式开关'],
    catName: '开发工具',
    catUrl: 'https://essays4u.net/#dev',
    faqs,
  });

  const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>tsconfig.json 编辑器 - TypeScript 配置可视化生成 | WebUtils</title>
    <meta name="description" content="${desc}" />
    <meta name="keywords" content="tsconfig,TypeScript配置,tsconfig编辑器,strict,compilerOptions" />
    <meta name="author" content="WebUtils" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://essays4u.net/tools/dev/tsconfig-editor" />
    <meta property="og:title" content="tsconfig.json 编辑器 - TypeScript 配置可视化生成" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://essays4u.net/tools/dev/tsconfig-editor" />
    <meta property="og:site_name" content="WebUtils" />
    <meta property="og:locale" content="zh_CN" />
    <meta property="og:image" content="https://essays4u.net/social-preview.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="tsconfig.json 编辑器" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="https://essays4u.net/social-preview.png" />
    <script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>
      :root {
        --bg: #f4f6fb;
        --card: #ffffff;
        --text: #1a1a2e;
        --muted: #6b7280;
        --border: #e5e7eb;
        --primary: #2563eb;
      }
      ${SHELL_CSS}
      .page-shell { max-width: 1280px; }
      .ts-layout {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
      }
      @media (min-width: 1100px) {
        .ts-layout { grid-template-columns: 220px 1fr 320px; align-items: start; }
      }
      .preset-list, .editor-card, .preview-card {
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 14px;
      }
      .preset-list h3, .editor-card h3, .preview-card h3 {
        font-size: 0.95rem;
        margin-bottom: 10px;
      }
      .preset-btn {
        width: 100%;
        text-align: left;
        border: 1px solid var(--border);
        background: var(--card);
        border-radius: 10px;
        padding: 10px 12px;
        margin-bottom: 8px;
        cursor: pointer;
        font-family: inherit;
        color: var(--text);
      }
      .preset-btn:hover { border-color: var(--primary); }
      .preset-btn strong { display: block; font-size: 0.9rem; }
      .preset-btn span { display: block; font-size: 0.78rem; color: var(--muted); margin-top: 2px; }
      .option-group { margin-bottom: 18px; }
      .option-group h4 {
        font-size: 0.92rem;
        margin-bottom: 10px;
        color: var(--primary);
      }
      .options-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
      }
      @media (min-width: 700px) {
        .options-grid { grid-template-columns: 1fr 1fr; }
      }
      .option-item label {
        display: block;
        font-family: "JetBrains Mono", monospace;
        font-size: 0.85rem;
        margin-bottom: 6px;
      }
      .option-item select {
        width: 100%;
        padding: 9px 10px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--card);
        color: var(--text);
        font-family: inherit;
      }
      .option-desc { display: block; font-size: 0.8rem; color: var(--muted); margin-top: 4px; }
      .checkbox-item {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        padding: 10px;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: var(--card);
      }
      .checkbox-item input { margin-top: 3px; }
      #output {
        margin: 0;
        padding: 12px;
        background: #0f172a;
        color: #e2e8f0;
        border-radius: 10px;
        font-family: "JetBrains Mono", monospace;
        font-size: 0.8rem;
        line-height: 1.5;
        max-height: 420px;
        overflow: auto;
        white-space: pre-wrap;
        word-break: break-word;
      }
      [data-theme="dark"] #output { background: #0b0f19; }
      .btn-row { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
      .btn {
        border: none;
        border-radius: 8px;
        padding: 9px 14px;
        cursor: pointer;
        font-family: inherit;
        font-weight: 600;
        font-size: 0.88rem;
      }
      .btn.primary { background: var(--primary); color: #fff; }
      .btn.secondary { background: var(--card); border: 1px solid var(--border); color: var(--text); }
      .reset-btn {
        width: 100%;
        margin-top: 6px;
        border: 1px dashed var(--border);
        background: transparent;
        color: var(--muted);
        border-radius: 8px;
        padding: 9px;
        cursor: pointer;
        font-family: inherit;
      }
    </style>
  </head>
  <body>
    ${headerHtml('/tools/dev/tsconfig-editor', [
      { href: '/', label: '首页' },
      { href: '/tools/dev/tsconfig-editor', label: 'tsconfig' },
      { href: '/tools/dev/package-json-editor', label: 'package.json' },
    ])}
    <div class="page-shell">
      ${breadcrumbHtml('dev', '开发工具', 'tsconfig.json 编辑器')}
      <main class="content-layout">
        <section class="tool-section" aria-label="tsconfig 编辑器主区">
          <header class="tool-header">
            <h1>tsconfig.json 编辑器</h1>
            <p>可视化配置 TypeScript 编译选项：预设模板 + 实时 JSON 预览，本地生成可复制下载。</p>
          </header>
          <div class="ts-layout">
            <div class="preset-list">
              <h3>快速预设</h3>
              <button class="preset-btn" onclick="loadPreset('node')"><strong>Node.js 项目</strong><span>现代后端 NodeNext</span></button>
              <button class="preset-btn" onclick="loadPreset('react')"><strong>React 项目</strong><span>react-jsx + bundler</span></button>
              <button class="preset-btn" onclick="loadPreset('vue')"><strong>Vue 3 项目</strong><span>jsx: none</span></button>
              <button class="preset-btn" onclick="loadPreset('library')"><strong>NPM 库开发</strong><span>declaration + outDir</span></button>
              <button class="preset-btn" onclick="loadPreset('strict')"><strong>极致严格模式</strong><span>全部严格开关</span></button>
              <button class="reset-btn" onclick="resetConfig()">重置配置</button>
            </div>

            <div class="editor-card">
              <div class="option-group">
                <h4>基础选项</h4>
                <div class="options-grid">
                  <div class="option-item">
                    <label for="target"><code>target</code></label>
                    <select id="target" onchange="update()">
                      <option value="ES5">ES5</option>
                      <option value="ES6">ES6/ES2015</option>
                      <option value="ES2018">ES2018</option>
                      <option value="ES2020">ES2020</option>
                      <option value="ES2022" selected>ES2022</option>
                      <option value="ESNext">ESNext</option>
                    </select>
                    <span class="option-desc">生成的 JavaScript 目标版本</span>
                  </div>
                  <div class="option-item">
                    <label for="module"><code>module</code></label>
                    <select id="module" onchange="update()">
                      <option value="CommonJS">CommonJS</option>
                      <option value="ESNext" selected>ESNext</option>
                      <option value="NodeNext">NodeNext</option>
                      <option value="Node16">Node16</option>
                    </select>
                    <span class="option-desc">模块系统</span>
                  </div>
                  <div class="option-item">
                    <label for="jsx"><code>jsx</code></label>
                    <select id="jsx" onchange="update()">
                      <option value="none">None</option>
                      <option value="preserve">Preserve</option>
                      <option value="react-jsx" selected>React-JSX (v17+)</option>
                      <option value="react">React (Legacy)</option>
                    </select>
                    <span class="option-desc">.tsx 中 JSX 处理方式</span>
                  </div>
                </div>
              </div>

              <div class="option-group">
                <h4>严格检查</h4>
                <div class="options-grid">
                  <div class="checkbox-item"><input type="checkbox" id="strict" checked onchange="update()" /><div><label for="strict"><code>strict</code></label><span class="option-desc">启用全部严格类型检查</span></div></div>
                  <div class="checkbox-item"><input type="checkbox" id="noImplicitAny" checked onchange="update()" /><div><label for="noImplicitAny"><code>noImplicitAny</code></label><span class="option-desc">禁止隐式 any</span></div></div>
                  <div class="checkbox-item"><input type="checkbox" id="strictNullChecks" checked onchange="update()" /><div><label for="strictNullChecks"><code>strictNullChecks</code></label><span class="option-desc">严格 null/undefined</span></div></div>
                </div>
              </div>

              <div class="option-group">
                <h4>模块互操作</h4>
                <div class="options-grid">
                  <div class="checkbox-item"><input type="checkbox" id="esModuleInterop" checked onchange="update()" /><div><label for="esModuleInterop"><code>esModuleInterop</code></label><span class="option-desc">改善 CJS/ESM 互操作</span></div></div>
                  <div class="checkbox-item"><input type="checkbox" id="skipLibCheck" checked onchange="update()" /><div><label for="skipLibCheck"><code>skipLibCheck</code></label><span class="option-desc">跳过 .d.ts 检查</span></div></div>
                  <div class="checkbox-item"><input type="checkbox" id="forceConsistentCasingInFileNames" checked onchange="update()" /><div><label for="forceConsistentCasingInFileNames"><code>forceConsistentCasingInFileNames</code></label><span class="option-desc">强制文件名大小写一致</span></div></div>
                </div>
              </div>
            </div>

            <div class="preview-card">
              <h3>预览 tsconfig.json</h3>
              <pre id="output"></pre>
              <div class="btn-row">
                <button class="btn secondary" onclick="copyResult()">复制</button>
                <button class="btn primary" onclick="downloadConfig()">下载配置</button>
              </div>
            </div>
          </div>
        </section>
        ${sidebarHtml(
          [
            '从左侧选择最接近的项目预设',
            '在中间调整 target/module/jsx 与严格项',
            '右侧实时查看生成的 JSON',
            '复制到剪贴板或下载 tsconfig.json',
            '按项目实际再微调 outDir/include 等字段',
          ],
          faqs,
          [
            { href: '/tools/dev/package-json-editor', name: 'package.json 编辑' },
            { href: '/tools/dev/json-formatter', name: 'JSON 格式化' },
            { href: '/tools/dev/gitignore-generator', name: 'gitignore 生成' },
            { href: '/tools/dev/env-editor', name: '环境变量编辑' },
          ]
        )}
      </main>
      <article class="seo-article" aria-label="使用说明文章">
        ${articleBody}
      </article>
    </div>
    ${SHARED_FOOTER}
    <script>
      const outputEl = document.getElementById("output");
      const state = {
        compilerOptions: {
          target: "ES2022",
          module: "ESNext",
          moduleResolution: "bundler",
          jsx: "react-jsx",
          strict: true,
          noImplicitAny: true,
          strictNullChecks: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          allowJs: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true
        },
        include: ["src"]
      };

      function update() {
        state.compilerOptions.target = document.getElementById("target").value;
        state.compilerOptions.module = document.getElementById("module").value;
        state.compilerOptions.jsx = document.getElementById("jsx").value;
        state.compilerOptions.strict = document.getElementById("strict").checked;
        state.compilerOptions.noImplicitAny = document.getElementById("noImplicitAny").checked;
        state.compilerOptions.strictNullChecks = document.getElementById("strictNullChecks").checked;
        state.compilerOptions.esModuleInterop = document.getElementById("esModuleInterop").checked;
        state.compilerOptions.skipLibCheck = document.getElementById("skipLibCheck").checked;
        state.compilerOptions.forceConsistentCasingInFileNames = document.getElementById("forceConsistentCasingInFileNames").checked;
        if (state.compilerOptions.jsx === "none") delete state.compilerOptions.jsx;
        render();
        if (!state.compilerOptions.jsx) state.compilerOptions.jsx = "none";
      }

      function render() {
        const copy = JSON.parse(JSON.stringify(state));
        if (copy.compilerOptions.jsx === "none") delete copy.compilerOptions.jsx;
        outputEl.textContent = JSON.stringify(copy, null, 2);
      }

      function loadPreset(type) {
        resetConfig(false);
        if (type === "node") {
          state.compilerOptions.module = "NodeNext";
          state.compilerOptions.moduleResolution = "NodeNext";
          state.compilerOptions.jsx = "none";
          state.compilerOptions.noEmit = false;
          state.compilerOptions.outDir = "./dist";
        } else if (type === "react") {
          state.compilerOptions.jsx = "react-jsx";
        } else if (type === "vue") {
          state.compilerOptions.jsx = "none";
        } else if (type === "library") {
          state.compilerOptions.declaration = true;
          state.compilerOptions.sourceMap = true;
          state.compilerOptions.noEmit = false;
          state.compilerOptions.outDir = "./lib";
        } else if (type === "strict") {
          state.compilerOptions.strict = true;
          state.compilerOptions.noImplicitAny = true;
          state.compilerOptions.strictNullChecks = true;
          state.compilerOptions.noUnusedLocals = true;
          state.compilerOptions.noUnusedParameters = true;
          state.compilerOptions.noFallthroughCasesInSwitch = true;
        }
        syncUI();
        render();
      }

      function syncUI() {
        document.getElementById("target").value = state.compilerOptions.target;
        document.getElementById("module").value = state.compilerOptions.module;
        document.getElementById("jsx").value = state.compilerOptions.jsx || "none";
        document.getElementById("strict").checked = !!state.compilerOptions.strict;
        document.getElementById("noImplicitAny").checked = !!state.compilerOptions.noImplicitAny;
        document.getElementById("strictNullChecks").checked = !!state.compilerOptions.strictNullChecks;
        document.getElementById("esModuleInterop").checked = !!state.compilerOptions.esModuleInterop;
        document.getElementById("skipLibCheck").checked = !!state.compilerOptions.skipLibCheck;
        document.getElementById("forceConsistentCasingInFileNames").checked = !!state.compilerOptions.forceConsistentCasingInFileNames;
      }

      function resetConfig(doRender = true) {
        state.compilerOptions = {
          target: "ES2022",
          module: "ESNext",
          moduleResolution: "bundler",
          jsx: "react-jsx",
          strict: true,
          noImplicitAny: true,
          strictNullChecks: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          allowJs: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true
        };
        state.include = ["src"];
        syncUI();
        if (doRender) render();
      }

      function copyResult() {
        navigator.clipboard.writeText(outputEl.textContent).then(() => alert("配置已复制到剪贴板！"));
      }
      function downloadConfig() {
        const blob = new Blob([outputEl.textContent], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "tsconfig.json";
        a.click();
        URL.revokeObjectURL(url);
      }
      ${themeScript()}
      render();
    </script>
  </body>
</html>
`;
  fs.writeFileSync(path.join(root, 'tools/dev/tsconfig-editor.html'), html, 'utf8');
  return desc;
}

function writePortInfo() {
  const old = fs.readFileSync(path.join(root, 'tools/network/port-info.html'), 'utf8');
  // extract ports array
  const portsMatch = old.match(/const ports = (\[[\s\S]*?\]);/);
  if (!portsMatch) throw new Error('ports data not found');
  const portsLiteral = portsMatch[1];

  const oldArticle = old.match(/<section class="article-section">([\s\S]*?)<\/section>/i);
  const oldArticleInner = oldArticle ? oldArticle[1] : '';

  const desc = padDesc([
    '免费常用端口号查询：按端口或服务名搜索 HTTP/MySQL/SSH 等 TCP/UDP 端口，',
    '支持 Web、数据库、远程、邮件分类筛选，本地查询不上传，',
    '附端口范围与安全建议 SEO 指南，适合运维与开发排查。',
  ]);
  const faqs = [
    ['0-1023 是什么端口？', '知名端口，由 IANA 分配给核心服务，如 80/443/22。'],
    ['本工具会扫描我的主机吗？', '不会。只做本地端口知识库检索，不发起网络探测。'],
    ['数据库端口该暴露公网吗？', '通常不应。3306/5432 等应限内网或经 VPN/堡垒机访问。'],
    ['TCP 和 UDP 有何区别？', 'TCP 可靠面向连接；UDP 更快无连接，适合 DNS/实时流。'],
  ];
  const ld = ldGraph({
    name: '常用端口号查询',
    url: 'https://essays4u.net/tools/network/port-info',
    desc,
    category: 'UtilitiesApplication',
    features: ['端口搜索', '服务名搜索', '分类筛选', 'TCP/UDP 标注', '本地查询'],
    catName: '网络工具',
    catUrl: 'https://essays4u.net/#network',
    faqs,
  });

  const seoArticle = `
      <article class="seo-article" aria-label="端口号 SEO 指南">
        <h2>常用端口号完全指南：从查询到安全实践</h2>
        <p>端口号是 TCP/IP 通信中的“门牌号”。IP 定位主机，端口定位主机上的服务。运维、开发和安全排查时，快速确认 <strong>80、443、22、3306、6379</strong> 等端口对应关系，能显著缩短故障定位时间。本页提供本地可检索的常用端口表，并补充范围划分、场景用法与暴露面控制建议。</p>

        <h2>端口号三段范围怎么记？</h2>
        <ul>
          <li><strong>0–1023 知名端口：</strong>系统级服务常用，如 HTTP 80、HTTPS 443、SSH 22、DNS 53。监听通常需要更高权限。</li>
          <li><strong>1024–49151 注册端口：</strong>应用与中间件常见，如 MySQL 3306、PostgreSQL 5432、Redis 6379、RDP 3389。</li>
          <li><strong>49152–65535 动态/私有端口：</strong>客户端临时源端口居多，也可用于自定义服务，但要在文档与防火墙中明确登记。</li>
        </ul>

        <h2>如何用本工具排查问题？</h2>
        <ol>
          <li>在搜索框输入端口数字或服务名关键词（如 <code>mysql</code>、<code>ssh</code>）。</li>
          <li>结合分类页签缩小范围：Web、数据库、远程访问、邮件、文件传输。</li>
          <li>确认协议是 TCP、UDP 还是两者，再对照服务器监听与安全组规则。</li>
          <li>将“必须对外开放”的端口列清单，其余默认拒绝。</li>
        </ol>

        <h2>典型场景</h2>
        <h3>网站打不开</h3>
        <p>先确认 80/443 是否监听，再查云厂商安全组、本机防火墙与反向代理配置。本工具帮你快速确认标准端口，避免把 HTTPS 误配到错误端口。</p>
        <h3>数据库被扫</h3>
        <p>MySQL/MongoDB/Redis 等端口若直接暴露公网，风险极高。应限制来源 IP，优先内网 + VPN/堡垒机，并关闭匿名与弱口令。</p>
        <h3>远程桌面与 SSH</h3>
        <p>RDP 3389、SSH 22 是高频扫描目标。可改非标准端口、启用密钥登录、限制来源网段，并配合失败锁定策略。</p>

        <h2>TCP 与 UDP 选择原则</h2>
        <p><strong>TCP</strong> 适合需要可靠交付的 Web、邮件、文件与数据库会话；<strong>UDP</strong> 适合 DNS、部分实时音视频与低延迟探测。配置防火墙时不要只放行端口数字而忽略协议类型。</p>

        <h2>安全建议清单</h2>
        <ul>
          <li>最小暴露：公网只开放业务必需端口（常见仅 80/443）。</li>
          <li>管理面隔离：SSH/RDP/数据库不直接对全网 0.0.0.0/0 放行。</li>
          <li>变更可追溯：改端口后更新运维文档、监控与告警规则。</li>
          <li>定期核对：对照本页端口表审查实际开放清单，清理僵尸服务。</li>
        </ul>

        <h2>本工具能力边界</h2>
        <p>本页是<strong>端口知识检索</strong>，不会扫描你的主机，也不会判断某端口当前是否开放。若需要实际连通性检测，请使用专业端口扫描/探测流程，并遵守法律法规与授权范围。结果仅供学习与日常运维参考。</p>

        ${oldArticleInner
          .replace(/<h2[^>]*>[\s\S]*?<\/h2>/i, '')
          .replace(/^\s+/, '')
          .slice(0, 0)}
      </article>`;

  // keep old article content merged more carefully
  const mergedSeo = `
      <article class="seo-article" aria-label="端口号 SEO 指南">
        <h2>常用端口号完全指南：从查询到安全实践</h2>
        <p>端口号是 TCP/IP 通信中的“门牌号”。IP 定位主机，端口定位主机上的服务。运维、开发和安全排查时，快速确认 <strong>80、443、22、3306、6379</strong> 等端口对应关系，能显著缩短故障定位时间。本页提供本地可检索的常用端口表，并补充范围划分、场景用法与暴露面控制建议。</p>

        <h2>端口号三段范围怎么记？</h2>
        <ul>
          <li><strong>0–1023 知名端口：</strong>系统级服务常用，如 HTTP 80、HTTPS 443、SSH 22、DNS 53。监听通常需要更高权限。</li>
          <li><strong>1024–49151 注册端口：</strong>应用与中间件常见，如 MySQL 3306、PostgreSQL 5432、Redis 6379、RDP 3389。</li>
          <li><strong>49152–65535 动态/私有端口：</strong>客户端临时源端口居多，也可用于自定义服务，但要在文档与防火墙中明确登记。</li>
        </ul>

        <h2>如何用本工具排查问题？</h2>
        <ol>
          <li>在搜索框输入端口数字或服务名关键词（如 mysql、ssh）。</li>
          <li>结合分类页签缩小范围：Web、数据库、远程访问、邮件、文件传输。</li>
          <li>确认协议是 TCP、UDP 还是两者，再对照服务器监听与安全组规则。</li>
          <li>将“必须对外开放”的端口列清单，其余默认拒绝。</li>
        </ol>

        <h2>典型场景与协议要点</h2>
        <p><strong>网站打不开：</strong>先确认 80/443 是否监听，再查安全组、防火墙与反向代理。本工具帮你确认标准端口，避免把 HTTPS 误配到错误端口。</p>
        <p><strong>数据库暴露风险：</strong>MySQL/MongoDB/Redis 等端口若直接对公网开放，风险极高。应限制来源 IP，优先内网 + VPN/堡垒机。</p>
        <p><strong>远程管理面：</strong>RDP 3389、SSH 22 是高频扫描目标。可改非标准端口、启用密钥登录、限制来源网段。</p>
        <p><strong>TCP 与 UDP：</strong>TCP 可靠面向连接，适合 Web/邮件/数据库；UDP 更快无连接，适合 DNS 与部分实时业务。放行规则要同时匹配端口与协议。</p>

        <h2>安全建议清单</h2>
        <ul>
          <li>最小暴露：公网只开放业务必需端口（常见仅 80/443）。</li>
          <li>管理面隔离：SSH/RDP/数据库不对全网任意来源放行。</li>
          <li>变更可追溯：改端口后同步更新文档、监控与告警。</li>
          <li>定期核对：对照端口表审查实际开放清单，清理僵尸服务。</li>
        </ul>

        <h2>能力边界</h2>
        <p>本页是端口知识检索，不会扫描主机，也不会判断某端口当前是否开放。实际连通性检测请使用经授权的专业流程。内容仅供学习与日常运维参考。</p>

        <h2>补充：端口在网络栈中的位置</h2>
        <p>传输层（TCP/UDP）使用端口区分同一主机上的多个会话。常见排错顺序是：DNS 是否解析正确 → 安全组/防火墙是否放行 → 进程是否监听目标端口 → 应用是否绑定正确网卡。把“端口含义”与“监听状态、访问控制”分开看，可以避免只改应用配置却忽略网络层拒绝。</p>

        <h2>常见问题速查</h2>
        <h3>为什么有的服务同时写 TCP/UDP？</h3>
        <p>例如 DNS 53 在不同场景可能使用两种协议。配置防火墙时要按实际协议放行，不能只开 TCP。</p>
        <h3>改了 SSH 端口就安全了吗？</h3>
        <p>改端口只能降低被默认脚本扫到的概率，不能替代密钥登录、来源限制与入侵检测。应作为纵深防御的一层，而不是唯一措施。</p>
      </article>`;

  const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>常用端口号查询 - TCP/UDP 服务端口大全 | WebUtils</title>
    <meta name="description" content="${desc}" />
    <meta name="keywords" content="端口号查询,常用端口,TCP端口,UDP端口,网络服务端口" />
    <meta name="author" content="WebUtils" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://essays4u.net/tools/network/port-info" />
    <meta property="og:title" content="常用端口号查询 - TCP/UDP 服务端口大全" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://essays4u.net/tools/network/port-info" />
    <meta property="og:site_name" content="WebUtils" />
    <meta property="og:locale" content="zh_CN" />
    <meta property="og:image" content="https://essays4u.net/social-preview.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="常用端口号查询" />
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
        --bg: #f4f7fb;
        --card: #ffffff;
        --text: #0f172a;
        --muted: #64748b;
        --border: #e2e8f0;
        --primary: #0d9488;
      }
      ${SHELL_CSS}
      .page-shell { max-width: 1200px; }
      .search-input {
        width: 100%;
        padding: 14px 16px;
        border: 1px solid var(--border);
        border-radius: 12px;
        background: var(--bg);
        color: var(--text);
        font-size: 1rem;
        margin-bottom: 14px;
        font-family: inherit;
      }
      .search-input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(13,148,136,.15);
      }
      .category-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 16px;
      }
      .tab-btn {
        border: 1px solid var(--border);
        background: var(--bg);
        color: var(--muted);
        border-radius: 999px;
        padding: 8px 14px;
        cursor: pointer;
        font-family: inherit;
        font-size: 0.88rem;
      }
      .tab-btn.active {
        background: var(--primary);
        border-color: var(--primary);
        color: #fff;
        font-weight: 600;
      }
      .port-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 12px;
      }
      .port-card {
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 14px;
        background: var(--bg);
      }
      .port-card:hover { border-color: var(--primary); }
      .port-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      .port-num {
        font-family: "JetBrains Mono", monospace;
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--primary);
      }
      .port-proto {
        font-size: 0.72rem;
        padding: 2px 8px;
        border-radius: 999px;
        background: var(--card);
        border: 1px solid var(--border);
        color: var(--muted);
        font-weight: 700;
      }
      .port-name { font-weight: 600; margin-bottom: 4px; }
      .port-desc { font-size: 0.86rem; color: var(--muted); }
      .empty-ports {
        grid-column: 1 / -1;
        text-align: center;
        color: var(--muted);
        padding: 28px;
        border: 1px dashed var(--border);
        border-radius: 12px;
      }
    </style>
  </head>
  <body>
    ${headerHtml('/tools/network/port-info', [
      { href: '/', label: '首页' },
      { href: '/tools/network/port-info', label: '端口查询' },
      { href: '/tools/network/dns-lookup', label: 'DNS 查询' },
    ])}
    <div class="page-shell">
      ${breadcrumbHtml('network', '网络工具', '常用端口号查询')}
      <main class="content-layout">
        <section class="tool-section" aria-label="端口查询主区">
          <header class="tool-header">
            <h1>常用端口号查询</h1>
            <p>按端口号或服务名快速检索 TCP/UDP 常用服务，支持分类筛选，全部在浏览器本地完成。</p>
          </header>
          <input type="text" id="searchInput" class="search-input" placeholder="搜索端口号（如 80）或服务名（如 mysql）..." aria-label="搜索端口" />
          <div class="category-tabs" id="categoryTabs">
            <button class="tab-btn active" data-cat="all">全部</button>
            <button class="tab-btn" data-cat="web">Web服务</button>
            <button class="tab-btn" data-cat="db">数据库</button>
            <button class="tab-btn" data-cat="remote">远程访问</button>
            <button class="tab-btn" data-cat="mail">邮件/通信</button>
            <button class="tab-btn" data-cat="file">文件传输</button>
          </div>
          <div class="port-grid" id="portGrid"></div>
        </section>
        ${sidebarHtml(
          [
            '输入端口数字或服务关键词搜索',
            '用分类页签缩小结果范围',
            '查看协议（TCP/UDP）与用途说明',
            '对照防火墙/安全组是否放行',
            '本页不扫描主机，仅做知识检索',
          ],
          faqs,
          [
            { href: '/tools/network/dns-lookup', name: 'DNS 查询' },
            { href: '/tools/network/ip-calculator', name: 'IP 计算器' },
            { href: '/tools/network/http-header-parser', name: 'HTTP 头解析' },
            { href: '/tools/network/subnet-calculator', name: '子网计算' },
          ]
        )}
      </main>
      ${mergedSeo}
    </div>
    ${SHARED_FOOTER}
    <script>
      const ports = ${portsLiteral};
      const searchInput = document.getElementById("searchInput");
      const portGrid = document.getElementById("portGrid");
      const categoryTabs = document.getElementById("categoryTabs");
      let currentCat = "all";

      function render(list) {
        if (!list.length) {
          portGrid.innerHTML = '<div class="empty-ports">没有匹配的端口，试试其他关键词</div>';
          return;
        }
        portGrid.innerHTML = list.map((p) => \`
          <div class="port-card">
            <div class="port-header">
              <span class="port-num">\${p.port}</span>
              <span class="port-proto">\${p.proto}</span>
            </div>
            <div class="port-name">\${p.name}</div>
            <div class="port-desc">\${p.desc}</div>
          </div>\`).join("");
      }

      function filter() {
        const query = searchInput.value.toLowerCase().trim();
        const filtered = ports.filter((p) => {
          const matchCat = currentCat === "all" || p.cat === currentCat;
          const matchQuery =
            !query ||
            p.port.toString().includes(query) ||
            p.name.toLowerCase().includes(query) ||
            p.desc.toLowerCase().includes(query);
          return matchCat && matchQuery;
        });
        render(filtered);
      }

      searchInput.addEventListener("input", filter);
      categoryTabs.onclick = (e) => {
        if (e.target.dataset.cat) {
          currentCat = e.target.dataset.cat;
          document.querySelectorAll(".tab-btn").forEach((btn) =>
            btn.classList.toggle("active", btn === e.target)
          );
          filter();
        }
      };
      ${themeScript()}
      render(ports);
    </script>
  </body>
</html>
`;
  fs.writeFileSync(path.join(root, 'tools/network/port-info.html'), html, 'utf8');
  return desc;
}

function writeRoi() {
  const old = fs.readFileSync(path.join(root, 'tools/business/roi.html'), 'utf8');
  const art = old.match(/<article>([\s\S]*?)<\/article>/i);
  const articleInner = art
    ? art[1]
    : `<h2>ROI 说明</h2><p>ROI = (总收益 - 初始投资) / 初始投资 × 100%。</p>`;

  const desc = padDesc([
    '免费投资回报率 ROI 计算器：输入初始投资、年限、总收益与年均收益，',
    '即时得到 ROI、年化收益率、回收期与投资倍数，浏览器本地计算，',
    '适合项目评估、广告投放与经营决策草稿分析。',
  ]);
  const faqs = [
    ['ROI 怎么算？', 'ROI = (预期总收益 - 初始投资) / 初始投资 × 100%。'],
    ['回收期用哪个字段？', '用预估年均收益：回收期 ≈ 初始投资 / 年均收益。'],
    ['投资倍数是什么？', '总收益 / 初始投资，表示本金放大了多少倍。'],
    ['结果能当正式财务结论吗？', '仅供快速草稿评估，正式决策请结合完整财务报表与税务。'],
  ];
  const ld = ldGraph({
    name: '投资回报率 ROI 计算器',
    url: 'https://essays4u.net/tools/business/roi',
    desc,
    category: 'FinanceApplication',
    features: ['ROI 计算', '年化收益率', '投资回收期', '投资倍数', '本地计算'],
    catName: '商业工具',
    catUrl: 'https://essays4u.net/#business',
    faqs,
  });

  const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>投资回报率 ROI 计算器 - 回收期与投资倍数 | WebUtils</title>
    <meta name="description" content="${desc}" />
    <meta name="keywords" content="ROI计算,投资收益率,投资回收期,投资倍数,财务分析" />
    <meta name="author" content="WebUtils" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://essays4u.net/tools/business/roi" />
    <meta property="og:title" content="投资回报率 ROI 计算器 - 回收期与投资倍数" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://essays4u.net/tools/business/roi" />
    <meta property="og:site_name" content="WebUtils" />
    <meta property="og:locale" content="zh_CN" />
    <meta property="og:image" content="https://essays4u.net/social-preview.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="投资回报率 ROI 计算器" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="https://essays4u.net/social-preview.png" />
    <script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>
      :root {
        --bg: #f5f7fb;
        --card: #ffffff;
        --text: #111827;
        --muted: #6b7280;
        --border: #e5e7eb;
        --primary: #059669;
      }
      ${SHELL_CSS}
      .inputs {
        display: grid;
        grid-template-columns: 1fr;
        gap: 14px;
      }
      @media (min-width: 700px) {
        .inputs { grid-template-columns: 1fr 1fr; }
      }
      .input-group label {
        display: block;
        font-size: 0.9rem;
        margin-bottom: 6px;
        color: var(--muted);
      }
      .input-group input {
        width: 100%;
        padding: 12px 14px;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: var(--bg);
        color: var(--text);
        font-size: 1rem;
        font-family: inherit;
      }
      .hint {
        margin-top: 14px;
        font-size: 0.85rem;
        color: var(--muted);
      }
      .results {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-top: 20px;
      }
      @media (min-width: 700px) {
        .results { grid-template-columns: repeat(4, 1fr); }
      }
      .result-card {
        background: linear-gradient(160deg, rgba(5,150,105,.08), var(--bg));
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 14px;
        text-align: center;
      }
      .result-label {
        font-size: 0.82rem;
        color: var(--muted);
        margin-bottom: 6px;
      }
      .result-value {
        font-family: "JetBrains Mono", monospace;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--primary);
      }
    </style>
  </head>
  <body>
    ${headerHtml('/tools/business/roi', [
      { href: '/', label: '首页' },
      { href: '/tools/business/roi', label: 'ROI 计算' },
      { href: '/tools/business/npv', label: 'NPV' },
    ])}
    <div class="page-shell">
      ${breadcrumbHtml('business', '商业工具', '投资回报率 ROI 计算器')}
      <main class="content-layout">
        <section class="tool-section" aria-label="ROI 计算主区">
          <header class="tool-header">
            <h1>投资回报率 ROI 计算器</h1>
            <p>输入投资与收益参数，即时查看 ROI、年化收益率、回收期与投资倍数（本地计算）。</p>
          </header>
          <div class="inputs">
            <div class="input-group">
              <label for="initialInvestment">初始投资金额 (¥)</label>
              <input type="number" id="initialInvestment" value="100000" oninput="calculate()" />
            </div>
            <div class="input-group">
              <label for="investmentPeriod">投资预期年限 (年)</label>
              <input type="number" id="investmentPeriod" value="3" oninput="calculate()" />
            </div>
            <div class="input-group">
              <label for="totalReturn">预期总收益 (¥)</label>
              <input type="number" id="totalReturn" value="150000" oninput="calculate()" />
            </div>
            <div class="input-group">
              <label for="annualReturn">预估年均收益 (¥)</label>
              <input type="number" id="annualReturn" value="50000" oninput="calculate()" />
            </div>
          </div>
          <p class="hint">提示：年均收益用于计算投资回收期；总收益用于计算核心 ROI 与投资倍数。</p>
          <div class="results" aria-live="polite">
            <div class="result-card"><div class="result-label">ROI</div><div class="result-value" id="roi">0%</div></div>
            <div class="result-card"><div class="result-label">年化收益率</div><div class="result-value" id="annualRoi">0%</div></div>
            <div class="result-card"><div class="result-label">投资回收期</div><div class="result-value" id="paybackPeriod">N/A</div></div>
            <div class="result-card"><div class="result-label">投资倍数</div><div class="result-value" id="multiple">0x</div></div>
          </div>
        </section>
        ${sidebarHtml(
          [
            '填写初始投资与预期总收益',
            '设置年限用于估算年化 ROI',
            '填写年均收益以计算回收期',
            '对照四个指标综合判断项目质量',
            '正式决策请结合完整财务与风险分析',
          ],
          faqs,
          [
            { href: '/tools/business/npv', name: 'NPV 计算' },
            { href: '/tools/business/breakeven', name: '盈亏平衡' },
            { href: '/tools/business/profit-margin', name: '利润率' },
            { href: '/tools/finance/profit-margin', name: '财务利润率' },
          ]
        )}
      </main>
      <article class="seo-article" aria-label="ROI 说明文章">
        ${articleInner}
      </article>
    </div>
    ${SHARED_FOOTER}
    <script>
      function calculate() {
        const initialInvestment = parseFloat(document.getElementById("initialInvestment").value) || 0;
        const investmentPeriod = parseFloat(document.getElementById("investmentPeriod").value) || 1;
        const totalReturn = parseFloat(document.getElementById("totalReturn").value) || 0;
        const annualReturn = parseFloat(document.getElementById("annualReturn").value) || 0;

        const netProfit = totalReturn - initialInvestment;
        const roi = initialInvestment > 0 ? (netProfit / initialInvestment) * 100 : 0;
        const annualRoi = investmentPeriod > 0 ? roi / investmentPeriod : 0;
        const paybackPeriod = annualReturn > 0 ? initialInvestment / annualReturn : 0;
        const multiple = initialInvestment > 0 ? totalReturn / initialInvestment : 0;

        document.getElementById("roi").textContent = roi.toFixed(2) + "%";
        document.getElementById("annualRoi").textContent = annualRoi.toFixed(2) + "%";
        document.getElementById("paybackPeriod").textContent =
          paybackPeriod > 0 ? paybackPeriod.toFixed(1) + "年" : "N/A";
        document.getElementById("multiple").textContent = multiple.toFixed(2) + "x";
      }
      ${themeScript()}
      calculate();
    </script>
  </body>
</html>
`;
  fs.writeFileSync(path.join(root, 'tools/business/roi.html'), html, 'utf8');
  return desc;
}

// run all
const results = {};
results.notes = writeNotes();
results.todo = writeTodo();
results.tsconfig = writeTsconfig();
results.port = writePortInfo();
results.roi = writeRoi();

const checks = [
  verify('tools/life/notes.html'),
  verify('tools/life/todo-list.html'),
  verify('tools/dev/tsconfig-editor.html'),
  verify('tools/network/port-info.html'),
  verify('tools/business/roi.html'),
];
console.log(JSON.stringify({ results: Object.fromEntries(Object.entries(results).map(([k,v])=>[k,v.length])), checks }, null, 2));
const bad = checks.filter((c) => !c.ok);
process.exit(bad.length ? 1 : 0);
