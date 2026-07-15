const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const result = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  [
    'htmlhint',
    '**/*.html',
    '--ignore',
    '**/ByteDanceVerify.html,**/baidu_verify_*.html,**/js-playground.html,**/code-screenshot.html,**/wave-bg.html',
  ],
  {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 30 * 1024 * 1024,
    shell: true,
  }
);

const output = `${result.stdout || ''}\n${result.stderr || ''}`;
fs.writeFileSync(path.join(root, 'htmlhint-full.txt'), output, 'utf8');

const parsed = [];
const re = /([A-Za-z]:\\[^\r\n]+?\.html)\r?\n([\s\S]*?)(?=\r?\n\s*[A-Za-z]:\\|\r?\nScanned )/g;
let m;
while ((m = re.exec(output)) !== null) {
  const file = path.relative(root, m[1]).replace(/\\/g, '/');
  const body = m[2];
  const errRe = /L(\d+)\s*\|\s*([^\r\n]+)\r?\n[^\r\n]*\^([^\r\n]+)/g;
  let em;
  while ((em = errRe.exec(body)) !== null) {
    const message = em[3].trim();
    const ruleMatch = message.match(/\(([a-z0-9-]+)\)\s*$/i);
    parsed.push({
      file,
      line: Number(em[1]),
      snippet: em[2].replace(/\u001b\[[0-9;]*m/g, '').trim(),
      message: message.replace(/\u001b\[[0-9;]*m/g, ''),
      rule: ruleMatch ? ruleMatch[1] : 'unknown',
    });
  }
}

const byRule = {};
const byFile = {};
for (const e of parsed) {
  byRule[e.rule] = (byRule[e.rule] || 0) + 1;
  byFile[e.file] = (byFile[e.file] || 0) + 1;
}

console.log('exit:', result.status);
console.log('parsed errors:', parsed.length);
console.log('\nBy rule:');
Object.entries(byRule)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(v, k));
console.log('\nTop files:');
Object.entries(byFile)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30)
  .forEach(([k, v]) => console.log(v, k));

fs.writeFileSync(path.join(root, 'htmlhint-full.json'), JSON.stringify(parsed, null, 2), 'utf8');
console.log('\nwrote htmlhint-full.txt / htmlhint-full.json');
