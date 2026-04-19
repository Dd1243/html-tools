const fs = require('fs');
const path = require('path');

const DEV_DIR = path.resolve(__dirname, '../tools/dev');
const SITE_URL = 'https://essays4u.net';
const SITE_NAME = 'WebUtils';
const DEFAULT_IMAGE = `${SITE_URL}/social-preview.png`;
const CHECK_ONLY = process.argv.includes('--check');

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getTitle(html) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : '';
}

function getMetaContent(html, key, attribute = 'name') {
  const pattern = new RegExp(
    `<meta\\s+[^>]*${attribute}=["']${escapeRegExp(key)}["'][^>]*content=["']([\\s\\S]*?)["'][^>]*>`,
    'i'
  );
  const match = html.match(pattern);
  return match ? match[1].trim() : '';
}

function getCanonical(html) {
  const match = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  return match ? match[1].trim() : '';
}

function insertBeforeHeadEnd(html, snippet) {
  if (html.includes(snippet)) {
    return html;
  }
  return html.replace(/\s*<\/head>/i, `\n${snippet}\n  </head>`);
}

function upsertMeta(html, attribute, key, content) {
  const tag = `    <meta ${attribute}="${key}" content="${escapeHtml(content)}" />`;
  const pattern = new RegExp(`<meta\\s+[^>]*${attribute}=["']${escapeRegExp(key)}["'][^>]*>`, 'i');
  return pattern.test(html) ? html.replace(pattern, tag) : insertBeforeHeadEnd(html, tag);
}

function upsertLinkCanonical(html, href) {
  const tag = `    <link rel="canonical" href="${href}" />`;
  const pattern = /<link\s+[^>]*rel=["']canonical["'][^>]*>/i;
  return pattern.test(html) ? html.replace(pattern, tag) : insertBeforeHeadEnd(html, tag);
}

function buildJsonLd(name, description, url) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  };

  const lines = JSON.stringify(data, null, 2)
    .split('\n')
    .map((line) => `      ${line}`);

  return ['    <script type="application/ld+json">', ...lines, '    </script>'].join('\n');
}

