/**
 * Retry only the IndexNow batches/endpoints that failed in the last full run.
 * Failed:
 *  - batch 2 → Seznam
 *  - batch 6 → Bing
 *  - batch 7 → api.indexnow.org
 *  - batch 9 → api.indexnow.org
 */
const fs = require('fs');
const path = require('path');

const HOST = 'essays4u.net';
const SITE_URL = `https://${HOST}`;
const KEY = 'e845f78234854930b593635741639f72';
const KEY_LOCATION = `${SITE_URL}/${KEY}.txt`;
const CHUNK_SIZE = 100;

const ENDPOINTS = {
  universal: 'https://api.indexnow.org/indexnow',
  bing: 'https://www.bing.com/indexnow',
  seznam: 'https://search.seznam.cz/indexnow',
};

function loadSitemapUrls(filePath) {
  const xml = fs.readFileSync(filePath, 'utf8');
  const urls = [];
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
  let m;
  while ((m = re.exec(xml))) {
    const u = m[1].trim();
    if (u.startsWith(SITE_URL)) urls.push(u.replace(/\.html$/i, '').replace(/\/$/, '') === SITE_URL ? `${SITE_URL}/` : u.replace(/\.html$/i, ''));
  }
  // normalize: keep homepage as SITE_URL/
  return [...new Set(urls.map((u) => {
    if (u === SITE_URL || u === `${SITE_URL}/`) return `${SITE_URL}/`;
    return u.replace(/\.html$/i, '');
  }))];
}

function batchOf(urls, batchNumber) {
  // batchNumber is 1-based
  const start = (batchNumber - 1) * CHUNK_SIZE;
  return urls.slice(start, start + CHUNK_SIZE);
}

async function submit(endpoint, urlList, label) {
  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
      });
      const text = await res.text().catch(() => '');
      if (res.ok) {
        console.log(`✅ ${label} → ${endpoint} (status ${res.status}) urls=${urlList.length}`);
        return true;
      }
      console.error(`❌ ${label} attempt ${attempt}: status ${res.status} ${text.slice(0, 200)}`);
    } catch (e) {
      console.error(`❌ ${label} attempt ${attempt}: ${e.message}`);
    }
    // backoff
    await new Promise((r) => setTimeout(r, 1500 * attempt));
  }
  return false;
}

async function main() {
  const sitemap = path.join(__dirname, '..', 'sitemap.xml');
  const urls = loadSitemapUrls(sitemap);
  console.log(`Loaded ${urls.length} URLs from sitemap`);

  const jobs = [
    { batch: 2, endpoint: ENDPOINTS.seznam, name: 'Seznam batch 2' },
    { batch: 6, endpoint: ENDPOINTS.bing, name: 'Bing batch 6' },
    { batch: 7, endpoint: ENDPOINTS.universal, name: 'Universal batch 7' },
    { batch: 9, endpoint: ENDPOINTS.universal, name: 'Universal batch 9' },
  ];

  let ok = 0;
  let fail = 0;
  for (const job of jobs) {
    const list = batchOf(urls, job.batch);
    if (!list.length) {
      console.error(`No URLs for batch ${job.batch}`);
      fail++;
      continue;
    }
    console.log(`\nRetrying ${job.name} (${list.length} URLs)...`);
    console.log(`  first: ${list[0]}`);
    console.log(`  last:  ${list[list.length - 1]}`);
    const success = await submit(job.endpoint, list, job.name);
    if (success) ok++;
    else fail++;
    // small pause between jobs
    await new Promise((r) => setTimeout(r, 800));
  }

  console.log(`\nDone. success=${ok} fail=${fail}`);
  process.exitCode = fail ? 1 : 0;
}

main();
