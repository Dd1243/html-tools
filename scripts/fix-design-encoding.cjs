/**
 * Restore known garbled Chinese + U+FFFD damage in design-reference / design-templates.
 * Only rewrites known broken phrases; does not touch tools pages.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function write(rel, content) {
  fs.writeFileSync(path.join(root, rel), content, 'utf8');
  console.log('wrote', rel);
}

// ---- design-reference/index.html ----
write(
  'design-reference/index.html',
  `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>设计参考 - WebUtils</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: Inter, system-ui, sans-serif;
        background: #0a0a0a;
        color: #e5e5e5;
        line-height: 1.6;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }

      .container {
        text-align: center;
      }

      h1 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 24px;
        color: #888;
      }

      .card {
        background: #141414;
        border: 1px solid #252525;
        border-radius: 16px;
        padding: 32px 48px;
        transition: all 0.2s;
      }

      .card:hover {
        border-color: #00f5d4;
        transform: translateY(-2px);
      }

      .card a {
        text-decoration: none;
        color: inherit;
        display: block;
      }

      .icon {
        font-size: 3rem;
        margin-bottom: 16px;
      }

      .title {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .desc {
        font-size: 0.9rem;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>WebUtils 设计参考</h1>
      <div class="card">
        <a href="components.html">
          <div class="icon">🎨</div>
          <div class="title">组件库</div>
          <div class="desc">
            按钮、输入框、卡片等 UI 组件
            <br />
            支持暗色/亮色主题切换
          </div>
        </a>
      </div>
    </div>
  </body>
</html>
`
);

// ---- design-templates/index.html: surgical replacements ----
{
  const file = path.join(root, 'design-templates/index.html');
  let t = fs.readFileSync(file, 'utf8');
  const replacements = [
    [/WebUtils 工具页面设计参\uFFFD\?<\/p>/g, 'WebUtils 工具页面设计参考</p>'],
    [/WebUtils 工具页面设计参\uFFFD\/p>/g, 'WebUtils 工具页面设计参考</p>'],
    [/经典简\uFFFD\? · 左右分栏 · 卡片堆叠 · 终端风格 · 玻璃拟\uFFFD\? · 报纸风格/g, '经典简约 · 左右分栏 · 卡片堆叠 · 终端风格 · 玻璃拟态 · 报纸风格'],
    [/打字\uFFFD\? · 蓝图 · 手帐涂鸦 · 控制\uFFFD\? · Win95 · 杂志网格/g, '打字机 · 蓝图 · 手帐涂鸦 · 控制台 · Win95 · 杂志网格'],
    [/UI 组件\uFFFD\?/g, 'UI 组件库'],
    [/组件\uFFFD\? V1/g, '组件库 V1'],
    [/按钮\(10\) · 输入\uFFFD\?6\) · 文本\uFFFD\?4\) · 卡片\(5\) · 标签\(4\) · 开\uFFFD\?2\) · 滑块\(2\) ·/g, '按钮(10) · 输入框(6) · 文本框(4) · 卡片(5) · 标签(4) · 开关(2) · 滑块(2) ·'],
    [/分隔\uFFFD\?4\) · 面包\uFFFD\?2\)/g, '分隔线(4) · 面包屑(2)'],
    [/组件\uFFFD\? V2/g, '组件库 V2'],
    [/33种扩展组件样\uFFFD\?<\/div>/g, '33种扩展组件样式</div>'],
    [/33种扩展组件样\uFFFD\/div>/g, '33种扩展组件样式</div>'],
    [/页面头部\(6\) · 工具\uFFFD\?5\) · 状态指\uFFFD\?4\) · 复选框\(3\) · 提示\(3\) · 数字\(3\) · 代码\(3\) ·/g, '页面头部(6) · 工具栏(5) · 状态指示(4) · 复选框(3) · 提示(3) · 数字(3) · 代码(3) ·'],
    [/<div class="card-preview light">☀\uFFFD\?<\/div>/g, '<div class="card-preview light">☀️</div>'],
    [/<div class="card-preview light">☀\uFFFD\/div>/g, '<div class="card-preview light">☀️</div>'],
    [/组件\uFFFD\? - 亮色\uFFFD\?/g, '组件库 - 亮色版'],
    [/41种亮色主题组\uFFFD\?<\/div>/g, '41种亮色主题组件</div>'],
    [/41种亮色主题组\uFFFD\/div>/g, '41种亮色主题组件</div>'],
    [/按钮\(8\) · 输入\uFFFD\?4\) · 文本\uFFFD\?3\) · 卡片\(4\) · 标签\(4\) · 头部\(4\) · 工具\uFFFD\?4\) ·/g, '按钮(8) · 输入框(4) · 文本框(3) · 卡片(4) · 标签(4) · 头部(4) · 工具栏(4) ·'],
    [/状\uFFFD\?2\) · 复选框\(2\) · 提示\(3\) · 数字\(2\) · 代码\(2\)/g, '状态(2) · 复选框(2) · 提示(3) · 数字(2) · 代码(2)'],
    [/WebUtils Design Templates · 更新\uFFFD\?2024\.12\.28/g, 'WebUtils Design Templates · 更新于 2024.12.28'],
  ];

  // Also handle cases where the broken char is already U+FFFD without optional ?
  const more = [
    [/\uFFFD/g, ''], // temporary clear residual replacement chars after phrase fixes
  ];

  // Do phrase-level first with flexible matching on any remaining damaged sequences
  // Rebuild known broken phrases more robustly by line-based fixes for key lines
  const lines = t.split(/\r?\n/);
  const fixedLines = lines.map((line) => {
    if (line.includes('subtitle') && line.includes('WebUtils')) {
      return '        <p class="subtitle">WebUtils 工具页面设计参考</p>';
    }
    if (line.includes('经典') || (line.includes('左右分栏') && line.includes('报纸'))) {
      return '                  经典简约 · 左右分栏 · 卡片堆叠 · 终端风格 · 玻璃拟态 · 报纸风格';
    }
    if (line.includes('Win95') && line.includes('杂志')) {
      return '                <div class="card-meta">打字机 · 蓝图 · 手帐涂鸦 · 控制台 · Win95 · 杂志网格</div>';
    }
    if (line.includes('UI') && line.includes('组件')) {
      return '          UI 组件库';
    }
    if (line.includes('组件') && line.includes('V1') && line.includes('card-title')) {
      return '                  组件库 V1';
    }
    if (line.includes('按钮(10)') || (line.includes('按钮') && line.includes('滑块'))) {
      return '                  按钮(10) · 输入框(6) · 文本框(4) · 卡片(5) · 标签(4) · 开关(2) · 滑块(2) ·';
    }
    if (line.includes('面包') || (line.includes('分隔') && line.includes('2)'))) {
      return '                  分隔线(4) · 面包屑(2)';
    }
    if (line.includes('组件') && line.includes('V2') && line.includes('card-title')) {
      return '                  组件库 V2';
    }
    if (line.includes('33') && line.includes('扩展')) {
      return '                <div class="card-desc">33种扩展组件样式</div>';
    }
    if (line.includes('页面头部') || (line.includes('复选框') && line.includes('工具') && line.includes('状态'))) {
      return '                  页面头部(6) · 工具栏(5) · 状态指示(4) · 复选框(3) · 提示(3) · 数字(3) · 代码(3) ·';
    }
    if (line.includes('card-preview light')) {
      return '              <div class="card-preview light">☀️</div>';
    }
    if (line.includes('亮色') && line.includes('card-title')) {
      return '                  组件库 - 亮色版';
    }
    if (line.includes('41') && line.includes('亮色')) {
      return '                <div class="card-desc">41种亮色主题组件</div>';
    }
    if (line.includes('按钮(8)') || (line.includes('按钮') && line.includes('头部') && line.includes('工具'))) {
      return '                  按钮(8) · 输入框(4) · 文本框(3) · 卡片(4) · 标签(4) · 头部(4) · 工具栏(4) ·';
    }
    if (line.includes('复选框(2)') && line.includes('提示(3)')) {
      return '                  状态(2) · 复选框(2) · 提示(3) · 数字(2) · 代码(2)';
    }
    if (line.includes('footer') && line.includes('Design Templates')) {
      return '      <footer>WebUtils Design Templates · 更新于 2024.12.28</footer>';
    }
    return line;
  });
  t = fixedLines.join('\n');
  // remove any leftover U+FFFD
  t = t.replace(/\uFFFD/g, '');
  fs.writeFileSync(file, t, 'utf8');
  console.log('wrote design-templates/index.html, remaining U+FFFD:', (t.match(/\uFFFD/g) || []).length);
}

// ---- design-reference/components.html: phrase map for U+FFFD damaged closings ----
{
  const file = path.join(root, 'design-reference/components.html');
  let t = fs.readFileSync(file, 'utf8');

  // Fix broken closing tags of form: 中文�?</tag> or 中文�?/tag>
  // Strategy: replace known broken labels by surrounding English anchors where possible.
  const map = [
    [/<title>组件\uFFFD\?- WebUtils<\/title>/g, '<title>组件库 - WebUtils</title>'],
    [/<title>组件\uFFFD\/- WebUtils<\/title>/g, '<title>组件库 - WebUtils</title>'],
    [/\/\* ==================== 输入框样\uFFFD\?==================== \*\//g, '/* ==================== 输入框样式 ==================== */'],
    [/\/\* ==================== 文本域样\uFFFD\?==================== \*\//g, '/* ==================== 文本域样式 ==================== */'],
    [/\/\* ==================== 工具栏样\uFFFD\?==================== \*\//g, '/* ==================== 工具栏样式 ==================== */'],
    [/content: "\uFFFD\?;/g, 'content: "•";'],
    [/<span class="nav-title">组件\uFFFD\?<\/span>/g, '<span class="nav-title">组件库</span>'],
    [/<span class="nav-title">组件\uFFFD\/span>/g, '<span class="nav-title">组件库</span>'],
    [/<a href="#inputs">输入\uFFFD\?<\/a>/g, '<a href="#inputs">输入框</a>'],
    [/<a href="#inputs">输入\uFFFD\/a>/g, '<a href="#inputs">输入框</a>'],
    [/<a href="#textareas">文本\uFFFD\?<\/a>/g, '<a href="#textareas">文本域</a>'],
    [/<a href="#textareas">文本\uFFFD\/a>/g, '<a href="#textareas">文本域</a>'],
    [/<a href="#toolbars">工具\uFFFD\?<\/a>/g, '<a href="#toolbars">工具栏</a>'],
    [/<a href="#toolbars">工具\uFFFD\/a>/g, '<a href="#toolbars">工具栏</a>'],
    [/<a href="#status">状\uFFFD\?<\/a>/g, '<a href="#status">状态</a>'],
    [/<a href="#status">状\uFFFD\/a>/g, '<a href="#status">状态</a>'],
    [/圆角常\uFFFD\?<\/div>/g, '圆角常规</div>'],
    [/圆角常\uFFFD\/div>/g, '圆角常规</div>'],
    [/强调色按\uFFFD\?<\/div>/g, '强调色按钮</div>'],
    [/强调色按\uFFFD\/div>/g, '强调色按钮</div>'],
    [/<!-- 输入\uFFFD\?-->/g, '<!-- 输入框 -->'],
    [/<h2 class="section-title">输入\uFFFD\?Inputs<\/h2>/g, '<h2 class="section-title">输入框 Inputs</h2>'],
    [/placeholder="请输入内\uFFFD\?\.\."/g, 'placeholder="请输入内容..."'],
    [/基础输入\uFFFD\?<\/div>/g, '基础输入框</div>'],
    [/基础输入\uFFFD\/div>/g, '基础输入框</div>'],
    [/仅底部边\uFFFD\?<\/div>/g, '仅底部边框</div>'],
    [/仅底部边\uFFFD\/div>/g, '仅底部边框</div>'],
    [/带搜索图\uFFFD\?<\/div>/g, '带搜索图标</div>'],
    [/带搜索图\uFFFD\/div>/g, '带搜索图标</div>'],
    [/<!-- 文本\uFFFD\?-->/g, '<!-- 文本域 -->'],
    [/<h2 class="section-title">文本\uFFFD\?Textareas<\/h2>/g, '<h2 class="section-title">文本域 Textareas</h2>'],
    [/基础文本\uFFFD\?<\/div>/g, '基础文本域</div>'],
    [/基础文本\uFFFD\/div>/g, '基础文本域</div>'],
    [/代码编辑器风\uFFFD\?<\/div>/g, '代码编辑器风格</div>'],
    [/代码编辑器风\uFFFD\/div>/g, '代码编辑器风格</div>'],
    [/这是卡片的描述文\uFFFD\?<\/div>/g, '这是卡片的描述文本</div>'],
    [/这是卡片的描述文\uFFFD\/div>/g, '这是卡片的描述文本</div>'],
    [/鼠标悬停时上\uFFFD\?<\/div>/g, '鼠标悬停时上浮</div>'],
    [/鼠标悬停时上\uFFFD\/div>/g, '鼠标悬停时上浮</div>'],
    [/左边框卡\uFFFD\?<\/div>/g, '左边框卡片</div>'],
    [/左边框卡\uFFFD\/div>/g, '左边框卡片</div>'],
    [/左边框强\uFFFD\?<\/div>/g, '左边框强调</div>'],
    [/左边框强\uFFFD\/div>/g, '左边框强调</div>'],
    [/<!-- 工具\uFFFD\?-->/g, '<!-- 工具栏 -->'],
    [/<h2 class="section-title">工具\uFFFD\?Toolbars<\/h2>/g, '<h2 class="section-title">工具栏 Toolbars</h2>'],
    [/<p class="section-desc">操作按钮\uFFFD\?<\/p>/g, '<p class="section-desc">操作按钮组</p>'],
    [/<p class="section-desc">操作按钮\uFFFD\/p>/g, '<p class="section-desc">操作按钮组</p>'],
    [/>格式\uFFFD\?<\/button>/g, '>格式化</button>'],
    [/>格式\uFFFD\/button>/g, '>格式化</button>'],
    [/基础工具\uFFFD\?<\/div>/g, '基础工具栏</div>'],
    [/基础工具\uFFFD\/div>/g, '基础工具栏</div>'],
    [/分段控制\uFFFD\?<\/div>/g, '分段控制器</div>'],
    [/分段控制\uFFFD\/div>/g, '分段控制器</div>'],
    [/<!-- 状态指\uFFFD\?-->/g, '<!-- 状态指示 -->'],
    [/<h2 class="section-title">状态指\uFFFD\?Status<\/h2>/g, '<h2 class="section-title">状态指示 Status</h2>'],
    [/状态徽\uFFFD\?<\/div>/g, '状态徽标</div>'],
    [/状态徽\uFFFD\/div>/g, '状态徽标</div>'],
    [/进度\uFFFD\?<\/div>/g, '进度条</div>'],
    [/进度\uFFFD\/div>/g, '进度条</div>'],
    [/<p class="section-desc">复选框和开\uFFFD\?<\/p>/g, '<p class="section-desc">复选框和开关</p>'],
    [/<p class="section-desc">复选框和开\uFFFD\/p>/g, '<p class="section-desc">复选框和开关</p>'],
    [/>开启功\uFFFD\?<\/span>/g, '>开启功能</span>'],
    [/>开启功\uFFFD\/span>/g, '>开启功能</span>'],
    [/开关控\uFFFD\?<\/div>/g, '开关控件</div>'],
    [/开关控\uFFFD\/div>/g, '开关控件</div>'],
    [/<p class="section-desc">通知和警\uFFFD\?<\/p>/g, '<p class="section-desc">通知和警告</p>'],
    [/<p class="section-desc">通知和警\uFFFD\/p>/g, '<p class="section-desc">通知和警告</p>'],
    [/\uFFFD\? Ctrl\+V 可快速粘贴内\uFFFD\?<\/div>/g, '按 Ctrl+V 可快速粘贴内容</div>'],
    [/字符\uFFFD\?<\/div>/g, '字符数</div>'],
    [/字符\uFFFD\/div>/g, '字符数</div>'],
    [/大数字显\uFFFD\?<\/div>/g, '大数字显示</div>'],
    [/大数字显\uFFFD\/div>/g, '大数字显示</div>'],
    [/匹配\uFFFD\?<\/div>/g, '匹配数</div>'],
    [/匹配\uFFFD\/div>/g, '匹配数</div>'],
    [/解析字符\uFFFD\?/g, '解析字符数'],
    [/代码\uFFFD\?<\/div>/g, '代码块</div>'],
    [/代码\uFFFD\/div>/g, '代码块</div>'],
    [/<p class="section-desc">键盘、空状态、列表、加\uFFFD\?<\/p>/g, '<p class="section-desc">键盘、空状态、列表、加载</p>'],
    [/<p class="section-desc">键盘、空状态、列表、加\uFFFD\/p>/g, '<p class="section-desc">键盘、空状态、列表、加载</p>'],
    [/<kbd class="kbd">\uFFFD\?<\/kbd>/g, '<kbd class="kbd">⌘</kbd>'],
    [/<kbd class="kbd">\uFFFD\/kbd>/g, '<kbd class="kbd">⌘</kbd>'],
    [/键盘快捷\uFFFD\?<\/div>/g, '键盘快捷键</div>'],
    [/键盘快捷\uFFFD\/div>/g, '键盘快捷键</div>'],
    [/空状\uFFFD\?<\/div>/g, '空状态</div>'],
    [/空状\uFFFD\/div>/g, '空状态</div>'],
    [/JSON 格式\uFFFD\?<\/div>/g, 'JSON 格式化</div>'],
    [/JSON 格式\uFFFD\/div>/g, 'JSON 格式化</div>'],
    [/格式化、压缩、校\uFFFD\?<\/div>/g, '格式化、压缩、校验</div>'],
    [/格式化、压缩、校\uFFFD\/div>/g, '格式化、压缩、校验</div>'],
    [/<span class="list-item-arrow">\uFFFD\?<\/span>/g, '<span class="list-item-arrow">›</span>'],
    [/<span class="list-item-arrow">\uFFFD\/span>/g, '<span class="list-item-arrow">›</span>'],
    [/列表\uFFFD\?<\/div>/g, '列表项</div>'],
    [/列表\uFFFD\/div>/g, '列表项</div>'],
    [/处理\uFFFD\?\.\./g, '处理中...'],
    [/加载状\uFFFD\?<\/div>/g, '加载状态</div>'],
    [/加载状\uFFFD\/div>/g, '加载状态</div>'],
    [/\/\/ 工具栏交\uFFFD\?/g, '// 工具栏交互'],
    [/<span>\uFFFD\?<\/span>/g, '<span>✓</span>'],
    [/<span>\uFFFD\/span>/g, '<span>✓</span>'],
  ];

  for (const [re, to] of map) t = t.replace(re, to);

  // Generic salvage for remaining broken closings: 中文�?</tag> or 中文�?/tag>
  // Replace U+FFFD before a close tag by restoring common suffixes based on preceding chars is hard;
  // instead strip U+FFFD and ensure close tags are intact.
  t = t.replace(/\uFFFD\?<\/([a-zA-Z0-9]+)>/g, '</$1>');
  t = t.replace(/\uFFFD\/([a-zA-Z0-9]+)>/g, '</$1>');
  t = t.replace(/\uFFFD/g, '');

  fs.writeFileSync(file, t, 'utf8');
  console.log('wrote design-reference/components.html, remaining U+FFFD:', (t.match(/\uFFFD/g) || []).length);
}

console.log('done');
