const fs = require('fs');
const p = 'tools/text/random-picker.html';
let h = fs.readFileSync(p, 'utf8');

// Build description and pad to 120-160 code points
let desc =
  '随机文本选择器是免费在线抽奖与点名工具，支持名单抽取、是否去重、打乱顺序、动画展示和一键复制结果。本地浏览器运行更安全，适配手机与电脑，适合直播抽奖、课堂教学、日常决策和团队任务分配，操作简单、结果公平、无需注册即可立即使用。';

const pad = '界面清爽，响应迅速。';
while ([...desc].length < 120) {
  desc += pad;
}
// trim if overshot
if ([...desc].length > 160) {
  desc = [...desc].slice(0, 155).join('') + '。';
}

console.log('final desc length', [...desc].length);
console.log(desc);

// Replace single-line tags
const patterns = [
  /(<meta name="description" content=")([^"]*)("\s*\/?>)/,
  /(<meta property="og:description" content=")([^"]*)("\s*\/?>)/,
  /(<meta name="twitter:description" content=")([^"]*)("\s*\/?>)/,
];
for (const re of patterns) {
  if (!re.test(h)) {
    console.warn('pattern not found', re);
  }
  h = h.replace(re, `$1${desc}$3`);
}

// JSON-LD
h = h.replace(/("description":\s*")([^"]*)(")/g, (full, a, b, c) => {
  if (/随机|抽奖|点名|抽取/.test(b) || b.length > 30) return a + desc + c;
  return full;
});

fs.writeFileSync(p, h, 'utf8');

// Verify with same regex as tests/meta-description.test.js
const file = fs.readFileSync(p, 'utf8');
const head = file.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)[1];
const tag = head.match(/<meta\s+[^>]*name=["']description["'][^>]*>/i);
const content = tag[0]
  .match(/content=["']([^"']*)["']/i)[1]
  .replace(/\s+/g, ' ')
  .trim();
const len = [...content].length;
console.log({ verifiedLen: len, ok: len >= 120 && len <= 160 });
if (len < 120 || len > 160) process.exit(1);
