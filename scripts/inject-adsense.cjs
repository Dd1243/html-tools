/**
 * Site-level AdSense Auto Ads script injection.
 * Injects once per HTML page into <head> if missing.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const CLIENT = 'ca-pub-9979971494108572';
const MARKER = 'pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
const SNIPPET = `    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}" crossorigin="anonymous"></script>\n`;

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === '.git' || name === 'scripts') continue;
      walk(p, acc);
    } else if (name.endsWith('.html')) {
      acc.push(p);
    }
  }
  return acc;
}

const files = walk(root);
let injected = 0;
let skipped = 0;
let failed = 0;
const fails = [];

for (const fp of files) {
  let html = fs.readFileSync(fp, 'utf8');
  if (html.includes(MARKER) && html.includes(CLIENT)) {
    skipped++;
    continue;
  }

  // remove broken/partial previous adsense tags for this client if any
  html = html.replace(
    /<script[^>]*adsbygoogle\.js[^>]*>\s*<\/script>\s*/gi,
    ''
  );

  if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, SNIPPET + '  </head>');
  } else if (/<head[^>]*>/i.test(html)) {
    html = html.replace(/<head[^>]*>/i, (m) => m + '\n' + SNIPPET);
  } else {
    failed++;
    fails.push(path.relative(root, fp).replace(/\\/g, '/'));
    continue;
  }

  fs.writeFileSync(fp, html, 'utf8');
  injected++;
}

// verify samples
const samples = [
  'index.html',
  'tools/crypto/ico-calculator.html',
  'tools/design/card-generator.html',
  'tools/text/reading-time.html',
].map((f) => {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) return { f, exists: false };
  const h = fs.readFileSync(p, 'utf8');
  return {
    f,
    exists: true,
    has: h.includes(MARKER) && h.includes(CLIENT),
  };
});

console.log(
  JSON.stringify(
    {
      totalHtml: files.length,
      injected,
      skipped,
      failed,
      fails: fails.slice(0, 10),
      samples,
      adsTxt: fs.readFileSync(path.join(root, 'ads.txt'), 'utf8').trim(),
    },
    null,
    2
  )
);

process.exit(failed ? 1 : 0);
