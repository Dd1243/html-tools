const fs = require('fs');
const path = require('path');

// 工具配置和内容生成函数
const toolConfigs = {
  // 开发工具
  'json-formatter': {
    title: 'JSON格式化工具 - 免费在线格式化 | WebUtils',
    description: '免费在线JSON格式化工具，支持美化、压缩、语法高亮。无需上传服务器，100%本地处理，保护隐私。支持大文件，实时格式化，一键复制。',
    keywords: 'json格式化,json美化,json压缩,json在线工具,json格式化工具,json validator,免费json格式化',
    category: '开发工具',
    intro: 'JSON格式化工具是一个功能强大且易于使用的在线工具，专门用于JSON数据的格式化、美化和压缩。本工具完全在浏览器本地运行，无需上传数据到服务器，确保您的隐私和数据安全。',
    features: [
      'JSON格式化（美化）',
      'JSON压缩（最小化）',
      '语法错误检测',
      '语法高亮显示',
      '支持大文件处理',
      '实时格式化',
      '一键复制结果',
      '本地存储输入'
    ],
    useCases: [
      { icon: '📝', title: 'API调试', desc: '格式化API返回的JSON数据，便于阅读和调试' },
      { icon: '🔍', title: '数据验证', desc: '检查JSON语法错误，快速定位问题' },
      { icon: '💾', title: '数据压缩', desc: '压缩JSON数据，减少存储空间和传输带宽' },
      { icon: '📋', title: '代码整理', desc: '美化JSON代码，提升代码可读性' }
    ],
    faqs: [
      { q: '什么是JSON格式化？', a: 'JSON格式化是指将压缩的JSON数据按照一定的缩进和换行规则进行美化，使其更易于阅读和理解。格式化后的JSON数据具有清晰的层级结构，便于开发者查看和调试。' },
      { q: '使用这个JSON格式化工具安全吗？', a: '完全安全。所有的格式化操作都在您的浏览器本地完成，数据不会上传到任何服务器。您可以完全离线使用这个工具，确保您的隐私和数据安全。' },
      { q: '支持多大的JSON文件？', a: '本工具支持处理大文件，建议文件大小不超过50MB以确保最佳性能。对于超大文件，建议先进行压缩处理。' },
      { q: '如何检测JSON语法错误？', a: '工具会自动检测JSON语法错误，如果有错误会显示错误信息和位置，帮助您快速定位和修复问题。' }
    ]
  },
  'json-diff': {
    title: 'JSON比较工具 - 免费在线对比差异 | WebUtils',
    description: '免费在线JSON比较工具，支持两个JSON文件的差异对比。无需上传服务器，100%本地处理，保护隐私。高亮显示差异，支持大文件，一键导出。',
    keywords: 'json比较,json差异,json diff,json对比工具,json在线比较,免费json对比,json差异检测',
    category: '开发工具',
    intro: 'JSON比较工具是一个专业的在线工具，用于对比两个JSON文件的差异。本工具完全在浏览器本地运行，无需上传数据到服务器，确保您的隐私和数据安全。',
    features: [
      'JSON差异对比',
      '高亮显示变化',
      '支持大文件处理',
      '一键导出结果',
      '本地存储输入',
      '实时对比',
      '忽略空格选项',
      '排序对比'
    ],
    useCases: [
      { icon: '🔄', title: '版本对比', desc: '对比JSON配置文件的不同版本，快速发现变更' },
      { icon: '🐛', title: '调试对比', desc: '对比API返回数据，定位数据变化' },
      { icon: '📊', title: '数据迁移', desc: '验证数据迁移前后的JSON数据一致性' },
      { icon: '✅', title: '回归测试', desc: '对比测试前后的JSON输出，确保功能正常' }
    ],
    faqs: [
      { q: '什么是JSON比较？', a: 'JSON比较是指对比两个JSON文件或数据，找出它们之间的差异。本工具会高亮显示新增、删除和修改的内容，帮助您快速了解数据变化。' },
      { q: '如何使用JSON比较工具？', a: '在左右两个输入框中分别粘贴或上传需要对比的JSON数据，工具会自动进行对比并高亮显示差异。' },
      { q: '支持哪些差异显示方式？', a: '支持多种差异显示方式，包括并排对比、统一差异视图等，您可以根据需要选择最适合的显示方式。' }
    ]
  },
  'regex-tester': {
    title: '正则表达式测试工具 - 免费在线测试 | WebUtils',
    description: '免费在线正则表达式测试工具，支持实时测试、语法高亮、匹配结果展示。无需上传服务器，100%本地处理，保护隐私。支持多种正则语法，一键复制。',
    keywords: '正则表达式,regex测试,正则测试器,正则在线测试,regex tester,免费正则工具,正则表达式测试',
    category: '开发工具',
    intro: '正则表达式测试工具是一个功能强大的在线工具，用于测试和调试正则表达式。本工具完全在浏览器本地运行，无需上传数据到服务器，确保您的隐私和数据安全。',
    features: [
      '正则表达式测试',
      '实时匹配结果',
      '语法高亮',
      '匹配组显示',
      '支持多种正则语法',
      '常用正则模板',
      '一键复制结果',
      '错误提示'
    ],
    useCases: [
      { icon: '🔍', title: '正则调试', desc: '测试和调试正则表达式，验证匹配效果' },
      { icon: '📝', title: '数据提取', desc: '从文本中提取符合模式的数据' },
      { icon: '✏️', title: '文本替换', desc: '使用正则表达式批量替换文本内容' },
      { icon: '📚', title: '学习正则', desc: '通过实时测试学习正则表达式语法' }
    ],
    faqs: [
      { q: '什么是正则表达式？', a: '正则表达式（Regular Expression）是一种用于匹配字符串模式的强大工具。它使用特定的语法规则来描述字符串模式，可以用于搜索、替换、验证等操作。' },
      { q: '如何使用正则表达式测试工具？', a: '在正则表达式输入框中输入您的正则模式，在测试文本框中输入需要测试的文本，工具会实时显示匹配结果。' },
      { q: '支持哪些正则语法？', a: '支持JavaScript正则表达式语法，包括字符类、量词、分组、断言等所有常用特性。' }
    ]
  },
  // 默认配置
  'default': {
    title: '在线工具 - 免费使用 | WebUtils',
    description: '免费在线工具，无需上传服务器，100%本地处理，保护隐私。支持多种功能，实时处理，一键复制结果。',
    keywords: '在线工具,免费工具,web工具,在线转换,实用工具',
    category: '工具',
    intro: '这是一个功能强大的在线工具，完全在浏览器本地运行，无需上传数据到服务器，确保您的隐私和数据安全。',
    features: [
      '100%本地处理',
      '实时转换',
      '一键复制结果',
      '完全免费',
      '离线可用',
      '无需注册',
      '保护隐私',
      '响应式设计'
    ],
    useCases: [
      { icon: '🚀', title: '快速处理', desc: '快速完成各种数据处理任务' },
      { icon: '🔒', title: '隐私保护', desc: '所有操作在本地完成，数据不离开设备' },
      { icon: '💻', title: '跨平台', desc: '支持所有现代浏览器和操作系统' },
      { icon: '📱', title: '移动友好', desc: '响应式设计，完美支持移动设备' }
    ],
    faqs: [
      { q: '使用这个工具安全吗？', a: '完全安全。所有操作都在您的浏览器本地完成，数据不会上传到任何服务器。您可以完全离线使用这个工具，确保您的隐私和数据安全。' },
      { q: '需要注册吗？', a: '不需要。本工具完全免费，无需注册，打开即用。' },
      { q: '支持离线使用吗？', a: '支持。所有功能都在浏览器中运行，您可以离线使用。' }
    ]
  }
};

