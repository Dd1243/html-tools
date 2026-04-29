#!/usr/bin/env node

/**
 * 修复 GEO 内容插入位置错误的问题
 *
 * 问题：GEO 内容被插入到 JavaScript 代码中间，导致语法错误
 * 影响：页面功能失效，影响 SEO
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let fixedCount = 0;
let errorCount = 0;

// 查找所有有问题的文件
function findProblematicFiles() {
  const { execSync } = await import('child_process');

  try {
    const output = execSync('npm run lint:js 2>&1', {
      cwd: rootDir,
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024
    });

    const files = [];
    const lines = output.split('\n');

    for (const line of lines) {
      if (line.includes('.html') && !line.includes('✖')) {
        const match = line.match(/([^\s]+\.html)/);
        if (match) {
          const filePath = match[1].replace(/^E:\\html-tools\\/, '');
          if (!files.includes(filePath)) {
            files.push(filePath);
          }
        }
      }
    }

    return files;
  } catch (error) {
    // ESLint 有错误时会返回非零退出码，但我们仍然可以解析输出
    return [];
  }
}

// 修复单个文件
function fixFile(filePath) {
  const fullPath = path.join(rootDir, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  文件不存在: ${filePath}`);
    return false;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf-8');
    let modified = false;

    // 检查是否有 GEO 内容插入到 JavaScript 中的问题
    // 特征：JavaScript 代码后面直接跟着 <!-- 工具定义（GEO 优化）-->
    const problematicPattern = /(<script>[\s\S]*?)(<!-- 工具定义（GEO 优化）-->)/;

    if (problematicPattern.test(content)) {
      // 找到 GEO 内容的开始和结束
      const geoStart = content.indexOf('<!-- 工具定义（GEO 优化）-->');
      const geoEnd = content.indexOf('<!-- 更新日期（GEO 优化）-->');

      if (geoStart !== -1 && geoEnd !== -1) {
        // 找到更新日期部分的结束
        const footerEnd = content.indexOf('</footer>', geoEnd);
        if (footerEnd !== -1) {
          const geoContent = content.substring(geoStart, footerEnd + 9);

          // 移除错误位置的 GEO 内容
          content = content.substring(0, geoStart) + content.substring(footerEnd + 9);

          // 找到正确的插入位置（</script> 之后，</div> 之前）
          const lastScriptEnd = content.lastIndexOf('</script>');
          const containerEnd = content.lastIndexOf('</div>');

          if (lastScriptEnd !== -1 && containerEnd !== -1 && lastScriptEnd < containerEnd) {
            // 在 container 结束前插入 GEO 内容
            content = content.substring(0, containerEnd) + '\n' + geoContent + '\n    ' + content.substring(containerEnd);
            modified = true;
          }
        }
      }
    }

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf-8');
      fixedCount++;
      console.log(`✅ 修复: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  无需修复: ${filePath}`);
      return false;
    }

  } catch (error) {
    console.error(`❌ 修复失败: ${filePath}`, error.message);
    errorCount++;
    return false;
  }
}

// 主函数
async function main() {
  console.log('🚀 开始修复 GEO 内容插入位置错误...\n');

  // 手动指定已知有问题的文件
  const problematicFiles = [
    'tools/ai/cursor-shortcuts.html',
    'tools/ai/notebooklm-guide.html',
    'tools/dev/git-cheatsheet.html',
    'tools/legal/legal-glossary.html',
    'tools/network/dns-lookup.html'
  ];

  console.log(`📊 发现 ${problematicFiles.length} 个可能有问题的文件\n`);

  for (const file of problematicFiles) {
    fixFile(file);
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ 修复完成: ${fixedCount} 个`);
  console.log(`❌ 修复失败: ${errorCount} 个`);
  console.log('='.repeat(50));

  if (fixedCount > 0) {
    console.log('\n💡 下一步：');
    console.log('1. 运行 npm run lint:js 验证修复');
    console.log('2. 在浏览器中测试这些页面');
    console.log('3. 提交修复');
  }
}

main();
