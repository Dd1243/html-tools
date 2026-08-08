const fs = require('fs');
const h = fs.readFileSync('tools/text/roman-numeral.html', 'utf8');
const head = h.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)[1];
const tag = head.match(/<meta\s+[^>]*name=["']description["'][^>]*>/i);
const c = tag[0].match(/content=["']([^"']*)["']/i)[1].replace(/\s+/g, ' ').trim();
const len = [...c].length;
console.log({
  len,
  ok: len >= 120 && len <= 160,
  hasH1: /<h1>/.test(h),
  hasCanonical: /canonical/.test(h),
  hasFooter: /privacy-policy/.test(h),
  hasJsonLd: /BreadcrumbList/.test(h),
  hasVisibleBreadcrumb: /class=["']breadcrumb["']/.test(h),
});
if (len < 120 || len > 160) process.exit(1);
