const fs = require('fs');

const files = [
  'tools/dev/css-selector-test.html',
  'tools/dev/xpath-tester.html',
  'tools/generator/resume-builder.html',
  'tools/seo/heading-analyzer.html',
  'tools/team-tools/meeting-agenda.html',
  'tools/text/html-markdown.html',
  'tools/text/markdown-editor.html',
];

function strip(html) {
  return html.replace(/<(script|style|textarea|template)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
}

for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const rendered = strip(html);
  const all = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
    m[1].replace(/<[^>]+>/g, '').trim()
  );
  const ren = [...rendered.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
    m[1].replace(/<[^>]+>/g, '').trim()
  );
  console.log(f);
  console.log('  all:', all.length, JSON.stringify(all));
  console.log('  rendered:', ren.length, JSON.stringify(ren));
}
