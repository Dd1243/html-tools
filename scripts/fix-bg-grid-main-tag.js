import fs from 'fs';

// 直接列出所有有问题的文件
const brokenFiles = [
  'tools/math/binary-calculator.html',
  'tools/math/equation-solver.html',
  'tools/math/factorial-calculator.html',
  'tools/math/fraction-calculator.html',
  'tools/math/gcd-lcm-calculator.html',
  'tools/math/logarithm-calculator.html',
  'tools/math/matrix-calculator.html',
  'tools/math/number-base-converter.html',
  'tools/math/percentage-calculator.html',
  'tools/math/permutation-combination.html',
  'tools/math/prime-checker.html',
  'tools/math/quadratic-equation.html',
  'tools/math/statistics-calculator.html',
  'tools/math/trigonometry-calculator.html',
  'tools/math/unit-circle.html',
  'tools/productivity/pomodoro-timer.html'
];

console.log(`发现 ${brokenFiles.length} 个需要修复的文件\n`);

let fixed = 0;
let failed = [];

brokenFiles.forEach((file, index) => {
  try {
    let content = fs.readFileSync(file, 'utf-8');

    let modified = false;

    // 修复: 将 <div class="bg-grid"></main> 改为 <div class="bg-grid"></div>
    if (content.includes('<div class="bg-grid"></main>')) {
      content = content.replace(
        '<div class="bg-grid"></main>',
        '<div class="bg-grid"></div>'
      );
      modified = true;
    }

    // 在文件末尾适当位置添加 </main>
    // 查找手风琴结束标签后的位置
    const accordionEnd = '<!-- 折叠手风琴式工具导航';
    const accordionIndex = content.indexOf(accordionEnd);

    if (accordionIndex > -1) {
      // 找到手风琴的 </style> 标签（手风琴样式的结束）
      const afterAccordion = content.substring(accordionIndex);
      const styleEndMatch = afterAccordion.match(/\s*<\/style>\s*\n/);

      if (styleEndMatch) {
        const styleEndIndex = accordionIndex + afterAccordion.indexOf(styleEndMatch[0]) + styleEndMatch[0].length;

        // 检查 </style> 后面是否已经有 </main>
        const afterStyle = content.substring(styleEndIndex);
        if (!afterStyle.match(/^\s*<\/main>/)) {
          // 在 </style> 后添加 </main>
          content = content.substring(0, styleEndIndex) +
                   '\n    </main>\n' +
                   content.substring(styleEndIndex);
          modified = true;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(file, content, 'utf-8');
      fixed++;
      console.log(`[${index + 1}/${brokenFiles.length}] ✓ 修复: ${file}`);
    } else {
      console.log(`[${index + 1}/${brokenFiles.length}] - 无需修改: ${file}`);
    }

  } catch (err) {
    failed.push({ file, error: err.message });
    console.error(`[${index + 1}/${brokenFiles.length}] ✗ 失败: ${file} - ${err.message}`);
  }
});

console.log(`\n========================================`);
console.log(`修复完成！`);
console.log(`- 成功修复: ${fixed} 个文件`);
console.log(`- 失败: ${failed.length} 个文件`);

if (failed.length > 0) {
  console.log(`\n失败的文件:`);
  failed.forEach(({ file, error }) => {
    console.log(`  - ${file}: ${error}`);
  });
}
