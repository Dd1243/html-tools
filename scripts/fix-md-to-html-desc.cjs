const fs = require('fs');
const path = 'tools/text/md-to-html.html';
let html = fs.readFileSync(path, 'utf8');

const desc =
  'Markdown 转 HTML 在线工具支持 GFM 语法、实时预览、HTML 源码查看、一键复制与文件导出。全程本地浏览器运行更安全，适配手机与电脑，适合写文档、发博客、整理 README 和技术笔记，操作简单结果清晰，无需注册即可免费立即使用。';

console.log('new_desc_len=', [...desc].length);

// Replace all meta description variants
html = html.replace(
  /(<meta name="description" content=")([^"]*)(" \/>)/,
  `$1${desc}$3`
);
html = html.replace(
  /(<meta property="og:description" content=")([^"]*)(" \/>)/,
  `$1${desc}$3`
);
html = html.replace(
  /(<meta name="twitter:description" content=")([^"]*)(" \/>)/,
  `$1${desc}$3`
);
html = html.replace(
  /("description":\s*")([^"]*)(")/,
  `$1${desc}$3`
);

fs.writeFileSync(path, html, 'utf8');

// verify
const after = fs.readFileSync(path, 'utf8');
const m = after.match(/name="description" content="([^"]+)"/);
console.log('final_desc_len=', m ? [...m[1]].length : 0);
console.log('final_desc=', m ? m[1] : '');
console.log('og_ok=', after.includes(`property="og:description" content="${desc}"`));
console.log('tw_ok=', after.includes(`name="twitter:description" content="${desc}"`));
