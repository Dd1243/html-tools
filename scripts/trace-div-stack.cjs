const fs = require('fs');
const html = fs.readFileSync(process.argv[2] || 'tools/privacy/steganography.html', 'utf8');

// crude stack of div opens with class
const re = /<\/?div\b[^>]*>/gi;
let m;
const stack = [];
const events = [];
while ((m = re.exec(html)) !== null) {
  const tag = m[0];
  const line = html.slice(0, m.index).split(/\n/).length;
  if (tag.startsWith('</')) {
    const opened = stack.pop();
    events.push({ line, type: 'close', closed: opened && opened.cls, depth: stack.length });
  } else {
    const cls = (tag.match(/class=["']([^"']*)["']/) || [,''])[1];
    stack.push({ line, cls });
    events.push({ line, type: 'open', cls, depth: stack.length });
  }
}
console.log('remaining stack:', stack);
console.log('last 30 events:');
console.log(events.slice(-30));
const interesting = events.filter(e => /page-wrapper|page-body|main-content|sidebar/.test(e.cls || e.closed || ''));
console.log('interesting:', interesting);
