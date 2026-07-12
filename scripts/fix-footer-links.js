import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const TOOLS_DIR = path.join(ROOT, 'tools');
const POLICY_LINKS = `
  <nav data-site-policy-links aria-label="网站政策" style="display:flex;flex-wrap:wrap;justify-content:center;gap:12px 20px;margin:16px auto;padding:0 16px;font-size:14px">
    <a href="/about">关于本站</a>
    <a href="/contact">联系我们</a>
    <a href="/terms">使用条款</a>
    <a href="/privacy-policy">隐私政策</a>
  </nav>`;

function getHtmlFiles(dir) {
  const files = [];
  const pending = [dir];
  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) pending.push(entryPath);
      if (entry.isFile() && entry.name.endsWith('.html')) files.push(entryPath);
    }
  }
  return files;
}

let updated = 0;
let created = 0;
let placeholdersFixed = 0;

for (const filePath of getHtmlFiles(TOOLS_DIR)) {
  const original = fs.readFileSync(filePath, 'utf8');
  const newline = original.includes('\r\n') ? '\r\n' : '\n';
  let html = original;
  const footerMatch = html.match(/<footer\b[\s\S]*?<\/footer>/i);

  if (footerMatch) {
    let footer = footerMatch[0];
    footer = footer.replace(/href=(["'])(?:#|javascript:void\(0\))\1/gi, (_match, quote) => {
      placeholdersFixed++;
      return `href=${quote}/contact${quote}`;
    });
    if (!/data-site-policy-links/i.test(footer)) {
      footer = footer.replace(/<\/footer>/i, `${POLICY_LINKS.replace(/\n/g, newline)}${newline}</footer>`);
    }
    html = html.slice(0, footerMatch.index) + footer + html.slice(footerMatch.index + footerMatch[0].length);
  } else {
    const footer = `<footer class="site-footer">${POLICY_LINKS.replace(/\n/g, newline)}${newline}</footer>${newline}`;
    if (/<\/body>/i.test(html)) html = html.replace(/<\/body>/i, `${footer}</body>`);
    else html += `${newline}${footer}`;
    created++;
  }

  if (html !== original) {
    fs.writeFileSync(filePath, html, 'utf8');
    updated++;
  }
}

console.log(`Updated pages: ${updated}`);
console.log(`Created footers: ${created}`);
console.log(`Fixed placeholder links: ${placeholdersFixed}`);