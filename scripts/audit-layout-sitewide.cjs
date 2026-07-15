/**
 * Sitewide audit for layout/link issues similar to office4 fix.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const toolsDir = path.join(root, 'tools');

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

const files = walk(toolsDir);
const results = {
  total: files.length,
  mainContainer: [],
  noToolSection: [],
  noSidebar: [],
  noContentLayout: [],
  relativeHtmlLinks: [],
  missingInternalLinks: [],
  brokenRelativeTargets: [],
  noPageShell: [],
  hasMainContainerButNoToolSection: [],
};

for (const fp of files) {
  const rel = path.relative(root, fp).replace(/\\/g, '/');
  const html = fs.readFileSync(fp, 'utf8');
  const hasMainContainer = /<main\s+class="container"/.test(html);
  const hasToolSection = /class="tool-section"/.test(html);
  const hasSidebar = /class="sidebar-section"/.test(html);
  const hasContentLayout = /class="content-layout"/.test(html);
  const hasPageShell = /class="page-shell"/.test(html);

  if (hasMainContainer) results.mainContainer.push(rel);
  if (!hasToolSection) results.noToolSection.push(rel);
  if (!hasSidebar) results.noSidebar.push(rel);
  if (!hasContentLayout) results.noContentLayout.push(rel);
  if (!hasPageShell) results.noPageShell.push(rel);
  if (hasMainContainer && !hasToolSection) results.hasMainContainerButNoToolSection.push(rel);

  // relative *.html links
  const relLinks = [...html.matchAll(/href="([a-zA-Z0-9_-]+\.html)"/g)].map((m) => m[1]);
  if (relLinks.length) {
    results.relativeHtmlLinks.push({ file: rel, links: [...new Set(relLinks)] });
  }

  // absolute /tools/... links that 404
  const absLinks = [...html.matchAll(/href="(\/tools\/[^"#?]+)"/g)].map((m) => m[1]);
  const missing = [];
  for (const u of absLinks) {
    const target = path.join(root, u.replace(/^\//, '') + '.html');
    if (!fs.existsSync(target)) missing.push(u);
  }
  if (missing.length) {
    results.missingInternalLinks.push({ file: rel, links: [...new Set(missing)] });
  }

  // relative *.html that don't exist next to the page
  const brokenRel = [];
  for (const link of relLinks) {
    const target = path.join(path.dirname(fp), link);
    if (!fs.existsSync(target)) brokenRel.push(link);
  }
  if (brokenRel.length) {
    results.brokenRelativeTargets.push({ file: rel, links: [...new Set(brokenRel)] });
  }
}

function sample(arr, n = 15) {
  return arr.slice(0, n);
}

// group by category for mainContainer
const byCat = {};
for (const f of results.hasMainContainerButNoToolSection) {
  const cat = f.split('/')[1] || 'other';
  byCat[cat] = (byCat[cat] || 0) + 1;
}

console.log(
  JSON.stringify(
    {
      totalToolPages: results.total,
      counts: {
        mainContainer: results.mainContainer.length,
        hasMainContainerButNoToolSection: results.hasMainContainerButNoToolSection.length,
        noToolSection: results.noToolSection.length,
        noSidebar: results.noSidebar.length,
        noContentLayout: results.noContentLayout.length,
        noPageShell: results.noPageShell.length,
        pagesWithRelativeHtmlLinks: results.relativeHtmlLinks.length,
        relativeHtmlLinkOccurrences: results.relativeHtmlLinks.reduce((s, x) => s + x.links.length, 0),
        pagesWithMissingAbsInternalLinks: results.missingInternalLinks.length,
        missingAbsInternalLinkOccurrences: results.missingInternalLinks.reduce(
          (s, x) => s + x.links.length,
          0
        ),
        pagesWithBrokenRelativeTargets: results.brokenRelativeTargets.length,
      },
      byCategoryMissingToolSection: byCat,
      sampleMainNoTool: sample(results.hasMainContainerButNoToolSection, 30),
      sampleRelativeLinks: sample(results.relativeHtmlLinks, 20),
      sampleMissingAbs: sample(results.missingInternalLinks, 30),
      sampleBrokenRel: sample(results.brokenRelativeTargets, 20),
      pagesWithToolSection: results.total - results.noToolSection.length,
      pagesWithSidebar: results.total - results.noSidebar.length,
    },
    null,
    2
  )
);
