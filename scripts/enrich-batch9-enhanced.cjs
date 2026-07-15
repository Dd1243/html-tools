/**
 * Batch 9: enhanced 800-1200 CN function-verified guides (8 pages).
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
  'tools/media/image-text.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">图片加文字工具完整使用指南</h2>
  <p style="margin:0 0 1rem">在本地图片上叠文字后导出。拖拽 <code>#dropZone</code> 或选择文件 <code>#fileInput</code> 加载底图；编辑区 canvas 预览。文案 <code>#textContent</code>，字体 <code>#fontFamily</code>、字号 <code>#fontSize</code>、颜色 <code>#fontColor</code>、不透明度 <code>#opacitySlider</code>；描边色 <code>#strokeColor</code>、描边宽 <code>#strokeWidth</code>；偏移 <code>#offX</code>/<code>#offY</code> 调整位置。<code>handleFile</code> 读入，<code>render</code> 重绘底图与文字。<code>#downloadBtn</code> 导出结果。适合水印、标价、封面字，不是完整平面设计软件，也不自动识别图中最佳留白区域。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">参数如何影响画面</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>字号过大易出画，过小手机端难读；先预览再下载。</li>
    <li>描边让浅字在复杂底上可读；线宽 1–3 常够用。</li>
    <li>不透明度做半透明水印，避免完全挡住主体。</li>
    <li>偏移相对画布定位，改图尺寸后可能需重调。</li>
    <li>字体依赖本机/页面可用字体列表。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐流程</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>上传清晰底图，避免先过度压缩。</li>
    <li>写短文案（品牌名/价格/日期），少堆长段落。</li>
    <li>调颜色与描边保证对比度，再微调偏移。</li>
    <li>下载 PNG 保透明与清晰（若导出支持）；再发社交。</li>
    <li>敏感图可先去 EXIF 再加字发布。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>单层文字为主，无多图层文字框系统（以 UI 为准）。</li>
    <li>无曲线绕排、无竖排复杂中文禁则引擎。</li>
    <li>全本地 canvas，不上传服务器。</li>
    <li>与「文字转图片」不同：本页基于已有照片叠字。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">文字看不见？</h3>
  <p style="margin:0 0 .8rem">检查颜色是否与底图接近、透明度是否过低、偏移是否出画。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">下载模糊？</h3>
  <p style="margin:0 0 .8rem">底图像素不足或导出缩放；用更高清原图。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能拖拽文字吗？</h3>
  <p style="margin:0 0 .8rem">以偏移数值调节为主（若无拖拽手势）。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">版权？</h3>
  <p style="margin:0">只处理你有权使用的图片与文案。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">场景与注意</h2>
  <p style="margin:0">电商角标、活动海报字、内部资料水印「内部资料」都适合。水印勿挡住关键信息。公共电脑用完关闭页面。需要圆角或滤镜可串联其他媒体工具后再加字或先处理底图。</p>
`),

  'tools/media/image-sketch.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">图片转素描工具完整使用指南</h2>
  <p style="margin:0 0 1rem">把照片转成素描/线稿风格。上传后显示原图与输出 canvas 对比；强度 <code>#intensitySlider</code>、对比 <code>#contrastSlider</code> 可调，旁显数值。处理含灰度、模糊（<code>boxBlur</code>）、反相与混合等像素运算（以 <code>process</code> 为准），<code>debounceProcess</code> 防抖避免拖滑杆卡顿。<code>#downloadBtn</code> 导出结果；处理中可有 <code>#processingMsg</code>。适合头像趣味效果与线稿参考，不是真实铅笔手绘替代，也非矢量描边矢量化。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">参数含义</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>强度：影响线条/素描感强弱，过高噪点与假边缘增多。</li>
    <li>对比：拉开明暗，让轮廓更清楚，过高死黑死白。</li>
    <li>防抖：连续拖动后稍停再算，省 CPU。</li>
    <li>大图更慢，可先缩小再转换。</li>
    <li>结果为位图风格化，非可编辑矢量路径。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>选人像或主体清晰、背景不杂的图。</li>
    <li>中等强度起步，再微调对比。</li>
    <li>对比原图确认五官是否仍可辨。</li>
    <li>下载后可再加文字或拼图。</li>
    <li>商用注意肖像权与原图版权。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>夜景/强噪点图效果差。</li>
    <li>无分层上色、无手绘笔触压感。</li>
    <li>本地处理，不上传。</li>
    <li>与滤镜页：本页专攻素描管线，滤镜页更广调色。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">一直转圈？</h3>
  <p style="margin:0 0 .8rem">大图计算中，等待或换较小图。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">全黑/全白？</h3>
  <p style="margin:0 0 .8rem">对比与强度极端，重置滑杆到中段。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能批量吗？</h3>
  <p style="margin:0 0 .8rem">当前单张流程为主。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">保留彩色？</h3>
  <p style="margin:0">素描管线通常去色，需彩色请用滤镜页。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">创作建议</h2>
  <p style="margin:0">礼物线稿可打印后再手工上色。证件类勿过度风格化导致无法识别。处理隐私照片后关闭页面。导出前看对比网格是否满意。</p>
`),

  'tools/media/image-split.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">图片分割切图工具完整使用指南</h2>
  <p style="margin:0 0 1rem">把一张图按网格切成多块。上传后预览 <code>#previewImg</code> 与网格覆盖 <code>#gridOverlay</code>；可快捷 3×3、2×2、3×1、1×3 或自定义 <code>#rowsInput</code>/<code>#colsInput</code>；可选正方形裁切相关选项 <code>#squareCrop</code>。点分割 <code>#splitBtn</code> 在 <code>#resultGrid</code> 出各块，支持全部下载 <code>#downloadAllBtn</code>。<code>handleFile</code>/<code>updateGridOverlay</code> 维护预览。适合朋友圈九宫格、素材切片，不是智能主体抠图分割。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">网格与导出</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>行列决定块数；过大行列单块过碎。</li>
    <li>覆盖层帮助预判切线是否穿过人脸关键部位。</li>
    <li>分割后逐块可下或打包（以 UI 为准）。</li>
    <li>原图像素决定每块清晰度，先放大原图再切。</li>
    <li>本地 canvas 切割，不上传。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">九宫格流程</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>用 3×3 快捷，预览切线避开五官正中（若需要）。</li>
    <li>分割后按平台顺序上传（通常左到右、上到下）。</li>
    <li>条漫可用 1×3 或 3×1。</li>
    <li>电商详情可切长图为多段。</li>
    <li>切完检查边缘是否缺像素。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>均匀网格，无按内容识别的不规则分割。</li>
    <li>非整数整除时边缘块可能差 1 像素（以实现为准）。</li>
    <li>与拼接器相反：切分 vs 合并。</li>
    <li>超大图注意内存。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">按钮灰？</h3>
  <p style="margin:0 0 .8rem">先成功加载图片。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">顺序乱？</h3>
  <p style="margin:0 0 .8rem">按结果网格从左到右、上到下编号上传。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能切圆形吗？</h3>
  <p style="margin:0 0 .8rem">本页矩形网格；圆角用圆角工具。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">透明图？</h3>
  <p style="margin:0">导出格式以实现为准，PNG 更利透明。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">发布提示</h2>
  <p style="margin:0">社交平台压缩可能导致接缝露白，可略重叠设计（需设计侧处理）。隐私图先去 EXIF。公共电脑清空结果。</p>
`),

  'tools/media/image-round-corner.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">图片圆角修剪工具完整使用指南</h2>
  <p style="margin:0 0 1rem">为图片加圆角蒙版并导出。上传后 canvas 预览；半径 <code>#radiusSlider</code>（显示 <code>#radiusValDisplay</code>），背景色 <code>#bgColor</code>，透明底 <code>#transparentBg</code>；预设可 <code>updateActivePreset</code>。<code>handleFile</code> 加载，<code>render</code> 按半径裁剪绘制。<code>#downloadBtn</code> 导出。适合头像、卡片缩略图、UI 素材，不是任意形状钢笔裁剪。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">半径与背景</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>半径 0 近乎直角；过大接近胶囊/椭圆观感（视实现）。</li>
    <li>透明底适合贴深色 UI；不透明底用 bgColor 填角外。</li>
    <li>预设快速常用比例圆角。</li>
    <li>导出 PNG 才能良好保留透明。</li>
    <li>本地处理。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>上传正方形头像更易得均匀圆角或近似圆。</li>
    <li>调半径到视觉舒适，避免切掉五官。</li>
    <li>要透明角勾选透明；要白底卡片取消透明选白色。</li>
    <li>下载插入设计稿，检查边缘锯齿（可 2× 导出若支持）。</li>
    <li>批量需求重复操作或先统一尺寸再圆角。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>四角同一半径，无每角独立。</li>
    <li>非圆形裁切专用「正圆头像」模式时，大半径矩形仍可能非正圆。</li>
    <li>与圆角 CSS 不同：本页烘焙进像素。</li>
    <li>JPEG 导出会丢透明。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">角外是黑/白块？</h3>
  <p style="margin:0 0 .8rem">未开透明或背景色设置如此，改 transparentBg/bgColor。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">锯齿明显？</h3>
  <p style="margin:0 0 .8rem">用更高分辨率原图；浏览器缩放预览可能误导。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能圆角视频吗？</h3>
  <p style="margin:0 0 .8rem">仅图片。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和尺寸调整顺序？</h3>
  <p style="margin:0">先定尺寸再圆角，避免圆角后再缩放发糊。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">设计提示</h2>
  <p style="margin:0">UI 规范常见 8/12/16px 半径，可按目标显示尺寸换算。品牌主图保持统一圆角语言。公共电脑用完关闭。</p>
`),

  'tools/media/video-thumbnail.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">视频缩略图提取器完整使用指南</h2>
  <p style="margin:0 0 1rem">从本地视频截取封面/多帧缩略图。拖拽上传后显示时长、分辨率、体积；播放器可定位，步进 <code>stepForward</code>/<code>stepBackward</code>。设置输出尺寸模式、自定义宽高、保持比例、输出格式与批量数量 <code>#count</code>。可当前帧捕获、批量、场景变化检测相关能力（<code>detectSceneChanges</code>/<code>calculateDifference</code>）。缩略图网格可选中、删除、单下、ZIP 打包、清空。全在浏览器本地解码截帧，适合选封面，不是在线转码云剪辑。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">截帧与尺寸</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><code>captureFrame</code>/<code>seekAndCapture</code> 按时间取帧。</li>
    <li><code>getOutputDimensions</code> 结合自定义尺寸与 keepAspectRatio。</li>
    <li>批量按数量在时间轴取样（以实现为准）。</li>
    <li>场景检测尝试在画面变化大处截取，减少重复帧。</li>
    <li>进度条反映批量过程；大视频更慢。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">选封面流程</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>上传 MP4/WebM 等浏览器可播格式。</li>
    <li>拖动进度到高潮画面，步进微调，捕获一帧。</li>
    <li>或批量生成多张再挑最佳。</li>
    <li>设输出宽度适配平台封面比例。</li>
    <li>下载或 ZIP；需要文字可再用加字工具。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>编码/容器不被浏览器支持则无法加载。</li>
    <li>DRM 或损坏文件失败。</li>
    <li>非逐帧精确定点剪辑时间码工具。</li>
    <li>不上传服务器，但本机视频可能很大占内存。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">黑帧？</h3>
  <p style="margin:0 0 .8rem">片头黑场，往后拖再截；或等关键帧解码完成。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">ZIP 失败？</h3>
  <p style="margin:0 0 .8rem">先确认已有缩略图；浏览器内存不足时减数量。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">比例变形？</h3>
  <p style="margin:0 0 .8rem">勾选保持比例或正确填自定义宽高。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能截音频吗？</h3>
  <p style="margin:0">本页输出图像缩略图，不提取音轨。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">平台建议</h2>
  <p style="margin:0">封面避免纯文字小字；主体居中。横视频与竖视频封面比例不同，先定平台再设尺寸。隐私视频用完清缩略图与关闭页。</p>
`),

  'tools/media/image-rotate.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">图片旋转工具完整使用指南</h2>
  <p style="margin:0 0 1rem">旋转本地图片任意角度并导出。上传后 canvas 预览；信息栏显示原始/旋转后尺寸与当前角度。滑杆 <code>#angleSlider</code> 与显示 <code>#angleValue</code>/<code>#currentAngleDisplay</code>；快捷 <code>rotateQuick</code> 常见 90° 步进。背景色 <code>#bgColor</code>、透明底 <code>#transparentBg</code> 填充旋转后的空隙。<code>render</code>/<code>updateUI</code> 刷新；下载与重置按钮可用。适合纠正扫拍与创意斜切，不是 EXIF 方向批量修复专用工具（但可手调）。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">角度与画布</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>90° 倍数常保持矩形紧致；任意角会扩大边界盒。</li>
    <li>透明底适合 PNG 斜图；否则用背景色填角。</li>
    <li>重置回到未旋转或初始态（以脚本为准）。</li>
    <li>大图旋转占内存，注意卡顿。</li>
    <li>本地 canvas，不上传。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>手机竖拍横显时先试 ±90° 快捷。</li>
    <li>细偏用滑杆 1° 级校正地平线。</li>
    <li>选透明或底色匹配目标页背景。</li>
    <li>看 rotatedSize 是否可接受再下载。</li>
    <li>需裁掉多余边可再进裁剪/尺寸工具。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>多次有损导出累积损伤，尽量一次到位。</li>
    <li>不自动读 EXIF Orientation 时需手转。</li>
    <li>与翻转镜像若未提供请用其他工具。</li>
    <li>打印前确认方向正确。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">四角空缺？</h3>
  <p style="margin:0 0 .8rem">任意角几何结果；填背景或事后裁切。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">变模糊？</h3>
  <p style="margin:0 0 .8rem">非 90° 倍数插值导致，属常见现象。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">重置无效？</h3>
  <p style="margin:0 0 .8rem">再载入原图或确认点了 resetBtn。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">批量？</h3>
  <p style="margin:0">当前单张为主。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">工作流</h2>
  <p style="margin:0">纠正方向 → 裁剪 → 调色 → 导出。扫描件先转正再 OCR。公共电脑用完关闭。保留原图备份再覆盖导出。</p>
`),

  'tools/generator/utm-generator.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">UTM 链接生成器完整使用指南</h2>
  <p style="margin:0 0 1rem">为营销链接追加标准 UTM 参数，便于分析来源。输入基础 URL <code>#baseUrl</code>，以及 <code>#utmSource</code>、<code>#utmMedium</code>、<code>#utmCampaign</code>、可选 <code>#utmTerm</code>/<code>#utmContent</code>。<code>updateUTM</code> 实时生成 <code>#finalUrl</code>；可复制、写入历史 <code>saveToHistory</code>/<code>renderHistory</code>/<code>loadFromHistory</code>、<code>clearHistory</code>/<code>clearAll</code>。主题切换可用。适合投放与邮件追踪，不替代完整归因平台，也不缩短链接（可再接短链服务）。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">参数含义</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li><strong>source</strong>：来源站/渠道品牌，如 newsletter、baidu。</li>
    <li><strong>medium</strong>：媒介类型，如 cpc、email、social。</li>
    <li><strong>campaign</strong>：战役名，如 2026spring_sale。</li>
    <li><strong>term</strong>：付费搜索关键词（可选）。</li>
    <li><strong>content</strong>：区分创意 A/B 或按钮位置（可选）。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">规范建议</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>baseUrl 用 https 规范链，避免重复已有 utm 造成混乱。</li>
    <li>全小写、下划线或连字符统一，团队共享字典。</li>
    <li>campaign 含日期或季度，便于报表。</li>
    <li>复制 finalUrl 前浏览器打开自检是否跳转正确。</li>
    <li>历史记录方便复用，公共电脑 clearHistory。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>不验证 URL 是否 200；参数编码以实现为准。</li>
    <li>不自动写入 Google Ads 等后台。</li>
    <li>敏感活动名写在 URL 会被传播，注意保密。</li>
    <li>与 meta/OG 预览工具分工：UTM 管追踪参数，预览管卡片样子。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">参数没带上？</h3>
  <p style="margin:0 0 .8rem">检查必填 source/medium/campaign 是否为空；看 finalUrl 是否更新。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">原链已有 query？</h3>
  <p style="margin:0 0 .8rem">生成器应正确用 ? 或 &amp; 拼接（以输出为准）。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">历史存在哪？</h3>
  <p style="margin:0 0 .8rem">浏览器本地（localStorage 一类），非云端。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">能批量 Excel 吗？</h3>
  <p style="margin:0">当前单条生成；批量需表格公式或脚本。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">分析侧</h2>
  <p style="margin:0">在 GA/统计后台用 source/medium/campaign 维度看转化。命名混乱会导致报表不可比，先定规范再投放。工具不采集你的链接到服务器。</p>
`),

  'tools/media/image-resizer.html': section(`
  <h2 style="font-size:1.25rem;margin:0 0 .85rem">图片尺寸调整工具完整使用指南</h2>
  <p style="margin:0 0 1rem">按像素或比例缩放图片。上传后预览与信息：原始尺寸、目标尺寸、类型。输入 <code>#targetWidth</code>/<code>#targetHeight</code>、比例 <code>#scalePercent</code>，锁定比例 <code>#lockAspect</code>，输出格式 <code>#outputFormat</code>。<code>handleFile</code> 加载，<code>syncScale</code>/<code>updateTargetDimDisplay</code> 同步显示，下载与重置可用。适合出多尺寸素材，不是内容感知智能裁切（无主体识别），也与「image-resize」若并存则控件/存储可能不同，以本页为准。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">缩放逻辑</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>锁比例时改一边另一边联动，防变形。</li>
    <li>比例百分比相对原图整体缩放。</li>
    <li>放大不能凭空增加真实细节，会软。</li>
    <li>输出格式影响体积与透明通道。</li>
    <li>本地处理，不上传。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">推荐步骤</h2>
  <ol style="margin:0 0 1rem;padding-left:1.2rem">
    <li>明确目标平台像素（如头图 1200 宽）。</li>
    <li>开锁比例填宽度，检查高度是否可接受。</li>
    <li>需要固定框再配合裁剪工具。</li>
    <li>选 WebP/JPEG 控体积，图标用 PNG。</li>
    <li>下载后抽检，必要时从原图重来避免多次有损。</li>
  </ol>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">边界</h2>
  <ul style="margin:0 0 1rem;padding-left:1.2rem">
    <li>无批量文件夹处理时需逐张。</li>
    <li>超大图受内存限制。</li>
    <li>与压缩/转格式工具可串联：先缩放再压缩。</li>
    <li>不保证打印 DPI 元数据专业印刷级。</li>
  </ul>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">常见问题</h2>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">变形了？</h3>
  <p style="margin:0 0 .8rem">开启 lockAspect，勿随意解锁填不等比。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">目标尺寸不更新？</h3>
  <p style="margin:0 0 .8rem">改输入后看 updateTargetDimDisplay 是否触发，失焦/输入事件。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">透明没了？</h3>
  <p style="margin:0 0 .8rem">输出改成 PNG/WebP 等支持 alpha 的格式。</p>
  <h3 style="font-size:1.02rem;margin:1rem 0 .35rem">和 image-resize 页？</h3>
  <p style="margin:0">站内可能有相似工具，数据不互通，选一处完成即可。</p>

  <h2 style="font-size:1.12rem;margin:1.35rem 0 .55rem">质量提示</h2>
  <p style="margin:0">缩略图从高清原图一次缩到目标，避免先小后大。视网膜屏可导出 2× 再由 CSS 约束显示。公共电脑用完关闭。隐私图注意导出副本残留。</p>
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
