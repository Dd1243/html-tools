/**
 * Repair known damage patterns from previous escape passes:
 * 1) multiline textarea close: </textarea\n  &gt;  -> </textarea>
 * 2) attribute end escaped: attr="..."&gt;text -> attr="...">text  only when it closes a tag
 * 3) broken placeholder with injected img tags
 */
const fs = require('fs');
const path = require('path');

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!['node_modules', '.git', 'docs', 'screenshots'].includes(e.name)) walk(p, acc);
    } else if (e.isFile() && e.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

const root = path.join(__dirname, '..');
const files = walk(root);
let changed = 0;

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  let html = original;

  // 1) </textarea\n spaces &gt;  => </textarea>
  html = html.replace(/<\/textarea\s*\r?\n\s*&gt;/gi, '</textarea>');
  // also: Hello</textarea\n          > already ok; only &gt; case

  // 2) broken tag-close after quoted attr: class="x"&gt;content
  // only when this looks like tag close (next char not =)
  html = html.replace(/(")&gt;(?=\s*[^<\s=])/g, '$1>');
  html = html.replace(/(')&gt;(?=\s*[^<\s=])/g, '$1>');

  // 3) image-alt-checker placeholder was destroyed by img fixer
  html = html.replace(
    /placeholder="在此粘贴包含 <img[^"]*alt=""> 标签的 HTML 代码\.\.\."/g,
    'placeholder="在此粘贴包含 &lt;img&gt; 标签的 HTML 代码..."'
  );
  html = html.replace(
    /placeholder="在此粘贴包含 <img[\s\S]*?alt=""> 标签的 HTML 代码\.\.\."/g,
    'placeholder="在此粘贴包含 &lt;img&gt; 标签的 HTML 代码..."'
  );

  // 4) birthday-reminder duplicate style attr
  html = html.replace(
    /style="display:\s*none"\s*class="animate-fade-in"\s*style="animation-delay:\s*0\.2s"/g,
    'style="display: none; animation-delay: 0.2s" class="animate-fade-in"'
  );

  // 5) font-pair empty stylesheet href
  html = html.replace(
    /<link id="dynamic-fonts" rel="stylesheet" href=""\s*\/?>/g,
    '<link id="dynamic-fonts" rel="stylesheet" href="about:blank" />'
  );

  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    changed += 1;
  }
}

console.log('changed files:', changed);
