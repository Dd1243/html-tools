/**
 * Fix remaining spec-char-escape ONLY inside text nodes.
 * Never touch tag markup.
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function collect() {
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
  return `${result.stdout || ''}\n${result.stderr || ''}`.replace(/\u001b\[[0-9;]*m/g, '');
}

function parse(output) {
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
    const em = line.match(/L(\d+)\s*\|/);
    if (!em || !file) continue;
    let rule = 'unknown';
    for (let j = i; j < Math.min(i + 3, lines.length); j++) {
      const rm = lines[j].match(/\(([a-z0-9-]+)\)\s*$/i);
      if (rm) {
        rule = rm[1];
        break;
      }
    }
    errors.push({ file, line: Number(em[1]), rule });
  }
  return errors;
}

function fixTextNode(text) {
  let t = text;
  // known phrases
  t = t
    .replace(/NPV\s*<\s*0/g, 'NPV &lt; 0')
    .replace(/NPV\s*>\s*0/g, 'NPV &gt; 0')
    .replace(/显存\s*>=\s*4GB/g, '显存 &gt;= 4GB')
    .replace(/显存\s*>\s*=\s*4GB/g, '显存 &gt;= 4GB')
    .replace(/>=\s*(\d)/g, '&gt;= $1')
    .replace(/<=\s*(\d)/g, '&lt;= $1')
    .replace(/(\d)\s*>=\s*(\d)/g, '$1 &gt;= $2')
    .replace(/(\d)\s*<=\s*(\d)/g, '$1 &lt;= $2')
    .replace(/(\s)>(\s)/g, '$1&gt;$2')
    .replace(/(\s)<(\s)/g, '$1&lt;$2')
    .replace(/<(?=\d)/g, '&lt;')
    .replace(/>(?=\d)/g, '&gt;')
    .replace(/<(?=\$)/g, '&lt;')
    .replace(/>(?=\$)/g, '&gt;')
    .replace(/<< /g, '&lt;&lt; ')
    .replace(/ >>/g, ' &gt;&gt;')
    .replace(/([^&])<<([^&])/g, '$1&lt;&lt;$2')
    .replace(/([^&])>>([^&])/g, '$1&gt;&gt;$2');
  return t;
}

function fixHtmlTextOnly(html) {
  // protect script/style/textarea/pre/code first
  const blocks = [];
  let t = html.replace(/<(script|style|textarea|pre|code)\b[^>]*>[\s\S]*?<\/\1>/gi, (m) => {
    const token = `@@B${blocks.length}@@`;
    blocks.push(m);
    return token;
  });

  // split tags vs text
  t = t
    .split(/(<[^>]+>)/g)
    .map((part) => {
      if (part.startsWith('<') && part.endsWith('>')) return part;
      if (part.startsWith('@@B')) return part;
      return fixTextNode(part);
    })
    .join('');

  // restore protected blocks, but still fix markdown blockquote markers in textarea only
  t = t.replace(/@@B(\d+)@@/g, (_, i) => {
    const block = blocks[Number(i)];
    if (/^<textarea\b/i.test(block)) {
      return block.replace(
        /(<textarea\b[^>]*>)([\s\S]*?)(<\/textarea>)/i,
        (full, open, body, close) => open + body.replace(/(^|\n)([ \t]*)>(\s+\S)/g, '$1$2&gt;$3') + close
      );
    }
    return block;
  });
  return t;
}

const beforeOut = collect();
const before = parse(beforeOut);
const beforeRules = {};
for (const e of before) beforeRules[e.rule] = (beforeRules[e.rule] || 0) + 1;
console.log('before', before.length, beforeRules);

// only process files that currently have errors
const files = [...new Set(before.map((e) => e.file))];
let changed = 0;
for (const rel of files) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) continue;
  const original = fs.readFileSync(file, 'utf8');
  const html = fixHtmlTextOnly(original);
  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    changed += 1;
  }
}
console.log('changed files', changed);

// repair any accidental tag closers again
let repaired = 0;
for (const rel of files) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) continue;
  const original = fs.readFileSync(file, 'utf8');
  let html = original;
  html = html.replace(/<([a-zA-Z][\w:-]*)&gt;/g, '<$1>');
  html = html.replace(/<\/([a-zA-Z][\w:-]*)&gt;/g, '</$1>');
  html = html.replace(/(")&gt;(?=\s*[^<\s=])/g, '$1>');
  html = html.replace(/(')&gt;(?=\s*[^<\s=])/g, '$1>');
  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    repaired += 1;
  }
}
console.log('repaired files', repaired);

const afterOut = collect();
fs.writeFileSync(path.join(root, 'htmlhint-full.txt'), afterOut, 'utf8');
const after = parse(afterOut);
const afterRules = {};
for (const e of after) afterRules[e.rule] = (afterRules[e.rule] || 0) + 1;
console.log('after', after.length, afterRules);
console.log(afterOut.match(/Scanned[^\n]+/)?.[0] || '');
if (after.length) {
  after.slice(0, 30).forEach((e) => console.log(`${e.rule} ${e.file}:${e.line}`));
}
