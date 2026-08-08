const fs = require('fs');
const p = 'tools/text/random-picker.html';
let h = fs.readFileSync(p, 'utf8');

// Use the main meta description as source of truth
const main = h.match(
  /<meta\s+name=["']description["']\s+content=["']([^"']+)["']\s*\/?>/i
);
if (!main) {
  console.error('main description not found');
  process.exit(1);
}
const desc = main[1];
console.log('desc len', [...desc].length);

// Replace og:description content (possibly multiline meta tag)
h = h.replace(
  /(<meta\s+property=["']og:description["']\s+content=["'])([^"']*)(["']\s*\/?>)/i,
  `$1${desc}$3`
);
h = h.replace(
  /(<meta[\s\n]+property=["']og:description["'][\s\n]+content=["'])([^"']*)(["'][\s\n]*\/>)/i,
  `$1${desc}$3`
);

// Replace twitter:description content
h = h.replace(
  /(<meta\s+name=["']twitter:description["']\s+content=["'])([^"']*)(["']\s*\/?>)/i,
  `$1${desc}$3`
);
h = h.replace(
  /(<meta[\s\n]+name=["']twitter:description["'][\s\n]+content=["'])([^"']*)(["'][\s\n]*\/>)/i,
  `$1${desc}$3`
);

// JSON-LD description fields that look like page description
h = h.replace(/("description"\s*:\s*")([^"]*)(")/g, (full, a, b, c) => {
  if (/随机|抽奖|点名|抽取/.test(b) || b.length > 40) return a + desc + c;
  return full;
});

fs.writeFileSync(p, h, 'utf8');

const out = fs.readFileSync(p, 'utf8');
const og = out.match(
  /property=["']og:description["'][\s\S]{0,40}?content=["']([^"']+)["']/i
);
const tw = out.match(
  /name=["']twitter:description["'][\s\S]{0,40}?content=["']([^"']+)["']/i
);
console.log({
  ogLen: og ? [...og[1]].length : null,
  twLen: tw ? [...tw[1]].length : null,
  same: og && tw && og[1] === desc && tw[1] === desc,
});
