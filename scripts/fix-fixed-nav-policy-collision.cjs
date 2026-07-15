/**
 * Fix footer policy links stuck at top:
 * bare CSS `nav { position: fixed/sticky; top:0 }` also matches
 * <nav data-site-policy-links>.
 *
 * Fix:
 * 1) Rewrite bare selector to nav:not([data-site-policy-links])
 * 2) Add static override for policy nav
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

function rewriteCss(css) {
  let hits = 0;
  // Only rewrite when declaration block has position fixed/sticky.
  // Match: optional whitespace, bare `nav`, then `{ ... }`
  // Avoid nav.foo, nav#, nav[, nav:not already
  const out = css.replace(
    /(^|[{},;\s])nav(\s*\{)([\s\S]*?)(\})/gim,
    (full, pre, brace, body, close) => {
      // if previous chars indicate non-bare, skip (handled by lookbehind-ish via pre)
      // If already scoped somewhere nearby? body check is enough for fixed
      if (!/position\s*:\s*(fixed|sticky)/i.test(body)) return full;
      // If selector already rewritten in a previous pass, full would be nav:not... not matched
      hits++;
      return `${pre}nav:not([data-site-policy-links])${brace}${body}${close}`;
    }
  );
  return { css: out, hits };
}

function injectPolicyOverride(html) {
  if (!/data-site-policy-links/.test(html)) return { html, injected: false };
  if (/\/\*\s*policy-nav-static\s*\*\//.test(html)) return { html, injected: false };

  const snippet = `
    /* policy-nav-static */
    nav[data-site-policy-links] {
      position: static !important;
      top: auto !important;
      left: auto !important;
      right: auto !important;
      bottom: auto !important;
      z-index: auto !important;
      width: auto !important;
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
    }
`;
  if (/<\/style>/i.test(html)) {
    return {
      html: html.replace(/<\/style>/i, `${snippet}    </style>`),
      injected: true,
    };
  }
  return {
    html: html.replace(/<\/head>/i, `<style>${snippet}</style>\n  </head>`),
    injected: true,
  };
}

const root = path.join(__dirname, '..');
const files = walk(path.join(root, 'tools'));
let changed = 0;
let totalHits = 0;
let totalInject = 0;
const samples = [];

for (const fp of files) {
  let html = fs.readFileSync(fp, 'utf8');
  if (!/data-site-policy-links/.test(html)) continue;

  // quick filter: has bare nav fixed/sticky in styles
  const stylesJoined = (html.match(/<style\b[\s\S]*?<\/style>/gi) || []).join('\n');
  const hasBareFixed =
    /(^|[{},;\s])nav\s*\{[\s\S]{0,200}?position\s*:\s*(fixed|sticky)/im.test(stylesJoined);
  if (!hasBareFixed && !/position\s*:\s*(fixed|sticky)/i.test(stylesJoined)) {
    // still inject override if any fixed nav rule might match via other selectors? skip
  }
  if (!hasBareFixed) continue;

  const before = html;
  let hits = 0;
  html = html.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi, (full, attrs, css) => {
    const r = rewriteCss(css);
    hits += r.hits;
    if (r.hits === 0) return full;
    return `<style${attrs}>${r.css}</style>`;
  });

  const inj = injectPolicyOverride(html);
  html = inj.html;
  if (inj.injected) totalInject++;

  if (html === before) continue;
  if (html.length < before.length * 0.9) continue;
  if (!/<body[\s\S]*<\/body>/i.test(html)) continue;

  fs.writeFileSync(fp, html, 'utf8');
  changed++;
  totalHits += hits;
  if (samples.length < 50) {
    samples.push(
      path.relative(root, fp).replace(/\\/g, '/') + ` hits=${hits} inject=${inj.injected ? 1 : 0}`
    );
  }
}

// residual scan
const residual = [];
for (const fp of files) {
  const html = fs.readFileSync(fp, 'utf8');
  if (!/data-site-policy-links/.test(html)) continue;
  const stylesJoined = (html.match(/<style\b[\s\S]*?<\/style>/gi) || []).join('\n');
  if (/(^|[{},;\s])nav\s*\{[\s\S]{0,200}?position\s*:\s*(fixed|sticky)/im.test(stylesJoined)) {
    residual.push(path.relative(root, fp).replace(/\\/g, '/'));
  }
}

// verify cron-generator snippet
const cron = fs.readFileSync(path.join(root, 'tools/dev/cron-generator.html'), 'utf8');
const cronNav = (cron.match(/nav[^{]*\{[^}]*position\s*:\s*fixed[^}]*\}/i) || [''])[0];

console.log(
  JSON.stringify(
    {
      changed,
      totalHits,
      totalInject,
      residualBareFixedNav: residual,
      samples,
      cronNavRule: cronNav.replace(/\s+/g, ' ').slice(0, 160),
      cronHasPolicyStatic: /policy-nav-static/.test(cron),
    },
    null,
    2
  )
);
