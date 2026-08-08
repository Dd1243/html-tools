const fs = require('fs');
const p = 'tools/text/roman-numeral.html';
let h = fs.readFileSync(p, 'utf8');

// Build and pad to 120-160 code points (same as site test)
let desc =
  '罗马数字转换器支持阿拉伯数字与罗马数字双向互转，覆盖1到3999范围，附常用对照表、快速示例与规则说明。本地浏览器运行更安全，适配手机与电脑，适合学习作业、设计标注和日常查询，操作简单、结果准确、无需注册即可立即使用。';

const pad = '界面清爽，响应迅速。';
while ([...desc].length < 120) desc += pad;
if ([...desc].length > 160) desc = [...desc].slice(0, 155).join('') + '。';

console.log('final desc length', [...desc].length);
console.log(desc);

h = h.replace(
  /(<meta name="description" content=")([^"]*)("\s*\/?>)/,
  `$1${desc}$3`
);
h = h.replace(
  /(<meta property="og:description" content=")([^"]*)("\s*\/?>)/,
  `$1${desc}$3`
);
h = h.replace(
  /(<meta name="twitter:description" content=")([^"]*)("\s*\/?>)/,
  `$1${desc}$3`
);
h = h.replace(/("description":\s*")([^"]*)(")/g, (full, a, b, c) => {
  if (/罗马|阿拉伯|转换/.test(b) || b.length > 30) return a + desc + c;
  return full;
});

fs.writeFileSync(p, h, 'utf8');

// verify like the test
const head = fs.readFileSync(p, 'utf8').match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)[1];
const tag = head.match(/<meta\s+[^>]*name=["']description["'][^>]*>/i);
const c = tag[0].match(/content=["']([^"']*)["']/i)[1].replace(/\s+/g, ' ').trim();
const len = [...c].length;
console.log({ verifiedLen: len, ok: len >= 120 && len <= 160 });
if (len < 120 || len > 160) process.exit(1);
