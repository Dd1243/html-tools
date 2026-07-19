const fs = require('fs');
const h = fs.readFileSync('tools/security/sitemap-generator.html', 'utf8');
const body = h.replace(/<script[\s\S]*?<\/script>/gi, ' ');
console.log({
  white: /color-scheme:\s*light/.test(h) && /--bg-deep:\s*#f7f8fb/.test(h),
  centered:
    /width:\s*min\(100%,\s*1000px\)/.test(h) &&
    /align-items:\s*center/.test(h) &&
    /margin:\s*0 auto 40px/.test(h),
  aside: /<aside class="output-panel"/.test(body),
  copy: /id="copyBtn"/.test(body),
  download: /id="downloadBtn"/.test(body),
  title: /Sitemap 生成器/.test(h),
  nestedBroken: /main-panel[\s\S]{0,900}output-panel[\s\S]{0,300}<\/main>/.test(body),
});
