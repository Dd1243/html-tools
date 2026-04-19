const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://essays4u.net';
const DEFAULT_SITE_NAME = 'WebUtils';
const DEFAULT_IMAGE = `${SITE_URL}/social-preview.png`;
const CATEGORY_CONFIG = {
  dev: { dir: path.resolve(__dirname, '../tools/dev'), applicationCategory: 'DeveloperApplication' },
  text: { dir: path.resolve(__dirname, '../tools/text'), applicationCategory: 'UtilitiesApplication' },
  time: { dir: path.resolve(__dirname, '../tools/time'), applicationCategory: 'UtilitiesApplication' },
  generator: { dir: path.resolve(__dirname, '../tools/generator'), applicationCategory: 'UtilitiesApplication' },
  media: { dir: path.resolve(__dirname, '../tools/media'), applicationCategory: 'MultimediaApplication' }
};

const args = process.argv.slice(2);
const CHECK_ONLY = args.includes('--check');
const targetCategories = args.filter((arg) => !arg.startsWith('--'));
const categories = targetCategories.length ? targetCategories : ['dev'];

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

function hasMeta(html, attribute, key) {
  const pattern = new RegExp(`<meta\\s+[^>]*${attribute}=["']${escapeRegExp(key)}["'][^>]*>`, 'i');
  return pattern.test(html);
}

function ensureMeta(html, attribute, key, content, replaceIfDifferent = false) {
  const tag = `    <meta ${attribute}="${key}" content="${escapeHtml(content)}" />`;
  const pattern = new RegExp(`<meta\\s+[^>]*${attribute}=["']${escapeRegExp(key)}["'][^>]*>`, 'i');

  if (!pattern.test(html)) {
    return insertBeforeHeadEnd(html, tag);
  }

  if (!replaceIfDifferent) {
    return html;
  }

  const existing = getMetaContent(html, key, attribute);
  return existing === content ? html : html.replace(pattern, tag);
}

function ensureCanonical(html, href) {
  const tag = `    <link rel="canonical" href="${href}" />`;
  const pattern = /<link\s+[^>]*rel=["']canonical["'][^>]*>/i;
  const existing = getCanonical(html);

  if (!pattern.test(html)) {
    return insertBeforeHeadEnd(html, tag);
  }

  return existing === href ? html : html.replace(pattern, tag);
}

function buildJsonLd(name, description, url, applicationCategory) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url,
    applicationCategory,
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
  const cleaned = title.replace(/\s*[|｜-]\s*(WebUtils|Web工具箱)\s*$/i, '').trim();
  return cleaned || fallback;
}

function getSiteName(html, title) {
  return (
    getMetaContent(html, 'og:site_name', 'property') ||
    getMetaContent(html, 'author') ||
    (/Web工具箱/i.test(title) ? 'Web工具箱' : DEFAULT_SITE_NAME)
  );
}

function getDefaultDescription(title, category) {
  const labelMap = {
    dev: '开发者工具',
    text: '文本工具',
    time: '时间工具',
    generator: '生成器工具',
    media: '媒体工具'
  };
  return `${title}，免费在线${labelMap[category] || '实用工具'}。`;
}

