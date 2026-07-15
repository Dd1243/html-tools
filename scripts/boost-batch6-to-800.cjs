/** Batch 6 boost to 800–1200 CN. */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const APPEND = {
  'tools/media/text-to-image.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">参数微调清单</h2>
  <p style="margin:0 0 1rem">字号与行高决定呼吸感：行高略大于 1 更易读。内边距在窄屏分享时尤其重要，避免贴边裁切。对齐：标题居中、列表式文案可左对齐。HEX 与取色器不一致时以最后一次输入为准并再看预览。预设适合快速出图，品牌色请覆盖预设颜色。导出 PNG 保清晰；JPG 适合纯色底照片流但可能有压缩痕迹。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">内容与合规</h2>
  <p style="margin:0">引用名言注明出处；勿生成侵权商标组合图用于商业。工具不存历史文案到服务器，刷新可能丢未下载结果，重要图先下载。与滤镜页串联：先出文字图再调色。公共场合注意屏幕窥视文案隐私。</p>
`,
  'tools/office/quotation-maker.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">明细与税率实务</h2>
  <p style="margin:0 0 1rem">每行写清规格与单位，避免「服务费」过于笼统。折扣可体现在单价或备注，勿重复扣。税率变更后确认税额与总计联动。有效期过短客户来不及审批，过长则成本波动风险大。单号建议含年份与流水，便于归档检索。键 <code>webutils_quotation_data</code> 仅本机，成交版本请 PDF 存档。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">客户沟通</h2>
  <p style="margin:0">发送前自检公司抬头、客户名拼写、币种与付款备注。还价后改价应更新单号或版本号。本页不替代合同；大额项目以盖章合同为准。公共电脑清空报价数据。</p>
`,
  'tools/media/image-filters.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">滑杆含义速查</h2>
  <p style="margin:0 0 1rem">亮度整体明暗；对比拉大层次；饱和影响色彩浓淡；色温偏冷暖；色相整体偏移色轮；模糊柔化；锐化增强边缘；暗角压四角。先小步调整，用对比条确认未毁掉高光阴影。锐化在低质量图上会放大噪点。预设是起点不是终点。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">性能与导出</h2>
  <p style="margin:0">超大图先缩小再滤镜。连续猛拖滑杆可能卡顿，松手后等一帧。导出后可用格式转换压体积。隐私照片本地处理完毕关闭页签。与像素化/水印工具分工明确：本页全局调色为主。</p>
`,
  'tools/office/business-card-maker.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">印刷前检查</h2>
  <p style="margin:0 0 1rem">核对电话能否拨通、邮箱无错字、公司全称与工商一致。颜色在不同显示器有色差，印刷请提供标准色值给厂家。样式切换后检查文字是否溢出卡片边界。键 <code>bc_maker_v2_data</code> 存草稿；多人名片请分别导出 PDF 命名。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">电子使用</h2>
  <p style="margin:0">导出图可做邮件签名或社交头图，注意缩放清晰度。不要在名片堆砌二维码过多信息。清空前确认已导出。与标签打印页不同：名片强调身份版式，标签强调批量相同文案。</p>
`,
  'tools/team-tools/milestone-tracker.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">逾期与进度解读</h2>
  <p style="margin:0 0 1rem">逾期统计帮助暴露风险，但要区分「日期填错」与「真延期」。完成打勾应在验收通过后，而不是「差不多了」。进度条偏完成计数，不代表工作量加权。项目结束日用于整体紧迫感，可与公司里程碑日历对照。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">分享与导出</h2>
  <p style="margin:0">shareState 适合同步快照；exportReport 适合周报粘贴。链接无权限，勿含未公开融资节点。键 <code>milestone-data</code> 本机；换电脑先导出。与甘特、WBS 分工：节点 / 条形 / 分解树。</p>
`,
  'tools/team-tools/meeting-agenda.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">输出格式怎么选</h2>
  <p style="margin:0 0 1rem">Markdown 进文档库与 Git；纯文本进 IM；HTML 进邮件富文本。生成后再 copy/download，避免复制旧缓存。模板适合站会/评审骨架，加载后按本次目标删改。总分钟是各议题之和，可加「缓冲」议题。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">与 office 议程页</h2>
  <p style="margin:0">站内可能另有 agenda-maker，存储键与导出能力不同，选一处维护避免双份。本页键 <code>meet-agenda-data</code>。分享链接对齐远程参会者。机密并购会勿用公开电脑。</p>
`,
  'tools/team-tools/team-vote.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">计票与并列</h2>
  <p style="margin:0 0 1rem">单选看得票；多选看被选次数；评分看均分或总分（以 renderResults 展示为准）。并列时不要强行宣布，可二轮投票或改评分。提交前确认模式与选项未中途被主持人改掉。导出文本留档决策。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">诚信与隐私</h2>
  <p style="margin:0">无登录意味着可刷票，重要决策加线下确认。姓名可用花名。键 <code>team-vote-v2-data</code> 清场用 clearAll。与反馈表单：投票即时聚合，表单偏结构设计。</p>
`,
  'tools/team-tools/feedback-form.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">题型与选项</h2>
  <p style="margin:0 0 1rem">改题型后检查选项是否仍适用；必填标记要克制。预览模拟填写路径，确保题干无歧义。代码导出后若手改 HTML，注意与再次生成覆盖的关系。模板适合满意度/活动反馈骨架。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">收集闭环</h2>
  <p style="margin:0">本页重「生成结构」；真正收回答案需托管页+后端或第三方。分享链接便于协作编辑题目。键 <code>feedback-form-data</code> 存草稿。涉及个人信息写清隐私说明。公共电脑清空。</p>
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

const all = Object.keys(APPEND);
let fail = 0;
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
    const more = `\n  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">本地数据与使用边界</h2>\n  <p style="margin:0 0 1rem">本页草稿与结果主要保存在当前浏览器环境，清除站点数据、更换设备或隐私模式可能导致丢失，重要报价、名片、议程、投票与表单请及时导出、复制或打印备份。公共电脑使用完毕后应清空敏感信息。工具用于提升效率，不替代正式商务、项目管理或合规流程，请以组织制度与法规为准。</p>\n`;
    if (!g.html.includes('本地数据与使用边界')) {
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
