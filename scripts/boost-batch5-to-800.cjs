/** Batch 5 boost to 800–1200 CN. */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const APPEND = {
  'tools/team-tools/standup-timer.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">远程站会与设备注意</h2>
  <p style="margin:0 0 1rem">投屏时钟给全员，音频可关以免回声。浏览器节流会导致后台计时漂移，主持人页签必须前台。音效被拦截时改口令「时间到」。名单存 <code>standup-timer-v2-data</code>，跨周可复用；人员变动及时删改。打乱顺序适合打破层级发言习惯。统计平均时长用于改进，而不是当众点名羞辱超时者。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">与任务工具衔接</h2>
  <p style="margin:0">站会暴露的阻塞记到任务跟踪器或清单；详细拆解用 WBS。本页只控发言轮次与秒数，不存「昨天今天阻塞」文本。清空前确认是否还要同一成员列表。</p>
`,
  'tools/team-tools/task-breakdown.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">编码与导出协作</h2>
  <p style="margin:0 0 1rem">WBS 编码随层级渲染，讨论时用编码指代节点减少歧义。导出 TXT 带缩进大纲，可贴进立项书。分享链接适合远程只读对齐，注意项目名脱敏。本地键 <code>wbs-tool-v2-data</code> 与主题键分离。清空前先 downloadTxt。工时只是估算输入，不会自动变成排期条，需要甘特请另开甘特页手工转录关键路径。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">拆太深或太浅</h2>
  <p style="margin:0 0 1rem">深度统计帮助发现「一层巨石任务」。若深度很大但叶子仍模糊，继续加子节点直到可验收。若全是一句话无工时，先补 hours 再谈资源。父子工时是否重复累计以页面统计为准，评审时统一口径：通常只估叶子。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">从 WBS 到执行</h2>
  <p style="margin:0">定稿后把叶子任务抄到任务跟踪器并标优先级，或导入团队正式系统。本页不跟踪完成百分比，完成状态请在执行工具勾选。里程碑级节点可在名称加【M1】前缀便于检索。</p>
`,
  'tools/office/leave-calculator.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">自定义假日维护技巧</h2>
  <p style="margin:0 0 1rem">把全年法定休假日提前批量加入 <code>customHolidays</code>，调休上班日不要加入。列表排序后便于检查遗漏。计算前再核对起止是否含半天——工具按整天模型。快捷加载若提供常见区间，仍以你改后的日期为准。结果三项：总日历跨度、排除后的工作日、休息相关天数，解释请假额度时用工作日更贴近多数公司规则，但仍以 HR 手册为准。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">拼假与风险</h2>
  <p style="margin:0 0 1rem">拼假提示帮助发现「请很少、连休很长」的窗口，但票价与人潮另算。跨境行程注意时差与当地假日不同。不要仅凭提示提前辞职或违纪旷工。截图保存计算结果附在申请单备注。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">数据是否持久</h2>
  <p style="margin:0">若刷新后假日列表消失，说明当前实现偏会话级，请自备假日表下次粘贴添加。排除周末开关变化会显著改工作日，比较方案时保持开关一致。</p>
`,
  'tools/privacy/encrypt-decrypt.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">口令与输出保管</h2>
  <p style="margin:0 0 1rem">口令只用密码管理器生成与粘贴，避免浏览器记住在公共配置文件。密文可存网盘，口令另通道。Base64 与 Hex 不要混用同一条密文。复制后如需二次分发，确认未把明文留在 <code>#input</code>。清空按钮应同时清输出，防止肩窥。PBKDF2 迭代约十万次会带来可感知延迟，属正常换取慢哈希的成本。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">失败排查清单</h2>
  <p style="margin:0 0 1rem">1）模式是否在解密；2）密钥长度是否一致；3）格式 Base64/Hex 是否一致；4）密文是否完整；5）是否在安全上下文。扩展程序劫持页面时不要处理真秘密。本工具不上传，但屏幕共享会暴露输入，远程协助时切换窗口。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">与随机密钥页配合</h2>
  <p style="margin:0">可用随机密钥页生成高熵口令再粘贴到本页密码框。文件哈希页用于完整性校验，不替代加密。概念分离：加密藏内容，哈希验是否被改，随机密钥提供材料。</p>
`,
  'tools/office/label-maker.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">试打与校准</h2>
  <p style="margin:0 0 1rem">第一张用普通纸试打，比对实物标签格线，再微调字号与边框。浏览器缩放必须 100%，「适应页面」会缩小导致裁切不准。重复数过大可能预览卡顿，可分多页打印。状态键 <code>label_maker_v2_state</code> 记住上次文案，换批次前先改文本以免打错名。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">文案规范</h2>
  <p style="margin:0 0 1rem">胸牌「姓 + 部门」两行用换行（若支持）或短分隔符。物料标签优先编码 + 短名，长描述放系统不放贴纸。敏感个人信息最小化。分享配置链接前检查是否含内部代号。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">与相关工具</h2>
  <p style="margin:0">条码、二维码、名片生成解决不同载体；本页专注相同文字多份排版打印。需要每枚不同名，请分批修改 <code>labelText</code> 或用外部邮件合并。</p>
`,
  'tools/office/task-tracker.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">筛选与日常节奏</h2>
  <p style="margin:0 0 1rem">早上看 active，晚上清 completed。过滤不删除数据，切换「全部」仍在。高优先级色条帮助扫视，但不要滥用。键 <code>task_tracker_v2_data</code> 仅本机；团队共享请用正式工具或各自列表。清除已完成可减小列表噪音；清空全部用于项目结束归档后。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">命名与拆分</h2>
  <p style="margin:0 0 1rem">超过两小时的事先拆，或先在 WBS 分解再抄叶子到此。阻塞任务在文案前加【堵】便于站会扫。生成 id 与日期字段用于展示，不必手填。多标签页同时改可能丢写入，建议单标签操作。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">隐私</h2>
  <p style="margin:0">任务可能含客户名，公共电脑用完 clearAll。投屏前先过滤私人项。本页无加密存储。</p>
`,
  'tools/office/checklist-maker.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">拖拽排序与进度</h2>
  <p style="margin:0 0 1rem">按执行顺序拖到上方，减少滚动。每勾一项进度条前进，适合给干系人看完成度。键 <code>checklist_maker_data_v1</code> 存本机；URL 分享存快照。长清单先分享作备份再清空。打印用于登机前/上线前签字。触控设备拖拽若不顺，可用删除重建调序。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">模板化复用</h2>
  <p style="margin:0 0 1rem">做一份「标准上线检查」保持全未勾选，分享链接收藏；每次活动从链接打开再勾。不要在清单写密码。与任务跟踪器相比，这里更适合一次性仪式化检查而非长期优先级队列。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">协作边界</h2>
  <p style="margin:0">对方打开分享链接改勾选不会写回你的浏览器。实时双人勾选请用协同文档。清除已完成会去掉历史勾选痕迹，需留档请先打印。</p>
`,
  'tools/media/image-to-base64.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">格式按钮怎么选</h2>
  <p style="margin:0 0 1rem">贴进 JSON/配置多用纯 Base64；浏览器直接当图片地址用 Data URL；写演示 HTML 用 img 片段；写样式用 CSS background 片段。切换格式只改包装，不重新压缩像素。字符计数帮助判断是否超过文档/邮件限制。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">性能与仓库卫生</h2>
  <p style="margin:0 0 1rem">大图先缩小再编码。避免把几百 KB Base64 提交进 Git 造成仓库膨胀。邮件客户端可能裁剪超长 CSS。解码区对错误字符串失败时不要反复尝试来源不明的巨大粘贴，以免卡顿。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">隐私</h2>
  <p style="margin:0">截图含证件时，编码后字符串同样敏感，复制到聊天等于传原图。用完清输出。处理在本地，但不等于可以忽视终端安全。</p>
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
const files = Object.keys(APPEND);
// also check any batch5 page
const all = [
  'tools/team-tools/standup-timer.html',
  'tools/team-tools/task-breakdown.html',
  'tools/office/leave-calculator.html',
  'tools/privacy/encrypt-decrypt.html',
  'tools/office/label-maker.html',
  'tools/office/task-tracker.html',
  'tools/office/checklist-maker.html',
  'tools/media/image-to-base64.html',
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
    const more = `\n  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">本地数据与使用边界</h2>\n  <p style="margin:0 0 1rem">本页结果与草稿主要保存在当前浏览器环境中，清除站点数据、更换设备或使用隐私模式可能导致内容丢失，重要清单、密文、任务与 WBS 请及时导出、复制或截图备份。公共电脑使用完毕后应清空页面上的敏感输入，避免姓名、口令、项目结构等留给下一位用户。工具用于提升个人与小团队效率，不替代组织内正式的项目管理、考勤人事、密钥托管或合规审计系统；请以公司制度与当地法规为准。</p>\n`;
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
