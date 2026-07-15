/**
 * Batch 3 boost: append tool-specific paragraphs to reach 800–1200 CN.
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const APPEND = {
  'tools/team-tools/retrospective.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">会议节奏与卡片写法</h2>
  <p style="margin:0 0 1rem">建议时长 30–60 分钟：前 5 分钟静默写卡，10–15 分钟按票数讨论，最后把可执行行动写进行动列并指定负责人（可在卡片正文写 @姓名 + 日期）。卡片尽量写「可观察事实 + 影响」，例如「发布流水线失败 3 次导致演示延期」，避免空泛抱怨。主持人字段与冲刺标题会进入导出 Markdown，方便归档到知识库。若团队情绪紧张，可先用 Mad Sad Glad 释放情绪，再切 Start Stop Continue 收敛行动；帆船模板适合谈推动力与风险并存的阶段。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">状态键与协作注意</h2>
  <p style="margin:0 0 1rem">看板正文数据在 <code>retro-tool-data-v2</code>；主题在 <code>theme</code>。同浏览器多标签同时编辑可能互相覆盖，复盘会建议只开一个标签投屏。分享链接适合会后同步快照，不是实时 OT 协作。清空看板前先导出；公共电脑结束请清空并避免写入真实绩效差评原文。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">和站内其他团队工具配合</h2>
  <p style="margin:0">回顾产出的行动项可拆到任务拆解/待办；多方案抉择用决策矩阵；站会计时用 standup 计时器。本页专注结构化复盘收集与投票，不发送日历邀请，也不做燃尽图。</p>
`,
  'tools/office/barcode-label.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">打印与扫码实测清单</h2>
  <p style="margin:0 0 1rem">下载前先在屏幕上用手机扫一版确认内容正确，再 100% 比例打印。标签纸尽量哑光；过塑反光会降低识别率。条宽从 2 起调：物流远距离扫可加高 <code>bcHeight</code>；窄标签则略降条宽但需复测。明文显示便于人工复核入库，但若标签极窄可关闭 <code>bcShowText</code> 只保留条码。清空会恢复示例 <code>WEBUTILS-2024</code> 与默认宽高，避免残留上一次客户单号在公共电脑上。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">字符与编码限制再说明</h2>
  <p style="margin:0 0 1rem">实现走 CODE128 Start B 与 pattern 表，校验和按位置加权。控制字符与中文不在常规可映射区时会被折叠处理，可能导致扫出来不是你期望的语义——请改用纯 ASCII 业务编码（如内部 SKU）。本页不生成 EAN-13 校验位商品码，也不做批量 CSV 导入；多码请循环改内容下载。与二维码工具分工：一维码适合货架扫枪，二维码适合 URL 与更长载荷。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">故障排查</h2>
  <p style="margin:0">画布空白：检查内容是否为空。扫码乱码：检查是否含全角字符。打印发虚：关闭浏览器缩放、使用更高 DPI 设置。需要矢量无限缩放时，当前导出是 PNG 光栅，可截取更大条宽再缩印，或改用专业条码套件。</p>
`,
  'tools/office/gantt-chart.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">排期建模建议</h2>
  <p style="margin:0 0 1rem">先写里程碑级任务（需求冻结、开发、联调、上线），再拆并行条。开始/结束用真实日历日，避免用同一天表示整周工作导致条过短。颜色按添加顺序循环调色板，仅作视觉区分，不代表优先级。周末单元格有样式提示，但不会自动跳过工期——是否含周末由你填的日期决定。分享前检查 hash 是否过长：任务极多时 URL 可能不便分享，可改为导出图片。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">本地与链接双通道</h2>
  <p style="margin:0 0 1rem">键名 <code>gantt_chart_data_v2</code> 存当前浏览器；<code>updateUrl</code> 同步 hash。打开带 hash 的链接会优先解析远程快照，适合评审会投屏。注意：hash 可被转发，勿写入薪资、未公开客户名等敏感字段。导出高清依赖 html2canvas，若按钮无响应检查网络是否加载到 CDN 脚本。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">不适合什么</h2>
  <p style="margin:0">关键路径、资源冲突、基线对比、进度百分比自动计算都不在本页范围。需要这些请用专业 PM 工具；本页定位是「五分钟画出时间条给会议对齐」。</p>
`,
  'tools/office/meeting-cost-calculator.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">时薪怎么估更靠谱</h2>
  <p style="margin:0 0 1rem">粗算法：月薪 ÷ 21.75 ÷ 8；若强调公司全成本，可再乘 1.3–1.5 覆盖社保与管理摊销。外部顾问按合同小时费率填。人数只保留「必须在场」角色，旁听改为会后纪要，往往比纠结费率更能降本。开始前用统计区的每分钟成本做心理预期：若每分钟已超过某阈值，议程必须更狠。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">会议中用法</h2>
  <p style="margin:0 0 1rem">主持人投屏成本数字；跑题时不必说教，看一眼累计金额即可。中途有人离开可删参会者或把时薪改 0，但注意这只影响之后每秒增量的基数（已过秒数不会回溯重算历史——费用按当前合计时薪×已过秒数模型，调整名单会改变后续增速与当前快照算法，解读时以「当下估算」为准）。重置会清计时，不自动清空名单，方便连续开下一场。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">管理闭环</h2>
  <p style="margin:0">把「会议成本」与「形成的决策/文档」一起记到周报，连续几周高成本低产出就应改异步。本页不连接日历，也不存储历史会议曲线；需要存档请截图。隐私上时薪是敏感信息，公共投屏可用角色名代替真名。</p>
`,
  'tools/media/image-pixelate.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">隐私打码实操</h2>
  <p style="margin:0 0 1rem">证件、聊天记录、地图门牌：开区域模式，笔刷略大于敏感区，沿边缘多涂一圈防止漏边。强度拉到细节不可读；对高清原图务必放大检查眼睛/号码是否仍可辨。处理完下载副本，原图单独加密存放。全图马赛克适合表情包风格，不适合「只藏一小块还要保留背景信息」的场景——那种必须区域模式。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">效果与性能</h2>
  <p style="margin:0 0 1rem">pixelate/mosaic 按块采样；模糊/油画类更吃 CPU。大图先缩小再处理可提速。应用会基于当前像素缓冲计算；若连续多次应用可能叠加劣化，重要输出请每次从重置后的原图调参一次出片。遮罩在切换区域模式时会清空，换模式前先下载需要的结果。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">合规提醒</h2>
  <p style="margin:0">打码不等于法律免责。医疗、儿童、监控录像等场景请遵循当地法规与单位制度。本工具不上传图片，但下载后的传播责任仍在使用者。</p>
`,
  'tools/privacy/random-key.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">场景选型速查</h2>
  <p style="margin:0 0 1rem">Web API 密钥草稿：预设 API（32 字母数字）。应用签名密钥：Secret 64。高熵 Token：base64 长串。配置里的 AES 测试密钥：AES128/256 对应 32/64 位 hex（表示 16/32 字节密钥的十六进制书写）。实体 ID：UUID 预设。务必再对照你方框架文档：有的系统禁止某些符号，有的要求最低长度与类别。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">使用与保管</h2>
  <p style="margin:0 0 1rem">生成后立即放入密码管理器或密钥库，不要发到公开群。示例环境与生产环境密钥分离。轮换时同时作废旧密钥。本页不保存历史，刷新媒体即无；这是优点（少泄露面）也是限制（无审计日志）。若需可重复演示，请自行离线记录，勿把真实生产密钥当演示数据。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">技术注意</h2>
  <p style="margin:0">仅在安全上下文（通常 HTTPS 或 localhost）下 Web Crypto 行为完整。字符集取模不是 CSPRNG 拒绝采样，但对密钥材料通常可接受。不要用本页输出替代证书签发或硬件安全模块中的根密钥流程。</p>
`,
  'tools/team-tools/decision-matrix.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">打分校准技巧</h2>
  <p style="margin:0 0 1rem">开会前先对齐「10 分长什么样、1 分长什么样」，可写一句操作定义贴在标题下。成本类标准建议统一方向：若「分高=更好」，则低成本应打高分，或把标准改名为「成本可控性」。避免同一信息重复计权（如「价格」与「总拥有成本」高度相关）。并列总分时看关键标准上的分差，而不是再加一个模糊标准硬分胜负。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">存储、分享与导出</h2>
  <p style="margin:0 0 1rem">本地键 <code>decision-matrix-data</code> 保存标准、方案、分数与标题；URL 分享便于远程同事打开同一矩阵。导出结果适合贴进决策记录（ADR）。清空前确认已导出。主题切换只影响皮肤。与回顾工具配合：回顾发现问题 → 矩阵选方案 → 待办拆执行。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">反模式</h2>
  <p style="margin:0">先内定赢家再回填分数；权重全打 10 导致变相平均；标准超过十项却无数据支撑。本矩阵是沟通框架，遇到合规红线应一票否决，而不是靠加权「平均掉」风险。</p>
`,
  'tools/media/svg-placeholder.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">前端接入方式</h2>
  <p style="margin:0 0 1rem">复制 SVG 源码可内联到组件，或下载 <code>placeholder_宽x高.svg</code> 作静态资源。需要光栅邮件模板时下 PNG。常见尺寸：Open Graph 1200×630、头像 256×256、横幅 1920×400。文案写组件名（如 Hero / Card）比只写像素更利于设计评审。描边可在浅色底上强化边界，避免和页面背景融在一起。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">无障碍与对比度</h2>
  <p style="margin:0 0 1rem">占位图也尽量保证字色与底色对比足够，避免评审时看不清尺寸标注。装饰性占位可在正式图替换后删除 alt 或改为有意义描述。SVG 文本是可选的，真正上线内容请用业务文案组件，不要长期用占位图冒充真实图片 SEO。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">导出问题排查</h2>
  <p style="margin:0">PNG 空白：检查宽高是否为有效正数。SVG 打不开：查看是否未转义的特殊字符（工具已 escape，但勿在生成后手工破坏标签）。极大尺寸浏览器卡顿时分档导出。需要圆角/多行文字/图片填充超出本页能力，请改用设计工具后导出。</p>
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

const markers = [
  '会议节奏与卡片写法',
  '打印与扫码实测清单',
  '排期建模建议',
  '时薪怎么估更靠谱',
  '隐私打码实操',
  '场景选型速查',
  '打分校准技巧',
  '前端接入方式',
];

let fail = 0;
for (const [rel, extra] of Object.entries(APPEND)) {
  const file = path.join(root, rel);
  let html = fs.readFileSync(file, 'utf8');
  const g = extractGuide(html);
  if (!g) {
    console.error('NO_GUIDE', rel);
    fail++;
    continue;
  }
  const before = cn(g.html);
  if (before >= 800 && before <= 1300) {
    console.log('SKIP_OK', rel, before);
    continue;
  }
  if (markers.some((m) => g.html.includes(m))) {
    console.log('ALREADY', rel, before);
    if (before < 800) fail++;
    continue;
  }
  const insertAt = g.html.lastIndexOf('</section>');
  const nextGuide = g.html.slice(0, insertAt) + extra.trim() + '\n' + g.html.slice(insertAt);
  html = html.slice(0, g.start) + nextGuide + html.slice(g.end);
  fs.writeFileSync(file, html, 'utf8');
  const after = cn(nextGuide);
  const h1 = (html.match(/<h1\b/gi) || []).length;
  const ok = after >= 800 && after <= 1300 && h1 === 1;
  console.log(`${ok ? 'OK' : 'BAD'} ${rel}: ${before} -> ${after} h1=${h1}`);
  if (!ok) fail++;
}
console.log(fail ? 'FAIL' : 'OK');
process.exitCode = fail ? 2 : 0;
