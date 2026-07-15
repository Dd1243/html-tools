/**
 * Batch 4: enhanced 800-1200 CN function-verified guides (8 pages).
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
  'tools/office/slide-notes.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">演讲笔记助手完整使用指南</h2>
  <p style="margin:0 0 1rem">演讲笔记助手把「幻灯片提纲 + 演讲者备注 + 演示计时」放在同一页。左侧或列表区管理多页幻灯：每页有标题与备注正文；可添加、删除、编辑。演示区显示当前页标题 <code>#viewTitle</code> 与备注 <code>#viewNotes</code>，用 <code>#btnPrev</code>/<code>#btnNext</code> 翻页，<code>#pageInfo</code> 显示页码。内置计时：<code>#btnToggleTimer</code> 开始/暂停，<code>#btnResetTimer</code> 归零，时间在 <code>#timeDisplay</code>。数据写入 <code>localStorage</code> 键 <code>webutils_slide_notes</code>；无缓存时默认一页欢迎词示例。打印样式会隐藏编辑区与页眉页脚，便于投屏只看备注。适合路演彩排与课堂演讲，不是完整 PPT 编辑器。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">界面与数据流</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>内存数组 <code>slides</code>：每项 <code>{ title, notes }</code>。</li>
    <li><code>renderEdit</code> 渲染列表；<code>updateSlide</code> 改字段并 <code>save</code>。</li>
    <li><code>addSlide</code> 追加空页；<code>removeSlide</code> 删除；至少保留合理页数时注意别删空导致无页可演示。</li>
    <li><code>updateView</code> 根据当前索引刷新演示区；<code>goPrev</code>/<code>goNext</code> 切换索引。</li>
    <li>计时变量 <code>timer</code> + <code>setInterval</code> 每秒累加；暂停清除 interval。</li>
    <li><code>save</code> 把 slides 序列化到 <code>webutils_slide_notes</code>。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐彩排流程</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>按正式幻灯顺序建立同名标题页，备注只写「要说的话」而非整页正文复制。</li>
    <li>备注用短句与提示词（故事点、数据、过渡句），避免大段朗读稿。</li>
    <li>全屏或打印预览只看备注侧，开始计时完整走一遍，记录超时页。</li>
    <li>超时页压缩备注或拆页；关键页可写「最多 40 秒」提示。</li>
    <li>上场前重置计时，翻页只看当前备注，不要回头改编辑区。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">适用场景与边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>适用：答辩、内部分享、活动主持串场提词。</li>
    <li>不导入 PPTX/Keynote，不播放嵌入视频与动画。</li>
    <li>计时是简单秒表，不是多段演讲计时器专业模式（可与站内演讲计时工具配合）。</li>
    <li>数据仅本机浏览器；换设备需自行复制文本。公共电脑用完点清空。</li>
    <li>打印隐藏装饰元素，实际以浏览器打印预览为准。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">刷新后讲稿还在吗？</h3>
  <p style="margin:0 0 .8rem">会从 <code>webutils_slide_notes</code> 恢复；清站点数据会丢。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能否遥控翻页？</h3>
  <p style="margin:0 0 .8rem">当前是页面按钮翻页，无硬件遥控协议。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和议程生成器如何分工？</h3>
  <p style="margin:0 0 .8rem">议程管会议时间表；本页管单人演讲逐页提词与计时。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">备注太长怎么办？</h3>
  <p style="margin:0">拆成多页或改成关键词；演示区过长不利于扫读。</p>
`),

  'tools/office/attendance-sheet.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">在线签到表生成器完整指南</h2>
  <p style="margin:0 0 1rem">按「花名册 + 按日状态」记录出勤。数据结构 <code>store = { roster, records }</code>：roster 是人员列表，records 以日期字符串为键、人员 id 映射状态。状态四种：出勤 present、缺勤 absent、迟到 late、请假 leave；点同一状态可取消（切换逻辑以脚本为准）。日期用 <code>#attendanceDate</code>；添加姓名进花名册；统计卡显示总人数与四态计数。数据键 <code>attendance_v2_storage</code>。支持导出与打印、清空。适合培训签到、小型班课点名，不是打卡机/GPS 考勤系统。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">操作对照</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>选日期 → 在 <code>#newName</code> 加人到 roster → 表格 <code>#rosterBody</code> 逐人点状态按钮。</li>
    <li><code>setStatus(pid, status)</code> 写入当天 records；统计 present/absent/late/leave 实时更新。</li>
    <li><code>saveData</code>/<code>loadData</code> 读写 localStorage；换日期查看历史记录（若已点过）。</li>
    <li>导出按钮生成表格/CSV 向结果（以页面实现为准）；打印用浏览器打印样式。</li>
    <li>清空会清除本地 store，操作前先导出。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐流程</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>学期/项目开始先建完整花名册，避免每天重复录入。</li>
    <li>上课时先选对日期，再快速点状态；默认未点可视为未登记。</li>
    <li>课结束看统计：缺勤与迟到是否异常，必要时备注到导出文件外。</li>
    <li>周末导出备份；公共电脑不要留真实身份证号，姓名可用化名。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>无账号体系，同浏览器共享一份 store，多人会互相覆盖。</li>
    <li>不计算工时薪酬，不做排班冲突检测。</li>
    <li>状态仅四类，无「外勤/居家」等扩展除非自行在姓名备注。</li>
    <li>日期切换后显示该日 records；无记录则统计为 0。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">换手机数据在吗？</h3>
  <p style="margin:0 0 .8rem">不在。仅当前浏览器 <code>attendance_v2_storage</code>。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">误点状态如何改？</h3>
  <p style="margin:0 0 .8rem">再点正确状态覆盖；部分实现再点同一状态可取消，以界面反馈为准。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能扫码签到吗？</h3>
  <p style="margin:0 0 .8rem">不能。需人工点选或会前导入名单后快速点名。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和工时表 timesheet 区别？</h3>
  <p style="margin:0">签到表偏「当天到没到」；工时表偏「做了多久/哪个项目」。</p>
`),

  'tools/office/expense-report.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">在线费用报销单管理完整指南</h2>
  <p style="margin:0 0 1rem">用列表管理报销明细：日期 <code>#exp_date</code>、类别 <code>#exp_category</code>、说明 <code>#exp_desc</code>、金额 <code>#exp_amount</code>，点添加写入数组 <code>expenses</code>。类别映射含差旅交通 travel、餐饮交际 meals 等（<code>getCatName</code> 转中文标签）。列表展示分类色标、合计金额与笔数；可删除单行。本地键 <code>expense_report_data_v1</code>。导出生成 CSV（日期、类别中文、说明、金额）。适合个人差旅草稿与小团队报销底稿，不是对接 ERP 的电子发票验真系统。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">功能要点</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><code>save</code>/<code>load</code>/<code>render</code>：持久化与刷新列表、合计 <code>#total_val</code>、笔数 <code>#count_val</code>。</li>
    <li>添加时校验金额为数字；说明建议含「谁/何事/票据号」便于财务抽查。</li>
    <li>导出 CSV 用中文类别名；说明字段带引号以防逗号断裂。</li>
    <li>清空会抹掉本地数组，导出前确认。</li>
    <li>无附件上传：发票影像请另存网盘，本页只记结构化字段。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐记账习惯</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>消费当天录入，避免月底回忆误差。</li>
    <li>类别选对：交通与餐饮分开，便于科目汇总。</li>
    <li>说明写商户与事由，金额与票面一致。</li>
    <li>提交前导出 CSV，按公司模板再整理；本页合计仅作自检。</li>
    <li>多币种场景请在说明标注币种，页面默认按你输入数字合计，不做汇率。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>不验发票真伪，不连税务接口。</li>
    <li>无审批流、无部门分摊、无项目编码强制字段。</li>
    <li>数据在浏览器，离职换机请先导出。</li>
    <li>CSV 用 Excel 打开时注意编码，必要时用 UTF-8 导入向导。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">合计不对？</h3>
  <p style="margin:0 0 .8rem">检查是否有重复添加或金额填成文本；删除错误行后重新 render。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能按项目筛选吗？</h3>
  <p style="margin:0 0 .8rem">当前列表为主；可用说明字段加项目前缀，导出后在表格筛选。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和发票计算器关系？</h3>
  <p style="margin:0 0 .8rem">发票/税额计算用专门计算器；本页管费用流水清单。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">敏感金额安全吗？</h3>
  <p style="margin:0">仅本地存储；公共电脑务必导出后清空。</p>
`),

  'tools/office/resume-maker.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">简历在线生成器完整使用指南</h2>
  <p style="margin:0 0 1rem">分栏编辑个人简历并实时预览。典型模块：基本信息、教育经历 edu 数组、工作经历 exp 数组、技能标签 skills。可添加/删除教育与经历条目，字段变更触发 <code>updatePreview</code>。技能用输入框 + 添加按钮生成标签，可点叉移除。数据键 <code>webutils_resume_data</code>；清空会 <code>removeItem</code>。适合快速产出一版可打印简历草稿，不替代专业排版与投递系统的多模板适配。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">编辑与预览</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><code>renderEdu</code>/<code>updateEdu</code>/<code>removeEdu</code> 维护教育段。</li>
    <li><code>renderExp</code>/<code>updateExp</code>/<code>removeExp</code> 维护工作段。</li>
    <li><code>renderSkills</code>/<code>removeSkill</code> 维护技能芯片。</li>
    <li><code>updatePreview</code> 把当前 data 映到预览卡片；打印样式突出预览区。</li>
    <li><code>save</code> 序列化到 localStorage；<code>init</code> 时恢复。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">内容写法建议</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>经历用「动词 + 业务结果 + 量化」，避免只写职责罗列。</li>
    <li>教育从近到远；在读写预计毕业时间。</li>
    <li>技能 8–15 个为宜，按岗位 JD 关键词对齐，勿堆无关技术名词。</li>
    <li>预览检查联系方式是否可点击/可复制，错别字与日期连贯性。</li>
    <li>定稿后打印 PDF（浏览器打印为 PDF），再按公司系统粘贴。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>无多模板皮肤市场、无 AI 润色、无岗位匹配评分。</li>
    <li>不上传头像裁剪高级功能时，以页面实际控件为准。</li>
    <li>本地草稿可能含手机号邮箱，公共设备务必清空。</li>
    <li>ATS 解析因 PDF 生成方式而异，重要投递请再贴纯文本版。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">刷新会丢吗？</h3>
  <p style="margin:0 0 .8rem">一般会从 <code>webutils_resume_data</code> 恢复。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">教育/经历最少几条？</h3>
  <p style="margin:0 0 .8rem">脚本通常限制不能删到少于 1 条，避免结构为空。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能导出 Word 吗？</h3>
  <p style="margin:0 0 .8rem">主路径是网页预览与打印 PDF；Word 需自行复制。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和名片生成器区别？</h3>
  <p style="margin:0">名片是联系短卡；本页是完整经历型简历。</p>
`),

  'tools/office/seating-chart.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">在线座位图生成器完整指南</h2>
  <p style="margin:0 0 1rem">为宴会、培训、婚礼等布置桌位：设置总标题 <code>#pTitle</code>，添加桌台时填桌名 <code>#tableName</code>、桌型 <code>#tableType</code>（圆桌 round / 方桌 rect 等）、座位数 <code>#seatNum</code>，点添加后在 <code>#seatingGrid</code> 渲染。点击座位打开弹窗 <code>#seatModal</code> 填写宾客名 <code>#guestName</code> 保存；已占用座位有样式区分。数据键 <code>webutils_seating_data</code>。可清空全部桌台。适合活动筹备可视化，不是场馆 CAD 或电子签到闸机。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">交互细节</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><code>tables</code> 数组保存桌与座位宾客信息；<code>render</code> 重绘网格。</li>
    <li><code>addTable</code> 校验名称与座位数后推入；<code>removeTable</code> 删整桌。</li>
    <li><code>openModal</code>/<code>saveSeat</code>/<code>closeModal</code> 编辑单座。</li>
    <li><code>save</code> 写 localStorage；<code>init</code> 恢复上次排布。</li>
    <li>圆桌与方桌 CSS 不同，仅影响展示形状，不计算物理间距碰撞。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">布置建议</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>先定桌数与每桌人数，再录入，避免反复删改。</li>
    <li>主家/领导桌先锁定，再排普通宾客，减少临时挪座。</li>
    <li>同公司/亲属尽量同桌，在姓名旁可加括号备注（如「新娘同学」）。</li>
    <li>打印或截图发给现场统筹；变更后刷新保存再发新图。</li>
    <li>敏感宾客名单勿发公开链接；本页无权限系统。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>不模拟真实场地比例与消防通道。</li>
    <li>无自动「避嫌拆桌」算法，需人工安排。</li>
    <li>座位数过大时界面拥挤，建议合理桌型拆分。</li>
    <li>数据在浏览器，换设备请自行记录名单。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">座位名怎么改？</h3>
  <p style="margin:0 0 .8rem">再点该座打开弹窗覆盖保存；空名可表示空位。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能拖拽换座吗？</h3>
  <p style="margin:0 0 .8rem">当前以点击编辑为主，无拖拽交换手势（除非后续版本增加）。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和签到表如何配合？</h3>
  <p style="margin:0 0 .8rem">座位图管「坐哪」；签到表管「来没来」。可先排座再按桌点名。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">清空能撤销吗？</h3>
  <p style="margin:0">一般不能，清空前请截图或抄录关键桌。</p>
`),

  'tools/office/receipt-maker.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">在线收据生成器完整使用指南</h2>
  <p style="margin:0 0 1rem">生成简易销售/服务收据预览：店名 <code>#storeName</code>、收据号 <code>#receiptNo</code>、日期 <code>#receiptDate</code>、支付方式 <code>#paymentMethod</code>、门店信息 <code>#storeInfo</code>。明细表 <code>#itemsBody</code> 管理商品行（名称、数量、单价），可添加/删除；税率 <code>#taxRate</code>、折扣 <code>#discount</code>、页脚留言 <code>#footerMsg</code> 参与合计预览。收据号可用 <code>generateNo</code> 自动生成。数据键 <code>webutils_receipt_data</code>。适合摆摊、私教、小工作室开具收据样式，不构成法定税务发票，也不能替代税控设备。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">计算与保存</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>行金额 ≈ 数量 × 单价；小计汇总后再加税、减折扣（以 <code>updatePreview</code> 公式为准）。</li>
    <li><code>renderItems</code>/<code>updateItem</code>/<code>removeItem</code> 维护明细。</li>
    <li><code>save</code> 持久化店名、号段、明细、税率等；清空 removeItem 本地键。</li>
    <li>打印收据时用浏览器打印，隐藏无关导航（若有打印 CSS）。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">开具流程建议</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>先固定店名与页脚联系方式，避免每单重填。</li>
    <li>新单点生成新收据号，日期改当天，支付方式选现金/微信等。</li>
    <li>逐行录商品；税率按当地规定填写，不确定时先 0 并口头说明。</li>
    <li>预览核对总额后打印或截图发给客户。</li>
    <li>需要报销的客户请引导开具正规发票，本收据仅作交易凭证样式。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">法律与边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>不是增值税发票/财政票据；冒充发票违法。</li>
    <li>无在线支付收款、无库存扣减。</li>
    <li>折扣与税率输入错误会导致总额偏差，打印前必核。</li>
    <li>本地存储含交易信息，公共电脑请清空。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">收据号规则？</h3>
  <p style="margin:0 0 .8rem"><code>generateNo</code> 按脚本规则生成可读编号，可手改。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">税额怎么算？</h3>
  <p style="margin:0 0 .8rem">按你填的税率作用于预览合计逻辑；复杂含税/未税切换请自行换算后填。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能多币种吗？</h3>
  <p style="margin:0 0 .8rem">数字原样显示，符号以页面模板为准，无汇率。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和报价单区别？</h3>
  <p style="margin:0">报价单偏成交前方案；收据偏成交后收讫凭证样式。</p>
`),

  'tools/team-tools/icebreaker.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">破冰游戏生成器完整使用指南</h2>
  <p style="margin:0 0 1rem">为团建、培训开场随机抽出破冰问题。分类网格 <code>#catGrid</code> 来自脚本 <code>categories</code>（如通用 general、工作 work、趣味 fun 等），可多选分类池 <code>selectedCats</code>。点「随机生成一个问题」从选中分类题库抽题，展示在结果卡 <code>#resultCard</code>（表情、正文、元信息）。支持自定义问题 <code>#customInp</code> 加入 <code>customQuestions</code>；历史 <code>#historyList</code> 记录抽过的题。附带发言计时：默认约 60 秒，可改 <code>#timerDur</code>，<code>toggleTimer</code>/<code>resetTimer</code> 控制。状态键 <code>icebreaker-data</code>（及主题 theme）。适合活跃气氛，不适合正式绩效考核提问。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">功能对照</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><code>renderCats</code>：渲染分类按钮，点击切换选中。</li>
    <li><code>generate</code>：合并选中分类题目 + 自定义题，随机一条并写入历史。</li>
    <li><code>addCustom</code>：把输入加入自定义库，便于行业黑话题。</li>
    <li><code>renderHistory</code>/<code>saveState</code>/<code>loadState</code>：历史与选项持久化。</li>
    <li>计时器与抽题独立：抽到题后可给每人限时回答。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">主持建议</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>新团队先用「通用/趣味」，熟团队可用「工作」谈协作偏好。</li>
    <li>声明「可跳过」规则，避免强迫分享隐私。</li>
    <li>每人 1 分钟计时，到时鼓掌切换，保持节奏。</li>
    <li>把好问题加自定义，沉淀成团队题库。</li>
    <li>敏感职场话题（薪资/隐私）不要即兴加进题库。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>题库有限，重复抽中正常；可看历史换一题。</li>
    <li>伪随机，无防重复强保证（取决于实现是否去重）。</li>
    <li>不是完整团建方案库（无道具游戏规则长文）。</li>
    <li>计时依赖前台标签页，后台可能被节流。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">不选题库能抽吗？</h3>
  <p style="margin:0 0 .8rem">请至少保留一个分类或添加自定义题，否则池可能为空。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">历史会同步到手机吗？</h3>
  <p style="margin:0 0 .8rem">不会，仅本机 localStorage。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和团队投票区别？</h3>
  <p style="margin:0 0 .8rem">破冰是随机提问暖场；投票是收集选项结果。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">计时到 0 会响铃吗？</h3>
  <p style="margin:0">以页面是否提示为准；多数为视觉归零，主持人需自行控场。</p>
`),

  'tools/office/agenda-maker.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">会议议程在线生成器完整指南</h2>
  <p style="margin:0 0 1rem">结构化编排会议：标题 <code>#meetingTitle</code>、地点 <code>#meetingLocation</code>、日期 <code>#meetingDate</code>、开始时间 <code>#meetingTime</code>。参会人标签区 <code>#attendeesContainer</code>，输入 <code>#attendeeInput</code> 添加。议程表 <code>#agendaBody</code> 管理议题与时长；新议题 <code>#newTopic</code>、时长 <code>#newDuration</code>（默认常 15 分钟）点添加。汇总区显示总时长 <code>#totalDuration</code> 与预计结束时间 <code>#endTime</code>（由开始时间 + 各段 duration 累加，经 <code>parseTime</code>/<code>formatTime</code>）。支持打印、复制、清空。本地键 <code>agenda_maker_v2_data</code>。适合会前对齐节奏，不自动发日历邀请。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">数据与操作</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>数组 <code>attendees</code>、<code>agendaItems</code>（含 topic、duration 等）。</li>
    <li>行内可改时长、上移下移 <code>moveItem</code>、删除议题。</li>
    <li><code>updateSummary</code>：总分钟数与结束时刻重算。</li>
    <li><code>saveData</code>/<code>loadData</code> 持久化；清空 removeItem。</li>
    <li>复制可将议程文本放入剪贴板（以按钮实现为准）方便贴进邮件。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">设计一场高效会</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>先写目标一句话进标题，再拆 3–7 个议题，单题 10–20 分钟。</li>
    <li>把决策项放前半，信息同步放后半，避免超时丢掉决议。</li>
    <li>参会人只留必要角色；名单完整有助会前预读。</li>
    <li>看预计结束时间是否越过午休/下班，超时就砍议题。</li>
    <li>定稿打印或复制到会议邀请正文；会中按表控时。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>结束时间按算术累加，不含休息缓冲，除非你单独加「休息」议题。</li>
    <li>无时区智能、无冲突检测、无视频会议深度链接生成（可手写地点栏）。</li>
    <li>与会议成本计算器配合：议程控时长，成本器显金钱。</li>
    <li>本地数据，敏感议程勿留在公共电脑。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">结束时间不准？</h3>
  <p style="margin:0 0 .8rem">检查开始时间格式与各段时长是否为数字分钟；跨午夜场景按脚本分钟累加理解。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">参会人怎么删？</h3>
  <p style="margin:0 0 .8rem">标签上的删除控件（以 UI 为准）从 attendees 移除并保存。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能导出 ICS 吗？</h3>
  <p style="margin:0 0 .8rem">当前主路径是打印/复制文本，无标准日历文件导出。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和回顾会议模板区别？</h3>
  <p style="margin:0">议程是会前时间表；回顾工具是会中看板收集与投票。</p>
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
