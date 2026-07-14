/**
 * Fix design-reference/components.html:
 * 1) restore broken closings of form  ?/tag>  -> </tag>
 * 2) restore known Chinese labels by structural context
 */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'design-reference', 'components.html');
let t = fs.readFileSync(file, 'utf8');

// 1) Fix broken closing tags: "something?/div>" or "?/span>" -> proper close
// Common damage: U+FFFD removed and left as literal "?" before "/tag>"
t = t.replace(/\?\/([a-zA-Z0-9]+)>/g, '</$1>');

// 2) Line-based Chinese restoration for nav and component labels
const lineFixes = [
  [/nav-title">组件?<\/span>/, 'nav-title">组件库</span>'],
  [/nav-title">组件<\/span>/, 'nav-title">组件库</span>'],
  [/href="#inputs">输入?<\/a>/, 'href="#inputs">输入框</a>'],
  [/href="#inputs">输入<\/a>/, 'href="#inputs">输入框</a>'],
  [/href="#textareas">文本?<\/a>/, 'href="#textareas">文本域</a>'],
  [/href="#textareas">文本<\/a>/, 'href="#textareas">文本域</a>'],
  [/href="#toolbars">工具?<\/a>/, 'href="#toolbars">工具栏</a>'],
  [/href="#toolbars">工具<\/a>/, 'href="#toolbars">工具栏</a>'],
  [/href="#status">状?<\/a>/, 'href="#status">状态</a>'],
  [/href="#status">状<\/a>/, 'href="#status">状态</a>'],
  // After broken close fix, content may still be truncated Chinese prefixes
  [/>操作按钮<\/p>/, '>操作按钮组</p>'],
  [/>格式<\/button>/, '>格式化</button>'],
  [/>基础工具<\/div>/, '>基础工具栏</div>'],
  [/>分段控制<\/div>/, '>分段控制器</div>'],
  [/>复选框和开<\/p>/, '>复选框和开关</p>'],
  [/>开启功<\/span>/, '>开启功能</span>'],
  [/>开关控<\/div>/, '>开关控件</div>'],
  [/>通知和警<\/p>/, '>通知和警告</p>'],
  [/>键盘、空状态、列表、加<\/p>/, '>键盘、空状态、列表、加载</p>'],
  [/<kbd class="kbd"><\/kbd>/, '<kbd class="kbd">⌘</kbd>'],
  [/>键盘快捷<\/div>/, '>键盘快捷键</div>'],
  [/>空状<\/div>/, '>空状态</div>'],
  [/>JSON 格式<\/div>/, '>JSON 格式化</div>'],
  [/>格式化、压缩、校<\/div>/, '>格式化、压缩、校验</div>'],
  [/<span class="list-item-arrow"><\/span>/, '<span class="list-item-arrow">›</span>'],
  [/>列表<\/div>/, '>列表项</div>'],
  [/>加载状<\/div>/, '>加载状态</div>'],
  [/>圆角常<\/div>/, '>圆角常规</div>'],
  [/>强调色按<\/div>/, '>强调色按钮</div>'],
  [/>基础输入<\/div>/, '>基础输入框</div>'],
  [/>仅底部边<\/div>/, '>仅底部边框</div>'],
  [/>带搜索图<\/div>/, '>带搜索图标</div>'],
  [/>基础文本<\/div>/, '>基础文本域</div>'],
  [/>代码编辑器风<\/div>/, '>代码编辑器风格</div>'],
  [/>这是卡片的描述文<\/div>/, '>这是卡片的描述文本</div>'],
  [/>鼠标悬停时上<\/div>/, '>鼠标悬停时上浮</div>'],
  [/>左边框卡<\/div>/, '>左边框卡片</div>'],
  [/>左边框强<\/div>/, '>左边框强调</div>'],
  [/>状态徽<\/div>/, '>状态徽标</div>'],
  [/>进度<\/div>/, '>进度条</div>'],
  [/>字符<\/div>/, '>字符数</div>'],
  [/>大数字显<\/div>/, '>大数字显示</div>'],
  [/>匹配<\/div>/, '>匹配数</div>'],
  [/>代码<\/div>/, '>代码块</div>'],
  [/<title>组件<\/title>/, '<title>组件库 - WebUtils</title>'],
  [/<title>组件 - WebUtils<\/title>/, '<title>组件库 - WebUtils</title>'],
  [/<title>组件?<\/title>/, '<title>组件库 - WebUtils</title>'],
];

// Broader: fix any remaining "中文?/tag" already converted to "中文</tag>" but truncated.
// Apply simple full-line replacements for critical lines by scanning.
const lines = t.split(/\r?\n/);
const fixed = lines.map((line) => {
  let L = line;
  // broken close already fixed above on whole file; now restore labels
  if (L.includes('nav-title')) return '      <span class="nav-title">组件库</span>';
  if (L.includes('href="#inputs"')) return '      <a href="#inputs">输入框</a>';
  if (L.includes('href="#textareas"')) return '      <a href="#textareas">文本域</a>';
  if (L.includes('href="#toolbars"')) return '      <a href="#toolbars">工具栏</a>';
  if (L.includes('href="#status"')) return '      <a href="#status">状态</a>';
  if (L.includes('section-desc') && L.includes('操作')) return '        <p class="section-desc">操作按钮组</p>';
  if (L.includes('toolbar-btn active') && L.includes('格式')) return '              <button class="toolbar-btn active">格式化</button>';
  if (L.includes('component-style') && L.includes('基础工具')) return '            <div class="component-style">基础工具栏</div>';
  if (L.includes('component-style') && L.includes('分段控制')) return '            <div class="component-style">分段控制器</div>';
  if (L.includes('section-desc') && L.includes('复选框')) return '        <p class="section-desc">复选框和开关</p>';
  if (L.includes('switch-label') && L.includes('开启')) return '              <span class="switch-label">开启功能</span>';
  if (L.includes('component-style') && L.includes('开关')) return '            <div class="component-style">开关控件</div>';
  if (L.includes('section-desc') && L.includes('通知')) return '        <p class="section-desc">通知和警告</p>';
  if (L.includes('section-desc') && L.includes('键盘')) return '        <p class="section-desc">键盘、空状态、列表、加载</p>';
  if (L.includes('class="kbd"') && (L.includes('?</kbd>') || L.includes('></kbd>') || /<kbd class="kbd">.<\/kbd>/.test(L) || /<kbd class="kbd"><\/kbd>/.test(L) || /<kbd class="kbd">\?<\/kbd>/.test(L) || /<kbd class="kbd">.<\/kbd>/.test(L))) {
    // if kbd content is missing or single garbage
    if (/<kbd class="kbd">\s*<\/kbd>/.test(L) || /<kbd class="kbd">.<\/kbd>/.test(L) || /<kbd class="kbd">\?<\/kbd>/.test(L) || /<kbd class="kbd">.<\/kbd>/.test(L)) {
      return '            <kbd class="kbd">⌘</kbd>';
    }
  }
  if (L.includes('class="kbd"') && L.match(/<kbd class="kbd">[^A-Za-z0-9⌘]<\/kbd>/)) {
    return '            <kbd class="kbd">⌘</kbd>';
  }
  if (L.includes('component-style') && L.includes('键盘')) return '            <div class="component-style">键盘快捷键</div>';
  if (L.includes('component-style') && L.includes('空状')) return '            <div class="component-style">空状态</div>';
  if (L.includes('list-item-title') && L.includes('JSON')) return '                <div class="list-item-title">JSON 格式化</div>';
  if (L.includes('list-item-desc') && L.includes('格式化')) return '                <div class="list-item-desc">格式化、压缩、校验</div>';
  if (L.includes('list-item-arrow')) return '              <span class="list-item-arrow">›</span>';
  if (L.includes('component-style') && L.includes('列表')) return '            <div class="component-style">列表项</div>';
  if (L.includes('component-style') && L.includes('加载')) return '            <div class="component-style">加载状态</div>';
  if (L.includes('component-style') && L.includes('圆角')) return '            <div class="component-style">圆角常规</div>';
  if (L.includes('component-style') && L.includes('强调色')) return '            <div class="component-style">强调色按钮</div>';
  if (L.includes('component-style') && L.includes('基础输入')) return '            <div class="component-style">基础输入框</div>';
  if (L.includes('component-style') && L.includes('仅底部')) return '            <div class="component-style">仅底部边框</div>';
  if (L.includes('component-style') && L.includes('搜索')) return '            <div class="component-style">带搜索图标</div>';
  if (L.includes('component-style') && L.includes('基础文本')) return '            <div class="component-style">基础文本域</div>';
  if (L.includes('component-style') && L.includes('代码编辑')) return '            <div class="component-style">代码编辑器风格</div>';
  if (L.includes('card-basic-text') && L.includes('描述')) return '              <div class="card-basic-text">这是卡片的描述文本</div>';
  if (L.includes('card-basic-text') && L.includes('悬停')) return '              <div class="card-basic-text">鼠标悬停时上浮</div>';
  if (L.includes('card-basic-title') && L.includes('左边框')) return '              <div class="card-basic-title">左边框卡片</div>';
  if (L.includes('component-style') && L.includes('左边框')) return '            <div class="component-style">左边框强调</div>';
  if (L.includes('component-style') && L.includes('状态徽')) return '            <div class="component-style">状态徽标</div>';
  if (L.includes('component-style') && L.includes('进度')) return '            <div class="component-style">进度条</div>';
  if (L.includes('number-label') && L.includes('字符')) return '            <div class="number-label">字符数</div>';
  if (L.includes('component-style') && L.includes('大数字')) return '            <div class="component-style">大数字显示</div>';
  if (L.includes('number-card-label') && L.includes('匹配')) return '              <div class="number-card-label">匹配数</div>';
  if (L.includes('component-style') && L.includes('代码') && !L.includes('代码编辑')) return '            <div class="component-style">代码块</div>';
  if (L.includes('<title>')) return '    <title>组件库 - WebUtils</title>';
  if (L.includes('section-title') && L.includes('输入') && L.includes('Inputs')) return '        <h2 class="section-title">输入框 Inputs</h2>';
  if (L.includes('section-title') && L.includes('文本') && L.includes('Textareas')) return '        <h2 class="section-title">文本域 Textareas</h2>';
  if (L.includes('section-title') && L.includes('工具') && L.includes('Toolbars')) return '        <h2 class="section-title">工具栏 Toolbars</h2>';
  if (L.includes('section-title') && L.includes('状态') && L.includes('Status')) return '        <h2 class="section-title">状态指示 Status</h2>';
  if (L.includes('placeholder=') && L.includes('请输入')) return '            <input type="text" class="input-basic" placeholder="请输入内容..." />';
  if (L.includes('alert-text') && L.includes('Ctrl+V')) return '                <div class="alert-text">按 Ctrl+V 可快速粘贴内容</div>';
  if (L.includes('<span></span>') && L.trim() === '<span></span>') return '              <span>✓</span>';
  if (/^\s*<span>\s*<\/span>\s*$/.test(L)) return '              <span>✓</span>';
  if (L.includes('// 工具栏')) return '      // 工具栏交互';
  return L;
});

t = fixed.join('\n');

// One more pass for kbd garbage single char
t = t.replace(/<kbd class="kbd">[^A-Za-z0-9⌘]<\/kbd>/g, '<kbd class="kbd">⌘</kbd>');
t = t.replace(/<kbd class="kbd"><\/kbd>/g, '<kbd class="kbd">⌘</kbd>');

// Fix any remaining broken close without ?: e.g. Chinese?/ already fixed
// Also fix "状</a>" style truncated if any remain
t = t.replace(/\?\/([a-zA-Z0-9]+)>/g, '</$1>');

fs.writeFileSync(file, t, 'utf8');
console.log('components remaining broken close patterns:', (t.match(/\?\/[a-zA-Z0-9]+>/g) || []).length);
console.log('U+FFFD:', (t.match(/\uFFFD/g) || []).length);
