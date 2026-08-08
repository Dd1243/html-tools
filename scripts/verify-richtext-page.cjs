const fs = require('fs');
const h = fs.readFileSync('tools/text/richtext-to-plain.html', 'utf8');
const head = h.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)[1];
const tags = head.match(/<meta\s+[^>]*name=["']description["'][^>]*>/gi) || [];
const tag = tags[0];
if (!tag) {
  console.error('missing description');
  process.exit(1);
}
const c = tag.match(/content=["']([^"']*)["']/i)[1].replace(/\s+/g, ' ').trim();
console.log({
  descTags: tags.length,
  len: [...c].length,
  hasTitle: /<title>/.test(h),
  hasH1: /<h1>/.test(h),
  hasCharset: /charset/i.test(h),
  hasCanonical: /canonical/.test(h),
  hasFooter: /privacy-policy/.test(h),
  hasConvert: /function convert/.test(h),
  hasVisibleBreadcrumb: /class=["']breadcrumb["']/.test(h),
  hasJsonLd: /BreadcrumbList/.test(h),
});
if (tags.length !== 1 || [...c].length < 120 || [...c].length > 160) process.exit(1);
