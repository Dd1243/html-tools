const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

let sameIssue = 0;
let shellOk = 0;
let divBad = [];
let mainBad = [];
let relLinks = 0;

for (const fp of walk(path.join(root, 'tools'))) {
  const html = fs.readFileSync(fp, 'utf8');
  const rel = path.relative(root, fp).replace(/\\/g, '/');
  if (/<main\s+class="container"/.test(html) && !/class="tool-section"/.test(html)) {
    sameIssue++;
    console.log('STILL', rel);
  }
  if (html.includes('/* layout fix injected */') && html.includes('class="page-shell"')) {
    shellOk++;
    const od = (html.match(/<div\b/gi) || []).length;
    const cd = (html.match(/<\/div>/gi) || []).length;
    const om = (html.match(/<main\b/gi) || []).length;
    const cm = (html.match(/<\/main>/gi) || []).length;
    if (od !== cd) divBad.push({ rel, d: od - cd });
    if (om !== cm) mainBad.push({ rel, m: om + '/' + cm });
  }
  if (/href="[a-zA-Z0-9_-]+\.html"/.test(html) && html.includes('/* layout fix injected */')) {
    // relative links remaining on fixed pages
    const links = [...html.matchAll(/href="([a-zA-Z0-9_-]+\.html)"/g)].map((m) => m[1]);
    if (links.length) {
      relLinks++;
    }
  }
}

console.log(
  JSON.stringify(
    {
      sameIssueLeft: sameIssue,
      shellFixedPages: shellOk,
      divBad: divBad.slice(0, 10),
      mainBad: mainBad.slice(0, 10),
      fixedPagesStillRelative: relLinks,
    },
    null,
    2
  )
);
process.exit(sameIssue || divBad.length || mainBad.length ? 1 : 0);
