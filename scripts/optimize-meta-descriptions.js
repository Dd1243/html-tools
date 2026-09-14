import fs from 'fs';
import path from 'path';

// 为特定工具定制的 meta description（110-160 字符）
const customDescriptions = {
  // Lifestyle 生活工具
  '975': '免费在线生日提醒器，智能管理家人朋友同事的生日和重要纪念日时间。支持公历农历自动转换计算、倒计时天数实时显示、到期提前多日提醒功能。浏览器本地存储数据安全私密，永久免费无广告，帮你不再错过每个重要的日子，维护人际关系好帮手。', // 生日提醒器
  '976': '每日正能量语录生成器，每天为你精选推送励志名言警句、积极心理暗示和治愈系正能量文案。涵盖工作职场、生活日常、情感心理等多个主题分类，支持一键复制分享到微信朋友圈。用正能量语录开启美好充实的一天，让心情时刻充满阳光和希望。', // 每日正能量
  '977': '喝水打卡追踪器工具，帮助你养成科学健康的每日饮水好习惯。每日饮水量智能记录统计、定时提醒喝水时间间隔、可视化统计分析图表数据。支持自定义每日目标饮水量和个人体重，数据本地安全保存，守护你的身体健康状态，远离亚健康生活方式。', // 喝水打卡

  // Fitness 健身运动
  '736': '专业 HIIT 高强度间歇训练计时器工具，支持 Tabata、EMOM、自定义循环等多种科学训练模式方案。自由设置运动时长和休息时长、循环轮数次数，语音播报提示与训练进度可视化实时展示。适合居家健身锻炼、高效燃脂减肥、体能提升训练，完全免费无任何广告。', // 运动间歇计时器
  '989': '健身运动记录管理工具，全面追踪每日运动训练量、卡路里热量消耗和体重身材变化趋势数据。支持跑步有氧、力量训练、瑜伽伸展等多种运动健身类型详细记录，自动生成每周每月统计图表和数据分析报告，帮助你科学制定和高效管理个人健身训练计划。', // 健身记录

  // Gardening 园艺工具
  '734': '植物浇水智能提醒工具助手，为你的室内外绿植花卉设置科学合理的浇水日程时间表和日常养护提醒计划任务。支持记录多种不同植物的浇水周期频率、光照需求条件、施肥时间节点，到期自动微信提醒通知。让养花护草园艺变得简单轻松容易，新手小白也能养出健康茂盛的植物。', // 植物浇水提醒
  '988': '园艺浇水日程智能管理器工具，科学安排多种室内外植物花卉的浇水计划和养护管理任务清单。根据不同植物生长习性特点智能推荐最佳浇水频率时间，支持日历视图模式和定时提醒推送功能，配合实时天气预报数据调整浇水策略方案，帮助你精心养好家里每一盆心爱的花草植物。', // 浇水日程
  '998': '室内植物养护指南百科知识全书，详细提供绿萝吊兰、多肉仙人掌、发财树富贵竹、虎皮兰等 100 多种常见流行植物的详细科学养殖栽培方法技巧。全面包含浇水频率周期、光照要求条件、施肥技巧方法、病虫害防治措施等实用养护知识，配合高清图文教程视频，零基础养花新手也能轻松养活美化植物。', // 植物养护指南

  // Automotive 汽车工具
  '733': '汽车油费成本精准计算器工具，根据实际行驶里程公里数、当前所在地油价单价和车辆实际油耗数据快速计算每次日常通勤出行的真实用车费用开支。支持多个不同车型油费成本对比分析、长途自驾旅行费用预算规划，帮助车主朋友合理有效控制日常用车成本开支，做到心中有数明明白白，经济实惠安心出行。', // 油费计算器
  '836': '汽车轮胎胎压单位在线快速转换工具，支持 PSI 磅力、Bar 巴、kPa 千帕三种国际通用胎压压力单位标准之间互相精准转换计算。附带各大汽车品牌车型标准推荐胎压数值参考对照查询表，帮助车主朋友快速查询了解和精准调整设置轮胎气压值数据，有效保障日常行车驾驶安全，科学延长轮胎使用寿命周期。', // 胎压转换
  '987': '汽车百公里油耗精准计算器工具，输入每次加油升数量和对应行驶里程公里数自动计算车辆实际平均油耗水平数据。支持多次连续加油记录统计汇总分析、油耗水平趋势变化图表可视化展示，帮助车主准确深入了解爱车真实油耗性能水平和日常用车成本开支情况，客观全面评估车辆燃油经济性综合表现。' // 油耗计算器
};

// 验证字符长度
Object.entries(customDescriptions).forEach(([id, desc]) => {
  const len = desc.length;
  if (len < 110 || len > 160) {
    console.warn(`⚠️  工具 ${id} 的 description 长度为 ${len}，不在 110-160 范围内`);
  }
});

// 更新 HTML 文件的 meta description
function updateMetaDescription(filePath, newDescription) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  文件不存在: ${filePath}`);
    return false;
  }

  let html = fs.readFileSync(filePath, 'utf-8');

  // 替换 meta description
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${newDescription}"`
  );

  // 替换 og:description
  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${newDescription}"`
  );

  // 替换 twitter:description
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${newDescription}"`
  );

  fs.writeFileSync(filePath, html, 'utf-8');
  return true;
}

// 主函数
function main() {
  const toolsData = JSON.parse(fs.readFileSync('tools.json', 'utf-8'));

  let successCount = 0;
  let failCount = 0;

  Object.entries(customDescriptions).forEach(([toolId, newDesc]) => {
    const tool = toolsData.tools[toolId];
    if (!tool) {
      console.log(`❌ 工具 ID ${toolId} 不存在`);
      failCount++;
      return;
    }

    const filePath = tool.path;
    console.log(`\n处理: [${toolId}] ${tool.name}`);
    console.log(`  文件: ${filePath}`);
    console.log(`  新 description (${newDesc.length} 字符):`);
    console.log(`  ${newDesc}`);

    if (updateMetaDescription(filePath, newDesc)) {
      console.log(`  ✅ 更新成功`);
      successCount++;
    } else {
      console.log(`  ❌ 更新失败`);
      failCount++;
    }
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log(`总计: ${successCount + failCount} 个工具`);
  console.log(`✅ 成功: ${successCount}`);
  console.log(`❌ 失败: ${failCount}`);
}

main();
