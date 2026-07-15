const fs = require('fs');

function textLen(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim().length;
}

const out = {};
for (const f of ['about.html', 'contact.html', 'terms.html', 'privacy-policy.html']) {
  const h = fs.readFileSync(f, 'utf8');
  const m = h.match(/name="description"[\s\S]*?content="([^"]+)"/);
  const desc = m ? m[1] : '';
  out[f] = {
    chars: textLen(h),
    descLen: [...desc].length,
    desc,
    hasTemplate: /是 WebUtils 的/.test(h),
    descOk: !!(desc && !/是 WebUtils 的/.test(desc) && [...desc].length >= 120 && [...desc].length <= 160),
    hasGithub: h.includes('github.com/Dd1243'),
    h1: (h.match(/<h1/gi) || []).length,
  };
}
console.log(JSON.stringify(out, null, 2));
