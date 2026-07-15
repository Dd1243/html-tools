/** Final top-up for batch6 short guides. */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const APPEND = {
  'tools/office/business-card-maker.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">样式与配色实操</h2>
  <p style="margin:0 0 1rem">切换 <code>cardStyle</code> 后立刻看预览是否裁切长姓名。背景与文字对比不足时调 <code>colorText</code>；强调色只点缀姓名或分隔，避免整卡高饱和。电话与邮箱各占一行更易扫读。地址过长可缩到「城市 · 园区」。导出前用打印预览看是否被浏览器页眉挤占。键 <code>bc_maker_v2_data</code> 存本机草稿，换设备请先导出图片或 PDF。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">使用边界再强调</h2>
  <p style="margin:0">本页不负责印刷出血与专色；正式批量印刷请交给设计/印厂。联系方式属个人信息，公共电脑用完清空。与简历、标签工具分工：名片短身份、简历长经历、标签批量同文案。</p>
`,
  'tools/team-tools/milestone-tracker.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">周会怎么用里程碑</h2>
  <p style="margin:0 0 1rem">会前打开页面看逾期与未完成；会中只讨论红项原因与下一步主人。完成勾选必须对应可验收产出。项目名与结束日写在顶部，避免多项目混在一个列表。导出报告贴周报，分享链接给远程干系人。键 <code>milestone-data</code>；清空前先 export。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">和甘特/任务的边界</h2>
  <p style="margin:0">里程碑是「节点是否达成」；甘特是时间条；任务跟踪是日常勾选。不要把几十条琐事塞进里程碑。主题 theme 与业务数据分离。设备日期不准会导致逾期误报，请校准系统时间。</p>
`,
  'tools/team-tools/meeting-agenda.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">生成 HTML/MD 时注意</h2>
  <p style="margin:0 0 1rem">输出区的 HTML 字符串里可能含标题标签用于导出文档结构，那是生成结果不是页面第二个主标题。复制前确认已 gen 最新版。Markdown 适合知识库；TXT 适合IM；下载便于归档。模板加载会改议题，先分享或下载备份。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">控时与成本</h2>
  <p style="margin:0">总分钟 <code>totalMin</code> 约束议程；可与会议成本计算器同屏。参会人名单写全便于会前预读。键 <code>meet-agenda-data</code> 本机存储；分享 URL 含快照注意机密。与 office/agenda-maker 不互通数据。</p>
`,
  'tools/team-tools/team-vote.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">选项设计与改票</h2>
  <p style="margin:0 0 1rem">选项互斥、可理解、数量适中。投票进行中尽量不改选项文案。多选上限防「全选」。评分模式适合满意度，单选适合决胜。结果区赢家与列表帮助快速宣布。导出文本留决策记录。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">数据键与清场</h2>
  <p style="margin:0">状态在 <code>team-vote-v2-data</code>。一场结束后 clearAll 再开下一题，避免串票。无实名认证，重要事项加人工复核。分享链接同步题目与结果快照，注意隐私。主题切换不影响计票。</p>
`,
  'tools/team-tools/feedback-form.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">从草稿到发布</h2>
  <p style="margin:0 0 1rem">编辑题目 → 预览走查 → 生成 HTML/Markdown → 复制到托管或问卷平台。本页不默认保存用户提交的答案。必填与题型改完后重新预览。选项题保持选项简洁。键 <code>feedback-form-data</code> 存结构草稿。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">合规与模板</h2>
  <p style="margin:0">收集个人数据需告知目的与保留期。模板可加速，但要改成业务用语。分享链接协作编辑题目，不是答卷回收通道。公共电脑清空本地草稿。与团队投票互补：表单结构 vs 现场计票。</p>
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
  // count h1 outside script tags
  const noScript = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  return (noScript.match(/<h1\b/gi) || []).length;
}

let fail = 0;
const all = [
  'tools/media/text-to-image.html',
  'tools/office/quotation-maker.html',
  'tools/media/image-filters.html',
  'tools/office/business-card-maker.html',
  'tools/team-tools/milestone-tracker.html',
  'tools/team-tools/meeting-agenda.html',
  'tools/team-tools/team-vote.html',
  'tools/team-tools/feedback-form.html',
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
  if (before < 800) {
    const more = `\n  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">备份与公共环境注意</h2>\n  <p style="margin:0 0 1rem">重要结果请下载、复制或打印留存，勿只依赖浏览器缓存。公共电脑与共享账号使用后清空页面数据与剪贴板。本工具提升个人与小团队效率，不替代正式商务系统、印刷工艺或带身份认证的投票选举流程。</p>\n`;
    if (!g.html.includes('备份与公共环境注意')) {
      const insertAt = g.html.lastIndexOf('</section>');
      const nextGuide = g.html.slice(0, insertAt) + more.trim() + '\n' + g.html.slice(insertAt);
      html = html.slice(0, g.start) + nextGuide + html.slice(g.end);
      fs.writeFileSync(file, html, 'utf8');
      g = extractGuide(html);
      before = cn(g.html);
    }
  }
  const h1 = renderedH1(html);
  const ok = before >= 800 && before <= 1300 && h1 === 1;
  console.log(`${ok ? 'OK' : 'BAD'} ${rel}: guideCn=${before} h1=${h1}`);
  if (!ok) fail++;
}
console.log(fail ? 'FAIL' : 'OK');
process.exitCode = fail ? 2 : 0;
