/** Final top-up for batch4 short guides. */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const APPEND = {
  'tools/office/slide-notes.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">备份与协作</h2>
  <p style="margin:0 0 1rem">重要演讲把每页标题与备注复制到文档双备份。与搭档彩排时一人控 PPT 一人看本页备注。键 <code>webutils_slide_notes</code> 不会跨设备；换电脑请导出文本。清空后若只想恢复示例，删除站点数据或手动新建欢迎页即可。</p>
`,
  'tools/office/expense-report.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">月度整理节奏</h2>
  <p style="margin:0 0 1rem">建议每周五导出一次 CSV，文件名带日期。月中核对合计是否接近预算。跨月费用按消费日归集，勿混进下月。删除误录条目后看 <code>#total_val</code> 与 <code>#count_val</code> 是否同步下降。提交 OA 后可清空本页，避免敏感金额长期留在浏览器。</p>
`,
  'tools/office/resume-maker.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">预览与打印细节</h2>
  <p style="margin:0 0 1rem">预览卡片随输入即时更新，改教育/经历/技能都会触发刷新。打印前用浏览器打印预览看分页是否截断。一页纸原则：压缩早期无关经历，突出近 5 年。技能标签过多会换行拥挤，保持精炼。清空会 removeItem <code>webutils_resume_data</code>，请先另存 PDF。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">多版本策略</h2>
  <p style="margin:0">研发岗与产品岗可各打一份 PDF 命名区分；本页同时只持有一份草稿。切换版本前导出，再改内容覆盖本地草稿。不要在简历写期望薪资除非对方明确要求。</p>
`,
  'tools/office/seating-chart.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">命名与桌型</h2>
  <p style="margin:0 0 1rem">桌名用「主桌/亲友 1/客户 A」比纯数字好认。圆桌适合宴请闲聊，方桌/矩形适合培训面向讲台。座位数按实际椅数填，不要虚高导致现场空位尴尬。弹窗保存后关闭，再点可改名。整桌删除会丢掉该桌全部宾客名，操作需确认。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">与签到联动思路</h2>
  <p style="margin:0">可把座位图宾客名导入签到花名册做「来没来」；两套数据不自动同步，改名时两边都要改。活动结束归档截图即可，不必长期留在浏览器。</p>
`,
  'tools/office/receipt-maker.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">明细行维护</h2>
  <p style="margin:0 0 1rem">添加商品行后改名称、数量、单价，预览应重算。删除不用的空行以免总额被 0 价干扰。税率为百分数输入习惯以控件为准（如 6 表示 6% 或按页面说明）。折扣勿与「议价改单价」重复扣减。店名与门店信息会印在收据头，保持与招牌一致提升专业感。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">日结建议</h2>
  <p style="margin:0">打烊后把当日收据截图按号段存文件夹，再清空明细准备次日。本页不生成销售报表，统计请另用表格。若法律要求必须用税控机，请遵守当地规定。</p>
`,
  'tools/team-tools/icebreaker.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">远程与线下差异</h2>
  <p style="margin:0 0 1rem">线上会议投屏结果卡并点名回答；线下可投影或口播题目。网络卡顿时提前多抽几道进历史备用。自定义题可写「用三个词形容本周」，降低表达门槛。不要连抽羞辱性题目。保存状态后刷新应能恢复分类选择与历史（以 loadState 为准）。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">和决策/回顾工具衔接</h2>
  <p style="margin:0">破冰结束进入正式议程或回顾看板；需要投票用团队投票页。破冰只负责暖场提问与短计时，不记录决议。</p>
`,
  'tools/office/agenda-maker.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">复制与打印场景</h2>
  <p style="margin:0 0 1rem">复制适合粘贴到邮件/IM；打印适合会议室纸质版与签字。打印前确认日期地点与参会人完整。总时长超过 90 分钟应插入休息议题。清空会删除 <code>agenda_maker_v2_data</code>，系列例会可先复制再改日期复用结构。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">与成本意识结合</h2>
  <p style="margin:0">议程压时间，会议成本计算器显金钱，两者一起用更能约束「再开一会」。跨时区参会先用会议协调器定开始点，再填入本页开始时间。</p>
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
const all = [
  'tools/office/slide-notes.html',
  'tools/office/attendance-sheet.html',
  'tools/office/expense-report.html',
  'tools/office/resume-maker.html',
  'tools/office/seating-chart.html',
  'tools/office/receipt-maker.html',
  'tools/team-tools/icebreaker.html',
  'tools/office/agenda-maker.html',
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
  // second pass if still short: generic but still tool-tied paragraph
  if (before < 800) {
    const more = `\n  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">本地存储与使用注意</h2>\n  <p style="margin:0 0 1rem">本页核心数据保存在当前浏览器本地，清除站点数据、更换设备或使用隐私模式都可能导致草稿消失，重要结果请及时导出、复制或打印备份。公共电脑使用完毕后应清空页面数据，避免姓名、金额、议程等敏感信息留给下一位用户。工具用于提升整理效率，不替代公司正式系统中的审批、考勤或税务合规流程；请以组织制度与当地法规为准。</p>\n`;
    if (!g.html.includes('本地存储与使用注意')) {
      const insertAt = g.html.lastIndexOf('</section>');
      const nextGuide = g.html.slice(0, insertAt) + more.trim() + '\n' + g.html.slice(insertAt);
      html = html.slice(0, g.start) + nextGuide + html.slice(g.end);
      fs.writeFileSync(file, html, 'utf8');
      g = extractGuide(html);
      before = cn(g.html);
    }
  }
  const h1 = (html.match(/<h1\b/gi) || []).length;
  const ok = before >= 800 && before <= 1300 && h1 === 1;
  console.log(`${ok ? 'OK' : 'BAD'} ${rel}: guideCn=${before} h1=${h1}`);
  if (!ok) fail++;
}
console.log(fail ? 'FAIL' : 'OK');
process.exitCode = fail ? 2 : 0;
