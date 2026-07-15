const fs = require('fs');
const path = require('path');

function walk(d, o = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, o);
    else if (e.name.endsWith('.html')) o.push(p);
  }
  return o;
}

const files = walk(path.join(__dirname, '..', 'tools'));
const counts = {
  WebApplication: 0,
  SoftwareApplication: 0,
  TechArticle: 0,
  WebPage: 0,
  CollectionPage: 0,
  FAQPage: 0,
  BreadcrumbList: 0,
  Article: 0,
};
const toolLike = [];
const articleLike = [];
const hubLike = [];
const noneAppTool = [];

for (const f of files) {
  const rel = path.relative(path.join(__dirname, '..'), f).replace(/\\/g, '/');
  const h = fs.readFileSync(f, 'utf8');
  const isHub = /index\.html$/i.test(f);
  const isWiki = /\/wiki\//.test(rel) || /guide|outlook|2025|2026/.test(path.basename(f));
  for (const k of Object.keys(counts)) {
    if (new RegExp(`"@type"\\s*:\\s*"${k}"`).test(h)) counts[k]++;
  }
  const hasApp = /"@type"\s*:\s*"(WebApplication|SoftwareApplication)"/.test(h);
  if (isHub) hubLike.push(rel);
  else if (isWiki && !hasApp) articleLike.push(rel);
  else if (!hasApp) noneAppTool.push(rel);
  if (hasApp && toolLike.length < 5) toolLike.push(rel);
}

console.log(
  JSON.stringify(
    {
      total: files.length,
      counts,
      hubs: hubLike.length,
      samplesWithApp: toolLike,
      samplesNoAppTools: noneAppTool.slice(0, 15),
      noAppToolCount: noneAppTool.length,
    },
    null,
    2
  )
);
