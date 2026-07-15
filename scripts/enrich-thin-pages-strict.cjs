/**
 * Strict-mode thin page enrichment.
 * Only injects hand-verified content for tools whose UI/logic was inspected.
 * No generic "replace tool name" templates.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const PAGES = {
  'tools/life/habit-tracker.html': {
    anchor: '<!-- FAQ（GEO 优化）-->',
    html: `
<section class="tool-guide" aria-label="使用指南" style="margin:2rem auto;max-width:720px;padding:1.25rem;border:1px solid var(--border,#333);border-radius:12px;line-height:1.75">
  <h2 style="font-size:1.2rem;margin:0 0 .75rem">习惯追踪怎么用</h2>
  <p style="margin:0 0 1rem">本页用于记录每日习惯打卡。每个习惯保存名称、连续天数 <code>streak</code>，以及已完成日期列表 <code>completedDates</code>。数据写入浏览器 <code>localStorage</code> 键名 <code>habits</code>，不会上传到服务器。</p>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">操作步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>在“添加新习惯...”输入框填写名称，点击“添加”，或按 Enter。</li>
    <li>列表中点击左侧圆圈，把今天（按本地日期 <code>YYYY-MM-DD</code>）记为完成；再次点击可取消今日打卡。</li>
    <li>右侧火焰数字表示连续天数：今日首次打卡会 +1，取消今日打卡会 -1（不会低于 0）。</li>
    <li>点击 “×” 删除整条习惯；右上角按钮可切换浅色/深色主题。</li>
  </ol>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">适用场景</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>追踪早起、阅读、运动等需要天天重复的个人习惯</li>
    <li>用连续天数提醒自己不要轻易断签</li>
    <li>不需要账号体系时，在同一浏览器里轻量坚持</li>
  </ul>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">常见问题</h2>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">换电脑或清站点数据会怎样？</h3>
  <p style="margin:0 0 .75rem">习惯存在当前浏览器本地。清除站点数据、换设备或无痕模式通常会丢失记录。</p>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">可以补昨天的打卡吗？</h3>
  <p style="margin:0 0 .75rem">不能。页面只认“今天”的日期字符串，没有历史补录入口。</p>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">连续天数如何计算？</h3>
  <p style="margin:0">实现是“每次完成今日 +1 / 取消今日 -1”，并不是严格按日历连续日自动重算。若跨天后未打卡，数值不会自动清零，请按自己的规则理解。</p>
</section>
`,
  },

  'tools/life/todo-list.html': {
    anchor: '<!-- FAQ（GEO 优化）-->',
    html: `
<section class="tool-guide" aria-label="使用指南" style="margin:2rem auto;max-width:720px;padding:1.25rem;border:1px solid var(--border,#333);border-radius:12px;line-height:1.75">
  <h2 style="font-size:1.2rem;margin:0 0 .75rem">待办事项怎么用</h2>
  <p style="margin:0 0 1rem">本页是本地待办清单：每条任务含 <code>id</code>、<code>text</code>、<code>completed</code>，保存在 <code>localStorage</code> 键 <code>todos</code>。支持筛选与清除已完成，不提供账号同步。</p>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">操作步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>在“添加新任务...”输入内容，点击“添加”。</li>
    <li>点击任务左侧方框切换完成/未完成；完成项会显示删除线样式。</li>
    <li>用“全部 / 未完成 / 已完成”筛选列表；底部显示“N 项未完成”。</li>
    <li>点任务右侧 “×” 删除单条；点“清除已完成”批量删除已完成任务。</li>
  </ol>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">适用场景</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>今天要办的几件小事快速记下</li>
    <li>会议中临时记录 action items</li>
    <li>只想在本机浏览器保存，不注册 GTD App</li>
  </ul>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">常见问题</h2>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">和习惯追踪有何不同？</h3>
  <p style="margin:0 0 .75rem">待办是一次性任务勾选；习惯追踪按“今日是否完成”累计连续天数。</p>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">数据会同步到手机吗？</h3>
  <p style="margin:0 0 .75rem">不会自动同步。仅当前浏览器本地可读。</p>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">任务文本如何防注入？</h3>
  <p style="margin:0">渲染前会做 HTML 转义（<code>escapeHtml</code>），降低脚本注入风险。</p>
</section>
`,
  },

  'tools/life/pomodoro.html': {
    anchor: '<!-- FAQ（GEO 优化）-->',
    html: `
<section class="tool-guide" aria-label="使用指南" style="margin:2rem auto;max-width:720px;padding:1.25rem;border:1px solid var(--border,#333);border-radius:12px;line-height:1.75">
  <h2 style="font-size:1.2rem;margin:0 0 .75rem">番茄钟怎么用</h2>
  <p style="margin:0 0 1rem">页面内置三种时长：工作 25 分钟、短休 5 分钟、长休 15 分钟。倒计时结束后会尝试播放内嵌提示音，并弹出 <code>alert</code>（工作结束提示“休息一下!”，休息结束提示“继续工作!”）。仅在“工作时间”模式结束时，完成番茄计数 +1。</p>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">操作步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>选择“工作 25分 / 短休 5分 / 长休 15分”。</li>
    <li>点“开始”进入倒计时，按钮文案变为“暂停”；再点可暂停。</li>
    <li>点“重置”停止计时并恢复当前模式的完整时长。</li>
    <li>工作倒计时归零后，查看“完成番茄: N 个”是否增加。</li>
  </ol>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">适用场景</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>写代码、写方案时强制分段专注</li>
    <li>复习时用短休息避免连续过劳</li>
    <li>居家办公需要简单可感知的节奏器</li>
  </ul>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">常见问题</h2>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">可以自定义 45 分钟吗？</h3>
  <p style="margin:0 0 .75rem">当前页面固定 25/5/15，没有自定义分钟输入框。</p>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">为什么没听到声音？</h3>
  <p style="margin:0 0 .75rem">提示音通过 <code>Audio.play()</code> 播放；浏览器可能拦截自动播放，且失败时被 <code>catch</code> 静默忽略，仍会弹出文字提示。</p>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">完成数会跨天保存吗？</h3>
  <p style="margin:0">完成番茄计数在内存变量 <code>count</code> 中，刷新页面后归零，不会写入 localStorage。</p>
</section>
`,
  },

  'tools/life/notes.html': {
    anchor: '<!-- FAQ（GEO 优化）-->',
    html: `
<section class="tool-guide" aria-label="使用指南" style="margin:2rem auto;max-width:720px;padding:1.25rem;border:1px solid var(--border,#333);border-radius:12px;line-height:1.75">
  <h2 style="font-size:1.2rem;margin:0 0 .75rem">便签笔记怎么用</h2>
  <p style="margin:0 0 1rem">这是卡片式本地笔记：支持标题、正文、颜色标签、搜索，以及编辑/删除。笔记数组保存在 <code>localStorage</code> 键 <code>notes</code>。新建或编辑通过弹窗完成，不是整页大文本框直写。</p>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">操作步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>点“+ 新建笔记”，填写标题与内容，选择颜色，点“保存”。</li>
    <li>在顶部“搜索笔记...”按标题/内容关键词过滤卡片。</li>
    <li>卡片上点铅笔图标进入编辑；点垃圾桶删除。</li>
    <li>点“取消”关闭弹窗且不保存当前编辑。</li>
  </ol>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">适用场景</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>临时灵感、电话要点、待查链接</li>
    <li>用颜色区分工作/生活便签</li>
    <li>需要本机快速检索的短笔记</li>
  </ul>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">常见问题</h2>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">支持 Markdown 预览吗？</h3>
  <p style="margin:0 0 .75rem">当前是纯文本标题+内容存储与展示，没有 Markdown 渲染。</p>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">空笔记能保存吗？</h3>
  <p style="margin:0 0 .75rem">保存时会读取标题与内容；若实现要求非空，空内容可能无法形成有效笔记（以页面校验为准）。无标题时列表显示“无标题”。</p>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">数据存在哪？</h3>
  <p style="margin:0">仅当前浏览器本地 <code>notes</code>，不跨设备同步。</p>
</section>
`,
  },

  'tools/text/word-counter.html': {
    anchor: '<!-- 长文 SEO 内容 -->',
    html: `
<section class="tool-guide" aria-label="使用指南" style="margin:2rem auto 0;padding:1.25rem;border:1px solid var(--border-color,#ddd);border-radius:12px;line-height:1.75;background:var(--bg-card,#fff)">
  <h2 style="font-size:1.2rem;margin:0 0 .75rem">字数统计指标说明</h2>
  <p style="margin:0 0 1rem">在文本框输入或粘贴后，统计会实时更新。页面提供六个指标：总字符数、总字数(不含空格)、中文字数、英文单词数、标点符号、行数。按钮包括“复制统计结果”“清空内容”“粘贴文本”。</p>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">操作步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>在主文本框输入，或点“粘贴文本”从剪贴板读入。</li>
    <li>查看下方六宫格统计；中英文混排时分别看“中文字数”与“英文单词数”。</li>
    <li>点“复制统计结果”把汇总复制到剪贴板。</li>
    <li>点“清空内容”重置文本与计数。</li>
  </ol>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">适用场景</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>社交媒体/广告文案限字检查</li>
    <li>表单“最多 N 字”提交前自检</li>
    <li>中英文混排稿件分别估算汉字与英文词量</li>
  </ul>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">常见问题</h2>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">总字符数和“不含空格”差在哪？</h3>
  <p style="margin:0 0 .75rem">总字符数计入空格等全部字符；“总字数(不含空格)”排除空白后的长度，便于按平台不同规则对照。</p>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">英文单词如何切分？</h3>
  <p style="margin:0 0 .75rem">按页面脚本的英文分词规则统计单词数，不是按字母个数。</p>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">文稿会上传吗？</h3>
  <p style="margin:0">统计在浏览器本地完成，用于自检时不必把草稿发到第三方编辑器。</p>
</section>
`,
  },

  'tools/text/diff-checker.html': {
    anchor: '<!-- SEO 内容区 -->',
    html: `
<section class="tool-guide" aria-label="使用指南" style="margin:2rem auto 0;padding:1.25rem;border:1px solid var(--border-color,#ddd);border-radius:12px;line-height:1.75;background:var(--bg-card,#fff)">
  <h2 style="font-size:1.2rem;margin:0 0 .75rem">文本对比如何工作</h2>
  <p style="margin:0 0 1rem">左侧 <code>textA</code> 为原始文本，右侧 <code>textB</code> 为修改后文本。点击“开始比对差异”后，按行使用 LCS 算法生成增/删/相同行，并统计新增、删除、相同行数。可切换“统一视图 / 分屏视图”，也可“加载代码示例”或“清空内容”。</p>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">操作步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>在左侧粘贴旧版，在右侧粘贴新版。</li>
    <li>点“开始比对差异”，查看新增/删除/相同计数。</li>
    <li>在结果区切换统一视图或分屏视图阅读行级差异。</li>
    <li>需要演示时点“加载代码示例”；结束时点“清空内容”。</li>
  </ol>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">适用场景</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>文案修订前后对照</li>
    <li>配置文件或代码片段行级差异</li>
    <li>翻译稿与原文结构核对</li>
  </ul>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">常见问题</h2>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">是字符级 diff 还是行级？</h3>
  <p style="margin:0 0 .75rem">当前实现按换行拆成行后做 LCS，是行级对比，不是 IDE 那种词级/字符级高亮。</p>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">特别大的文本会怎样？</h3>
  <p style="margin:0 0 .75rem">LCS 复杂度随行数上升，超大文本可能变慢，建议先对比关键片段。</p>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">结果会保存吗？</h3>
  <p style="margin:0">比对在本地内存中完成；刷新页面后需重新粘贴与比对。</p>
</section>
`,
  },

  'tools/text/duplicate-remover.html': {
    anchor: '<!-- SEO 内容 -->',
    fallbackAnchors: ['<!-- 长文 SEO 内容 -->', '</main>'],
    html: `
<section class="tool-guide" aria-label="使用指南" style="margin:2rem auto 0;padding:1.25rem;border:1px solid var(--border-color,#ddd);border-radius:12px;line-height:1.75;background:var(--bg-card,#fff)">
  <h2 style="font-size:1.2rem;margin:0 0 .75rem">文本去重规则说明</h2>
  <p style="margin:0 0 1rem">工具按“行”去重：把输入按换行拆分，保留首次出现的行。可选项包括：忽略大小写、去除首尾空格（默认开）、删除空行（默认开）、输出排序。结果区显示原始行数、唯一行数、删除行数、重复率；输入会尝试写入 <code>localStorage</code> 键 <code>duplicate_remover_content</code> 以便刷新恢复。</p>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">操作步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>在左侧粘贴名单/关键词/日志等多行文本。</li>
    <li>按需勾选“忽略大小写 / 去除首尾空格 / 删除空行 / 输出排序”。</li>
    <li>查看右侧唯一结果与统计数字。</li>
    <li>点“复制结果”带走；“加载示例”可快速试用；“清空内容”重置。</li>
  </ol>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">适用场景</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>邮件名单、邀请名单去重</li>
    <li>关键词表、标签表清理</li>
    <li>日志中重复行压缩查看</li>
  </ul>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">常见问题</h2>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">“Apple”和“apple”算重复吗？</h3>
  <p style="margin:0 0 .75rem">仅当勾选“忽略大小写”时视为相同；默认区分大小写。</p>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">会打乱顺序吗？</h3>
  <p style="margin:0 0 .75rem">默认保留首次出现顺序；勾选“输出排序”后会再排序。</p>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">是按词还是按行？</h3>
  <p style="margin:0">按行。同一行内的重复词不会单独剔除。</p>
</section>
`,
  },

  'tools/text/chinese-converter.html': {
    anchor: '<!-- SEO 内容 -->',
    fallbackAnchors: ['<!-- 长文 SEO 内容 -->', '</main>'],
    html: `
<section class="tool-guide" aria-label="使用指南" style="margin:2rem auto 0;padding:1.25rem;border:1px solid var(--border-color,#ddd);border-radius:12px;line-height:1.75;background:var(--bg-card,#fff)">
  <h2 style="font-size:1.2rem;margin:0 0 .75rem">简繁转换怎么用</h2>
  <p style="margin:0 0 1rem">页面提供双向转换按钮：“简体 → 繁体”与“繁体 → 简体”，另有“交换文本”“复制结果”“清空内容”。转换基于浏览器内置字库映射，在本地完成；输入内容可缓存到 <code>localStorage</code> 键 <code>chinese_converter_content</code>。左右文本框分别显示输入/输出字数。</p>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">操作步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>在左侧输入简体或繁体中文。</li>
    <li>点“简体 → 繁体”或“繁体 → 简体”生成结果。</li>
    <li>需要把结果当新输入时点“交换文本”。</li>
    <li>点“复制结果”使用；“清空内容”会清除文本与本地缓存。</li>
  </ol>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">适用场景</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>简体文案转为繁体发布</li>
    <li>繁体资料统一成简体存档</li>
    <li>字幕、商品标题做区域字形切换</li>
  </ul>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">常见问题</h2>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">用词会完全符合台湾/香港习惯吗？</h3>
  <p style="margin:0 0 .75rem">主要是字形转换；惯用语差异仍可能需要人工润色。</p>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">英文和数字会变吗？</h3>
  <p style="margin:0 0 .75rem">通常只处理汉字映射，英文、数字保持不变。</p>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">专有名词要注意什么？</h3>
  <p style="margin:0">品牌名、人名、地名转换后建议人工复核，避免错误对应。</p>
</section>
`,
  },

  'tools/privacy/file-hash.html': {
    anchor: '<!-- SEO 内容 -->',
    fallbackAnchors: ['<!-- 长文 SEO 内容 -->', '</main>', '<!-- FAQ（GEO 优化）-->'],
    html: `
<section class="tool-guide" aria-label="使用指南" style="margin:2rem auto 0;padding:1.25rem;border:1px solid var(--border-color,#ddd);border-radius:12px;line-height:1.75;background:var(--bg-card,#fff)">
  <h2 style="font-size:1.2rem;margin:0 0 .75rem">文件哈希校验说明</h2>
  <p style="margin:0 0 1rem">选择或拖入本地文件后，页面会计算并展示 <strong>MD5 / SHA-1 / SHA-256 / SHA-512</strong> 四种摘要，每项可单独复制。支持进度显示与大文件分块处理思路；下方可将官方哈希粘贴到“验证”框比对是否一致。计算在浏览器本地完成，用于完整性校验，不代替杀毒或来源鉴别。</p>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">操作步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>点击上传区或拖拽文件到 drop zone。</li>
    <li>等待进度完成后，查看 MD5/SHA-1/SHA-256/SHA-512。</li>
    <li>点对应“复制”按钮获取摘要字符串。</li>
    <li>若有官方哈希，粘贴到验证输入框并点“验证”比对。</li>
  </ol>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">适用场景</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>校验安装包/镜像是否与公布哈希一致</li>
    <li>确认两份文件内容是否完全相同</li>
    <li>发布文件时生成校验和给下载用户</li>
  </ul>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">常见问题</h2>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">哈希相同就安全吗？</h3>
  <p style="margin:0 0 .75rem">只能说明内容一致。若来源本身不可信，仍有风险。</p>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">文件会上传到 WebUtils 吗？</h3>
  <p style="margin:0 0 .75rem">哈希在本地计算，页面用途是本地校验，不需要登录。</p>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">为什么还提供 MD5/SHA-1？</h3>
  <p style="margin:0">很多软件站点仍公布 MD5/SHA-1。新场景完整性校验更推荐 SHA-256/SHA-512。</p>
</section>
`,
  },

  'tools/media/image-resize.html': {
    anchor: '<!-- SEO 内容 -->',
    fallbackAnchors: ['<!-- 长文 SEO 内容 -->', '</main>', '<!-- FAQ（GEO 优化）-->'],
    html: `
<section class="tool-guide" aria-label="使用指南" style="margin:2rem auto 0;padding:1.25rem;border:1px solid var(--border-color,#ddd);border-radius:12px;line-height:1.75;background:var(--bg-card,#fff)">
  <h2 style="font-size:1.2rem;margin:0 0 .75rem">图片尺寸修改说明</h2>
  <p style="margin:0 0 1rem">上传图片后可在本地画布缩放。页面展示原始体积/尺寸、结果体积/尺寸与压缩率；提供“更新预览”“下载结果”“重置”以及比例/固定尺寸相关预设。处理通过浏览器 <code>canvas</code> 完成，适合改边长与导出，不是专业 RAW 修图器。</p>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">操作步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>点击或拖拽上传图片到预览区。</li>
    <li>设置目标宽高或使用预设比例/尺寸。</li>
    <li>点“更新预览”查看效果与体积变化。</li>
    <li>满意后点下载；可用“重置”清空重来。</li>
  </ol>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">适用场景</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>电商主图、头像、封面统一尺寸</li>
    <li>上传前先缩小边长以减小文件体积</li>
    <li>快速导出指定宽高的预览图</li>
  </ul>
  <h2 style="font-size:1.1rem;margin:1.2rem 0 .5rem">常见问题</h2>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">放大后会更清晰吗？</h3>
  <p style="margin:0 0 .75rem">不会凭空增加细节。放大会变糊；优先缩小或接近原图分辨率。</p>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">图片会上传服务器吗？</h3>
  <p style="margin:0 0 .75rem">在本地用 FileReader/canvas 处理，不依赖登录上传。</p>
  <h3 style="font-size:1rem;margin:1rem 0 .35rem">支持哪些格式？</h3>
  <p style="margin:0">以浏览器可读的常见位图格式为主（如 JPEG/PNG/WebP）；具体可选导出格式以页面控件为准。</p>
</section>
`,
  },
};

function inject(html, page) {
  // remove previous strict guide if re-run
  html = html.replace(/<section class="tool-guide"[\s\S]*?<\/section>\s*/i, '');
  const block = page.html.trim() + '\n';
  if (html.includes(page.anchor)) {
    return html.replace(page.anchor, block + page.anchor);
  }
  if (page.fallbackAnchors) {
    for (const a of page.fallbackAnchors) {
      if (a === '</main>' && html.includes('</main>')) {
        return html.replace('</main>', block + '</main>');
      }
      if (html.includes(a)) return html.replace(a, block + a);
    }
  }
  if (html.includes('</main>')) return html.replace('</main>', block + '</main>');
  if (html.includes('<footer')) return html.replace('<footer', block + '<footer');
  throw new Error('no injection point');
}

function stats(html) {
  const body = (html.match(/<body[\s\S]*<\/body>/i) || [html])[0];
  const text = body
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return {
    cn: (text.match(/[\u4e00-\u9fff]/g) || []).length,
    total: text.length,
  };
}

let changed = 0;
for (const [rel, page] of Object.entries(PAGES)) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    console.error('missing', rel);
    continue;
  }
  const original = fs.readFileSync(file, 'utf8');
  const before = stats(original);
  const next = inject(original, page);
  fs.writeFileSync(file, next, 'utf8');
  const after = stats(next);
  changed += 1;
  console.log(`${rel}: cn ${before.cn} -> ${after.cn}, total ${before.total} -> ${after.total}`);
}
console.log('changed', changed, '/', Object.keys(PAGES).length);