// 从文件名获取工具配置
function getToolConfig(filename) {
  const toolName = path.basename(filename, '.html');
  return toolConfigs[toolName] || toolConfigs['default'];
}

// 生成SEO元标签HTML
function generateMetaTags(config, url) {
  return `
    <!-- SEO Meta Tags -->
    <meta name="description" content="${config.description}" />
    <meta name="keywords" content="${config.keywords}" />
    <meta name="author" content="WebUtils" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${url}" />

    <!-- Open Graph -->
    <meta property="og:title" content="${config.title}" />
    <meta property="og:description" content="${config.description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url}" />
    <meta property="og:site_name" content="WebUtils" />
    <meta property="og:locale" content="zh_CN" />
    <meta property="og:image" content="https://tools.realtime-ai.chat/social-preview.png" />
    <meta property="og:image:width" content="1280" />
    <meta property="og:image:height" content="640" />
    <meta property="og:image:type" content="image/png" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${config.title}" />
    <meta name="twitter:description" content="${config.description}" />
    <meta name="twitter:image" content="https://tools.realtime-ai.chat/social-preview.png" />
  `;
}

// 生成结构化数据JSON-LD
function generateStructuredData(config, url, toolName) {
  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': '首页',
        'item': 'https://tools.realtime-ai.chat/'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': config.category,
        'item': 'https://tools.realtime-ai.chat/#dev'
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': toolName,
        'item': url
      }
    ]
  };

  const softwareApplication = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': toolName,
    'applicationCategory': 'DeveloperApplication',
    'operatingSystem': 'Any',
    'browserRequirements': 'Requires JavaScript. Works in Chrome, Firefox, Safari, Edge.',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'description': config.description,
    'featureList': config.features,
    'screenshot': 'https://tools.realtime-ai.chat/social-preview.png',
    'author': {
      '@type': 'Organization',
      'name': 'WebUtils',
      'url': 'https://tools.realtime-ai.chat/'
    }
  };

  const howTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': `如何使用${toolName}`,
    'description': `详细说明如何使用${toolName}进行相关操作`,
    'step': [
      {
        '@type': 'HowToStep',
        'name': '输入数据',
        'text': '在输入框中输入需要处理的数据'
      },
      {
        '@type': 'HowToStep',
        'name': '选择操作',
        'text': '选择需要执行的操作类型'
      },
      {
        '@type': 'HowToStep',
        'name': '查看结果',
        'text': '查看处理结果，支持实时更新'
      },
      {
        '@type': 'HowToStep',
        'name': '复制或导出',
        'text': '点击复制或导出按钮保存结果'
      }
    ]
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': config.faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.a
      }
    }))
  };

  return `
    <!-- JSON-LD BreadcrumbList Schema -->
    <script type="application/ld+json">
      ${JSON.stringify(breadcrumbList, null, 2)}
    </script>

    <!-- JSON-LD SoftwareApplication Schema -->
    <script type="application/ld+json">
      ${JSON.stringify(softwareApplication, null, 2)}
    </script>

    <!-- JSON-LD HowTo Schema -->
    <script type="application/ld+json">
      ${JSON.stringify(howTo, null, 2)}
    </script>

    <!-- JSON-LD FAQ Schema -->
    <script type="application/ld+json">
      ${JSON.stringify(faqPage, null, 2)}
    </script>
  `;
}

