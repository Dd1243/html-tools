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
  { cwd: root, encoding: 'utf8', maxBuffer: 30 * 1024 * 1024, shell: true }
);
const output = `${result.stdout || ''}\n${result.stderr || ''}`.replace(/\u001b\[[0-9;]*m/g, '');
fs.writeFileSync(path.join(root, 'htmlhint-full.txt'), output, 'utf8');

const errors = [];
let file = null;
const lines = output.split(/\r?\n/);
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const fm = line.match(/^\s*([A-Z]:\\.*\.html)\s*$/i);
  if (fm) {
    file = path.relative(root, fm[1]).replace(/\\/g, '/');
    continue;
  }
  const em = line.match(/L(\d+)\s*\|\s*(.*)$/);
  if (!em || !file) continue;
  let rule = 'unknown';
  let msg = '';
  for (let j = i; j < Math.min(i + 3, lines.length); j++) {
    const rm = lines[j].match(/\(([a-z0-9-]+)\)\s*$/i);
    if (rm) {
      rule = rm[1];
      msg = lines[j].trim();
      break;
    }
  }
  errors.push({ file, line: Number(em[1]), rule, snippet: em[2].trim(), msg });
}

const byRule = {};
for (const e of errors) byRule[e.rule] = (byRule[e.rule] || 0) + 1;
console.log('total', errors.length);
console.log(byRule);
console.log(output.match(/Scanned[^\n]+/)?.[0] || '');

// print actual file lines for each unique error location
const seen = new Set();
for (const e of errors) {
  const key = `${e.file}:${e.line}:${e.rule}`;
  if (seen.has(key)) continue;
  seen.add(key);
  const full = path.join(root, e.file);
  if (!fs.existsSync(full)) continue;
  const fileLines = fs.readFileSync(full, 'utf8').split(/\n/);
  const actual = fileLines[e.line - 1] || '';
  console.log(`\n[${e.rule}] ${e.file}:${e.line}`);
  console.log('actual:', JSON.stringify(actual.trim().slice(0, 220)));
}

fs.writeFileSync(path.join(root, 'htmlhint-full.json'), JSON.stringify(errors, null, 2));
