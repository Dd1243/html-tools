const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const files = [
  'tools/seo/robots-generator.html',
  'tools/seo/meta-tags-generator.html',
];
let bad = false;
for (const f of files) {
  const html = fs.readFileSync(path.join(root, f), 'utf8');
  const open = (html.match(/<div\b/gi) || []).length;
  const close = (html.match(/<\/div>/gi) || []).length;
  const r = {
    file: f,
    pageShell: /class="[^"]*page-shell/.test(html),
    breadcrumbHub: html.includes('href="/tools/seo/"'),
    seoInside: /page-shell[\s\S]*seo-side[\s\S]*seo-article/i.test(html),
    noGeo:
      !html.includes('FAQ（GEO 优化）') &&
      !html.includes('什么是Robots.txt') &&
      !/style="[^"]*color:\s*#000/.test(html),
    h1: (html.match(/<h1[\s>]/gi) || []).length,
    divDiff: open - close,
    hasLayout: html.includes('/* layout polish: desktop + mobile */'),
    sticky: html.includes('position: sticky'),
    metaCodeOk: f.includes('meta')
      ? html.includes("escapeHtml(title)") &&
        html.includes("escapeHtml(description)") &&
        html.includes("escapeHtml(url)") &&
        !html.includes('Meta 标签生成器 - Title/Description/OG 一键生成">')
      : true,
  };
  console.log(JSON.stringify(r, null, 2));
  if (
    !r.pageShell ||
    !r.breadcrumbHub ||
    !r.seoInside ||
    !r.noGeo ||
    r.h1 !== 1 ||
    r.divDiff !== 0 ||
    !r.hasLayout ||
    !r.metaCodeOk
  ) {
    bad = true;
  }
}
if (bad) process.exit(1);
