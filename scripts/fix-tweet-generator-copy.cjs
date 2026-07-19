const fs = require('fs');
const path = 'tools/generator/tweet-generator.html';
let h = fs.readFileSync(path, 'utf8');

// Normalize line endings temporarily for matching
const hadCRLF = h.includes('\r\n');
h = h.replace(/\r\n/g, '\n');

const replacements = [
  ['什么是推特截图生成器？', '什么是 X 帖子截图生成器？'],
  ['为什么需要模拟推文截图？', '为什么需要模拟 X 帖截图？'],
  ['创作者常利用模拟推文进行', '创作者常利用模拟帖子进行'],
  ['完美适配 Twitter 的“白昼”与“暗夜”模式。', '完美适配 X（原 Twitter）的“白昼”与“暗夜”模式。'],
  [
    '推特截图生成器（Tweet\n            Generator）是一个可视化工具，允许用户在不实际发布推文的情况下，模拟出 Twitter (X) 平台的\n            UI\n            界面。它能精确还原字体（Inter）、间距、图标及交互布局，生成的图片与真实截图几乎无法分辨。',
    'X 帖子截图生成器（原 Twitter / Tweet Generator）是一个可视化工具，可在不实际发帖的情况下，模拟\n            X 平台（原 Twitter）的 UI 界面。它能精确还原字体、间距、图标与交互布局，生成的图片与真实截图几乎无法分辨。',
  ],
];

for (const [from, to] of replacements) {
  if (h.includes(from)) {
    h = h.split(from).join(to);
    console.log('replaced:', from.slice(0, 30));
  } else {
    console.log('missing:', from.slice(0, 40));
  }
}

// Ensure light default markers exist
if (!h.includes('data-theme="light"')) {
  h = h.replace('<html lang="zh-CN">', '<html lang="zh-CN" data-theme="light">');
}
if (!h.includes('tweet-theme')) {
  console.log('WARN: tweet-theme missing');
}

// Ensure title/h1 are updated
if (!h.includes('<h1>X 帖子截图生成器</h1>')) {
  h = h.replace(/<h1>[^<]*<\/h1>/, '<h1>X 帖子截图生成器</h1>');
}

// Keep UTF-8 with original line endings style
if (hadCRLF) h = h.replace(/\n/g, '\r\n');
fs.writeFileSync(path, h, 'utf8');

const check = fs.readFileSync(path, 'utf8');
console.log({
  lightHtml: /data-theme="light"/.test(check),
  h1: /X 帖子截图生成器/.test(check),
  oldTweetTitle: /什么是推特截图生成器/.test(check),
  tweetTheme: /tweet-theme/.test(check),
  descX: /原 Twitter/.test(check),
});
