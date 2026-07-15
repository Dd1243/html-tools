const { execSync } = require('child_process');
const fs = require('fs');

const html = execSync('git show 8a358c9b:tools/dev/nginx-generator.html', {
  encoding: 'utf8',
  maxBuffer: 5e6,
});
const i = html.indexOf('<main class="main-grid">');
const j = html.indexOf('</main>', i);
const main = html.slice(i, j + 7);
fs.writeFileSync('scripts/_nginx-main-hist.html', main, 'utf8');
console.log('main length', main.length);
console.log(main.slice(-1200));

const files = [
  'tools/dev/nginx-config-generator.html',
  'tools/dev/nginx-config.html',
  'tools/security/robots-generator.html',
  'tools/security/sitemap-generator.html',
  'tools/dev/package-json-editor.html',
  'tools/dev/package-json-gen.html',
];
for (const f of files) {
  const cur = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
  let hist = '';
  try {
    hist = execSync(`git show 8a358c9b:${f}`, { encoding: 'utf8', maxBuffer: 5e6 });
  } catch {
    hist = '';
  }
  console.log({
    f,
    exists: fs.existsSync(f),
    curCode: cur.includes('id="codeOutput"'),
    histCode: hist.includes('id="codeOutput"'),
    curHasOutputPanel: /class=["'][^"']*\boutput-panel\b/.test(cur),
    histHasOutputPanel: /class=["'][^"']*\boutput-panel\b/.test(hist),
  });
}
