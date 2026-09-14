import fs from 'fs';

const files = [
  'tools/pets/feeding-schedule.html',
  'tools/pets/pet-age.html',
  'tools/pets/pet-food-calc.html'
];

files.forEach(file => {
  let html = fs.readFileSync(file, 'utf-8');

  // 1. 在 <main 之前添加 <article>
  html = html.replace(/(\s*)(<main[^>]*>)/i, '$1<article>\n$1$2');

  // 2. 删除错误位置的 <article> (在 card 内部)
  html = html.replace(/<article>(<div class="card-title">)/g, '$1');

  // 3. 在 </article> 之前添加 </main>（如果还没有）
  if (!html.includes('</main>')) {
    html = html.replace(/(\s*)(<!-- 折叠手风琴式工具导航 - 自动生成 -->|<\/article>)/i, '$1</main>\n$1$2');
  }

  fs.writeFileSync(file, html, 'utf-8');
  console.log(`✅ 修复: ${file}`);
});

console.log('\n完成！');