function analyze(html, fileName, category) {
  const slug = fileName.replace(/\.html$/i, '');
  const expectedUrl = `${SITE_URL}/tools/${category}/${slug}`;
  const title = getTitle(html) || slug;
  const description = getMetaContent(html, 'description') || getDefaultDescription(title, category);
  const appName = normalizedNameFromTitle(title, slug);
  const canonical = getCanonical(html);
  const siteName = getSiteName(html, title);

  const hasOgTitle = hasMeta(html, 'property', 'og:title');
  const hasOgDescription = hasMeta(html, 'property', 'og:description');
  const hasOgType = hasMeta(html, 'property', 'og:type');
  const hasOgUrl = hasMeta(html, 'property', 'og:url');
  const hasTwitterCard = hasMeta(html, 'name', 'twitter:card');
  const hasTwitterTitle = hasMeta(html, 'name', 'twitter:title');
  const hasTwitterDescription = hasMeta(html, 'name', 'twitter:description');
  const canonicalBad =
    !canonical ||
    canonical !== expectedUrl ||
    !canonical.startsWith(`${SITE_URL}/`) ||
    /\.html(?:$|[?#])/i.test(canonical) ||
    /[A-Z]/.test(canonical) ||
    /\/\//.test(canonical.replace('https://', ''));

  return {
    expectedUrl,
    title,
    description,
    appName,
    siteName,
    hasJsonLd: hasJsonLd(html),
    hasOg: hasOgTitle && hasOgDescription && hasOgType && hasOgUrl,
    hasTwitter: hasTwitterCard && hasTwitterTitle && hasTwitterDescription,
    hasCanonical: Boolean(canonical),
    canonicalBad
  };
}

function fixHtml(html, fileName, category) {
  const config = CATEGORY_CONFIG[category];
  const info = analyze(html, fileName, category);
  let next = html;

  next = ensureCanonical(next, info.expectedUrl);
  next = ensureMeta(next, 'property', 'og:title', info.title);
  next = ensureMeta(next, 'property', 'og:description', info.description);
  next = ensureMeta(next, 'property', 'og:type', 'website');
  next = ensureMeta(next, 'property', 'og:url', info.expectedUrl, true);
  next = ensureMeta(next, 'property', 'og:site_name', info.siteName);
  next = ensureMeta(next, 'property', 'og:locale', 'zh_CN');
  next = ensureMeta(next, 'property', 'og:image', DEFAULT_IMAGE);
  next = ensureMeta(next, 'name', 'twitter:card', 'summary_large_image');
  next = ensureMeta(next, 'name', 'twitter:title', info.title);
  next = ensureMeta(next, 'name', 'twitter:description', info.description);
  next = ensureMeta(next, 'name', 'twitter:image', DEFAULT_IMAGE);

  if (!info.hasJsonLd) {
    next = insertBeforeHeadEnd(
      next,
      buildJsonLd(info.appName, info.description, info.expectedUrl, config.applicationCategory)
    );
  }

  return next;
}

function createEmptyStats(total = 0) {
  return {
    total,
    missingJsonLd: 0,
    missingOg: 0,
    missingTwitter: 0,
    missingCanonical: 0,
    badCanonical: 0
  };
}

function collectCategoryStats(category) {
  const config = CATEGORY_CONFIG[category];
  const files = fs.readdirSync(config.dir).filter((file) => file.endsWith('.html')).sort();
  const stats = createEmptyStats(files.length);

  for (const fileName of files) {
    const fullPath = path.join(config.dir, fileName);
    const html = fs.readFileSync(fullPath, 'utf8');
    const info = analyze(html, fileName, category);

    if (!info.hasJsonLd) {
      stats.missingJsonLd += 1;
    }
    if (!info.hasOg) {
      stats.missingOg += 1;
    }
    if (!info.hasTwitter) {
      stats.missingTwitter += 1;
    }
    if (!info.hasCanonical) {
      stats.missingCanonical += 1;
    }
    if (info.canonicalBad) {
      stats.badCanonical += 1;
    }
  }

  return { files, stats };
}

function aggregateTotals(summary) {
  const totals = createEmptyStats();

  for (const stats of Object.values(summary)) {
    totals.total += stats.total;
    totals.missingJsonLd += stats.missingJsonLd;
    totals.missingOg += stats.missingOg;
    totals.missingTwitter += stats.missingTwitter;
    totals.missingCanonical += stats.missingCanonical;
    totals.badCanonical += stats.badCanonical;
  }

  return totals;
}

function main() {
  for (const category of categories) {
    if (!CATEGORY_CONFIG[category]) {
      throw new Error(`Unsupported category: ${category}`);
    }
  }

  const before = {};
  const fileIndex = {};

  for (const category of categories) {
    const { files, stats } = collectCategoryStats(category);
    before[category] = stats;
    fileIndex[category] = files;
  }

  if (CHECK_ONLY) {
    console.log(JSON.stringify({ categories: before, totals: aggregateTotals(before) }, null, 2));
    return;
  }

  const changedByCategory = {};

  for (const category of categories) {
    const config = CATEGORY_CONFIG[category];
    const changedFiles = [];

    for (const fileName of fileIndex[category]) {
      const fullPath = path.join(config.dir, fileName);
      const html = fs.readFileSync(fullPath, 'utf8');
      const next = fixHtml(html, fileName, category);

      if (next !== html) {
        fs.writeFileSync(fullPath, next, 'utf8');
        changedFiles.push(fileName);
      }
    }

    changedByCategory[category] = changedFiles.length;
  }

  const after = {};

  for (const category of categories) {
    after[category] = collectCategoryStats(category).stats;
  }

  console.log(
    JSON.stringify(
      {
        categories,
        changedByCategory,
        before,
        after,
        totalsBefore: aggregateTotals(before),
        totalsAfter: aggregateTotals(after)
      },
      null,
      2
    )
  );
}

main();
