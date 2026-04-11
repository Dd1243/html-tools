/**
 * IndexNow Submission Script
 * This script notifies IndexNow-compatible search engines (Bing, Yandex, etc.) about website updates.
 * 
 * Usage:
 * node scripts/indexnow.js [url1] [url2] ...
 * If no URLs are provided, it notifies about the home page.
 */

const HOST = 'essays4u.net';
const KEY = 'e845f78234854930b593635741639f72';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const SEARCH_ENGINES = [
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow'
];

async function submitIndexNow(urlList) {
  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urlList
  };

  console.log(`Submitting ${urlList.length} URLs to IndexNow...`);

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
        console.log(`✅ Successfully submitted to ${engine} (Status: ${response.status})`);
      } else {
        const text = await response.text();
        console.error(`❌ Failed to submit to ${engine} (Status: ${response.status}): ${text}`);
      }
    } catch (error) {
      console.error(`❌ Error submitting to ${engine}: ${error.message}`);
    }
  }
}

// Get URLs from command line arguments or default to homepage
let urls = process.argv.slice(2);
if (urls.length === 0) {
  urls = [`https://${HOST}/`];
} else {
  // Ensure URLs are absolute
  urls = urls.map(u => u.startsWith('http') ? u : `https://${HOST}${u.startsWith('/') ? '' : '/'}${u}`);
}

submitIndexNow(urls);
