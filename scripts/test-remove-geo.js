#!/usr/bin/env node

import fs from 'fs';

const testFile = 'tools/converter/color-converter.html';

function removeGEOSections(content) {
  let modified = content;
  let changesMade = false;

  // 删除工具定义 section
  const toolDefPattern = /\s*<!-- 工具定义（GEO 优化）-->\s*<section class="tool-definition"[^>]*>[\s\S]*?<\/section>\s*/g;
  const toolDefMatches = content.match(toolDefPattern);
  if (toolDefMatches) {
    console.log(`找到 ${toolDefMatches.length} 个工具定义 section`);
    modified = modified.replace(toolDefPattern, '\n');
    changesMade = true;
  }

  // 删除使用场景 section
  const useCasesPattern = /\s*<!-- 使用场景（GEO 优化）-->\s*<section class="use-cases"[^>]*>[\s\S]*?<\/section>\s*/g;
  const useCasesMatches = modified.match(useCasesPattern);
  if (useCasesMatches) {
    console.log(`找到 ${useCasesMatches.length} 个使用场景 section`);
    modified = modified.replace(useCasesPattern, '\n');
    changesMade = true;
  }

  // 删除更新日期 footer
  const footerPattern = /\s*<!-- 更新日期（GEO 优化）-->\s*<footer class="tool-footer"[^>]*>[\s\S]*?<\/footer>\s*/g;
  const footerMatches = modified.match(footerPattern);
  if (footerMatches) {
    console.log(`找到 ${footerMatches.length} 个更新日期 footer`);
    modified = modified.replace(footerPattern, '\n');
    changesMade = true;
  }

  return { content: modified, changesMade };
}

const content = fs.readFileSync(testFile, 'utf-8');
console.log('=== 测试删除 GEO 优化内容 ===\n');
console.log(`原始文件大小: ${content.length} 字符\n`);

const { content: newContent, changesMade } = removeGEOSections(content);

console.log(`\n是否有修改: ${changesMade}`);
console.log(`新文件大小: ${newContent.length} 字符`);
console.log(`减少: ${content.length - newContent.length} 字符`);
