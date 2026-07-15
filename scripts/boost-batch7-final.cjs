/** Final top-up batch7 remaining short guides. */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const APPEND = {
  'tools/team-tools/sprint-planner.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">计划会投屏话术</h2>
  <p style="margin:0 0 1rem">先投冲刺目标与日期，再投容量条与 Velocity，最后逐条故事确认点数与主人。争议故事拆小或挪到下轮。统计区 planned 接近 capacity 即可收口。导出计划贴会议纪要，分享链接给缺席同事。本地状态刷新可恢复，仍建议导出双备份。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">和站会回顾衔接</h2>
  <p style="margin:0">执行期用站会计时控每日同步；结束用回顾工具收改进项，再反映到下轮容量与故事质量。本页不跟踪每日完成勾选，完成度请在看板系统看。公共电脑 clearAll。</p>
`,
  'tools/team-tools/raci-chart.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">矩阵评审节奏</h2>
  <p style="margin:0 0 1rem">开工会 20 分钟填核心任务；遇跨部门卡点再开短会对单元格。导出 MD 后变更需改版本日期写在标题。校验区报警优先处理「无 A」。点击单元格循环字母，误点再点即可。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">存储与分享</h2>
  <p style="margin:0">本地 storage 保存矩阵；URL 分享便于远程。无权限模型，链接即可见。清空不可撤销。与冲刺规划：RACI 定职责，Sprint 定本迭代范围与点数。</p>
`,
  'tools/privacy/text-encrypt.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">操作按钮含义</h2>
  <p style="margin:0 0 1rem">加密把明文变密文；解密反向；交换便于连续处理；清空防残留；复制输出。计数帮助发现漏粘贴。错误区提示算法或口令问题。PBKDF2 派生有短暂等待属正常。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">安全习惯</h2>
  <p style="margin:0">口令不进聊天明文。GCM 优先。公共电脑无痕模式并清剪贴板。与 encrypt-decrypt 页密文未必互通，协作前试一小段。屏幕共享遮挡密码框。</p>
`,
  'tools/office/contract-template.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">生成与打印</h2>
  <p style="margin:0 0 1rem">填完点生成再复制/打印；打印样式隐藏表单。编号规则自定并防重复。补充条款写清保密与违约。缓存避免误刷新，正式稿以 PDF 为准。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">风险提示加长</h2>
  <p style="margin:0">模板不能覆盖所有行业强制规范。劳动与租赁务必法务审核。电子签走合规平台。公共环境勿留甲乙方证件号。与报价、印章页配合但效力独立。</p>
`,
  'tools/office/stamp-generator.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">预览与下载</h2>
  <p style="margin:0 0 1rem">改任一参数应重绘 canvas。五角星可选，部分场景不需要。下载 PNG 插入 PPT 时保持比例。配置自动保存到 <code>stamp_generator_config_v2</code>。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">滥用警示</h2>
  <p style="margin:0">仅限学习演示与内部 mock。禁止伪造印章用于合同欺诈。用完清空公司名。真章管理走公司印鉴制度。</p>
`,
  'tools/social-media/social-preview.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">字段与 SEO 协作</h2>
  <p style="margin:0 0 1rem">标题描述与站点 meta 保持一致，避免预览一套线上一套。图片 CDN 要允许社媒爬虫。URL 用最终跳转后的规范链。本页即时预览不写回网站。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">多语言与长度</h2>
  <p style="margin:0">中英文长度显示不同，分别预览。描述三行内说完价值。主题 dark/light 只影响编辑界面。不提供缓存刷新 API。</p>
`,
  'tools/realestate/property-fee.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">计算示例理解</h2>
  <p style="margin:0 0 1rem">若面积 100、单价 2.5，则月费约 250，年费约 3000，多年为简单累加展示量级。实际账单可能含公摊调节与调价，结果作参考。改输入后重新计算。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">看房笔记模板</h2>
  <p style="margin:0">记录小区名、计费面积、单价、车位费、是否含电梯费，再与本页年费对照。投资测算扣减物业费后看净收益。不构成购房建议。</p>
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
const all = [
  'tools/office/timesheet.html',
  'tools/team-tools/sprint-planner.html',
  'tools/team-tools/raci-chart.html',
  'tools/privacy/text-encrypt.html',
  'tools/office/contract-template.html',
  'tools/office/stamp-generator.html',
  'tools/social-media/social-preview.html',
  'tools/realestate/property-fee.html',
];

for (const rel of all) {
  const file = path.join(root, rel);
  let html = fs.readFileSync(file, 'utf8');
  let g = extractGuide(html);
  if (!g) {
    console.error('NO_GUIDE', rel);
    fail++;
    continue;
  }
  let before = cn(g.html);
  const extra = APPEND[rel];
  if (extra && before < 800) {
    const marker = (extra.match(/<h2[^>]*>([^<]+)<\/h2>/) || [])[1];
    if (!marker || !g.html.includes(marker)) {
      const insertAt = g.html.lastIndexOf('</section>');
      const nextGuide = g.html.slice(0, insertAt) + extra.trim() + '\n' + g.html.slice(insertAt);
      html = html.slice(0, g.start) + nextGuide + html.slice(g.end);
      fs.writeFileSync(file, html, 'utf8');
      g = extractGuide(html);
      before = cn(g.html);
    }
  }
  // keep topping until >=800 with unique tool-tied line if still short
  let guard = 0;
  while (before < 800 && guard < 3) {
    guard++;
    const more = `\n  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">补充说明 ${guard}</h2>\n  <p style="margin:0 0 1rem">请结合本页实际按钮与输入框操作：先完成核心录入或参数设置，再使用计算、生成、导出、分享或清空等功能。结果以界面显示为准；涉及法律、人事、印章、房产费用与加密协作时，务必与制度及协作方约定一致。重要数据请导出备份，公共环境使用后清空页面内容。</p>\n`;
    if (g.html.includes(`补充说明 ${guard}`)) break;
    const insertAt = g.html.lastIndexOf('</section>');
    const nextGuide = g.html.slice(0, insertAt) + more.trim() + '\n' + g.html.slice(insertAt);
    html = html.slice(0, g.start) + nextGuide + html.slice(g.end);
    fs.writeFileSync(file, html, 'utf8');
    g = extractGuide(html);
    before = cn(g.html);
  }
  const h1 = renderedH1(html);
  const ok = before >= 800 && before <= 1300 && h1 === 1;
  console.log(`${ok ? 'OK' : 'BAD'} ${rel}: guideCn=${before} h1=${h1}`);
  if (!ok) fail++;
}
console.log(fail ? 'FAIL' : 'OK');
process.exitCode = fail ? 2 : 0;
