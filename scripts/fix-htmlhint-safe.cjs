/**
 * Conservative HTMLHint fixes only:
 * 1) img empty src -> transparent data URI
 * 2) img missing alt -> alt=""
 * 3) explicit text patterns with bare < or >
 * Never rewrite tag boundaries or generic "A > B" inside tags.
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const TRANSPARENT =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

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
  let currentFile = null;
  for (const line of output.split(/\r?\n/)) {
    const fileMatch = line.match(/^\s*([A-Z]:\\.*\.html)\s*$/i);
    if (fileMatch) {
      currentFile = path.relative(root, fileMatch[1]).replace(/\\/g, '/');
      continue;
    }
    const errMatch = line.match(/L(\d+)\s*\|/);
    if (!errMatch || !currentFile) continue;
    const ruleMatch = line.match(/\(([a-z0-9-]+)\)\s*$/i);
    // rule often on next caret line; keep scanning handled below by multi-pass
    errors.push({
      file: currentFile,
      line: Number(errMatch[1]),
      raw: line,
      rule: ruleMatch ? ruleMatch[1] : null,
    });
  }

  // second pass: attach rule from nearby lines using full output blocks
  const better = [];
  let file = null;
  const lines = output.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fileMatch = line.match(/^\s*([A-Z]:\\.*\.html)\s*$/i);
    if (fileMatch) {
      file = path.relative(root, fileMatch[1]).replace(/\\/g, '/');
      continue;
    }
    const m = line.match(/L(\d+)\s*\|/);
    if (!m || !file) continue;
    let rule = 'unknown';
    for (let j = i; j < Math.min(i + 3, lines.length); j++) {
      const rm = lines[j].match(/\(([a-z0-9-]+)\)\s*$/i);
      if (rm) {
        rule = rm[1];
        break;
      }
    }
    better.push({ file, line: Number(m[1]), rule });
  }
  return better;
}

function fixImgs(html) {
  return html.replace(/<img\b([^>]*?)>/gi, (full, attrs) => {
    let a = attrs;
    // empty src
    a = a.replace(/\bsrc\s*=\s*(["'])\s*\1/gi, `src=$1${TRANSPARENT}$1`);
    // missing src
    if (!/\bsrc\s*=/i.test(a)) {
      a = ` src="${TRANSPARENT}"` + a;
    }
    // missing alt
    if (!/\balt\s*=/i.test(a)) {
      a = a + ` alt=""`;
    }
    // normalize spaces
    a = a.replace(/\s+/g, ' ').replace(/^\s+/, ' ').replace(/\s+$/, '');
    return `<img${a}>`;
  });
}

function protect(html) {
  const blocks = [];
  const out = html.replace(
    /<(script|style|textarea|pre|code)\b[^>]*>[\s\S]*?<\/\1>/gi,
    (m) => {
      const token = `@@P${blocks.length}@@`;
      blocks.push(m);
      return token;
    }
  );
  return { out, blocks };
}

function restore(html, blocks) {
  return html.replace(/@@P(\d+)@@/g, (_, i) => blocks[Number(i)]);
}

function fixTextEscapes(html) {
  // Work only on non-protected content, and only with exact known patterns.
  const { out, blocks } = protect(html);
  let t = out;

  const replacements = [
    // menus / arrows
    [/Cursor Settings\s*>\s*Rules/g, 'Cursor Settings &gt; Rules'],
    [/Settings\s*>\s*Rules/g, 'Settings &gt; Rules'],
    [/Settings\s*->\s*Features/g, 'Settings → Features'],
    [/三个点\s*->/g, '三个点 →'],
    [/设置图标\s*->/g, '设置图标 →'],
    [/图标\s*->/g, '图标 →'],
    [/\s->\s/g, ' → '],
    [/([^&-])->(?![a-zA-Z])/g, '$1→'],

    // real-estate / pets
    [/(面积)\s*>\s*(90㎡?)/g, '$1 &gt; $2'],
    [/(小型犬)\s*\(\s*<\s*10kg\s*\)/g, '$1（&lt;10kg）'],
    [/(大型犬)\s*\(\s*>\s*25kg\s*\)/g, '$1（&gt;25kg）'],
    [/\(\s*<\s*10kg\s*\)/g, '（&lt;10kg）'],
    [/\(\s*>\s*25kg\s*\)/g, '（&gt;25kg）'],

    // sql / comparisons
    [/created_at\s*>\s*\.\.\./g, 'created_at &gt; ...'],

    // prose about html special chars
    [/小于号\s*`<`/g, '小于号 `&lt;`'],
    [/基本的\s*`<\s*>\s*&/g, '基本的 `&lt; &gt; &'],

    // backtick-wrapped tags in prose
    [/`<([a-zA-Z][a-zA-Z0-9-]*)>`/g, '`&lt;$1&gt;`'],
    [/`<\/([a-zA-Z][a-zA-Z0-9-]*)>`/g, '`&lt;/$1&gt;`'],

    // money comparisons
    [/<\s*\$(\d)/g, '&lt;$$$1'],
    [/>\s*\$(\d)/g, '&gt;$$$1'],

    // bit shifts in backticks only
    [/`\(([^`]*)<<([^`]*)\)`/g, (m) => m.replace(/<</g, '&lt;&lt;')],
    [/`([^`]*)<<([^`]*)`/g, (m) => m.replace(/<</g, '&lt;&lt;')],

    // math delta comparisons in text (not tags): "Δ > 0" / "Δ < 0"
    [/\$\\Delta\s*>\s*0\$/g, '$\\Delta &gt; 0$'],
    [/\$\\Delta\s*<\s*0\$/g, '$\\Delta &lt; 0$'],
    [/Δ\s*>\s*0/g, 'Δ &gt; 0'],
    [/Δ\s*<\s*0/g, 'Δ &lt; 0'],
  ];

  for (const [re, to] of replacements) t = t.replace(re, to);

  // Only escape standalone comparison operators that appear as " > " or " < "
  // between non-tag characters, and only outside of tags:
  // Split by tags, process text nodes only.
  t = t
    .split(/(<[^>]+>)/g)
    .map((part) => {
      if (part.startsWith('<') && part.endsWith('>')) return part; // tag, keep
      return part
        .replace(/(\s)>(\s)/g, '$1&gt;$2')
        .replace(/(\s)<(\s)/g, '$1&lt;$2')
        .replace(/<(?=\d)/g, '&lt;')
        .replace(/>(?=\d)/g, '&gt;');
    })
    .join('');

  return restore(t, blocks);
}

function fixTextareaMarkdownQuotes(html) {
  // HTMLHint flags leading ">" inside textarea markdown samples.
  // Escape only the markdown blockquote marker lines inside textarea bodies.
  return html.replace(
    /(<textarea\b[^>]*>)([\s\S]*?)(<\/textarea>)/gi,
    (full, open, body, close) => {
      const fixed = body.replace(/(^|\n)([ \t]*)>(\s+\S)/g, '$1$2&gt;$3');
      return open + fixed + close;
    }
  );
}

function fixAttrUnsafe(html) {
  // remove zero-width / control chars from meta content attributes
  return html.replace(
    /(<meta\b[^>]*\bcontent\s*=\s*")([^"]*)(")/gi,
    (full, a, content, c) => a + content.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u200B-\u200D\uFEFF]/g, '') + c
  );
}

function fixAttrDuplication(html) {
  // only exact repeated attribute on same tag
  return html.replace(/<([a-zA-Z][\w:-]*)(\s[^>]*?)>/g, (full, tag, attrs) => {
    const seen = new Set();
    const parts = [];
    const re = /([a-zA-Z_:][\w:.-]*)(\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?/g;
    let m;
    let cleaned = attrs;
    // simpler: remove second occurrence of identical attr name
    cleaned = cleaned.replace(
      /(\s([a-zA-Z_:][\w:.-]*)\s*=\s*(?:"[^"]*"|'[^']*'))(?=[\s\S]*\s\2\s*=)/i,
      ''
    );
    return `<${tag}${cleaned}>`;
  });
}

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!['node_modules', '.git', 'docs', 'screenshots'].includes(e.name)) walk(p, acc);
    } else if (e.isFile() && e.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

const beforeOut = collect();
const before = parse(beforeOut);
const beforeRules = {};
for (const e of before) beforeRules[e.rule] = (beforeRules[e.rule] || 0) + 1;
console.log('before:', before.length, beforeRules);

const files = walk(root).filter((f) => {
  const rel = path.relative(root, f).replace(/\\/g, '/');
  return !rel.includes('node_modules/') &&
    !/ByteDanceVerify|baidu_verify|js-playground|code-screenshot|wave-bg/.test(rel);
});

let changed = 0;
for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  let html = original;
  html = fixImgs(html);
  html = fixTextareaMarkdownQuotes(html);
  html = fixTextEscapes(html);
  html = fixAttrUnsafe(html);
  // skip aggressive attr duplication auto-fix unless needed
  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    changed += 1;
  }
}
console.log('changed files:', changed);

const afterOut = collect();
fs.writeFileSync(path.join(root, 'htmlhint-full.txt'), afterOut, 'utf8');
const after = parse(afterOut);
const afterRules = {};
for (const e of after) afterRules[e.rule] = (afterRules[e.rule] || 0) + 1;
console.log('after:', after.length, afterRules);
const scanned = afterOut.match(/Scanned[^\n]+/);
console.log(scanned && scanned[0]);
if (after.length) {
  console.log('samples:');
  after.slice(0, 25).forEach((e) => console.log(`${e.rule} ${e.file}:${e.line}`));
}
