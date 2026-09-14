import fs from 'fs';
import { execSync } from 'child_process';

const toolsData = JSON.parse(fs.readFileSync('tools.json', 'utf-8'));

// 获取所有工具ID
const allToolIds = Object.keys(toolsData.tools);

console.log(`准备重新生成 ${allToolIds.length} 个工具的内链...\n`);

let processed = 0;
let failed = [];

// 分批处理，每批15个
for (let i = 0; i < allToolIds.length; i += 15) {
  const batch = allToolIds.slice(i, i + 15);
  const batchNum = Math.floor(i / 15) + 1;

  console.log(`[批次 ${batchNum}] 处理工具 ${i + 1}-${Math.min(i + 15, allToolIds.length)}...`);

  for (const id of batch) {
    try {
      execSync(`node scripts/inject-accordion-links.js ${id}`, {
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      processed++;
      process.stdout.write('.');
    } catch(e) {
      failed.push({ id, error: e.message });
      process.stdout.write('x');
    }
  }

  console.log(`\n  ✓ 批次完成: ${batch.length} 个工具\n`);
}

console.log(`\n========================================`);
console.log(`重新生成完成！`);
console.log(`- 成功: ${processed}/${allToolIds.length}`);
console.log(`- 失败: ${failed.length}`);

if (failed.length > 0 && failed.length < 10) {
  console.log(`\n失败的工具:`);
  failed.forEach(({ id, error }) => {
    console.log(`  - ${id}: ${error}`);
  });
}
