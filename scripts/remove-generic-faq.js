#!/usr/bin/env node

import fs from 'fs';
import { glob } from 'glob';

// 通用 FAQ 特征（用于识别需要删除的内容）
const genericFAQPatterns = [
  {
    question: /Q:\s*.*?是免费的吗？/,
    answer: /完全免费，无需注册或付费/
  },
  {
    question: /Q:\s*我的数据安全吗？/,
    answer: /所有数据处理都在您的浏览器本地完成/
  },
  {
    question: /Q:\s*支持哪些浏览器？/,
    answer: /支持所有现代浏览器，包括 Chrome、Firefox、Safari、Edge/
  }
];

function removeGenericFAQ(content) {
  let modified = content;
  let changesMade = false;

  // 匹配 FAQ section
  const faqSectionRegex = /<section class="faq"[^>]*>[\s\S]*?<\/section>/g;
  const faqMatches = content.match(faqSectionRegex);

  if (!faqMatches) {
    return { content, changesMade: false };
  }

  faqMatches.forEach(faqSection => {
    let newFaqSection = faqSection;

    // 删除每个通用 FAQ 项
    // 匹配 <div class="faq-item"> ... </div>
    const faqItemRegex = /<div class="faq-item"[^>]*>[\s\S]*?<\/div>\s*(?=<div class="faq-item"|<\/section>)/g;
    const items = faqSection.match(faqItemRegex);

    if (items) {
      items.forEach(item => {
        // 检查是否是通用 FAQ
        const isGeneric = genericFAQPatterns.some(pattern =>
          pattern.question.test(item) && pattern.answer.test(item)
        );

        if (isGeneric) {
          newFaqSection = newFaqSection.replace(item, '');
          changesMade = true;
        }
      });
    }

    // 检查删除后 FAQ section 是否为空（只剩标题）
    const hasRemainingItems = /<div class="faq-item"/.test(newFaqSection);

    if (!hasRemainingItems) {
      // 如果没有剩余的 FAQ 项，删除整个 section
      modified = modified.replace(faqSection, '');
      changesMade = true;
    } else {
      // 否则只替换内容
      modified = modified.replace(faqSection, newFaqSection);
    }
  });

  return { content: modified, changesMade };
}

async function processFiles() {
  const files = await glob('tools/**/*.html');

  let processedCount = 0;
  let modifiedCount = 0;
  const modifiedFiles = [];

  console.log(`开始处理 ${files.length} 个文件...\n`);

  for (const file of files) {
    processedCount++;

    if (processedCount % 100 === 0) {
      console.log(`进度: ${processedCount}/${files.length}`);
    }

    try {
      const content = fs.readFileSync(file, 'utf-8');
      const { content: newContent, changesMade } = removeGenericFAQ(content);

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
  console.log(`未修改: ${files.length - modifiedCount} 个文件\n`);

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
