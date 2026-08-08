const fs = require('fs');
const p = 'tools/text/random-picker.html';
let h = fs.readFileSync(p, 'utf8');

// Must be 120-160 characters (JS string length / Unicode code points)
const desc =
  '随机文本选择器是免费在线抽奖与点名工具，支持名单抽取、是否去重、打乱顺序、动画展示和一键复制结果。本地浏览器运行更安全，适配手机与电脑，适合直播抽奖、课堂教学、日常决策和团队任务分配，操作简单、结果公平、无需注册即可使用。';

const len = [...desc].length;
console.log('desc length', len);
if (len < 120 || len > 160) {
  console.error('Description length out of range');
  process.exit(1);
}

function replaceAttr(html, name, value) {
  // name="description" then content="..."
  const re1 = new RegExp(
    `(<meta[^>]*name=["']${name}["'][^>]*content=["'])([^"']*)(["'])`,
    'i'
  );
  if (re1.test(html)) return html.replace(re1, `$1${value}$3`);

  // content first then name
  const re2 = new RegExp(
    `(<meta[^>]*content=["'])([^"']*)(["'][^>]*name=["']${name}["'])`,
    'i'
  );
  if (re2.test(html)) return html.replace(re2, `$1${value}$3`);

  // multiline: name on one line, content next
  const re3 = new RegExp(
    `(name=["']${name}["']\\s*\\n\\s*content=["'])([^"']*)(["'])`,
    'i'
  );
  if (re3.test(html)) return html.replace(re3, `$1${value}$3`);

  return html;
}

h = replaceAttr(h, 'description', desc);
h = replaceAttr(h, 'twitter:description', desc);

// og:description
h = h.replace(
  /(property=["']og:description["']\s*\n?\s*content=["'])([^"']*)(["'])/i,
  `$1${desc}$3`
);
h = h.replace(
  /(property=["']og:description["'][^>]*content=["'])([^"']*)(["'])/i,
  `$1${desc}$3`
);

// JSON-LD WebApplication description
h = h.replace(
  /("description"\s*:\s*")([^"]*)(")/g,
  (full, a, b, c) => {
    if (/随机|抽奖|点名|抽取/.test(b) || b.length > 40) return a + desc + c;
    return full;
  }
);

fs.writeFileSync(p, h, 'utf8');

// verify
const file = fs.readFileSync(p, 'utf8');
const m = file.match(/name=["']description["'][\s\S]{0,80}?content=["']([^"']+)["']/i);
const got = m ? m[1] : '';
console.log({
  verifiedLen: [...got].length,
  match: got === desc,
  preview: got.slice(0, 40) + '...',
});
