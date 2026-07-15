/**
 * Batch 5: enhanced 800-1200 CN function-verified guides (8 pages).
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const style =
  'margin:2rem auto;max-width:760px;padding:1.35rem 1.4rem 1.6rem;border:1px solid var(--border-color,var(--border,#333));border-radius:12px;line-height:1.8;background:var(--bg-card,rgba(255,255,255,0.02));color:var(--text-primary,inherit)';

function section(inner) {
  return `<section class="tool-guide" aria-label="使用指南" style="${style}">\n${inner}\n</section>`;
}
function cn(s) {
  return (String(s).replace(/<[^>]+>/g, ' ').match(/[\u4e00-\u9fff]/g) || []).length;
}

const PAGES = {
  'tools/team-tools/standup-timer.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">敏捷站会计时器完整使用指南</h2>
  <p style="margin:0 0 1rem">专为每日站会（Daily Standup）设计的轮流发言计时器。维护成员列表，设定每人时长（默认 120 秒，输入 <code>#timePerPerson</code>，最小约 30 秒）与预警秒数 <code>#warnTime</code>。当前发言人显示在 <code>#speaker</code>，进度环/条与时钟 <code>#tClock</code>、<code>#tStatus</code> 同步；可开始/暂停、完成当前人、上一位/下一位、重置、随机打乱顺序。统计区展示人数、已完成、总耗时、平均时长。状态写入 <code>localStorage</code> 键 <code>standup-timer-v2-data</code>（含成员与时长配置），主题另存 <code>theme</code>。适合 Scrum 站会控时，不是完整视频会议或任务看板。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">控件与脚本行为</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><code>addMember</code>/<code>updateMember</code>/<code>delMember</code> 维护名单；可从成员行点名开始。</li>
    <li><code>startTimer</code>/<code>pauseTimer</code>/<code>toggleTimer</code> 控制倒计时；<code>finishCurrent</code> 标记完成并切下一位。</li>
    <li><code>nextMember</code>/<code>prevMember</code> 手动换人；<code>shuffleMembers</code> 打乱顺序避免固定第一位压力。</li>
    <li>到点可 <code>playAlert</code> 提示（浏览器可能拦截自动播放，以界面状态为准）。</li>
    <li><code>saveState</code>/<code>loadState</code> 读写名单与每人秒数、预警；<code>clearAll</code> 清空。</li>
    <li>进度与统计由 <code>updateClock</code>/<code>updateStats</code>/<code>formatTime</code> 刷新。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐站会流程</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>会前录入全员姓名，设 60–120 秒/人，预警留 15–20 秒。</li>
    <li>可选打乱顺序；主持人点开始，每人只讲：昨天、今天、阻塞。</li>
    <li>超时直接 finish 切下一位，细节会后拉通，避免站会变评审。</li>
    <li>全员结束后看总耗时与平均，持续超过 15 分钟应缩减发言或拆会。</li>
    <li>远程站会投屏时钟；音效被拦时靠进度条与状态文案控场。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>不记录发言内容，不生成会议纪要。</li>
    <li>后台标签页可能被浏览器节流导致计时不准，请保持前台。</li>
    <li>名单仅本机存储，换设备需重录或自行备份。</li>
    <li>无日历集成，不自动拉会议参会人。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">刷新后名单还在吗？</h3>
  <p style="margin:0 0 .8rem">会从 <code>standup-timer-v2-data</code> 恢复成员与时长配置。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">中途加人怎么办？</h3>
  <p style="margin:0 0 .8rem">添加到列表后可在适当时机 next 或点名 startMember。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和番茄钟区别？</h3>
  <p style="margin:0 0 .8rem">番茄钟服务个人专注块；本页服务多人轮流限时发言。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">预警如何理解？</h3>
  <p style="margin:0">剩余时间进入预警阈值时状态/样式变化，提醒收尾，具体视觉以页面为准。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">主持话术与纪律</h2>
  <p style="margin:0">超时不辩论计时器，只记「超时议题会后讨论」。阻塞项当场只登记，不在站会里解 bug。长期某成员总超时，应辅导表达结构而非单纯加秒数。公共投屏可用花名，敏感真名可改代号。清空名单前确认本周是否还要用同一列表。</p>
`),

  'tools/team-tools/task-breakdown.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">WBS 任务分解器完整使用指南</h2>
  <p style="margin:0 0 1rem">用工作分解结构（WBS）把项目拆成树状可管理条目。项目名 <code>#projectName</code>，树容器 <code>#wbsTree</code> 中每行含 WBS 编码、名称、工时等；可添加顶级任务、子任务、删除与行内编辑。统计 <code>#statTasks</code> 任务数、<code>#statHours</code> 总工时、<code>#statDays</code> 折算人天、<code>#statDepth</code> 层级深度。预览区展示纯文本 WBS；支持复制、下载 TXT、分享链接、清空。数据键 <code>wbs-tool-v2-data</code>。适合立项拆解与工时粗估，不是完整 MS Project 资源平衡工具。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">操作与函数</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><code>addTopLevel</code>/<code>addChild</code> 扩展树；<code>delItem</code>/<code>updateItem</code> 维护节点。</li>
    <li><code>renderAll</code> 重绘树与编码；<code>updateStats</code> 汇总工时与深度。</li>
    <li><code>getWBSPlain</code>/<code>updatePreview</code> 生成可读大纲；<code>copyText</code>/<code>downloadTxt</code> 导出。</li>
    <li><code>shareWBS</code> 生成可分享快照链接；<code>saveState</code>/<code>loadState</code> 本地持久化。</li>
    <li>主题切换与看板类工具类似，存 <code>theme</code>。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">拆解原则</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>先按交付物拆（模块/里程碑），再按活动拆，避免只有活动没有成果。</li>
    <li>叶子任务尽量 0.5–2 人天，过大继续 addChild，过碎则合并。</li>
    <li>工时只填叶子或你约定的层级，避免父子重复加总理解混乱——以页面统计规则为准检查总和。</li>
    <li>编码随层级生成，评审时按编码讨论范围蔓延。</li>
    <li>导出 TXT 贴进立项文档；分享链接给远程同事只读对齐。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>无依赖箭头、无关键路径、无资源日历。</li>
    <li>人天折算是简化统计，不等于排期甘特。</li>
    <li>分享链接可能含项目结构，注意脱敏。</li>
    <li>深度过大时界面变长，建议控制层级。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">刷新后树还在吗？</h3>
  <p style="margin:0 0 .8rem">会从 <code>wbs-tool-v2-data</code> 恢复。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和任务跟踪器区别？</h3>
  <p style="margin:0 0 .8rem">WBS 偏规划拆解与估算；任务跟踪器偏执行勾选与优先级。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能导入 Excel 吗？</h3>
  <p style="margin:0 0 .8rem">当前以页面编辑与 TXT/分享为主，无 Excel 导入器。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">统计天数怎么来？</h3>
  <p style="margin:0">由总工时按页面规则折算展示，用于粗量级感知，不作考勤。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">评审用法</h2>
  <p style="margin:0">评审会投屏树结构，对每个叶子问「完成定义是什么」。发现无法验收的节点继续拆。工时争议大时标风险备注（写在任务名括号内）。定稿后 downloadTxt 归档版本，再在执行工具里建实际任务。</p>
`),

  'tools/office/leave-calculator.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">休假天数计算器完整使用指南</h2>
  <p style="margin:0 0 1rem">根据起止日期计算区间总天数、休息相关天数与工作日近似值。选择 <code>#startDate</code>、<code>#endDate</code>，勾选 <code>#excludeWeekends</code>（默认勾选）可自动排除周六日。可维护自定义假日列表 <code>customHolidays</code>：用 <code>#addHolidayDate</code> 添加，列表 <code>#holidayList</code> 展示并可移除。点计算后显示工作日 <code>#resWorkingDays</code>、总天数 <code>#resTotalDays</code>、非工作相关 <code>#resOffDays</code>，并给出拼假提示 <code>#holidayTips</code>。另有快捷加载按钮辅助。适合请假天数自估与拼假规划，不替代 HR 系统法定年假额度与审批。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">计算逻辑理解</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>闭区间按日遍历起止日期（以脚本实现为准，含首尾）。</li>
    <li>排除周末开启时，周六日不计入工作日。</li>
    <li>自定义假日按你添加的日期集合扣减或标记。</li>
    <li>不自动下载国务院节假日 API，法定假需你自行添加日期。</li>
    <li><code>renderHolidays</code> 排序展示标签；<code>calculate</code> 刷新三项结果与提示文案。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐用法</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>先填计划离开与返回相关日期，确认是否含首尾上班日。</li>
    <li>把清明/国庆等放假日与调休上班日分别处理：放假日加入自定义假日；调休上班日不要当假日。</li>
    <li>看工作日结果是否超过剩余年假，再决定是否请事假。</li>
    <li>拼假提示仅供参考，出游交通与酒店另计。</li>
    <li>结果截图附在请假单，最终以 HR 核定为准。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>无地区差异化日历包，海外团队需自建假日列表。</li>
    <li>不处理半天假、小时假、时区跨越。</li>
    <li>调休「周末上班」不会自动识别，除非你的算法仅排除周末——此时工作日可能少算，需人工校正。</li>
    <li>数据主要在会话内存；刷新可能丢失自定义假日（以页面是否持久化为准）。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">为什么和同事算的不一样？</h3>
  <p style="margin:0 0 .8rem">首尾是否计入、是否排除周末、假日列表是否一致都会导致差异。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能自动同步国家假日吗？</h3>
  <p style="margin:0 0 .8rem">当前需手动添加假日日期，无云端节假日源。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">跨年怎么算？</h3>
  <p style="margin:0 0 .8rem">起止跨年一般仍按连续日期遍历；额度跨年规则问 HR。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和工时表关系？</h3>
  <p style="margin:0">休假计算器估请假天数；工时表记实际工作投入，二者互补。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">拼假实操提示</h2>
  <p style="margin:0">先查出官方放假与调休安排，把「休」加入自定义假日，把「班」从假日列表排除并在心理上当作工作日。用计算结果比较「请 1 天休 3 天」等方案，再提交系统。工具提示文案不能替代最新政策公告。</p>
`),

  'tools/privacy/encrypt-decrypt.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">AES 加密解密完整使用指南</h2>
  <p style="margin:0 0 1rem">在浏览器本地用 Web Crypto 做文本 AES-GCM 加解密：口令经 PBKDF2（SHA-256，约 100000 次迭代）派生密钥，随机盐与 IV，密文可输出 Base64 或 Hex。可选 AES-128 / AES-256（<code>#keyLength</code>）。界面含明文/密文输入 <code>#input</code>、口令 <code>#password</code>、显示切换、输出格式 <code>#outputFormat</code>、处理/清空/复制。模式在加密与解密间切换（<code>updateMode</code>）。全程 <code>crypto.subtle</code>，数据不上传。适合敏感草稿本地保护演示，不是企业级密钥托管或文件盘加密产品。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">算法管线（与脚本一致）</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><code>deriveKey</code>：importKey 口令为 PBKDF2 材料 → deriveKey 得 AES-GCM 密钥。</li>
    <li>加密：生成 salt/IV → encrypt → 打包输出（格式含 salt、iv、密文，具体拼接以脚本为准）。</li>
    <li>解密：按格式解码 Base64/Hex → 拆分参数 → decrypt → UTF-8 明文。</li>
    <li>工具函数：<code>arrayBufferToBase64</code>/<code>base64ToArrayBuffer</code>、<code>arrayBufferToHex</code>/<code>hexToArrayBuffer</code>。</li>
    <li>错误显示在 <code>#error</code>：口令错、格式损毁、非安全上下文等。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">安全使用步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>仅在 HTTPS 或 localhost 等安全上下文使用，确保 subtle 可用。</li>
    <li>口令用长随机句，勿用生日；口令勿与密文一起发送。</li>
    <li>加密后复制密文单独保存；忘记口令无法找回（设计如此）。</li>
    <li>解密时格式（Base64/Hex）与密钥长度须与加密时一致。</li>
    <li>公共电脑用完清空输入输出与剪贴板。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界与误区</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>AES-GCM 提供机密性与完整性，但不替代传输层 TLS 的完整方案设计。</li>
    <li>弱口令会被暴力猜测；工具无法强迫你用强口令。</li>
    <li>非本工具产出的任意密文可能格式不兼容。</li>
    <li>大文本可能较慢；超大文件请用专用工具。</li>
    <li>页面若被恶意扩展注入则本地也不再可信，请注意浏览器环境。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">解密失败最常见原因？</h3>
  <p style="margin:0 0 .8rem">口令错误、输出格式选错、密文被截断或多了空格换行。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">128 和 256 怎么选？</h3>
  <p style="margin:0 0 .8rem">一般默认 256；需与协作方约定一致，否则无法互通。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和「文本加密」其他页区别？</h3>
  <p style="margin:0 0 .8rem">本页明确 AES-GCM + PBKDF2 管线；其他页可能算法或场景不同，不要混用密文。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能加密文件吗？</h3>
  <p style="margin:0">主界面面向文本；二进制文件请先明确是否支持或改用文件类工具。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">协作约定模板</h2>
  <p style="margin:0">与同事交换密文时书面约定：算法 AES-GCM、密钥长度、输出 Base64 或 Hex、口令传递渠道（线下/密码管理器），绝不要把口令写在同一封邮件正文。轮换口令后旧密文需重新加密归档。</p>
`),

  'tools/office/label-maker.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">批量打印标签生成器完整指南</h2>
  <p style="margin:0 0 1rem">把同一段文案快速排成多枚标签预览并打印。输入 <code>#labelText</code>，重复份数 <code>#repeatCount</code>，标签尺寸 <code>#labelSize</code>，字号滑杆 <code>#fontSize</code>（旁显 <code>#fontSizeVal</code>），边框样式 <code>#borderStyle</code>。预览画在 <code>#pageCanvas</code> 或页面预览区，由 <code>updatePreview</code> 随输入刷新。可打印、分享状态、清空。本地键 <code>label_maker_v2_state</code> 保存文案与参数。适合姓名贴、物料编号、活动贴纸文案排版，不是工业条码打印机驱动（条码请用条码工具页）。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">参数如何影响版面</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>重复数决定一页生成多少枚相同标签（受纸张与尺寸约束）。</li>
    <li>尺寸模板切换单枚宽高，过小会导致文字换行或溢出。</li>
    <li>字号过大裁切，过小难读；先预览再打印。</li>
    <li>边框样式便于裁切对齐；无边框适合已印轮廓的不干胶。</li>
    <li>状态读写 localStorage；分享把配置编码到链接（若按钮提供）。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">打印步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>写清标签文案（姓名/桌号/物料码），避免过长句子。</li>
    <li>选接近实物不干胶的尺寸，调字号到预览舒适。</li>
    <li>设重复数为本批数量，检查一页枚数是否合理。</li>
    <li>浏览器打印 100% 缩放，关闭页眉页脚，必要时试打一张。</li>
    <li>公共场景用完清空，避免残留名单。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>每枚内容相同；不同姓名批量需多次改文案或用其他名单工具配合。</li>
    <li>不保证与某品牌标签纸孔位毫米级对齐，需试打校准。</li>
    <li>无自动二维码合成（可另生成图再设计）。</li>
    <li>打印效果依赖打印机与纸张，屏幕预览仅近似。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">预览空白？</h3>
  <p style="margin:0 0 .8rem">检查文案是否为空、重复数是否为 0、尺寸是否异常。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和条形码页如何配合？</h3>
  <p style="margin:0 0 .8rem">条码页生成 CODE128 图；本页排文字标签。需要条码标签请组合导出或打印两次对齐。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">刷新后参数还在吗？</h3>
  <p style="margin:0 0 .8rem">会尝试从 <code>label_maker_v2_state</code> 恢复。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能一页混排不同名字吗？</h3>
  <p style="margin:0">当前模型是「一文案 × N 份」，名册混排请分批或换专业邮件合并工具。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">现场活动建议</h2>
  <p style="margin:0">胸牌先用大字号姓氏，桌贴加桌号。提前按名单分批打印并装袋。雨天户外用防水材质，本页只负责版式。分享链接方便同事同参打印，注意链接勿公开含隐私姓名的配置。</p>
`),

  'tools/office/task-tracker.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">在线任务跟踪器完整使用指南</h2>
  <p style="margin:0 0 1rem">轻量待办跟踪：输入任务 <code>#taskInput</code>，优先级 <code>#prioritySelect</code>（高/中/低），提交到列表。统计总任务、未完成、已完成数量；可用 <code>#statusFilter</code> 筛选。每条可完成勾选、删除；支持清除已完成与清空全部。数据键 <code>task_tracker_v2_data</code>。优先级以色条与中文标签展示。适合个人执行清单与小团队公开看板投影，不是完整 Jira/权限工作流。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">数据字段与函数</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>任务对象含 id（<code>generateId</code>）、文本、priority、完成状态、时间（<code>formatDate</code>）等。</li>
    <li><code>addTask</code> 入队；<code>toggleTask</code> 切换完成；<code>deleteTask</code> 删除。</li>
    <li><code>renderTasks</code> 按筛选渲染；<code>loadTasks</code>/<code>saveTasks</code> 读写 localStorage。</li>
    <li>优先级文案映射：high 高、medium 中、low 低。</li>
    <li>清除已完成只删 done；清空全部需确认（以 UI 为准）。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐用法</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>早间写下今日 3–5 条，高优先级不超过 2 条，避免全是「高」。</li>
    <li>执行时用筛选看 active；收工清 completed 保持列表干净。</li>
    <li>任务名写「动词+对象+完成标准」，如「提交报销单（含发票 PDF）」。</li>
    <li>与站会计时配合：站会只报阻塞，细节勾在本页。</li>
    <li>公共电脑用完清空，避免暴露工作内容。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>无经办人字段、无截止日期提醒推送、无附件。</li>
    <li>无多人实时同步；同浏览器多标签可能互相覆盖写入。</li>
    <li>筛选不改变底层数据，只改变视图。</li>
    <li>不替代公司正式任务系统审计要求。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">刷新后任务在吗？</h3>
  <p style="margin:0 0 .8rem">在，键名 <code>task_tracker_v2_data</code>。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和清单 checklist 区别？</h3>
  <p style="margin:0 0 .8rem">跟踪器强调优先级与状态统计；清单强调勾选进度条与拖拽排序/分享。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和待办 todo-list 页？</h3>
  <p style="margin:0 0 .8rem">同属待办家族但存储键与 UI 不同，不要假设数据互通。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">误删能恢复吗？</h3>
  <p style="margin:0">一般不能，重要事项请同时写在正式系统。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">优先级纪律</h2>
  <p style="margin:0">若所有任务都标高，优先级失效。可规定：高=今天必须；中=本周；低=有空再做。每天重新整理，完成即勾选，避免列表变成焦虑墙。投影给团队时先过滤掉私人低优先级项。</p>
`),

  'tools/office/checklist-maker.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">在线清单制作工具完整指南</h2>
  <p style="margin:0 0 1rem">可勾选清单，带进度条与拖拽排序。输入 <code>#newItemInput</code> 点添加；列表 <code>#checklist</code> 展示条目，空状态 <code>#emptyState</code>。进度文案 <code>#progressText</code> 与填充条 <code>#progressFill</code> 随完成数更新。支持分享（URL 编码）、打印、清除已完成、清空全部。本地键 <code>checklist_maker_data_v1</code>；亦可 <code>saveToUrl</code>/<code>loadFromUrl</code>。拖拽一套 <code>handleDragStart</code>…<code>handleDrop</code> 调整顺序。适合旅行打包、上线检查单、活动筹备，不是带权限的审计 checklist 系统。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">功能对照</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><code>addItem</code>/<code>toggleItem</code>/<code>deleteItem</code> 维护条目；<code>generateId</code> 生成 id。</li>
    <li><code>updateProgress</code> 计算完成比例驱动进度条。</li>
    <li><code>render</code>/<code>createItemElement</code> 绘制 DOM。</li>
    <li><code>saveToStorage</code>/<code>loadFromStorage</code> 本地；分享走 URL。</li>
    <li>拖拽排序后应保存新顺序，刷新保持。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐场景流程</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>先一次性写全检查项，再开始执行勾选。</li>
    <li>关键项拖到顶部；执行中只看未完成。</li>
    <li>协作时用分享链接同步清单快照（注意链接暴露内容）。</li>
    <li>全部完成后打印存档或截图，再 clearCompleted。</li>
    <li>模板化清单可保留一份「未勾选」分享链接作下次起点。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>无二级子清单、无附件、无到期提醒推送。</li>
    <li>URL 分享有长度与隐私限制，极长清单可能不宜。</li>
    <li>拖拽在部分触控浏览器体验不一。</li>
    <li>不与任务跟踪器数据互通。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">进度不更新？</h3>
  <p style="margin:0 0 .8rem">确认已 toggle 勾选并触发 render/updateProgress。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">分享后对方改不动我的本地？</h3>
  <p style="margin:0 0 .8rem">链接通常是快照加载到对方浏览器，不会反向写你的 localStorage。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">打印缺项？</h3>
  <p style="margin:0 0 .8rem">用打印预览检查；过长列表可能分页，注意页边距。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">清空能撤销吗？</h3>
  <p style="margin:0">一般不能，重要清单先分享或复制文本。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">写检查项的技巧</h2>
  <p style="margin:0">用可验证句子：「备份数据库并确认恢复演练」优于「注意数据库」。上线单按时间序拖拽；旅行打包按空间分类。避免一条含多个动作导致无法诚实勾选——应拆成多条。公共场景勿放入密码与密钥，清单不是密码库。</p>
`),

  'tools/media/image-to-base64.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">图片与 Base64 互转完整指南</h2>
  <p style="margin:0 0 1rem">双面板工具：编码把本地图片转为 Base64/Data URL；解码把 Base64 或 Data URL 还原为图片。编码区支持拖拽 <code>#dropZone</code> 与文件选择 <code>#fileInput</code>，预览 <code>#previewImg</code>，信息 <code>#imgInfo</code>/<code>#imgSize</code>，输出 <code>#encodeOutput</code> 与字符计数 <code>#charCount</code>，可复制。格式按钮可在纯 Base64、Data URL、HTML/CSS 片段等之间切换（<code>setFormat</code>/<code>updateOutput</code>）。解码区粘贴到 <code>#decodeInput</code>，预览 <code>#decodedImg</code>，可下载还原图。处理在浏览器本地完成，适合前端内联小图标，不适合把巨大照片塞进代码仓库。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">编码侧行为</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><code>handleFile</code> 读入图片，生成预览与 Base64 字符串缓存。</li>
    <li>输出模式：纯 Base64 无前缀；Data URL 带 <code>data:image/...;base64,</code>。</li>
    <li>HTML/CSS 片段便于粘贴到 img src 或 background-image。</li>
    <li>字符数用于评估体积膨胀（Base64 约增大 33%）。</li>
    <li>非图片文件应被忽略或提示（以实现为准）。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">解码与下载</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>粘贴完整 Data URL 或纯 Base64（纯 Base64 时需可被浏览器识别的图像数据）。</li>
    <li>成功后右侧显示图片与信息，点下载保存文件。</li>
    <li>失败时检查是否缺前缀、是否被截断、是否实为其他编码。</li>
    <li>敏感截图解码后注意本地文件残留，用完删除。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">何时该用 / 不该用</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>适合：几 KB 小图标、邮件内联、演示单文件 HTML。</li>
    <li>不适合：数 MB 照片内联（阻塞 CSS/HTML、缓存差）。</li>
    <li>大图请用对象存储 URL 或构建链图片优化，而非 Base64。</li>
    <li>本页不做额外压缩；体积大请先用压缩/转格式工具。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">复制到 CSS 不显示？</h3>
  <p style="margin:0 0 .8rem">确认使用 url("data:image/...") 形式且引号匹配，未截断字符串。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">字符数暴涨正常吗？</h3>
  <p style="margin:0 0 .8rem">正常，Base64 比二进制大约多三分之一，另加 Data URL 前缀。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">会上传图片吗？</h3>
  <p style="margin:0 0 .8rem">编码解码在本地；请仍避免在不信任设备处理机密图。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和 SVG 占位图区别？</h3>
  <p style="margin:0">占位图生成矢量示意；本页转换已有位图与 Base64 文本。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">工程实践建议</h2>
  <p style="margin:0">构建工具链里优先 url-loader/asset modules 的阈值策略：小于某 KB 才内联。邮件 HTML 内联需注意客户端裁剪长度。把 Base64 提交进 Git 会使 diff 巨大，应用 LFS 或外链。解码来源不明的字符串前注意恶意内容风险，本工具不做病毒扫描。</p>
`),
};

function inject(html, guide) {
  html = html.replace(/<section class="tool-guide"[\s\S]*?<\/section>\s*/i, '');
  const block = '\n' + guide.trim() + '\n';
  if (html.includes('<!-- SEO 内容 -->')) return html.replace('<!-- SEO 内容 -->', block + '<!-- SEO 内容 -->');
  if (html.includes('</main>')) return html.replace('</main>', block + '</main>');
  if (html.includes('<footer')) return html.replace('<footer', block + '<footer');
  if (html.includes('<!-- FAQ')) return html.replace('<!-- FAQ', block + '<!-- FAQ');
  if (html.includes('</body>')) return html.replace('</body>', block + '</body>');
  throw new Error('no injection point');
}

let fail = 0;
for (const [rel, guide] of Object.entries(PAGES)) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    console.error('MISSING', rel);
    fail++;
    continue;
  }
  const guideCn = cn(guide);
  const next = inject(fs.readFileSync(file, 'utf8'), guide);
  fs.writeFileSync(file, next, 'utf8');
  const h1 = (next.match(/<h1\b/gi) || []).length;
  const ok = guideCn >= 800 && guideCn <= 1300 && h1 === 1;
  if (!ok) fail++;
  console.log(`${ok ? 'OK' : 'BAD'} ${rel}: guideCn=${guideCn} h1=${h1}`);
}
console.log(fail ? 'FAIL' : 'OK');
process.exitCode = fail ? 2 : 0;
