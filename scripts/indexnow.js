/**
 * IndexNow Submission Script
 *
 * Supports three modes:
 * 1. Direct URLs or paths: node scripts/indexnow.js /tools/dev/base64 https://essays4u.net/
 * 2. Git diff mode:       node scripts/indexnow.js --from-git <base> <head>
 * 3. Sitemap mode:        node scripts/indexnow.js --from-sitemap [sitemap.xml]
 *
 * Add --dry-run to preview the URLs without sending them.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const HOST = 'essays4u.net';
const SITE_URL = `https://${HOST}`;
const KEY = 'e845f78234854930b593635741639f72';
const KEY_LOCATION = `${SITE_URL}/${KEY}.txt`;
const DEFAULT_SITEMAP_PATH = 'sitemap.xml';
const CHUNK_SIZE = 100;
const SEARCH_ENGINES = ['https://www.bing.com/indexnow', 'https://yandex.com/indexnow'];
const ZERO_SHA = '0000000000000000000000000000000000000000';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

function logUsage() {
  console.log(`Usage:
  node scripts/indexnow.js [urlOrPath1] [urlOrPath2] ...
  node scripts/indexnow.js --from-git <base> <head>
  node scripts/indexnow.js --from-sitemap [sitemap.xml]
  node scripts/indexnow.js --dry-run [other options]`);
}

function chunk(array, size) {
  const chunks = [];
  for (let index = 0; index < array.length; index += size) {
    chunks.push(array.slice(index, index + size));
  }
  return chunks;
}

function normalizeCanonicalPath(inputPath) {
  if (!inputPath) {
    return null;
  }

  const normalized = inputPath.replace(/\/+/g, '/');

  if (normalized === '/' || normalized === '/index.html' || normalized === 'index.html') {
    return '/';
  }

  if (normalized.startsWith('/tools/') && normalized.endsWith('.html')) {
    return normalized.replace(/\.html$/i, '');
  }

  return normalized;
}

function normalizePublicUrl(value) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed);
      if (url.hostname !== HOST) {
        return null;
      }
      return `${SITE_URL}${normalizeCanonicalPath(url.pathname)}`;
    } catch {
      return null;
    }
  }

  const normalizedPath = trimmed.replace(/\\/g, '/').replace(/^\.+\//, '');
  if (!normalizedPath) {
    return null;
  }

  if (normalizedPath === 'index.html' || normalizedPath === 'index') {
    return `${SITE_URL}/`;
  }

  if (normalizedPath.startsWith('/')) {
    return `${SITE_URL}${normalizeCanonicalPath(normalizedPath)}`;
  }

  if (normalizedPath.startsWith('tools/') && normalizedPath.endsWith('.html')) {
    return `${SITE_URL}/${normalizedPath.replace(/\.html$/i, '')}`;
  }

  if (normalizedPath.endsWith('.html')) {
    return `${SITE_URL}/${normalizedPath}`;
  }

  if (normalizedPath.startsWith('tools/')) {
    return `${SITE_URL}/${normalizedPath}`;
  }

  return null;
}

function dedupeUrls(urls) {
  return [...new Set(urls.map(normalizePublicUrl).filter(Boolean))];
}

function getChangedFiles(base, head) {
  if (!base || !head || base === ZERO_SHA) {
    return [];
  }

  const output = execFileSync('git', ['diff', '--name-only', base, head], {
    cwd: projectRoot,
    encoding: 'utf8'
  });

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function filePathToUrls(filePath) {
  const normalized = filePath.replace(/\\/g, '/');

  if (normalized === 'index.html') {
    return [`${SITE_URL}/`];
  }

  if (normalized === 'sitemap.xml' || normalized === 'tools.json') {
    return [`${SITE_URL}/`];
  }

  if (normalized.startsWith('tools/') && normalized.endsWith('.html')) {
    return [normalizePublicUrl(normalized)];
  }

  if (normalized === 'robots.txt') {
    return [`${SITE_URL}/`];
  }

  return [];
}

async function getUrlsFromSitemap(inputPath = DEFAULT_SITEMAP_PATH) {
  const sitemapPath = path.isAbsolute(inputPath) ? inputPath : path.resolve(projectRoot, inputPath);
  const xml = await fs.readFile(sitemapPath, 'utf8');
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
  return dedupeUrls(matches);
}

async function resolveUrls(args) {
  if (args.includes('--help') || args.includes('-h')) {
    logUsage();
    process.exit(0);
  }

  const directArgs = args.filter((arg) => !arg.startsWith('--'));

  if (args[0] === '--from-git') {
    const base = args[1];
    const head = args[2];
    const changedFiles = getChangedFiles(base, head);
    const urls = dedupeUrls(changedFiles.flatMap(filePathToUrls));

    if (urls.length > 0) {
      console.log(`Resolved ${urls.length} URLs from git diff (${base}..${head}).`);
      return urls;
    }

    console.log('No public URLs resolved from git diff; falling back to homepage.');
    return [`${SITE_URL}/`];
  }

  if (args[0] === '--from-sitemap') {
    const sitemapArg = directArgs[0] || DEFAULT_SITEMAP_PATH;
    const urls = await getUrlsFromSitemap(sitemapArg);
    console.log(`Resolved ${urls.length} URLs from sitemap: ${sitemapArg}`);
    return urls.length > 0 ? urls : [`${SITE_URL}/`];
  }

  if (directArgs.length === 0) {
    return [`${SITE_URL}/`];
  }

  return dedupeUrls(directArgs).length > 0 ? dedupeUrls(directArgs) : [`${SITE_URL}/`];
}

async function submitIndexNow(urlList, { dryRun = false } = {}) {
  const urls = dedupeUrls(urlList);
  const batches = chunk(urls, CHUNK_SIZE);

  console.log(`Preparing ${urls.length} URLs in ${batches.length} batch(es).`);

  if (dryRun) {
    console.log(JSON.stringify({ dryRun: true, count: urls.length, urls }, null, 2));
    return;
  }

  for (const [batchIndex, batch] of batches.entries()) {
    const payload = {
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: batch
    };

    console.log(`Submitting batch ${batchIndex + 1}/${batches.length} (${batch.length} URLs)...`);

    for (const engine of SEARCH_ENGINES) {
      try {
        const response = await fetch(engine, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          console.log(`✅ Submitted to ${engine} (status ${response.status})`);
        } else {
          const text = await response.text();
          console.error(`❌ ${engine} rejected batch ${batchIndex + 1} (status ${response.status}): ${text}`);
          process.exitCode = 1;
        }
      } catch (error) {
        console.error(`❌ Error submitting to ${engine}: ${error.message}`);
        process.exitCode = 1;
      }
    }
  }
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const filteredArgs = args.filter((arg) => arg !== '--dry-run');
const urls = await resolveUrls(filteredArgs);
await submitIndexNow(urls, { dryRun });
