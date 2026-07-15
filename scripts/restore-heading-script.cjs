const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const fp = path.join(root, 'tools/seo/heading-analyzer.html');
let html = fs.readFileSync(fp, 'utf8');

if (html.includes('webutils-heading-analyzer-input') && html.includes('analyzeHeadings')) {
  console.log('script already present');
  process.exit(0);
}

const buf = execSync('git show a0269cac:tools/seo/heading-analyzer.html', {
  maxBuffer: 20 * 1024 * 1024,
  cwd: root,
});
const old = buf.toString('utf8');
const i = old.lastIndexOf('<script>');
const j = old.lastIndexOf('</script>');
if (i < 0 || j < 0) {
  console.error('script not found in historical file');
  process.exit(1);
}

let script = old.slice(i, j + 9);

// Replace SAMPLE_HTML with clean Chinese sample to avoid encoding issues
const sample = `const SAMPLE_HTML = \`<header>
  <h1>2026 企业官网改版指南</h1>
  <p>帮助团队重新规划信息架构和 SEO 标题层级。</p>
</header>
<section>
  <h2>产品亮点</h2>
  <h3>性能表现</h3>
  <h3>安全能力</h3>
  <h2>常见问题</h2>
  <h3>是否支持导出报告？</h3>
  <h3>数据会上传吗？</h3>
</section>\`;`;

script = script.replace(/const SAMPLE_HTML = `[\s\S]*?`;/, sample);

if (!/<\/body>/i.test(html)) {
  console.error('no body end');
  process.exit(1);
}

html = html.replace(/<\/body>\s*<\/html>\s*$/i, `${script}\n</body>\n</html>\n`);
fs.writeFileSync(fp, html, 'utf8');

const open = (html.match(/<div\b/gi) || []).length;
const close = (html.match(/<\/div>/gi) || []).length;
console.log(
  JSON.stringify(
    {
      injected: true,
      hasAnalyze: html.includes('analyzeHeadings'),
      hasStorage: html.includes('webutils-heading-analyzer-input'),
      hasSampleZh: html.includes('企业官网改版指南'),
      h1: (html.match(/<h1[\s>]/gi) || []).length,
      divDiff: open - close,
      endsOk: /<\/body>\s*<\/html>\s*$/i.test(html),
    },
    null,
    2
  )
);
