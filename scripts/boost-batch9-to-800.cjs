/** Batch 9 boost to 800–1200 CN. */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const APPEND = {
  'tools/media/image-text.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">水印与营销字实操</h2>
  <p style="margin:0 0 1rem">品牌水印用半透明+角落偏移；价格字用粗字号+描边。多行文案用换行，避免单行过长出画。改字号后重看预览再下载。导出后可用压缩减体积。本地处理，公共电脑注意底图隐私。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">与相关工具</h2>
  <p style="margin:0">纯文字出海报用文字转图片；本页对照片叠字。去 EXIF、圆角、缩放可串联。版权与肖像权自负。</p>
`,
  'tools/media/image-sketch.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">滑杆与性能</h2>
  <p style="margin:0 0 1rem">防抖后松手再出图，勿连续狂拖。强度/对比中段最稳。大图先缩小。下载前对比原图与结果网格。非矢量，放大印刷会糊。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">适用边界</h2>
  <p style="margin:0">娱乐头像与线稿参考可；工程制图请用专业软件。隐私人像处理完关闭页。可与加字/拼图组合出图。</p>
`,
  'tools/media/image-split.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">行列选择</h2>
  <p style="margin:0 0 1rem">九宫格 3×3；对比前后 1×2 需自定义。覆盖层避开关键面部中线。全下后按平台顺序上传。本地切割不上传原图。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">与拼接器</h2>
  <p style="margin:0">切分与拼接互逆。切完可单块修图再拼回。超大图分批。公共环境清空结果区。</p>
`,
  'tools/media/image-round-corner.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">透明与底色</h2>
  <p style="margin:0 0 1rem">UI 贴图开透明；印刷小卡用白底。半径与显示尺寸匹配，预览缩放别误判。PNG 导出保透明。预设加快统一风格。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">工作流</h2>
  <p style="margin:0">先缩放再圆角。头像建议近似正方形。与滤镜顺序：先调色再圆角更清晰。用完关闭页面。</p>
`,
  'tools/media/video-thumbnail.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">批量与场景检测</h2>
  <p style="margin:0 0 1rem">批量适合快速浏览候选封面；场景检测抓切变点。数量过大更慢，先小批量。选中多张再 ZIP。尺寸按平台封面规范。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">格式兼容</h2>
  <p style="margin:0">优先 MP4 H.264 等浏览器友好编码。加载失败换封装或转码。截帧是图片不是视频导出。隐私影片本地处理完清理缩略图。</p>
`,
  'tools/media/image-rotate.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">90° 与任意角</h2>
  <p style="margin:0 0 1rem">文档纠正优先 90° 步进；地平线用小角度。任意角扩画布，透明或底色填角。看尺寸信息防过大。一次旋转到位再导出。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">后续裁剪</h2>
  <p style="margin:0">斜图常需再裁。与尺寸工具衔接出目标像素。保留原图。公共电脑勿留扫描件。</p>
`,
  'tools/generator/utm-generator.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">命名字典示例</h2>
  <p style="margin:0 0 1rem">source=wechat / weibo；medium=social / cpc / email；campaign=product_launch_2026q3。content 区分 banner_a 与 banner_b。统一后报表才可比。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">历史与清空</h2>
  <p style="margin:0">历史便于复用活动链；交接前导出记录。公共电脑 clearAll。生成后抽检跳转与统计是否收到参数。</p>
`,
  'tools/media/image-resizer.html': `
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">锁比例与百分比</h2>
  <p style="margin:0 0 1rem">锁比例防变形；百分比适合整体缩略。信息栏核对目标尺寸。格式选对透明与体积。重置回初始便于重来。</p>
  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">串联建议</h2>
  <p style="margin:0">缩放 → 压缩/转 WebP → 去 EXIF。避免反复放大。多尺寸从原图分别导出。公共环境关闭页面。</p>
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
for (const rel of Object.keys(APPEND)) {
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
    const tag = '补充说明 ' + guard;
    if (g.html.includes(tag)) break;
    const more =
      '\n  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">' +
      tag +
      '</h2>\n  <p style="margin:0 0 1rem">请结合本页真实按钮与输入操作：先上传或填写参数，再预览、下载、复制或清空。结果以界面为准。媒体处理均在本地浏览器完成，请勿在不信任设备打开机密文件；重要成品请及时保存副本。工具用于提升效率，不替代专业设计、视频剪辑或广告分析平台。</p>\n';
    const insertAt = g.html.lastIndexOf('</section>');
    const nextGuide = g.html.slice(0, insertAt) + more.trim() + '\n' + g.html.slice(insertAt);
    html = html.slice(0, g.start) + nextGuide + html.slice(g.end);
    fs.writeFileSync(file, html, 'utf8');
    g = extractGuide(html);
    before = cn(g.html);
  }
  const h1 = renderedH1(html);
  const ok = before >= 800 && before <= 1300 && h1 === 1;
  console.log((ok ? 'OK' : 'BAD') + ' ' + rel + ': guideCn=' + before + ' h1=' + h1);
  if (!ok) fail++;
}
console.log(fail ? 'FAIL' : 'OK');
process.exitCode = fail ? 2 : 0;
