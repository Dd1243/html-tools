/**
 * Conservative cleanup: remove standalone WebApplication JSON-LD
 * from pages that are primarily TechArticle/Article content guides.
 * Does not touch body UI. Only removes small standalone WebApplication scripts.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function findLdJsonScripts(html) {
  const results = [];
  const openRe = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>/gi;
  let m;
  while ((m = openRe.exec(html)) !== null) {
    const openStart = m.index;
    const openEnd = openStart + m[0].length;
    const closeIdx = html.indexOf('</script>', openEnd);
    if (closeIdx < 0) continue;
    const closeEnd = closeIdx + '</script>'.length;
    const body = html.slice(openEnd, closeIdx);
    results.push({ openStart, closeEnd, body });
    openRe.lastIndex = closeEnd;
  }
  return results;
}

function isStandaloneWebApp(body) {
  if (!/"@type"\s*:\s*"WebApplication"/i.test(body)) return false;
  if (/"@graph"/i.test(body)) return false;
  if (body.length > 2500) return false;
  if (/"@type"\s*:\s*"(TechArticle|Article|CollectionPage|FAQPage|BreadcrumbList)"/i.test(body)) {
    return false;
  }
  // only WebApplication + Offer roughly
  return true;
}

function isArticlePrimary(html, rel) {
  if (/"@type"\s*:\s*"TechArticle"/i.test(html)) return true;
  if (/\/wiki\//i.test(rel)) return true;
  if (/(guide|outlook|ecosystem|pricing|models|shortcuts|templates|clients|resources)/i.test(rel)) {
    // only if not strongly interactive tool
    const body = (html.match(/<body[\s\S]*<\/body>/i) || [''])[0];
    const interactive =
      (/<textarea\b/i.test(body) || /<input\b/i.test(body) || /<select\b/i.test(body)) &&
      /<button\b/i.test(body);
    // token-counter / prompt-templates may be tools; keep if clearly tool-like name
    if (/token-counter|prompt-templates|cursor-shortcuts/i.test(rel) && interactive) return false;
    // guide pages even with some inputs still article-primary if TechArticle already handled
    if (/guide|outlook|ecosystem|pricing|models|clients|resources/i.test(rel)) return true;
  }
  return false;
}

let removed = 0;
const samples = [];
const aborted = [];

for (const fp of walk(path.join(root, 'tools'))) {
  const rel = path.relative(root, fp).replace(/\\/g, '/');
  let html = fs.readFileSync(fp, 'utf8');
  if (!isArticlePrimary(html, rel)) continue;
  if (!/"@type"\s*:\s*"WebApplication"/i.test(html)) continue;

  const scripts = findLdJsonScripts(html).filter((s) => isStandaloneWebApp(s.body));
  if (!scripts.length) continue;

  const before = html;
  // remove from end
  for (let i = scripts.length - 1; i >= 0; i--) {
    const s = scripts[i];
    html = html.slice(0, s.openStart) + html.slice(s.closeEnd);
  }
  // clean extra blank lines near head
  html = html.replace(/\n{3,}(\s*<\/head>)/i, '\n  $1');

  if (html.length < before.length * 0.5) {
    aborted.push(rel);
    continue;
  }
  if (!/<body[\s\S]*<\/body>/i.test(html)) {
    aborted.push(rel + ' no-body');
    continue;
  }
  // TechArticle must remain if it existed
  if (/"@type"\s*:\s*"TechArticle"/i.test(before) && !/"@type"\s*:\s*"TechArticle"/i.test(html)) {
    aborted.push(rel + ' tech-loss');
    continue;
  }

  fs.writeFileSync(fp, html, 'utf8');
  removed++;
  if (samples.length < 20) samples.push(rel);
}

console.log(JSON.stringify({ removed, samples, aborted }, null, 2));
if (aborted.length) process.exitCode = 1;
