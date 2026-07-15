/**
 * Enrich thin tool pages with original guide content:
 * - what it does / how to use / scenarios / FAQ / related tools
 * Idempotent: replaces previous .tool-guide block if present.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!['node_modules', '.git', 'docs', 'screenshots'].includes(e.name)) walk(p, acc);
    } else if (e.isFile() && e.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

function visibleStats(html) {
  const body = (html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i) || ['', html])[1];
  const text = body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const cn = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  return { cn, total: text.length, text };
}

function extractMeta(html, filePath) {
  const title =
    (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [,''])[1]
      .replace(/\s*-\s*WebUtils\s*$/i, '')
      .replace(/\s+/g, ' ')
      .trim() || path.basename(filePath, '.html');
  const h1 =
    (html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || [,''])[1]
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim() || title;
  const desc =
    (html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
      html.match(/<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i) ||
      [,''])[1].trim();
  const parts = filePath.replace(/\\/g, '/').split('/');
  const category = parts.includes('tools') ? parts[parts.indexOf('tools') + 1] : 'tools';
  const slug = path.basename(filePath, '.html');
  return { title, h1, desc, category, slug, rel: path.relative(root, filePath).replace(/\\/g, '/') };
}

const RELATED = {
  life: [
    ['习惯追踪', '/tools/life/habit-tracker.html'],
    ['待办清单', '/tools/life/todo-list.html'],
    ['番茄钟', '/tools/life/pomodoro.html'],
    ['世界时钟', '/tools/life/world-clock.html'],
  ],
  office: [
    ['会议成本计算', '/tools/office/meeting-cost-calculator.html'],
    ['请假天数计算', '/tools/office/leave-calculator.html'],
    ['发票计算器', '/tools/office/invoice-calculator.html'],
    ['工时表', '/tools/office/timesheet.html'],
  ],
  media: [
    ['图片缩放', '/tools/media/image-resize.html'],
    ['图片转 Base64', '/tools/media/image-to-base64.html'],
    ['图片旋转', '/tools/media/image-rotate.html'],
    ['取色器', '/tools/media/color-picker.html'],
  ],
  privacy: [
    ['文件哈希', '/tools/privacy/file-hash.html'],
    ['文本加密', '/tools/privacy/text-encrypt.html'],
    ['EXIF 清除', '/tools/privacy/exif-remover.html'],
    ['随机密钥', '/tools/privacy/random-key.html'],
  ],
  text: [
    ['字数统计', '/tools/text/word-counter.html'],
    ['文本对比', '/tools/text/diff-checker.html'],
    ['去重工具', '/tools/text/duplicate-remover.html'],
    ['简繁转换', '/tools/text/chinese-converter.html'],
  ],
  'team-tools': [
    ['会议议程', '/tools/team-tools/meeting-agenda.html'],
    ['站会计时', '/tools/team-tools/standup-timer.html'],
    ['任务拆解', '/tools/team-tools/task-breakdown.html'],
    ['决策矩阵', '/tools/team-tools/decision-matrix.html'],
  ],
  dev: [
    ['JSON 格式化', '/tools/dev/json-formatter.html'],
    ['正则测试', '/tools/dev/regex-tester.html'],
  ],
  legal: [['隐私政策生成', '/tools/legal/privacy-policy.html']],
  realestate: [['契税计算', '/tools/realestate/deed-tax.html']],
  'social-media': [['社交预览', '/tools/social-media/social-preview.html']],
};

function relatedLinks(category, slug) {
  const list = (RELATED[category] || RELATED.office || []).filter(([, href]) => !href.includes(slug));
  const picks = list.slice(0, 3);
  if (!picks.length) {
    return '<a href="/">返回工具首页</a>';
  }
  return picks.map(([name, href]) => `<a href="${href}">${name}</a>`).join('、');
}

function categoryCopy(category) {
  const map = {
    life: {
      audience: '学生、自由职业者和希望建立稳定作息的个人用户',
      privacy: '打卡与列表数据默认保存在浏览器本地，不会上传到 WebUtils 服务器',
      tip: '建议先从 1–3 个关键习惯或任务开始，避免一次添加过多导致难以坚持',
    },
    office: {
      audience: '行政、人事、销售、项目经理和需要快速产出办公文档的团队成员',
      privacy: '表单内容在浏览器中处理，适合处理不方便上传到第三方平台的草稿信息',
      tip: '导出或复制前请再核对金额、日期、姓名等关键字段，避免模板默认值遗留',
    },
    media: {
      audience: '内容创作者、运营、设计师和需要快速处理图片素材的用户',
      privacy: '图片通常在本地画布中处理，原图不会主动上传到服务器',
      tip: '处理前后建议保留原图备份；导出时注意目标平台对尺寸与格式的要求',
    },
    privacy: {
      audience: '开发者、安全意识较高的用户，以及需要本地处理敏感信息的人',
      privacy: '加密、哈希与脱敏操作在浏览器本地完成，明文不会主动发送到 WebUtils',
      tip: '密钥与原文请自行妥善保存；关闭页面前确认已复制结果',
    },
    text: {
      audience: '写作者、编辑、运营和需要处理中英文文本的开发者',
      privacy: '文本统计与转换在本地完成，适合处理尚未公开发布的文稿',
      tip: '中英文混排时请同时查看字符数、词数与行数，避免只看单一指标',
    },
    'team-tools': {
      audience: '敏捷团队、项目经理、产品经理和需要协作对齐的小组',
      privacy: '会议与任务内容保存在本地会话中，便于快速草稿而不依赖账号体系',
      tip: '先明确目标与参与人，再填写细节，输出会更可执行',
    },
    dev: {
      audience: '前后端开发者与需要快速转换数据结构的工程师',
      privacy: '代码与数据转换在浏览器本地执行',
      tip: '转换后请用目标语言编译器或运行时再验证一次',
    },
    legal: {
      audience: '独立开发者、小团队和需要生成政策草稿的站点运营者',
      privacy: '生成内容仅作模板参考，不构成法律意见',
      tip: '上线前请根据实际业务与法务要求修改条款',
    },
    realestate: {
      audience: '租房、购房决策中需要快速估算费用的用户',
      privacy: '计算在本地完成，输入的金额不会上传',
      tip: '结果为估算值，实际费用以合同与当地政策为准',
    },
    'social-media': {
      audience: '新媒体运营与需要检查分享卡片效果的内容团队',
      privacy: '预览在本地完成，链接元数据按你提供的信息展示',
      tip: '不同平台裁剪比例不同，请同时检查标题长度与图片主体',
    },
  };
  return (
    map[category] || {
      audience: '需要快速完成在线处理的中文用户',
      privacy: '核心处理在浏览器本地完成，输入内容不会主动上传到 WebUtils 服务器',
      tip: '使用前确认输入完整，导出前再次检查结果',
    }
  );
}

function toolSpecific(meta) {
  const { slug, h1, category } = meta;
  const specifics = {
    'habit-tracker': {
      what: `${h1}帮助你把想坚持的习惯拆成可打卡的每日项，并记录连续天数。适合把“早起、阅读、运动、喝水”等目标变成可见进度，而不是只停留在想法里。`,
      steps: [
        '在输入框填写习惯名称，例如“晨间拉伸 10 分钟”',
        '点击添加，习惯会出现在今日列表中',
        '完成当天目标后点击打卡，连续天数会自动累计',
        '若某天未完成，可取消打卡并在次日继续；不需要的习惯可删除',
      ],
      scenarios: [
        '想用最小系统培养 21 天习惯，不需要下载 App',
        '同时跟踪学习、健身、阅读等多个习惯',
        '用连续天数激励自己，减少“今天算了吧”的中断',
      ],
      faqs: [
        ['数据会丢失吗？', '习惯记录保存在当前浏览器本地存储中。清除站点数据或更换设备后可能无法恢复，重要记录请自行备份。'],
        ['可以补打卡吗？', '工具以当天日期为维度记录。若需要补录历史，请以你自己的规则手动调整，或导出后另行存档。'],
        ['适合团队使用吗？', '更适合个人自律。若团队要协同任务，可结合待办清单或任务拆解工具。'],
      ],
    },
    'todo-list': {
      what: `${h1}提供轻量待办管理：快速添加任务、勾选完成、清理已完成项。适合一天内的事务梳理，无需注册账号。`,
      steps: ['输入任务内容并添加', '完成后勾选标记', '可删除单条或清理已完成任务', '按优先级或场景拆分多条短任务'],
      scenarios: ['晨间规划今日 3 件最重要的事', '会议中快速记下 action items', '学习任务拆成可完成的小步骤'],
      faqs: [
        ['和习惯追踪有什么区别？', '待办偏一次性事务；习惯追踪偏重复性行为与连续天数。'],
        ['能同步到手机吗？', '默认不跨设备同步。同一浏览器配置下可保留，换设备需自行迁移。'],
        ['数据是否上传？', '任务内容保存在本地浏览器，不会上传到 WebUtils 服务器。'],
      ],
    },
    pomodoro: {
      what: `${h1}用经典番茄工作法拆分专注与休息：默认专注一段时间后短休息，帮助对抗拖延并保持节奏。`,
      steps: ['设定专注时长与休息时长', '点击开始进入专注倒计时', '结束后按提示休息，再开始下一轮', '可按任务轮次记录今天完成了几个番茄'],
      scenarios: ['写方案、写代码时需要强制专注', '备考复习时避免连续学习过度疲劳', '居家办公时建立可重复的工作节奏'],
      faqs: [
        ['一定要 25 分钟吗？', '不必。可按任务难度调整；深工作可用 45–50 分钟，轻任务可用 15–20 分钟。'],
        ['中途被打断怎么办？', '可暂停或重新开始。频繁中断说明任务粒度可能过大，建议先拆任务。'],
        ['会播放提示音吗？', '以页面实现为准；若浏览器限制自动播放，请保持页面前台。'],
      ],
    },
    notes: {
      what: `${h1}是一个即开即用的便签区，适合快速记下灵感、会议要点或临时信息，不依赖复杂笔记系统。`,
      steps: ['打开页面直接输入文字', '按主题分段或用空行分隔', '需要时复制到正式文档', '不需要的内容可清空后重来'],
      scenarios: ['电话沟通时随手记录要点', '写作前捕捉灵感碎片', '把临时链接、账号备注暂存'],
      faqs: [
        ['会自动保存吗？', '若页面启用了本地存储会保留；否则关闭页面前请复制重要内容。'],
        ['支持 Markdown 吗？', '以当前页面编辑能力为准；复杂排版建议转到 Markdown 编辑器。'],
        ['适合长期知识库吗？', '更适合草稿。长期资料请迁移到正式笔记工具。'],
      ],
    },
    'decision-maker': {
      what: `${h1}通过随机或选项权衡，帮助你在“都行”的小决策里快速推进，减少纠结时间。`,
      steps: ['列出可选方案', '确认选项完整且互斥', '运行选择/随机结果', '结合现实约束做最终决定'],
      scenarios: ['午餐吃什么、周末去哪玩', '两个方案难分高下时做快速破冰', '团队小范围投票前的预演'],
      faqs: [
        ['能替代正式决策吗？', '不能。重大决策仍需数据、成本与风险评估。'],
        ['结果可复现吗？', '随机结果通常不可复现；若需公平抽签，请提前约定规则。'],
        ['选项很多怎么办？', '先删掉明显不可行项，再进入工具，避免噪音选项。'],
      ],
    },
    'world-clock': {
      what: `${h1}同时查看多个城市/时区当前时间，方便跨地区协作与行程安排。`,
      steps: ['选择或添加需要关注的时区', '对照本地时间查看对方工作时段', '安排会议时避开对方深夜', '出行前确认抵达地日期是否跨天'],
      scenarios: ['中美/中欧远程会议排期', '客服对照客户当地时间回复', '出差跨日飞行的时间换算'],
      faqs: [
        ['是否自动处理夏令时？', '以浏览器时区数据库为准；关键会议建议再与对方确认。'],
        ['能看日期吗？', '跨日时请同时关注日期，不只看钟点。'],
        ['数据来自服务器吗？', '时间显示基于本地系统时间与时区换算，不依赖账号登录。'],
      ],
    },
    'word-counter': {
      what: `${h1}实时统计字符数、中文字数、英文词数、标点与行数，适合写稿限字、表单校验和内容发布前自检。`,
      steps: ['粘贴或输入文本', '查看总字数/去空格字数/中英分项', '按平台限制删减或扩展内容', '复制精简后的文本到目标位置'],
      scenarios: ['小红书/微博标题与正文限字', '论文摘要字数检查', '表单“最多 200 字”提交前核对'],
      faqs: [
        ['中英文怎么算？', '中文通常按字计，英文按单词计；请同时看分项指标。'],
        ['空格和换行算吗？', '页面会分别给出含空格与不含空格统计，按你的规则选用。'],
        ['会上传文稿吗？', '统计在本地完成，文稿不会上传到 WebUtils。'],
      ],
    },
    'diff-checker': {
      what: `${h1}对比两段文本差异，快速定位增删改，适合校对文案、配置文件与代码片段。`,
      steps: ['在左侧粘贴原文，右侧粘贴修订稿', '运行对比查看高亮差异', '按差异逐条确认是否为预期修改', '保留最终版本并清理草稿'],
      scenarios: ['合同或公告修订核对', '配置文件版本对比', '翻译前后一致性检查'],
      faqs: [
        ['支持代码对比吗？', '支持纯文本级对比；语法高亮以页面实现为准。'],
        ['超大文件可以吗？', '浏览器性能有限，建议先对比关键片段。'],
        ['差异会保存吗？', '默认不上传；刷新前请自行保存需要的结果。'],
      ],
    },
    'duplicate-remover': {
      what: `${h1}去除重复行或重复项，整理名单、关键词表与日志列表，让数据更干净。`,
      steps: ['粘贴包含重复项的文本', '选择按行或其他分隔方式', '执行去重并查看结果数量变化', '复制去重后的列表'],
      scenarios: ['邮件名单/邀请名单去重', 'SEO 关键词表清理', '日志中重复报错行压缩'],
      faqs: [
        ['大小写不同算重复吗？', '取决于页面是否提供忽略大小写选项；默认通常区分。'],
        ['会打乱顺序吗？', '多数实现保留首次出现顺序；以页面说明为准。'],
        ['能处理 CSV 吗？', '可先按行处理；复杂表格建议先在表格工具中清洗。'],
      ],
    },
    'chinese-converter': {
      what: `${h1}在简体与繁体之间转换文本，方便两岸三地内容发布、字幕处理与文档统一。`,
      steps: ['粘贴待转换文本', '选择简转繁或繁转简', '检查专有名词是否需人工微调', '复制结果到目标文档'],
      scenarios: ['简体文案转繁体发布', '繁体资料统一为简体存档', '字幕与商品标题区域化'],
      faqs: [
        ['用词会完全地道吗？', '字形转换可靠，但用词习惯可能需人工润色。'],
        ['会改动英文和数字吗？', '通常只处理中文汉字，英文数字保持不变。'],
        ['专业术语怎么办？', '品牌名、人名、地名建议转换后人工复核。'],
      ],
    },
    'image-resize': {
      what: `${h1}按目标宽高或比例缩放图片，适合电商主图、头像与社交封面尺寸适配。`,
      steps: ['上传图片', '设置目标宽度/高度或锁定比例', '预览效果', '下载处理后的图片'],
      scenarios: ['店铺主图统一尺寸', '头像裁切前先缩放到合适分辨率', '压缩前先降低边长以减小体积'],
      faqs: [
        ['会不会模糊？', '放大会损失清晰度；优先缩小或接近原图分辨率。'],
        ['支持哪些格式？', '常见 PNG/JPG/WebP，具体以页面提示为准。'],
        ['图片会上传吗？', '处理在本地画布完成，原图不上传到 WebUtils。'],
      ],
    },
    'image-to-base64': {
      what: `${h1}把图片编码为 Base64/Data URI，便于内嵌到 HTML、CSS 或小型配置中。`,
      steps: ['选择图片文件', '生成 Base64 字符串或 Data URI', '复制到代码或配置', '注意体积增大对页面加载的影响'],
      scenarios: ['小图标内嵌减少请求', '邮件模板内嵌简单图片', '演示页不想依赖外部图床'],
      faqs: [
        ['为什么体积变大？', 'Base64 比二进制大约大 33%，不适合大图。'],
        ['能转回图片吗？', '可以，Data URI 可直接在浏览器打开或再解码。'],
        ['安全吗？', '本地编码；但不要把含敏感信息的截图随意粘贴到公开代码库。'],
      ],
    },
    'file-hash': {
      what: `${h1}计算文件摘要（如 MD5/SHA），用于校验下载完整性与版本比对。`,
      steps: ['选择本地文件', '选择哈希算法', '生成摘要并与官方值对比', '不一致时不要继续安装或执行'],
      scenarios: ['校验安装包是否被篡改', '确认两份文件是否完全相同', '发布文件时生成校验和'],
      faqs: [
        ['哈希相同就一定安全吗？', '只能说明内容一致；仍需确认来源可信。'],
        ['大文件算得动吗？', '在浏览器中分块计算，极大文件可能较慢。'],
        ['文件会上传吗？', '哈希在本地计算，文件不会上传到 WebUtils。'],
      ],
    },
    'meeting-scheduler': {
      what: `${h1}帮助跨时区团队寻找更合适的会议时间，减少“你早上我半夜”的沟通成本。`,
      steps: ['添加参会方及所在时区', '查看重叠的可会议时段', '选定候选时间并同步到日历', '发出会议邀请前再次确认夏令时'],
      scenarios: ['中美研发周会', '客户在欧洲的项目同步', '远程面试跨地区排期'],
      faqs: [
        ['需要登录日历吗？', '页面用于协调与预览；最终以你使用的日历工具发出邀请为准。'],
        ['时区会自动变化吗？', '依赖标准时区偏移/浏览器能力，关键会议建议双方确认。'],
        ['可以导出吗？', '可复制结论文本；若页面提供导出则按按钮操作。'],
      ],
    },
    'json-to-go': {
      what: `${h1}将 JSON 样例转换为 Go 结构体字段定义，减少手写样板代码。`,
      steps: ['粘贴合法 JSON', '生成 Go struct', '按需要调整字段名与类型', '放入项目后用 go test/编译验证'],
      scenarios: ['对接第三方 API 快速建模', '把接口响应落到后端结构体', '教学演示 JSON 与类型映射'],
      faqs: [
        ['嵌套对象支持吗？', '支持常见嵌套；极端动态结构可能需手动改成 map 或 interface{}。'],
        ['数字类型准确吗？', 'JSON 数字可能被推断为 float64/int，请按业务再确认。'],
        ['会提交我的 JSON 吗？', '转换在本地执行。'],
      ],
    },
  };

  if (specifics[slug]) return specifics[slug];

  // generic but still tailored by name/category
  const cat = categoryCopy(category);
  return {
    what: `${h1}是 WebUtils 提供的在线${categoryLabel(category)}，面向${cat.audience}。你可以直接在浏览器中完成输入、处理与结果复制，无需安装客户端。${meta.desc ? '页面目标：' + truncate(meta.desc, 80) : ''}`,
    steps: [
      `打开本页，确认标题为“${h1}”且功能符合你的需求`,
      '按页面提示填写输入项、上传文件或调整参数',
      '点击运行/生成/计算等主按钮，查看即时结果',
      '复制、下载或导出结果，并在正式使用前做一次核对',
    ],
    scenarios: [
      `需要快速完成与“${h1}”相关的日常任务，但不想注册新账号`,
      '在桌面或手机浏览器里即开即用，处理完即走',
      '希望数据尽量留在本地，降低不必要的上传风险',
    ],
    faqs: [
      ['这个工具收费吗？', 'WebUtils 工具页可免费使用。为维持站点运营，部分页面可能展示广告。'],
      ['我的输入会上传吗？', cat.privacy + '。请同时阅读站点隐私政策了解 Cookie 与广告相关说明。'],
      ['结果一定准确吗？', '工具提供便捷估算或转换。涉及法律、医疗、财务等关键场景，请以官方规则与专业意见为准。'],
      ['使用建议？', cat.tip + '。'],
    ],
  };
}

function categoryLabel(category) {
  const map = {
    life: '生活效率工具',
    office: '办公效率工具',
    media: '图片与媒体工具',
    privacy: '隐私与安全工具',
    text: '文本处理工具',
    'team-tools': '团队协作工具',
    dev: '开发者工具',
    legal: '法务模板工具',
    realestate: '房产计算工具',
    'social-media': '社媒运营工具',
  };
  return map[category] || '实用工具';
}

function truncate(s, n) {
  const t = String(s || '').trim();
  return t.length <= n ? t : t.slice(0, n - 1) + '…';
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildSection(meta) {
  const spec = toolSpecific(meta);
  const cat = categoryCopy(meta.category);
  const steps = spec.steps.map((s) => `          <li>${escapeHtml(s)}</li>`).join('\n');
  const scenarios = spec.scenarios.map((s) => `          <li>${escapeHtml(s)}</li>`).join('\n');
  const faqs = spec.faqs
    .map(
      ([q, a]) => `        <h3>${escapeHtml(q)}</h3>
        <p>${escapeHtml(a)}</p>`
    )
    .join('\n');
  const related = relatedLinks(meta.category, meta.slug);

  return `
<section class="tool-guide" aria-label="使用指南" style="margin: 2rem auto; max-width: 920px; padding: 1.25rem 1.25rem 1.5rem; border: 1px solid var(--border-subtle, #2a2a3a); border-radius: 12px; background: var(--bg-card, rgba(255,255,255,0.02)); line-height: 1.75; color: var(--text-primary, inherit);">
  <h2 style="font-size: 1.25rem; margin: 0 0 0.75rem;">${escapeHtml(meta.h1)}使用指南</h2>
  <p style="margin: 0 0 1rem; color: var(--text-secondary, inherit);">${escapeHtml(spec.what)}</p>

  <h2 style="font-size: 1.1rem; margin: 1.25rem 0 0.5rem;">如何使用</h2>
  <ol style="margin: 0 0 1rem; padding-left: 1.25rem;">
${steps}
  </ol>

  <h2 style="font-size: 1.1rem; margin: 1.25rem 0 0.5rem;">适用场景</h2>
  <ul style="margin: 0 0 1rem; padding-left: 1.25rem;">
${scenarios}
  </ul>

  <h2 style="font-size: 1.1rem; margin: 1.25rem 0 0.5rem;">使用说明与边界</h2>
  <p style="margin: 0 0 1rem; color: var(--text-secondary, inherit);">${escapeHtml(cat.privacy)}。${escapeHtml(cat.tip)}。本工具面向${escapeHtml(cat.audience)}，结果用于提升效率，不替代专业领域的正式意见。</p>

  <h2 style="font-size: 1.1rem; margin: 1.25rem 0 0.5rem;">常见问题</h2>
${faqs}

  <h2 style="font-size: 1.1rem; margin: 1.25rem 0 0.5rem;">相关工具</h2>
  <p style="margin: 0;">你还可以试试：${related}。更多工具请访问 <a href="/">WebUtils 首页</a>。</p>
</section>
`;
}

function inject(html, section) {
  // remove old generated block
  html = html.replace(/<section class="tool-guide"[\s\S]*?<\/section>\s*/i, '');

  if (/<!--\s*(?:长文\s*)?SEO\s*内容\s*-->/i.test(html)) {
    return html.replace(/<!--\s*(?:长文\s*)?SEO\s*内容\s*-->/i, `<!-- SEO 内容 -->\n${section}`);
  }
  if (/<!--\s*FAQ（GEO 优化）-->/i.test(html)) {
    return html.replace(/<!--\s*FAQ（GEO 优化）-->/i, `${section}\n<!-- FAQ（GEO 优化）-->`);
  }
  if (/<\/main>/i.test(html)) {
    return html.replace(/<\/main>/i, `${section}\n    </main>`);
  }
  if (/<footer\b/i.test(html)) {
    return html.replace(/<footer\b/i, `${section}\n<footer`);
  }
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${section}\n</body>`);
  }
  return html + section;
}

const files = walk(path.join(root, 'tools'));
const thin = [];
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const stats = visibleStats(html);
  if (stats.cn < 200 || stats.total < 400) thin.push(f);
}

let changed = 0;
const report = [];

for (const file of thin) {
  const original = fs.readFileSync(file, 'utf8');
  const meta = extractMeta(original, file);
  const section = buildSection(meta);
  const next = inject(original, section);
  if (next !== original) {
    fs.writeFileSync(file, next, 'utf8');
    changed += 1;
  }
  const after = visibleStats(fs.readFileSync(file, 'utf8'));
  report.push({ file: meta.rel, beforeCn: visibleStats(original).cn, afterCn: after.cn, afterTotal: after.total });
}

const stillThin = report.filter((r) => r.afterCn < 200 || r.afterTotal < 400);
console.log('thin before:', thin.length);
console.log('changed:', changed);
console.log('still thin:', stillThin.length);
if (stillThin.length) {
  stillThin.slice(0, 20).forEach((r) => console.log(r.afterCn, r.afterTotal, r.file));
}
console.log('sample after counts:');
report.slice(0, 10).forEach((r) => console.log(`${r.beforeCn}->${r.afterCn}`, r.file));
