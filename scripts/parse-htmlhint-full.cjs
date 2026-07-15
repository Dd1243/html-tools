const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const text = fs.readFileSync(path.join(root, 'htmlhint-full.txt'), 'utf8')
  .replace(/\u001b\[[0-9;]*m/g, '');

const parsed = [];
const fileBlocks = text.split(/\r?\n(?=[A-Z]:\\)/);
for (const block of fileBlocks) {
  const lines = block.split(/\r?\n/);
  const fileLine = lines[0];
  if (!/\.html$/i.test(fileLine.trim())) continue;
  const file = path.relative(root, fileLine.trim()).replace(/\\/g, '/');
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/L(\d+)\s*\|\s*(.*)$/);
    if (!m) continue;
    // look ahead for rule line
    let rule = 'unknown';
    let message = '';
    for (let j = i; j < Math.min(i + 4, lines.length); j++) {
      const rm = lines[j].match(/\(([a-z0-9-]+)\)\s*$/i);
      if (rm) {
        rule = rm[1];
        message = lines[j].replace(/\s+/g, ' ').trim();
        break;
      }
    }
    parsed.push({
      file,
      line: Number(m[1]),
      snippet: m[2].trim(),
      rule,
      message,
    });
  }
}

const byRule = {};
const byFile = {};
for (const e of parsed) {
  byRule[e.rule] = (byRule[e.rule] || 0) + 1;
  byFile[e.file] = (byFile[e.file] || 0) + 1;
}

console.log('parsed:', parsed.length);
console.log('\nBy rule:');
Object.entries(byRule).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(v,k));
console.log('\nTop files:');
Object.entries(byFile).sort((a,b)=>b[1]-a[1]).slice(0,25).forEach(([k,v])=>console.log(v,k));

// sample each rule
console.log('\nSamples:');
for (const rule of Object.keys(byRule)) {
  const sample = parsed.find((e) => e.rule === rule);
  if (sample) console.log(`[${rule}] ${sample.file}:${sample.line} ${sample.snippet}`);
}

fs.writeFileSync(path.join(root, 'htmlhint-full.json'), JSON.stringify(parsed, null, 2));
