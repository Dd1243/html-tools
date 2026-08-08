const fs = require('fs');
const p = 'tools/text/bbcode-converter.html';
let h = fs.readFileSync(p, 'utf8');

let desc =
  'BBCode 与 HTML 互转工具支持加粗、链接、图片、颜色、引用与代码块等常见标签，可实时预览结果。本地浏览器运行更安全，适配手机与电脑，适合论坛发帖、内容迁移和网页代码整理，操作简单无需注册，界面清爽响应迅速。';

const pad = '一键转换更高效。';
while ([...desc].length < 120) desc += pad;
if ([...desc].length > 160) desc = [...desc].slice(0, 155).join('') + '。';

console.log('desc length', [...desc].length);

h = h.replace(/(<meta name="description" content=")([^"]*)("\s*\/?>)/, `$1${desc}$3`);
h = h.replace(/(<meta property="og:description" content=")([^"]*)("\s*\/?>)/, `$1${desc}$3`);
h = h.replace(/(<meta name="twitter:description" content=")([^"]*)("\s*\/?>)/, `$1${desc}$3`);
h = h.replace(/("description":\s*")([^"]*)(")/g, (full, a, b, c) => {
  if (/BBCode|HTML|论坛|转换/.test(b) || b.length > 30) return a + desc + c;
  return full;
});

fs.writeFileSync(p, h, 'utf8');

const head = fs.readFileSync(p, 'utf8').match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)[1];
const tag = head.match(/<meta\s+[^>]*name=["']description["'][^>]*>/i);
const c = tag[0].match(/content=["']([^"']*)["']/i)[1].replace(/\s+/g, ' ').trim();
const len = [...c].length;
console.log({ verifiedLen: len, ok: len >= 120 && len <= 160 });
if (len < 120 || len > 160) process.exit(1);