// 生成工具介绍HTML
function generateToolIntro(config) {
  const featuresHtml = config.features.map(f => `<li>✅ <strong>${f}</strong></li>`).join('');
  const useCasesHtml = config.useCases.map(uc => `
    <div class="use-case">
      <h4>${uc.icon} ${uc.title}</h4>
      <p>${uc.desc}</p>
    </div>
  `).join('');

  return `
    <!-- 工具介绍部分 -->
    <section class="tool-intro">
      <h2>工具介绍</h2>
      <p>${config.intro}</p>
      
      <h3>主要特性</h3>
      <ul class="feature-list">
        ${featuresHtml}
      </ul>

      <h3>使用场景</h3>
      <div class="use-cases">
        ${useCasesHtml}
      </div>
    </section>
  `;
}

// 生成工具测评HTML
function generateToolReview(config) {
  return `
    <!-- 工具测评部分 -->
    <section class="tool-review">
      <h2>工具测评</h2>
      
      <div class="review-item">
        <h3>性能表现 ⭐⭐⭐⭐⭐</h3>
        <p>本工具采用纯JavaScript实现，处理速度极快。对于普通数据可以实现毫秒级处理。性能表现优秀，相比其他在线工具，我们的本地处理方式避免了网络传输延迟，提供了更快的响应速度。</p>
      </div>

      <div class="review-item">
        <h3>安全性 ⭐⭐⭐⭐⭐</h3>
        <p>安全性是本工具的最大优势。所有操作都在您的浏览器本地完成，数据不会上传到任何服务器。这意味着即使您处理敏感信息，也不会有泄露风险。相比需要上传数据的服务器端工具，我们的本地处理方式提供了更高的隐私保护级别。</p>
      </div>

      <div class="review-item">
        <h3>易用性 ⭐⭐⭐⭐⭐</h3>
        <p>界面简洁直观，无需学习即可上手。实时处理功能让您无需等待就能看到结果。一键复制功能大大提升了工作效率。工具还支持深色模式，适应不同的使用环境。</p>
      </div>

      <div class="review-item">
        <h3>功能完整性 ⭐⭐⭐⭐⭐</h3>
        <p>功能完善，满足各种使用需求。本地存储功能会在关闭浏览器后保留您的输入，下次打开时自动恢复。响应式设计确保在各种设备上都能获得良好的使用体验。</p>
      </div>

      <div class="review-item">
        <h3>兼容性 ⭐⭐⭐⭐⭐</h3>
        <p>支持所有现代浏览器，包括Chrome、Firefox、Safari、Edge等。无需任何插件或扩展，打开即用。响应式设计确保在桌面、平板和手机上都能获得良好的使用体验。</p>
      </div>

      <div class="review-summary">
        <h3>综合评分：5.0/5.0</h3>
        <p>这是一款性能优秀、安全可靠、功能完善的在线工具。它完美平衡了功能性和易用性，适合开发者、设计师、内容创作者等各类用户使用。无论是日常开发工作还是临时需求，这个工具都能为您提供快速、安全、便捷的服务。</p>
      </div>
    </section>
  `;
}

