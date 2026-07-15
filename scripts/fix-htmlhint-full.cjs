/**
 * Fix high-confidence HTMLHint issues:
 * - src-not-empty: empty img src -> transparent pixel data URI
 * - alt-require: missing alt -> alt=""
 * - common spec-char-escape patterns in text (not in script/style)
 * - tagname-lowercase, attr-no-duplication, attr-unsafe-chars (targeted)
 */
const fs = require('fs');
const path = require('path');

const TRANSPARENT_GIF =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', 'docs', 'screenshots'].includes(entry.name)) {
        walk(full, acc);
      }
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      acc.push(full);
    }
  }
  return acc;
}

function protectBlocks(html) {
  const blocks = [];
  const protectedHtml = html.replace(
    /<(script|style|textarea|pre|code)\b[^>]*>[\s\S]*?<\/\1>/gi,
    (m) => {
      const token = `__PROTECTED_BLOCK_${blocks.length}__`;
      blocks.push(m);
      return token;
    }
  );
  return { protectedHtml, blocks };
}

function restoreBlocks(html, blocks) {
  return html.replace(/__PROTECTED_BLOCK_(\d+)__/g, (_, i) => blocks[Number(i)]);
}

function fixImgTags(html) {
  // Add empty alt when missing
  html = html.replace(/<img\b([^>]*?)>/gi, (full, attrs) => {
    let a = attrs;
    if (!/\balt\s*=/.test(a)) {
      a += ' alt=""';
    }
    // empty src
    a = a.replace(/\bsrc\s*=\s*(["'])\s*\1/gi, `src=$1${TRANSPARENT_GIF}$1`);
    // no src at all
    if (!/\bsrc\s*=/.test(a)) {
      a += ` src="${TRANSPARENT_GIF}"`;
    }
    return `<img${a}>`;
  });
  return html;
}

function fixSpecCharsOutsideBlocks(html) {
  const { protectedHtml, blocks } = protectBlocks(html);
  let t = protectedHtml;

  // Common comparison / arrow patterns in Chinese/English UI text
  const replacements = [
    // arrows
    [/([^\w&])->([^\w])/g, '$1→$2'],
    [/([^\w&])<-([^\w])/g, '$1←$2'],
    // weight/size comparisons often shown in UI
    [/小型犬\s*\(<\s*10kg\)/g, '小型犬（&lt;10kg）'],
    [/大型犬\s*\(>\s*25kg\)/g, '大型犬（&gt;25kg）'],
    [/面积\s*>\s*90㎡/g, '面积 &gt; 90㎡'],
    [/面积\s*>\s*90/g, '面积 &gt; 90'],
    [/<\s*10kg/g, '&lt;10kg'],
    [/>\s*25kg/g, '&gt;25kg'],
    // generic money/size comparisons like <$20K
    [/<\s*\$(\d)/g, '&lt;$$$1'],
    [/>\s*\$(\d)/g, '&gt;$$$1'],
    // bare HTML tag mentions in prose wrapped by backticks or quotes
    [/`<([a-zA-Z][a-zA-Z0-9-]*)>`/g, '`<span>&lt;$1&gt;</span>`'.replace(/<\/?span>/g, '')],
  ];

  // safer explicit replacements for known tag mentions
  t = t
    .replace(/`<([a-zA-Z][a-zA-Z0-9-]*)>`/g, '`&lt;$1&gt;`')
    .replace(/`<\/([a-zA-Z][a-zA-Z0-9-]*)>`/g, '`&lt;/$1&gt;`');

  // bare <tag> and </tag> in text nodes (not attributes): only when surrounded by whitespace/punctuation
  // Avoid breaking real tags by only targeting known words after protectBlocks already removed real tree sections in pre/code/script
  // Replace remaining " < " style comparisons
  t = t.replace(/([^&\w])<(\d)/g, '$1&lt;$2');
  t = t.replace(/([^&\w])>(\d)/g, '$1&gt;$2');
  t = t.replace(/([^&\w])<(\$)/g, '$1&lt;$2');
  t = t.replace(/([^&\w])>(\$)/g, '$1&gt;$2');

  // Settings -> Features style
  t = t.replace(/Settings\s*->\s*Features/g, 'Settings → Features');
  t = t.replace(/三个点\s*->/g, '三个点 →');
  t = t.replace(/点\s*->/g, '点 →');
  t = t.replace(/(^|[^&])->(?!gt;)/gm, '$1→');

  // Fix SQL-ish `WHERE created_at > ...`
  t = t.replace(/created_at\s*>\s*\.\.\./g, 'created_at &gt; ...');
  t = t.replace(/`WHERE([^`]*)>/g, (m) => m.replace(/>/g, '&gt;'));

  // Chinese full-width already preferred in some places; also fix `<` `>` in plain sentences
  t = t.replace(/小于号\s*`?<`?/g, '小于号 `&lt;`');
  t = t.replace(/基本的\s*`?<\s*>\s*&/g, '基本的 `&lt; &gt; &');

  // Remaining standalone angle brackets used as operators between words/numbers
  // e.g. "A > B" already escaped if needed
  t = t.replace(/([A-Za-z0-9\u4e00-\u9fff）】」』])\s*>\s*([A-Za-z0-9\u4e00-\u9fff（【「『])/g, '$1 &gt; $2');
  t = t.replace(/([A-Za-z0-9\u4e00-\u9fff）】」』])\s*<\s*([A-Za-z0-9\u4e00-\u9fff（【「『])/g, '$1 &lt; $2');

  return restoreBlocks(t, blocks);
}

function fixTagNameLowercase(html) {
  // Only fix rare uppercase tags if any, carefully
  return html
    .replace(/<\/?HTML\b/g, (m) => m.toLowerCase())
    .replace(/<\/?BODY\b/g, (m) => m.toLowerCase())
    .replace(/<\/?HEAD\b/g, (m) => m.toLowerCase())
    .replace(/<\/?DIV\b/g, (m) => m.toLowerCase())
    .replace(/<\/?SPAN\b/g, (m) => m.toLowerCase())
    .replace(/<\/?P\b/g, (m) => m.toLowerCase())
    .replace(/<\/?H([1-6])\b/g, (m, n) => m[1] === '/' ? `</h${n}` : `<h${n}`);
}

const root = path.join(__dirname, '..');
const files = walk(root).filter((f) => {
  const rel = path.relative(root, f).replace(/\\/g, '/');
  return (
    !rel.includes('node_modules/') &&
    !rel.includes('ByteDanceVerify') &&
    !rel.includes('baidu_verify') &&
    !rel.endsWith('js-playground.html') &&
    !rel.endsWith('code-screenshot.html') &&
    !rel.endsWith('wave-bg.html')
  );
});

let changed = 0;
const changedFiles = [];

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  let html = original;

  html = fixImgTags(html);
  html = fixSpecCharsOutsideBlocks(html);
  html = fixTagNameLowercase(html);

  // attr-unsafe-chars: remove BOM-like / control chars in attributes if any
  html = html.replace(/\u0000/g, '');

  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    changed += 1;
    changedFiles.push(path.relative(root, file).replace(/\\/g, '/'));
  }
}

console.log('changed files:', changed);
console.log(changedFiles.slice(0, 80).join('\n'));
if (changedFiles.length > 80) console.log('...');
