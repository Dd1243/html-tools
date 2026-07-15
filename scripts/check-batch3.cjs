const fs = require('fs');
const files = [
  'tools/team-tools/retrospective.html',
  'tools/office/barcode-label.html',
  'tools/office/gantt-chart.html',
  'tools/office/meeting-cost-calculator.html',
  'tools/media/image-pixelate.html',
  'tools/privacy/random-key.html',
  'tools/team-tools/decision-matrix.html',
  'tools/media/svg-placeholder.html',
];
function cn(s) {
  return (String(s).replace(/<[^>]+>/g, ' ').match(/[\u4e00-\u9fff]/g) || []).length;
}
let bad = 0;
for (const rel of files) {
  const html = fs.readFileSync(rel, 'utf8');
  const idx = html.indexOf('class="tool-guide"');
  let guideCn = 0;
  if (idx >= 0) {
    const start = html.lastIndexOf('<section', idx);
    const end = html.indexOf('</section>', idx);
    guideCn = cn(html.slice(start, end + 10));
  }
  const h1 = (html.match(/<h1\b/gi) || []).length;
  const ok = guideCn >= 800 && guideCn <= 1300 && h1 === 1;
  if (!ok) bad++;
  console.log(`${ok ? 'OK' : 'BAD'} ${rel} guideCn=${guideCn} h1=${h1}`);
}
process.exitCode = bad ? 2 : 0;
