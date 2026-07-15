const fs = require('fs');
const files = [
  'tools/office/checklist-maker.html',
  'tools/office/invoice-maker.html',
  'tools/office/timesheet.html',
  'tools/office/task-tracker.html',
];
const cnRe = /[\u4e00-\u9fff]/g;
for (const f of files) {
  const h = fs.readFileSync(f, 'utf8');
  const body = h.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const desc = (h.match(/name="description"\s+content="([^"]+)"/) || [])[1] || '';
  const guideM = h.match(/class="tool-guide"[\s\S]*?<\/section>/);
  const guide = guideM ? guideM[0] : '';
  const guideCn = ((guide.replace(/<[^>]+>/g, ' ').match(cnRe)) || []).length;
  const scripts = (h.match(/<script(?![^>]*type="application\/ld\+json")[^>]*>[\s\S]*?<\/script>/gi) || []).join('\n');
  console.log('\n====' + f + '====');
  console.log({
    lines: h.split('\n').length,
    descLen: desc.length,
    h1: (body.match(/<h1\b/gi) || []).length,
    guideCn: guideCn,
    hasSidebar: /sidebar-section|class="sidebar"/.test(h),
    hasToolSection: h.includes('tool-section'),
    hasContentLayout: h.includes('content-layout'),
    openDiv: (h.match(/<div\b/gi) || []).length,
    closeDiv: (h.match(/<\/div>/gi) || []).length,
    openMain: (h.match(/<main\b/gi) || []).length,
    closeMain: (h.match(/<\/main>/gi) || []).length,
    hasLd: /application\/ld\+json/.test(h),
    hasWebApp: /WebApplication/.test(h),
    hasFaqPage: /FAQPage/.test(h),
    ids: [...body.matchAll(/id="([^"]+)"/g)].map((m) => m[1]).slice(0, 30),
    funcs: [...scripts.matchAll(/function\s+(\w+)/g)].map((m) => m[1]).slice(0, 25),
  });
  const mainIdx = h.search(/<main[\s>]/i);
  console.log('MAIN_START', mainIdx >= 0 ? h.slice(mainIdx, mainIdx + 600).replace(/\s+/g, ' ') : 'NO_MAIN');
  const mainEnd = h.search(/<\/main>/i);
  console.log('MAIN_END_CTX', mainEnd >= 0 ? h.slice(Math.max(0, mainEnd - 400), mainEnd + 20).replace(/\s+/g, ' ') : 'NO_MAIN_END');
}
