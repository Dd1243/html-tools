#!/usr/bin/env node

import fs from 'fs';
import { glob } from 'glob';

function removeGEOSections(content) {
  let modified = content;
  let changesMade = false;

  // 删除工具定义 section（包括注释）
  const toolDefPattern = /\s*<!-- 工具定义（GEO 优化）-->\s*<section class="tool-definition"[^>]*>[\s\S]*?<\/section>\s*/g;
  if (toolDefPattern.test(content)) {
    modified = modified.replace(toolDefPattern, '\n');
    changesMade = true;
  }

  // 删除使用场景 section（包括注释）
  const useCasesPattern = /\s*<!-- 使用场景（GEO 优化）-->\s*<section class="use-cases"[^>]*>[\s\S]*?<\/section>\s*/g;
  if (useCasesPattern.test(modified)) {
    modified = modified.replace(useCasesPattern, '\n');
    changesMade = true;
  }

  // 删除更新日期 footer（也是通用内容）
  const footerPattern = /\s*<!-- 更新日期（GEO 优化）-->\s*<footer class="tool-footer"[^>]*>[\s\S]*?<\/footer>\s*/g;
  if (footerPattern.test(modified)) {
    modified = modified.replace(footerPattern, '\n');
    changesMade = true;
  }

  return { content: modified, changesMade };
}

async function processFiles() {
  const files = await glob('tools/**/*.html');

  // 排除已经手动优化过的文件
  const excludeFiles = [
    'tools/generator/robots-generator.html'
  ];

  let processedCount = 0;
  let modifiedCount = 0;
  let skippedCount = 0;
  const modifiedFiles = [];

  console.log(`开始处理 ${files.length} 个文件...\n`);

  for (const file of files) {
    processedCount++;

    // 跳过已优化的文件
    const normalizedFile = file.replace(/\\/g, '/');
    if (excludeFiles.some(excluded => normalizedFile.includes(excluded))) {
      skippedCount++;
      continue;
    }

    if (processedCount % 100 === 0) {
      console.log(`进度: ${processedCount}/${files.length}`);
    }

    try {
      const content = fs.readFileSync(file, 'utf-8');
      const { content: newContent, changesMade } = removeGEOSections(content);

      if (changesMade) {
        fs.writeFileSync(file, newContent, 'utf-8');
        modifiedCount++;
        modifiedFiles.push(file);
      }
    } catch (error) {
      console.error(`处理文件失败 ${file}:`, error.message);
    }
  }

  console.log('\n=== 处理完成 ===');
  console.log(`总文件数: ${files.length}`);
  console.log(`已修改: ${modifiedCount} 个文件`);
  console.log(`已跳过: ${skippedCount} 个文件（已优化）`);
  console.log(`未修改: ${files.length - modifiedCount - skippedCount} 个文件\n`);

  if (modifiedFiles.length > 0 && modifiedFiles.length <= 10) {
    console.log('修改的文件:');
    modifiedFiles.forEach(f => console.log(`  - ${f}`));
  } else if (modifiedFiles.length > 10) {
    console.log('修改的文件（前10个）:');
    modifiedFiles.slice(0, 10).forEach(f => console.log(`  - ${f}`));
    console.log(`  ... 还有 ${modifiedFiles.length - 10} 个文件`);
  }
}

processFiles().catch(console.error);
