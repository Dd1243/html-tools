const fs = require('fs');
const files = [
  'tools/text/morse-code.html',
  'tools/text/nato-alphabet.html',
  'tools/text/number-formatter.html'
];

for (const f of files) {
  const h = fs.readFileSync(f, 'utf8');
  const m = h.match(/name="description" content="([^"]+)"/);
  const d = m ? m[1] : '';
  console.log('---', f);
  console.log('desc_len=', [...d].length);
  console.log('has_h1=', /<h1[\s>]/.test(h));
  console.log('has_jsonld=', h.includes('application/ld+json'));
  console.log('has_footer=', /privacy-policy/.test(h));
  console.log('has_theme=', h.includes('data-theme="light"'));
  console.log('has_favicon=', /rel="icon"/.test(h));
  console.log('has_canonical=', h.includes('essays4u.net'));
}
