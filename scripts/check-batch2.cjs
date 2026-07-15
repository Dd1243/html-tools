const fs = require('fs');
const files = [
  'tools/office/meeting-scheduler.html',
  'tools/dev/json-to-go.html',
  'tools/life/decision-maker.html',
  'tools/office/signature-pad.html',
  'tools/life/world-clock.html',
  'tools/media/image-compare.html',
  'tools/media/image-format-converter.html',
  'tools/media/color-picker.html',
];
function cn(s) {
  return (String(s).replace(/<[^>]+>/g, ' ').match(/[\u4e00-\u9fff]/g) || []).length;
}
let bad = 0;
for (const rel of files) {
  const html = fs.readFileSync(rel, 'utf8');
  const idx = html.indexOf('class="tool-guide"');
  let guideCn = 0;
  let hasGuide = idx >= 0;
  if (hasGuide) {
    const start = html.lastIndexOf('<section', idx);
    const end = html.indexOf('</section>', idx);
    const g = html.slice(start, end + '</section>'.length);
    guideCn = cn(g);
  }
  const h1 = (html.match(/<h1\b/gi) || []).length;
  const ok = hasGuide && guideCn >= 800 && guideCn <= 1300 && h1 === 1;
  if (!ok) bad++;
  console.log(`${ok ? 'OK' : 'BAD'} ${rel} guideCn=${guideCn} h1=${h1}`);
}
process.exitCode = bad ? 2 : 0;