// 处理单个HTML文件
function processHtmlFile(filePath, category) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const filename = path.basename(filePath);
    const toolName = path.basename(filename, '.html');
    const config = getToolConfig(filename);
    const url = `https://tools.realtime-ai.chat/tools/${category}/${filename}`;

    // 检查是否已经优化过
    if (content.includes('<!-- JSON-LD FAQ Schema -->')) {
      console.log(`跳过已优化的文件: ${filename}`);
      return;
    }

    // 替换或添加SEO元标签
    let newContent = content;

    // 替换title标签
    newContent = newContent.replace(/<title>.*?<\/title>/, `<title>${config.title}</title>`);

    // 替换或添加meta标签
    const metaTagsRegex = /<!-- SEO Meta Tags -->[\s\S]*?<\/meta>/;
    if (metaTagsRegex.test(newContent)) {
      newContent = newContent.replace(metaTagsRegex, generateMetaTags(config, url).trim());
    }

    // 替换或添加结构化数据
    const structuredDataRegex = /<!-- JSON-LD BreadcrumbList Schema -->[\s\S]*?<\/script>/;
    if (structuredDataRegex.test(newContent)) {
      newContent = newContent.replace(structuredDataRegex, generateStructuredData(config, url, toolName).trim());
    }

    // 在工具标题后添加工具介绍和测评
    const toolHeaderRegex = /(<div class="tool-header">[\s\S]*?<\/div>)/;
    if (toolHeaderRegex.test(newContent)) {
      const introAndReview = generateToolIntro(config) + generateToolReview(config);
      newContent = newContent.replace(toolHeaderRegex, `$1\n${introAndReview}`);
    }

    // 写入文件
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`✓ 已优化: ${filename}`);
  } catch (error) {
    console.error(`✗ 处理失败 ${filename}:`, error.message);
  }
}

// 递归处理目录
function processDirectory(dirPath, category) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath, file);
    } else if (file.endsWith('.html')) {
      processHtmlFile(filePath, category);
    }
  });
}

// 主函数
function main() {
  const toolsDir = path.join(__dirname, 'tools');
  
  console.log('开始批量优化工具页面SEO...\n');
  
  const categories = fs.readdirSync(toolsDir);
  categories.forEach(category => {
    const categoryPath = path.join(toolsDir, category);
    if (fs.statSync(categoryPath).isDirectory()) {
      console.log(`\n处理分类: ${category}`);
      processDirectory(categoryPath, category);
    }
  });
  
  console.log('\n✓ 批量优化完成！');
}

// 运行主函数
main();