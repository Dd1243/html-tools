const fs = require('fs');
const path = require('path');

const descs = {
  'about.html':
    '了解 WebUtils（essays4u.net）：免费浏览器在线工具站，覆盖文本、开发、转换、计算、SEO、隐私与生活场景。本页说明站点定位、本地优先处理、分类维护、广告运营、内容边界、开源协作与联系入口，帮助你判断是否适合日常使用。',
  'contact.html':
    '联系 WebUtils（essays4u.net）：通过 GitHub Issues 反馈故障、建议新工具、报告隐私与内容问题。本页说明应提交的信息、处理优先级、回复预期，以及隐私、广告、合作类请求注意事项，并给出复现问题模板，便于快速定位与跟进。',
  'terms.html':
    'WebUtils（essays4u.net）使用条款：说明服务范围、合法使用要求、禁止行为、工具结果边界、隐私与广告、知识产权、可用性变更、责任限制、用户责任，以及条款更新与联系方式。使用本站即表示理解相关风险，请在使用前仔细阅读。',
  'privacy-policy.html':
    'WebUtils（essays4u.net）隐私政策：说明本地优先数据处理原则、常规访问日志、Cookie、Google 广告与个性化设置、第三方资源加载、用户权利、政策更新与联系方式，帮助你了解本站如何保护隐私并合规展示广告。',
};

// Ensure 120-160
for (const [file, desc] of Object.entries(descs)) {
  let d = desc;
  // pad carefully if short
  const extras = {
    'about.html': '欢迎从工具目录开始使用。',
    'contact.html': '',
    'terms.html': '完整条款见正文各章节。',
    'privacy-policy.html': '继续使用即表示知悉本政策。',
  };
  while ([...d].length < 120 && extras[file]) {
    d += extras[file];
    // avoid infinite if still short
    if ([...d].length < 120) d += '详见页面正文说明。';
    break;
  }
  // if still short, add generic once
  if ([...d].length < 120) {
    d += '详见页面正文说明。';
  }
  if ([...d].length > 160) {
    d = [...d].slice(0, 160).join('');
  }
  descs[file] = d;
  console.log(file, [...d].length);
}

function setDesc(html, desc) {
  // name=description
  html = html.replace(
    /(<meta\s+name=["']description["']\s+content=["'])([^"']*)(["'])/i,
    `$1${desc}$3`
  );
  // og:description
  html = html.replace(
    /(<meta\s+property=["']og:description["']\s+content=["'])([^"']*)(["'])/i,
    `$1${desc}$3`
  );
  return html;
}

for (const [file, desc] of Object.entries(descs)) {
  const fp = path.join(__dirname, '..', file);
  let html = fs.readFileSync(fp, 'utf8');
  html = setDesc(html, desc);
  fs.writeFileSync(fp, html, 'utf8');
}

console.log('done');
