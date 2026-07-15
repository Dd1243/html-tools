/**
 * Find pages where policy nav may stick to top because a global nav rule
 * sets position:fixed/sticky with top:0 (or similar).
 */
const fs = require('fs');
const path = require('path');

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === '.git') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function extractStyles(html) {
  return (html.match(/<style\b[\s\S]*?<\/style>/gi) || []).join('\n');
}

function hasPolicyNav(html) {
  return /data-site-policy-links/.test(html) || /href=["']\/about["'][\s\S]{0,200}href=["']\/privacy-policy["']/i.test(html);
}

/**
 * Detect dangerous global nav selectors that would affect footer policy nav.
 * Examples:
 *   nav { position: fixed; top: 0; ... }
 *   nav{position:sticky;top:0}
 */
function findDangerousNavRules(css) {
  const hits = [];
  // strip comments
  css = css.replace(/\/\*[\s\S]*?\*\//g, ' ');

  // match nav selectors (not nav.foo, not nav[...]) roughly: (^|}|,) \s* nav \s* ({|,)
  // then look at the following declaration block for position fixed/sticky + top
  const re = /(^|[{},])\s*(nav)\s*([,{])/gi;
  let m;
  while ((m = re.exec(css)) !== null) {
    // find block start after this selector list
    // walk forward to nearest {
    const from = m.index;
    const brace = css.indexOf('{', from);
    if (brace < 0) continue;
    // ensure selector chunk includes bare nav
    const selectorChunk = css.slice(Math.max(0, from - 80), brace);
    // ignore if only compound like .foo nav or nav.bar or nav[ or footer nav
    // Check the specific matched "nav" occurrence context
    const before = css.slice(Math.max(0, m.index - 20), m.index + m[0].length);
    // If previous char is letter/. /# /[ then not bare
    const fullSel = selectorChunk.replace(/\s+/g, ' ');
    // get last selector in list before {
    const lastSel = fullSel.split('{')[0].split(',').pop().trim();
    if (!/^nav$/i.test(lastSel) && !/(^|[\s>+~])nav$/i.test(lastSel.replace(/:[\w-]+(\([^)]*\))?/g, ''))) {
      // allow "nav" alone; reject "nav a", "header nav" etc for false positive reduction?
      // Actually "header nav" would also style policy if nested wrong, but policy is in footer.
      // Critical case is bare `nav`.
      if (!/^nav$/i.test(lastSel)) continue;
    }

    // extract block
    let depth = 0;
    let i = brace;
    for (; i < css.length; i++) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') {
        depth--;
        if (depth === 0) {
          i++;
          break;
        }
      }
    }
    const block = css.slice(brace, i);
    const pos = /position\s*:\s*(fixed|sticky)/i.exec(block);
    const top = /top\s*:\s*0/.test(block);
    if (pos && (top || pos[1].toLowerCase() === 'fixed')) {
      hits.push({
        selector: lastSel,
        position: pos[1],
        hasTop0: top,
        blockPreview: block.replace(/\s+/g, ' ').slice(0, 120),
      });
    }
  }
  return hits;
}

const root = path.join(__dirname, '..');
const files = walk(path.join(root, 'tools')).concat(
  ['index.html', 'about.html', 'contact.html', 'terms.html', 'privacy-policy.html', 'tools-directory.html']
    .map((f) => path.join(root, f))
    .filter((f) => fs.existsSync(f))
);

const issues = [];
for (const fp of files) {
  const html = fs.readFileSync(fp, 'utf8');
  if (!hasPolicyNav(html)) continue;
  const css = extractStyles(html);
  const rules = findDangerousNavRules(css);
  if (rules.length) {
    issues.push({
      file: path.relative(root, fp).replace(/\\/g, '/'),
      rules,
    });
  }
}

console.log(JSON.stringify({ count: issues.length, issues }, null, 2));
