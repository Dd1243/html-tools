import fs from 'fs';
import { execSync } from 'child_process';

// 查找所有有 article-section 但缺少 max-width 的文件
const allFiles = execSync('git ls-files tools/**/*.html', { encoding: 'utf-8' })
  .trim().split('\n').filter(Boolean);

const filesToFix = [];

allFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf-8');

    // 检查是否有 .article-section
    if (!content.includes('.article-section')) return;

    // 检查是否缺少 max-width
    const match = content.match(/\.article-section\s*{[^}]+}/);
    if (match && !match[0].includes('max-width')) {
      filesToFix.push(file);
    }
  } catch(e) {}
});

console.log(`发现 ${filesToFix.length} 个文件需要修复\n`);

let fixed = 0;
let failed = [];

filesToFix.forEach((file, index) => {
  try {
    let content = fs.readFileSync(file, 'utf-8');

    // 匹配 .article-section { ... } 并添加 max-width
    const regex = /(\.article-section\s*{\s*\n)(\s+)/;
    const match = content.match(regex);

    if (match) {
      // 在第一个属性前添加 max-width
      const replacement = `$1$2max-width: 900px;\n$2margin-left: auto;\n$2margin-right: auto;\n$2`;
      content = content.replace(regex, replacement);

      fs.writeFileSync(file, content, 'utf-8');
      fixed++;

      if ((index + 1) % 10 === 0) {
        process.stdout.write(`[${index + 1}/${filesToFix.length}]\n`);
      } else {
        process.stdout.write('.');
      }
    } else {
      failed.push({ file, error: 'Pattern not matched' });
    }
  } catch(e) {
    failed.push({ file, error: e.message });
    console.error(`\n✗ ${file}: ${e.message}`);
  }
});

console.log(`\n\n========================================`);
console.log(`修复完成！`);
console.log(`- 成功: ${fixed}/${filesToFix.length}`);
console.log(`- 失败: ${failed.length}`);

if (failed.length > 0 && failed.length < 10) {
  console.log(`\n失败的文件:`);
  failed.forEach(({ file, error }) => {
    console.log(`  - ${file}: ${error}`);
  });
}
