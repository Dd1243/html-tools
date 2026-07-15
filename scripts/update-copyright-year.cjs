/**
 * Update footer copyright years to 2026.
 * Only touches copyright-like patterns, not article titles like "2025 指南".
 */
const fs = require('fs');
const path = require('path');

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === '.git') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}

// Only copyright markers + year. Do NOT change bare "2025" in titles/content.
const REPLACERS = [
  // © 2024 / © 2025 (unicode)
  { re: /©\s*202[45]/g, to: '© 2026' },
  // &copy; 2024 / &copy; 2025
  { re: /&copy;\s*202[45]/gi, to: '&copy; 2026' },
  // Copyright © 2024 / Copyright 2025
  { re: /Copyright\s*©?\s*202[45]/gi, to: 'Copyright © 2026' },
  // 版权所有 2024/2025
  { re: /版权所有[：:\s]*202[45]/g, to: '版权所有 2026' },
];

let changedFiles = 0;
let totalReplacements = 0;
const samples = [];

for (const fp of walk(path.join(__dirname, '..'))) {
  let html = fs.readFileSync(fp, 'utf8');
  const before = html;
  let fileHits = 0;

  for (const { re, to } of REPLACERS) {
    html = html.replace(re, () => {
      fileHits++;
      return to;
    });
  }

  if (html !== before) {
    fs.writeFileSync(fp, html, 'utf8');
    changedFiles++;
    totalReplacements += fileHits;
    if (samples.length < 25) {
      samples.push(path.relative(path.join(__dirname, '..'), fp).replace(/\\/g, '/'));
    }
  }
}

// residual copyright years other than 2026
const residual = { 2024: [], 2025: [] };
for (const fp of walk(path.join(__dirname, '..'))) {
  const html = fs.readFileSync(fp, 'utf8');
  const rel = path.relative(path.join(__dirname, '..'), fp).replace(/\\/g, '/');
  if (/©\s*2024|&copy;\s*2024|Copyright\s*©?\s*2024/i.test(html)) residual[2024].push(rel);
  if (/©\s*2025|&copy;\s*2025|Copyright\s*©?\s*2025/i.test(html)) residual[2025].push(rel);
}

console.log(
  JSON.stringify(
    {
      changedFiles,
      totalReplacements,
      samples,
      residual2024: residual[2024],
      residual2025: residual[2025],
    },
    null,
    2
  )
);
