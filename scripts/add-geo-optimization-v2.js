#!/usr/bin/env node

/**
 * GEO (Generative Engine Optimization) 优化脚本 v2
 * 修复版本：确保 GEO 内容插入到正确位置
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 读取 tools.json
const toolsJsonPath = path.join(rootDir, 'tools.json');
const toolsData = JSON.parse(fs.readFileSync(toolsJsonPath, 'utf-8'));
const { categories, tools } = toolsData;

// 工具类别的通用描述模板
const categoryDescriptions = {
  dev: {
    purpose: '开发工具',
    audience: '程序员、前端开发者、后端工程师',
    benefits: '提高开发效率、减少重复工作、快速调试'
  },
  text: {
    purpose: '文本处理工具',
    audience: '编辑、作家、内容创作者、开发者',
    benefits: '快速处理文本、格式转换、内容分析'
  },
  time: {
    purpose: '时间工具',
    audience: '开发者、项目管理者、国际团队',
    benefits: '时间转换、时区计算、日期处理'
  },
  converter: {
    purpose: '转换工具',
    audience: '开发者、设计师、数据分析师',
    benefits: '快速格式转换、单位换算、数据迁移'
  },
  generator: {
    purpose: '生成器工具',
    audience: '开发者、设计师、内容创作者',
    benefits: '快速生成内容、提高创作效率、标准化输出'
  },
  media: {
    purpose: '媒体处理工具',
    audience: '设计师、摄影师、视频编辑',
    benefits: '图片处理、格式转换、批量操作'
  },
  calculator: {
    purpose: '计算器工具',
    audience: '学生、工程师、财务人员',
    benefits: '快速计算、精确结果、多种计算模式'
  }
};

// 生成 HowTo Schema
function generateHowToSchema(tool, category) {
  const toolName = tool.name;
  const steps = generateStepsForTool(tool, category);

  return `
    <!-- HowTo 结构化数据（GEO 优化）-->
    <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "如何使用${toolName}",
  "description": "${tool.description || `使用 ${toolName} 的步骤指南`}",
  "step": ${JSON.stringify(steps, null, 2)}
}
    </script>`;
}

// 根据工具类型生成使用步骤
function generateStepsForTool(tool, category) {
  const commonSteps = [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "打开工具",
      "text": `访问 ${tool.name}，无需安装或注册`
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "输入数据",
      "text": "在输入框中粘贴或输入需要处理的内容"
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "查看结果",
      "text": "结果会实时显示，点击复制按钮即可使用"
    }
  ];

  if (tool.name.includes('转换') || tool.name.includes('转化')) {
    commonSteps[1].text = "输入需要转换的内容或数据";
    commonSteps[2].text = "选择目标格式，查看转换结果";
  } else if (tool.name.includes('生成') || tool.name.includes('生成器')) {
    commonSteps[1].text = "设置生成参数和选项";
    commonSteps[2].text = "点击生成按钮，获取结果";
  } else if (tool.name.includes('计算') || tool.name.includes('计算器')) {
    commonSteps[1].text = "输入计算所需的数值";
    commonSteps[2].text = "查看计算结果和详细说明";
  }

  return commonSteps;
}

// 增强 SoftwareApplication Schema
function generateEnhancedAppSchema(tool, category) {
  const categoryInfo = categories[category];
  const currentDate = new Date().toISOString().split('T')[0];

  return `
    <!-- 增强的 SoftwareApplication 结构化数据（GEO 优化）-->
    <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "${tool.name}",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Any (Browser-based)",
  "url": "https://essays4u.net/${tool.path.replace('.html', '')}",
  "description": "${tool.description || `${tool.name} - WebUtils 在线工具`}",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "author": {
    "@type": "Organization",
    "name": "WebUtils",
    "url": "https://essays4u.net"
  },
  "publisher": {
    "@type": "Organization",
    "name": "WebUtils",
    "url": "https://essays4u.net"
  },
  "datePublished": "2024-01-01",
  "dateModified": "${currentDate}",
  "softwareVersion": "1.0",
  "isAccessibleForFree": true,
  "inLanguage": ["zh-CN", "en"],
  "browserRequirements": "Requires JavaScript. Works in Chrome, Firefox, Safari, Edge."
}
    </script>`;
}

// 生成工具定义 HTML
function generateToolDefinition(tool, category) {
  const categoryInfo = categories[category];
  const categoryDesc = categoryDescriptions[category] || categoryDescriptions.dev;

  return `
      <!-- 工具定义（GEO 优化）-->
      <section class="tool-definition" style="margin: 2rem 0; padding: 1.5rem; background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <h2 style="font-size: 1.5rem; margin-bottom: 1rem; color: var(--text-primary);">什么是${tool.name}？</h2>
        <p style="line-height: 1.6; color: var(--text-secondary); margin-bottom: 1rem;">
          <strong>${tool.name}</strong>是一个${categoryDesc.purpose}，专为${categoryDesc.audience}设计。
          ${tool.description || `帮助用户快速完成${tool.name}相关任务。`}
        </p>

        <h3 style="font-size: 1.25rem; margin: 1.5rem 0 0.75rem; color: var(--text-primary);">主要特点</h3>
        <ul style="line-height: 1.8; color: var(--text-secondary); padding-left: 1.5rem;">
          <li><strong>完全免费</strong>：无需注册，无使用限制</li>
          <li><strong>隐私安全</strong>：所有处理在浏览器本地完成，不上传数据</li>
          <li><strong>实时处理</strong>：输入即时响应，无需等待</li>
          <li><strong>跨平台</strong>：支持桌面和移动设备</li>
        </ul>
      </section>
`;
}

// 生成使用场景 HTML
function generateUseCases(tool, category) {
  const useCases = generateUseCasesForCategory(category, tool.name);

  return `
      <!-- 使用场景（GEO 优化）-->
      <section class="use-cases" style="margin: 2rem 0; padding: 1.5rem; background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <h2 style="font-size: 1.5rem; margin-bottom: 1rem; color: var(--text-primary);">常见使用场景</h2>
        <ol style="line-height: 1.8; color: var(--text-secondary); padding-left: 1.5rem;">
          ${useCases.map(uc => `<li><strong>${uc.title}</strong>：${uc.description}</li>`).join('\n          ')}
        </ol>
      </section>
`;
}

// 根据类别生成使用场景
function generateUseCasesForCategory(category, toolName) {
  const scenarioTemplates = {
    dev: [
      { title: 'API 开发', description: '在开发和调试 API 时快速处理数据格式' },
      { title: '代码审查', description: '检查和验证代码中的数据结构' },
      { title: '文档编写', description: '生成技术文档所需的示例数据' }
    ],
    text: [
      { title: '内容编辑', description: '快速处理和格式化文本内容' },
      { title: '数据清洗', description: '批量处理文本数据，去除冗余' },
      { title: '格式转换', description: '在不同文本格式之间转换' }
    ],
    time: [
      { title: '跨时区协作', description: '团队成员分布在不同时区时的时间协调' },
      { title: '日志分析', description: '解析和理解服务器日志中的时间戳' },
      { title: '项目管理', description: '计算项目里程碑和截止日期' }
    ],
    converter: [
      { title: '数据迁移', description: '在不同系统间迁移数据时转换格式' },
      { title: '单位换算', description: '快速进行各种单位之间的转换' },
      { title: '格式标准化', description: '将数据统一为标准格式' }
    ]
  };

  return scenarioTemplates[category] || scenarioTemplates.dev;
}

// 生成 FAQ HTML
function generateFAQ(tool, category) {
  const faqs = generateFAQsForTool(tool, category);

  return `
      <!-- FAQ（GEO 优化）-->
      <section class="faq" style="margin: 2rem 0; padding: 1.5rem; background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <h2 style="font-size: 1.5rem; margin-bottom: 1rem; color: var(--text-primary);">常见问题</h2>
        ${faqs.map(faq => `
        <div class="faq-item" style="margin-bottom: 1.5rem;">
          <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem; color: var(--text-primary);">Q: ${faq.question}</h3>
          <p style="line-height: 1.6; color: var(--text-secondary);"><strong>A:</strong> ${faq.answer}</p>
        </div>`).join('\n        ')}
      </section>
`;
}

// 生成工具相关的 FAQ
function generateFAQsForTool(tool, category) {
  return [
    {
      question: `${tool.name}是免费的吗？`,
      answer: `是的，${tool.name}完全免费，无需注册或付费。所有功能都可以无限制使用。`
    },
    {
      question: '我的数据安全吗？',
      answer: '完全安全。所有数据处理都在您的浏览器本地完成，不会上传到任何服务器。您可以完全离线使用此工具。'
    },
    {
      question: '支持哪些浏览器？',
      answer: '支持所有现代浏览器，包括 Chrome、Firefox、Safari、Edge 等。建议使用最新版本以获得最佳体验。'
    }
  ];
}

// 添加更新日期标记
function generateUpdateDate() {
  const currentDate = new Date().toISOString().split('T')[0];
  const formattedDate = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
      <!-- 更新日期（GEO 优化）-->
      <footer class="tool-footer" style="margin: 2rem 0; padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.875rem; border-top: 1px solid var(--border-color);">
        <p>最后更新：<time datetime="${currentDate}">${formattedDate}</time></p>
        <p>本工具由 <a href="../../index.html" style="color: var(--accent); text-decoration: none;">WebUtils</a> 提供</p>
      </footer>
`;
}

/**
 * 找到正确的插入位置
 * 规则：在 </body> 之前插入（最安全的位置）
 */
