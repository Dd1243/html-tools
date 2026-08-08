const fs = require('fs');
const p = 'tools/text/richtext-to-plain.html';
let h = fs.readFileSync(p, 'utf8');
const head = h.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)[1];
const tag = head.match(/<meta\s+[^>]*name=["']description["'][^>]*>/i);
if (!tag) {
  console.error('no desc tag');
  process.exit(1);
}
let content = tag[0].match(/content=["']([^"']*)["']/i)[1];
content = content.replace(/\s+/g, ' ').trim();
let len = [...content].length;
console.log('current len', len, content);

if (len < 120 || len > 160) {
  let desc =
    '富文本转纯文本工具可一键清除 HTML、Word 与网页粘贴带来的格式杂质，支持保留换行、列表、链接与表格文本化。本地浏览器运行更安全，适配手机与电脑，适合内容迁移、邮件撰写、SEO 清洗和日常文本净化，操作简单无需注册。';
  while ([...desc].length < 120) desc += '界面清爽，响应迅速。';
  if ([...desc].length > 160) desc = [...desc].slice(0, 155).join('') + '。';
  console.log('new len', [...desc].length);

  // Force single-line meta tags
  h = h.replace(
    /<meta[\s\S]*?name=["']description["'][\s\S]*?>/,
    `<meta name="description" content="${desc}" />`
  );
  h = h.replace(
    /<meta[\s\S]*?property=["']og:description["'][\s\S]*?>/,
    `<meta property="og:description" content="${desc}" />`
  );
  h = h.replace(
    /<meta[\s\S]*?name=["']twitter:description["'][\s\S]*?>/,
    `<meta name="twitter:description" content="${desc}" />`
  );
  h = h.replace(/("description":\s*")([^"]*)(")/g, (full, a, b, c) => {
    if (/富文本|HTML|纯文本|净化/.test(b) || b.length > 40) return a + desc + c;
    return full;
  });
  fs.writeFileSync(p, h);
  console.log('updated');
} else {
  console.log('ok');
}
