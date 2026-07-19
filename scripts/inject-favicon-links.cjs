/**
 * Inject site favicon links into HTML pages that lack them.
 * Uses absolute paths so nested tool pages work correctly.
 */
const fs = require('fs');
const path = require('path');

const FAVICON_BLOCK = `    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
`;

const HAS_ICON_RE =
  /rel=["'](?:shortcut )?icon["']|apple-touch-icon|href=["'][^"']*favicon\.(?:svg|png|ico)/i;

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      ent.name === 'node_modules' ||
      ent.name === '.git' ||
      ent.name === 'scripts' ||
      ent.name === 'docs' ||
      ent.name === 'tests' ||
      ent.name === 'design-reference' ||
      ent.name === 'design-templates' ||
      ent.name === 'templates'
    ) {
      continue;
    }
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function normalizeExistingFavicon(html) {
  // Upgrade relative favicon paths on pages that already have icons (e.g. index)
  let next = html;
  next = next.replace(
    /href=(["'])(?!\/|https?:)favicon\.svg\1/g,
    'href=$1/favicon.svg$1'
  );
  next = next.replace(
    /href=(["'])(?!\/|https?:)favicon-32x32\.png\1/g,
    'href=$1/favicon-32x32.png$1'
  );
  next = next.replace(
    /href=(["'])(?!\/|https?:)favicon-16x16\.png\1/g,
    'href=$1/favicon-16x16.png$1'
  );
  next = next.replace(
    /href=(["'])(?!\/|https?:)apple-touch-icon\.png\1/g,
    'href=$1/apple-touch-icon.png$1'
  );
  return next;
}

function inject(html) {
  if (HAS_ICON_RE.test(html)) {
    return { html: normalizeExistingFavicon(html), action: 'normalized' };
  }

  // Prefer insert after charset/viewport/title block: after <head ...> then early metas
  if (/<head[^>]*>/i.test(html)) {
    // Insert after first <title>...</title> if present, else after <head>
    if (/<title>[\s\S]*?<\/title>/i.test(html)) {
      const next = html.replace(
        /(<title>[\s\S]*?<\/title>)/i,
        `$1\n${FAVICON_BLOCK}`
      );
      return { html: next, action: 'injected-after-title' };
    }
    const next = html.replace(/(<head[^>]*>)/i, `$1\n${FAVICON_BLOCK}`);
    return { html: next, action: 'injected-in-head' };
  }

  return { html, action: 'skipped-no-head' };
}

const root = path.join(__dirname, '..');
const files = walk(root);

let injected = 0;
let normalized = 0;
let skipped = 0;
const samples = [];

for (const fp of files) {
  const before = fs.readFileSync(fp, 'utf8');
  // Skip verification pages and pure redirects maybe keep them simple
  const base = path.basename(fp);
  if (
    base.startsWith('baidu_verify_') ||
    base === 'ByteDanceVerify.html' ||
    base === 'sogou_site_verification.html'
  ) {
    skipped++;
    continue;
  }

  const { html, action } = inject(before);
  if (html === before) {
    if (action.startsWith('skipped')) skipped++;
    else if (action === 'normalized') {
      // already absolute or no relative to fix
      skipped++;
    } else skipped++;
    continue;
  }

  fs.writeFileSync(fp, html, 'utf8');
  if (action === 'normalized') {
    normalized++;
  } else {
    injected++;
  }
  if (samples.length < 20) {
    samples.push({
      file: path.relative(root, fp).replace(/\\/g, '/'),
      action,
    });
  }
}

// Verify coverage after
let withIcon = 0;
let without = 0;
const withoutSamples = [];
for (const fp of walk(root)) {
  const base = path.basename(fp);
  if (base.startsWith('baidu_verify_') || base === 'ByteDanceVerify.html') continue;
  const h = fs.readFileSync(fp, 'utf8');
  if (HAS_ICON_RE.test(h)) withIcon++;
  else {
    without++;
    if (withoutSamples.length < 20) {
      withoutSamples.push(path.relative(root, fp).replace(/\\/g, '/'));
    }
  }
}

console.log(
  JSON.stringify(
    {
      injected,
      normalized,
      skipped,
      samples,
      coverage: { withIcon, without, withoutSamples },
      indexHasAbs:
        /href=["']\/favicon\.svg["']/.test(
          fs.readFileSync(path.join(root, 'index.html'), 'utf8')
        ),
    },
    null,
    2
  )
);
