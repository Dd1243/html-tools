const fs = require('fs');
const files = [
  'tools/life/habit-tracker.html',
  'tools/life/todo-list.html',
  'tools/life/pomodoro.html',
  'tools/life/notes.html',
  'tools/text/word-counter.html',
  'tools/text/diff-checker.html',
  'tools/text/duplicate-remover.html',
  'tools/text/chinese-converter.html',
  'tools/privacy/file-hash.html',
  'tools/media/image-resize.html',
];

function extractGuide(html) {
  const start = html.indexOf('class="tool-guide"');
  if (start < 0) return null;
  const secStart = html.lastIndexOf('<section', start);
  const secEnd = html.indexOf('</section>', start);
  if (secStart < 0 || secEnd < 0) return null;
  return html.slice(secStart, secEnd + '</section>'.length);
}

function cn(s) {
  return (s.replace(/<[^>]+>/g, ' ').match(/[\u4e00-\u9fff]/g) || []).length;
}

for (const f of files) {
  const h = fs.readFileSync(f, 'utf8');
  const g = extractGuide(h);
  if (!g) {
    console.log('MISSING', f);
    continue;
  }
  const title = (g.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [, '?'])[1].replace(/<[^>]+>/g, '').trim();
  const h1 = (h.match(/<h1\b/gi) || []).length;
  console.log(`${cn(g)} guideCn | h1=${h1} | ${title} | ${f}`);
}
