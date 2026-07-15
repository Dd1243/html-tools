/**
 * Safely ensure BreadcrumbList JSON-LD:
 * 1) If missing → insert small standalone script before </head>
 * 2) If present in large @graph → only rewrite /#cat → /tools/cat/ inside that script body
 * 3) If present as small standalone BreadcrumbList → rewrite hub URLs / replace that small block only
 * Never touches body UI. Hard safety abort on content shrink / graph loss / h1 loss.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const toolsJson = JSON.parse(fs.readFileSync(path.join(root, 'tools.json'), 'utf8'));
const categories = toolsJson.categories || {};
const catIds = new Set(Object.keys(categories));
const PATH_ALIAS = { pet: 'pets', 'real-estate': 'realestate' };
const SITE = 'https://essays4u.net';

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === '.git') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.isFile() && ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function catFromPath(fp) {
  const rel = path.relative(path.join(root, 'tools'), fp).replace(/\\/g, '/');
  const seg = rel.split('/')[0];
  const mapped = PATH_ALIAS[seg] || seg;
  return catIds.has(mapped) ? mapped : null;
}

function catName(id) {
  return (categories[id] && categories[id].name) || id;
}

function extractTitle(html, fallback) {
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) {
    let t = h1[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
    t = t.replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\s]+/u, '').trim() || t;
    if (t) return t.slice(0, 80);
  }
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) {
    let t = title[1]
      .replace(/<[^>]+>/g, '')
      .split(/[-|–—]/)[0]
      .replace(/\s+/g, ' ')
      .trim();
    if (t) return t.slice(0, 80);
  }
  return fallback;
}

function pageUrl(fp) {
  const rel = path.relative(path.join(root, 'tools'), fp).replace(/\\/g, '/');
  if (/\/index\.html$/i.test(rel) || /^index\.html$/i.test(rel)) {
    const dir = rel.replace(/\/?index\.html$/i, '');
    return `${SITE}/tools/${dir ? dir + '/' : ''}`;
  }
  return `${SITE}/tools/${rel.replace(/\.html$/i, '')}`;
}

function buildLdScript(items) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => {
      const node = {
        '@type': 'ListItem',
        position: i + 1,
        name: it.name,
      };
      if (it.item) node.item = it.item;
      return node;
    }),
  };
  return (
    '<script type="application/ld+json">\n' +
    JSON.stringify(data, null, 2) +
    '\n    </script>'
  );
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
    results.push({ openStart, openEnd, closeEnd, body, openTag: html.slice(openStart, openEnd) });
    openRe.lastIndex = closeEnd;
  }
  return results;
}

function isStandaloneBreadcrumb(body) {
  if (!/"@type"\s*:\s*"BreadcrumbList"/i.test(body)) return false;
  if (/"@graph"/i.test(body)) return false;
  if (body.length > 2500) return false;
  if ((body.match(/"@type"/g) || []).length > 8) return false;
  // avoid TechArticle/WebApplication combined
  if (/"@type"\s*:\s*"(WebApplication|TechArticle|CollectionPage|FAQPage)"/i.test(body)) {
    return false;
  }
  return true;
}

function patchHashUrls(text, catId) {
  if (!catId) return text;
  const hub = `${SITE}/tools/${catId}/`;
  let out = text;
  out = out.replace(
    new RegExp(`${SITE.replace(/\./g, '\\.')}/#${catId.replace(/-/g, '\\-')}`, 'g'),
    hub
  );
  out = out.replace(
    new RegExp(
      `${SITE.replace(/\./g, '\\.')}/tools-directory\\?category=${catId.replace(/-/g, '\\-')}`,
      'g'
    ),
    hub
  );
  return out;
}

function processFile(fp) {
  const before = fs.readFileSync(fp, 'utf8');
  let html = before;
  const cat = catFromPath(fp);
  if (!cat) return { status: 'skip-no-cat' };

  const isHub = /index\.html$/i.test(fp);
  const title = isHub ? catName(cat) : extractTitle(html, path.basename(fp, '.html'));
  const url = pageUrl(fp);
  const items = isHub
    ? [
        { name: '首页', item: `${SITE}/` },
        { name: '全部工具', item: `${SITE}/tools-directory` },
        { name: title, item: url },
      ]
    : [
        { name: '首页', item: `${SITE}/` },
        { name: catName(cat), item: `${SITE}/tools/${cat}/` },
        { name: title, item: url },
      ];

  const scripts = findLdJsonScripts(html);
  const hasAnyBc = scripts.some((s) => /"@type"\s*:\s*"BreadcrumbList"/i.test(s.body));
  const standalone = scripts.filter((s) => isStandaloneBreadcrumb(s.body));

  if (!hasAnyBc) {
    if (!/<\/head>/i.test(html)) return { status: 'fail-no-head' };
    html = html.replace(/<\/head>/i, `    ${buildLdScript(items)}\n  </head>`);
  } else {
    // Patch ALL ld+json bodies for hash category URLs (safe string replace)
    for (let i = scripts.length - 1; i >= 0; i--) {
      const s = scripts[i];
      const patched = patchHashUrls(s.body, cat);
      if (patched !== s.body) {
        html = html.slice(0, s.openEnd) + patched + html.slice(s.openEnd + s.body.length);
      }
    }

    // Optionally normalize small standalone BreadcrumbList to hub-aware version
    const scripts2 = findLdJsonScripts(html);
    const standalone2 = scripts2.filter((s) => isStandaloneBreadcrumb(s.body));
    if (standalone2.length > 0) {
      // only update if missing category hub URL
      const first = standalone2[0];
      const needsHub =
        !isHub && !first.body.includes(`${SITE}/tools/${cat}/`) && !first.body.includes(`/tools/${cat}/`);
      const needsHubHub =
        isHub && !first.body.includes('tools-directory') && !first.body.includes(`/tools/${cat}`);
      if (needsHub || needsHubHub) {
        // remove extra standalones
        for (let i = standalone2.length - 1; i >= 1; i--) {
          const s = standalone2[i];
          html = html.slice(0, s.openStart) + html.slice(s.closeEnd);
        }
        const again = findLdJsonScripts(html).filter((s) => isStandaloneBreadcrumb(s.body));
        if (again[0]) {
          html =
            html.slice(0, again[0].openStart) +
            buildLdScript(items) +
            html.slice(again[0].closeEnd);
        }
      }
    }
  }

  // Safety
  if (html.length < before.length * 0.9) {
    return {
      status: 'abort-shrink',
      beforeLen: before.length,
      afterLen: html.length,
      rel: path.relative(root, fp).replace(/\\/g, '/'),
    };
  }
  if (!/<body[\s\S]*<\/body>/i.test(html)) {
    return { status: 'abort-no-body', rel: path.relative(root, fp).replace(/\\/g, '/') };
  }
  const h1Before = (before.match(/<h1\b/gi) || []).length;
  const h1After = (html.match(/<h1\b/gi) || []).length;
  if (h1Before > 0 && h1After === 0) {
    return { status: 'abort-h1', rel: path.relative(root, fp).replace(/\\/g, '/') };
  }
  const graphBefore = (before.match(/"@graph"/g) || []).length;
  const graphAfter = (html.match(/"@graph"/g) || []).length;
  if (graphAfter < graphBefore) {
    return { status: 'abort-graph-loss', rel: path.relative(root, fp).replace(/\\/g, '/') };
  }
  // body script count shouldn't collapse dramatically
  const bodyScriptsBefore = (before.match(/<script\b/gi) || []).length;
  const bodyScriptsAfter = (html.match(/<script\b/gi) || []).length;
  if (bodyScriptsAfter < bodyScriptsBefore - 2) {
    return {
      status: 'abort-script-loss',
      before: bodyScriptsBefore,
      after: bodyScriptsAfter,
      rel: path.relative(root, fp).replace(/\\/g, '/'),
    };
  }

  if (html === before) return { status: 'unchanged' };
  fs.writeFileSync(fp, html, 'utf8');
  return {
    status: hasAnyBc ? 'updated' : 'added',
    rel: path.relative(root, fp).replace(/\\/g, '/'),
    delta: html.length - before.length,
  };
}

const files = walk(path.join(root, 'tools'));
const stats = { added: 0, updated: 0, unchanged: 0, skipped: 0, aborted: [], samples: [] };

for (const fp of files) {
  const r = processFile(fp);
  if (r.status === 'added') {
    stats.added++;
    if (stats.samples.length < 15) stats.samples.push(`${r.rel} +${r.delta}`);
  } else if (r.status === 'updated') {
    stats.updated++;
    if (stats.samples.length < 15) stats.samples.push(`${r.rel} ~${r.delta}`);
  } else if (r.status === 'unchanged') stats.unchanged++;
  else if (r.status === 'skip-no-cat') stats.skipped++;
  else stats.aborted.push(r);
}

let withLd = 0;
let withoutLd = 0;
const noLd = [];
for (const fp of files) {
  const h = fs.readFileSync(fp, 'utf8');
  if (/"@type"\s*:\s*"BreadcrumbList"/i.test(h)) withLd++;
  else {
    withoutLd++;
    if (noLd.length < 10) noLd.push(path.relative(root, fp).replace(/\\/g, '/'));
  }
}

const checkFiles = [
  'tools/ai/ai-coding-tools-2025.html',
  'tools/ai/index.html',
  'tools/generator/business-card.html',
  'tools/ai-coding/wiki/cursor-rules.html',
  'tools/business/breakeven.html',
];
const integrity = {};
for (const f of checkFiles) {
  const cur = fs.readFileSync(path.join(root, f), 'utf8');
  let headLen = 0;
  try {
    headLen = require('child_process')
      .execSync(`git show HEAD:${f}`, { encoding: 'utf8', maxBuffer: 5e6, cwd: root }).length;
  } catch (_) {}
  integrity[f] = {
    lines: cur.split(/\n/).length,
    len: cur.length,
    headLen,
    delta: cur.length - headLen,
    hasLd: /BreadcrumbList/.test(cur),
    hasGraph: /"@graph"/.test(cur),
    h1: (cur.match(/<h1\b/gi) || []).length,
  };
}

console.log(JSON.stringify({ ...stats, audit: { withLd, withoutLd, noLd }, integrity }, null, 2));
if (stats.aborted.length) process.exitCode = 1;
