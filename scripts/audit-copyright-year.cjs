const fs = require('fs');
const path = require('path');

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === '.git') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (/\.(html|js|md|json)$/i.test(ent.name)) out.push(p);
  }
  return out;
}

const patterns = [
  /©\s*20\d{2}/g,
  /&copy;\s*20\d{2}/gi,
  /Copyright\s*©?\s*20\d{2}/gi,
  /版权所有[^\n]{0,20}20\d{2}/g,
];

const byYear = {};
const samples = {};
const files = walk(path.join(__dirname, '..'));

for (const fp of files) {
  // skip design templates? include them
  const html = fs.readFileSync(fp, 'utf8');
  // ignore script-heavy false positives roughly by scanning whole file is fine
  const found = new Set();
  for (const re of patterns) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(html)) !== null) {
      const year = (m[0].match(/20\d{2}/) || [])[0];
      if (!year) continue;
      found.add(year + '::' + m[0].replace(/\s+/g, ' ').slice(0, 40));
      byYear[year] = (byYear[year] || 0) + 1;
      if (!samples[year]) samples[year] = [];
      if (samples[year].length < 12) {
        samples[year].push({
          file: path.relative(path.join(__dirname, '..'), fp).replace(/\\/g, '/'),
          match: m[0].replace(/\s+/g, ' ').slice(0, 60),
        });
      }
    }
  }
}

// count files containing © 2025 / &copy; 2025 specifically in footer-ish context
let files2025 = [];
let files2024 = [];
let files2026 = [];
for (const fp of files) {
  const html = fs.readFileSync(fp, 'utf8');
  const rel = path.relative(path.join(__dirname, '..'), fp).replace(/\\/g, '/');
  if (/©\s*2025|&copy;\s*2025|Copyright\s*©?\s*2025/i.test(html)) files2025.push(rel);
  if (/©\s*2024|&copy;\s*2024|Copyright\s*©?\s*2024/i.test(html)) files2024.push(rel);
  if (/©\s*2026|&copy;\s*2026|Copyright\s*©?\s*2026/i.test(html)) files2026.push(rel);
}

console.log(
  JSON.stringify(
    {
      matchCountsByYear: byYear,
      filesWith2025: files2025.length,
      filesWith2024: files2024.length,
      filesWith2026: files2026.length,
      samples2025: files2025.slice(0, 30),
      samples2024: files2024.slice(0, 20),
      samples,
    },
    null,
    2
  )
);
