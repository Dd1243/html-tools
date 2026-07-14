const fs = require('fs');
const path = require('path');

const report = fs.readFileSync(path.join(__dirname, '..', 'htmlhint-tagpair.txt'), 'utf8');
const parsed = [];

const re = /([A-Za-z]:\\[^\r\n]+?\.html)\r?\n([\s\S]*?)(?=\r?\n\s*[A-Za-z]:\\|\r?\nScanned )/g;
let m;
while ((m = re.exec(report)) !== null) {
  const file = m[1];
  const body = m[2];
  const errRe = /L(\d+)\s*\|\s*([^\r\n]+)\r?\n[^\r\n]*\^([^\r\n]+)/g;
  let em;
  while ((em = errRe.exec(body)) !== null) {
    parsed.push({
      file: path.relative(path.join(__dirname, '..'), file).replace(/\\/g, '/'),
      line: Number(em[1]),
      snippet: em[2].trim(),
      message: em[3].trim(),
    });
  }
}

const byTag = {};
const byDir = {};
for (const e of parsed) {
  const tagMatch = e.message.match(/\[\s*<\/?([a-zA-Z0-9-]+)/);
  const tag = tagMatch ? tagMatch[1].toLowerCase() : 'unknown';
  const kind = e.message.includes('no start tag')
    ? 'orphan-close'
    : e.message.includes('missing')
      ? 'missing-close'
      : 'other';
  const key = `${kind}:${tag}`;
  byTag[key] = (byTag[key] || 0) + 1;
  const parts = e.file.split('/');
  const dir = parts[0] === 'tools' ? `${parts[0]}/${parts[1]}` : parts[0];
  byDir[dir] = (byDir[dir] || 0) + 1;
}

console.log('Total parsed errors:', parsed.length);
console.log('\nBy type:');
Object.entries(byTag)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(v, k));
console.log('\nBy dir:');
Object.entries(byDir)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(v, k));

const files = [...new Set(parsed.map((e) => e.file))];
console.log('\nfiles with errors:', files.length);
console.log(files.slice(0, 50).join('\n'));

// Group orphan </div> by surrounding context patterns
const orphanDiv = parsed.filter(
  (e) => e.message.includes('no start tag') && e.message.includes('</div>')
);
console.log('\norphan </div> count:', orphanDiv.length);
console.log('sample orphan div:');
orphanDiv.slice(0, 15).forEach((e) => console.log(`${e.file}:${e.line} ${e.snippet}`));

fs.writeFileSync(
  path.join(__dirname, '..', 'htmlhint-parsed.json'),
  JSON.stringify(parsed, null, 2),
  'utf8'
);
console.log('\nwrote htmlhint-parsed.json');
