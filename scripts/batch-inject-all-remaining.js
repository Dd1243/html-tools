import fs from 'fs';
import { execSync } from 'child_process';

const toolsData = JSON.parse(fs.readFileSync('tools.json', 'utf-8'));

// 获取所有未完成的工具ID
const allRemaining = Object.entries(toolsData.tools)
  .filter(([id, tool]) => {
    try {
      const content = fs.readFileSync(tool.path, 'utf-8');
      return !content.includes('折叠手风琴式工具导航');
    } catch(e) {
      return true;
    }
  })
  .map(([id]) => id);

console.log(`总共需要处理 ${allRemaining.length} 个工具\n`);

// 按分类分组
const byCategory = {};
allRemaining.forEach(id => {
  const cat = toolsData.tools[id].category;
  if (!byCategory[cat]) byCategory[cat] = [];
  byCategory[cat].push(id);
});

console.log('分类统计:');
Object.entries(byCategory).forEach(([cat, ids]) => {
  console.log(`  ${cat}: ${ids.length} 个`);
});
console.log('');

// 分批处理（每批15个，避免部署问题）
let totalProcessed = 0;
let batchNum = 0;

for (const [category, ids] of Object.entries(byCategory)) {
  console.log(`\n======== 处理分类: ${category} (${ids.length} 个) ========`);

  // 每个分类分成多批
  for (let i = 0; i < ids.length; i += 15) {
    batchNum++;
    const batch = ids.slice(i, i + 15);

    console.log(`\n[批次 ${batchNum}] 处理 ${category} 的 ${batch.length} 个工具 (ID: ${batch[0]}-${batch[batch.length-1]})`);

    // 逐个注入
    let successCount = 0;
    for (const id of batch) {
      try {
        execSync(`node scripts/inject-accordion-links.js ${id}`, {
          encoding: 'utf-8',
          stdio: 'pipe'
        });
        successCount++;
        process.stdout.write('.');
      } catch(e) {
        console.error(`\n  ✗ 失败: ID ${id} - ${e.message}`);
      }
    }

    console.log(`\n  ✓ 成功: ${successCount}/${batch.length}`);
    totalProcessed += successCount;

    // 提交这一批
    try {
      const categoryName = toolsData.categories[category]?.name || category;
      const commitMsg = `feat(内链): 批量添加内链 - ${categoryName} 分类 (批次${batchNum}, ${batch.length}个)

IDs: ${batch.join(' ')}

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`;

      execSync('git add tools/**/*.html', { stdio: 'pipe' });
      execSync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, { stdio: 'pipe' });
      console.log(`  ✓ 已提交批次 ${batchNum}`);
    } catch(e) {
      console.error(`  ✗ 提交失败: ${e.message}`);
    }
  }
}

console.log(`\n\n========================================`);
console.log(`处理完成！`);
console.log(`- 总计处理: ${totalProcessed}/${allRemaining.length} 个工具`);
console.log(`- 总批次数: ${batchNum}`);
console.log(`\n现在推送到 GitHub...`);

try {
  execSync('git push origin master', { stdio: 'inherit' });
  console.log('✓ 推送成功！');
} catch(e) {
  console.error('✗ 推送失败，请手动执行: git push origin master');
}
