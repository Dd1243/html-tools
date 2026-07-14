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
    '--rules',
    'tag-pair=true',
  ],
  {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
    shell: true,
  }
);

const output = `${result.stdout || ''}\n${result.stderr || ''}`;
fs.writeFileSync(path.join(root, 'htmlhint-tagpair.txt'), output, 'utf8');
console.log('exit:', result.status);
console.log('output length:', output.length);
console.log(output.slice(-500));
