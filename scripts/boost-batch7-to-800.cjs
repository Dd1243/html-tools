/** Batch 7 boost/final top-up to 800–1200 CN. */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const APPEND = {
  'tools/office/timesheet.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">周汇总与导出实务</h2>
  <p style="margin:0 0 1rem">周卡片帮助发现「某天过载、某天空白」。导出 CSV 后用数据透视按项目汇总，再乘费率出账。项目名规范比事后清洗更省事。键 <code>timesheet_data_v2</code> 仅本机；换电脑先导出。清空前确认月结完成。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见误录</h2>
  <p style="margin:0">结束时间早于开始、忘记改日期、项目名同义多写。跨午夜工作拆成两天更清晰。本页不做加班倍数计算，合规另依制度。</p>
`,
  'tools/team-tools/sprint-planner.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">容量与故事纪律</h2>
  <p style="margin:0 0 1rem">成员容量扣请假与固定会议；故事点数用相对估算会议得出。Velocity 取最近 3 轮中位数更稳。超额时砍范围而不是默许加班。导出计划作会议纪要附件。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">分享与清场</h2>
  <p style="margin:0">分享链接同步快照，注意故事名脱敏。清空前 export。与 RACI、站会、回顾工具形成计划-执行-改进闭环。主题不影响业务数据。</p>
`,
  'tools/team-tools/raci-chart.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">校验通过后再冻结</h2>
  <p style="margin:0 0 1rem">校验提示缺 A 或多 A 时当场改完再分享。导出 Markdown 进 Confluence/飞书。角色用岗位名，人员变动只换人不用重搭表。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">反模式</h2>
  <p style="margin:0">全员都是 R；没有 A；C 名单过长导致会海；矩阵写完不维护。公共电脑导出后清空。分享无权限系统。</p>
`,
  'tools/privacy/text-encrypt.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">算法选择速记</h2>
  <p style="margin:0 0 1rem">默认优先 GCM；只有对接旧系统才考虑 CBC/CTR。密钥长度双方一致。口令用密码管理器。解密失败先查算法与口令，再查密文完整性。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">与密钥/哈希页</h2>
  <p style="margin:0">随机密钥页产口令材料；文件哈希验完整性；本页藏内容。三者勿混淆。屏幕共享关闭明文窗口。</p>
`,
  'tools/office/contract-template.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">三类模板选用</h2>
  <p style="margin:0 0 1rem">服务合同对项目交付；劳动对雇佣；租赁对房屋。字段随类型显隐，填完再 generate。大写金额与数字不一致时以审阅修改为准。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">审阅清单</h2>
  <p style="margin:0">主体资格、标的、价款、期限、违约、争议解决。打印 PDF 送审。正式效力靠签署与合规，不靠本页。缓存含敏感信息，公共环境清空。</p>
`,
  'tools/office/stamp-generator.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">参数与清晰度</h2>
  <p style="margin:0 0 1rem">公司名过长改简称仅用于内部演示，对外示意仍应用全称并接受字距更密。线宽与颜色影响「像不像章」。下载后插入文档勿再过度压缩。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">合规再强调</h2>
  <p style="margin:0">生成图≠合法印章。伪造公章违法。键 <code>stamp_generator_config_v2</code> 存配置，用完可 clear。与合同模板分工：一出文一出示意图。</p>
`,
  'tools/social-media/social-preview.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">双栏预览怎么读</h2>
  <p style="margin:0 0 1rem">FB 与 Twitter 卡片裁切与字数习惯不同，同一套文案可能一边好看一边截断——以更严的一边为准改标题。图片主体放中心安全区。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">上线后</h2>
  <p style="margin:0">改 meta 后用平台调试器刷缓存。本页不抓站，手填字段即可快速 A/B 文案。主题切换只改编辑器皮肤。</p>
`,
  'tools/realestate/property-fee.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">口径对齐</h2>
  <p style="margin:0 0 1rem">问清按建筑面积还是套内、是否另收能耗。单价变更历史影响多年估算，表格简单外推时要心里打折。车位与装修期空置政策另问。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">与其它房产页</h2>
  <p style="margin:0">贷款/租金收益/税费页互补；本页专注物业费。结果可截图进看房笔记。不提供法律或投资建议。</p>
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
function renderedH1(html) {
  return (html.replace(/<script[\s\S]*?<\/script>/gi, '').match(/<h1\b/gi) || []).length;
}

const all = Object.keys(APPEND);
let fail = 0;
for (const rel of all) {
  const file = path.join(root, rel);
  let html = fs.readFileSync(file, 'utf8');
  let g = extractGuide(html);
  if (!g) {
    console.error('NO_GUIDE', rel);
    fail++;
    continue;
  }
  let before = cn(g.html);
  const extra = APPEND[rel];
  if (extra && before < 800) {
    const marker = (extra.match(/<h2[^>]*>([^<]+)<\/h2>/) || [])[1];
    if (!marker || !g.html.includes(marker)) {
      const insertAt = g.html.lastIndexOf('</section>');
      const nextGuide = g.html.slice(0, insertAt) + extra.trim() + '\n' + g.html.slice(insertAt);
      html = html.slice(0, g.start) + nextGuide + html.slice(g.end);
      fs.writeFileSync(file, html, 'utf8');
      g = extractGuide(html);
      before = cn(g.html);
    }
  }
  if (before < 800) {
    const more = `\n  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">本地数据与使用边界</h2>\n  <p style="margin:0 0 1rem">本页草稿与结果主要保存在当前浏览器环境，清除站点数据、更换设备或隐私模式可能导致丢失，重要工时、冲刺计划、RACI、合同与印章配置请及时导出或截图备份。公共电脑使用完毕后应清空敏感信息。工具用于提升效率，不替代正式人事考勤、项目管理、密钥托管、法律服务或物业合同，请以组织制度与当地法规为准。</p>\n`;
    if (!g.html.includes('本地数据与使用边界')) {
      const insertAt = g.html.lastIndexOf('</section>');
      const nextGuide = g.html.slice(0, insertAt) + more.trim() + '\n' + g.html.slice(insertAt);
      html = html.slice(0, g.start) + nextGuide + html.slice(g.end);
      fs.writeFileSync(file, html, 'utf8');
      g = extractGuide(html);
      before = cn(g.html);
    }
  }
  const h1 = renderedH1(html);
  const ok = before >= 800 && before <= 1300 && h1 === 1;
  console.log(`${ok ? 'OK' : 'BAD'} ${rel}: guideCn=${before} h1=${h1}`);
  if (!ok) fail++;
}
console.log(fail ? 'FAIL' : 'OK');
process.exitCode = fail ? 2 : 0;
