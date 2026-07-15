/**
 * Batch 10: enhanced 800-1200 CN function-verified guides (8 pages).
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

function injectGuide(html, guideHtml) {
  if (html.includes('class="tool-guide"')) {
    const idx = html.indexOf('class="tool-guide"');
    const start = html.lastIndexOf('<section', idx);
    const end = html.indexOf('</section>', idx);
    if (start >= 0 && end >= 0) {
      return html.slice(0, start) + guideHtml + html.slice(end + '</section>'.length);
    }
  }
  // Prefer before footer / last script
  const footer = html.search(/<footer[\s>]/i);
  if (footer > 0) return html.slice(0, footer) + '\n' + guideHtml + '\n' + html.slice(footer);
  const lastScript = html.lastIndexOf('<script');
  if (lastScript > 0) return html.slice(0, lastScript) + guideHtml + '\n' + html.slice(lastScript);
  return html.replace(/<\/body>/i, guideHtml + '\n</body>');
}

const PAGES = {
  'tools/finance/tax-calculator.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">个人所得税计算器完整使用指南</h2>
  <p style="margin:0 0 1rem">本页是简化版月薪个税估算：输入月工资 <code>#salary</code>（默认 10000），可选年度 <code>#year</code>（2024/2023，当前算法未区分年份档位），点「计算」调用 <code>calculate()</code>。页面展示四项：五险一金 <code>#insurance</code>、应税所得 <code>#taxable</code>、应缴税额 <code>#tax</code>、税后收入 <code>#netSalary</code>。加载时会自动跑一次计算。适合快速粗算到手工资，不是官方报税软件，也不生成个税 APP 申报表。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">算法与假设（以源码为准）</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>五险一金按月薪的 10% 简化：<code>insurance = salary × 0.1</code>，非各地真实比例。</li>
    <li>起征点按 5000：应税 = max(0, 月薪 − 5000 − 五险一金)。</li>
    <li>税率按月度速算思路分段：≤3000 为 3%；其后 10%/20%/25%/30%/35%/45% 等档，并加对应速算常量（如 90、990…）。</li>
    <li>税后 = 月薪 − 五险一金 − 税额。未计入专项附加扣除、年终奖单独计税、劳务/稿酬等。</li>
    <li>年度下拉目前不改变公式，仅作界面预留；以实际 <code>calculate</code> 为准。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐操作</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>填入税前月薪（合同约定或应发工资口径）。</li>
    <li>点计算，对照四行结果理解扣费结构。</li>
    <li>若你城市公积金比例不是 10%，把结果当趋势而非精确数。</li>
    <li>有房贷/子女教育等专项附加时，真实应税会更低，本页未建模。</li>
    <li>正式报税以当地政策与扣缴义务人明细为准。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">适用与边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>适用：面试谈薪、粗比 Offer、教学演示个税档位概念。</li>
    <li>不适用：汇算清缴、多处所得合并、外籍/年终奖优化方案。</li>
    <li>无服务器提交，数据仅在浏览器内计算。</li>
    <li>与「利润率/增值税」等工具不同，本页只做个税简化月算。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">为什么和工资条不一致？</h3>
  <p style="margin:0 0 .8rem">真实五险一金基数、比例、补充公积金、企业年金与专项附加都不同；本页用固定 10% 与 5000 起征简化。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">年终奖怎么算？</h3>
  <p style="margin:0 0 .8rem">本页未实现年终奖单独计税，请勿用月薪公式硬套。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">负数工资？</h3>
  <p style="margin:0">请输入 ≥0 的数值；异常输入会被按 0 处理。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">使用注意</h2>
  <p style="margin:0">结果仅供参考，不构成税务建议。政策调整时请核对官方税率表。公共电脑无需担心上传，但勿把敏感薪资截图发到不可信渠道。需要更细的五险一金可另用专项计算器再回填思路，本页保持轻量一键估算。</p>
`),

  'tools/life/due-date.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">预产期计算器完整使用指南</h2>
  <p style="margin:0 0 1rem">按三种医学常用入口估算预产期与孕周：末次月经 <code>switchMethod('lmp')</code>（日期 <code>#lmpDate</code>、周期 <code>#cycleLength</code>）、B 超孕周 <code>ultrasound</code>（检查日 <code>#ultrasoundDate</code>、周 <code>#ultrasoundWeeks</code>/天 <code>#ultrasoundDays</code>）、试管胚胎 <code>ivf</code>（移植日 <code>#ivfDate</code>、胚胎类型 <code>#embryoType</code>）。点计算调用 <code>calculate()</code>，结果区 <code>#resultSection</code> 显示预产期 <code>#dueDateResult</code>、孕周/剩余天数、进度条与孕期阶段徽章，以及胎儿发育文案（<code>fetalDevelopment</code> 字典）和时间线 <code>renderTimeline</code>。主题切换 <code>toggleTheme</code>。仅供参考，不能替代产检医嘱。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">三种方法怎么选</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>末次月经：周期规律者最常用；周期非 28 天可改 <code>#cycleLength</code> 微调。</li>
    <li>B 超：月经不规律或记不清 LMP 时，以超声孕周反推更稳。</li>
    <li>试管：按移植日与胚胎类型（如囊胚/卵裂期，以页面选项为准）推算。</li>
    <li>同一天用不同方法结果可能差几天，以产科医生最终认定为准。</li>
    <li>进度条与三阶段标记帮助理解早/中/晚孕期大致位置。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐流程</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>选择对应方法页签，填日期与周天/胚胎类型。</li>
    <li>点计算，阅读预产期主结果与剩余天数。</li>
    <li>查看胎儿体型描述与时间线产检节点（示意性）。</li>
    <li>截图或记下日期，与医院手册对照，勿只依赖网页。</li>
    <li>有腹痛出血等异常立即就医，勿在本工具内「自诊」。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界说明</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>胎儿发育文案为科普级周次示意，非超声报告。</li>
    <li>不保存云端病历；数据在本地页面会话中。</li>
    <li>不计算唐筛/糖耐具体预约系统，只给时间线提示。</li>
    <li>与「排卵日」类工具不同：本页目标是预产期与孕周进度。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">预产期会变吗？</h3>
  <p style="margin:0 0 .8rem">会。医院可能根据早期 B 超修正 EDD，以病历为准。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">周期填错？</h3>
  <p style="margin:0 0 .8rem">改 <code>#cycleLength</code> 后重新计算；仍偏差大请用超声法。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">双胎/高危？</h3>
  <p style="margin:0">本页按单胎常规逻辑示意，高危妊娠必须遵医嘱随访。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">隐私与心态</h2>
  <p style="margin:0">孕期数据属敏感信息，公共电脑用完关闭标签。工具用于规划产检与备孕物品清单即可，避免因数字焦虑；任何不适优先联系产科或急诊。科普图标与文案不能替代医学影像与化验。</p>
`),

  'tools/office/letter-template.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">商务信函生成器完整使用指南</h2>
  <p style="margin:0 0 1rem">在浏览器里填写正式信函并实时预览 A4 纸样式。模板标签：商务邀请 <code>data-type="invite"</code>、正式离职 <code>resignation</code>、客户感谢 <code>thanks</code>、延误道歉 <code>apology</code>、工作录用 <code>offer</code>。字段：发件人 <code>#senderInfo</code>、收件人 <code>#recipientInfo</code>、主题 <code>#subject</code>、正文 <code>#body</code>、落款日期 <code>#letterDate</code>。<code>updatePreview()</code> 同步到 <code>#letterPaper</code>（<code>#pSender</code>/<code>#pDate</code>/<code>#pRecipient</code>/<code>#pSubject</code>/<code>#pBody</code>/<code>#pFooterName</code>）。「打印/导出 PDF」<code>#btnPrint</code>、「复制全文」<code>#btnCopy</code>、「清空重置」<code>#btnReset</code>。适合行政与商务沟通草稿，不是电子签章系统。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">模板与预览规则</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>点标签会写入预设主题与正文，可再改成真实项目名/日期。</li>
    <li>收件人前缀显示为「致: …」；主题前缀「关于: …」。</li>
    <li>落款名取发件人中 <code>|</code> 前半段（姓名部分）。</li>
    <li>日期选中后格式化为「年 月 日」中文显示。</li>
    <li>打印样式会隐藏工具栏，只保留纸面内容，便于导出 PDF。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐流程</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>选最接近场景的模板标签，再替换 XX 占位信息。</li>
    <li>核对收件人姓名职位，避免错字低级错误。</li>
    <li>正文保持客观礼貌简洁，少感叹号与表情。</li>
    <li>填落款日期，预览无误后复制或打印。</li>
    <li>正式发出前再人工审一遍公司抬头与盖章要求。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>无多页页眉页脚自动编号；超长正文需自行分页检查。</li>
    <li>无电子签/骑缝章；盖章请线下完成。</li>
    <li>模板为通用中文商务语气，行业合规话术需法务审。</li>
    <li>与「信头纸制作」不同：本页生成信函全文，非公司抬头版式设计。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">打印格式乱？</h3>
  <p style="margin:0 0 .8rem">打印预览选实际大小/A4，关闭页眉网址；浏览器缩放 100%。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">复制丢换行？</h3>
  <p style="margin:0 0 .8rem">优先复制预览全文或从正文框再贴到 Word 微调。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能存模板吗？</h3>
  <p style="margin:0">以当前页实现为准；重要信函请本地另存文档备份。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">礼仪提示</h2>
  <p style="margin:0">离职信写清交接与最后工作日；道歉信给方案与时间线；录用函写清部门职位报到日。语气客观礼貌，避免过度卑微或情绪化。公共电脑用完点重置。法律效力取决于签署与送达，本工具只辅助排版与措辞草稿。</p>
`),

  'tools/privacy/password-strength.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">密码强度检测完整使用指南</h2>
  <p style="margin:0 0 1rem">本地评估密码强弱：输入框 <code>#password</code>，眼睛按钮 <code>#toggleBtn</code> 显隐；强度条 <code>#strengthFill</code> 与标签 <code>#strengthLabel</code> 分 very-weak / weak / fair / strong / very-strong 五档。准则网格 <code>#criteriaGrid</code> 检查长度≥8、大小写、数字、特殊字符等；统计 <code>#statLength</code>、<code>#statEntropy</code>（<code>calculateEntropy</code>）、预估破解时间 <code>#statCrackTime</code>（<code>formatCrackTime</code>）。命中常见弱口令列表 <code>commonPasswords</code> 会出 <code>#warning</code>。<code>analyze</code>/<code>checkPassword</code> 在输入时更新。密码不上传服务器，适合自检，不是在线撞库服务。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">评分逻辑理解</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>长度与字符集多样性共同抬高熵值；仅加长度但全数字仍偏弱。</li>
    <li>常见密码（如 123456、password、qwerty）直接警告，即使「看起来复杂」。</li>
    <li>破解时间是基于熵的粗算示意，非真实黑客实战时间。</li>
    <li>准则项通过会标 pass 样式，便于补齐缺项。</li>
    <li>全本地运行，关闭页面即离开内存（注意浏览器自动填充缓存）。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐用法</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>输入候选密码，看五档标签与缺哪些准则。</li>
    <li>避免字典词、生日、键盘序列；用长口令或密码短语。</li>
    <li>不同站点勿复用；重要账号开 MFA。</li>
    <li>检测完不要在公共场合长时间明文显示（切换为密文）。</li>
    <li>真正存储用密码管理器，本页只做强度自检。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>不验证某网站是否已泄露该密码（无 Have I Been Pwned 查询除非另有接口）。</li>
    <li>不生成密码；生成请用随机密钥/密码生成类工具。</li>
    <li>熵模型简化，忽略站点特有策略（强制改密、历史禁用）。</li>
    <li>与「加密解密」工具不同：本页不加密文本，只评估口令质量。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">为什么很长仍一般？</h3>
  <p style="margin:0 0 .8rem">可能字符集单一或接近常见模式；混合大小写数字符号并避免单词。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">会上传吗？</h3>
  <p style="margin:0 0 .8rem">按页面设计为本地脚本分析；请确认无异常第三方脚本环境。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">中文密码？</h3>
  <p style="margin:0">部分站点不支持；准则以常见 ASCII 规则为主，以目标站策略为准。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">安全习惯</h2>
  <p style="margin:0">公共电脑检测后清空输入并关闭页。勿把真实主密码发到聊天截图。企业账号遵循公司密码策略与 SSO。本工具帮助建立「长度+多样性+非字典」直觉，最终安全还靠唯一口令、二次验证与设备防护。</p>
`),

  'tools/text/whitespace-cleaner.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">空白字符清理工具完整使用指南</h2>
  <p style="margin:0 0 1rem">清理文本中多余空白与不可见字符。左侧输入 <code>#input</code>、右侧输出 <code>#output</code>；字数信息 <code>#inputInfo</code>/<code>#outputInfo</code>，统计原长 <code>#statOriginal</code>、清理后 <code>#statCleaned</code>、减少量 <code>#statReduced</code>（<code>updateStats</code>）。清理器集合 <code>cleaners</code> 含按行 trim、折叠空格、删空行、Unicode 空格 <code>UNICODE_SPACES</code>、零宽/不可见 <code>INVISIBLE_CHARS</code>、控制字符 <code>CONTROL_CHARS</code> 等，通过按钮网格触发。<code>#btnCopy</code> 复制结果，<code>#btnSwap</code> 交换输入输出，<code>#btnClear</code> 清空；可 <code>saveToLocalStorage</code> 记住草稿。适合粘贴 Word/网页/表格后的脏空白，不是全文语义校对。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">各清理模式含义</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>按行 trim：去掉行首行尾空格，保留中间结构。</li>
    <li>折叠空格：同行多空白压成单空格（不伤换行，规则以源码为准）。</li>
    <li>删空行：去掉连续空行，便于紧凑列表。</li>
    <li>Unicode 空格：全角/不换行空等替换或删除，防「看不见却占位」。</li>
    <li>零宽与控制符：清除零宽空格、BOM 等，减少复制到代码/JSON 的坑。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐流程</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>粘贴原文到输入区，看原始字符数。</li>
    <li>按需求点对应清理按钮（可组合：先不可见字符再 trim）。</li>
    <li>对比输出与减少量，确认未误删需要的缩进（代码场景慎用折叠）。</li>
    <li>复制结果；需要再处理可点交换把输出当新输入。</li>
    <li>敏感文稿用完清空，公共电脑勿依赖 localStorage 长期存密。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>不改正错别字、不分词断句；只动空白类字符。</li>
    <li>Markdown/代码块若依赖缩进，勿盲目「折叠全部空格」。</li>
    <li>极大文本受浏览器内存限制，可分段处理。</li>
    <li>与「去重/字数统计」不同：本页专注空白与不可见字符。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">看起来没空格却对不齐？</h3>
  <p style="margin:0 0 .8rem">可能是全角空或零宽字符，用 Unicode/不可见清理再试。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">JSON 解析失败？</h3>
  <p style="margin:0 0 .8rem">键值间异常空白或 BOM 常导致；清理控制符与首尾空白后再解析。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">会上传吗？</h3>
  <p style="margin:0">本地处理；勿在不可信扩展环境下粘贴机密。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">场景举例</h2>
  <p style="margin:0">从 PDF 复制的双空格段落、Excel 粘出的尾部空格、聊天记录里的零宽水印、CMS 粘贴后的空行堆叠，都可用本页快速洗干净再进编辑器。SEO 文案、表单导入、脚本输入前做一遍，能少踩很多「肉眼看不见」的坑。处理完核对语义是否仍完整，再发布或入库。</p>
`),

  'tools/realestate/material-calc.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">装修建材计算器完整使用指南</h2>
  <p style="margin:0 0 1rem">估算瓷砖/地板与墙面涂料用量。页签：瓷砖/地板 <code>switchTab('tile')</code>（房间面积 <code>#roomArea</code>、单片面积 <code>#tileSize</code>、损耗率 <code>#tileLoss</code>%），涂料 <code>switchTab('paint')</code>（长宽高 <code>#roomL</code>/<code>#roomW</code>/<code>#roomH</code>、门窗面积 <code>#doorArea</code>）。点「计算实际用量」<code>#btnCalc</code> 写入 <code>#resultBox</code>/<code>#resGrid</code>。瓷砖按面积÷单片面积再乘 (1+损耗)；涂料按墙面展开面积减门窗后结合覆盖率逻辑（以页面脚本为准）。适合装修前采购粗算，不是施工图算量软件。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">参数怎么填</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>面积用净地面积；异形房间可拆成矩形相加再填。</li>
    <li>单片面积单位与房间面积一致（常见㎡）；包装规格看说明书换算。</li>
    <li>损耗：直铺约 5%–8%，斜铺/复杂拼花可 10%+，以现场师傅建议为准。</li>
    <li>涂料：长宽高算墙面，门窗面积从墙面扣减，避免多买。</li>
    <li>切换页签会隐藏另一组输入并清空结果展示状态。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐流程</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>量房得到面积或长宽高，记下门窗约略面积。</li>
    <li>选瓷砖或涂料页签，填参数与损耗。</li>
    <li>计算后看结果网格数量/升数建议，向上取整采购。</li>
    <li>同色号预留少量备货，避免批次色差。</li>
    <li>最终下单与工长/设计师复核，复杂造型另加量。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>不含踢脚线、波导线、美缝剂等辅材明细（除非结果区另列）。</li>
    <li>不处理阴阳角工艺与排砖图，只做面积法估算。</li>
    <li>涂料遍数、底漆面漆比例以产品说明为准，页面为简化模型。</li>
    <li>与贷款/租金收益工具无关，本页只做材料量。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">结果为 0 或不显示？</h3>
  <p style="margin:0 0 .8rem">检查数字是否填全、是否 NaN；面积与单片须 &gt;0。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">损耗填多少？</h3>
  <p style="margin:0 0 .8rem">无经验先 8%–10% 保守；师傅有排砖图后可下调。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">木地板按片还是按箱？</h3>
  <p style="margin:0">先算面积与损耗，再按包装㎡/箱换算箱数向上取整。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">采购提示</h2>
  <p style="margin:0">同批次采购减少色差；留 1–2 箱备货修缮。防水区、阳台与室内材料规格可能不同，分开算。本工具帮助建立数量级，合同清单仍以现场实测与商家报价单为准。计算在浏览器本地完成，无需上传户型图。</p>
`),

  'tools/office/letterhead-maker.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">公司信头纸制作完整使用指南</h2>
  <p style="margin:0 0 1rem">在线设计企业信头纸并 A4 预览。上传 Logo：拖放区 <code>#logoDrop</code> / 文件 <code>#logoInput</code>，文案提示 <code>#logoText</code>。公司名 <code>#companyName</code>、地址电话等 <code>#companyInfo</code>、页脚 <code>#footerText</code>；布局 <code>#layoutSelect</code>（如居中 center、反向 reverse）、主题色 <code>#themeColor</code>。<code>update()</code> 刷新预览名址与页眉 class。打印 <code>#btnPrint</code>、重置 <code>#btnReset</code>。适合快速出抬头纸 PDF，不是完整 VI 设计系统或 Word 模板库。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">版式与品牌要素</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>Logo 用透明 PNG 更干净；过大文件可先压缩再传。</li>
    <li>公司名与联系方式保持简短，避免页眉挤占正文区。</li>
    <li>布局切换改变 Logo/文字排列（左/中/反向等，以选项为准）。</li>
    <li>主题色用于名称强调色，宜与品牌主色一致。</li>
    <li>页脚可放保密声明、网址或统一社会信用代码摘要。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐流程</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>上传 Logo，填公司全称与地址电话邮箱。</li>
    <li>选布局与主题色，实时看 A4 预览。</li>
    <li>写页脚声明，避免与正文冲突。</li>
    <li>打印预览导出 PDF，检查边距是否被浏览器裁切。</li>
    <li>定稿后可固定为公司标准信头再写正文（可与信函生成器配合）。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>无多页自动延续页眉引擎；长文请在 Word 再套模板。</li>
    <li>不嵌入字体授权管理；打印依赖本机字体。</li>
    <li>无电子章位置吸附；盖章区请预留空白。</li>
    <li>与「商务信函生成器」互补：本页管抬头，彼页管信文。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">Logo 不显示？</h3>
  <p style="margin:0 0 .8rem">确认图片格式可读、文件未损坏；重选文件或刷新后重传。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">打印有页眉网址？</h3>
  <p style="margin:0 0 .8rem">浏览器打印设置关闭页眉页脚；纸张选 A4。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">颜色打印偏色？</h3>
  <p style="margin:0">屏幕色与打印色差正常；重要 VI 以设计稿 CMYK 为准。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">合规提示</h2>
  <p style="margin:0">使用真实公司名称与资质信息时确保授权。对外公文需符合公司公章与红头文件制度，本工具仅辅助视觉排版。公共电脑用完重置并清除本地预览图。定稿 PDF 可归档到企业网盘统一版本，避免员工各改各的抬头造成混乱。</p>
`),

  'tools/media/audio-cutter.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">在线音频剪辑工具完整使用指南</h2>
  <p style="margin:0 0 1rem">浏览器内剪切音频片段。拖放 <code>#dropZone</code> 或 <code>#fileInput</code> 加载，<code>handleFile</code> 解码为 <code>AudioBuffer</code>；信息条显示文件名/时长/大小/采样率（<code>#fn</code>/<code>#dur</code>/<code>#fs</code>/<code>#sr</code>）。波形 <code>#waveformCanvas</code> 绘制，选区 <code>#selOverlay</code>、播放头 <code>#playhead</code>；起止时间 <code>#inStart</code>/<code>#inEnd</code>、选区长度 <code>#selLen</code>。<code>#btnPlay</code> 播放/暂停，<code>#btnPlaySel</code> 播选区，<code>#btnStop</code> 停止，<code>selectAll()</code> 全选；音量 <code>#volSlider</code>。<code>#btnExport</code> 导出选中音频，经 <code>bufferToWav</code>/<code>bufferToMp3</code>（lamejs）等生成文件。适合铃声与短片段，不是多轨 DAW。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">选区与播放</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>在波形上拖选起止，或直接改时间输入框后更新 UI。</li>
    <li>播放选区用于试听铃声是否掐准；全曲播放看整体。</li>
    <li>音量滑杆经 GainNode 控制监听响度，不改变导出响度算法除非实现绑定。</li>
    <li>大文件解码更慢，有 <code>#loadingOverlay</code> 提示。</li>
    <li>格式兼容依赖浏览器可解码类型（常见 mp3/wav/ogg 等）。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐流程</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>上传清晰源文件，优先无损或高码率再压。</li>
    <li>听波形峰值，框出副歌/对白段，微调起止秒数。</li>
    <li>播选区确认无爆音与半句切断。</li>
    <li>导出 WAV 保真或 MP3 减体积（以按钮/实现为准）。</li>
    <li>手机铃声注意平台时长与格式限制再转码。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>无多轨混音、无效果器链、无自动拍号对齐。</li>
    <li>极长音频可能受内存限制，可先桌面软件粗剪再精修。</li>
    <li>版权音频仅可自用合法范围；商用需授权。</li>
    <li>与视频缩略图工具不同：本页处理音频时间轴。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">无法解码？</h3>
  <p style="margin:0 0 .8rem">换浏览器或先转为 wav/mp3；部分编码 WebAudio 不支持。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">导出没声音？</h3>
  <p style="margin:0 0 .8rem">检查选区是否过短/起止反了；先全选试导出。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">波形不准？</h3>
  <p style="margin:0">概览波形为示意峰值，精确定位以时间输入为准。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">隐私与性能</h2>
  <p style="margin:0">音频在本地解码处理，不上传服务器。公共电脑用完关闭页并删除下载缓存。笔记本注意长时间解码的发热。需要淡入淡出或降噪请用专业编辑器；本页目标是快速框选导出干净片段。</p>
`),
};

let fail = 0;
for (const [rel, guide] of Object.entries(PAGES)) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    console.error('MISSING', rel);
    fail++;
    continue;
  }
  let html = fs.readFileSync(file, 'utf8');
  html = injectGuide(html, guide);
  fs.writeFileSync(file, html, 'utf8');
  const gcn = cn(guide);
  const h1 = renderedH1(html);
  console.log(rel, 'guideCN=', gcn, 'h1=', h1);
  if (h1 !== 1) {
    console.error('H1_FAIL', rel, h1);
    fail++;
  }
}
console.log(fail ? 'DONE_WITH_ERRORS ' + fail : 'DONE_OK');
process.exit(fail ? 1 : 0);
