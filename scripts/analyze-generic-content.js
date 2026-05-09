#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// 通用内容特征
const genericPatterns = [
  { name: '通用工具描述', pattern: /专为开发者、设计师、内容创作者设计/ },
  { name: '通用使用场景-数据迁移', pattern: /数据迁移：在不同系统间迁移数据时转换格式/ },
  { name: '通用使用场景-单位换算', pattern: /单位换算：快速进行各种单位之间的转换/ },
  { name: '通用使用场景-内容编辑', pattern: /内容编辑：快速处理和格式化文本内容/ },
  { name: '通用使用场景-数据清洗', pattern: /数据清洗：批量处理文本数据，去除冗余/ },
  { name: '通用FAQ-免费', pattern: /Q: .+是免费的吗\?/ },
  { name: '通用FAQ-数据安全', pattern: /Q: 我的数据安全吗\?/ },
  { name: '通用FAQ-浏览器支持', pattern: /Q: 支持哪些浏览器\?/ }
];

async function analyzeFiles() {
  const files = await glob('tools/**/*.html');

  const results = {
    total: files.length,
    withGenericContent: new Set(),
    patternCounts: {}
  };

  genericPatterns.forEach(p => {
    results.patternCounts[p.name] = 0;
  });

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    let hasGeneric = false;

    for (const { name, pattern } of genericPatterns) {
      if (pattern.test(content)) {
        results.patternCounts[name]++;
        hasGeneric = true;
      }
    }

    if (hasGeneric) {
      results.withGenericContent.add(file);
    }
  }

  return results;
}

analyzeFiles().then(results => {
  console.log('=== 通用内容分析报告 ===\n');
  console.log(`总工具页面数: ${results.total}`);
  console.log(`包含通用内容的页面: ${results.withGenericContent.size} (${(results.withGenericContent.size / results.total * 100).toFixed(1)}%)\n`);

  console.log('各类通用内容出现次数:');
  Object.entries(results.patternCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([name, count]) => {
      if (count > 0) {
        console.log(`  ${name}: ${count} 次`);
      }
    });

  console.log('\n示例文件（前10个）:');
  Array.from(results.withGenericContent).slice(0, 10).forEach(file => {
    console.log(`  - ${file}`);
  });
});
