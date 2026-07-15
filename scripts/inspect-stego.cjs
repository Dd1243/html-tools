const fs = require('fs');
const path = require('path');

function inspect(file) {
  const h = fs.readFileSync(file, 'utf8');
  const open = (h.match(/<div\b/gi) || []).length;
  const close = (h.match(/<\/div>/gi) || []).length;
  return {
    file,
    len: h.length,
    lines: h.split(/\n/).length,
    divOpen: open,
    divClose: close,
    diff: open - close,
    h1: (h.match(/<h1\b/gi) || []).length,
    hasContainer: /class=["'][^"']*\bcontainer\b/.test(h),
    hasPageBody: /class=["'][^"']*\bpage-body\b/.test(h),
    bodyOk: /<body[\s\S]*<\/body>/i.test(htmlSafe(h)),
    breadcrumb: /breadcrumb/.test(h),
  };
}
function htmlSafe(h) {
  return h;
}

console.log(JSON.stringify(inspect('tools/privacy/steganography.html'), null, 2));

// print body start structure
const h = fs.readFileSync('tools/privacy/steganography.html', 'utf8');
const bodyIdx = h.indexOf('<body');
console.log('\nBODY START:\n' + h.slice(bodyIdx, bodyIdx + 1200));
console.log('\n--- around page-body end ---');
const endIdx = h.indexOf('<!-- /page-body -->');
console.log(h.slice(endIdx - 400, endIdx + 200));
