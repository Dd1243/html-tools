/** Batch 4 boost to 800–1200 CN, tool-specific. */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const APPEND = {
  'tools/office/slide-notes.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">提词写法与计时技巧</h2>
  <p style="margin:0 0 1rem">每页备注建议控制在 3–6 行：开场钩子、两个论据、收束句。数字单独成行方便扫读。计时开始后不要边讲边改稿，否则注意力分裂。彩排时若某页超时，把故事移到附录页或会后 Q&A。翻页节奏可与正式 PPT 操作员约定手势。键 <code>webutils_slide_notes</code> 只存本机；重要演讲请另存一份 Markdown 备份。清空列表前确认已备份，默认欢迎词示例可随时重新加载逻辑取决于是否仍有缓存。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">演示环境建议</h2>
  <p style="margin:0 0 1rem">外接屏时把浏览器窗口放在提词机位置，字号用浏览器缩放加大。打印样式隐藏编辑区，适合生成纸质提词卡。网络不稳时本页仍可离线使用（已打开缓存页）。勿在备注粘贴未公开财报全文；提词机被拍摄有泄露风险。与站内演讲计时器分工：本页绑幻灯备注，专用计时器可做分段红黄绿灯。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">故障排查</h2>
  <p style="margin:0">翻页无效：检查是否只剩一页或索引已到边界。计时不走：确认未停在暂停、页签在前台。保存失败少见，多为隐私模式禁用 storage——改用普通窗口或导出文本。预览与编辑不同步时切换一下页码触发 <code>updateView</code>。</p>
`,
  'tools/office/attendance-sheet.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">多日点名与导出习惯</h2>
  <p style="margin:0 0 1rem">花名册跨日复用，records 按日期分桶，因此同一人周一出勤、周二请假可分别记录。导出前先选目标日期再操作，避免导错天。建议每周五导出备份到网盘表格。点名时可由一人读姓名一人点状态，提高速度。迟到与请假要现场口径一致，避免事后扯皮。键名 <code>attendance_v2_storage</code> 升级时若结构变化，旧数据可能需重建花名册。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">隐私与合规</h2>
  <p style="margin:0 0 1rem">考勤属于个人信息，勿把浏览器共享账号给无关同事。投屏时注意不要展示与课程无关的敏感备注。未成年人培训班更应最小化采集。本工具无加密存储，设备丢失等于数据暴露风险——重要班级请以学校官方系统为准，本页作轻量辅助。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">统计解读</h2>
  <p style="margin:0">出勤率可用 present / total 心算；连续缺勤应人工跟进，工具不会自动预警。未点状态的人不会计入四态，汇报时要说明「未登记」与「缺勤」不同。打印适合签字存档，电子存档优先 CSV/导出文件。</p>
`,
  'tools/office/expense-report.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">分类与财务对接</h2>
  <p style="margin:0 0 1rem"><code>getCatName</code> 把 travel、meals 等代码变成「差旅交通」「餐饮交际」等中文，导出 CSV 时用中文列便于财务阅读。若公司科目更细，可在说明里写二级科目，如「差旅交通-高铁」。金额保留两位小数习惯与票面一致。多笔同一商户不要合并到看不清票据对应关系。键 <code>expense_report_data_v1</code> 仅本机，提交报销后可导出归档再清空，减少残留。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见填报错误</h2>
  <p style="margin:0 0 1rem">日期写成消费日而非填写日；把个人消费混入公务；说明过简导致驳回；重复添加同一票据。建议每录一笔就对照票据拍照命名。汇率差旅先换算成本位币再填，并在说明标注原币。清空按钮不可恢复，误清只能靠之前的 CSV。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">与其他办公页配合</h2>
  <p style="margin:0">发票税额可用发票计算器预估；出差日程可用甘特或议程辅助，但报销金额仍以本页流水为准。不要把本页 CSV 当成已审批凭证，正式流程走公司 OA。</p>
`,
  'tools/office/resume-maker.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">投递前检查清单</h2>
  <p style="margin:0 0 1rem">联系方式可接通；每段经历时间无重叠错误；项目成果可验证；技能与 JD 匹配；预览无溢出错位。中英文岗位分别准备版本时，可复制浏览器内容另存，因本页主要一份 <code>webutils_resume_data</code>。打印 PDF 后用阅读器搜索自己的姓名与公司名，确认编码正常。照片若页面支持上传，注意证件照比例与文件大小。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">经历量化示例思路</h2>
  <p style="margin:0 0 1rem">把「负责运营」改成「优化转化漏斗，注册转化提升 x%，季度收入 +y」。教育段写清学位与核心课程即可。技能标签避免把「会用搜索引擎」这类无效项放进。空窗期可用学习/志愿项目诚实说明。删除经历时脚本可能限制至少保留一条，避免预览结构塌陷。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">隐私</h2>
  <p style="margin:0">简历含手机与邮箱，公共电脑清空存储。不要在简历写身份证号与精确家庭住址。本页不代投招聘网站。</p>
`,
  'tools/office/seating-chart.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">现场执行清单</h2>
  <p style="margin:0 0 1rem">打印座位图时放大桌名与宾客名；入口放总图，每桌放桌卡。临时加座：优先填空位，再考虑加桌。贵宾改期时同步改 <code>webutils_seating_data</code> 并重发截图。圆桌适合讨论，方桌适合培训朝向——选型服务于活动形式。座位数填写后中途想改，通常需删桌重建或按实现编辑，操作前确认名单。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">冲突处理</h2>
  <p style="margin:0 0 1rem">两家有矛盾的宾客不要同桌；供应商与客户是否同桌按商务礼仪定。儿童桌与主桌距离要考虑照看。工具不会提示冲突，全靠人工规则。导出手段以截图/打印为主，无多人实时协作编辑。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">数据备份</h2>
  <p style="margin:0">重大婚宴建议把最终名单复制到表格双备份。清空桌台不可回退。换电脑布置时无法自动同步，请提前迁移文本名单。</p>
`,
  'tools/office/receipt-maker.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">总额核对步骤</h2>
  <p style="margin:0 0 1rem">先核每行数量×单价，再看税率与折扣是否双计或漏计。折扣是减号项，税率按预览公式加在小计上——以页面显示总额为准心算一遍。收据号不要与上一单重复，必要时手动改号。支付方式写清有助对账。页脚可放退换货说明与联系电话。数据在 <code>webutils_receipt_data</code>，日终可截图存档后清空明细防串单。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">合规再强调</h2>
  <p style="margin:0 0 1rem">客户若需抵扣税款，应走税务机关认可的发票渠道。本页收据可作消费凭证样式，但不能印假发票监制章。金额较大时建议合同+正规票据双轨。外币标价请在店名或页脚声明币种。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">打印技巧</h2>
  <p style="margin:0">热敏纸宽度有限时减少商品列文字长度；浏览器打印边距设最小。预览与纸质不一致时检查缩放是否为 100%。无库存模块，卖完的商品需人工停售。</p>
`,
  'tools/team-tools/icebreaker.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">分类怎么组合</h2>
  <p style="margin:0 0 1rem">开场 10 分钟：只开「趣味/通用」。工作坊中段：加「工作」谈协作风格。全选分类会让题库更大但主题发散，主持要能控场。自定义题适合写入公司价值观相关轻松问题，避免阴阳怪气。历史列表用于避免刚抽过的题重复讲；若实现未强去重，主持人可再点一次生成。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">计时器用法</h2>
  <p style="margin:0 0 1rem">默认约一分钟适合短分享；深聊可把 <code>timerDur</code> 调长。开始后指示灯式盯显示，到时切换下一位。计时与抽题数据分开，重置计时不会清空历史题。键 <code>icebreaker-data</code> 保存偏好与历史；主题键 theme 只管明暗。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">风险与边界</h2>
  <p style="margin:0">强制回答私人问题可能造成心理不适，务必允许 Pass。远程会议可投屏结果卡。不要用破冰题变相摸底薪资或孕产等敏感信息。本页不替代专业团建教练方案。</p>
`,
  'tools/office/agenda-maker.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">时长与结束时间算法</h2>
  <p style="margin:0 0 1rem"><code>parseTime</code> 解析开始时刻，各议题 <code>duration</code> 分钟求和得 <code>totalDuration</code>，再 <code>formatTime</code> 得到 <code>endTime</code>。你把某题从 15 改成 25，结束时间应立即后移。上移下移改变讨论顺序但不改变总时长。建议显式加「缓冲 5 分钟」议题，避免每个议题都拖堂导致整体延误。键 <code>agenda_maker_v2_data</code> 保存标题、参会人与议题列表。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">会前会中会后</h2>
  <p style="margin:0 0 1rem">会前复制议程到邀请；会中投影并打勾（可在议题名加「✓」手改）；会后把未决项转待办或回顾看板。参会人名单与决策矩阵/签到表可对照，但数据不自动同步。打印适合签字版议程；复制适合即时通讯。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">反模式</h2>
  <p style="margin:0">议题过多却无主人；全是同步没有决策；开始时间空着却想看结束时间；在公共电脑留下并购等机密议程。清空前先复制出去。需要跨时区协调开点时，另用会议时间协调器，本页只管单一时间线编排。</p>
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
  const before = cn(g.html);
  if (before >= 800 && before <= 1300) {
    console.log('SKIP_OK', rel, before);
    continue;
  }
  const marker = (extra.match(/<h2[^>]*>([^<]+)<\/h2>/) || [])[1];
  if (marker && g.html.includes(marker)) {
    console.log('HAS', rel, before);
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
