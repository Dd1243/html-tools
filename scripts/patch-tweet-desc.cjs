const fs = require('fs');
const path = 'tools/generator/tweet-generator.html';
let h = fs.readFileSync(path, 'utf8');
const desc =
  'X 帖子截图生成器可在线制作高仿真 X（原 Twitter）模拟帖图片，支持自定义头像、用户名、正文、互动数据、认证标识与日夜主题，并一键导出高清 PNG。适合 UI 设计演示、营销文案预览、课程教学与创意素材制作，纯前端本地运行更安全。';
console.log('desc length', [...desc].length);

const olds = [
  'X 帖子截图生成器可在线制作高仿真 X（原 Twitter）模拟帖图片，支持自定义头像、用户名、正文、互动数据与日夜主题，适合设计演示、营销预览与教学展示。',
  desc,
];
// replace short old if present
h = h.split(olds[0]).join(desc);

// ensure meta description is desc
h = h.replace(
  /(<meta name="description" content=")([^"]*)(" \/>)/,
  `$1${desc}$3`
);
h = h.replace(
  /(property="og:description"\s*\n\s*content=")([^"]*)(")/,
  `$1${desc}$3`
);
h = h.replace(
  /(<meta name="twitter:description" content=")([^"]*)(" \/>)/,
  `$1${desc}$3`
);
h = h.replace(
  /("description": ")([^"]*)(")/,
  `$1${desc}$3`
);

// remaining old branding in body if any
const pairs = [
  ['什么是推特截图生成器？', '什么是 X 帖子截图生成器？'],
  ['为什么需要模拟推文截图？', '为什么需要模拟 X 帖截图？'],
  ['创作者常利用模拟推文进行', '创作者常利用模拟帖子进行'],
  ['完美适配 Twitter 的“白昼”与“暗夜”模式。', '完美适配 X（原 Twitter）的“白昼”与“暗夜”模式。'],
];
for (const [a, b] of pairs) {
  if (h.includes(a)) {
    h = h.split(a).join(b);
    console.log('fixed', a);
  }
}

// paragraph with either CRLF or LF
h = h.replace(
  /推特截图生成器（Tweet\r?\n\s*Generator）是一个可视化工具，允许用户在不实际发布推文的情况下，模拟出 Twitter \(X\) 平台的\r?\n\s*UI\r?\n\s*界面。它能精确还原字体（Inter）、间距、图标及交互布局，生成的图片与真实截图几乎无法分辨。/,
  'X 帖子截图生成器（原 Twitter / Tweet Generator）是一个可视化工具，可在不实际发帖的情况下，模拟 X 平台（原 Twitter）的 UI 界面。它能精确还原字体、间距、图标与交互布局，生成的图片与真实截图几乎无法分辨。'
);

fs.writeFileSync(path, h, 'utf8');
const m = h.match(/name="description" content="([^"]+)"/);
console.log({
  metaLen: m ? [...m[1]].length : 0,
  stillOld: /推特截图生成器/.test(h),
  light: /data-theme="light"/.test(h),
});
