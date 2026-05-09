#!/usr/bin/env node

import fs from 'fs';

const testFile = 'tools/converter/color-converter.html';

// 通用 FAQ 特征
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
    const faqItemRegex = /<div class="faq-item"[^>]*>[\s\S]*?<\/div>\s*/g;
    const items = [...faqSection.matchAll(faqItemRegex)];

    items.forEach(match => {
      const item = match[0];
      // 检查是否是通用 FAQ
      const isGeneric = genericFAQPatterns.some(pattern =>
        pattern.question.test(item) && pattern.answer.test(item)
      );

      if (isGeneric) {
        newFaqSection = newFaqSection.replace(item, '');
        changesMade = true;
      }
    });

    // 检查删除后 FAQ section 是否为空
    const hasRemainingItems = /<div class="faq-item"/.test(newFaqSection);

    if (!hasRemainingItems) {
      // 删除整个 section（包括前后的注释）
      const sectionWithComment = new RegExp(
        `\\s*<!-- FAQ（GEO 优化）-->\\s*${faqSection.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
        'g'
      );
      modified = modified.replace(sectionWithComment, '');
      if (!modified.includes(faqSection)) {
        changesMade = true;
      } else {
        modified = modified.replace(faqSection, '');
        changesMade = true;
      }
    } else {
      modified = modified.replace(faqSection, newFaqSection);
    }
  });

  return { content: modified, changesMade };
}

const content = fs.readFileSync(testFile, 'utf-8');
console.log('原始 FAQ section:');
const faqMatch = content.match(/<section class="faq"[^>]*>[\s\S]*?<\/section>/);
if (faqMatch) {
  console.log(faqMatch[0].substring(0, 500) + '...\n');
}

const { content: newContent, changesMade } = removeGenericFAQ(content);

console.log(`是否有修改: ${changesMade}`);

if (changesMade) {
  const newFaqMatch = newContent.match(/<section class="faq"[^>]*>[\s\S]*?<\/section>/);
  console.log('\n修改后 FAQ section:');
  if (newFaqMatch) {
    console.log(newFaqMatch[0].substring(0, 500) + '...');
  } else {
    console.log('FAQ section 已完全删除');
  }
}
