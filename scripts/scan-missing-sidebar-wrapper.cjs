/**
 * Find pages with page-body flex layout + .sidebar CSS
 * but no element with class sidebar in the body.
 * Ignores content inside <script> and <style>.
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

function stripScriptsStyles(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ');
}

function bodyOnly(html) {
  const m = html.match(/<body\b[^>]*>([\s\S]*)<\/body>/i);
  return m ? m[1] : html;
}

const hits = [];
for (const fp of walk(path.join(__dirname, '..', 'tools'))) {
  const raw = fs.readFileSync(fp, 'utf8');
  const rel = path.relative(path.join(__dirname, '..'), fp).replace(/\\/g, '/');
  const style = (raw.match(/<style\b[\s\S]*?<\/style>/gi) || []).join('\n');
  const body = stripScriptsStyles(bodyOnly(raw));

  const expectsSidebarLayout =
    /\.page-body\s*\{[\s\S]{0,200}display\s*:\s*flex/i.test(style) &&
    /\.sidebar\s*\{/.test(style) &&
    /class=["'][^"']*\bpage-body\b/.test(body) &&
    /class=["'][^"']*\bmain-content\b/.test(body);

  if (!expectsSidebarLayout) continue;

  const hasSidebarEl = /<(?:div|aside)\b[^>]*class=["'][^"']*\bsidebar\b/.test(body);
  if (!hasSidebarEl) {
    hits.push(rel);
  }
}

// also report real div imbalance ignoring script/style
const divIssues = [];
for (const fp of walk(path.join(__dirname, '..', 'tools'))) {
  const raw = fs.readFileSync(fp, 'utf8');
  const markup = stripScriptsStyles(raw);
  const open = (markup.match(/<div\b/gi) || []).length;
  const close = (markup.match(/<\/div>/gi) || []).length;
  if (open !== close) {
    divIssues.push({
      rel: path.relative(path.join(__dirname, '..'), fp).replace(/\\/g, '/'),
      diff: open - close,
      open,
      close,
    });
  }
}

console.log(
  JSON.stringify(
    {
      missingSidebarWrapper: hits,
      divMismatchIgnoringScript: divIssues,
    },
    null,
    2
  )
);