function hasJsonLd(html) {
  return /<script[^>]+type=["']application\/ld\+json["']/i.test(html);
}

function normalizedNameFromTitle(title, fallback) {
  const cleaned = title.replace(/\s*[|｜-]\s*WebUtils\s*$/i, '').trim();
  return cleaned || fallback;
}

function analyze(html, fileName) {
  const slug = fileName.replace(/\.html$/i, '');
  const expectedUrl = `${SITE_URL}/tools/dev/${slug}`;
  const title = getTitle(html) || slug;
  const description = getMetaContent(html, 'description') || `${title}，免费在线开发者工具。`;
  const appName = normalizedNameFromTitle(title, slug);
  const canonical = getCanonical(html);

  const hasOgTitle = /<meta\s+[^>]*property=["']og:title["'][^>]*content=/i.test(html);
  const hasOgDescription = /<meta\s+[^>]*property=["']og:description["'][^>]*content=/i.test(html);
  const hasOgType = /<meta\s+[^>]*property=["']og:type["'][^>]*content=/i.test(html);
  const hasOgUrl = /<meta\s+[^>]*property=["']og:url["'][^>]*content=/i.test(html);
  const hasTwitterCard = /<meta\s+[^>]*name=["']twitter:card["'][^>]*content=/i.test(html);
  const hasTwitterTitle = /<meta\s+[^>]*name=["']twitter:title["'][^>]*content=/i.test(html);
  const hasTwitterDescription = /<meta\s+[^>]*name=["']twitter:description["'][^>]*content=/i.test(html);
  const canonicalBad =
    !canonical ||
    canonical !== expectedUrl ||
    !canonical.startsWith(`${SITE_URL}/`) ||
    /\.html(?:$|[?#])/i.test(canonical) ||
    /[A-Z]/.test(canonical) ||
    /\/\//.test(canonical.replace('https://', ''));

  return {
    slug,
    expectedUrl,
    title,
    description,
    appName,
    hasJsonLd: hasJsonLd(html),
    hasOg: hasOgTitle && hasOgDescription && hasOgType && hasOgUrl,
    hasTwitter: hasTwitterCard && hasTwitterTitle && hasTwitterDescription,
    hasCanonical: Boolean(canonical),
    canonicalBad
  };
}

function fixHtml(html, fileName) {
  const info = analyze(html, fileName);
  let next = html;

  next = upsertLinkCanonical(next, info.expectedUrl);
  next = upsertMeta(next, 'property', 'og:title', info.title);
  next = upsertMeta(next, 'property', 'og:description', info.description);
  next = upsertMeta(next, 'property', 'og:type', 'website');
  next = upsertMeta(next, 'property', 'og:url', info.expectedUrl);
  next = upsertMeta(next, 'property', 'og:site_name', SITE_NAME);
  next = upsertMeta(next, 'property', 'og:locale', 'zh_CN');
  next = upsertMeta(next, 'property', 'og:image', DEFAULT_IMAGE);
  next = upsertMeta(next, 'name', 'twitter:card', 'summary_large_image');
  next = upsertMeta(next, 'name', 'twitter:title', info.title);
  next = upsertMeta(next, 'name', 'twitter:description', info.description);
  next = upsertMeta(next, 'name', 'twitter:image', DEFAULT_IMAGE);

  if (!info.hasJsonLd) {
    next = insertBeforeHeadEnd(next, buildJsonLd(info.appName, info.description, info.expectedUrl));
  }

  return { next, info };
}

function collectStats(files) {
  const stats = {
    total: files.length,
    missingJsonLd: [],
    missingOg: [],
    missingTwitter: [],
    missingCanonical: [],
    badCanonical: []
  };

  for (const fileName of files) {
    const fullPath = path.join(DEV_DIR, fileName);
    const html = fs.readFileSync(fullPath, 'utf8');
    const info = analyze(html, fileName);

    if (!info.hasJsonLd) {
      stats.missingJsonLd.push(fileName);
    }
    if (!info.hasOg) {
      stats.missingOg.push(fileName);
    }
    if (!info.hasTwitter) {
      stats.missingTwitter.push(fileName);
    }
    if (!info.hasCanonical) {
      stats.missingCanonical.push(fileName);
    }
    if (info.canonicalBad) {
      stats.badCanonical.push({ file: fileName, expected: info.expectedUrl });
    }
  }

  return stats;
}

function main() {
  const files = fs.readdirSync(DEV_DIR).filter((file) => file.endsWith('.html')).sort();
  const before = collectStats(files);

  if (CHECK_ONLY) {
    console.log(JSON.stringify(before, null, 2));
    return;
  }

  const changed = [];

  for (const fileName of files) {
    const fullPath = path.join(DEV_DIR, fileName);
    const html = fs.readFileSync(fullPath, 'utf8');
    const { next } = fixHtml(html, fileName);

    if (next !== html) {
      fs.writeFileSync(fullPath, next, 'utf8');
      changed.push(fileName);
    }
  }

  const after = collectStats(files);

  console.log(
    JSON.stringify(
      {
        checked: before.total,
        changed: changed.length,
        changedFiles: changed,
        before: {
          missingJsonLd: before.missingJsonLd.length,
          missingOg: before.missingOg.length,
          missingTwitter: before.missingTwitter.length,
          missingCanonical: before.missingCanonical.length,
          badCanonical: before.badCanonical.length
        },
        after: {
          missingJsonLd: after.missingJsonLd.length,
          missingOg: after.missingOg.length,
          missingTwitter: after.missingTwitter.length,
          missingCanonical: after.missingCanonical.length,
          badCanonical: after.badCanonical.length
        }
      },
      null,
      2
    )
  );
}

main();
