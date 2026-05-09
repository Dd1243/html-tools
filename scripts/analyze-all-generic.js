#!/usr/bin/env node

import fs from 'fs';
import { glob } from 'glob';

// 通用内容模式
const patterns = {
  useCases: {
    dev: [
      'API 开发：在开发和调试 API 时快速处理数据格式',
      '代码审查：检查和验证代码中的数据结构',
      '文档编写：生成技术文档所需的示例数据'
    ],
    converter: [
      '数据迁移：在不同系统间迁移数据时转换格式',
      '单位换算：快速进行各种单位之间的转换',
      '格式标准化：将数据统一为标准格式'
    ],
    text: [
      '内容编辑：快速处理和格式化文本内容',
      '数据清洗：批量处理文本数据，去除冗余',
      '格式转换：在不同文本格式之间转换'
    ]
  },
  faq: [
    'Q: 我的数据安全吗？',
    'A:</strong> 完全安全。所有数据处理都在您的浏览器本地完成',
    'Q: 支持哪些浏览器？',
    'A:</strong> 支持所有现代浏览器，包括 Chrome、Firefox、Safari、Edge'
  ]
};

async function analyze() {
  const files = await glob('tools/**/*.html');

  const stats = {
    total: files.length,
    withUseCases: 0,
    withFAQ: 0,
    genericUseCasesDev: 0,
    genericUseCasesConverter: 0,
    genericUseCasesText: 0,
    genericFAQ: 0,
    examples: {
      dev: [],
      converter: [],
      text: [],
      faq: []
    }
  };

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');

    // 检查是否有使用场景section
    if (content.includes('use-cases')) {
      stats.withUseCases++;

      // 检查是否使用dev模板
      if (patterns.useCases.dev.every(p => content.includes(p))) {
        stats.genericUseCasesDev++;
        if (stats.examples.dev.length < 3) stats.examples.dev.push(file);
      }

      // 检查是否使用converter模板
      if (patterns.useCases.converter.every(p => content.includes(p))) {
        stats.genericUseCasesConverter++;
        if (stats.examples.converter.length < 3) stats.examples.converter.push(file);
      }

      // 检查是否使用text模板
      if (patterns.useCases.text.every(p => content.includes(p))) {
        stats.genericUseCasesText++;
        if (stats.examples.text.length < 3) stats.examples.text.push(file);
      }
    }

    // 检查是否有FAQ section
    if (content.includes('class="faq"')) {
      stats.withFAQ++;

      // 检查是否使用通用FAQ
      if (patterns.faq.every(p => content.includes(p))) {
        stats.genericFAQ++;
        if (stats.examples.faq.length < 3) stats.examples.faq.push(file);
      }
    }
  }

  return stats;
}

analyze().then(stats => {
  console.log('=== 📊 通用内容全面分析报告 ===\n');
  console.log(`总工具页面数: ${stats.total}\n`);

  console.log('--- 使用场景 (Use Cases) ---');
  console.log(`有使用场景section的页面: ${stats.withUseCases} (${(stats.withUseCases/stats.total*100).toFixed(1)}%)`);
  console.log(`  └─ 使用dev通用模板: ${stats.genericUseCasesDev} 个`);
  console.log(`  └─ 使用converter通用模板: ${stats.genericUseCasesConverter} 个`);
  console.log(`  └─ 使用text通用模板: ${stats.genericUseCasesText} 个`);
  console.log(`  └─ 总通用模板: ${stats.genericUseCasesDev + stats.genericUseCasesConverter + stats.genericUseCasesText} 个\n`);

  console.log('--- 常见问题 (FAQ) ---');
  console.log(`有FAQ section的页面: ${stats.withFAQ} (${(stats.withFAQ/stats.total*100).toFixed(1)}%)`);
  console.log(`  └─ 使用通用FAQ模板: ${stats.genericFAQ} 个\n`);

  console.log('--- 总结 ---');
  const totalGeneric = stats.genericUseCasesDev + stats.genericUseCasesConverter + stats.genericUseCasesText + stats.genericFAQ;
  console.log(`🚨 存在通用内容问题的页面: ${totalGeneric} 个`);
  console.log(`   占比: ${(totalGeneric/stats.total*100).toFixed(1)}%\n`);

  console.log('--- 示例文件 ---');
  if (stats.examples.dev.length > 0) {
    console.log('\nDev模板示例:');
    stats.examples.dev.forEach(f => console.log(`  - ${f}`));
  }
  if (stats.examples.converter.length > 0) {
    console.log('\nConverter模板示例:');
    stats.examples.converter.forEach(f => console.log(`  - ${f}`));
  }
  if (stats.examples.text.length > 0) {
    console.log('\nText模板示例:');
    stats.examples.text.forEach(f => console.log(`  - ${f}`));
  }
  if (stats.examples.faq.length > 0) {
    console.log('\n通用FAQ示例:');
    stats.examples.faq.forEach(f => console.log(`  - ${f}`));
  }
});
