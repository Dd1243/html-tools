const fs = require('fs');
const path = 'tools/generator/iban-generator.html';
let html = fs.readFileSync(path, 'utf8');

const desc =
  'IBAN 生成器与校验器支持多国国际银行账号批量生成与 MOD-97 格式校验，结果可一键复制。全程本地浏览器运行更安全，适配手机与电脑，适合支付系统测试、跨境结算联调与金融开发，操作简单结果清晰，无需注册即可免费立即使用，仅供测试场景使用。';

console.log('desc_len=', [...desc].length);
if ([...desc].length < 120 || [...desc].length > 160) {
  console.error('BAD LENGTH');
  process.exit(1);
}

html = html.replace(
  /(<meta name="description" content=")([^"]*)(" \/>)/,
  `$1${desc}$3`
);
html = html.replace(
  /(<meta property="og:description" content=")([^"]*)(" \/>)/,
  `$1${desc}$3`
);
html = html.replace(
  /(<meta name="twitter:description" content=")([^"]*)(" \/>)/,
  `$1${desc}$3`
);
html = html.replace(
  /("description":\s*")([^"]*)(")/,
  `$1${desc}$3`
);

fs.writeFileSync(path, html, 'utf8');

const after = fs.readFileSync(path, 'utf8');
const m = after.match(/name="description" content="([^"]+)"/);
console.log('final_desc_len=', m ? [...m[1]].length : 0);
console.log('final_desc=', m ? m[1] : '');
