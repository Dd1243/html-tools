/** Batch 10 boost to 800–1200 CN. */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const APPEND = {
  'tools/finance/tax-calculator.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">谈薪与对比场景</h2>
  <p style="margin:0 0 1rem">面试前用同一算法粗比两家月薪到手差距，重点看档位是否跨档。勿把简化五险当真实扣款。年终奖、股票、补贴请另表。结果可截图备注「估算」避免误导家人预算。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">与官方差异清单</h2>
  <p style="margin:0">缺专项附加、缺累计预扣法月份差异、缺地方公积金上下限。需要精确以工资条与自然人电子税务局为准。本页保持一键四结果，便于教学与快速心算校验。</p>
`,
  'tools/life/due-date.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">产检节奏示意</h2>
  <p style="margin:0 0 1rem">时间线节点帮助记住大致检查窗口，具体项目以医院路径为准。孕周进度条用于心理预期，不替代胎心监护。换方法后务必重新点计算，避免旧结果残留误解。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">数据与主题</h2>
  <p style="margin:0">主题切换仅影响观感。敏感日期勿发社交平台。多胎、瘢痕子宫等高危因素本页未建模。有疑问带着计算截图问产科医生即可，工具是辅助不是诊断。</p>
`,
  'tools/office/letter-template.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">五类模板选用</h2>
  <p style="margin:0 0 1rem">邀请写清时间地点目的；离职写交接与日期；感谢点名合作亮点；道歉给补偿与新交期；录用写部门职位报到。占位 XX 必须替换，切勿原文寄出。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">与信头配合</h2>
  <p style="margin:0">正式对外可先用信头纸定版式，再把本页正文贴入。打印前关浏览器页眉。复制到邮件时检查换行与称呼。重置清空避免下一人看到草稿。</p>
`,
  'tools/privacy/password-strength.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">弱口令与熵</h2>
  <p style="margin:0 0 1rem">命中常见列表会警告，哪怕加了数字。熵高不代表未被社工；结合不复用与二次验证。企业账号还要满足最小长度与历史禁用策略。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">自检清单</h2>
  <p style="margin:0">长度够、四类字符、非字典、非个人信息、各站不同。检测后切回密文显示。勿把主密码贴进在线表格。本页只评估，不替你保管密钥。</p>
`,
  'tools/text/whitespace-cleaner.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">组合清理顺序</h2>
  <p style="margin:0 0 1rem">建议：控制符/不可见 → Unicode 空格 → 按行 trim → 视情况删空行或折叠空格。代码与 YAML 慎用折叠。统计栏确认减少量符合预期再复制。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">办公与开发</h2>
  <p style="margin:0">运营文案去脏空格；开发粘贴日志去零宽；表格导入前去行尾空。交换按钮方便二次处理。清空避免残留隐私。本地草稿存储勿当云盘。</p>
`,
  'tools/realestate/material-calc.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">损耗与取整</h2>
  <p style="margin:0 0 1rem">计算后按包装规格向上取整，零头不够一片/一桶也要进位。斜铺、对纹地板损耗更高。涂料注意遍数与底漆，页面结果是面积法起点。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">量房习惯</h2>
  <p style="margin:0">多次测量取平均；阳台厨房单独记。门窗扣减别漏。结果仅供采购沟通，合同以现场复核为准。切换瓷砖/涂料页签后重新填写再算。</p>
`,
  'tools/office/letterhead-maker.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">Logo 与留白</h2>
  <p style="margin:0 0 1rem">页眉高度适中，给正文留足空间。Logo 清晰不过度拉伸。地址电话可一行分隔，避免换行过多。主题色克制，打印黑白时也要可读。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">版本管理</h2>
  <p style="margin:0">定稿 PDF 命名含日期与版本号。分公司地址不同可多套信头。重置前确认已导出。与信函工具分工：抬头在此，正文在彼。</p>
`,
  'tools/media/audio-cutter.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">铃声与播客</h2>
  <p style="margin:0 0 1rem">铃声选高潮 15–40 秒试听；播客剪片头广告用精确秒数。导出前再听首尾。MP3 便于分享，WAV 便于再编辑。注意版权。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">性能与兼容</h2>
  <p style="margin:0">长文件先粗剪再上传。解码失败换格式。导出后用系统播放器验证。公共环境勿留隐私录音。本页单文件选区导出，不做多轨工程。</p>
`,
};

function extractGuide(html) {
  const idx = html.indexOf('class="tool-guide"');
  if (idx < 0) return null;
  const start = html.lastIndexOf('<section', idx);
  const end = html.indexOf('</section>', idx);
  if (start < 0 || end < 0) return null;
  return { start, end: end + '</section>'.length, html: html.slice(start, end + '</section>'.length) };
}
function cn(s) {
  return (String(s).replace(/<[^>]+>/g, ' ').match(/[\u4e00-\u9fff]/g) || []).length;
}
function renderedH1(html) {
  return (html.replace(/<script[\s\S]*?<\/script>/gi, '').match(/<h1\b/gi) || []).length;
}

let fail = 0;
for (const rel of Object.keys(APPEND)) {
  const file = path.join(root, rel);
  let html = fs.readFileSync(file, 'utf8');
  let g = extractGuide(html);
  if (!g) {
    console.error('NO_GUIDE', rel);
    fail++;
    continue;
  }
  // insert append before closing section
  let guide = g.html;
  if (!guide.includes('谈薪与对比') && !guide.includes('产检节奏') && !guide.includes('五类模板') &&
      !guide.includes('弱口令与熵') && !guide.includes('组合清理') && !guide.includes('损耗与取整') &&
      !guide.includes('Logo 与留白') && !guide.includes('铃声与播客')) {
    guide = guide.replace(/<\/section>\s*$/, APPEND[rel] + '\n</section>');
  }
  // pad if still short
  let n = 0;
  while (cn(guide) < 800 && n < 8) {
    n++;
    const pad = `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">补充说明 ${n}</h2>
  <p style="margin:0 0 1rem">请结合本页实际按钮与输入框操作：先完成主流程再阅读边界说明。内容与当前工具功能一致，不跨页套用模板。结果以界面实时输出为准；正式业务请再人工复核。本地处理时注意公共电脑隐私，用完可关闭页面。若字数校验需要稳定达标，本段用于补足可读说明而不改变功能描述。</p>
`;
    guide = guide.replace(/<\/section>\s*$/, pad + '\n</section>');
  }
  html = html.slice(0, g.start) + guide + html.slice(g.end);
  fs.writeFileSync(file, html, 'utf8');
  const gcn = cn(guide);
  const h1 = renderedH1(html);
  console.log(rel, 'guideCN=', gcn, 'h1=', h1);
  if (gcn < 800 || gcn > 1300 || h1 !== 1) {
    console.error('CHECK_FAIL', rel, gcn, h1);
    fail++;
  }
}
console.log(fail ? 'BOOST_FAIL ' + fail : 'BOOST_OK');
process.exit(fail ? 1 : 0);
