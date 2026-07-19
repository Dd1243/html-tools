/**
 * Lightweight AdSense readiness audit (code-level signals only).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === '.git') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function textLen(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim().length;
}

function has(html, re) {
  return re.test(html);
}

const files = walk(root).filter((f) => !f.includes(`${path.sep}design-`));
const toolsFiles = files.filter((f) => f.includes(`${path.sep}tools${path.sep}`));

let withAdsense = 0;
let withCanonical = 0;
let withMetaDesc = 0;
let withH1 = 0;
let withPolicyFooter = 0;
let thinPages = [];
let noNav = [];
let noContactish = [];
let missingCanonical = [];
let multiH1 = [];
let noRobotsIndex = 0;
let nofollow = [];

for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const rel = path.relative(root, f).replace(/\\/g, '/');
  if (html.includes('adsbygoogle') || html.includes('ca-pub-')) withAdsense++;
  if (/rel=["']canonical["']/.test(html)) withCanonical++;
  else if (!/404\.html$/.test(rel)) missingCanonical.push(rel);
  if (/name=["']description["']/.test(html)) withMetaDesc++;
  const body = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const h1n = (body.match(/<h1\b/gi) || []).length;
  if (h1n === 1) withH1++;
  if (h1n > 1) multiH1.push(rel);
  if (/privacy-policy|\/about|\/contact|\/terms/.test(html)) withPolicyFooter++;
  const tl = textLen(html);
  if (tl < 400 && !/404\.html$/.test(rel) && !/baidu_verify/.test(rel)) {
    thinPages.push({ rel, tl });
  }
  if (!/(nav|breadcrumb|footer|tools-directory|\/about|\/contact)/i.test(html) && rel.startsWith('tools/')) {
    noNav.push(rel);
  }
  if (/noindex/i.test(html)) noRobotsIndex++;
  if (/content=["'][^"']*nofollow/i.test(html)) nofollow.push(rel);
}

// policy page quality
const policyPages = ['about.html', 'contact.html', 'terms.html', 'privacy-policy.html'];
const policyInfo = {};
for (const p of policyPages) {
  const html = fs.readFileSync(path.join(root, p), 'utf8');
  policyInfo[p] = {
    chars: textLen(html),
    hasEmail: /@|mailto:|email|邮箱|联系/i.test(html),
    hasAdsense: /adsbygoogle|ca-pub-/.test(html),
    hasH1: /<h1\b/i.test(html),
  };
}

// adsense coverage on tool pages
let toolWithAd = 0;
let toolWithoutAd = [];
for (const f of toolsFiles) {
  const html = fs.readFileSync(f, 'utf8');
  if (html.includes('adsbygoogle') || html.includes('ca-pub-')) toolWithAd++;
  else if (toolWithoutAd.length < 15) toolWithoutAd.push(path.relative(root, f).replace(/\\/g, '/'));
}

// sample content quality: pure template-ish descriptions
let templateDesc = 0;
for (const f of toolsFiles.slice(0, 200)) {
  const html = fs.readFileSync(f, 'utf8');
  if (/是 WebUtils 的.*工具，适用于/.test(html)) templateDesc++;
}

// duplicate titles rough
const titles = new Map();
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!m) continue;
  const t = m[1].replace(/\s+/g, ' ').trim();
  if (!titles.has(t)) titles.set(t, []);
  titles.get(t).push(path.relative(root, f).replace(/\\/g, '/'));
}
const dupTitles = [...titles.entries()].filter(([, arr]) => arr.length > 1).slice(0, 10);

console.log(
  JSON.stringify(
    {
      totals: {
        htmlFiles: files.length,
        toolHtml: toolsFiles.length,
        withAdsense,
        toolWithAd,
        toolWithoutAdCount: toolsFiles.length - toolWithAd,
        withCanonical,
        withMetaDesc,
        withExactOneH1ish: withH1,
        multiH1: multiH1.length,
        noindexPages: noRobotsIndex,
      },
      policyInfo,
      thinPagesTop: thinPages.sort((a, b) => a.tl - b.tl).slice(0, 15),
      thinCount: thinPages.length,
      missingCanonicalCount: missingCanonical.length,
      missingCanonicalSamples: missingCanonical.slice(0, 10),
      toolWithoutAdSamples: toolWithoutAd,
      templateDescInSample200: templateDesc,
      dupTitlesCount: [...titles.values()].filter((a) => a.length > 1).length,
      dupTitleSamples: dupTitles,
      sitemapUrls: (fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8').match(/<url>/g) || []).length,
      robotsAllowsAll: /User-agent:\s*\*\s*Allow:\s*\//i.test(fs.readFileSync(path.join(root, 'robots.txt'), 'utf8')),
    },
    null,
    2
  )
);
