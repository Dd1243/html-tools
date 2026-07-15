/**
 * Find tool pages that reference an output element in JS/CSS but missing in body markup.
 * Focus: getElementById("xxx") where xxx not present as id in body (excluding script).
 */
const fs = require('fs');
const path = require('path');

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function bodyWithoutScripts(html) {
  const m = html.match(/<body\b[^>]*>([\s\S]*)<\/body>/i);
  const body = m ? m[1] : html;
  return body.replace(/<script\b[\s\S]*?<\/script>/gi, ' ');
}

const hits = [];
for (const fp of walk(path.join(__dirname, '..', 'tools'))) {
  const html = fs.readFileSync(fp, 'utf8');
  const rel = path.relative(path.join(__dirname, '..'), fp).replace(/\\/g, '/');
  const body = bodyWithoutScripts(html);
  const scripts = (html.match(/<script\b[\s\S]*?<\/script>/gi) || []).join('\n');

  // common output ids
  const ids = new Set();
  const re = /getElementById\(\s*['"]([A-Za-z0-9_-]+)['"]\s*\)/g;
  let m;
  while ((m = re.exec(scripts)) !== null) ids.add(m[1]);

  // also textContent/innerHTML assignment targets already covered by getElementById
  const missing = [];
  for (const id of ids) {
    // ignore theme/toast/common controls if present in script only as optional
    if (!new RegExp(`id=["']${id}["']`).test(body)) {
      // only report if used as output-like (textContent/innerHTML/value assignment)
      const usedAsOutput = new RegExp(
        `getElementById\\(\\s*['"]${id}['"]\\s*\\)\\s*\\.?\\s*(textContent|innerHTML|value)\\s*=`
      ).test(scripts);
      const usedAsOutput2 = new RegExp(
        `getElementById\\(\\s*['"]${id}['"]\\s*\\)\\s*\\)\\s*\\.textContent\\s*=`
      ).test(scripts);
      if (
        usedAsOutput ||
        new RegExp(
          `document\\.getElementById\\(\\s*['"]${id}['"]\\s*\\)\\.textContent\\s*=`
        ).test(scripts) ||
        new RegExp(
          `document\\.getElementById\\(\\s*['"]${id}['"]\\s*\\)\\.innerHTML\\s*=`
        ).test(scripts)
      ) {
        missing.push(id);
      }
    }
  }

  // CSS defines output-panel but no element
  const hasOutputCss = /\.output-panel\s*\{/.test(html);
  const hasOutputEl = /class=["'][^"']*\boutput-panel\b/.test(body);

  if (missing.length || (hasOutputCss && !hasOutputEl)) {
    hits.push({
      rel,
      missingIds: missing,
      outputCssWithoutEl: hasOutputCss && !hasOutputEl,
    });
  }
}

console.log(JSON.stringify({ count: hits.length, hits: hits.slice(0, 80) }, null, 2));
