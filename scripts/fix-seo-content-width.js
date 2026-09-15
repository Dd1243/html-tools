import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// 递归查找所有 HTML 文件
function findHtmlFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && item.name !== 'node_modules' && item.name !== '.git') {
      files.push(...findHtmlFiles(fullPath));
    } else if (item.isFile() && item.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

let fixedCount = 0;
let skippedCount = 0;

const htmlFiles = findHtmlFiles(path.join(rootDir, 'tools'));

htmlFiles.forEach(file => {
  let html = fs.readFileSync(file, 'utf-8');

  // 检查是否有 .seo-content 样式
  if (!html.includes('.seo-content {')) {
    return;
  }

  // 检查是否已经有 max-width
  const seoContentMatch = html.match(/\.seo-content\s*{[\s\S]*?}/);
  if (seoContentMatch && seoContentMatch[0].includes('max-width')) {
    skippedCount++;
    return;
  }

  // 修复：在 .seo-content { 后面添加样式
  html = html.replace(
    /(\.seo-content\s*{\s*\n)/,
    '$1        max-width: 960px;\n        margin-left: auto;\n        margin-right: auto;\n        padding: 0 24px;\n'
  );

  fs.writeFileSync(file, html, 'utf-8');
  console.log(`✅ ${path.relative(rootDir, file)}`);
  fixedCount++;
});

console.log(`\n完成！`);
console.log(`✅ 修复: ${fixedCount} 个文件`);
console.log(`⏭️  跳过: ${skippedCount} 个文件（已有 max-width）`);
