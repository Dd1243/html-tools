import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// 获取所有有问题的文件
const brokenFiles = execSync(
  'git ls-files tools/**/*.html | xargs grep -l "折叠手风琴式工具导航" | xargs grep -l "</article></main>"',
  { encoding: 'utf-8' }
).trim().split('\n').filter(Boolean);

console.log(`发现 ${brokenFiles.length} 个需要修复的文件\n`);

let fixed = 0;
let failed = [];

brokenFiles.forEach((file, index) => {
  try {
    let content = fs.readFileSync(file, 'utf-8');

    // 检查是否确实有问题
    if (!content.includes('</article></main>')) {
      console.log(`[${index + 1}/${brokenFiles.length}] 跳过: ${file} (已修复)`);
      return;
    }

    let modified = false;

    // 修复1: 移除错误的 <article> 标签包裹 header
    if (content.includes('<article><div class="header-left">')) {
      content = content.replace(
        /<article><div class="header-left">/g,
        '<div class="header-left">'
      );
      modified = true;
    }

    // 修复2: 将 </article></main> 改为 </div>，并在文件末尾适当位置添加 </main>
    if (content.includes('</article></main>')) {
      content = content.replace(
        '</article></main>',
        '</div>'
      );
      modified = true;
    }

    // 修复3: 确保在 </body> 前有 </main>
    // 查找最后一个 </section> (手风琴的结束标签) 后面的位置
    const lastSectionIndex = content.lastIndexOf('</section>');
    if (lastSectionIndex > -1) {
      const afterSection = content.substring(lastSectionIndex + 10); // 10 = '</section>'.length

      // 如果 </section> 后面到 </body> 之间没有 </main>，则添加
      if (!afterSection.includes('</main>') && afterSection.includes('</body>')) {
        const footerIndex = content.indexOf('<footer class="site-footer">');
        if (footerIndex > -1) {
          // 在 footer 前添加 </main>
          content = content.substring(0, footerIndex) +
                   '\n    </main>\n\n' +
                   content.substring(footerIndex);
        } else {
          // 在最后一个 </style> 后添加 </main>
          const lastStyleEndIndex = content.lastIndexOf('</style>');
          if (lastStyleEndIndex > -1) {
            const scriptIndex = content.indexOf('<footer class="site-footer">', lastStyleEndIndex);
            if (scriptIndex > -1) {
              content = content.substring(0, scriptIndex) +
                       '\n    </main>\n\n' +
                       content.substring(scriptIndex);
            }
          }
        }
        modified = true;
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
