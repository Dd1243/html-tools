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

const titles = [];
for (const f of files) {
  const h = fs.readFileSync(f, 'utf8');
  const body = (h.match(/<body[\s\S]*<\/body>/i) || [h])[0];
  const text = body
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const cn = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const h1 = (h.match(/<h1\b/gi) || []).length;
  const guide = (h.match(/class="tool-guide"/g) || []).length;
  const title = (h.match(/<section class="tool-guide"[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>/i) || [,'?'])[1]
    .replace(/<[^>]+>/g, '')
    .trim();
  titles.push(title);
  const afterMain = /<\/main>[\s\S]*tool-guide|tool-guide[\s\S]*<footer|tool-guide[\s\S]*FAQ/.test(h);
  console.log(`${cn}cn h1=${h1} guide=${guide} afterToolish=${afterMain} | ${title} | ${f}`);
}
const unique = new Set(titles);
console.log('unique titles', unique.size, '/', titles.length);
// ensure no generic phrase mass template
const genericHits = files.filter((f) =>
  fs.readFileSync(f, 'utf8').includes('面向需要快速完成在线处理的中文用户')
);
console.log('generic template hits', genericHits.length);
