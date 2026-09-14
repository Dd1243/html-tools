import fs from 'fs';

const files = [
  // 缺少 </article> 的文件
  'tools/music/metronome.html',
  'tools/pets/feeding-schedule.html',
  'tools/pets/pet-age-calculator.html',
  'tools/pets/pet-age.html',
  'tools/pets/pet-food-calc.html',
  'tools/photography/exposure-calc.html',
  'tools/photography/golden-hour.html',
  'tools/shopping/price-comparison.html',
  'tools/shopping/unit-price.html'
];

files.forEach(file => {
  let html = fs.readFileSync(file, 'utf-8');

  // 在 <!-- 折叠手风琴式工具导航 - 自动生成 --> 之前添加 </article>
  if (html.includes('<!-- 折叠手风琴式工具导航 - 自动生成 -->')) {
    html = html.replace(
      /(\s*)(<!-- 折叠手风琴式工具导航 - 自动生成 -->)/,
      '$1</article>\n\n$1$2'
    );

    fs.writeFileSync(file, html, 'utf-8');
    console.log(`✅ 修复: ${file}`);
  } else {
    console.log(`⚠️  未找到插入点: ${file}`);
  }
});

console.log('\n完成！');
