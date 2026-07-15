/**
 * Append tool-specific paragraphs so each guide reaches >= 800 CN chars.
 * Only touches pages below threshold; content is unique per tool.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const APPEND = {
  'tools/life/todo-list.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">实用技巧与排错</h2>
  <p style="margin:0 0 1rem">写任务时尽量用“动词 + 对象 + 完成标准”，例如「提交发票报销单（含附件）」比「报销」更容易勾选完成。若列表突然变空，先确认是否点过「清除已完成」或清过站点数据；筛选切到「全部」后再看。同一浏览器多标签同时编辑时，后写入的 <code>todos</code> 会覆盖先写入的版本，建议只开一个标签操作。需要跨设备时，请自行复制文本备份，本页没有导出按钮。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">和本站其他工具如何配合</h2>
  <p style="margin:0">深度工作可先用番茄钟计时，再用本页勾任务；每日重复事项请放到习惯追踪。字数很长的说明可先在字数统计页检查，再拆成多条短待办，避免一条任务过大导致迟迟不开始。</p>
`,
  'tools/life/pomodoro.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">实操建议与常见误区</h2>
  <p style="margin:0 0 1rem">一轮开始前先关掉无关标签页，只保留当前任务材料。若你频繁点暂停，说明任务粒度可能过大，先拆成更小步骤再开 25 分钟。长休适合连续完成多个工作番茄后使用；不要在短休里继续回消息而拖成“假休息”。提示音被拦截时，请以弹窗文案为准，不要以为程序没结束。后台标签页可能被浏览器节流，关键倒计时建议保持页面前台。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">和待办、习惯如何搭配</h2>
  <p style="margin:0">番茄钟本身不记录任务名。更稳妥的方式是：待办里写清本轮目标 → 开始 25 分钟 → 结束后勾掉对应待办。若目标是“每天写 2 个番茄”，请另用习惯追踪或手帐记录，因为本页的完成数刷新即消失。</p>
`,
  'tools/life/notes.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">整理方法建议</h2>
  <p style="margin:0 0 1rem">建议建立固定颜色约定，例如青色=工作、绿色=生活、紫色=灵感，避免每张卡片随机上色。标题写成可检索关键词（项目名/人名/日期），正文放细节。周中用搜索回收线索，周末把仍有价值的内容迁移到正式笔记或文档，并删除过期卡片，防止本地存储越堆越乱。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">安全与备份提醒</h2>
  <p style="margin:0">不要在便签里保存密码、验证码、完整证件号等敏感信息。本页无加密与云备份，清站点数据会丢笔记。若必须记录敏感内容，请使用专门密码管理器或加密笔记。换电脑前，请手动复制重要卡片内容到可靠位置。</p>
`,
  'tools/text/word-counter.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">平台限字对照思路</h2>
  <p style="margin:0 0 1rem">发微博/短帖时优先看总字符或平台说明是否含标点；写中文标题时重点看中文字数；英文 SEO title 更关注英文单词数与总字符上限。若平台只说“最多 500 字”却未定义空格与标点，建议同时满足“不含空格字数 ≤ 限额”和“总字符不显著超标”，降低被截断风险。复制统计结果时可一并粘贴口径，方便协作方复核。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">输入与缓存注意</h2>
  <p style="margin:0">草稿会写入 <code>word_counter_content</code>，公共电脑用完请点清空并确认。粘贴权限失败不代表统计失效，直接 Ctrl+V 即可。超大文本可能导致页面变卡，建议分段统计后再汇总。</p>
`,
  'tools/text/diff-checker.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">让 diff 更可读的预处理</h2>
  <p style="margin:0 0 1rem">对比前尽量统一换行风格，避免整篇“一行超长文本”。代码可先格式化再比，减少纯格式噪音。文案对比时，若只关心内容不关心空格，可先在编辑器去掉多余空行。改动很大时先分段比对目录/章节，再比对细节，避免一次塞入上万行导致卡顿。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">结果怎么用于协作</h2>
  <p style="margin:0">先看新增/删除计数判断改动量是否异常，再进入分屏逐行确认。对合同或公告，建议把“删除行”当作风险清单逐条勾掉。确认无误后再覆盖正式文档；本页不会自动保存比对结果，离开前请自行存档最终文本。</p>
`,
  'tools/text/duplicate-remover.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">清洗名单的推荐顺序</h2>
  <p style="margin:0 0 1rem">先开「去除首尾空格」和「移除空行」，再视情况开「忽略大小写」。确认唯一行数合理后，如需字母序再开「排序输出」。处理邮箱/手机号时，去重后务必人工抽查前 20 行，防止不可见字符导致漏重。若原始数据是逗号分隔，请先替换为换行再处理，否则整行会被当成一个元素。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">隐私与缓存</h2>
  <p style="margin:0">名单可能含个人数据。用完后点清空以移除 <code>duplicate_remover_content</code>。公共设备上不要保留客户名单草稿。本工具只做行级唯一化，不会验证邮箱格式是否合法。</p>
`,
  'tools/text/chinese-converter.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">发布前校对清单</h2>
  <p style="margin:0 0 1rem">转换后至少检查：品牌官方用字、人名地名、产品型号中的字母数字、引号与标点是否符合目标地区习惯。软件界面词（如“视频/影片”“信息/讯息”）常需人工替换。若文案将同时投放多地，可保留简体主稿，再分支生成繁体稿，避免两边来回交换造成版本混乱。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">草稿缓存与清空</h2>
  <p style="margin:0">输入可能写入 <code>chinese_converter_content</code>。在公共电脑完成转换后，请点「清空内容」防止下一位用户看到你的文案。需要连续处理多段时，可先复制结果，再清空输入下一段，减少串稿。</p>
`,
  'tools/privacy/file-hash.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">官方哈希对照流程</h2>
  <p style="margin:0 0 1rem">以官网公布算法为准：它写 SHA-256 就核 SHA-256，不要拿 MD5 去对 SHA-256。复制哈希时去掉首尾空格与换行；有的站点按 4 位分组显示，粘贴前可先去掉空格再验证。若仅校验“两个本地文件是否一致”，可对两份文件分别计算，比较任意同一算法值是否完全相同。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">性能与失败处理</h2>
  <p style="margin:0">大文件进度条长时间不动时，保持页面前台并避免同时打开过多占内存标签。若浏览器崩溃，通常是文件过大或内存不足，可换更高配设备或使用系统命令行工具作备选。计算完成后无需保留文件于页面中，关闭标签即可结束会话。</p>
`,
  'tools/media/image-resize.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">导出前参数选择建议</h2>
  <p style="margin:0 0 1rem">头像/封面先确认平台推荐像素，再设目标宽高。能缩小就不要放大。需要透明背景时优先 PNG；照片展示优先 JPEG/WebP 以控制体积。每次调整后点「刷新预览」，同时看清晰度与结果体积，不要只盯一边。正式下载前保留原图，避免覆盖唯一底稿。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">失败排查</h2>
  <p style="margin:0">下载按钮灰色=尚未成功加载图片。拖入非图片文件会被忽略。预览异常时点清空再重新上传。超大图卡顿可先用系统工具预缩小再精修。页面不提供批量文件夹处理，多张图请逐张导出并统一命名。</p>
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

for (const [rel, extra] of Object.entries(APPEND)) {
  const file = path.join(root, rel);
  const html = fs.readFileSync(file, 'utf8');
  const g = extractGuide(html);
  if (!g) throw new Error('no guide ' + rel);
  const before = cn(g.html);
  if (before >= 800) {
    console.log('skip already', before, rel);
    continue;
  }
  const injected = g.html.replace(/<\/section>\s*$/i, `${extra}\n</section>`);
  const after = cn(injected);
  const next = html.slice(0, g.start) + injected + html.slice(g.end);
  fs.writeFileSync(file, next, 'utf8');
  console.log(`${rel}: ${before} -> ${after}`);
  if (after < 800) console.warn('STILL_SHORT', after, rel);
}
