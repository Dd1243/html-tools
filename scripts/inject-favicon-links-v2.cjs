/**
 * Inject real favicon <link> tags only when missing.
 * Previous pass wrongly treated pages containing the word "favicon" as already configured.
 */
const fs = require('fs');
const path = require('path');

const FAVICON_BLOCK = `    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
`;

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      [
        'node_modules',
        '.git',
        'scripts',
        'docs',
        'tests',
        'design-reference',
        'design-templates',
        'templates',
      ].includes(ent.name)
    ) {
      continue;
    }
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function hasRealFaviconLink(html) {
  const links = html.match(/<link\b[^>]*>/gi) || [];
  return links.some(
    (tag) =>
      /rel\s*=\s*["'](?:shortcut\s+)?icon["']/i.test(tag) ||
      /rel\s*=\s*["']apple-touch-icon["']/i.test(tag)
  );
}

function inject(html) {
  if (hasRealFaviconLink(html)) {
    // Ensure absolute paths if relative favicons exist
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
    return { html: next, action: next === html ? 'already' : 'normalized' };
  }

  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    return {
      html: html.replace(/(<title>[\s\S]*?<\/title>)/i, `$1\n${FAVICON_BLOCK}`),
      action: 'injected-after-title',
    };
  }
  if (/<head[^>]*>/i.test(html)) {
    return {
      html: html.replace(/(<head[^>]*>)/i, `$1\n${FAVICON_BLOCK}`),
      action: 'injected-in-head',
    };
  }
  return { html, action: 'skipped-no-head' };
}

const root = path.join(__dirname, '..');
const files = walk(root);
const changed = [];
let already = 0;

for (const fp of files) {
  const base = path.basename(fp);
  if (base.startsWith('baidu_verify_') || base === 'ByteDanceVerify.html') continue;

  const before = fs.readFileSync(fp, 'utf8');
  const { html, action } = inject(before);
  if (action === 'already') {
    already++;
    continue;
  }
  if (html !== before) {
    fs.writeFileSync(fp, html, 'utf8');
    changed.push({
      file: path.relative(root, fp).replace(/\\/g, '/'),
      action,
    });
  }
}

// verify target + remaining
const still = [];
for (const fp of walk(root)) {
  const base = path.basename(fp);
  if (base.startsWith('baidu_verify_') || base === 'ByteDanceVerify.html') continue;
  const html = fs.readFileSync(fp, 'utf8');
  if (!hasRealFaviconLink(html)) {
    still.push(path.relative(root, fp).replace(/\\/g, '/'));
  }
}

const target = fs.readFileSync(
  path.join(root, 'tools/media/favicon-generator.html'),
  'utf8'
);

console.log(
  JSON.stringify(
    {
      changedCount: changed.length,
      changed,
      already,
      stillMissing: still,
      targetHasIcon: hasRealFaviconLink(target),
      targetHasSvg: /href=["']\/favicon\.svg["']/.test(target),
    },
    null,
    2
  )
);
