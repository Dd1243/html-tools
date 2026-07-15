/**
 * Batch 6: enhanced 800-1200 CN function-verified guides (8 pages).
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
  'tools/media/text-to-image.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">文字转图片生成器完整使用指南</h2>
  <p style="margin:0 0 1rem">把多行文字画到 <code>#mainCanvas</code> 导出为 PNG/JPG。输入框 <code>#textInput</code> 写正文；可调字体 <code>#fontFamily</code>、文字色 <code>#textColor</code>/<code>#textColorHex</code>、背景色 <code>#bgColor</code>/<code>#bgColorHex</code>、字号 <code>#fontSize</code>、行高 <code>#lineHeight</code>、内边距 <code>#padding</code>、对齐 <code>#textAlign</code>。预设芯片 <code>applyPreset</code> 一键套常用风格。<code>updatePreview</code> 随输入重绘：按行拆分、估算宽高、填充背景、再按左/中/右绘制。<code>downloadImage</code> 用 <code>toDataURL</code> 导出；<code>copyImage</code> 尝试写入剪贴板图片。适合金句海报、社媒短文图、占位文案图，不是排版软件，也不生成 AI 插画。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">绘制与导出行为</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>画布宽高由最长行、行数、行高与 padding 动态计算，避免固定画布裁字。</li>
    <li>颜色支持取色器与 HEX 双向；改一处应同步预览。</li>
    <li>JPG 导出质量约 0.9；透明背景需求请选 PNG。</li>
    <li>复制图片依赖 Clipboard API 与权限，失败时改下载。</li>
    <li>预设只改样式参数，不会改你的正文内容语义。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐制作流程</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>先写 1–6 行短文，过长先精简，避免图上字墙。</li>
    <li>选对比足够的字色/底色，深底浅字或浅底深字。</li>
    <li>调字号与行高，手机预览是否可读；内边距保证不贴边。</li>
    <li>套预设快速起步，再微调品牌色。</li>
    <li>下载 PNG 发设计群，或复制图片直接粘贴聊天。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>无自动换行排版引擎的复杂中文禁则，超长行会撑宽画布。</li>
    <li>字体依赖本机/网页可用字体列表，缺字时回退系统字体。</li>
    <li>不做多图层、阴影、图片背景混合（除非后续扩展）。</li>
    <li>全本地 canvas，不上传服务器。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">导出空白？</h3>
  <p style="margin:0 0 .8rem">检查正文是否为空、颜色是否字色=底色。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和 SVG 占位图区别？</h3>
  <p style="margin:0 0 .8rem">占位图偏尺寸示意；本页偏「文案出海报图」。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">复制按钮无效？</h3>
  <p style="margin:0 0 .8rem">浏览器权限或非安全上下文限制，改用下载。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能做长文章分页吗？</h3>
  <p style="margin:0">请拆成多张图多次导出，本页单画布一次输出。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">场景示例与注意</h2>
  <p style="margin:0 0 1rem">读书摘录、活动标语、课程封面字、错误页友好提示图都适合。商标与名人肖像勿侵权；政治敏感与违法内容不要生成传播。导出后若需圆角或滤镜，可再用圆角/滤镜工具二次处理。公共电脑注意剪贴板残留图片。</p>
  <p style="margin:0">与「图片加水印/加文字」类工具不同：本页从零生成文字图，不基于上传照片叠字。需要照片配文请先准备底图工具链。保持文案版权与引用规范，工具不提供版权检测。</p>
`),

  'tools/office/quotation-maker.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">在线报价单生成器完整指南</h2>
  <p style="margin:0 0 1rem">制作可打印报价单：单号 <code>#quoteNumber</code>、报价日 <code>#quoteDate</code>、有效期至 <code>#validUntil</code>、币种 <code>#currency</code>、本公司 <code>#companyInfo</code>、客户 <code>#clientInfo</code>。明细表 <code>#itemsBody</code> 管理品名/数量/单价等，<code>#btnAddItem</code> 增行，<code>updateItem</code>/<code>removeItem</code> 改删。<code>calculate</code> 汇总小计 <code>#subtotal</code>、税率 <code>#taxRate</code>、税额 <code>#taxAmount</code>、总计 <code>#totalAmount</code>；有效期文案 <code>#validityNotice</code>，备注 <code>#notes</code>。数据键 <code>webutils_quotation_data</code>。适合服务/项目报价草稿，不是电子签合同平台，也不自动开票。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">计算与保存</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>行金额由数量×单价；小计后按税率算税，再得总计（以页面公式为准）。</li>
    <li><code>updateValidity</code> 根据有效期日期生成提示语。</li>
    <li><code>save</code> 序列化到 localStorage；清空 <code>removeItem</code>。</li>
    <li>打印用浏览器打印隐藏无关 UI（若有打印样式）。</li>
    <li>币种符号影响展示，不做实时汇率换算。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">商务使用步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>先填公司与客户信息、单号规则，再录明细。</li>
    <li>税率按合同约定；含税/未税口径在备注写清。</li>
    <li>设合理有效期，过期自动提示客户重新询价。</li>
    <li>预览总计后打印 PDF 发送；大改版本请改单号。</li>
    <li>成交后另走合同与发票流程，本页只作报价呈现。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>无审批流、无在线付款、无库存锁定。</li>
    <li>复杂阶梯价/多币种分项需备注说明。</li>
    <li>本地数据，换设备请导出打印件备份。</li>
    <li>法律效力取决于你们盖章/邮件确认习惯，工具本身不背书。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">总计不对？</h3>
  <p style="margin:0 0 .8rem">检查数量单价是否数字、税率是否百分误解、是否有空行干扰。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和收据/发票页区别？</h3>
  <p style="margin:0 0 .8rem">报价在成交前；收据偏收讫样式；发票计算器管税额逻辑，发票生成器管版式。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">刷新后还在吗？</h3>
  <p style="margin:0 0 .8rem">会从 <code>webutils_quotation_data</code> 恢复。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能电子签名吗？</h3>
  <p style="margin:0">请用签名板导出图后贴进 PDF，或走正式电子签。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">条款与风险提示</h2>
  <p style="margin:0">备注区建议写清交付周期、付款节点、变更计费与知识产权归属。敏感成本结构勿写进客户可见备注。公共电脑清空数据。报价单含客户名与金额，分享截图注意范围。</p>
`),

  'tools/media/image-filters.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">图片滤镜编辑器完整使用指南</h2>
  <p style="margin:0 0 1rem">上传照片后在双画布上调色：<code>#originalCanvas</code> 保留原图，<code>#imageCanvas</code> 显示滤镜结果；可拖 <code>#compareSliderBar</code> 对比。滑杆控制亮度、对比度、饱和度、色温、色相、模糊、锐化、暗角等，旁显数值。预设按钮 <code>applyPreset</code> 快速风格化；<code>resetFilters</code> 归零；<code>toggleCompare</code> 对比；<code>downloadImage</code> 导出。处理在浏览器本地像素完成（含 <code>sharpenImage</code>、<code>rgbToHsl</code>/<code>hslToRgb</code> 等）。适合出片前微调，不是 Lightroom 目录管理或 RAW 专业工作流。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">管线说明</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><code>loadImage</code> 读文件到画布并显示占位切换。</li>
    <li><code>applyFilters</code> 按当前滑杆重算结果像素。</li>
    <li>锐化/模糊等对性能敏感，大图可能卡顿。</li>
    <li>对比模式移动分割线 <code>moveSplit</code>/<code>updateComparePos</code>。</li>
    <li>下载输出当前效果图；原图仍在内存直到换图。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">调色建议</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>先重置，再小幅调亮度/对比，避免一次拉满。</li>
    <li>人像少用极端色相；风景可略提饱和与色温。</li>
    <li>锐化适度，噪点多的图先别强锐。</li>
    <li>暗角突出主体，但别遮重要信息。</li>
    <li>用对比滑杆确认是否过度，再下载。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>非破坏性编辑历史有限，复杂步骤请分次下载备份。</li>
    <li>无图层蒙版精细局部（局部请用像素化区域等工具）。</li>
    <li>色彩为 sRGB 近似，印刷请另做打样。</li>
    <li>不上传服务器；公共电脑注意原图隐私。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">按钮灰色？</h3>
  <p style="margin:0 0 .8rem">尚未成功加载图片时下载/对比可能不可用。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和图片对比页区别？</h3>
  <p style="margin:0 0 .8rem">对比页比两张独立图；本页是原图 vs 当前滤镜结果。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">预设能自定义保存吗？</h3>
  <p style="margin:0 0 .8rem">以页面内置预设为主，参数可手调但不一定持久化预设库。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">导出后体积？</h3>
  <p style="margin:0">由画布导出格式决定，可用格式转换/压缩页再优化。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">工作流串联</h2>
  <p style="margin:0">先裁剪/旋转/尺寸，再进本页调色，最后转 WebP 压缩。证件照谨慎用强滤镜。二次有损会累积损伤，重要成片尽量基于较原图一次调完。处理敏感照片后关闭页面。</p>
`),

  'tools/office/business-card-maker.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">在线名片设计工具完整指南</h2>
  <p style="margin:0 0 1rem">填写姓名 <code>#inpName</code>、职位 <code>#inpTitle</code>、公司 <code>#inpCompany</code>、电话 <code>#inpPhone</code>、邮箱 <code>#inpEmail</code>、地址 <code>#inpAddress</code>，选样式 <code>#cardStyle</code> 与背景/文字/强调色 <code>#colorBg</code>/<code>#colorText</code>/<code>#colorAccent</code>，预览 <code>#cardPreview</code> 即时更新。可打印、导出、清空。数据键 <code>bc_maker_v2_data</code>。适合快速出电子名片预览与打印稿，不是印刷厂拼版系统，也不自动同步通讯录。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">编辑与存储</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><code>render</code> 根据输入与样式重绘预览结构。</li>
    <li><code>saveData</code>/<code>loadData</code> 读写 localStorage。</li>
    <li>清空 removeItem 并重置字段（以脚本为准）。</li>
    <li>打印/导出走浏览器能力，注意边距与缩放 100%。</li>
    <li>强调色用于分隔线或姓名高亮等样式差异。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">设计建议</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>信息层级：姓名最大，职位次之，联系方式清晰可复制。</li>
    <li>对比度足够，浅底深字更稳妥。</li>
    <li>电话写国际区号若对外；邮箱用常用工作邮。</li>
    <li>地址过长可精简到城市+园区，详址放邮件签名。</li>
    <li>定稿打印铜版纸前用 PDF 预览检查出血（本工具为简易预览）。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>无复杂 Logo 上传排版时，以页面是否提供为准。</li>
    <li>不生成 vCard 文件除非后续扩展。</li>
    <li>双面名片、异形裁切不在范围。</li>
    <li>本地存联系方式，公共电脑务必清空。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">刷新后信息还在吗？</h3>
  <p style="margin:0 0 .8rem">会从 <code>bc_maker_v2_data</code> 恢复。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和简历页区别？</h3>
  <p style="margin:0 0 .8rem">名片是短联系卡；简历是经历长文。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">导出模糊？</h3>
  <p style="margin:0 0 .8rem">提高浏览器缩放或用打印为 PDF；屏幕截图会糊。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能否批量多人？</h3>
  <p style="margin:0">当前一份草稿模型，换人需改字段或清空重填。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">隐私与品牌</h2>
  <p style="margin:0">手机号属于个人信息，分享预览截图注意打码。品牌色尽量贴近 VI，避免荧光刺眼。正式对外名片建议再经设计确认字体版权与印刷色值。</p>
`),

  'tools/team-tools/milestone-tracker.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">里程碑追踪器完整使用指南</h2>
  <p style="margin:0 0 1rem">跟踪项目关键节点：项目名 <code>#projName</code>、目标结束 <code>#projEnd</code>，列表管理里程碑标题与日期，可标记完成、删除。总览进度条 <code>#overallBar</code>，统计总数/已完成/逾期等。数据键 <code>milestone-data</code>；支持分享状态、导出报告、清空。主题存 <code>theme</code>。适合立项后的节点看板，不是甘特依赖网络，也不自动发提醒邮件。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">操作与状态</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><code>addMilestone</code> 添加；<code>toggleDone</code> 完成切换；<code>delM</code> 删除。</li>
    <li><code>updateUI</code> 刷新列表、进度与统计（含逾期判断相对今天/项目结束）。</li>
    <li><code>saveState</code>/<code>loadState</code> 读写 localStorage。</li>
    <li><code>shareState</code> 生成可分享快照；<code>exportReport</code> 导出文本报告。</li>
    <li><code>clearAll</code> 清空前请先导出。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">管理建议</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>里程碑 5–12 个为宜，过多变任务清单应拆到任务工具。</li>
    <li>日期用真实验收点，完成定义写在标题括号内。</li>
    <li>周会看逾期统计，先处理红项。</li>
    <li>项目结束日帮助判断整体是否漂期。</li>
    <li>导出报告贴进周报；分享链接给干系人只读对齐。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>无依赖前置、无资源分配、无基线对比高级分析。</li>
    <li>逾期算法基于本地日期，时区以设备为准。</li>
    <li>分享无权限控制，注意脱敏。</li>
    <li>不推送通知，需人工打开页面。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">刷新后数据在吗？</h3>
  <p style="margin:0 0 .8rem">在，键 <code>milestone-data</code>。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和甘特图怎么选？</h3>
  <p style="margin:0 0 .8rem">甘特看条形时间并行；里程碑看节点完成与逾期。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">完成能取消吗？</h3>
  <p style="margin:0 0 .8rem">再 toggle 即可取消完成（以 UI 为准）。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">进度条如何计算？</h3>
  <p style="margin:0">通常按已完成数/总数，具体以 updateUI 为准。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">与站会/WBS 配合</h2>
  <p style="margin:0">WBS 拆叶子任务，里程碑收关键验收点，站会同步阻塞。不要把所有 todo 塞进里程碑。公共电脑导出后清空。主题切换不影响数据。</p>
`),

  'tools/team-tools/meeting-agenda.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">会议议程生成器（团队工具版）完整指南</h2>
  <p style="margin:0 0 1rem">编排会议元信息与议题列表：标题 <code>#meetTitle</code>、日期 <code>#meetDate</code>、时间 <code>#meetTime</code>、地点 <code>#meetLoc</code>、主持人 <code>#meetHost</code>、参会 <code>#meetAtt</code>。议题列表可增删改，显示总分钟 <code>#totalMin</code>。输出区 <code>#output</code> 支持生成 Markdown/纯文本/HTML（<code>genMD</code>/<code>genTxt</code>/<code>genHTML</code>），可复制、下载、加载模板、分享状态。键 <code>meet-agenda-data</code>。与办公类「议程制作」页可能并存但数据不互通，以本页控件为准。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">功能对照</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><code>addItem</code>/<code>updateIt</code>/<code>delItem</code>/<code>renderItems</code> 维护议题。</li>
    <li><code>updateUI</code> 汇总时长等。</li>
    <li><code>loadTpl</code> 快速套常见会议结构。</li>
    <li><code>saveState</code>/<code>loadState</code>；分享用 Base64 等编码本地快照到 URL。</li>
    <li><code>copyResult</code>/<code>downloadResult</code> 分发议程。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">高效会议编排</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>标题写目标，不写「例会」空泛词。</li>
    <li>议题 3–7 个，决策项靠前，同步项靠后。</li>
    <li>填主持人与参会，便于会前预读责任。</li>
    <li>生成 Markdown 贴进文档库，或 HTML 发邮件。</li>
    <li>会中按总分钟控场；超时砍掉低优先级议题。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>不自动发日历 ICS（除非另有按钮，以页面为准）。</li>
    <li>无冲突检测与视频会议深度集成。</li>
    <li>分享链接含会议内容，注意机密。</li>
    <li>与 office/agenda-maker 数据键不同，勿假设同步。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">输出为空？</h3>
  <p style="margin:0 0 .8rem">先点对应生成按钮再复制。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">总分钟不准？</h3>
  <p style="margin:0 0 .8rem">检查每条议题时长字段是否填数字。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">模板会覆盖吗？</h3>
  <p style="margin:0 0 .8rem">加载模板可能替换议题结构，先保存/导出再试。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和会议成本计算器？</h3>
  <p style="margin:0">议程控结构；成本器显金钱，可同时投屏。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">本地与分享</h2>
  <p style="margin:0">键 <code>meet-agenda-data</code> 存本机；分享适合远程对齐同一版议程。公共电脑用完清空。系列例会可改日期复用议题骨架。主题切换不影响正文。</p>
`),

  'tools/team-tools/team-vote.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">团队决策投票工具完整指南</h2>
  <p style="margin:0 0 1rem">组织轻量投票：标题 <code>#voteTitle</code>，模式单选/多选/评分（1–5）由 <code>setMode</code> 切换；多选可设 <code>#maxSelect</code>。选项列表可增删改；投票区填 <code>#voterName</code> 后选择或点评分按钮提交。<code>votes</code> 结构按投票人记录 selections/scores。结果展示赢家、列表与统计（投票人数、总票、选项数）。键 <code>team-vote-v2-data</code>；可分享、导出文本、清空。适合团建选题与方案初筛，不是加密匿名选举系统。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">三种模式</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><strong>单选</strong>：每人一项，适合二选一/多选一。</li>
    <li><strong>多选</strong>：最多 maxSelect 项，适合「选三个偏好」。</li>
    <li><strong>评分</strong>：1–5 分按钮，适合满意度或方案打分。</li>
    <li>切换模式会重置当前选择态（currentScores 等），计票规则随之变。</li>
    <li><code>submitVote</code> 写入 votes 后 <code>renderResults</code>。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">主持流程</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>写清投票标题与规则（是否可弃权）。</li>
    <li>录入互斥清晰的选项，避免重叠语义。</li>
    <li>选模式；多选设上限；开始后每人填姓名提交。</li>
    <li>投屏结果；并列时口头加轮或改评分模式。</li>
    <li>导出文本归档；敏感投票勿用真名可改代号。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>姓名可冒充，无身份认证与防刷。</li>
    <li>非密码学匿名，组织者可见本地数据。</li>
    <li>无权重票、无代理投票。</li>
    <li>分享链接暴露题目与选项，注意场合。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">重复提交？</h3>
  <p style="margin:0 0 .8rem">通常以 voterName 为键覆盖或追加，以脚本为准；建议一人一名。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和决策矩阵区别？</h3>
  <p style="margin:0 0 .8rem">矩阵是加权打分表；本页是现场投票聚合。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和破冰工具？</h3>
  <p style="margin:0 0 .8rem">破冰随机提问；投票收集选择结果。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">数据键？</h3>
  <p style="margin:0"><code>team-vote-v2-data</code> 本地持久化。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">公平性提示</h2>
  <p style="margin:0">重大人事/资金决策不要只用本页。先讨论标准再投票，避免从众。导出后清空，防止下一场串票。主题切换不影响计票。</p>
`),

  'tools/team-tools/feedback-form.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">在线反馈表单生成器完整指南</h2>
  <p style="margin:0 0 1rem">可视化搭建反馈问卷：标题 <code>#formTitle</code>、说明 <code>#formDescription</code>，问题列表可增删。题型与选项可编辑（<code>updateQType</code>/<code>updateQOpt</code> 等），必填开关 <code>updateQReq</code>。预览区 <code>#previewArea</code> 与代码区 <code>#codeArea</code> 切换；可生成 HTML 或 Markdown（<code>generateHTML</code>/<code>generateMarkdown</code>），复制或下载。支持模板 <code>loadTemplate</code>、本地 <code>feedback-form-data</code>、分享链接与从 URL 恢复。适合活动反馈与内部调研草稿，不是带后端回收的完整问卷平台（回收需你自建或粘贴到其他平台）。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">题目维护</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><code>addQuestion</code>/<code>removeQuestion</code>/<code>generateId</code> 管理题目。</li>
    <li><code>renderQuestions</code> 编辑侧；<code>updatePreview</code> 预览侧。</li>
    <li>选项类题目用 <code>addQOpt</code>/<code>removeQOpt</code> 维护选项文本。</li>
    <li><code>switchTab</code> 在预览与代码间切换。</li>
    <li><code>renderCode</code> 输出可带走的 HTML/MD。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">设计好问卷</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>先写目的一句话进说明，控制 5–12 题。</li>
    <li>量表与单选优先，开放题少而精。</li>
    <li>必填只标真正关键项，降低放弃率。</li>
    <li>预览走查手机宽度是否友好。</li>
    <li>导出 HTML 可静态托管；或把题干抄到正式问卷系统。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>默认不提供云端答卷数据库与统计分析后台。</li>
    <li>分享链接传结构，不等于自动收集回复。</li>
    <li>无逻辑跳转（显隐题）高级引擎时勿假设有。</li>
    <li>敏感个人信息收集需合规告知。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">代码区是空的？</h3>
  <p style="margin:0 0 .8rem">切换到代码页并触发 generate/renderCode。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">刷新丢失？</h3>
  <p style="margin:0 0 .8rem">应写入 <code>feedback-form-data</code>；若无请检查是否被清站点数据。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和团队投票区别？</h3>
  <p style="margin:0 0 .8rem">投票现场计票；本页生成表单结构供填写场景。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">模板会覆盖吗？</h3>
  <p style="margin:0">可能替换题目列表，先下载备份再加载。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">落地与隐私</h2>
  <p style="margin:0">若 HTML 仅前端，提交需你接后端或改用第三方。收集邮箱/手机前写清用途。公共电脑清空本地草稿。主题键 theme 与表单数据分离。</p>
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
