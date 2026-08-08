const fs = require('fs');
const path = 'tools/generator/pattern-generator.html';
let html = fs.readFileSync(path, 'utf8');

const desc =
  'CSS 背景图案生成器支持条纹、点阵、网格与棋盘纹理，可调颜色、尺寸、透明度与旋转并一键复制 CSS 代码。全程本地浏览器运行更安全，适配手机与电脑，适合网页设计、UI 原型与前端开发，操作简单结果清晰，无需注册即可免费立即使用，界面清爽响应迅速。';

console.log('desc_len=', [...desc].length);
if ([...desc].length < 120 || [...desc].length > 160) {
  console.error('BAD LENGTH');
  process.exit(1);
}

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
const after = fs.readFileSync(path, 'utf8');
const m = after.match(/name="description" content="([^"]+)"/);
console.log('final=', m ? [...m[1]].length : 0);
console.log('text=', m ? m[1] : '');
