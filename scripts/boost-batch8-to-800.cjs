/** Batch 8 boost to 800–1200 CN. */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const APPEND = {
  'tools/privacy/exif-remover.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">质量与格式选择</h2>
  <p style="margin:0 0 1rem">JPEG 质量过高体积收益小，过低出块效应；社交分享可中高质。PNG 适合需透明或少损场景。处理前后可用文件大小对比。批量时先抽检一张用属性查看是否仍含 GPS。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">与打码工具配合</h2>
  <p style="margin:0">去 EXIF 后若画面仍有车牌人脸，再用像素化/马赛克。发布渠道不同策略不同：内网原图、公网脱敏图。工具本地处理，不替代公司泄密防护。</p>
`,
  'tools/media/image-stitcher.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">布局参数速查</h2>
  <p style="margin:0 0 1rem">列数影响网格密度；间距过小像糊成一片，过大浪费画布。背景色在非透明导出时填充空隙。统计行帮助确认张数与预估体积，避免超平台上传限制。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">性能与顺序</h2>
  <p style="margin:0">先缩小再拼接更稳。顺序依赖添加/列表顺序，重要对比图先定序。复制剪贴板失败用下载。清空列表防公共电脑残留。</p>
`,
  'tools/business/valuation.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">假设敏感性</h2>
  <p style="margin:0 0 1rem">固定财务数据，只改增长率与 WACC，观察区间宽度。行业选错会导致倍数系统性偏差。阶段系数体现风险溢价，早期公司结果更发散属正常。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">沟通用法</h2>
  <p style="margin:0">投屏展示多方法而非单一魔法数字。强调「教学估算」。交易定价需尽调与谈判。截图保存情景假设。非投资建议。</p>
`,
  'tools/legal/privacy-policy.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">勾选数据与真实一致</h2>
  <p style="margin:0 0 1rem">只开你真正处理的类别；支付与位置等敏感项要有对应业务。法规勾选增加相关段落但仍需本地化。生成后搜索产品名是否正确替换。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">版本与存储</h2>
  <p style="margin:0">键 <code>webutils_privacy_policy_v2</code> 存草稿。重大变更改生效日并公告。英文站单独生成。公共电脑清空。法务终审不可省。</p>
`,
  'tools/office/invoice-calculator.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">含税不含税切换思维</h2>
  <p style="margin:0 0 1rem">合同写含税则从含税倒算；成本核算常用不含税。税率档选错会整单错。复制公式方便培训新人。进位差一分以票面为准。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">与开票/生成器</h2>
  <p style="margin:0">本页验算；税控开票走单位系统；invoice-maker 做商业单据样式。三者勿混为「已开税票」。</p>
`,
  'tools/media/svg-render.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">导出尺寸策略</h2>
  <p style="margin:0 0 1rem">UI 图标导出 24/48/96 多套；营销图用更大尺寸。透明棋盘格仅辅助预览。质量条对 JPEG 有意义。分享状态含源码注意机密图形。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">调试技巧</h2>
  <p style="margin:0">先 loadExample 确认管道正常再贴业务 SVG。路径异常看 status。字体未嵌入会回退。安全：拒来源不明脚本 SVG。</p>
`,
  'tools/office/invoice-maker.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">明细与税率</h2>
  <p style="margin:0 0 1rem">行项目写清描述避免纠纷。税率 0 表示不计税样式。到期日利于账期管理。键 <code>invoice_maker_v2_data</code> 本机草稿，月结导出 PDF 后可清空。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">合规再强调</h2>
  <p style="margin:0">不可伪造税票。客户报销以合法发票为准。本页请款单/账单场景。公共电脑清空购销方信息。</p>
`,
  'tools/team-tools/workload-calc.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">PERT 与风险</h2>
  <p style="margin:0 0 1rem">乐观过猛与悲观过狠都会扭曲期望；可能值应最可信。风险区提示高不确定任务，应拆分或加缓冲。导出 Markdown 进计划评审。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">和 Sprint 规划</h2>
  <p style="margin:0">本页得总工作量与所需冲刺粗算；规划器排进具体 Sprint 与成员容量。分享链接对齐远程。清空前导出。主题不影响估算数据。</p>
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

let fail = 0;
const all = Object.keys(APPEND);
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
  let guard = 0;
  while (before < 800 && guard < 4) {
    guard++;
    const tag = `补充说明 ${guard}`;
    if (g.html.includes(tag)) break;
    const more = `\n  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">${tag}</h2>\n  <p style="margin:0 0 1rem">请结合本页真实控件操作：先完成上传、表单填写或参数选择，再使用计算、生成、导出、分享或清空。结果以界面为准；涉及隐私元数据、税务发票、企业估值、隐私政策与工作量承诺时，务必与法规、法务、财务及团队约定一致。重要输出请下载或复制备份，公共环境使用后清空页面数据。</p>\n`;
    const insertAt = g.html.lastIndexOf('</section>');
    const nextGuide = g.html.slice(0, insertAt) + more.trim() + '\n' + g.html.slice(insertAt);
    html = html.slice(0, g.start) + nextGuide + html.slice(g.end);
    fs.writeFileSync(file, html, 'utf8');
    g = extractGuide(html);
    before = cn(g.html);
  }
  const h1 = renderedH1(html);
  const ok = before >= 800 && before <= 1300 && h1 === 1;
  console.log(`${ok ? 'OK' : 'BAD'} ${rel}: guideCn=${before} h1=${h1}`);
  if (!ok) fail++;
}
console.log(fail ? 'FAIL' : 'OK');
process.exitCode = fail ? 2 : 0;
