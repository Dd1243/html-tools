const fs = require('fs');
const path = 'tools/generator/tweet-generator.html';
let h = fs.readFileSync(path, 'utf8');

const desc =
  'X 帖子截图生成器可在线制作高仿真 X（原 Twitter）模拟帖图片，支持自定义头像、用户名、正文、互动数据、认证标识与日夜主题，并一键导出高清 PNG。适合 UI 设计演示、营销文案预览、课程教学与创意素材制作，纯前端本地运行更安全可靠。';

console.log('desc chars', [...desc].length);

// Replace any existing short/long description variants in common places
h = h.replace(
  /(<meta name="description" content=")([^"]*)("\s*\/?>)/,
  `$1${desc}$3`
);
h = h.replace(
  /(property="og:description"[\s\S]*?content=")([^"]*)(")/,
  `$1${desc}$3`
);
h = h.replace(
  /(<meta name="twitter:description" content=")([^"]*)("\s*\/?>)/,
  `$1${desc}$3`
);
// JSON-LD description field (first occurrence in WebApplication is fine)
h = h.replace(
  /("description":\s*")([^"]*)(")/,
  `$1${desc}$3`
);

fs.writeFileSync(path, h, 'utf8');
const m = h.match(/name="description" content="([^"]+)"/);
console.log({ metaLen: m ? [...m[1]].length : 0, ok: m && [...m[1]].length >= 120 && [...m[1]].length <= 160 });
