/**
 * Pass 2:
 * - div.breadcrumb (not nav)
 * - dual/conflicting breadcrumb blocks
 * - remaining missing hub links
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const toolsJson = JSON.parse(fs.readFileSync(path.join(root, 'tools.json'), 'utf8'));
const categories = toolsJson.categories || {};
const catIds = new Set(Object.keys(categories));
const PATH_ALIAS = { pet: 'pets', 'real-estate': 'realestate' };

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name.endsWith('.html')) out.push(p);
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

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function extractTitle(html, fallback) {
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) {
    let t = h1[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    t = t.replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\s]+/u, '').trim() || t;
    if (t) return t.slice(0, 60);
  }
  return fallback;
}

function buildToolCrumb(catId, pageTitle) {
  const name = catName(catId);
  return `<nav class="breadcrumb" aria-label="breadcrumb">
        <ol itemscope itemtype="https://schema.org/BreadcrumbList">
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a itemprop="item" href="/"><span itemprop="name">首页</span></a>
            <meta itemprop="position" content="1" />
          </li>
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a itemprop="item" href="/tools/${catId}/"><span itemprop="name">${escapeHtml(name)}</span></a>
            <meta itemprop="position" content="2" />
          </li>
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <span itemprop="name" class="current">${escapeHtml(pageTitle)}</span>
            <meta itemprop="position" content="3" />
          </li>
        </ol>
      </nav>`;
}

function hasHub(html, catId) {
  return (
    html.includes(`href="/tools/${catId}/"`) ||
    html.includes(`href='/tools/${catId}/'`) ||
    html.includes(`href="/tools/${catId}"`) ||
    html.includes(`href='/tools/${catId}'`)
  );
}

const CRUMB_BLOCK_RE =
  /<(?:nav|div)[^>]*(?:class=["'][^"']*\bbreadcrumb\b[^"']*["']|aria-label=["']breadcrumb["'])[^>]*>[\s\S]*?<\/(?:nav|div)>/gi;

let fixed = 0;
const samples = [];

for (const fp of walk(path.join(root, 'tools'))) {
  if (/index\.html$/i.test(fp)) continue;
  const cat = catFromPath(fp);
  if (!cat) continue;

  let html = fs.readFileSync(fp, 'utf8');
  const before = html;
  const rel = path.relative(root, fp).replace(/\\/g, '/');
  const title = extractTitle(html, path.basename(fp, '.html'));
  const standard = buildToolCrumb(cat, title);

  const blocks = html.match(CRUMB_BLOCK_RE) || [];

  // Case A: multiple breadcrumb-like blocks -> keep one standard at first position
  if (blocks.length > 1) {
    let n = 0;
    html = html.replace(CRUMB_BLOCK_RE, () => {
      n++;
      return n === 1 ? standard : '';
    });
  } else if (blocks.length === 1) {
    // Case B: single block but missing hub link
    if (!hasHub(blocks[0], cat)) {
      html = html.replace(CRUMB_BLOCK_RE, standard);
    } else if (/^<div\b/i.test(blocks[0].trim()) || /aria-label=["']breadcrumb["'](?![^>]*class=)/i.test(blocks[0])) {
      // Case C: div.breadcrumb or bare aria nav without class -> upgrade markup
      html = html.replace(CRUMB_BLOCK_RE, standard);
    }
  } else {
    // Case D: no block detected by regex but class exists loosely?
    if (html.includes('class="breadcrumb"') || html.includes("class='breadcrumb'")) {
      // try replace first div.breadcrumb specifically
      if (/<div class="breadcrumb">[\s\S]*?<\/div>/i.test(html) && !hasHub(html, cat)) {
        html = html.replace(/<div class="breadcrumb">[\s\S]*?<\/div>/i, standard);
      }
    }
  }

  // special: first incomplete aria breadcrumb + second good one already handled by multi
  // Ensure at least one standard hub exists
  if (!hasHub(html, cat) || !(html.match(CRUMB_BLOCK_RE) || []).length) {
    // insert after first container open if still missing usable crumb
    if (!/class=["'][^"']*\bbreadcrumb\b/.test(html) && !/aria-label=["']breadcrumb["']/.test(html)) {
      if (/<div class="container[^"]*"[^>]*>/i.test(html)) {
        html = html.replace(
          /(<div class="container[^"]*"[^>]*>)/i,
          `$1\n      ${standard}\n`
        );
      } else if (/<body[^>]*>/i.test(html)) {
        html = html.replace(/<body[^>]*>/i, (m) => `${m}\n    ${standard}\n`);
      }
    } else if (!hasHub(html, cat)) {
      // force replace any breadcrumb-ish
      if (CRUMB_BLOCK_RE.test(html)) {
        html = html.replace(CRUMB_BLOCK_RE, standard);
      }
    }
  }

  // dedupe if still multi
  const afterBlocks = html.match(CRUMB_BLOCK_RE) || [];
  if (afterBlocks.length > 1) {
    let n = 0;
    html = html.replace(CRUMB_BLOCK_RE, () => {
      n++;
      return n === 1 ? standard : '';
    });
  }

  if (html !== before) {
    fs.writeFileSync(fp, html, 'utf8');
    fixed++;
    if (samples.length < 20) samples.push(rel);
  }
}

// final audit
const residual = [];
for (const fp of walk(path.join(root, 'tools'))) {
  if (/index\.html$/i.test(fp)) continue;
  const cat = catFromPath(fp);
  if (!cat) continue;
  const html = fs.readFileSync(fp, 'utf8');
  const blocks = html.match(CRUMB_BLOCK_RE) || [];
  const hasClass = /class=["'][^"']*\bbreadcrumb\b/.test(html);
  if (!hasClass || !hasHub(html, cat) || blocks.length !== 1) {
    residual.push({
      file: path.relative(root, fp).replace(/\\/g, '/'),
      blocks: blocks.length,
      hasClass,
      hasHub: hasHub(html, cat),
    });
  }
}

const bc = fs.readFileSync(path.join(root, 'tools/generator/business-card.html'), 'utf8');
const bcm = bc.match(/class="breadcrumb"[\s\S]{0,400}/);

console.log(
  JSON.stringify(
    {
      fixed,
      samples,
      residualCount: residual.length,
      residual: residual.slice(0, 20),
      businessCardOk: bc.includes('/tools/generator/') && bc.includes('class="breadcrumb"'),
      businessCardSnippet: bcm ? bcm[0].replace(/\s+/g, ' ').slice(0, 280) : 'NO',
    },
    null,
    2
  )
);

if (residual.length) process.exitCode = 1;
