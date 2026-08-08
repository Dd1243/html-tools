const fs = require('fs');

const pages = [
  {
    file: 'tools/text/morse-code.html',
    desc:
      '摩尔斯电码转换器支持文本与 Morse 双向实时互转，附完整字母数字对照表、示例输入与电码音频播放。全程本地浏览器运行更安全，适配手机与电脑，适合学习解密、电台通信练习和日常查询，操作简单结果清晰，无需注册即可免费立即使用，界面清爽响应迅速。'
  },
  {
    file: 'tools/text/nato-alphabet.html',
    desc:
      'NATO 字母表转换器支持英文与数字实时转为 ICAO 音标拼读，附完整对照表、示例填充与多种复制格式。全程本地浏览器运行更安全，适配手机与电脑，适合航空通信、客服核对、车牌报读和日常拼字，操作简单结果清晰，无需注册即可免费立即使用，界面清爽响应迅速。'
  },
  {
    file: 'tools/text/number-formatter.html',
    desc:
      '数字格式化工具支持千分位、货币、百分比、科学计数法、紧凑缩写、中文财务大写与多进制转换。全程本地浏览器运行更安全，适配手机与电脑，适合财务对账、报表整理和日常数字处理，操作简单结果清晰，无需注册即可免费立即使用，界面清爽响应迅速，一键复制。'
  }
];

for (const p of pages) {
  let html = fs.readFileSync(p.file, 'utf8');
  const len = [...p.desc].length;
  console.log(p.file, 'desc_len=', len);
  if (len < 120 || len > 160) {
    console.error('BAD LENGTH', p.file, len);
    process.exit(1);
  }
  html = html.replace(
    /(<meta name="description" content=")([^"]*)(" \/>)/,
    `$1${p.desc}$3`
  );
  html = html.replace(
    /(<meta property="og:description" content=")([^"]*)(" \/>)/,
    `$1${p.desc}$3`
  );
  html = html.replace(
    /(<meta name="twitter:description" content=")([^"]*)(" \/>)/,
    `$1${p.desc}$3`
  );
  html = html.replace(
    /("description":\s*")([^"]*)(")/,
    `$1${p.desc}$3`
  );
  fs.writeFileSync(p.file, html, 'utf8');
  const after = fs.readFileSync(p.file, 'utf8');
  const m = after.match(/name="description" content="([^"]+)"/);
  console.log('  final=', m ? [...m[1]].length : 0, m ? m[1] : '');
}

console.log('done');
