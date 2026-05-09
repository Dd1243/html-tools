/**
 * Baidu URL push script
 *
 * Usage:
 *   BAIDU_PUSH_ENDPOINT="http://data.zz.baidu.com/urls?site=https://example.com&token=..." node scripts/baidu-submit.js --from-sitemap
 *   node scripts/baidu-submit.js --endpoint "http://data.zz.baidu.com/urls?site=https://example.com&token=..." --from-sitemap --dry-run
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_SITEMAP_PATH = 'sitemap.xml';
const CHUNK_SIZE = 2000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

function logUsage() {
  console.log(`Usage:
  node scripts/baidu-submit.js [urlOrPath1] [urlOrPath2] ...
  node scripts/baidu-submit.js --from-sitemap [sitemap.xml]
  node scripts/baidu-submit.js --endpoint <baiduPushEndpoint> [other options]
  node scripts/baidu-submit.js --dry-run [other options]

Environment:
  BAIDU_PUSH_ENDPOINT  Full Baidu push endpoint, including site and token.`);
}

function chunk(array, size) {
  const chunks = [];
  for (let index = 0; index < array.length; index += size) {
    chunks.push(array.slice(index, index + size));
  }
  return chunks;
}

function getOptionValue(args, optionName) {
  const index = args.indexOf(optionName);
  if (index === -1) {
    return null;
  }
  return args[index + 1] || null;
}

function stripOption(args, optionName) {
  const index = args.indexOf(optionName);
  if (index === -1) {
    return args;
  }
  return args.filter((_, itemIndex) => itemIndex !== index && itemIndex !== index + 1);
}

function normalizePathname(pathname) {
  if (!pathname || pathname === '/index.html') {
    return '/';
  }

  return pathname.replace(/\.html$/i, '');
}

function resolveEndpoint(rawEndpoint) {
  if (!rawEndpoint) {
    throw new Error('Missing BAIDU_PUSH_ENDPOINT. Set it in your environment or pass --endpoint.');
  }

  const endpoint = new URL(rawEndpoint);
  const site = endpoint.searchParams.get('site');
  const token = endpoint.searchParams.get('token');

  if (!site || !token) {
    throw new Error('Baidu endpoint must include both site and token query parameters.');
  }

  return {
    endpoint: endpoint.toString(),
    siteOrigin: new URL(site).origin
  };
}

function normalizeUrl(value, siteOrigin) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? new URL(trimmed)
      : new URL(trimmed.startsWith('/') ? trimmed : `/${trimmed}`, siteOrigin);

    return `${siteOrigin}${normalizePathname(url.pathname)}`;
  } catch {
    return null;
  }
}

function dedupeUrls(urls, siteOrigin) {
  return [...new Set(urls.map((url) => normalizeUrl(url, siteOrigin)).filter(Boolean))];
}

async function getUrlsFromSitemap(inputPath = DEFAULT_SITEMAP_PATH) {
  const sitemapPath = path.isAbsolute(inputPath) ? inputPath : path.resolve(projectRoot, inputPath);
  const xml = await fs.readFile(sitemapPath, 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
}

async function resolveUrls(args, siteOrigin) {
  if (args.includes('--help') || args.includes('-h')) {
    logUsage();
    process.exit(0);
  }

  const directArgs = args.filter((arg) => !arg.startsWith('--'));

  if (args[0] === '--from-sitemap') {
    const sitemapArg = directArgs[0] || DEFAULT_SITEMAP_PATH;
    const urls = await getUrlsFromSitemap(sitemapArg);
    const normalizedUrls = dedupeUrls(urls, siteOrigin);
    console.log(`Resolved ${normalizedUrls.length} URLs from sitemap: ${sitemapArg}`);
    return normalizedUrls;
  }

  if (directArgs.length === 0) {
    return [`${siteOrigin}/`];
  }

  return dedupeUrls(directArgs, siteOrigin);
}

async function submitBaidu(urlList, { endpoint, siteOrigin, dryRun = false } = {}) {
  const urls = dedupeUrls(urlList, siteOrigin);
  const batches = chunk(urls, CHUNK_SIZE);

  console.log(`Preparing ${urls.length} URLs in ${batches.length} batch(es).`);

  if (dryRun) {
    console.log(JSON.stringify({ dryRun: true, count: urls.length, endpointSite: siteOrigin, urls }, null, 2));
    return;
  }

  for (const [batchIndex, batch] of batches.entries()) {
    console.log(`Submitting batch ${batchIndex + 1}/${batches.length} (${batch.length} URLs) to Baidu...`);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: batch.join('\n')
      });
      const text = await response.text();

      if (response.ok) {
        console.log(`Submitted to Baidu (status ${response.status}): ${text}`);
      } else {
        console.error(`Baidu rejected batch ${batchIndex + 1} (status ${response.status}): ${text}`);
        process.exitCode = 1;
      }
    } catch (error) {
      console.error(`Error submitting to Baidu: ${error.message}`);
      process.exitCode = 1;
    }
  }
}

const rawArgs = process.argv.slice(2);
const dryRun = rawArgs.includes('--dry-run');
const endpointArg = getOptionValue(rawArgs, '--endpoint');
let filteredArgs = rawArgs.filter((arg) => arg !== '--dry-run');
filteredArgs = stripOption(filteredArgs, '--endpoint');

const { endpoint, siteOrigin } = resolveEndpoint(endpointArg || process.env.BAIDU_PUSH_ENDPOINT);
const urls = await resolveUrls(filteredArgs, siteOrigin);
await submitBaidu(urls, { endpoint, siteOrigin, dryRun });
