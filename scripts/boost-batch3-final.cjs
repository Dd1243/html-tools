/** Final top-up for remaining short batch3 guides. */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const APPEND = {
  'tools/privacy/random-key.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">复制与二次确认</h2>
  <p style="margin:0 0 1rem">点复制前先扫一眼长度是否符合预期：hex 只含 0-9a-f；UUID 必须带连字符分段；base64 草稿可能含 +/ 等字符，某些配置文件需再包引号。复制成功按钮会短暂提示已复制。若系统拦截剪贴板权限，请手动选中输出区复制。生成后不要在截图里公开完整密钥；演示可用明显假数据。需要「可复现的伪随机」做单测时，请在测试框架里用固定种子，不要用本页的真随机输出当夹具。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">与加密解密页如何配合</h2>
  <p style="margin:0">本页只负责生成密钥材料；加解密、对称算法演示请用隐私分类下的加密工具页。文件完整性校验用文件哈希页。三者不要混用概念：随机密钥 ≠ 哈希摘要 ≠ 密文。</p>
`,
  'tools/team-tools/decision-matrix.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">会议中怎么用矩阵</h2>
  <p style="margin:0 0 1rem">投屏打开矩阵，先冻结标准与权重再打分，避免边吵边改权重。每人可先私下打分再取整或讨论收敛到一格分数，减少锚定偏见。赢家产生后用一句话写下「为何不是第二名」，写进导出结果备注（可粘贴到文档）。若数据不足，把矩阵结论标为「待验证假设」，并列出需要补的实验或报价，而不是立刻签约。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">维护建议</h2>
  <p style="margin:0">长期决策可另存多份链接快照对比「当时权重」。标准名称尽量稳定，便于跨项目复用模板。删除方案前确认没有未导出的讨论结论。本页不做多人实时光标协同，远程会以一人录入、全员口头达成为主。</p>
`,
  'tools/media/svg-placeholder.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">设计协作话术</h2>
  <p style="margin:0 0 1rem">把占位图当「尺寸契约」：开发按 SVG/PNG 的宽高写 CSS，设计稍后替换真实视觉。文案写「首页 Hero 占位」比写「图片」更能减少误解。多断点时为 375/768/1280 各导一张，避免只出桌面尺寸。若占位长期留在生产环境，应换成真实图并补 alt，否则影响无障碍与观感。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">参数组合示例</h2>
  <p style="margin:0">深色主题页面可用深底浅字；浅色后台可用浅灰底深字并加细描边。字号过小会看不清尺寸标注，过大则溢出观感差——可先留空让算法按短边估算，再微调。需要品牌色时可把背景设为品牌主色、文字用对比色，快速做活动页骨架。复杂插画请在设计工具完成，本页保持「纯色底 + 居中字」的克制能力边界。</p>
`,
  'tools/team-tools/retrospective.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">导出 Markdown 怎么用</h2>
  <p style="margin:0 0 1rem">导出内容按当前模板分列输出卡片与票数，可直接贴进 Confluence/飞书/Git 仓库的 retro 目录。建议文件名含日期与冲刺名。行动项单独复制到任务系统并设截止日，避免只停在回顾页。若导出前改过模板，确认列含义仍与讨论一致。</p>
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

let fail = 0;
for (const [rel, extra] of Object.entries(APPEND)) {
  const file = path.join(root, rel);
  let html = fs.readFileSync(file, 'utf8');
  const g = extractGuide(html);
  if (!g) {
    console.error('NO_GUIDE', rel);
    fail++;
    continue;
  }
  let before = cn(g.html);
  if (before >= 800 && before <= 1300) {
    console.log('SKIP_OK', rel, before);
    continue;
  }
  const marker = extra.match(/<h2[^>]*>([^<]+)<\/h2>/)[1];
  if (g.html.includes(marker)) {
    console.log('HAS_MARKER', rel, before);
    if (before < 800) fail++;
    continue;
  }
  const insertAt = g.html.lastIndexOf('</section>');
  const nextGuide = g.html.slice(0, insertAt) + extra.trim() + '\n' + g.html.slice(insertAt);
  html = html.slice(0, g.start) + nextGuide + html.slice(g.end);
  fs.writeFileSync(file, html, 'utf8');
  const after = cn(nextGuide);
  const h1 = (html.match(/<h1\b/gi) || []).length;
  const ok = after >= 800 && after <= 1300 && h1 === 1;
  console.log(`${ok ? 'OK' : 'BAD'} ${rel}: ${before} -> ${after} h1=${h1}`);
  if (!ok) fail++;
}
console.log(fail ? 'FAIL' : 'OK');
process.exitCode = fail ? 2 : 0;
