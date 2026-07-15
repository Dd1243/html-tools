/**
 * Precise fixes for remaining HTMLHint errors based on known patterns.
 * Only edits exact known strings; does not do broad < > rewrites.
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const fileFixes = [
  // comparisons in business tools
  {
    file: 'tools/business/roi-calculator.html',
    pairs: [[/<strong>ROI < 0：<\/strong>/g, '<strong>ROI &lt; 0：</strong>']],
  },
  {
    file: 'tools/business/npv.html',
    pairs: [[/<strong>NPV < 0<\/strong>/g, '<strong>NPV &lt; 0</strong>']],
  },
  {
    file: 'tools/health/bac-calculator.html',
    pairs: [
      [
        /20mg\/100ml ≤ BAC < 80mg\/100ml/g,
        '20mg/100ml ≤ BAC &lt; 80mg/100ml',
      ],
    ],
  },
  {
    file: 'tools/calculator/bitwise-calculator.html',
    pairs: [
      [/L-Shift \(<<\)/g, 'L-Shift (&lt;&lt;)'],
      [/左移 \(L-Shift <<\)：/g, '左移 (L-Shift &lt;&lt;)：'],
    ],
  },
  {
    file: 'tools/text/bbcode-converter.html',
    pairs: [
      [
        /&lt;a href="链接">描述&lt;\/a&gt;/g,
        '&lt;a href="链接"&gt;描述&lt;/a&gt;',
      ],
    ],
  },
  {
    file: 'tools/extractor/regex-extractor.html',
    pairs: [
      [/`https\?:\/\/\[\^\\s<>"\]\+`/g, '`https?://[^\\s&lt;&gt;"]+`'],
      [/`<\[\^>\]\+>`/g, '`&lt;[^&gt;]+&gt;`'],
    ],
  },
  {
    file: 'tools/education/binary-tree.html',
    pairs: [[/ -> /g, ' → ']],
  },
  {
    file: 'tools/design/transform-generator.html',
    pairs: [[/translate -> rotate -> scale -> skew/g, 'translate → rotate → scale → skew']],
  },
  {
    file: 'tools/dev/symbols-table.html',
    pairs: [[/如 `<` 或 `&`/g, '如 `&lt;` 或 `&amp;`']],
  },
  {
    file: 'tools/dev/sql-to-mongo.html',
    pairs: [
      [/HAVING total > 5/g, 'HAVING total &gt; 5'],
      [/<code>><\/code>/g, '<code>&gt;</code>'],
      [/<code>>=<\/code>/g, '<code>&gt;=</code>'],
      [/<code><<\/code>/g, '<code>&lt;</code>'],
      [/<code><=<\/code>/g, '<code>&lt;=</code>'],
    ],
  },
  {
    file: 'tools/dev/semver-compare.html',
    pairs: [
      [/&gt;= 1\.2\.3 <2\.0\.0/g, '&gt;= 1.2.3 &lt;2.0.0'],
      [/&gt;= 1\.2\.3 <1\.3\.0/g, '&gt;= 1.2.3 &lt;1.3.0'],
      [/<code>>=1\.0\.0 <2\.0\.0<\/code>/g, '<code>&gt;=1.0.0 &lt;2.0.0</code>'],
      [/<code>"1\.10\.0" > "1\.2\.0"<\/code>/g, '<code>"1.10.0" &gt; "1.2.0"</code>'],
      [/<code>>=1\.0\.0<\/code>/g, '<code>&gt;=1.0.0</code>'],
    ],
  },
  {
    file: 'tools/dev/regex-generator.html',
    pairs: [
      [/<code><\.\*\?><\/code>/g, '<code>&lt;.*?&gt;</code>'],
      [/<code><\.\*><\/code>/g, '<code>&lt;.*&gt;</code>'],
    ],
  },
  {
    file: 'tools/dev/jsonpath-tester.html',
    pairs: [
      [/价格 < 10 的书/g, '价格 &lt; 10 的书'],
      [/<code><<\/code>/g, '<code>&lt;</code>'],
      [/<code>><\/code>/g, '<code>&gt;</code>'],
    ],
  },
  {
    file: 'tools/dev/jsonpath-query.html',
    pairs: [[/<code>\?\(@\.price < 10\)<\/code>/g, '<code>?(@.price &lt; 10)</code>']],
  },
  {
    file: 'tools/dev/json-path-tester.html',
    pairs: [
      [/价格 < 10/g, '价格 &lt; 10'],
      [/<code>\$\.books\[\?\(@\.price > 20\)\]<\/code>/g, '<code>$.books[?(@.price &gt; 20)]</code>'],
      [
        /<code>\$\.orders\[\?\(@\.amount > 100 && @\.status == 'paid'\)\]\.name<\/code>/g,
        "<code>$.orders[?(@.amount &gt; 100 && @.status == 'paid')].name</code>",
      ],
    ],
  },
  {
    file: 'tools/dev/html-template.html',
    pairs: [[/&lt;!DOCTYPE html>/g, '&lt;!DOCTYPE html&gt;']],
  },
  {
    file: 'tools/dev/crontab-generator.html',
    pairs: [[/<code>>> \/var\/log\/mycron\.log 2>&1<\/code>/g, '<code>&gt;&gt; /var/log/mycron.log 2&gt;&1</code>']],
  },
  {
    file: 'tools/dev/arrow-generator.html',
    pairs: [
      [/<code>-><\/code>/g, '<code>→</code>'],
      [/<code><---\[ logic \]---><\/code>/g, '<code>&lt;---[ logic ]---&gt;</code>'],
    ],
  },
  {
    file: 'tools/data/scatter-plot.html',
    pairs: [
      [/<strong>0\.7 < R < 1<\/strong>/g, '<strong>0.7 &lt; R &lt; 1</strong>'],
      [/<strong>-1 < R < -0\.7<\/strong>/g, '<strong>-1 &lt; R &lt; -0.7</strong>'],
    ],
  },
  {
    file: 'tools/data/correlation-analyzer.html',
    pairs: [
      [/0\.8 ≤ \|r\| < 1/g, '0.8 ≤ |r| &lt; 1'],
      [/0\.5 ≤ \|r\| < 0\.8/g, '0.5 ≤ |r| &lt; 0.8'],
      [/0\.3 ≤ \|r\| < 0\.5/g, '0.3 ≤ |r| &lt; 0.5'],
    ],
  },
  {
    file: 'tools/media/base64-image.html',
    // inspect first if needed
    pairs: [],
  },
  {
    file: 'tools/design/color-blindness-simulator.html',
    // SVG feColorMatrix is valid uppercase camel in SVG; ignore or lowercase carefully
    pairs: [],
  },
  {
    file: 'tools/generator/favicon-generator.html',
    pairs: [],
  },
  {
    file: 'tools/media/favicon-generator.html',
    pairs: [],
  },
];

// Generic safe replacements across error files
function genericTextFixes(html) {
  // Only within code/strong/li text patterns commonly remaining
  return html
    .replace(/ROI < 0/g, 'ROI &lt; 0')
    .replace(/NPV < 0/g, 'NPV &lt; 0')
    .replace(/NPV > 0/g, 'NPV &gt; 0')
    .replace(/ROI > 0/g, 'ROI &lt;'.includes('x') ? 'ROI &gt; 0' : 'ROI &gt; 0')
    .replace(/L-Shift \(<</g, 'L-Shift (&lt;&lt;')
    .replace(/左移 \(L-Shift <</g, '左移 (L-Shift &lt;&lt;')
    .replace(/价格 < 10/g, '价格 &lt; 10')
    .replace(/total > 5/g, 'total &gt; 5')
    .replace(/price > 20/g, 'price &gt; 20')
    .replace(/amount > 100/g, 'amount &gt; 100')
    .replace(/BAC < 80/g, 'BAC &lt; 80')
    .replace(/显存 >= 4GB/g, '显存 &gt;= 4GB')
    .replace(/\|r\| < /g, '|r| &lt; ')
    .replace(/0\.7 < R < 1/g, '0.7 &lt; R &lt; 1')
    .replace(/-1 < R < -0\.7/g, '-1 &lt; R &lt; -0.7')
    .replace(/&gt;= 1\.2\.3 <2\.0\.0/g, '&gt;= 1.2.3 &lt;2.0.0')
    .replace(/&gt;= 1\.2\.3 <1\.3\.0/g, '&gt;= 1.2.3 &lt;1.3.0')
    .replace(/>=1\.0\.0 <2\.0\.0/g, '&gt;=1.0.0 &lt;2.0.0')
    .replace(/"1\.10\.0" > "1\.2\.0"/g, '"1.10.0" &gt; "1.2.0"')
    .replace(/>=1\.0\.0/g, '&gt;=1.0.0')
    .replace(/<code>>><\/code>/g, '<code>&gt;&gt;</code>')
    .replace(/<code>>><\/code>/g, '<code>&gt;&gt;</code>')
    .replace(/<code>>><\/code>/g, '<code>&gt;&gt;</code>')
    .replace(/<code>><\/code>/g, '<code>&gt;</code>')
    .replace(/<code>>=<\/code>/g, '<code>&gt;=</code>')
    .replace(/<code><<\/code>/g, '<code>&lt;</code>')
    .replace(/<code><=<\/code>/g, '<code>&lt;=</code>')
    .replace(/<code>-><\/code>/g, '<code>→</code>')
    .replace(/ -> /g, ' → ')
    .replace(/&lt;!DOCTYPE html>/g, '&lt;!DOCTYPE html&gt;')
    .replace(/&lt;a href="链接">/g, '&lt;a href="链接"&gt;')
    .replace(/>> \/var\/log\/mycron\.log 2>&1/g, '&gt;&gt; /var/log/mycron.log 2&gt;&1')
    .replace(/<---\[ logic \]--->/g, '&lt;---[ logic ]---&gt;')
    .replace(/如 `<` 或 `&`/g, '如 `&lt;` 或 `&amp;`')
    .replace(/<code><\.\*\?><\/code>/g, '<code>&lt;.*?&gt;</code>')
    .replace(/<code><\.\*><\/code>/g, '<code>&lt;.*&gt;</code>')
    .replace(/`https\?:\/\/\[\^\\s<>"\]\+`/g, '`https?://[^\\s&lt;&gt;"]+`')
    .replace(/`<\[\^>\]\+>`/g, '`&lt;[^&gt;]+&gt;`');
}

// Collect current error files
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

const beforeOut = collect();
const before = parse(beforeOut);
const beforeRules = {};
for (const e of before) beforeRules[e.rule] = (beforeRules[e.rule] || 0) + 1;
console.log('before', before.length, beforeRules);

const files = [...new Set(before.map((e) => e.file))];
let changed = 0;

for (const rel of files) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) continue;
  const original = fs.readFileSync(full, 'utf8');
  let html = original;

  // file specific pairs
  for (const item of fileFixes) {
    if (item.file === rel) {
      for (const [re, to] of item.pairs) html = html.replace(re, to);
    }
  }

  html = genericTextFixes(html);

  // base64-image special: often broken meta description line with unescaped quotes/angles
  if (rel === 'tools/media/base64-image.html' || rel === 'tools/dev/html-entity-encoder.html') {
    // leave structural meta alone if already valid; only escape bare < in content attrs
    html = html.replace(
      /(<meta\b[^>]*\bcontent=")([^"]*)(")/gi,
      (m, a, content, c) => a + content.replace(/</g, '&lt;').replace(/>/g, '&gt;') + c
    );
  }

  // svg feColorMatrix: HTMLHint wants lowercase in HTML docs; SVG filter elements are case-sensitive in XML
  // Keep as-is for correctness in browsers for HTML5 inline SVG? Actually HTML5 parses SVG tags case-insensitively for known elements.
  // Safer: leave tagname-lowercase alone.

  if (html !== original) {
    fs.writeFileSync(full, html, 'utf8');
    changed += 1;
  }
}

console.log('changed files', changed);

// repair any accidental tag close damage again
for (const rel of files) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) continue;
  const original = fs.readFileSync(full, 'utf8');
  let html = original;
  html = html.replace(/<([a-zA-Z][\w:-]*)&gt;/g, '<$1>');
  html = html.replace(/<\/([a-zA-Z][\w:-]*)&gt;/g, '</$1>');
  // only fix attr-close damage when followed by text content, not operators in code intentionally
  // skip broad " &gt; now
  if (html !== original) fs.writeFileSync(full, html, 'utf8');
}

const afterOut = collect();
fs.writeFileSync(path.join(root, 'htmlhint-full.txt'), afterOut, 'utf8');
const after = parse(afterOut);
const afterRules = {};
for (const e of after) afterRules[e.rule] = (afterRules[e.rule] || 0) + 1;
console.log('after', after.length, afterRules);
console.log(afterOut.match(/Scanned[^\n]+/)?.[0] || '');
const seen = new Set();
for (const e of after) {
  const key = `${e.file}:${e.line}:${e.rule}`;
  if (seen.has(key)) continue;
  seen.add(key);
  const lines = fs.readFileSync(path.join(root, e.file), 'utf8').split(/\n/);
  console.log(`[${e.rule}] ${e.file}:${e.line} :: ${JSON.stringify((lines[e.line - 1] || '').trim().slice(0, 180))}`);
}
