/**
 * Batch 3: enhanced (800-1200 CN) function-verified guides for 8 thin pages.
 * Quality rules: function-aligned, no template swap, only h2/h3, below tool UI.
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
  'tools/team-tools/retrospective.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">敏捷回顾会议工具完整使用指南</h2>
  <p style="margin:0 0 1rem">本页是本地可运行的敏捷回顾（Retrospective）看板，不是通用笔记。默认模板为 Went Well（做得好的 / 待改进的 / 行动计划），也可切换 Mad Sad Glad、4Ls、Start Stop Continue、Sailboat（帆船）五种结构。每条卡片可投票与删除；顶部统计总条目、总票数与行动项数量。元信息可填冲刺标题 <code>#sprintTitle</code>、主持人 <code>#facilitator</code>、日期 <code>#retroDate</code>。状态写入 <code>localStorage</code> 键 <code>retro-tool-data-v2</code>，可导出 Markdown 报告或生成分享链接。适合 Sprint 复盘、项目阶段总结，不替代正式项目管理系统。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">模板与列含义（与脚本 TEMPLATES 一致）</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><strong>Went Well</strong>：做得好的、待改进的、行动计划（行动列带 isAction 标记，计入行动统计）。</li>
    <li><strong>Mad Sad Glad</strong>：愤怒 / 难过 / 高兴三类情绪收集。</li>
    <li><strong>4Ls</strong>：Liked、Learned、Lacked、Longed for。</li>
    <li><strong>Start Stop Continue</strong>：开始做 / 停止做 / 继续做。</li>
    <li><strong>Sailboat</strong>：推动力 Wind、阻力 Anchor、目标 Island、风险 Rocks。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">操作流程</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>选好模板标签（切换会重绘看板列），填写冲刺名与主持人。</li>
    <li>在对应列输入框写卡片，回车或点添加；每条可点投票按钮加票。</li>
    <li>会中先静默写卡，再按票数优先讨论高票问题，把共识写到行动列。</li>
    <li>结束时点「导出 Markdown 报告」归档，或「获取分享链接」同步配置。</li>
    <li>下一轮开始前可用「清空看板」；清空需确认，避免误删。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">数据与分享</h2>
  <p style="margin:0 0 1rem"><code>saveState</code> 把当前模板、条目与元信息写入 <code>retro-tool-data-v2</code>；刷新后 <code>loadState</code> 恢复。分享链接用编码后的状态放在 URL 中（以页面 <code>shareRetro</code> 实现为准），适合同团队打开同一回顾快照，不是带权限的云协作。主题保存在 <code>localStorage.theme</code>，与看板数据分离。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界与建议</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>投票是轻量计数，不做匿名防刷与权限控制。</li>
    <li>切换模板会按新列结构渲染；复杂迁移请先导出 Markdown。</li>
    <li>公共电脑请勿保留敏感人事评价；用完清空或导出后删除本地数据。</li>
    <li>行动计划需落到真实负责人与截止日期，本页不发送提醒。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">刷新后卡片还在吗？</h3>
  <p style="margin:0 0 .8rem">会尽量从 <code>retro-tool-data-v2</code> 恢复；清站点数据会丢失。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">行动项统计怎么来的？</h3>
  <p style="margin:0 0 .8rem">模板列若标记为行动类（如 Went Well 的行动计划），会计入行动数量展示。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能多人同时在线编辑吗？</h3>
  <p style="margin:0 0 .8rem">不能实时协同；可一人投屏主持，或通过分享链接传递快照。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和决策矩阵如何分工？</h3>
  <p style="margin:0">回顾收集问题与行动；多方案加权比选请用决策矩阵页。</p>
`),

  'tools/office/barcode-label.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">在线条形码生成器完整使用指南</h2>
  <p style="margin:0 0 1rem">本工具在浏览器内用自实现的 CODE128（Code Set B 思路）把文本画到 <code>#barcodeCanvas</code>，不是调用云端条码 API。输入框 <code>#barcodeContent</code> 默认示例 <code>WEBUTILS-2024</code>；可调条宽 <code>#bcWidth</code>（约 1–4）、条高 <code>#bcHeight</code>（约 20–200）、是否显示明文 <code>#bcShowText</code>。生成结果下方 <code>#displayValue</code> 同步文本。提供「下载 PNG」「直接打印」「清空恢复默认」。适合货架标签、内部物料编码、物流样例，不保证所有扫码枪与全部 CODE128 变体的工业级认证。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">编码与绘制行为</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><code>CODE128.encode(text)</code>：以 START_B 开头，逐字符映射 pattern，累加校验和 <code>% 103</code>，再加 STOP。</li>
    <li>字符映射用 <code>charCodeAt(i) - 32</code>；超出 0–95 范围时回退为 0，非标准字符可能显示异常。</li>
    <li>画布宽度 = 编码比特串长度 × 条宽；黑色画 “1” 位，背景白底。</li>
    <li>内容为空时 <code>generate()</code> 直接返回，不绘制。</li>
    <li>输入即刷新：内容 <code>oninput</code>，宽高与显示文字 <code>onchange</code> 触发重绘。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>粘贴或输入要编码的 SKU/单号，尽量使用可打印 ASCII。</li>
    <li>按打印介质调条宽与高度：太细难扫，太粗浪费纸宽。</li>
    <li>需要人眼核对时勾选显示文本；纯机扫可关闭。</li>
    <li>下载 PNG 嵌入文档，或直接打印当前页标签区域。</li>
    <li>批量多个码时逐个改内容并下载，文件名形如 <code>barcode_内容.png</code>。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">适用与边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>适用：内部仓管、样品袋、演示文档中的条码图。</li>
    <li>非 EAN-13/UPC 商品国标主流程；商超上架请用符合 GS1 的专业方案。</li>
    <li>中文与特殊 Unicode 不在 CODE128-B 常规可映射范围，请改用数字字母编码体系。</li>
    <li>打印缩放可能导致条宽失真，建议 100% 比例打印并实测扫码。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">扫不出来怎么办？</h3>
  <p style="margin:0 0 .8rem">增大条宽与高度，保证黑白对比，避免屏幕反光；打印后勿过度缩放。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和二维码页有何不同？</h3>
  <p style="margin:0 0 .8rem">本页是一维 CODE128 条码；网址/多语言内容请用二维码生成工具。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">校验位正确吗？</h3>
  <p style="margin:0 0 .8rem">脚本按常见 CODE128 校验和规则生成；极端字符集请用工业软件复核。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">数据会上传吗？</h3>
  <p style="margin:0">编码与绘制均在本地 canvas 完成。</p>
`),

  'tools/office/gantt-chart.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">在线甘特图制作工具完整指南</h2>
  <p style="margin:0 0 1rem">本页用任务数组 <code>tasks</code> 渲染简易甘特图：每项含名称、开始日期、结束日期。添加区填写 <code>#taskName</code>、<code>#startDate</code>、<code>#endDate</code> 后点添加；时间轴支持 <code>#viewScale</code> 的「按天 / 按周」视图。任务条按调色板循环着色，可删除单行。数据写入 <code>localStorage</code> 键 <code>gantt_chart_data_v2</code>，同时 <code>updateUrl</code> 把任务 JSON 经 Base64 放进 URL hash 便于分享。导出高清图依赖页面引入的 html2canvas。适合轻量排期可视化，不是微软 Project 级依赖/资源管理。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">渲染规则</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><code>getRange()</code>：取所有任务最早开始与最晚结束，并左右留白（开始前约 2 天、结束后约 5 天）。</li>
    <li>时间头按天生成单元格，周末加 weekend 样式；按周视图会合并/隐藏非周一列。</li>
    <li>任务条 left/width 用「天数 × 单元格宽度」估算，时长含结束日（+1 天算法）。</li>
    <li>左侧任务名列表与右侧时间条同步行；点 ✕ 调用 <code>deleteTask(index)</code>。</li>
    <li><code>save()</code>：写 localStorage、重绘、更新 hash；加载优先 hash，否则本地缓存。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐使用步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>先列 5–15 条关键任务，日期用真实起止，避免全挤在同一天。</li>
    <li>短项目用按天视图；跨多周项目切换按周看节奏。</li>
    <li>调整后复制浏览器地址栏分享链接，对方打开即可还原任务。</li>
    <li>需要贴进周报时用「导出高清图片」；打印用打印按钮。</li>
    <li>清空前确认：清空会抹掉当前列表（以页面清空逻辑为准）。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>无前置任务依赖线、无关键路径计算、无资源负荷。</li>
    <li>大量任务或超长跨度会使时间轴很宽，浏览器可能卡顿。</li>
    <li>hash 分享不含权限控制，勿放入机密项目细节。</li>
    <li>html2canvas 导出效果受 DOM/跨域字体影响，复杂样式可能略有偏差。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">刷新后任务还在吗？</h3>
  <p style="margin:0 0 .8rem">有 hash 用 hash；否则读 <code>gantt_chart_data_v2</code>。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">结束日当天算不算工期？</h3>
  <p style="margin:0 0 .8rem">条宽计算对结束日做了 +1 天处理，按「含首尾」理解更贴近显示。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能导入 Excel 吗？</h3>
  <p style="margin:0 0 .8rem">当前是表单逐条添加，无 Excel 导入器。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和里程碑追踪如何分工？</h3>
  <p style="margin:0">甘特看时间条并行关系；里程碑页更适合节点清单与状态勾选。</p>
`),

  'tools/office/meeting-cost-calculator.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">会议成本实时计算器完整指南</h2>
  <p style="margin:0 0 1rem">本工具把「参会人时薪合计 × 会议时长」可视化成实时烧钱仪表。参会者数组默认三人示例（核心成员 A/B/C，时薪 200/150/100），每项可改姓名与时薪；可「添加参会者」，也可删除。统计区显示人数、每小时总成本、每分钟成本。点「开始会议」后每秒 <code>elapsedTime++</code>，总费用 = 时薪合计 / 3600 × 已过秒数，显示在 <code>#totalCost</code>，计时在 <code>#timeElapsed</code>。再次点击变为暂停/恢复；「重置」需确认并清零计时。数据在内存中，无 localStorage。用于会议纪律与成本意识，不是财务入账系统。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">控件与计算</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><code>#userList</code>：渲染姓名输入与时薪 number 输入，× 删除。</li>
    <li><code>#btnAddUser</code>：追加「新参会者」默认时薪 100。</li>
    <li><code>updateStats</code>：人数、¥/小时、¥/分钟（小时合计/60）。</li>
    <li><code>updateDisplay</code>：按秒累计成本，时间格式 HH:MM:SS。</li>
    <li><code>#btnStart</code>：开始 → 暂停会议 → 恢复会议循环；<code>#btnReset</code> 清零。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐用法</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>会前按真实岗位填近似时薪（可用日薪/8 估算），人数与议程匹配。</li>
    <li>准时点开始；跑题时看成本攀升，帮助拉回主题。</li>
    <li>会后记录最终金额，与决议产出对比，评估是否值得再开长会。</li>
    <li>站会可只保留必要角色，观察每分钟成本是否过高。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>时薪是你输入的估算，不连接 HR 系统，也不含场地/差旅。</li>
    <li>暂停只停秒表，不自动生成会议纪要。</li>
    <li>刷新页面会丢失当前计时与名单（回到脚本初始示例逻辑）。</li>
    <li>货币按页面 ¥ 展示，未做多币种汇率。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">时薪应填税前还是全成本？</h3>
  <p style="margin:0 0 .8rem">看你的管理目的。强调机会成本可用更高「全成本」；仅意识提醒可用粗算时薪。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">暂停后费用会不会继续涨？</h3>
  <p style="margin:0 0 .8rem">暂停会 <code>clearInterval</code>，费用冻结在当前秒；恢复后继续累加。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能否导出报表？</h3>
  <p style="margin:0 0 .8rem">当前以屏幕显示为主，可自行截图或抄录最终金额。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和会议时间协调器关系？</h3>
  <p style="margin:0">协调器解决跨时区何时开；本页解决「开了多久值多少钱」。</p>
`),

  'tools/media/image-pixelate.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">图片像素化 / 马赛克工具完整指南</h2>
  <p style="margin:0 0 1rem">上传图片后在 <code>#mainCanvas</code> 上应用本地像素处理。效果类型由 <code>setEffect</code> 切换，脚本支持 <code>pixelate</code>（像素化）、<code>mosaic</code>（马赛克）、以及模糊/油画类处理（如 <code>boxBlur</code>、<code>oilPaint</code>，以界面效果按钮为准）。强度滑杆 <code>#intensity</code> 控制块大小或强度；可选「区域模式」<code>regionMode</code>：开启后用画笔在画布涂抹遮罩 <code>maskData</code>，仅遮罩区域生效，笔刷半径由 <code>#brushSize</code> 控制。提供应用、重置、下载。适合证件隐私打码、趣味像素风，不保证专业监控打码合规审计。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">操作链路</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>拖拽 <code>#dropArea</code> 或文件选择；非 image/* 忽略。</li>
    <li><code>setupCanvas</code> 按原图像素设宽高，显示尺寸元信息，初始化遮罩数组。</li>
    <li>选效果 → 调强度 →（可选）涂抹区域 → 点应用 <code>applyEffect</code>。</li>
    <li>区域模式打开时显示笔刷控件，并在遮罩上标记 1 的像素参与处理。</li>
    <li>重置回到原图绘制；下载导出当前 canvas 结果。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>隐私打码：开区域模式，只涂人脸/车牌/证件号，强度调到不可辨认。</li>
    <li>全图像素风：关闭区域模式，直接全图 pixelate/mosaic。</li>
    <li>每步应用后预览；不满意点重置再调参，避免叠加过度。</li>
    <li>导出前放大检查边缘是否露原图信息。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>处理在浏览器内存完成，超大图可能卡顿或失败。</li>
    <li>区域遮罩是像素标记，不是图层系统；切换区域模式会清空遮罩填充。</li>
    <li>打码强度不足仍可能被还原推断，重要隐私请提高强度并人工复核。</li>
    <li>不上传服务器；公共电脑用完关闭页面。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">应用按钮为何禁用？</h3>
  <p style="margin:0 0 .8rem">尚未成功加载图片时按钮保持 disabled。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">涂了区域却全图都变了？</h3>
  <p style="margin:0 0 .8rem">确认已勾选区域模式并在应用前完成涂抹；未开区域则默认全图效果。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和图片滤镜页区别？</h3>
  <p style="margin:0 0 .8rem">本页侧重像素块/马赛克/局部遮罩；滤镜页更偏色彩风格。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能撤销单笔涂抹吗？</h3>
  <p style="margin:0">区域绘制以遮罩累积为主；不满意请重置原图后重涂。</p>
`),

  'tools/privacy/random-key.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">随机密钥生成器完整使用指南</h2>
  <p style="margin:0 0 1rem">本页用浏览器 <code>crypto.getRandomValues</code> 生成密钥/Token/UUID，强调本地加密安全随机源，而不是 <code>Math.random</code>。可设长度 <code>#length</code>、输出格式 <code>#format</code>（如 hex、base64、alphanumeric/ascii 等），并在自定义字符集模式下勾选大写、小写、数字、符号。预设按钮覆盖 API Key、Secret、Token、UUID、AES128/AES256 常见长度与格式组合。结果在 <code>#output</code>，可一键复制。适合开发调试与本地密钥草稿，生产密钥管理仍应使用专业 KMS/密钥托管。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">生成规则对照</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><strong>hex</strong>：随机字节转十六进制，截到目标长度。</li>
    <li><strong>base64</strong>：随机字节 <code>btoa</code> 后去填充并截断到长度。</li>
    <li><strong>字符集模式</strong>：按勾选项拼 charset；若为空则回退字母数字；用随机字节对 charset 取模取样。</li>
    <li><strong>UUID</strong>：16 字节随机，按 RFC 版本位设置（version/variant 位），格式 8-4-4-4-12。</li>
    <li>预设：api=32 字母数字；secret=64；token=128 base64；aes128=32 hex；aes256=64 hex。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>先选预设对齐常见场景，再按系统要求微调长度与格式。</li>
    <li>点生成，确认输出长度与字符集符合接口文档。</li>
    <li>复制后粘贴到密钥保管位置；不要提交到公开 Git 仓库。</li>
    <li>公共电脑生成后清理剪贴板与页面输出。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">安全边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>依赖浏览器 Web Crypto 随机源；请在可信设备与最新浏览器使用。</li>
    <li>字符集取模存在轻微取模偏差，对绝大多数应用密钥足够，但不等于 FIPS 模块认证。</li>
    <li>页面不负责密钥轮换、权限与泄露监测。</li>
    <li>生成内容默认不写 localStorage（以当前脚本为准），刷新即无历史归档。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">UUID 按钮和生成按钮关系？</h3>
  <p style="margin:0 0 .8rem">激活 uuid 预设时点生成会走 <code>generateUUID</code>，否则走 <code>generate</code>。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">为何 base64 看不到 = 号？</h3>
  <p style="margin:0 0 .8rem">脚本去掉了 <code>=</code> 填充并按长度截断，便于当 token 使用。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能保证全局唯一吗？</h3>
  <p style="margin:0 0 .8rem">UUID v4 碰撞概率极低但仍是概率模型；业务唯一约束应在服务端再校验。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和文件哈希工具区别？</h3>
  <p style="margin:0">哈希是对已有文件摘要；本页是生成新的随机密钥材料。</p>
`),

  'tools/team-tools/decision-matrix.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">加权决策矩阵工具完整使用指南</h2>
  <p style="margin:0 0 1rem">用「评估标准 × 权重 × 方案打分」做结构化比选。默认标准示例：开发成本(8)、用户体验(9)、维护难度(6)；默认方案 A/B。标准权重输入范围按界面为 1–10；矩阵单元格对每个「方案-标准」键 <code>\`\${optionId}-\${criteriaId}\`</code> 记录 1–10 分。总分 = Σ(分数 × 权重)。结果区展示胜出方案名、分数与排名列表。数据键 <code>decision-matrix-data</code> 本地保存，支持分享链接、导出结果与清空。适合产品方案/供应商/技术选型讨论，不替代财务模型与合规评审。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">界面与函数</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><code>#decisionTitle</code>：决策标题，输入即存。</li>
    <li><code>addCriteria</code>/<code>removeCriteria</code>：维护标准名与权重。</li>
    <li><code>addOption</code>/<code>removeOption</code>：维护候选方案。</li>
    <li><code>renderMatrix</code>：表头含权重，行内 score 输入，实时累计总分并高亮较高分。</li>
    <li><code>calculateResults</code>：排序输出赢家与排名；<code>shareMatrix</code>/<code>exportResult</code>/<code>clearAll</code> 负责共享与清理。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐决策流程</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>先写清决策标题与不可妥协约束（预算/合规），约束外方案直接剔除。</li>
    <li>列 3–7 条标准并设权重：战略更重要的标准权重大。</li>
    <li>对每个方案在各标准下独立打 1–10，避免先看总分再改分。</li>
    <li>解读赢家后做敏感性：把关键权重 ±1 看排名是否翻转。</li>
    <li>导出或分享链接存档讨论结论，再进入执行计划。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>分数主观；垃圾进垃圾出。标准定义不清时结果无意义。</li>
    <li>不支持复杂约束规划、概率风险树。</li>
    <li>分享链接可能含标题与评分，注意脱敏。</li>
    <li>清空会 removeItem 本地数据，操作前先导出。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">分数留空怎么算？</h3>
  <p style="margin:0 0 .8rem">未填按 0 参与（<code>scores[key] || 0</code>），会拉低总分。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">权重可以超过 10 吗？</h3>
  <p style="margin:0 0 .8rem">界面 number 输入按 1–10 设计；请在该范围内表达相对重要性。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和随机决策助手区别？</h3>
  <p style="margin:0 0 .8rem">随机助手用于低风险破冰；本页用于可解释的加权比选。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">刷新后还在吗？</h3>
  <p style="margin:0">会从 <code>decision-matrix-data</code> 或 URL 恢复（以 <code>loadFromStorage</code>/<code>loadFromUrl</code> 为准）。</p>
`),

  'tools/media/svg-placeholder.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">SVG 占位图生成器完整使用指南</h2>
  <p style="margin:0 0 1rem">前端常用的占位图生成器：按宽高、背景色、文字色、文案、字号、描边宽度实时生成 SVG。宽 <code>#width</code>、高 <code>#height</code> 默认思路为 800×600 量级（以输入框当前值为准）；背景/文字支持 color 与 HEX 双向同步（<code>#bgColor</code>/<code>#bgColorHex</code> 等）。文案空时自动用「宽 × 高」；字号空时按 <code>Math.min(w,h)/8</code> 估算。预览 <code>#previewImg</code>，源码 <code>#outputCode</code> 可复制；可下载 SVG 或栅格化为 PNG。文本经 <code>escapeXml</code> 转义，降低破坏 SVG 的风险。适合原型、骨架屏、响应式断点示意，不是完整设计稿编辑器。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">生成结构</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>根元素 <code>svg</code>：xmlns、width、height、viewBox。</li>
    <li><code>rect</code> 铺满画布填背景；若描边宽度 &gt; 0，用文字色 stroke。</li>
    <li><code>text</code> 居中（text-anchor middle + dominant-baseline central），sans-serif 粗体。</li>
    <li><code>update()</code> 监听各输入的 input/change，同步 HEX 与预览/代码。</li>
    <li>下载 SVG：Blob + objectURL；PNG：canvas 绘制后再 toDataURL。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>按设计栅格设定宽高（如 1200×630 社媒、375×200 移动横幅）。</li>
    <li>选对比足够的底色与字色，文案写模块名或尺寸。</li>
    <li>复制 SVG 内嵌到 HTML，或下载 PNG 给不支持内联 SVG 的位置。</li>
    <li>需要多尺寸时改参数连续导出，统一命名。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>单行居中文本，不做自动换行排版引擎。</li>
    <li>PNG 导出依赖画布栅格，极大尺寸受内存限制。</li>
    <li>颜色为屏幕 sRGB 近似，不做印刷 CMYK。</li>
    <li>不是图片压缩/格式转换器；真实照片请用媒体其他工具。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">文案里的 &lt; 会不会弄坏 SVG？</h3>
  <p style="margin:0 0 .8rem"><code>escapeXml</code> 会转义 &lt;&gt;&amp; 引号等，降低注入式破坏。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">字号不填会怎样？</h3>
  <p style="margin:0 0 .8rem">按短边 / 8 自动估算，仍可手填覆盖。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">HEX 与取色器不同步？</h3>
  <p style="margin:0 0 .8rem">改 color 会写回 HEX 大写；改 HEX 在 change 时写回 color 再 update。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和 SVG 渲染页区别？</h3>
  <p style="margin:0">本页生成简单占位图；复杂 SVG 预览/调试请用专门 SVG 渲染工具。</p>
`),
};

function inject(html, guide) {
  html = html.replace(/<section class="tool-guide"[\s\S]*?<\/section>\s*/i, '');
  const block = '\n' + guide.trim() + '\n';
  if (html.includes('<!-- SEO 内容 -->')) {
    return html.replace('<!-- SEO 内容 -->', block + '<!-- SEO 内容 -->');
  }
  if (html.includes('</main>')) {
    return html.replace('</main>', block + '</main>');
  }
  if (html.includes('<footer')) {
    return html.replace('<footer', block + '<footer');
  }
  // FAQ / end of body fallback
  if (html.includes('<!-- FAQ')) {
    return html.replace('<!-- FAQ', block + '<!-- FAQ');
  }
  if (html.includes('</body>')) {
    return html.replace('</body>', block + '</body>');
  }
  throw new Error('no injection point');
}

let fail = 0;
const report = [];
for (const [rel, guide] of Object.entries(PAGES)) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    console.error('MISSING', rel);
    fail++;
    continue;
  }
  const original = fs.readFileSync(file, 'utf8');
  const guideCn = cn(guide);
  const next = inject(original, guide);
  fs.writeFileSync(file, next, 'utf8');
  const h1 = (next.match(/<h1\b/gi) || []).length;
  report.push({ rel, guideCn, h1 });
  const flag = guideCn < 800 || guideCn > 1300 || h1 !== 1 ? 'BAD' : 'OK';
  if (flag === 'BAD') fail++;
  console.log(`${flag} ${rel}: guideCn=${guideCn} h1=${h1}`);
}
console.log(fail ? 'FAIL' : 'OK', 'count', report.length);
process.exitCode = fail ? 2 : 0;
