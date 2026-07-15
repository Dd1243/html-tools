/**
 * Batch 8: enhanced 800-1200 CN function-verified guides (8 pages).
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
function renderedH1(html) {
  return (html.replace(/<script[\s\S]*?<\/script>/gi, '').match(/<h1\b/gi) || []).length;
}

const PAGES = {
  'tools/privacy/exif-remover.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">EXIF 信息移除器完整使用指南</h2>
  <p style="margin:0 0 1rem">批量去除图片元数据（含 GPS、拍摄设备、时间等 EXIF 线索）。拖拽区 <code>#dropZone</code> 或 <code>#fileInput</code> 多选图片，网格 <code>#imageGrid</code> 展示每张状态；质量滑杆 <code>#quality</code> 影响 JPEG 重编码质量（旁显 <code>#qualityValue</code>）。处理逻辑：用 Image 加载后画到临时 canvas，再 <code>toDataURL</code> 导出——重绘会剥离多数 EXIF。统计 <code>#totalCount</code>/<code>#processedCount</code>。全程浏览器本地，适合发帖前脱敏，不是专业取证级元数据审计工具，也无法保证所有厂商私有块 100% 清除。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">处理管线</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><code>handleFiles</code> 读入文件列表并进入队列。</li>
    <li><code>removeExif</code>：drawImage 到与 naturalWidth/Height 相同的 canvas，再导出 PNG 或按 type+quality 导出 JPEG。</li>
    <li><code>render</code>/<code>updateStats</code> 刷新卡片与计数；<code>formatSize</code> 显示体积。</li>
    <li>质量仅对有损格式有意义；PNG 路径通常忽略质量参数。</li>
    <li>大图占内存，建议分批，避免一次丢入上百张超清原图。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐流程</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>需要保留原图时先复制副本，再对本页输出图发布。</li>
    <li>社交发帖、二手交易、证件局部展示前先跑一遍。</li>
    <li>JPEG 可略降质量减小体积；档案级用 PNG 路径（若可选）。</li>
    <li>处理后用本机属性/在线 EXIF 查看器抽检一张。</li>
    <li>公共电脑用完关闭页签，清除下载目录敏感图。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>重编码可能轻微画质损失（JPEG）。</li>
    <li>截图类本就无 EXIF 时体积变化有限。</li>
    <li>不处理视频/RAW 专业格式全套元数据。</li>
    <li>画面本身的门牌人脸仍可能暴露位置，需另打码。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">为什么体积变了？</h3>
  <p style="margin:0 0 .8rem">canvas 重编码与质量参数导致，属预期。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">会上传吗？</h3>
  <p style="margin:0 0 .8rem">本地处理；仍避免在不信任设备打开机密图。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和像素化打码区别？</h3>
  <p style="margin:0 0 .8rem">本页清元数据；打码改像素内容。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">HEIC 支持吗？</h3>
  <p style="margin:0">取决于浏览器能否解码该格式为 Image。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">隐私实践</h2>
  <p style="margin:0">旅行照常含 GPS，出售物品图也可能含家中坐标。养成「发布前去 EXIF」习惯。公司内部分享可用原图走加密通道，公开渠道用处理后文件。工具不替代组织 DLP 策略。</p>
`),

  'tools/media/image-stitcher.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">图片拼接器完整使用指南</h2>
  <p style="margin:0 0 1rem">把多张图拼成一张：上传后列表 <code>#imageList</code> 可删单张；布局含网格选项 <code>#gridOpt</code>/<code>#gridCols</code>，间距 <code>#spacing</code>，背景色 <code>#bgColor</code>，透明底 <code>#transparent</code>，输出格式与 JPEG 质量。预览区实时 <code>updatePreview</code>，统计张数与尺寸体积。下载或复制到剪贴板。canvas 合成在本地完成。适合对比图、表情包长图、产品拼图，不是专业拼缝全景软件（无特征点对齐）。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">布局与导出</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>横向/纵向/网格等模式由 grid 相关控件决定（以界面选项为准）。</li>
    <li>间距与背景色填充空隙；透明底适合 PNG。</li>
    <li><code>handleFormatChange</code> 切换格式时显示/隐藏质量条。</li>
    <li><code>downloadImage</code> 导出结果 canvas；<code>copyToClipboard</code> 需权限。</li>
    <li><code>clearAll</code> 清空队列；大图注意内存。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>先统一缩放各图（可用尺寸工具），拼接更整齐。</li>
    <li>选布局与列数，调间距避免拥挤。</li>
    <li>预览确认顺序；列表可删除重传调序（以 UI 是否支持拖拽为准）。</li>
    <li>透明背景选 PNG；照片拼图可用 JPEG 控体积。</li>
    <li>下载后可用压缩页再优化。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>分辨率差过大时小图会被拉伸或留白（视实现）。</li>
    <li>无自动全景接缝、无透视校正。</li>
    <li>极多/极大图可能失败，请分批。</li>
    <li>剪贴板复制失败时改下载。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">预览空白？</h3>
  <p style="margin:0 0 .8rem">确认已成功加载至少一张，且非损坏文件。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和图片对比页？</h3>
  <p style="margin:0 0 .8rem">对比页滑块看 A/B；本页输出一张合图。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">透明无效？</h3>
  <p style="margin:0 0 .8rem">请用 PNG 并勾选透明；JPEG 不支持透明。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">顺序不对？</h3>
  <p style="margin:0">按添加顺序或列表顺序合成，删后重加可调整。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">场景提示</h2>
  <p style="margin:0">电商主图三联、前后对比、教程步骤条都适合。注意版权：只拼你有权使用的图。发布前若含人脸定位，可先去 EXIF。公共电脑清空列表。</p>
`),

  'tools/business/valuation.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">企业估值计算器完整使用指南</h2>
  <p style="margin:0 0 1rem">用多方法粗算企业价值区间：输入营收 <code>#revenue</code>、净利润 <code>#netProfit</code>、EBITDA <code>#ebitda</code>、净资产 <code>#netAssets</code>，选择行业 <code>#industry</code>、阶段 <code>#stage</code>、增长率 <code>#growthRate</code>、WACC <code>#wacc</code>。点击计算后展示 PE/PS/EV/PB/DCF 等指标（<code>#peVal</code> 等）与综合区间 <code>#valuationRange</code>。行业倍数表 <code>industryMultiples</code> 与阶段系数参与估算。<strong>仅供学习与讨论框架，不是投资建议或审计结论。</strong></p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">方法概览</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>PE：净利润 × 行业市盈率类倍数 × 阶段系数。</li>
    <li>PS：营收 × 市销类倍数。</li>
    <li>EV/EBITDA 思路：EBITDA × 对应倍数。</li>
    <li>PB：净资产 × 市净类倍数。</li>
    <li>DCF 简化：增长与折现（WACC）参与，模型高度简化。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">使用步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>尽量用同一会计口径的年化或 TTM 数据。</li>
    <li>选最接近的行业，阶段反映初创/成长/成熟风险。</li>
    <li>增长率与 WACC 勿极端；先用保守假设。</li>
    <li>看各方法离散度：相差过大说明假设不稳。</li>
    <li>区间只作讨论起点，尽调与交易价格另议。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>倍数为内置示意，非实时市场数据。</li>
    <li>无完整三表预测、无股权期权细节。</li>
    <li>亏损企业部分倍数无意义，结果可能为空或失真。</li>
    <li>主题切换不影响计算。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">结果全是 --？</h3>
  <p style="margin:0 0 .8rem">输入不足或利润为负导致部分方法跳过。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和利润率计算器区别？</h3>
  <p style="margin:0 0 .8rem">利润率看经营比率；本页粗估企业价值。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能当融资估值吗？</h3>
  <p style="margin:0 0 .8rem">不能直接当交易依据，仅沟通框架。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">数据保存吗？</h3>
  <p style="margin:0">以页面是否本地缓存为准；重要结果请截图。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">解读建议</h2>
  <p style="margin:0">多方法取中位数附近作区间，并做敏感性：增长率 ± 几个点看估值波动。行业选错会系统性偏差。涉及证券交易请咨询持牌机构。工具不做合规披露。</p>
`),

  'tools/legal/privacy-policy.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">隐私政策生成器完整使用指南</h2>
  <p style="margin:0 0 1rem">根据表单生成隐私政策草稿：公司名、网站、联系邮箱、生效日、地址；勾选收集的数据类型（姓名、邮箱、电话、地址、支付、使用数据、Cookie、位置、设备等）；可选法规倾向 GDPR/CCPA/PIPL；语言中/英。生成输出到 <code>#output</code>，可复制、下载；本地键 <code>webutils_privacy_policy_v2</code>。适合产品上线前出一版可编辑底稿，<strong>不构成律师意见</strong>，上线前应由法务按实际业务修订。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">表单与生成</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><code>getFormData</code>/<code>setFormData</code> 收集与回填。</li>
    <li><code>generatePolicy</code> 分支中英文 <code>generateChinesePolicy</code>/<code>generateEnglishPolicy</code>。</li>
    <li>勾选决定条款是否描述某类数据。</li>
    <li><code>saveToStorage</code>/<code>loadFromStorage</code> 持久化草稿。</li>
    <li><code>copyOutput</code>/<code>downloadPolicy</code>/<code>clearForm</code> 导出与清空。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">填写建议</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>只勾真实会收集的数据，勿夸大或隐瞒。</li>
    <li>联系邮箱用可触达的隐私事务邮箱。</li>
    <li>生效日与版本更新策略写清。</li>
    <li>跨境、儿童、敏感个人信息需额外专业条款。</li>
    <li>生成后全文审阅，改成与产品一致的表述。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">合规边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>勾选 GDPR/CCPA/PIPL 只影响模板段落倾向，不等于自动合规认证。</li>
    <li>不同业态（医疗金融）有额外规范。</li>
    <li>政策与实际处理不一致是高风险，必须对齐。</li>
    <li>本工具不向监管提交任何文件。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">刷新后表单还在吗？</h3>
  <p style="margin:0 0 .8rem">会从 <code>webutils_privacy_policy_v2</code> 尝试恢复。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">中英文要两份？</h3>
  <p style="margin:0 0 .8rem">切换语言分别生成下载。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能替代 DPA 吗？</h3>
  <p style="margin:0 0 .8rem">不能；数据处理协议需另拟。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">状态提示？</h3>
  <p style="margin:0"><code>showStatus</code> 反馈保存/复制等操作结果。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">上线检查</h2>
  <p style="margin:0">网站页脚挂上政策链接；Cookie 横幅与政策描述一致；更新处理活动时同步改政策并改日期。公共电脑清空本地草稿。工具提升起草效率，最终责任在运营者。</p>
`),

  'tools/office/invoice-calculator.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">增值税发票税额计算器完整指南</h2>
  <p style="margin:0 0 1rem">在「含税价 / 不含税价」与税率之间换算税额与价税合计。界面提供常见税率快选与自定义税率，输入金额后 <code>updateCalculation</code> 实时出结果；大写金额 <code>numberToChinese</code> 便于单据核对；可复制结果与公式说明。适合财务助理快速验算，不是开票系统，也不连接税局接口。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">计算关系（概念）</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>不含税金额 × 税率 = 税额；合计 = 不含税 + 税额。</li>
    <li>含税金额 ÷ (1+税率) = 不含税；税额 = 含税 − 不含税。</li>
    <li>税率以页面选择为准（如 13%、9%、6%、3%、1% 等常见档，以 UI 为准）。</li>
    <li>公式展示帮助向同事解释口径。</li>
    <li>大写用于中文单据习惯，特殊金额请人工复核。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">使用步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>先明确手里数字是含税还是不含税。</li>
    <li>选对税率，勿用错行业税率。</li>
    <li>看税额与价税合计是否与发票一致。</li>
    <li>复制结果贴进报销说明或对账表。</li>
    <li>争议以税控系统与会计制度为准。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>不处理差额征税、即征即退等特殊政策。</li>
    <li>小数进位规则可能与开票软件四舍五入略有差异。</li>
    <li>无发票真伪查验。</li>
    <li>与「发票生成器」：本页算税，生成器出版式草稿。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和发票差一分钱？</h3>
  <p style="margin:0 0 .8rem">多为进位规则；以税控票面为准。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">自定义税率？</h3>
  <p style="margin:0 0 .8rem">使用自定义输入（若界面提供）填实际征收率。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">大写不对？</h3>
  <p style="margin:0 0 .8rem">检查金额小数位；极端值手工改。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">需要联网吗？</h3>
  <p style="margin:0">计算本地完成。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">实务提示</h2>
  <p style="margin:0">报价时约定「是否含税」可避免纠纷。报销前用本页核对票面。税率政策会变，以最新法规与主管税局口径为准。工具不提供税务筹划建议。</p>
`),

  'tools/media/svg-render.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">在线 SVG 渲染器完整使用指南</h2>
  <p style="margin:0 0 1rem">左侧粘贴 SVG 源码 <code>#svgInput</code>，右侧 <code>#previewSvgContainer</code> 实时预览；状态 <code>#statusMsg</code>。可加载示例、清空。导出区设宽高 <code>#exportWidth</code>/<code>#exportHeight</code>、格式、质量、背景色/透明与棋盘格辅助，经隐藏 <code>#exportCanvas</code> 栅格化后下载或复制图片；可分享状态、本地保存。<code>updatePreview</code> 解析并展示；非法 SVG 会提示。适合调试图标与导出 PNG，不是完整矢量设计软件。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">预览与导出</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>预览尽量保留矢量清晰度；导出走 canvas 位图。</li>
    <li><code>getCanvas</code> 按设定尺寸绘制，透明或填充背景。</li>
    <li>信息面板显示原始与导出尺寸。</li>
    <li><code>saveState</code>/<code>loadState</code>/<code>shareState</code> 便于传给同事同一份 SVG 草稿。</li>
    <li>外链图片的 SVG 可能受跨域影响导出。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐用法</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>从设计工具复制 SVG 源码粘贴预览。</li>
    <li>检查 viewBox 与路径是否完整。</li>
    <li>导出 2× 尺寸 PNG 用于高清 UI。</li>
    <li>需要透明底勾选透明；海报可设底色。</li>
    <li>复杂滤镜/字体以浏览器实现为准，打印级请用专业工具。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>脚本型 SVG 可能被浏览器限制，注意安全。</li>
    <li>超大路径导出位图占内存。</li>
    <li>不保证 100% 与 Illustrator 渲染一致。</li>
    <li>与 SVG 占位生成器：本页渲染已有代码，占位页生成简单图。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">预览空白？</h3>
  <p style="margin:0 0 .8rem">检查是否缺 xmlns、标签未闭合、或被转义成实体。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">导出发糊？</h3>
  <p style="margin:0 0 .8rem">提高导出宽高再下载。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">复制图片失败？</h3>
  <p style="margin:0 0 .8rem">权限或非安全上下文，改用下载。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">状态能分享吗？</h3>
  <p style="margin:0">shareState 生成链接快照（以实现为准），注意源码可能含内部图形。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">安全提示</h2>
  <p style="margin:0">不要粘贴来源不明的含脚本 SVG。导出图用于生产前检查版权。公共电脑清空输入。本地保存键以页面脚本为准。</p>
`),

  'tools/office/invoice-maker.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">在线发票生成器完整使用指南</h2>
  <p style="margin:0 0 1rem">制作账单/商业发票样式草稿：销方 <code>#fromName</code>/<code>#fromAddress</code>，购方 <code>#toName</code>/<code>#toAddress</code>，发票号与日期、到期日、币种；明细表可添加行，税率 <code>#taxRate</code> 参与 <code>calculate</code> 得小计、税额、总计；备注 <code>#notes</code>。数据键 <code>invoice_maker_v2_data</code>。可打印、清空。<strong>不是税务局税控发票，不能替代增值税专用/普通发票开具。</strong>适合服务结算单与对账草稿。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">明细与合计</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><code>createRow</code> 增行；数量×单价计入小计。</li>
    <li>税率百分比作用于小计得税额（以脚本公式为准）。</li>
    <li><code>saveData</code>/<code>loadData</code> 本地恢复。</li>
    <li>打印隐藏编辑控件（若有打印 CSS）。</li>
    <li>币种仅展示符号，无汇率。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">使用步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>填双方抬头与地址，发票号按内部规则。</li>
    <li>逐行录服务/商品，核对小计。</li>
    <li>设税率与备注付款条件。</li>
    <li>打印 PDF 发给客户；正式报税另走开票系统。</li>
    <li>公共电脑清空本地数据。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">法律边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>禁止冒充国家发票监制格式用于偷逃税。</li>
    <li>客户抵扣进项必须以合法税控票为准。</li>
    <li>本页输出为商业单据样式。</li>
    <li>与税额计算器：生成器出单，计算器细算税。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">总计不对？</h3>
  <p style="margin:0 0 .8rem">检查数量单价是否数字、税率是否填错。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">刷新还在吗？</h3>
  <p style="margin:0 0 .8rem">会从 <code>invoice_maker_v2_data</code> 恢复。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和报价单区别？</h3>
  <p style="margin:0 0 .8rem">报价在成交前；本页偏账单/请款样式。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能对接支付吗？</h3>
  <p style="margin:0">不能，仅文档生成。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">对账习惯</h2>
  <p style="margin:0">一单一号；改价改号。PDF 与银行回单一起归档。国际客户写明币种与税号信息（手填备注）。工具提升排版效率，合规开票走正式渠道。</p>
`),

  'tools/team-tools/workload-calc.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">工作量评估器完整使用指南</h2>
  <p style="margin:0 0 1rem">用多种估算方法汇总项目工作量：模式切换 <code>setMethod</code> 支持故事点、标准工时、T 恤尺码等；可填团队速率 <code>#velocity</code>、冲刺长度、团队规模。任务列表维护每项估计；PERT/三点估计相关字段由 <code>updatePert</code> 处理（乐观/可能/悲观）。结果区显示总量、折算冲刺数/天数、均值等，并有汇总表与风险分析。可导出 Markdown、分享、本地存、清空。适合计划会估算，不是精确工时考勤。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">模式与计算</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>故事点：相对复杂度，结合 velocity 估冲刺数。</li>
    <li>工时：直接小时汇总，再除以团队产能近似天数。</li>
    <li>T 恤：尺码映射到点数/小时（以脚本映射为准）。</li>
    <li>PERT：常用 (O+4M+P)/6 思路降不确定性（以实现为准）。</li>
    <li><code>calculate</code>/<code>renderSummary</code>/<code>renderRisks</code> 刷新结论。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">估算会流程</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>选方法并统一团队口径（勿混用未换算单位）。</li>
    <li>逐条任务估点/时；争议大用三点估计。</li>
    <li>填真实 velocity 与可用人力，看所需冲刺是否可接受。</li>
    <li>读风险分析，给缓冲而不是压到极限。</li>
    <li>导出 MD 进计划文档；分享给缺席成员。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>估算≠承诺；执行中变更需重估。</li>
    <li>无自动从 Jira 同步。</li>
    <li>风险文案为启发式，不是概率模型认证。</li>
    <li>与冲刺规划器配合：本页估总量，规划器排进 Sprint。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">切换方法数字乱了？</h3>
  <p style="margin:0 0 .8rem">单位含义变了，需按新方法重估或换算。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">冲刺数很大？</h3>
  <p style="margin:0 0 .8rem">砍范围或提高产能假设前先质疑估算是否虚高。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">数据在哪？</h3>
  <p style="margin:0 0 .8rem">saveState/loadState 本地；可分享链接。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和任务分解 WBS？</h3>
  <p style="margin:0">WBS 拆结构；本页对任务估量。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">估算纪律</h2>
  <p style="margin:0">谁做谁估；拆到可理解；用历史 velocity 校准。避免老板当场压点。公共电脑清空。主题不影响数据。</p>
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
  const h1 = renderedH1(next);
  const ok = guideCn >= 800 && guideCn <= 1300 && h1 === 1;
  if (!ok) fail++;
  console.log(`${ok ? 'OK' : 'BAD'} ${rel}: guideCn=${guideCn} h1=${h1}`);
}
console.log(fail ? 'FAIL' : 'OK');
process.exitCode = fail ? 2 : 0;
