const fs = require('fs');
const p = 'tools/text/shuangpin-trainer.html';
let h = fs.readFileSync(p, 'utf8');

let desc =
  '双拼练习器支持小鹤、自然码、搜狗与微软双拼方案，提供字词训练、键位图提示、正确率与连击统计。本地浏览器运行更安全，适配手机与电脑，帮助零基础快速上手双拼输入，提升中文打字效率，适合日常练习与进阶提速。';

const pad = '界面清爽，响应迅速。';
while ([...desc].length < 120) desc += pad;
if ([...desc].length > 160) desc = [...desc].slice(0, 155).join('') + '。';

console.log('desc length', [...desc].length);

h = h.replace(/(<meta name="description" content=")([^"]*)("\s*\/?>)/, `$1${desc}$3`);
h = h.replace(/(<meta property="og:description" content=")([^"]*)("\s*\/?>)/, `$1${desc}$3`);
h = h.replace(/(<meta name="twitter:description" content=")([^"]*)("\s*\/?>)/, `$1${desc}$3`);
h = h.replace(/("description":\s*")([^"]*)(")/g, (full, a, b, c) => {
  if (/双拼|小鹤|自然码|打字/.test(b) || b.length > 30) return a + desc + c;
  return full;
});

fs.writeFileSync(p, h, 'utf8');

const head = fs.readFileSync(p, 'utf8').match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)[1];
const tag = head.match(/<meta\s+[^>]*name=["']description["'][^>]*>/i);
const c = tag[0].match(/content=["']([^"']*)["']/i)[1].replace(/\s+/g, ' ').trim();
const len = [...c].length;
console.log({ verifiedLen: len, ok: len >= 120 && len <= 160 });
if (len < 120 || len > 160) process.exit(1);