function findInsertionPoint(content) {
  const bodyEnd = content.lastIndexOf('</body>');
  return bodyEnd !== -1 ? bodyEnd : -1;
}

let processedCount = 0;
let skippedCount = 0;
let errorCount = 0;

// 处理单个工具文件
function processToolFile(toolId, tool) {
  const toolPath = path.join(rootDir, tool.path);

  if (!fs.existsSync(toolPath)) {
    console.warn(`⚠️  文件不存在: ${tool.path}`);
    skippedCount++;
    return;
  }

  try {
    let content = fs.readFileSync(toolPath, 'utf-8');

    // 检查是否已经有 GEO 优化标记
    if (content.includes('<!-- HowTo 结构化数据（GEO 优化）-->') ||
        content.includes('<!-- 工具定义（GEO 优化）-->')) {
      console.log(`⏭️  跳过（已有 GEO 优化）: ${tool.name}`);
      skippedCount++;
      return;
    }

    const category = categories[tool.category];
    if (!category) {
      console.warn(`⚠️  分类不存在: ${tool.category} for ${tool.name}`);
      skippedCount++;
      return;
    }

    // 1. 在 </head> 前添加 HowTo Schema
    const howToSchema = ``;
    const enhancedAppSchema = ``;

    // 查找现有的 WebApplication schema 并替换
    const appSchemaRegex = /<script type="application\/ld\+json">\s*\{[^<]*"@type":\s*"WebApplication"[^<]*\}\s*<\/script>/s;
    if (appSchemaRegex.test(content)) {
      content = content.replace(appSchemaRegex, enhancedAppSchema);
    }

    // 在 </head> 前添加 HowTo Schema
    content = content.replace('</head>', `${howToSchema}\n  </head>`);

    // 2. 找到正确的插入位置
    const insertionPoint = findInsertionPoint(content);

    if (insertionPoint === -1) {
      console.warn(`⚠️  无法找到插入位置: ${tool.name}`);
      errorCount++;
      return;
    }

    // 3. 生成 GEO 内容
    const toolDefinition = generateToolDefinition(tool, tool.category);
    const useCases = generateUseCases(tool, tool.category);
    const faq = generateFAQ(tool, tool.category);
    const updateDate = generateUpdateDate();

    const geoContent = `\n${toolDefinition}${useCases}${faq}${updateDate}\n    `;

    // 4. 在正确位置插入 GEO 内容
    content = content.slice(0, insertionPoint) + geoContent + content.slice(insertionPoint);

    // 写回文件
    fs.writeFileSync(toolPath, content, 'utf-8');
    processedCount++;
    console.log(`✅ ${processedCount}. ${tool.name}`);

  } catch (error) {
    console.error(`❌ 处理失败: ${tool.name}`, error.message);
    errorCount++;
  }
}

// 主函数
function main() {
  console.log('🚀 开始添加 GEO 优化（改进版）...\n');

  const toolEntries = Object.entries(tools);
  console.log(`📊 总共 ${toolEntries.length} 个工具\n`);

  // 可以通过环境变量限制处理数量（用于测试）
  const maxTools = process.env.MAX_TOOLS ? parseInt(process.env.MAX_TOOLS) : toolEntries.length;
  const toolsToProcess = toolEntries.slice(0, maxTools);

  console.log(`🎯 本次处理 ${toolsToProcess.length} 个工具\n`);

  for (const [toolId, tool] of toolsToProcess) {
    processToolFile(toolId, tool);
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ 处理完成: ${processedCount} 个`);
  console.log(`⏭️  跳过: ${skippedCount} 个`);
  console.log(`❌ 失败: ${errorCount} 个`);
  console.log('='.repeat(50));

  if (processedCount > 0) {
    console.log('\n💡 提示：');
    console.log('1. 运行 npm run lint:js 验证是否有新错误');
    console.log('2. 在浏览器中测试几个工具页面');
    console.log('3. 使用 Google Rich Results Test 验证结构化数据');
    console.log('4. 如果验证通过，提交更改');
  }
}

main();
