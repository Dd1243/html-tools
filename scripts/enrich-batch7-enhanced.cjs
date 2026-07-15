/**
 * Batch 7: enhanced 800-1200 CN function-verified guides (8 pages).
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
  'tools/office/timesheet.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">在线工时记录工具完整使用指南</h2>
  <p style="margin:0 0 1rem">按「项目 + 日期 + 起止时间」记录工时。表单含项目名 <code>#projectInput</code>、日期 <code>#dateInput</code>、开始 <code>#startTime</code>、结束 <code>#endTime</code>，点添加写入条目数组。列表 <code>#entriesBody</code> 可删改展示；<code>calculateDiff</code> 算时长；周汇总区 <code>#summaryGrid</code> 按周一到周日与总计展示（<code>getWeekBoundaries</code>/<code>updateSummary</code>）。数据键 <code>timesheet_data_v2</code>。支持导出 CSV、清空。适合自由职业与项目制周报底稿，不是打卡机 GPS 考勤，也不自动对接薪资系统。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">数据流与计算</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><code>loadData</code>/<code>saveData</code> 读写 localStorage 中的 entries。</li>
    <li>时长由起止 time 差得出；跨午夜或结束早于开始时请检查输入。</li>
    <li>周边界用于汇总卡片 sum-1…sum-0 与 sum-total（具体星期映射以脚本为准）。</li>
    <li><code>renderAll</code> 刷新表格与汇总。</li>
    <li>导出生成 UTF-8 CSV Blob 下载，便于 Excel 打开。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐记录习惯</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>当天记当天，项目名保持稳定（同一客户同一写法）。</li>
    <li>午休可拆两段，或把休息排除在起止之外。</li>
    <li>周末看周汇总是否超负荷，及时调下周计划。</li>
    <li>周报前导出 CSV，按项目透视求和。</li>
    <li>公共电脑导出后清空，避免暴露客户项目名。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>无审批流、无账单自动生成、无多币种费率字段（费率可自备表格）。</li>
    <li>仅本机存储，换设备需导出迁移。</li>
    <li>不识别法定工时与加班规则，合规以劳动合同与当地法为准。</li>
    <li>与签到表：签到看「到没到」，工时看「做了多久」。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">刷新后记录在吗？</h3>
  <p style="margin:0 0 .8rem">在，键名 <code>timesheet_data_v2</code>。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">汇总为什么是 0？</h3>
  <p style="margin:0 0 .8rem">当前周无条目，或日期落在其他周；检查日期是否填错。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">CSV 乱码？</h3>
  <p style="margin:0 0 .8rem">用 Excel「数据→从文本」选 UTF-8 导入。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能多项目筛选吗？</h3>
  <p style="margin:0">列表为主；导出后用表格筛选项目列。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">与计费衔接</h2>
  <p style="margin:0 0 1rem">若按小时报价，导出后乘以费率得应收。会议成本页估「开会烧钱」，本页记「可开票工时」，不要混用。长时间任务可配合任务跟踪器写清交付物，工时只记时间块。</p>
  <p style="margin:0">清空不可恢复，月结前务必导出。主题与布局不影响数据。设备时间不准会导致日期归属错误，请校准系统时钟。</p>
`),

  'tools/team-tools/sprint-planner.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">敏捷冲刺规划器完整使用指南</h2>
  <p style="margin:0 0 1rem">为 Sprint Planning 准备：冲刺名 <code>#sprintName</code>、起止日期、目标 <code>#sprintGoal</code>；成员列表维护可用人天/容量；历史 Velocity 列表与简易图表；待办故事 backlog 含点数等字段。统计展示容量、已计划、平均速率、冲刺天数；容量条 <code>#capacityBar</code> 提示是否超额。数据本地保存，可导出计划、分享、清空。主题存 theme。适合 Scrum 计划会投屏，不是 Jira 替代品，也不自动从 Git 拉故事。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">模块与函数</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>成员：<code>addMember</code>/<code>updateMember</code>/<code>delMember</code>/<code>renderMembers</code>。</li>
    <li>速率：<code>addVelocity</code>/<code>updateVelocity</code>/<code>delVelocity</code>/<code>renderChart</code>。</li>
    <li>故事：<code>addStory</code>/<code>updateStory</code>/<code>delStory</code>/<code>renderStories</code>。</li>
    <li><code>updateStats</code> 汇总 capacity/planned/velocity/days；<code>saveState</code>/<code>loadState</code> 持久化。</li>
    <li><code>exportPlan</code>/<code>sharePlan</code>/<code>clearAll</code> 分发与清场。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">计划会流程</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>写冲刺目标一句话，定日期范围。</li>
    <li>录成员可用容量（请假要扣减）。</li>
    <li>填近几轮 Velocity 作参考，避免拍脑袋塞故事。</li>
    <li>从 backlog 拉故事，总点数接近但不明显超过容量。</li>
    <li>导出/分享给团队，会后在正式工具建 Sprint 板。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>无依赖排序、无自动拆分子任务、无燃尽图实时数据源。</li>
    <li>点数是相对估算，不是人天精确换算器。</li>
    <li>分享链接可能含目标与故事名，注意脱敏。</li>
    <li>容量条为提示，超载仍允许保存——纪律靠团队。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">刷新后计划在吗？</h3>
  <p style="margin:0 0 .8rem">会从本地状态恢复（以 saveState 键为准）。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和里程碑/WBS 关系？</h3>
  <p style="margin:0 0 .8rem">WBS 拆结构，里程碑看节点，本页做冲刺容量与故事承诺。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">Velocity 怎么填？</h3>
  <p style="margin:0 0 .8rem">填过去冲刺实际完成点数，用于预测，不是考核武器。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">超额了怎么办？</h3>
  <p style="margin:0">砍范围或降优先级，而不是默默加班填坑。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">纪律建议</h2>
  <p style="margin:0">计划会时间盒；故事 INVEST；目标可检验。公共电脑清空。主题切换不影响数据。与站会计时器配合执行期控时，与回顾工具收尾改进。</p>
`),

  'tools/team-tools/raci-chart.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">RACI 责任分配矩阵完整指南</h2>
  <p style="margin:0 0 1rem">用任务 × 角色矩阵明确 R（执行）、A（负责）、C（咨询）、I（知会）。可添加任务与角色，单元格点击 <code>cycleRACI</code> 轮转字母；<code>validate</code> 检查常见问题（如缺少 A、多个 A 等，以校验文案为准）。支持导出 Markdown、分享、本地存储与从 URL 恢复、清空。主题 theme。适合项目开工对齐分工，不是 HR 绩效系统，也不自动发待办。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">操作对照</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><code>addTask</code>/<code>removeTask</code>/<code>updateTaskName</code> 管理行。</li>
    <li><code>addRole</code>/<code>removeRole</code>/<code>updateRoleName</code> 管理列。</li>
    <li><code>renderMatrix</code> 画表；点击单元格循环 RACI 值。</li>
    <li><code>validate</code>/<code>validationSection</code> 显示规则提示。</li>
    <li><code>saveToStorage</code>/<code>loadFromStorage</code>/<code>shareRACI</code>/<code>exportMarkdown</code>。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">怎么填才有用</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>任务写可交付活动，避免「沟通一下」空泛词。</li>
    <li>每行尽量有且仅有一个 A（最终拍板人）。</li>
    <li>R 可多人，但要能协作；C 控制数量防会海。</li>
    <li>I 给需要知情但不决策的干系人。</li>
    <li>校验通过后导出 MD 贴进项目手册。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>字母含义按经典 RACI，不扩展 RASCI 除非你们口头约定。</li>
    <li>无工作流引擎强制执行。</li>
    <li>分享链接含矩阵内容，注意权限外泄。</li>
    <li>角色名建议用岗位而非仅人名，便于人员变动。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">点单元格没反应？</h3>
  <p style="margin:0 0 .8rem">确认点在矩阵单元格区域，并已有任务与角色。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">校验总是报警？</h3>
  <p style="margin:0 0 .8rem">检查是否缺 A 或 A 过多；按提示改。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和决策矩阵区别？</h3>
  <p style="margin:0 0 .8rem">决策矩阵选方案；RACI 定谁做谁批。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">数据存在哪？</h3>
  <p style="margin:0">本地 storage + 可选 URL 快照。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">落地建议</h2>
  <p style="margin:0">开工会投屏一起填，争议当场解决。变更流程时同步改矩阵。公共电脑导出后清空。与冲刺规划配合：RACI 定人，Sprint 定本迭代范围。</p>
`),

  'tools/privacy/text-encrypt.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">文本加密解密（多模式 AES）完整指南</h2>
  <p style="margin:0 0 1rem">浏览器本地文本加解密：算法网格可选 AES-GCM / CBC / CTR，密钥长度 <code>#keyLength</code>，口令 <code>#password</code> 可显示切换。输入 <code>#inputText</code>、输出 <code>#outputText</code>，计数显示；按钮加密、解密、交换、清空、复制。口令经 PBKDF2 类派生（<code>deriveKey</code>）得到 AES 密钥，操作走 Web Crypto。页面强调本地处理。适合敏感草稿保护，需与协作方约定算法与长度；不是企业 KMS，也不等于「encrypt-decrypt」页若管线参数不同则密文不互通。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">模式差异（概念）</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><strong>GCM</strong>：带认证的加密，篡改密文易被发现，优先推荐。</li>
    <li><strong>CBC</strong>：经典模式，需正确 IV 与填充处理，兼容旧资料时可能用到。</li>
    <li><strong>CTR</strong>：流式计数器模式，注意 nonce/IV 唯一性。</li>
    <li>加密解密必须同一算法、密钥长度与口令；输出格式以页面打包为准。</li>
    <li>错误信息显示在 <code>#errorMsg</code>。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">安全步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>仅在 HTTPS/localhost 使用，确保 subtle 可用。</li>
    <li>长随机口令；口令与密文分通道传递。</li>
    <li>选 GCM + 256（若无兼容包袱）。</li>
    <li>加密后复制输出，清空输入；忘记口令无法恢复。</li>
    <li>公共电脑用完清空剪贴板与文本框。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>弱口令可被猜测；工具不强制口令策略。</li>
    <li>与其他页/其他软件密文格式可能不兼容。</li>
    <li>大文本可能慢；文件请用专用方案。</li>
    <li>恶意扩展可窥屏，环境需可信。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">解密失败？</h3>
  <p style="margin:0 0 .8rem">口令错、算法/长度不一致、密文截断或混入空格。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和 encrypt-decrypt 页如何选？</h3>
  <p style="margin:0 0 .8rem">看你需要的算法集合与历史密文来源；不要混用未约定的输出。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">交换按钮做什么？</h3>
  <p style="margin:0 0 .8rem">便于把输出送回输入再处理（以 UI 为准）。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">数据上传吗？</h3>
  <p style="margin:0">加解密在本地完成。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">协作约定</h2>
  <p style="margin:0">书面约定：算法、密钥长度、口令传递方式。轮换口令后旧密文重加密。可用随机密钥页生成口令材料。屏幕共享时勿展示明文与口令。</p>
`),

  'tools/office/contract-template.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">在线合同模板生成器完整指南</h2>
  <p style="margin:0 0 1rem">按类型生成合同草稿：服务合同 service、劳动合同 employment、租赁合同 rental（<code>toggleType</code> 切换，显示对应字段如服务范围、岗位、租期地址、押金等）。公共字段含合同编号、日期、甲乙方、起止、金额、支付方式、补充条款。点生成填充 <code>#contractContent</code>/<code>#printableArea</code>；金额可 <code>numToCN</code> 转中文大写。支持复制、打印、清空；缓存 load/save。适合内部协商草稿，不是律师审定终稿，也不具备自动电子签章法律效力保证。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">类型与字段</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>服务：范围 <code>#serviceScope</code> 等。</li>
    <li>劳动：岗位、试用期等字段按 type 显示。</li>
    <li>租赁：地址描述、押金等。</li>
    <li><code>generate</code> 拼装正文；打印样式隐藏表单与导航。</li>
    <li>缓存避免刷新丢失未生成内容（键以脚本为准）。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">使用步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>选合同类型，填甲乙方全称与统一社会信用代码等（手写进文本框）。</li>
    <li>填金额与支付方式，生成后核对大写。</li>
    <li>补充条款写违约、保密、管辖法院等关键点。</li>
    <li>打印 PDF 送法务/对方审阅，按意见改字段再生成。</li>
    <li>正式签署走公司流程与印章，本页草稿勿当已生效合同。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">法律边界（重要）</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>模板通用，可能不符合当地强制条款。</li>
    <li>劳动/租赁强监管领域务必专业人士审核。</li>
    <li>不替代电子签名平台与合同管理系统。</li>
    <li>敏感合同勿留在公共电脑缓存。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">切换类型字段没了？</h3>
  <p style="margin:0 0 .8rem">正常：不同 type 显示不同 field_* 区域。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">大写金额不对？</h3>
  <p style="margin:0 0 .8rem">检查金额数字格式；特殊金额手工改正文。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和印章生成器？</h3>
  <p style="margin:0 0 .8rem">印章页做图章样式；合同页出文字稿，合成需自行排版。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">有法律效力吗？</h3>
  <p style="margin:0">取决于签署与当地法律，工具本身不背书。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">版本管理</h2>
  <p style="margin:0">每次重大修改改合同编号。复制正文到文档库留 diff。清空前确认已导出。与报价单衔接：报价成交后再生成服务合同。</p>
`),

  'tools/office/stamp-generator.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">在线印章生成器完整使用指南</h2>
  <p style="margin:0 0 1rem">在 canvas 上绘制公章样式预览：公司名 <code>#companyName</code>（最长约 30 字）、副标题 <code>#subtitle</code>（如合同专用章）、形状 <code>#shape</code>、边框色 <code>#borderColor</code>、线宽 <code>#borderWidth</code>、是否五角星 <code>#showStar</code>。预览 <code>#previewCanvas</code>；<code>drawStamp</code> 调用圆弧文字 <code>drawTextArc</code>、星形 <code>drawStar</code> 等。配置键 <code>stamp_generator_config_v2</code>。可下载 PNG、清空。适合演示与内部示意，不是公安备案的真实印章制作，也不得用于伪造公章。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">绘制参数</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>圆形/其他 shape 影响外轮廓。</li>
    <li>公司名沿弧排列，字数过多会挤。</li>
    <li>副标题多在横排中心区域。</li>
    <li>边框色默认红系，可改但正式场景慎用非规范色。</li>
    <li><code>loadConfig</code>/<code>saveConfig</code> 记住上次参数。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">使用步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>输入与营业执照一致的公司全称。</li>
    <li>选副标题类型文案，调线宽与是否星标。</li>
    <li>预览清晰后下载 PNG，插入演示文档。</li>
    <li>正式用印必须使用公司合法印章与制度，本图仅示意。</li>
    <li>公共电脑清空配置，避免残留公司名。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">法律红线</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>禁止伪造、变造公章用于欺诈。</li>
    <li>下载图不具备备案效力。</li>
    <li>对外合同请盖真实印章或合法电子签。</li>
    <li>工具作者不承担滥用后果——使用者自担合规。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">文字重叠？</h3>
  <p style="margin:0 0 .8rem">缩短公司名或副标题，减小字号相关参数（若有）。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">刷新后设置在吗？</h3>
  <p style="margin:0 0 .8rem">会从 <code>stamp_generator_config_v2</code> 恢复。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能做椭圆章吗？</h3>
  <p style="margin:0 0 .8rem">以 shape 选项提供的形状为准。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">透明底？</h3>
  <p style="margin:0">导出以 canvas 实现为准；需透明可后期抠图。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">与合同模板配合</h2>
  <p style="margin:0">合同页生成正文 PDF，印章页仅作版式示意，正式签署勿用生成图代替真章。设计演示可用；归档合同必须真章或合规电子签。</p>
`),

  'tools/social-media/social-preview.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">社交媒体分享预览器完整指南</h2>
  <p style="margin:0 0 1rem">模拟链接分享卡片：输入 URL <code>#urlInput</code>、标题 <code>#titleInput</code>、描述 <code>#descInput</code>、图片地址 <code>#imgInput</code>，右侧即时更新 Facebook/Twitter（X）风格预览（<code>#fbImg</code>/<code>#fbTitle</code>/<code>#fbDesc</code> 与 <code>#twImg</code>/<code>#twUrl</code> 等）。<code>updatePreview</code> 绑定 oninput。主题可切换存 theme。适合检查 Open Graph/Twitter Card 文案与图是否在卡片里好看，不抓取真实网页 meta，也不保证各平台最终渲染一致。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">如何用</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>把计划写入的 og:title / description / image 填进对应框。</li>
    <li>URL 显示域名与路径观感，注意过长参数。</li>
    <li>图片用绝对 HTTPS 地址，相对路径在真分享时常失败。</li>
    <li>改任一项即预览；无需提交服务器。</li>
    <li>不验证图片是否可被平台爬虫访问。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">写好分享文案</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>标题 40 字内抓住利益点；描述补一句证据或 CTA。</li>
    <li>图用 1200×630 一类安全尺寸，主体居中防裁切。</li>
    <li>避免标题党与违禁承诺。</li>
    <li>多平台可先在本页调文案，再写入站点 meta 生成器。</li>
    <li>发布后用平台调试工具再验缓存。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>不自动拉取网页，需手填字段。</li>
    <li>预览为示意皮肤，像素级与官方不一致属正常。</li>
    <li>无 LinkedIn/微信等全平台皮肤时勿假设有。</li>
    <li>图片跨域仅影响预览显示，真分享看图床可访问性。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">图片不显示？</h3>
  <p style="margin:0 0 .8rem">检查 URL 是否可公开访问、是否 HTTPS、是否防盗链。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和 meta 标签生成器关系？</h3>
  <p style="margin:0 0 .8rem">生成器出 HTML 标签；本页预览观感。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">数据保存吗？</h3>
  <p style="margin:0 0 .8rem">主要会话输入；主题进 localStorage。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能清平台缓存吗？</h3>
  <p style="margin:0">不能，需用各平台官方调试/刷新工具。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">发布检查清单</h2>
  <p style="margin:0">标题无错别字；描述不截断关键句；图含品牌但不堆字；URL 用规范域名。预览满意后再改线上 meta 并强刷缓存。工具不上传你的文案到社媒后台。</p>
`),

  'tools/realestate/property-fee.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">物业费计算器完整使用指南</h2>
  <p style="margin:0 0 1rem">快速估算物业费支出：建筑面积 <code>#area</code>（默认示例约 100）、单价 <code>#price</code>（元/㎡·月，默认示例约 2.5）。点计算后在 <code>#resultBox</code>/<code>#feeBody</code> 展示月/年及更长期汇总（以页面表格列为准）。公式核心：月费 ≈ 面积 × 单价，再乘月份得年费与多年累计。适合看房时粗算持有成本，不包含车位、水电公摊差额、电梯费另计等全部科目，也不替代物业合同账单。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">输入与结果</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>面积用合同建筑面积或物业计费面积，口径与账单一致。</li>
    <li>单价以物业公示或合同为准，活动折扣另计。</li>
    <li>结果表帮助对比 1 年/多年总支出量级。</li>
    <li>非负数字校验；面积过小无意义。</li>
    <li>计算在浏览器本地完成，无账号。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">看房时怎么用</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>问清计费面积与单价是否含税/公摊特殊规则。</li>
    <li>填入本页得年费，加上预估电费网络等得持有成本。</li>
    <li>对比不同小区单价对长期总成本的影响。</li>
    <li>买房决策还要算贷款、中介、装修，本页只物业一项。</li>
    <li>签约前以书面物业费标准为准，页面仅估算。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>阶梯价、空置优惠、商业综合体特殊计费未建模。</li>
    <li>无通胀自动调价预测（多年表为简单倍数时需知局限）。</li>
    <li>车位管理费、能耗公摊另算。</li>
    <li>地区政策差异大，以当地与合同为准。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和房租收益率页关系？</h3>
  <p style="margin:0 0 .8rem">收益率算投资回报；本页算物业刚性支出。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">结果和账单差很多？</h3>
  <p style="margin:0 0 .8rem">核对面积口径、是否含其他费项、是否有调价。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">要登录吗？</h3>
  <p style="margin:0 0 .8rem">不需要。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能保存历史小区吗？</h3>
  <p style="margin:0">当前以即时计算为主，可自行截图记录。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">成本意识</h2>
  <p style="margin:0">高单价服务若对应更好公共维护，需综合体验而非只比数字。长期持有时物业费是现金流，投资测算应扣减。工具不提供法律建议，欠费纠纷走物业合同与当地规定。</p>
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

function renderedH1(html) {
  const noScript = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  return (noScript.match(/<h1\b/gi) || []).length;
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
  const h1 = renderedH1(next);
  const ok = guideCn >= 800 && guideCn <= 1300 && h1 === 1;
  if (!ok) fail++;
  console.log(`${ok ? 'OK' : 'BAD'} ${rel}: guideCn=${guideCn} h1=${h1}`);
}
console.log(fail ? 'FAIL' : 'OK');
process.exitCode = fail ? 2 : 0;
