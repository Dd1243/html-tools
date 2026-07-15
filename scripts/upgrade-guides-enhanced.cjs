/**
 * Replace tool-guide sections with enhanced 800-1200 CN-char content.
 * Uses indexOf-based replacement (robust to CRLF/encoding).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const style =
  'margin:2rem auto;max-width:760px;padding:1.35rem 1.4rem 1.6rem;border:1px solid var(--border-color,var(--border,#333));border-radius:12px;line-height:1.8;background:var(--bg-card,rgba(255,255,255,0.02));color:var(--text-primary,inherit)';

function section(inner) {
  return `<section class="tool-guide" aria-label="使用指南" style="${style}">\n${inner}\n</section>`;
}

function cn(html) {
  return (String(html).replace(/<[^>]+>/g, ' ').match(/[\u4e00-\u9fff]/g) || []).length;
}

const GUIDES = {
  'tools/life/habit-tracker.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">习惯追踪完整使用指南</h2>
  <p style="margin:0 0 1rem">「习惯追踪」用来记录你每天是否完成某个重复行为，而不是管理一次性任务。页面顶部显示今天的中文日期；下方输入框可添加习惯；列表中每一项包含：左侧打卡圆圈、习惯名称、火焰连续天数、右侧删除按钮。所有习惯数据保存在浏览器 <code>localStorage</code> 的 <code>habits</code> 键中，主题偏好保存在 <code>theme</code> 键，数据不会上传到 WebUtils 服务器。若你的目标是“把早起、阅读、运动变成可见进度”，这个页面比待办清单更合适。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">页面里真正有什么功能</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>添加习惯：输入名称后点「添加」，或在输入框按 Enter；空名称不会被添加。</li>
    <li>今日打卡：点击左侧圆圈，把今天的日期（格式 <code>YYYY-MM-DD</code>，来自 <code>toISOString().split('T')[0]</code>）写入该习惯的 <code>completedDates</code>。</li>
    <li>取消今日打卡：再次点击圆圈，会从 <code>completedDates</code> 移除今天，并把 <code>streak</code> 减 1（最低为 0）。</li>
    <li>连续天数：右侧火焰旁数字即 <code>streak</code>；今日首次完成时 +1，取消今日时 -1。</li>
    <li>删除习惯：点「×」会从数组中移除整条记录并立即保存。</li>
    <li>主题切换：右上角按钮在浅色/深色间切换，并记住你的选择。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐使用步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>先只添加 1–3 个真正想坚持的习惯，例如「阅读 20 分钟」「拉伸」「不熬夜」。</li>
    <li>每天打开页面，对已完成的习惯点左侧圆圈打卡，确认火焰数字增加。</li>
    <li>如果误点，再点一次即可取消今日打卡并回退连续天数。</li>
    <li>不再需要的习惯直接删除，避免列表过长导致焦虑。</li>
    <li>若换浏览器或清站点数据，请提前自行备份（当前页面无导出按钮）。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">适合谁，不适合谁</h2>
  <p style="margin:0 0 1rem">适合想用极简界面培养个人习惯、不需要账号和社交打卡的人。不适合需要补录历史日期、团队共享进度、或严格按「连续自然日自动断签清零」规则统计的场景——因为本页没有补录入口，也没有按日历重算连续天的逻辑。若你要管理一次性任务，请改用待办事项页面。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">重要边界（请先读）</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><strong>只能操作“今天”</strong>：没有昨天/任意日期补卡界面。</li>
    <li><strong>连续天数不是完整日历算法</strong>：实现是完成今日 +1、取消今日 -1；跨天未打卡时，数值不会自动清零。</li>
    <li><strong>本地存储风险</strong>：无痕模式、清理站点数据、换设备都会丢记录。</li>
    <li><strong>无账号同步</strong>：手机与电脑默认不互通。</li>
    <li><strong>无导出/导入</strong>：目前不能一键备份为文件，重要记录请自行截图或抄写。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">为什么刷新后习惯还在？</h3>
  <p style="margin:0 0 .8rem">因为写入了 <code>localStorage.habits</code>。同一浏览器、同一站点源下会保留。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">可以补昨天的卡吗？</h3>
  <p style="margin:0 0 .8rem">不能。日期判断只使用当天的 <code>today</code> 字符串，没有历史编辑功能。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和「待办事项」有什么区别？</h3>
  <p style="margin:0 0 .8rem">待办是一次性任务勾选；习惯追踪强调“每天是否完成”和连续天数。两者数据键也不同（<code>todos</code> vs <code>habits</code>）。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">数据会上传吗？</h3>
  <p style="margin:0 0 .8rem">习惯内容在浏览器本地保存，页面逻辑不包含上传习惯列表到服务器。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">误删习惯能恢复吗？</h3>
  <p style="margin:0 0 .8rem">页面没有回收站。删除后立即从 <code>habits</code> 数组移除并保存，通常不可恢复。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">跨天后连续天数会自动变 0 吗？</h3>
  <p style="margin:0">不会自动清零。当前实现不会在跨天时扫描“昨天是否打卡”并重置 streak，请按页面真实逻辑理解，不要把它当成严格日历连续算法。</p>
`),

  'tools/life/todo-list.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">待办事项完整使用指南</h2>
  <p style="margin:0 0 1rem">「待办事项」是本地轻量清单：每条任务有 <code>id</code>（时间戳）、<code>text</code>（任务文案）、<code>completed</code>（是否完成）。数据保存在 <code>localStorage</code> 键 <code>todos</code>。页面提供添加、勾选完成、筛选（全部/未完成/已完成）、单条删除、批量清除已完成，以及底部“N 项未完成”统计。任务文案渲染前会经 <code>escapeHtml</code> 转义，降低 HTML 注入风险。它适合“今天要做完哪些事”，不适合“每天重复打卡”。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">界面与真实操作对应关系</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>输入框 placeholder 为「添加新任务...」，点「添加」或按 Enter 调用 <code>addTodo()</code>。</li>
    <li>筛选按钮：<code>setFilter('all'|'active'|'completed')</code>，只影响显示，不删除数据。</li>
    <li>左侧方框：<code>toggleTodo(id)</code> 切换完成状态；完成项带删除线样式。</li>
    <li>右侧「×」：<code>deleteTodo(id)</code> 删除单条。</li>
    <li>「清除已完成」：保留未完成，过滤掉 <code>completed === true</code> 的项。</li>
    <li>空列表时显示「暂无任务」；底部实时显示未完成数量。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐工作流</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>早上先写下今天必须完成的 3 件事，保持条目短而可执行。</li>
    <li>做完就点左侧方框勾选；需要专注未完成时切到「未完成」筛选。</li>
    <li>复盘时切到「已完成」查看成果，再点「清除已完成」保持清单干净。</li>
    <li>过期或取消的任务用「×」删除，避免和真实待办混在一起。</li>
    <li>若任务其实是每日习惯，请改放到习惯追踪，避免待办无限膨胀。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">适用场景</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>个人今日待办、购物清单、学习任务拆解</li>
    <li>会议中快速记录 action items（会后逐项勾掉）</li>
    <li>不想注册 Todo 应用，只在当前浏览器暂存任务</li>
    <li>把大任务拆成多条短任务，降低启动阻力</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界与限制</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>没有截止日期、优先级字段、子任务或提醒推送。</li>
    <li>没有云同步；换设备不会自动带上 <code>todos</code>。</li>
    <li>清除站点数据会丢失全部任务。</li>
    <li>筛选状态存在内存变量 <code>filter</code>，刷新后回到默认「全部」。</li>
    <li>没有拖拽排序、标签分组或共享协作。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">空任务能添加吗？</h3>
  <p style="margin:0 0 .8rem">不能。 <code>addTodo()</code> 会对输入 <code>trim()</code>，空字符串直接 return。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和习惯追踪如何选择？</h3>
  <p style="margin:0 0 .8rem">一次性事务用待办；每天重复的行为用习惯追踪。例如「提交周报」是待办，「每天写日记」是习惯。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">任务里写 HTML 会执行吗？</h3>
  <p style="margin:0 0 .8rem">展示时通过转义处理，通常会当纯文本显示，而不是当标签执行。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">「清除已完成」能撤销吗？</h3>
  <p style="margin:0 0 .8rem">不能。执行后立即写回 localStorage，页面无撤销栈。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">数据存在哪？</h3>
  <p style="margin:0 0 .8rem">当前站点源下的浏览器本地存储键 <code>todos</code>，不会作为任务内容上传到服务器逻辑中。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">为什么刷新后筛选又回到“全部”？</h3>
  <p style="margin:0">因为筛选条件没有持久化，只保存在页面运行时的 <code>filter</code> 变量里；任务数据本身仍会保留。</p>
`),

  'tools/life/pomodoro.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">番茄钟完整使用指南</h2>
  <p style="margin:0 0 1rem">本页实现经典番茄节奏的三种固定时长：工作 25 分钟、短休息 5 分钟、长休息 15 分钟（代码中为 <code>times.work/short/long</code> 秒数）。主按钮在「开始 / 暂停 / 继续」之间切换；「重置」会停表并恢复当前模式的完整时长。只有在<strong>工作模式</strong>倒计时结束时，「完成番茄」计数才会 +1。结束后会尝试播放内嵌 WAV 提示音，并弹出 <code>alert</code> 文案。它适合强制分段专注，不提供自定义分钟与历史统计报表。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">控件说明</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>模式标签：显示「工作时间 / 短休息 / 长休息」。</li>
    <li>大号计时器：以 <code>mm:ss</code> 显示剩余秒数。</li>
    <li>「开始」：启动 <code>setInterval</code> 每秒减 1；运行中按钮变为「暂停」。</li>
    <li>暂停后再点：按钮显示「继续」，从剩余时间接着走，不是重新 25:00。</li>
    <li>「重置」：清除 interval，<code>timeLeft</code> 回到当前模式全长，按钮恢复「开始」。</li>
    <li>底部三项：点选切换模式；切换时会停止计时并重载该模式时长。</li>
    <li>完成番茄：仅 work 模式归零时 <code>count++</code>；该计数在内存中，刷新归零。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐用法</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>开始前先写清这一轮只做一件事，再点「工作 25分」→「开始」。</li>
    <li>中途被打断可点「暂停」；处理完点「继续」。</li>
    <li>工作结束出现「休息一下!」后，改选「短休 5分」或「长休 15分」。</li>
    <li>连续多个番茄后，用页面上的完成数做粗略产出记录（注意刷新会丢）。</li>
    <li>若需要严格统计全天番茄，请另外记录，因本页不持久化 count。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">适用场景</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>写代码、写方案、改文档时强制分段专注</li>
    <li>备考复习，用短休息降低连续疲劳</li>
    <li>居家办公需要一个可见的倒计时节奏器</li>
    <li>容易拖延时，用 25 分钟降低启动成本</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界与限制</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>时长固定 25/5/15，没有自定义分钟输入。</li>
    <li>提示音可能被浏览器自动播放策略拦截；失败时被 <code>catch</code> 忽略，但仍有 alert。</li>
    <li>标签页在后台时，部分浏览器会节流定时器，倒计时可能略不准。</li>
    <li>主题可本地保存；完成番茄数不保存。</li>
    <li>没有任务绑定：计时器不记录你在做什么，需要自己配合待办使用。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">可以改成 50 分钟吗？</h3>
  <p style="margin:0 0 .8rem">当前版本不行，只能三档固定模式。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">短休结束会计入完成番茄吗？</h3>
  <p style="margin:0 0 .8rem">不会。代码判断 <code>if (mode === "work") count++</code>，休息模式结束只提示「继续工作!」。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">暂停和重置有什么区别？</h3>
  <p style="margin:0 0 .8rem">暂停保留剩余时间；重置回到该模式的完整时长并停止。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">切换模式会怎样？</h3>
  <p style="margin:0 0 .8rem">会清掉正在跑的 interval，把剩余时间设为新模式全长，按钮回到「开始」。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">没声音正常吗？</h3>
  <p style="margin:0 0 .8rem">正常。很多浏览器限制无手势自动播放音频；请以弹窗提示为准，或保持页面在前台并先手动点过开始。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">完成后计数刷新还在吗？</h3>
  <p style="margin:0">不在。完成数只存在内存变量 <code>count</code>，刷新页面会归零；主题设置才会写入 localStorage。</p>
`),

  'tools/life/notes.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">便签笔记完整使用指南</h2>
  <p style="margin:0 0 1rem">「便签笔记」是卡片式本地笔记墙，不是单页大记事本。每条笔记包含：<code>id</code>、<code>title</code>、<code>content</code>、<code>color</code>、<code>date</code>（ISO 时间）。数据保存在 <code>localStorage.notes</code>。你可以通过弹窗新建/编辑，用顶部搜索框按标题或内容过滤，并在卡片上编辑或删除。颜色提供多种预设，用于视觉分类。它适合短而碎的信息，不适合当长期知识库或团队共享文档。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">功能对照</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>「+ 新建笔记」：打开弹窗，标题显示「新建笔记」。</li>
    <li>弹窗字段：标题输入、内容多行文本、颜色选择器、「取消」「保存」。</li>
    <li>保存规则：标题和内容都为空则直接 return，不创建空笔记；只要有一项非空即可保存。</li>
    <li>新建笔记会 <code>unshift</code> 到数组前面，最新笔记优先显示。</li>
    <li>搜索：对 <code>title</code>/<code>content</code> 做不区分大小写的 includes 过滤。</li>
    <li>编辑：点铅笔调用 <code>editNote(id)</code>，弹窗标题变为「编辑笔记」。</li>
    <li>删除：点垃圾桶后确认，确认才删除。</li>
    <li>无标题时卡片显示「无标题」；内容与标题均经转义展示，降低注入风险。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐使用步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>点新建，写短标题（如「周一会议」），正文写要点，选一个颜色分类。</li>
    <li>保存后在网格中确认卡片出现在最前。</li>
    <li>笔记多了用顶部搜索过滤关键词。</li>
    <li>需要改内容时点铅笔；废弃内容点删除并确认。</li>
    <li>重要长期资料请迁移到正式笔记软件，本页只做速记层。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">适用场景</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>灵感碎片、电话记录、临时链接与待查事项</li>
    <li>用颜色区分工作/生活/学习便签</li>
    <li>需要本机快速检索，但不想上复杂笔记软件</li>
    <li>会议中随手记，会后再整理到正式文档</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界说明</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>没有 Markdown 预览、附件、文件夹或多端同步。</li>
    <li>删除需确认，但确认后不可恢复。</li>
    <li>搜索词存在内存 <code>searchTerm</code>，刷新后清空过滤条件（数据仍在）。</li>
    <li>本地存储容量有限，不适合当海量知识库。</li>
    <li>没有标签系统与按颜色筛选按钮，颜色仅视觉提示。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">为什么保存没反应？</h3>
  <p style="margin:0 0 .8rem">若标题和内容都为空，<code>saveNote()</code> 会直接返回。至少填写一项。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">支持 Markdown 吗？</h3>
  <p style="margin:0 0 .8rem">不支持渲染。内容按纯文本转义显示。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">搜索区分大小写吗？</h3>
  <p style="margin:0 0 .8rem">不区分。标题与内容都会转成小写后再匹配。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">颜色有什么用？</h3>
  <p style="margin:0 0 .8rem">仅视觉分类，卡片顶部色条展示；没有按颜色筛选的单独按钮。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">数据会上传吗？</h3>
  <p style="margin:0 0 .8rem">笔记保存在本地 <code>notes</code> 键，页面用途是本地速记，不提供账号云同步。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">只有标题没有正文可以吗？</h3>
  <p style="margin:0">可以。只要标题或内容其一非空即可保存；卡片无标题时会显示「无标题」占位。</p>
`),

  'tools/text/word-counter.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">字数统计完整说明与指标口径</h2>
  <p style="margin:0 0 1rem">本工具在文本框 <code>#text-input</code> 中实时统计六项指标：总字符数、总字数(不含空格)、中文字数、英文单词数、标点符号、行数。输入变化会触发 <code>updateStats()</code>，并把原文自动保存到 <code>localStorage.word_counter_content</code>。操作按钮包括「复制统计结果」「清空内容」「粘贴文本」。统计在浏览器本地完成，适合发文前限字自检。不同平台对“字数”定义不同，请按下面口径对照使用，不要只看一个数字。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">每项数字怎么算（与代码一致）</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><strong>总字符数</strong>：<code>text.length</code>，含空格、换行、标点。</li>
    <li><strong>总字数(不含空格)</strong>：去掉所有空白后的长度。</li>
    <li><strong>中文字数</strong>：匹配汉字范围的字符个数。</li>
    <li><strong>英文单词数</strong>：匹配字母/数字/连字符片段的个数，不是按字母个数。</li>
    <li><strong>标点符号</strong>：非汉字、非字母数字、非空白的字符个数（粗略口径）。</li>
    <li><strong>行数</strong>：有内容时按换行分割后的段数；空文本为 0。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">操作步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>直接输入，或点「粘贴文本」调用剪贴板 API；若权限失败会提示改用 Ctrl+V。</li>
    <li>查看六宫格指标；中英混排时分别看中文字数与英文单词数。</li>
    <li>点「复制统计结果」获得汇总文本（含六项数字与来源说明）。</li>
    <li>点「清空内容」需确认；确认后清空输入、刷新统计并删除本地缓存键。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">适用场景</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>微博/小红书/广告文案限字</li>
    <li>表单“最多 N 字”提交前检查</li>
    <li>中英文摘要分别估算汉字与英文词量</li>
    <li>编辑排版时粗看标点与行数密度</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">口径差异提醒</h2>
  <p style="margin:0 0 1rem">有的平台算标点，有的不算空格，有的英文按单词。本页把多种口径并列显示。emoji 与特殊符号可能被计入标点。若平台规则不透明，建议以“不含空格字数 + 中文字数”双重核对。复制统计结果便于把口径一并发给协作方，减少“你我数字对不上”的沟通成本。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">为什么刷新后文本还在？</h3>
  <p style="margin:0 0 .8rem">因为自动写入 <code>word_counter_content</code>。只有清空并确认才会 removeItem。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">英文缩写或带连字符的词怎么算？</h3>
  <p style="margin:0 0 .8rem">按字母数字连字符片段整段计为 1 个单词，例如 <code>state-of-the-art</code> 通常计 1。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">粘贴按钮失败怎么办？</h3>
  <p style="margin:0 0 .8rem">浏览器可能拒绝剪贴板权限。按提示使用 Ctrl+V / Command+V 即可。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">会上传文稿吗？</h3>
  <p style="margin:0 0 .8rem">统计与本地缓存都在浏览器内完成，逻辑上不需要把正文发到服务器计算。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">复制结果包含什么？</h3>
  <p style="margin:0 0 .8rem">包含六项指标的纯文本汇总，以及分析工具来源说明，便于粘贴到沟通记录。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">空文本时各项是多少？</h3>
  <p style="margin:0">空文本时各指标应为 0，行数也为 0；输入任意字符后才会开始累计。</p>
`),

  'tools/text/diff-checker.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">文本对比完整使用指南</h2>
  <p style="margin:0 0 1rem">「在线文本对比」比较两段文本的行级差异。左侧为原始文本 Text A，右侧为修改后文本 Text B。点击「开始比对差异」后，脚本把两边按换行拆成行数组，用 LCS（最长公共子序列）思想生成新增/删除/未变行，并显示「行新增 / 行删除 / 行未变」计数。结果支持「统一视图」与「分屏视图」，也可「加载代码示例」或「清空内容」。请注意：这是行级 diff，不是 IDE 那种词级/字符级高亮。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">功能点对照</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>开始比对：读取 A/B 文本并渲染结果区。</li>
    <li>统计徽章：新增、删除、相同行数量。</li>
    <li>统一视图：单列按类型着色展示 diff 行。</li>
    <li>分屏视图：左右栏对照，删除行在左、新增行在右，未变行双侧对齐。</li>
    <li>加载示例：填入预设代码样例，便于快速体验。</li>
    <li>清空：清除输入与结果。</li>
    <li>展示文本会做 HTML 转义，降低把代码当标签插入的风险。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>把旧版粘贴到左侧，新版粘贴到右侧（保持相近换行结构更易读）。</li>
    <li>点「开始比对差异」，先看三色统计是否符合预期改动量。</li>
    <li>大段重构用统一视图扫变更类型；逐行核对用分屏视图。</li>
    <li>确认无误删/误加后，把最终文本复制回编辑器；需要演示再点示例按钮。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">适用场景</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>公告、合同条款、运营文案修订对照</li>
    <li>配置文件、脚本片段、JSON 文本的行级变化</li>
    <li>翻译前后段落是否对齐、是否漏段</li>
    <li>代码评审前先快速看改了哪些行</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">关键限制（避免误用）</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><strong>行级 diff，不是字符级</strong>：一行里只改一个词，整行常显示为删旧+增新。</li>
    <li>LCS 复杂度随行数上升，上千行可能变慢，建议先对比关键片段。</li>
    <li>空白差异也算差异：多一个空格/空行都会体现。</li>
    <li>结果默认在内存中，刷新后需重新比对。</li>
    <li>不支持直接上传 Word/PDF 二进制，请先复制纯文本。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">为什么只改了半行，却显示整行删除和新增？</h3>
  <p style="margin:0 0 .8rem">因为算法以行为单位对齐，不提供词级/字符级高亮。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">统一视图和分屏怎么选？</h3>
  <p style="margin:0 0 .8rem">快速浏览变更类型用统一视图；左右对照阅读用分屏。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能对比 Word 文档吗？</h3>
  <p style="margin:0 0 .8rem">请先复制纯文本。本工具处理的是文本框中的字符串，不是 docx 二进制。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">数据会上传吗？</h3>
  <p style="margin:0 0 .8rem">比对在浏览器本地执行，适合处理未公开文稿。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">超大日志文件卡顿怎么办？</h3>
  <p style="margin:0 0 .8rem">先截取相关行段再比；或先在编辑器过滤后再粘贴，降低行数。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">空行和空格会算差异吗？</h3>
  <p style="margin:0">会。任何行内容不同都会体现为新增/删除；整理格式前请预期统计数字可能偏大。</p>
`),

  'tools/text/duplicate-remover.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">文本去重完整规则说明</h2>
  <p style="margin:0 0 1rem">本工具按<strong>行</strong>去除重复内容：把左侧原始文本按换行拆分，保留第一次出现的行，输出到右侧只读结果框。选项包括：忽略大小写、去除首尾空格（默认开启）、移除空行（默认开启）、排序输出（默认关闭）。统计区显示原始行数、保留行数、移除重复数、重复率。输入内容会尝试保存到 <code>localStorage.duplicate_remover_content</code>，便于刷新恢复。它适合名单与关键词清洗，不是句内分词去重器。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">选项如何影响结果</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><strong>忽略大小写</strong>：比较时不区分 <code>Apple</code> 与 <code>apple</code>；保留的是首次出现的原始写法。</li>
    <li><strong>去除首尾空格</strong>：比较与输出前对每行 trim（默认开），避免“同词不同空格”被当成不同行。</li>
    <li><strong>移除空行</strong>：空行不进入唯一列表（默认开）。</li>
    <li><strong>排序输出</strong>：去重后再排序；关闭时尽量保持首次出现顺序。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">操作步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>把名单、关键词或日志粘贴到「原始文本」。</li>
    <li>按需求勾选四个选项，观察右侧结果与底部统计变化。</li>
    <li>确认保留行数符合预期后，点「复制结果」。</li>
    <li>可用「加载示例」试功能；「清空内容」重置输入输出与相关缓存。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">适用场景</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>邮件列表、邀请名单、中奖名单去重</li>
    <li>SEO 关键词表、标签表、SKU 列表清洗</li>
    <li>日志中重复报错行压缩，便于人工扫读</li>
    <li>问卷开放题整理前先去掉完全重复回答</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">容易误解的点</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>这是<strong>行去重</strong>，不是句内词去重；一行里重复单词不会单独剔除。</li>
    <li>CSV 多列复杂表请先在表格工具处理；本页按纯文本行处理。</li>
    <li>重复率用于观察冗余比例，具体计算以页面统计函数为准。</li>
    <li>不可见字符、全角空格可能导致“看起来一样却不去重”。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">为什么两行看起来一样却没被去掉？</h3>
  <p style="margin:0 0 .8rem">可能有不可见字符、全角空格，或未开启「去除首尾空格/忽略大小写」。先打开 trim 与 ignoreCase 再试。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">会打乱顺序吗？</h3>
  <p style="margin:0 0 .8rem">默认保留首次出现顺序；只有勾选「排序输出」才排序。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">数据保存在哪？</h3>
  <p style="margin:0 0 .8rem">输入可写入 <code>duplicate_remover_content</code>；清空时会移除该键。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能按逗号分隔的词去重吗？</h3>
  <p style="margin:0 0 .8rem">当前逻辑按换行拆分。请先把逗号替换成换行，再粘贴处理。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">会上传名单吗？</h3>
  <p style="margin:0 0 .8rem">去重在本地完成，适合处理含邮箱/手机号等敏感名单草稿。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">保留的是第一次还是最后一次？</h3>
  <p style="margin:0">保留第一次出现的行。后续重复行会被丢弃，不会用后面的版本覆盖前面的写法。</p>
`),

  'tools/text/chinese-converter.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">中文简繁转换完整使用指南</h2>
  <p style="margin:0 0 1rem">本页提供简体与繁体双向转换：按钮「简体 → 繁体」「繁体 → 简体」，以及「交换文本」「复制结果」「清空内容」。左侧为输入框，右侧为只读输出；两侧显示字数。转换在浏览器本地用内置映射表完成，输入可缓存到 <code>localStorage.chinese_converter_content</code>。它主要解决字形转换，不等于自动改成台湾/香港全部用语习惯，更不是中英翻译工具。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">按钮与行为</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>简体 → 繁体：把输入映射为繁体字形写入输出框。</li>
    <li>繁体 → 简体：反向映射。</li>
    <li>交换文本：把输出与输入对调，便于连续处理。</li>
    <li>复制结果：复制输出框内容。</li>
    <li>清空内容：清空文本，并移除本地缓存键。</li>
    <li>输入变化会更新计数，并尝试自动保存草稿。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐流程</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>粘贴待转换中文（可含英文、数字、标点）。</li>
    <li>选择正确方向按钮，检查输出是否符合目标地区字形。</li>
    <li>对品牌名、人名、地名做人工复核。</li>
    <li>点复制结果用于发布；需要反向再处理时用交换文本。</li>
    <li>若目标是用语本地化，请在字形转换后再人工润色。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">适用场景</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>简体运营文案转繁体投放</li>
    <li>繁体资料统一为简体存档</li>
    <li>字幕、商品标题、帮助文档的区域字形切换</li>
    <li>两岸三地协作时快速统一文稿字形</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">质量边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>以字库映射为主，一词多形/地区用词可能需人工润色。</li>
    <li>英文、数字通常保持不变。</li>
    <li>专业术语、商标请转换后校对。</li>
    <li>不是翻译工具：不会把中文译成英文。</li>
    <li>不能保证“软件界面术语”完全符合各地习惯。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">转换后用语不够“台湾腔”怎么办？</h3>
  <p style="margin:0 0 .8rem">这是预期现象。请在字形转换后再做用词本地化，例如软件界面术语差异。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">为什么刷新后输入还在？</h3>
  <p style="margin:0 0 .8rem">草稿写入了 <code>chinese_converter_content</code>；清空会移除。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">可以只转换部分选区吗？</h3>
  <p style="margin:0 0 .8rem">当前是整框转换。请先把需要转换的片段单独粘贴处理。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">会上传文案吗？</h3>
  <p style="margin:0 0 .8rem">转换在本地完成，适合处理未发布文案。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和“翻译”有何不同？</h3>
  <p style="margin:0 0 .8rem">它改的是中文内部字形体系，不负责跨语言翻译或语气重写。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">专有名词出错怎么处理？</h3>
  <p style="margin:0">转换后人工改回标准写法。品牌与人名优先遵循官方用字，不要只依赖自动映射。</p>
`),

  'tools/privacy/file-hash.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">文件哈希校验完整使用指南</h2>
  <p style="margin:0 0 1rem">本工具在浏览器本地计算文件摘要，展示并复制 <strong>MD5、SHA-1、SHA-256、SHA-512</strong> 四种结果。你可以通过拖拽区或文件选择器选择文件进行本地读取。计算过程显示进度；完成后可在验证框粘贴官方哈希，点「验证」比对是否一致。页面强调本地计算，适用于安装包完整性核对与同文件比对。哈希相同只说明内容一致，不证明来源可信，也不能替代杀毒与签名校验。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">界面模块</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>上传区 drop zone：拖拽或点击选择文件，显示文件名与大小元信息。</li>
    <li>进度条：大文件计算时展示进度文本。</li>
    <li>哈希结果卡：四类算法各有值与「复制」按钮。</li>
    <li>校验区：粘贴期望哈希，验证匹配结果。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>从官网复制公布的 SHA-256（或站点提供的算法）备用。</li>
    <li>在本页选择刚下载的文件，等待四种哈希出齐。</li>
    <li>复制对应算法值，或粘贴官方值到验证框执行验证。</li>
    <li>不一致则不要安装/解压，重新下载并检查来源。</li>
    <li>发布文件时，优先对外公布 SHA-256/SHA-512，而不是只给 MD5。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">适用场景</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>校验 ISO/安装包/浏览器扩展包是否与公布摘要一致</li>
    <li>确认两个路径下的文件内容是否完全相同</li>
    <li>发布文件时生成校验和给下载用户</li>
    <li>备份前后核对大文件是否完整拷贝</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">安全边界（必读）</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>哈希相同只说明内容一致，不证明来源可信。</li>
    <li>MD5/SHA-1 已不适合作为抗碰撞的安全首选；完整性场景优先 SHA-256/512。</li>
    <li>本工具不做杀毒、不做签名证书校验。</li>
    <li>极大文件受设备内存与浏览器性能影响，可能较慢。</li>
    <li>验证时注意算法名称与字符串首尾空格，避免误判。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">文件会上传到 WebUtils 吗？</h3>
  <p style="margin:0 0 .8rem">设计目标是本地计算。请在可信网络与最新页面使用；哈希过程不需要登录。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">为什么同时给出 MD5？</h3>
  <p style="margin:0 0 .8rem">不少软件站仍公布 MD5/SHA-1。为兼容对照而保留，新场景请优先 SHA-256。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">验证失败一定是被篡改吗？</h3>
  <p style="margin:0 0 .8rem">也可能是下错架构版本、复制哈希时多了空格、或官网给的是另一种算法。先确认算法名与字符串首尾空白。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能一次算多个文件吗？</h3>
  <p style="margin:0 0 .8rem">当前交互以单文件选择/拖拽为主，请逐个处理。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">哈希能当加密用吗？</h3>
  <p style="margin:0 0 .8rem">不能替代加密。哈希是单向摘要，用于校验，不是保密传输方案。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">SHA-256 和 SHA-512 怎么选？</h3>
  <p style="margin:0">两者都可用于完整性校验。若官网公布哪种就对哪种；自己发布时 SHA-256 兼容性更好，SHA-512 摘要更长。</p>
`),

  'tools/media/image-resize.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">图片尺寸修改完整使用指南</h2>
  <p style="margin:0 0 1rem">本工具在浏览器中用 <code>FileReader</code> + <code>canvas</code> 缩放图片，并展示原始体积/尺寸、结果体积/尺寸与压缩率。预览区支持点击/拖拽上传，提示支持 PNG、JPG、WebP。主操作按钮为：「下载处理后的图片」「刷新预览」「清空内容」。另有比例或固定尺寸相关预设。处理在本地完成，适合快速改边长，不是专业 RAW/分层修图软件，也不会凭空提升放大后的真实细节。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">界面与操作对应</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>统计条：原始大小/尺寸、结果大小/尺寸、压缩率。</li>
    <li>预览容器：未上传时显示占位提示；上传后显示主图预览。</li>
    <li>刷新预览：按当前宽高设置重绘 canvas 并更新结果体积估算。</li>
    <li>下载：导出处理后的图片。</li>
    <li>清空：复位预览、禁用下载/预览按钮，并清空文件选择。</li>
    <li>非图片文件会被忽略，只有 <code>image/*</code> 类型进入处理流程。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>上传原图，先看原始尺寸是否远大于目标平台要求。</li>
    <li>设定目标宽高或使用预设；需要保比例时使用对应锁定/比例选项。</li>
    <li>点「刷新预览」确认构图与清晰度，再看结果体积是否下降。</li>
    <li>满意后下载；若需重来点清空再上传。</li>
    <li>正式发布前，在目标平台再预览一次，确认裁切与压缩策略符合规范。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">适用场景</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>电商主图、头像、社交媒体封面统一尺寸</li>
    <li>上传前先缩小边长，辅助减小文件体积</li>
    <li>给文档/网页快速导出指定分辨率预览图</li>
    <li>批量前先单张试参数，确认比例与清晰度</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">画质与格式边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>放大不会凭空增加真实细节，容易发糊。</li>
    <li>多次有损重编码（尤其 JPEG）会累积画质损失；尽量基于原图一次导出。</li>
    <li>透明通道是否保留取决于导出格式与实现（PNG 更适合透明图）。</li>
    <li>超大图受浏览器内存限制，可能失败或很慢。</li>
    <li>HEIC 等格式取决于浏览器解码能力，可能需先转换。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">图片会上传服务器吗？</h3>
  <p style="margin:0 0 .8rem">处理链路基于本地读取与 canvas 导出，不需要登录上传修图。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">为什么体积没变小？</h3>
  <p style="margin:0 0 .8rem">若只改一点尺寸或导出格式本身更大，体积可能变化不明显。优先减小边长，再考虑格式。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">支持 HEIC 吗？</h3>
  <p style="margin:0 0 .8rem">取决于浏览器是否能解码该类型。页面明确提示常见 PNG/JPG/WebP；HEIC 可能需先转换。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">下载按钮为什么是灰的？</h3>
  <p style="margin:0 0 .8rem">未成功加载图片前，下载与预览按钮为 disabled，需要先上传有效图片。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能批量处理文件夹吗？</h3>
  <p style="margin:0 0 .8rem">当前是单图交互流程。批量需求请逐张处理，或使用专门的批量工具。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">放大后能更清晰吗？</h3>
  <p style="margin:0">不能指望自动变清晰。需要更高清晰度应使用更高分辨率原图，而不是简单放大导出。</p>
`),
};

function replaceGuide(html, newGuide) {
  const marker = 'class="tool-guide"';
  const idx = html.indexOf(marker);
  if (idx < 0) throw new Error('tool-guide not found');
  const start = html.lastIndexOf('<section', idx);
  const end = html.indexOf('</section>', idx);
  if (start < 0 || end < 0) throw new Error('section bounds not found');
  return html.slice(0, start) + newGuide.trim() + html.slice(end + '</section>'.length);
}

let ok = 0;
const bad = [];
for (const [rel, guide] of Object.entries(GUIDES)) {
  const file = path.join(root, rel);
  const original = fs.readFileSync(file, 'utf8');
  const next = replaceGuide(original, guide);
  const guideCn = cn(guide);
  fs.writeFileSync(file, next, 'utf8');
  console.log(`${rel}: guideCn=${guideCn}`);
  if (guideCn < 800 || guideCn > 1300) bad.push([rel, guideCn]);
  ok += 1;
}
console.log('upgraded', ok);
if (bad.length) {
  console.log('OUT_OF_RANGE');
  bad.forEach(([r, c]) => console.log(c, r));
  process.exitCode = 2;
} else {
  console.log('ALL_IN_RANGE_800_1300');
}
